/**
 * Host entry for dsh-cool-theme.
 *
 * Owns the theme files: the browser half cannot touch the filesystem, so every
 * roster change travels over one same-origin prefix route below
 * {@link THEME_API_PREFIX}. The route is the whole host surface — no service is
 * provided, and nothing here interprets the theme payload beyond moving it.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  THEME_API_PATH_IMPORT,
  THEME_API_PATH_THEMES,
  THEME_API_PREFIX,
  THEME_API_SEGMENT_EXPORT,
  THEME_ARCHIVE_MAX_BYTES,
  THEME_ARCHIVE_MIME,
  archiveFileName,
  freeThemeName,
} from '../contract.js'
import type { ThemeDocument } from '../contract.js'
import { isKnownBase } from '../presets-ids.js'
import { deleteTheme, isThemeId, listThemes, newThemeId, putTheme } from './theme-files.js'
import { ArchiveError, packTheme, unpackTheme } from './theme-share.js'

export const name = 'dsh-cool-theme'

export const inject = ['webServer']

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
function methodAllowed(req: IncomingMessage, res: ServerResponse, allowed: string[]): boolean {
  const method = req.method ?? 'GET'
  if (allowed.includes(method)) return true
  res.writeHead(405, { allow: allowed.join(', ') })
  res.end()
  return false
}

/** Read a bounded request body; a theme document is small by construction. */
async function readBody(req: IncomingMessage, limit = 1_000_000): Promise<string> {
  return (await readBuffer(req, limit)).toString('utf8')
}

/** Read a bounded binary body; the archive route needs the bytes themselves. */
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The roster, newest first, as the browser half reads it. */
async function handleList(res: ServerResponse): Promise<void> {
  sendJson(res, 200, { ok: true, themes: await listThemes() })
}

/**
 * Upsert the posted documents. The browser half sends exactly the entries it
 * changed, so one round trip covers save, rename and duplicate.
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
        assets: Array.isArray(raw.assets) ? (raw.assets as ThemeDocument['assets']) : [],
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
 * Read an uploaded archive back into a theme and store it.
 *
 * The Host owns the whole import: it validates the archive, names the theme and
 * writes it, so an import is one file write that cannot half-happen. The client
 * only learns what was stored, which keeps the roster's own writes — which
 * rebuild a document from the current draft — from having to grow a second path
 * just for imports.
 */
async function handleImport(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let archive: Buffer
  try {
    archive = await readBuffer(req, THEME_ARCHIVE_MAX_BYTES)
  } catch (error) {
    sendJson(res, 413, { ok: false, error: error instanceof Error ? error.message : String(error) })
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
  const taken = existing.map((doc) => doc.name)
  const stored = await putTheme({
    id: newThemeId(),
    name: freeThemeName(unpacked.document.name, taken),
    base: isKnownBase(unpacked.document.base) ? unpacked.document.base : 'dsh',
    theme: unpacked.document.theme,
    assets: [],
  })
  sendJson(res, 200, { ok: true, theme: stored })
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
        const segment = rest?.indexOf('/') ?? -1
        // `themes/import` has no slash of its own, so it would otherwise read as
        // a theme whose id happens to be "import".
        if (rest !== null && rest !== 'import' && isThemeId(rest)) {
          if (!methodAllowed(req, res, ['DELETE'])) return
          return await handleDelete(res, rest)
        }
        if (rest !== null && segment > 0 && rest.slice(segment + 1) === THEME_API_SEGMENT_EXPORT) {
          const id = rest.slice(0, segment)
          if (!isThemeId(id)) {
            sendJson(res, 400, { ok: false, error: 'theme id must be a safe slug' })
            return
          }
          if (!methodAllowed(req, res, ['GET'])) return
          return await handleExport(res, id)
        }
        sendJson(res, 404, { ok: false, error: 'unknown route' })
      } catch (error) {
        sendJson(res, 500, {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    })
    return () => { dispose() }
  }, 'dsh-cool-theme: theme-file routes')
}
