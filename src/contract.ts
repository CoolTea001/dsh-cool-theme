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

// Sidebar transparency preference: '1' keeps DSH's native macOS translucency,
// while '0' — and an absent key, which is the default — paints the sidebar
// column opaque. The value only changes what darwin renders; other platforms
// read it but nothing consumes it.
export const SIDEBAR_TRANSPARENT_STORAGE_KEY = 'cool-theme-sidebar-transparent'

// ---------------------------------------------------------------------------
// Shared guards
// ---------------------------------------------------------------------------

/** A plain JSON object: not null, not an array, and not a primitive. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// ---------------------------------------------------------------------------
// Theme files
// ---------------------------------------------------------------------------

/**
 * Documents are one directory each — `<root>/<id>/theme.json` — so a theme can
 * later carry media beside its seeds without changing this contract.
 *
 * v2 split the background's opacity and blur per appearance. A v1 document's
 * flat numbers still read: they are the light half, with the dark half derived
 * exactly as that build derived it (see {@link normalizeBackground}).
 */
export const THEME_FILE_VERSION = 2

/**
 * A fresh theme id. Both halves mint ids in the same shape, so an id never says
 * which half created it; the Host is the side that validates the pattern.
 */
export function newThemeId(): string {
  return `ct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

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
  /** The wallpaper this custom theme carries; null for a theme without one. */
  background: ThemeBackground | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Theme background
// ---------------------------------------------------------------------------

/** The two appearances a background is tuned for, in the editor's own order. */
export type ThemeAppearance = 'light' | 'dark'

/** One number per appearance, keyed the way the editor's light/dark toggle is. */
export type ThemeAppearancePair = Record<ThemeAppearance, number>

/**
 * The background one saved custom theme may carry.
 *
 * It lives in the theme document rather than in a browser preference, so a
 * theme's wallpaper follows the theme through an export, an import and a Host
 * restart — the same reason the colours live in files. Preset themes never
 * carry one: a preset is a palette, and only a custom theme is the user's own
 * document to extend.
 */
export type ThemeBackground = {
  /** File name inside the theme's own `assets/` directory. */
  asset: string
  /**
   * The image's own opacity, 0–100, per appearance. The theme's surface colour
   * sits *under* the image, so lowering this lets that colour show through —
   * the panel never becomes transparent to reveal the image.
   */
  opacity: ThemeAppearancePair
  /**
   * Softness in px, per appearance; 0 keeps the image sharp, which is the
   * default in both.
   */
  blur: ThemeAppearancePair
  /**
   * Whether the theme actually paints the image. A disabled background keeps
   * every other field — and the stored file — intact, so switching it back on
   * restores exactly what was there: it is a switch, not a removal. An absent
   * flag reads as on, which is what every document written before it existed
   * meant.
   */
  enabled: boolean
}

/**
 * Where a fresh background starts, per appearance: visible enough to read,
 * calm enough for text. Dark starts lower because a bright wallpaper over a
 * dark palette is harsher than the same image over the light one, and the
 * panel colour has to win more of the mix.
 */
export const THEME_BACKGROUND_DEFAULT_OPACITY: ThemeAppearancePair = { light: 40, dark: 30 }

/** A fresh background is sharp in both appearances. */
export const THEME_BACKGROUND_DEFAULT_BLUR: ThemeAppearancePair = { light: 0, dark: 0 }

/**
 * How much a background written before the split dims in dark mode. Only
 * {@link legacyDarkOpacity} reads it: a current background stores its dark
 * opacity outright, so nothing derives it any more.
 */
export const THEME_BACKGROUND_LEGACY_DARK_FACTOR = 0.7

export const THEME_BACKGROUND_MAX_BLUR = 24

/** Fold an opacity into the 0–100 percentage a background stores. */
export function clampBackgroundOpacity(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

/** Fold a blur radius into the 0–{@link THEME_BACKGROUND_MAX_BLUR} px a background stores. */
export function clampBackgroundBlur(value: number): number {
  return Math.max(0, Math.min(THEME_BACKGROUND_MAX_BLUR, Math.round(value)))
}

/**
 * The dark opacity a pre-split background paints: its light value dimmed by
 * {@link THEME_BACKGROUND_LEGACY_DARK_FACTOR}. Migration-only, so an existing
 * wallpaper keeps the exact look it had rather than jumping to a new default.
 */
export function legacyDarkOpacity(lightOpacity: number): number {
  return clampBackgroundOpacity(clampBackgroundOpacity(lightOpacity) * THEME_BACKGROUND_LEGACY_DARK_FACTOR)
}

/**
 * Bytes one uploaded image may occupy. It matches a single archive entry's
 * uncompressed cap on purpose: an image the roster accepts must also survive
 * an export, or sharing a theme would fail only after the fact.
 */
export const THEME_ASSET_MAX_BYTES = 4 * 1024 * 1024

/**
 * Accepted media extensions and the type each is served with. Shared by the
 * upload route, the archive reader/writer and the asset directory scanner, so
 * one table answers "what may a theme carry" everywhere.
 */
export const THEME_ASSET_TYPES: Record<string, { kind: ThemeAssetKind; mime: string }> = {
  '.png': { kind: 'image', mime: 'image/png' },
  '.jpg': { kind: 'image', mime: 'image/jpeg' },
  '.jpeg': { kind: 'image', mime: 'image/jpeg' },
  '.webp': { kind: 'image', mime: 'image/webp' },
  '.gif': { kind: 'image', mime: 'image/gif' },
  '.avif': { kind: 'image', mime: 'image/avif' },
}

/** The type of a file name, or null when a theme may not carry it. */
export function assetTypeOf(name: string): { kind: ThemeAssetKind; mime: string } | null {
  const dot = name.lastIndexOf('.')
  if (dot < 0) return null
  return THEME_ASSET_TYPES[name.slice(dot).toLowerCase()] ?? null
}

/**
 * Asset names become path segments, so they are restricted the way theme ids
 * are: one conservative name, no separators, no leading dot. A content-hashed
 * name (`bg-<hash>.webp`) is what the Host writes, but an imported archive may
 * carry any name that passes this check.
 */
const ASSET_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

export function isThemeAssetName(value: unknown): value is string {
  return typeof value === 'string' && ASSET_NAME_PATTERN.test(value)
}

/**
 * One appearance-tagged background value.
 *
 * A document written before the split stores one flat number for both
 * appearances; it is the light value, and `deriveDark` reproduces the dark
 * value that build painted from it, so an existing wallpaper keeps the exact
 * look it had. The pair form is read as stored: each half falls back to its own
 * default only when it is missing or not a real number (`Number(null)` is 0,
 * which would turn a malformed document into an invisible image).
 */
function readAppearancePair(
  raw: unknown,
  clamp: (value: number) => number,
  fallback: ThemeAppearancePair,
  deriveDark: (light: number) => number,
): ThemeAppearancePair {
  const read = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? clamp(value) : null
  if (typeof raw === 'number') {
    const light = read(raw)
    return light === null ? { ...fallback } : { light, dark: clamp(deriveDark(light)) }
  }
  if (isRecord(raw)) {
    return {
      light: read(raw.light) ?? fallback.light,
      dark: read(raw.dark) ?? fallback.dark,
    }
  }
  return { ...fallback }
}

/** Fold any stored or posted background into this build's shape, or drop it. */
export function normalizeBackground(raw: unknown): ThemeBackground | null {
  if (!isRecord(raw)) return null
  if (!isThemeAssetName(raw.asset)) return null
  if (!assetTypeOf(raw.asset)) return null
  return {
    asset: raw.asset,
    opacity: readAppearancePair(
      raw.opacity,
      clampBackgroundOpacity,
      THEME_BACKGROUND_DEFAULT_OPACITY,
      legacyDarkOpacity,
    ),
    // Blur was shared by both appearances, so a flat value is the dark one too.
    blur: readAppearancePair(raw.blur, clampBackgroundBlur, THEME_BACKGROUND_DEFAULT_BLUR, (light) => light),
    // Only an explicit `false` disables the image: a document written before the
    // flag existed, or one whose value is malformed, keeps its wallpaper on.
    enabled: raw.enabled !== false,
  }
}

/**
 * The background a theme may keep: `raw` normalized, but only while the file it
 * names is actually stored beside the theme. A document that points at a missing
 * image drops the background rather than rendering a broken wallpaper.
 */
export function backgroundForAssets(
  raw: unknown,
  assets: readonly Pick<ThemeAsset, 'name'>[],
): ThemeBackground | null {
  const background = normalizeBackground(raw)
  if (background === null) return null
  return assets.some((asset) => asset.name === background.asset) ? background : null
}

/**
 * The Host's theme-file API, all below one prefix route. Kept here so the two
 * halves cannot drift on a path.
 */
export const THEME_API_PREFIX = '/cool-theme/api'
export const THEME_API_PATH_THEMES = `${THEME_API_PREFIX}/themes`

/** Route segment below a theme id that holds its media. */
export const THEME_API_SEGMENT_ASSETS = 'assets'

/** Upload and list URL of one theme's media directory. */
export function themeAssetsPath(id: string): string {
  return `${THEME_API_PATH_THEMES}/${encodeURIComponent(id)}/${THEME_API_SEGMENT_ASSETS}`
}

/** Read URL of one stored asset. The name is content-hashed, so it is cacheable. */
export function themeAssetUrl(id: string, name: string): string {
  return `${themeAssetsPath(id)}/${encodeURIComponent(name)}`
}

/**
 * Share archive: one theme directory zipped. The document keeps the name it has
 * on disk, so an archive is a copy of the directory rather than a new format,
 * and media added later travels with it under {@link THEME_ARCHIVE_ASSETS_DIR}.
 */
export const THEME_ARCHIVE_DOCUMENT = 'theme.json'
export const THEME_ARCHIVE_ASSETS_DIR = 'assets'

/** Content type of an exported archive, and the extension a name gets. */
export const THEME_ARCHIVE_MIME = 'application/zip'
export const THEME_ARCHIVE_EXTENSION = '.zip'

/**
 * Import bounds. A theme is a small JSON document, so anything past these caps
 * is refused before it is parsed rather than after it has been held in memory.
 */
export const THEME_ARCHIVE_MAX_BYTES = 8 * 1024 * 1024
export const THEME_ARCHIVE_MAX_ENTRIES = 256
/** Cap on one uncompressed entry, so a zip bomb cannot expand without bound. */
export const THEME_ARCHIVE_MAX_ENTRY_BYTES = 4 * 1024 * 1024

/** Route segments below {@link THEME_API_PATH_THEMES}: `/<id>/export`, `/import`. */
export const THEME_API_SEGMENT_EXPORT = 'export'
export const THEME_API_PATH_IMPORT = `${THEME_API_PATH_THEMES}/import`

/**
 * Name the Host suggests for a downloaded archive. The archive keeps the
 * theme's name so a user can tell two exports apart, with the characters a
 * filesystem refuses folded to spaces; the id is the fallback for a name that
 * folds away to nothing.
 */
export function archiveFileName(name: string, id: string): string {
  const folded = name
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64)
  const base = folded === '' ? id : folded
  return base.endsWith(THEME_ARCHIVE_EXTENSION) ? base : `${base}${THEME_ARCHIVE_EXTENSION}`
}

/**
 * `base`, else `${base} 2`, `${base} 3`, … An imported theme keeps the name it
 * was shared under — that name is the point of the share — so a clash is
 * resolved by numbering rather than by renaming the incoming theme. The Host
 * owns this because it owns the roster the names have to be free in.
 */
export function freeThemeName(base: string, taken: readonly string[]): string {
  const name = base.trim() === '' ? 'theme' : base.trim()
  const used = new Set(taken.map((entry) => entry.trim()))
  if (!used.has(name)) return name
  for (let n = 2; ; n += 1) {
    const candidate = `${name} ${n}`
    if (!used.has(candidate)) return candidate
  }
}

