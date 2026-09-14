/**
 * Host entry for dsh-cool-theme.
 *
 * Owns the theme files: the browser half cannot touch the filesystem, so every
 * roster change travels over one same-origin prefix route below
 * {@link THEME_API_PREFIX}. The route is the whole host surface — no service is
 * provided, and nothing here interprets the theme payload beyond moving it.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { THEME_API_PATH_THEMES, THEME_API_PREFIX } from '../contract.js'
import type { ThemeDocument } from '../contract.js'
import { deleteTheme, isThemeId, listThemes, putTheme } from './theme-files.js'

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
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = chunk as Buffer
    size += buf.byteLength
    if (size > limit) throw new Error('request body too large')
    chunks.push(buf)
  }
  return Buffer.concat(chunks).toString('utf8')
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
        const rest = pathname.startsWith(`${THEME_API_PATH_THEMES}/`)
          ? pathname.slice(THEME_API_PATH_THEMES.length + 1)
          : null
        if (rest !== null && isThemeId(rest)) {
          if (!methodAllowed(req, res, ['DELETE'])) return
          return await handleDelete(res, rest)
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
