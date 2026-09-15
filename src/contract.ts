/**
 * Shared contract for dsh-cool-theme.
 */

// Current key; legacy key kept for one-time migration from dsh-cooltea.
// Holds either a preset id or the reserved custom-theme id.
export const THEME_STORAGE_KEY = 'cool-theme-preset'
export const THEME_STORAGE_KEY_LEGACY = 'cooltea-theme-preset'

// Reserved value of THEME_STORAGE_KEY selecting the user-defined theme.
export const CUSTOM_PRESET_ID = 'custom'

// JSON blob holding the custom theme seeds and the preset they derive from.
// This is the working draft the editor always edits; it stays live even before
// the draft is saved as a named entry.
export const CUSTOM_THEME_STORAGE_KEY = 'cool-theme-custom'

// JSON array of named, saved custom themes (the list below the editor).
export const CUSTOM_LIST_STORAGE_KEY = 'cool-theme-custom-list'

// Id of the saved entry the draft currently belongs to; absent when the draft
// has never been saved.
export const CUSTOM_ACTIVE_STORAGE_KEY = 'cool-theme-custom-active'

// Set once the legacy localStorage list has been reconciled with the files the
// Host owns, so a stale browser copy is never migrated twice.
export const CUSTOM_MIGRATED_STORAGE_KEY = 'cool-theme-custom-migrated'

// ---------------------------------------------------------------------------
// Theme files
// ---------------------------------------------------------------------------

/**
 * Documents are one directory each — `<root>/<id>/theme.json` — so a theme can
 * later carry media beside its seeds without changing this contract.
 */
export const THEME_FILE_VERSION = 1

/** Media kind carried with a theme; the seed payload itself is `theme`. */
export type ThemeAssetKind = 'image' | 'video'

/** One media file stored under the theme's `assets/` directory. */
export type ThemeAsset = {
  /** File name inside `assets/`; unique within the theme. */
  name: string
  kind: ThemeAssetKind
  /** Content type the Host serves it back with. */
  mime: string
  bytes: number
}

/**
 * One theme as it is stored and exchanged. `theme` stays opaque here: the
 * Client owns the seed shape and repairs it against a preset on read, while the
 * Host only ever moves the document in and out of a file.
 */
export type ThemeDocument = {
  v: number
  id: string
  name: string
  /** Id of the preset the seeds derive from. */
  base: string
  theme: unknown
  assets: ThemeAsset[]
  createdAt: string
  updatedAt: string
}

/**
 * The Host's theme-file API, all below one prefix route. Kept here so the two
 * halves cannot drift on a path.
 */
export const THEME_API_PREFIX = '/cool-theme/api'
export const THEME_API_PATH_THEMES = `${THEME_API_PREFIX}/themes`

