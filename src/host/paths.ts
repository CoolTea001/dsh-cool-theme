/**
 * Where a theme lives on disk.
 *
 * Split out of `theme-files.ts` so the asset store can resolve a theme's
 * `assets/` directory without importing the document store — the document store
 * imports the asset store, and a cycle between the two would make every bundle
 * order-sensitive for no gain.
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * Theme ids become directory names, so they are restricted to a conservative
 * slug: anything else could escape or alias the themes root.
 */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isThemeId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value)
}

/**
 * The harness home, resolved the way the rest of DSH resolves it: an explicit
 * `DSH_HOME`, else `~/.dsh`.
 */
export function harnessHome(): string {
  const configured = process.env.DSH_HOME?.trim()
  return configured && configured !== '' ? configured : join(homedir(), '.dsh')
}

/** Root of every stored theme. */
export function themesRoot(): string {
  return join(harnessHome(), 'cool-theme', 'themes')
}

/** One theme's own directory. Callers must have validated `id`. */
export function themeDir(id: string): string {
  return join(themesRoot(), id)
}

/** Directory name of the theme document inside one theme's own directory. */
export const DOCUMENT_NAME = 'theme.json'

/** Media directory beside the document. */
export const ASSETS_DIR = 'assets'

/** Absolute path of a theme's media directory. */
export function assetsDir(id: string): string {
  return join(themeDir(id), ASSETS_DIR)
}

/**
 * A fresh theme id. The same shape the client mints (`ct_` + time + noise), so
 * an id never says which half created it, and `isThemeId` is the only rule both
 * halves apply.
 */
export function newThemeId(): string {
  return `ct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}
