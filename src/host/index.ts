/**
 * Host entry for dsh-cool-theme.
 *
 * Owns the theme files: the browser half cannot touch the filesystem, so every
 * roster change travels over one same-origin prefix route below
 * {@link THEME_API_PREFIX}. The route is the whole host surface — no service is
 * provided, and nothing here interprets the theme payload beyond moving it.
 *
 * Media has two routes of its own below a theme id: one accepts the bytes of a
 * background image or video, one serves a stored file back. Everything else
 * about a theme — its document, its colours, its background reference — travels
 * through the roster route.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  THEME_API_PATH_IMPORT,
  THEME_API_PATH_THEMES,
  THEME_API_PREFIX,
  THEME_API_SEGMENT_ASSETS,
  THEME_API_SEGMENT_CSS,
  THEME_API_SEGMENT_EXPORT,
  THEME_API_SEGMENT_OPEN,
  THEME_ARCHIVE_MAX_BYTES,
  THEME_ARCHIVE_MIME,
  THEME_ASSET_MAX_BYTES,
  THEME_CSS_MAX_BYTES,
  archiveFileName,
  errorMessage,
  freeThemeName,
  isRecord,
  isThemeAssetName,
  newThemeId,
} from '../contract.js'
import type { ThemeDocument } from '../contract.js'
import { isKnownBase } from '../presets-ids.js'
import { AssetError, readAsset, saveMediaAsset, writeAssetFile } from './assets.js'
import {
  CssTooLargeError,
  cssPath,
  deleteTheme,
  deleteThemeCss,
  isThemeId,
  listThemes,
  putTheme,
  readThemeCss,
  setThemeCssEnabled,
  themeCssExists,
  themeExists,
  writeThemeCss,
} from './theme-files.js'
import { ArchiveError, packTheme, unpackTheme } from './theme-share.js'
import { OpenNativeError, openNativeTextFile } from './open-native.js'

export const name = 'dsh-cool-theme'

export const inject = ['webServer']

/** Cap on one JSON request body; a theme document is small by construction. */
const THEME_DOCUMENT_MAX_BYTES = 1_000_000

/** Refuse cross-site callers: this API reads and writes the user's own files. */
function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin
  if (typeof origin !== 'string' || origin === '' || origin === 'null') return true
  const host = req.headers.host
  if (typeof host !== 'string' || host === '') return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

/** Answer 405 unless the request uses one of the allowed methods. */
function methodAllowed(req: IncomingMessage, res: ServerResponse, allowed: readonly string[]): boolean {
  const method = req.method ?? 'GET'
  if (allowed.includes(method)) return true
  res.writeHead(405, { allow: allowed.join(', ') })
  res.end()
  return false
}

/** Read a bounded request body; a theme document is small by construction. */
async function readBody(req: IncomingMessage, limit = THEME_DOCUMENT_MAX_BYTES): Promise<string> {
  return (await readBuffer(req, limit)).toString('utf8')
}

/** Read a bounded binary body; the archive and media routes need the bytes themselves. */
async function readBuffer(req: IncomingMessage, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = chunk as Buffer
    size += buf.byteLength
    if (size > limit) throw new Error('request body too large')
    chunks.push(buf)
  }
  return Buffer.concat(chunks)
}

/** The roster, oldest first, as the browser half reads it. */
async function handleList(res: ServerResponse): Promise<void> {
  sendJson(res, 200, { ok: true, themes: await listThemes() })
}

/**
 * Upsert the posted documents. The browser half sends exactly the entries it
 * changed, so one round trip covers save, rename and background change. Media
 * bytes have their own route; this one only records which asset a theme uses.
 */
async function handlePut(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let payload: unknown
  try {
    payload = JSON.parse(await readBody(req)) as unknown
  } catch {
    sendJson(res, 400, { ok: false, error: 'invalid JSON body' })
    return
  }
  const incoming = isRecord(payload) && Array.isArray(payload.themes) ? payload.themes : null
  if (incoming === null) {
    sendJson(res, 400, { ok: false, error: 'expected { themes: [...] }' })
    return
  }
  const saved: ThemeDocument[] = []
  for (const raw of incoming) {
    if (!isRecord(raw) || !isThemeId(raw.id)) {
      sendJson(res, 400, { ok: false, error: 'theme id must be a safe slug' })
      return
    }
    if (typeof raw.name !== 'string' || raw.name.trim() === '') {
      sendJson(res, 400, { ok: false, error: 'theme name must be a non-empty string' })
      return
    }
    if (typeof raw.base !== 'string') {
      sendJson(res, 400, { ok: false, error: 'theme base must be a string' })
      return
    }
    saved.push(
      await putTheme({
        id: raw.id,
        name: raw.name,
        base: raw.base,
        theme: raw.theme,
        background: raw.background,
        // Used only for a new theme; `putTheme` preserves an existing theme's
        // flag, so a roster save cannot undo the CSS switch.
        cssEnabled: typeof raw.cssEnabled === 'boolean' ? raw.cssEnabled : undefined,
      }),
    )
  }
  sendJson(res, 200, { ok: true, themes: saved })
}

/** Delete one theme directory. */
async function handleDelete(res: ServerResponse, id: string): Promise<void> {
  await deleteTheme(id)
  sendJson(res, 200, { ok: true })
}

/**
 * Download one theme as an archive. The body is binary, so it is the only route
 * here that does not answer JSON — and the only one that sets a filename.
 */
async function handleExport(res: ServerResponse, id: string): Promise<void> {
  if (!(await themeExists(id))) {
    sendJson(res, 404, { ok: false, error: 'unknown theme' })
    return
  }
  const packed = await packTheme(id)
  const name = archiveFileName(packed.fileName, id)
  res.writeHead(200, {
    'content-type': THEME_ARCHIVE_MIME,
    'content-length': packed.bytes.byteLength,
    'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    'cache-control': 'no-store',
  })
  res.end(packed.bytes)
}

/**
 * Accept one background image or video. The body is the media itself rather
 * than JSON: base64 in a JSON string would inflate the file by a third and
 * force the whole thing through a parser for no gain. The type comes from the
 * bytes, never from the request.
 */
async function handleAssetUpload(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
  if (!(await themeExists(id))) {
    sendJson(res, 404, { ok: false, error: 'unknown theme' })
    return
  }
  let bytes: Buffer
  try {
    bytes = await readBuffer(req, THEME_ASSET_MAX_BYTES)
  } catch (error) {
    sendJson(res, 413, { ok: false, error: errorMessage(error) })
    return
  }
  try {
    sendJson(res, 200, { ok: true, asset: await saveMediaAsset(id, bytes) })
  } catch (error) {
    if (!(error instanceof AssetError)) throw error
    sendJson(res, 400, { ok: false, error: error.message })
  }
}

/**
 * One satisfiable byte range from a `Range` header. The caller distinguishes
 * "no header" from "unusable range" before calling, so null here means the
 * request cannot be answered as a partial response.
 */
function rangeOf(header: string, size: number): { start: number; end: number } | null {
  if (size === 0) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match) return null
  const startRaw = match[1] ?? ''
  const endRaw = match[2] ?? ''
  if (startRaw === '' && endRaw === '') return null
  let start: number
  let end: number
  if (startRaw === '') {
    const suffix = Number(endRaw)
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null
    start = Math.max(0, size - suffix)
    end = size - 1
  } else {
    start = Number(startRaw)
    end = endRaw === '' ? size - 1 : Math.min(Number(endRaw), size - 1)
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
      return null
    }
  }
  return { start, end }
}

/**
 * Serve one stored asset. Names are content-hashed, so the response is
 * immutable: the same URL always means the same bytes.
 *
 * Range requests are supported because a video is the one asset the browser may
 * seek in; a plain 200 makes Chromium buffer the whole clip before it can loop
 * cleanly. The handler still reads the file whole — an asset is bounded by
 * {@link THEME_ASSET_MAX_BYTES} — and answers the requested slice.
 *
 * The CSP header makes the file inert if a browser ever navigates to it
 * directly, and `nosniff` keeps a mislabelled file from being reinterpreted.
 */
async function handleAssetRead(
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
  name: string,
): Promise<void> {
  if (!isThemeAssetName(name)) {
    sendJson(res, 400, { ok: false, error: 'asset name must be a safe file name' })
    return
  }
  const asset = await readAsset(id, name)
  if (asset === null) {
    sendJson(res, 404, { ok: false, error: 'unknown asset' })
    return
  }
  const total = asset.bytes.byteLength
  const headers = {
    'content-type': asset.mime,
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
    'content-security-policy': "default-src 'none'",
  }
  const rangeHeader = req.headers.range
  if (rangeHeader !== undefined) {
    const range = rangeOf(rangeHeader, total)
    if (range === null) {
      res.writeHead(416, { ...headers, 'content-range': `bytes */${String(total)}` })
      res.end()
      return
    }
    const slice = asset.bytes.subarray(range.start, range.end + 1)
    res.writeHead(206, {
      ...headers,
      'content-range': `bytes ${String(range.start)}-${String(range.end)}/${String(total)}`,
      'content-length': String(slice.byteLength),
    })
    res.end(req.method === 'HEAD' ? undefined : slice)
    return
  }
  res.writeHead(200, { ...headers, 'content-length': String(total) })
  res.end(req.method === 'HEAD' ? undefined : asset.bytes)
}

/**
 * Whether the request reached the Host from the same machine. The native open
 * action is a local convenience; a page served to another machine must never be
 * able to launch an application on the Host, so the route refuses those.
 */
function isLoopback(req: IncomingMessage): boolean {
  const address = req.socket.remoteAddress
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

/** A request's media type without parameters, lowercased. */
function requestMediaType(req: IncomingMessage): string {
  const header = req.headers['content-type']
  return typeof header === 'string' ? (header.split(';')[0] ?? '').trim().toLowerCase() : ''
}

/**
 * One theme's stylesheet. GET returns the text and metadata, including whether
 * this request is local enough for the native-open action. PUT either replaces
 * the text (text/css) or flips the trust flag (application/json); the two are
 * separate writes so the switch never has to pass through the card's draft.
 */
async function handleCss(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
  if (!(await themeExists(id))) {
    sendJson(res, 404, { ok: false, error: 'unknown theme' })
    return
  }
  if (req.method === 'GET') {
    const info = await readThemeCss(id)
    sendJson(res, 200, { ok: true, ...info, canOpen: isLoopback(req) })
    return
  }
  if (req.method === 'DELETE') {
    await deleteThemeCss(id)
    sendJson(res, 200, { ok: true })
    return
  }
  const type = requestMediaType(req)
  if (type === 'application/json') {
    let payload: unknown
    try {
      payload = JSON.parse(await readBody(req, 4096)) as unknown
    } catch {
      sendJson(res, 400, { ok: false, error: 'invalid JSON body' })
      return
    }
    if (!isRecord(payload) || typeof payload.enabled !== 'boolean') {
      sendJson(res, 400, { ok: false, error: 'expected { enabled: boolean }' })
      return
    }
    await setThemeCssEnabled(id, payload.enabled)
    sendJson(res, 200, { ok: true, enabled: payload.enabled })
    return
  }
  if (type !== '' && type !== 'text/css' && type !== 'text/plain') {
    sendJson(res, 415, { ok: false, error: 'expected text/css or application/json' })
    return
  }
  let css: string
  try {
    css = await readBody(req, THEME_CSS_MAX_BYTES)
  } catch (error) {
    sendJson(res, 413, { ok: false, error: errorMessage(error) })
    return
  }
  try {
    const bytes = await writeThemeCss(id, css)
    sendJson(res, 200, { ok: true, bytes })
  } catch (error) {
    if (!(error instanceof CssTooLargeError)) throw error
    sendJson(res, 413, { ok: false, error: error.message })
  }
}

/**
 * Open one theme's stylesheet in the native text editor. The client sends only
 * the theme id; the Host resolves the fixed `theme.css` name, so this can never
 * be turned into a general "open any path" endpoint.
 */
async function handleCssOpen(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
  if (!isLoopback(req)) {
    sendJson(res, 403, { ok: false, error: 'native open is only available on the local machine' })
    return
  }
  if (!(await themeExists(id))) {
    sendJson(res, 404, { ok: false, error: 'unknown theme' })
    return
  }
  if (!(await themeCssExists(id))) {
    sendJson(res, 409, { ok: false, error: 'no custom CSS file' })
    return
  }
  try {
    await openNativeTextFile(cssPath(id))
  } catch (error) {
    if (!(error instanceof OpenNativeError)) throw error
    sendJson(res, 500, { ok: false, error: error.message })
    return
  }
  sendJson(res, 200, { ok: true })
}

/**
 * Read an uploaded archive back into a theme and store it.
 *
 * The Host owns the whole import: it validates the archive, writes its media,
 * names the theme and writes the document, so an import cannot half-happen in
 * the client. The client only learns what was stored, which keeps the roster's
 * own writes from having to grow a second path just for imports.
 */
async function handleImport(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let archive: Buffer
  try {
    archive = await readBuffer(req, THEME_ARCHIVE_MAX_BYTES)
  } catch (error) {
    sendJson(res, 413, { ok: false, error: errorMessage(error) })
    return
  }
  // A malformed or foreign archive is the user's file, not a server fault, so
  // its reason travels back verbatim for the toast to show.
  let unpacked: ReturnType<typeof unpackTheme>
  try {
    unpacked = unpackTheme(archive)
  } catch (error) {
    if (!(error instanceof ArchiveError)) throw error
    sendJson(res, 400, { ok: false, error: error.message })
    return
  }

  const existing = await listThemes()
  // A shared theme is meant to arrive, not to replace what is already here, so
  // it gets its own id and a free name; the archive's own id is only a hint
  // about where it came from.
  const id = newThemeId()
  const taken = existing.map((doc) => doc.name)
  // Media lands before the document: `putTheme` prunes assets the document does
  // not reference, so the background media has to exist when it is recorded.
  for (const asset of unpacked.assets) {
    await writeAssetFile(id, asset.name, asset.bytes)
  }
  // The stylesheet is not an asset and is never pruned; writing it before the
  // document means a failed document write leaves no theme that promises CSS it
  // does not have.
  if (unpacked.css !== null) {
    await writeThemeCss(id, unpacked.css)
  }
  const stored = await putTheme({
    id,
    name: freeThemeName(unpacked.document.name, taken),
    base: isKnownBase(unpacked.document.base) ? unpacked.document.base : 'dsh',
    theme: unpacked.document.theme,
    background: unpacked.document.background,
    // A shared stylesheet is stored, not trusted: the user reviews the file and
    // enables it with the panel's switch.
    cssEnabled: false,
  })
  sendJson(res, 200, { ok: true, theme: stored })
}

/** Decode one path segment, treating a malformed escape as no match. */
function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

export function apply(ctx: any): void {
  const route = (handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>) =>
    ctx.webServer.register({
      kind: 'prefix',
      path: THEME_API_PREFIX,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (!sameOrigin(req)) {
          sendJson(res, 403, { ok: false, error: 'cross-origin request refused' })
          return
        }
        return handler(req, res)
      },
    })

  ctx.effect(() => {
    const dispose = route(async (req: IncomingMessage, res: ServerResponse) => {
      const pathname = new URL(req.url ?? '/', 'http://dsh.invalid').pathname
      try {
        if (pathname === THEME_API_PATH_THEMES) {
          if (!methodAllowed(req, res, ['GET', 'POST'])) return
          if (req.method === 'GET') return await handleList(res)
          return await handlePut(req, res)
        }
        // Uploads are keyed by route, not by theme id: the archive names the
        // theme it carries, and the client decides what to store it as.
        if (pathname === THEME_API_PATH_IMPORT) {
          if (!methodAllowed(req, res, ['POST'])) return
          return await handleImport(req, res)
        }

        const rest = pathname.startsWith(`${THEME_API_PATH_THEMES}/`)
          ? pathname.slice(THEME_API_PATH_THEMES.length + 1)
          : null
        const parts = rest === null ? [] : rest.split('/')
        const id = parts.length > 0 ? decodeSegment(parts[0]) : null
        if (id !== null && isThemeId(id)) {
          if (parts.length === 1) {
            if (!methodAllowed(req, res, ['DELETE'])) return
            return await handleDelete(res, id)
          }
          if (parts.length === 2 && parts[1] === THEME_API_SEGMENT_EXPORT) {
            if (!methodAllowed(req, res, ['GET'])) return
            return await handleExport(res, id)
          }
          if (parts.length === 2 && parts[1] === THEME_API_SEGMENT_CSS) {
            if (!methodAllowed(req, res, ['GET', 'PUT', 'DELETE'])) return
            return await handleCss(req, res, id)
          }
          if (parts.length === 3 && parts[1] === THEME_API_SEGMENT_CSS && parts[2] === THEME_API_SEGMENT_OPEN) {
            if (!methodAllowed(req, res, ['POST'])) return
            return await handleCssOpen(req, res, id)
          }
          if (parts.length === 2 && parts[1] === THEME_API_SEGMENT_ASSETS) {
            if (!methodAllowed(req, res, ['POST'])) return
            return await handleAssetUpload(req, res, id)
          }
          if (parts.length === 3 && parts[1] === THEME_API_SEGMENT_ASSETS) {
            if (!methodAllowed(req, res, ['GET', 'HEAD'])) return
            const name = decodeSegment(parts[2])
            if (name === null) {
              sendJson(res, 400, { ok: false, error: 'asset name must be a safe file name' })
              return
            }
            return await handleAssetRead(req, res, id, name)
          }
        }
        sendJson(res, 404, { ok: false, error: 'unknown route' })
      } catch (error) {
        sendJson(res, 500, { ok: false, error: errorMessage(error) })
      }
    })
    return () => { dispose() }
  }, 'dsh-cool-theme: theme-file routes')
}
