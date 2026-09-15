/**
 * Browser half of the theme-file transport.
 *
 * The Host owns the files; this module is the only place that knows the wire
 * shape, so the rest of the client keeps working with plain `SavedTheme`
 * records. Every call is same-origin against the Host's own prefix route.
 */

import { THEME_API_PATH_THEMES, THEME_FILE_VERSION } from '../contract.js'
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

/** Every stored theme, in the Host's creation-time order (newest first). */
export async function fetchThemes(
  fallbackFor: (base: string) => CustomTheme,
): Promise<SavedTheme[]> {
  const payload = await callApi(THEME_API_PATH_THEMES)
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

/** Insert or replace the given entries; resolves with what the Host stored. */
export async function pushThemes(
  entries: SavedTheme[],
  fallbackFor: (base: string) => CustomTheme,
): Promise<SavedTheme[]> {
  const payload = await callApi(THEME_API_PATH_THEMES, {
    method: 'POST',
    body: JSON.stringify({ themes: entries.map(savedToDocument) }),
  })
  const documents = Array.isArray(payload.themes) ? payload.themes : []
  const out: SavedTheme[] = []
  for (const doc of documents) {
    if (!isRecord(doc) || typeof doc.id !== 'string' || typeof doc.name !== 'string') continue
    out.push(
      documentToSaved(
        {
          v: THEME_FILE_VERSION,
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

/** Remove one theme's directory. */
export async function removeTheme(id: string): Promise<void> {
  await callApi(`${THEME_API_PATH_THEMES}/${encodeURIComponent(id)}`, { method: 'DELETE' })
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
