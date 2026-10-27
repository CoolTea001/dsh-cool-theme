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
// Shared helpers
// ---------------------------------------------------------------------------

/** A plain JSON object: not null, not an array, and not a primitive. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The reason behind a thrown value, for a response body or a toast. A thrown
 * string is not an Error, so the message it carries would otherwise be lost.
 */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// ---------------------------------------------------------------------------
// Theme files
// ---------------------------------------------------------------------------

/**
 * Documents are one directory each — `<root>/<id>/theme.json` — so a theme can
 * later carry media beside its seeds without changing this contract.
 *
 * v2 split the background's opacity and blur per appearance; v3 split the
 * background itself, so each appearance owns its image, switch, opacity and
 * blur; v4 lets either side name a video as well as an image. Older documents
 * still read: one shared asset becomes both sides' media, and a v1 flat number
 * becomes the light value with the dark one derived exactly as that build
 * derived it (see {@link normalizeBackground}). The version is bumped for v4
 * even though the document shape did not change, because a build that predates
 * video would otherwise import a theme and silently drop its wallpaper.
 */
export const THEME_FILE_VERSION = 4

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

/** The two appearances, in the order the editor reads them. */
export const THEME_APPEARANCES = ['light', 'dark'] as const

/**
 * One appearance's wallpaper: its own media, its own switch, its own opacity
 * and blur. The two sides of a background are fully independent, which is why
 * a background is a pair of these rather than one file with a pair of numbers:
 * a bright image chosen for the light appearance is exactly what does not work
 * over a dark palette, so the dark appearance has to be able to carry a
 * different file — or none at all.
 */
export type ThemeBackgroundSide = {
  /**
   * File name inside the theme's own `assets/` directory, or '' when this
   * appearance has no media of its own. An empty side paints nothing and lets
   * the theme's plain surface colour show. The extension names the kind: an
   * image paints as one, a video plays as one.
   */
  asset: string
  /**
   * The media's own opacity, 0–100. The theme's surface colour sits *under* the
   * media, so lowering this lets that colour show through — the panel never
   * becomes transparent to reveal the wallpaper.
   */
  opacity: number
  /** Softness in px; 0 keeps the media sharp, which is the default in both. */
  blur: number
  /**
   * Whether this appearance actually paints its media. A disabled side keeps
   * every other field — and the stored file — intact, so switching it back on
   * restores exactly what was there: it is a switch, not a removal. An absent
   * flag reads as on, which is what every document written before it existed
   * meant.
   */
  enabled: boolean
}

/**
 * The background one saved custom theme may carry: one wallpaper per
 * appearance, each with its own media, switch, opacity and blur.
 *
 * It lives in the theme document rather than in a browser preference, so a
 * theme's wallpapers follow the theme through an export, an import and a Host
 * restart — the same reason the colours live in files. Preset themes never
 * carry one: a preset is a palette, and only a custom theme is the user's own
 * document to extend.
 *
 * A document that names no media on either side normalizes to `null`, which is
 * the single "this theme has no wallpaper" value the rest of the plugin reads.
 */
export type ThemeBackground = Record<ThemeAppearance, ThemeBackgroundSide>

/**
 * Where a fresh image starts, per appearance: visible enough to read, calm
 * enough for text. Dark starts lower because a bright wallpaper over a dark
 * palette is harsher than the same image over the light one, and the panel
 * colour has to win more of the mix.
 */
export const THEME_BACKGROUND_DEFAULT_OPACITY: ThemeAppearancePair = { light: 40, dark: 30 }

/** A fresh image is sharp in both appearances. */
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
 * A side with no media yet, carrying the defaults for its own appearance. This
 * is where every "add an image" gesture starts: the picker fills `asset` in
 * later, and until it does the side simply paints nothing.
 */
export function emptyBackgroundSide(appearance: ThemeAppearance): ThemeBackgroundSide {
  return {
    asset: '',
    opacity: THEME_BACKGROUND_DEFAULT_OPACITY[appearance],
    blur: THEME_BACKGROUND_DEFAULT_BLUR[appearance],
    enabled: true,
  }
}

/** Whether either side names media; a background with none is no background. */
export function backgroundHasAsset(background: ThemeBackground): boolean {
  return background.light.asset !== '' || background.dark.asset !== ''
}

/**
 * Bytes one uploaded image may occupy. A large image is re-encoded until it
 * fits this cap, so it is deliberately smaller than the archive entry cap: an
 * image that reaches the roster must also survive an export.
 */
export const THEME_IMAGE_MAX_BYTES = 4 * 1024 * 1024

/**
 * Bytes one uploaded background video may occupy.
 *
 * A video cannot be re-encoded in the browser the way an image is, so this cap
 * is much larger: a clip small enough for the image cap would be a few seconds
 * at a low resolution. It is also the largest single asset the Host stores, so
 * the upload route and the archive reader bound themselves by this value.
 */
export const THEME_VIDEO_MAX_BYTES = 32 * 1024 * 1024

/** Largest single asset of any kind; the upload route's body cap. */
export const THEME_ASSET_MAX_BYTES = Math.max(THEME_IMAGE_MAX_BYTES, THEME_VIDEO_MAX_BYTES)

/**
 * Accepted media extensions and the type each is served with. Shared by the
 * upload route, the archive reader/writer and the asset directory scanner, so
 * one table answers "what may a theme carry" everywhere.
 *
 * MP4 and WebM are the two containers a Chromium `<video>` plays without a
 * plugin; anything else a user picks is refused rather than stored and then
 * found unplayable.
 */
export const THEME_ASSET_TYPES: Record<string, { kind: ThemeAssetKind; mime: string }> = {
  '.png': { kind: 'image', mime: 'image/png' },
  '.jpg': { kind: 'image', mime: 'image/jpeg' },
  '.jpeg': { kind: 'image', mime: 'image/jpeg' },
  '.webp': { kind: 'image', mime: 'image/webp' },
  '.gif': { kind: 'image', mime: 'image/gif' },
  '.avif': { kind: 'image', mime: 'image/avif' },
  '.mp4': { kind: 'video', mime: 'video/mp4' },
  '.webm': { kind: 'video', mime: 'video/webm' },
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
 * One appearance-tagged background value, from a pre-v3 document.
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

/** A stored asset name that this build would accept, or '' when it is unusable. */
function readAssetName(raw: unknown): string {
  return isThemeAssetName(raw) && assetTypeOf(raw) ? raw : ''
}

/** One finite number, clamped; null when it is missing or not a real number. */
function readNumber(raw: unknown, clamp: (value: number) => number): number | null {
  return typeof raw === 'number' && Number.isFinite(raw) ? clamp(raw) : null
}

/**
 * One appearance's side, read from the v3 shape. A side that names no usable
 * file is still returned: that is "this appearance has no image", not a
 * malformed document, and the other side must not be lost with it.
 */
function readBackgroundSide(raw: unknown, appearance: ThemeAppearance): ThemeBackgroundSide {
  const fallback = emptyBackgroundSide(appearance)
  if (!isRecord(raw)) return fallback
  return {
    asset: readAssetName(raw.asset),
    opacity: readNumber(raw.opacity, clampBackgroundOpacity) ?? fallback.opacity,
    blur: readNumber(raw.blur, clampBackgroundBlur) ?? fallback.blur,
    // Only an explicit `false` disables the image: a side written before the
    // flag existed, or one whose value is malformed, keeps its wallpaper on.
    enabled: raw.enabled !== false,
  }
}

/**
 * A pre-v3 document's two sides: it stored one asset shared by both
 * appearances, so repeating it reproduces exactly what that build painted —
 * each appearance keeping the opacity and blur it already had.
 */
function readSharedBackground(raw: Record<string, unknown>): ThemeBackground {
  const asset = readAssetName(raw.asset)
  const opacity = readAppearancePair(
    raw.opacity,
    clampBackgroundOpacity,
    THEME_BACKGROUND_DEFAULT_OPACITY,
    legacyDarkOpacity,
  )
  // Blur was shared by both appearances, so a flat value is the dark one too.
  const blur = readAppearancePair(raw.blur, clampBackgroundBlur, THEME_BACKGROUND_DEFAULT_BLUR, (light) => light)
  const enabled = raw.enabled !== false
  return {
    light: { asset, opacity: opacity.light, blur: blur.light, enabled },
    dark: { asset, opacity: opacity.dark, blur: blur.dark, enabled },
  }
}

/**
 * Fold any stored or posted background into this build's shape, or drop it.
 *
 * Both document generations read here: a v3 background carries its two sides
 * outright, while v1/v2 stored one asset with a shared or per-appearance
 * opacity/blur. A background that names media on neither side is no
 * background, which keeps `null` the one "no wallpaper" value downstream.
 */
export function normalizeBackground(raw: unknown): ThemeBackground | null {
  if (!isRecord(raw)) return null
  const background: ThemeBackground =
    isRecord(raw.light) || isRecord(raw.dark)
      ? { light: readBackgroundSide(raw.light, 'light'), dark: readBackgroundSide(raw.dark, 'dark') }
      : readSharedBackground(raw)
  return backgroundHasAsset(background) ? background : null
}

/**
 * The background a theme may keep: `raw` normalized, but with each side kept
 * only while the file it names is actually stored beside the theme. A side that
 * points at a missing file is emptied rather than rendering a broken
 * wallpaper, and a background with no media left on either side is dropped.
 */
export function backgroundForAssets(
  raw: unknown,
  assets: readonly Pick<ThemeAsset, 'name'>[],
): ThemeBackground | null {
  const background = normalizeBackground(raw)
  if (background === null) return null
  const stored = new Set(assets.map((asset) => asset.name))
  const keep = (side: ThemeBackgroundSide): ThemeBackgroundSide =>
    side.asset === '' || stored.has(side.asset) ? side : { ...side, asset: '', enabled: false }
  const next: ThemeBackground = { light: keep(background.light), dark: keep(background.dark) }
  return backgroundHasAsset(next) ? next : null
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
 * Import bounds. A theme is a small JSON document plus its media, so anything
 * past these caps is refused before it is parsed rather than after it has been
 * held in memory. The entry cap follows the largest asset the upload route
 * accepts, and the archive cap leaves room for one video per appearance.
 */
export const THEME_ARCHIVE_MAX_BYTES = 96 * 1024 * 1024
export const THEME_ARCHIVE_MAX_ENTRIES = 256
/** Cap on one uncompressed entry, so a zip bomb cannot expand without bound. */
export const THEME_ARCHIVE_MAX_ENTRY_BYTES = THEME_VIDEO_MAX_BYTES

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

