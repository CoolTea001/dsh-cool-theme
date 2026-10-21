/**
 * Shared contract for dsh-cool-theme.
 */
export declare const THEME_STORAGE_KEY = "cool-theme-preset";
export declare const THEME_STORAGE_KEY_LEGACY = "cooltea-theme-preset";
export declare const CUSTOM_PRESET_ID = "custom";
export declare const CUSTOM_THEME_STORAGE_KEY = "cool-theme-custom";
export declare const CUSTOM_LIST_STORAGE_KEY = "cool-theme-custom-list";
export declare const CUSTOM_ACTIVE_STORAGE_KEY = "cool-theme-custom-active";
export declare const CUSTOM_MIGRATED_STORAGE_KEY = "cool-theme-custom-migrated";
export declare const SIDEBAR_TRANSPARENT_STORAGE_KEY = "cool-theme-sidebar-transparent";
/** A plain JSON object: not null, not an array, and not a primitive. */
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/**
 * Documents are one directory each — `<root>/<id>/theme.json` — so a theme can
 * later carry media beside its seeds without changing this contract.
 *
 * v2 split the background's opacity and blur per appearance. A v1 document's
 * flat numbers still read: they are the light half, with the dark half derived
 * exactly as that build derived it (see {@link normalizeBackground}).
 */
export declare const THEME_FILE_VERSION = 2;
/**
 * A fresh theme id. Both halves mint ids in the same shape, so an id never says
 * which half created it; the Host is the side that validates the pattern.
 */
export declare function newThemeId(): string;
/** Media kind carried with a theme; the seed payload itself is `theme`. */
export type ThemeAssetKind = 'image' | 'video';
/** One media file stored under the theme's `assets/` directory. */
export type ThemeAsset = {
    /** File name inside `assets/`; unique within the theme. */
    name: string;
    kind: ThemeAssetKind;
    /** Content type the Host serves it back with. */
    mime: string;
    bytes: number;
};
/**
 * One theme as it is stored and exchanged. `theme` stays opaque here: the
 * Client owns the seed shape and repairs it against a preset on read, while the
 * Host only ever moves the document in and out of a file.
 */
export type ThemeDocument = {
    v: number;
    id: string;
    name: string;
    /** Id of the preset the seeds derive from. */
    base: string;
    theme: unknown;
    assets: ThemeAsset[];
    /** The wallpaper this custom theme carries; null for a theme without one. */
    background: ThemeBackground | null;
    createdAt: string;
    updatedAt: string;
};
/** The two appearances a background is tuned for, in the editor's own order. */
export type ThemeAppearance = 'light' | 'dark';
/** One number per appearance, keyed the way the editor's light/dark toggle is. */
export type ThemeAppearancePair = Record<ThemeAppearance, number>;
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
    asset: string;
    /**
     * The image's own opacity, 0–100, per appearance. The theme's surface colour
     * sits *under* the image, so lowering this lets that colour show through —
     * the panel never becomes transparent to reveal the image.
     */
    opacity: ThemeAppearancePair;
    /**
     * Softness in px, per appearance; 0 keeps the image sharp, which is the
     * default in both.
     */
    blur: ThemeAppearancePair;
    /**
     * Whether the theme actually paints the image. A disabled background keeps
     * every other field — and the stored file — intact, so switching it back on
     * restores exactly what was there: it is a switch, not a removal. An absent
     * flag reads as on, which is what every document written before it existed
     * meant.
     */
    enabled: boolean;
};
/**
 * Where a fresh background starts, per appearance: visible enough to read,
 * calm enough for text. Dark starts lower because a bright wallpaper over a
 * dark palette is harsher than the same image over the light one, and the
 * panel colour has to win more of the mix.
 */
export declare const THEME_BACKGROUND_DEFAULT_OPACITY: ThemeAppearancePair;
/** A fresh background is sharp in both appearances. */
export declare const THEME_BACKGROUND_DEFAULT_BLUR: ThemeAppearancePair;
/**
 * How much a background written before the split dims in dark mode. Only
 * {@link legacyDarkOpacity} reads it: a current background stores its dark
 * opacity outright, so nothing derives it any more.
 */
export declare const THEME_BACKGROUND_LEGACY_DARK_FACTOR = 0.7;
export declare const THEME_BACKGROUND_MAX_BLUR = 24;
/** Fold an opacity into the 0–100 percentage a background stores. */
export declare function clampBackgroundOpacity(value: number): number;
/** Fold a blur radius into the 0–{@link THEME_BACKGROUND_MAX_BLUR} px a background stores. */
export declare function clampBackgroundBlur(value: number): number;
/**
 * The dark opacity a pre-split background paints: its light value dimmed by
 * {@link THEME_BACKGROUND_LEGACY_DARK_FACTOR}. Migration-only, so an existing
 * wallpaper keeps the exact look it had rather than jumping to a new default.
 */
export declare function legacyDarkOpacity(lightOpacity: number): number;
/**
 * Bytes one uploaded image may occupy. It matches a single archive entry's
 * uncompressed cap on purpose: an image the roster accepts must also survive
 * an export, or sharing a theme would fail only after the fact.
 */
export declare const THEME_ASSET_MAX_BYTES: number;
/**
 * Accepted media extensions and the type each is served with. Shared by the
 * upload route, the archive reader/writer and the asset directory scanner, so
 * one table answers "what may a theme carry" everywhere.
 */
export declare const THEME_ASSET_TYPES: Record<string, {
    kind: ThemeAssetKind;
    mime: string;
}>;
/** The type of a file name, or null when a theme may not carry it. */
export declare function assetTypeOf(name: string): {
    kind: ThemeAssetKind;
    mime: string;
} | null;
export declare function isThemeAssetName(value: unknown): value is string;
/** Fold any stored or posted background into this build's shape, or drop it. */
export declare function normalizeBackground(raw: unknown): ThemeBackground | null;
/**
 * The background a theme may keep: `raw` normalized, but only while the file it
 * names is actually stored beside the theme. A document that points at a missing
 * image drops the background rather than rendering a broken wallpaper.
 */
export declare function backgroundForAssets(raw: unknown, assets: readonly Pick<ThemeAsset, 'name'>[]): ThemeBackground | null;
/**
 * The Host's theme-file API, all below one prefix route. Kept here so the two
 * halves cannot drift on a path.
 */
export declare const THEME_API_PREFIX = "/cool-theme/api";
export declare const THEME_API_PATH_THEMES = "/cool-theme/api/themes";
/** Route segment below a theme id that holds its media. */
export declare const THEME_API_SEGMENT_ASSETS = "assets";
/** Upload and list URL of one theme's media directory. */
export declare function themeAssetsPath(id: string): string;
/** Read URL of one stored asset. The name is content-hashed, so it is cacheable. */
export declare function themeAssetUrl(id: string, name: string): string;
/**
 * Share archive: one theme directory zipped. The document keeps the name it has
 * on disk, so an archive is a copy of the directory rather than a new format,
 * and media added later travels with it under {@link THEME_ARCHIVE_ASSETS_DIR}.
 */
export declare const THEME_ARCHIVE_DOCUMENT = "theme.json";
export declare const THEME_ARCHIVE_ASSETS_DIR = "assets";
/** Content type of an exported archive, and the extension a name gets. */
export declare const THEME_ARCHIVE_MIME = "application/zip";
export declare const THEME_ARCHIVE_EXTENSION = ".zip";
/**
 * Import bounds. A theme is a small JSON document, so anything past these caps
 * is refused before it is parsed rather than after it has been held in memory.
 */
export declare const THEME_ARCHIVE_MAX_BYTES: number;
export declare const THEME_ARCHIVE_MAX_ENTRIES = 256;
/** Cap on one uncompressed entry, so a zip bomb cannot expand without bound. */
export declare const THEME_ARCHIVE_MAX_ENTRY_BYTES: number;
/** Route segments below {@link THEME_API_PATH_THEMES}: `/<id>/export`, `/import`. */
export declare const THEME_API_SEGMENT_EXPORT = "export";
export declare const THEME_API_PATH_IMPORT = "/cool-theme/api/themes/import";
/**
 * Name the Host suggests for a downloaded archive. The archive keeps the
 * theme's name so a user can tell two exports apart, with the characters a
 * filesystem refuses folded to spaces; the id is the fallback for a name that
 * folds away to nothing.
 */
export declare function archiveFileName(name: string, id: string): string;
/**
 * `base`, else `${base} 2`, `${base} 3`, … An imported theme keeps the name it
 * was shared under — that name is the point of the share — so a clash is
 * resolved by numbering rather than by renaming the incoming theme. The Host
 * owns this because it owns the roster the names have to be free in.
 */
export declare function freeThemeName(base: string, taken: readonly string[]): string;
//# sourceMappingURL=contract.d.ts.map