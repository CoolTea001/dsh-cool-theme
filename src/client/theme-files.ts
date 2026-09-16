/**
 * Browser half of the theme-file transport.
 *
 * The Host owns the files; this module is the only place that knows the wire
 * shape, so the rest of the client keeps working with plain `SavedTheme`
 * records. Every call is same-origin against the Host's own prefix route.
 */

import {
  THEME_API_PATH_IMPORT,
  THEME_API_PATH_THEMES,
  THEME_API_SEGMENT_EXPORT,
  THEME_ARCHIVE_EXTENSION,
  THEME_ARCHIVE_MAX_BYTES,
  THEME_FILE_VERSION,
} from '../contract.js'
import type { ThemeAsset, ThemeDocument } from '../contract.js'
import { normalizeCustom, type CustomTheme, type SavedTheme } from './custom.js'

/** Repair one stored document against the preset its seeds derive from. */
export function documentToSaved(
  doc: ThemeDocument,
  fallbackFor: (base: string) => CustomTheme,
): SavedTheme {
  return {
    id: doc.id,
    name: doc.name,
    base: doc.base,
    theme: normalizeCustom(doc.theme, fallbackFor(doc.base)),
    assets: Array.isArray(doc.assets) ? doc.assets : [],
  }
}

/** The document payload for one entry; timestamps stay the Host's business. */
export function savedToDocument(entry: SavedTheme): Record<string, unknown> {
  return {
    v: THEME_FILE_VERSION,
    id: entry.id,
    name: entry.name,
    base: entry.base,
    theme: entry.theme,
    assets: entry.assets satisfies ThemeAsset[],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The Host answered as something other than this API — its route half is not
 * mounted (the usual cause is a DSH process started before this plugin's host
 * half existed). Distinguished from a write failure because only this one tells
 * the user to restart, and the browser copy is still intact meanwhile.
 */
export class ThemeApiUnavailableError extends Error {}

/** One JSON round trip; a non-OK status becomes an Error carrying the reason. */
async function callApi(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    // A body that is not JSON at all means the static fallback took the request.
    throw new ThemeApiUnavailableError(`${String(response.status)} ${response.statusText}`)
  }
  if (!response.ok) {
    // The fallback answers unmatched paths, so these two statuses also mean the
    // route is not mounted rather than that the request was wrong.
    if (response.status === 404 || response.status === 405) {
      throw new ThemeApiUnavailableError(`${String(response.status)} ${response.statusText}`)
    }
    const reason = isRecord(payload) && typeof payload.error === 'string' ? payload.error : response.statusText
    throw new Error(reason)
  }
  return isRecord(payload) ? payload : {}
}

/**
 * The documents in one roster response, repaired into `SavedTheme` records.
 * Every call on this route answers with the same `{ themes: [...] }` body, so
 * both reads share this one parser: an entry missing an id or a name is skipped
 * rather than failing the whole roster.
 */
function payloadThemes(
  payload: Record<string, unknown>,
  fallbackFor: (base: string) => CustomTheme,
): SavedTheme[] {
  const documents = Array.isArray(payload.themes) ? payload.themes : []
  const out: SavedTheme[] = []
  for (const doc of documents) {
    if (!isRecord(doc) || typeof doc.id !== 'string' || typeof doc.name !== 'string') continue
    out.push(
      documentToSaved(
        {
          v: typeof doc.v === 'number' ? doc.v : THEME_FILE_VERSION,
          id: doc.id,
          name: doc.name,
          base: typeof doc.base === 'string' ? doc.base : '',
          theme: doc.theme,
          assets: Array.isArray(doc.assets) ? (doc.assets as ThemeAsset[]) : [],
          createdAt: '',
          updatedAt: '',
        },
        fallbackFor,
      ),
    )
  }
  return out
}

/** Every stored theme, in the Host's creation-time order (oldest first). */
export async function fetchThemes(
  fallbackFor: (base: string) => CustomTheme,
): Promise<SavedTheme[]> {
  return payloadThemes(await callApi(THEME_API_PATH_THEMES), fallbackFor)
}

/** Insert or replace the given entries; resolves with what the Host stored. */
export async function pushThemes(
  entries: SavedTheme[],
  fallbackFor: (base: string) => CustomTheme,
): Promise<SavedTheme[]> {
  const payload = await callApi(THEME_API_PATH_THEMES, {
    method: 'POST',
    body: JSON.stringify({ themes: entries.map(savedToDocument) }),
  })
  return payloadThemes(payload, fallbackFor)
}

/** Remove one theme's directory. */
export async function removeTheme(id: string): Promise<void> {
  await callApi(`${THEME_API_PATH_THEMES}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** One theme the Host stored on the client's behalf, as a stored document. */
function storedTheme(payload: Record<string, unknown>): { id: string; name: string } {
  const doc = isRecord(payload.theme) ? payload.theme : {}
  if (typeof doc.id !== 'string' || typeof doc.name !== 'string') {
    throw new Error('the Host did not report a stored theme')
  }
  return { id: doc.id, name: doc.name }
}

/**
 * Download one theme as an archive. The response is the archive itself rather
 * than JSON, so this is the one call that does not go through {@link callApi}.
 */
export async function exportTheme(id: string, name: string): Promise<void> {
  const response = await fetch(
    `${THEME_API_PATH_THEMES}/${encodeURIComponent(id)}/${THEME_API_SEGMENT_EXPORT}`,
  )
  if (response.status === 404 || response.status === 405) {
    throw new ThemeApiUnavailableError(`${String(response.status)} ${response.statusText}`)
  }
  if (!response.ok) throw new Error(`${String(response.status)} ${response.statusText}`)
  const blob = await response.blob()
  saveBlob(blob, suggestedName(response.headers.get('content-disposition'), name))
}

/**
 * The archive's own filename when the Host sent one, else the theme's name. The
 * Host is the authority because only it knows the theme id behind a bad name.
 */
function suggestedName(disposition: string | null, fallback: string): string {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (encoded !== undefined) {
    try {
      return decodeURIComponent(encoded)
    } catch {
      // A malformed escape is not worth failing a download over.
    }
  }
  const plain = disposition?.match(/filename="?([^";]+)"?/i)?.[1]
  if (plain !== undefined && plain !== '') return plain
  const name = fallback.trim() === '' ? 'theme' : fallback.trim()
  return name.endsWith(THEME_ARCHIVE_EXTENSION) ? name : `${name}${THEME_ARCHIVE_EXTENSION}`
}

/** Hand one blob to the browser's own download machinery. */
function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.rel = 'noopener'
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    // Revoked on the next task: an immediate revoke can cancel a download the
    // browser has not started reading yet.
    setTimeout(() => { URL.revokeObjectURL(url) }, 0)
  }
}

/**
 * Upload one archive. The Host validates it, names the theme and stores it, so
 * a success means the roster already has the theme — the answer carries what to
 * report, not what the client still has to write.
 */
export async function importTheme(file: File): Promise<{ id: string; name: string }> {
  if (file.size > THEME_ARCHIVE_MAX_BYTES) {
    throw new Error(`archive is larger than ${String(Math.round(THEME_ARCHIVE_MAX_BYTES / (1024 * 1024)))} MB`)
  }
  return storedTheme(
    await callApi(THEME_API_PATH_IMPORT, {
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: file,
    }),
  )
}

/**
 * The themes a browser saved before files became the store, minus those the
 * Host already has.
 *
 * Ids are the join key: a theme another browser already migrated must not be
 * written twice, while one this roster lacks would otherwise disappear from the
 * UI. Callers adopt the result, then stop reading the browser copy.
 */
export function legacyThemesToAdopt(
  legacy: SavedTheme[],
  hostThemes: SavedTheme[],
): SavedTheme[] {
  const known = new Set(hostThemes.map((entry) => entry.id))
  return legacy.filter((entry) => !known.has(entry.id))
}
