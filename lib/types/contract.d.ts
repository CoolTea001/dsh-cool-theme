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
 * The reason behind a thrown value, for a response body or a toast. A thrown
 * string is not an Error, so the message it carries would otherwise be lost.
 */
export declare function errorMessage(error: unknown): string;
/**
 * Documents are one directory each — `<root>/<id>/theme.json` — so a theme can
 * later carry media beside its seeds without changing this contract.
 *
 * v2 split the background's opacity and blur per appearance; v3 split the
 * background itself, so each appearance owns its image, switch, opacity and
 * blur; v4 lets either side name a video as well as an image; v5 adds the
 * optional `theme.css` and its `cssEnabled` flag. Older documents still read:
 * one shared asset becomes both sides' media, a v1 flat number becomes the
 * light value with the dark one derived exactly as that build derived it (see
 * {@link normalizeBackground}), and a document without `cssEnabled` reads as
 * enabled. The version is bumped even when the document shape did not change
 * for the same reason as v4: a build that predates a feature must refuse an
 * archive that carries it rather than silently drop it.
 */
export declare const THEME_FILE_VERSION = 5;
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
    /**
     * Whether this theme's optional `theme.css` may apply. Absent in documents
     * written before v5, which read as false: the switch is opt-in, and a new or
     * imported theme starts disabled. Turning it on creates the file (if needed)
     * and enables it; turning it off keeps the file but stops applying it.
     */
    cssEnabled: boolean;
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
/** The two appearances, in the order the editor reads them. */
export declare const THEME_APPEARANCES: readonly ["light", "dark"];
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
    asset: string;
    /**
     * The media's own opacity, 0–100. The theme's surface colour sits *under* the
     * media, so lowering this lets that colour show through — the panel never
     * becomes transparent to reveal the wallpaper.
     */
    opacity: number;
    /** Softness in px; 0 keeps the media sharp, which is the default in both. */
    blur: number;
    /**
     * Whether this appearance actually paints its media. A disabled side keeps
     * every other field — and the stored file — intact, so switching it back on
     * restores exactly what was there: it is a switch, not a removal. An absent
     * flag reads as on, which is what every document written before it existed
     * meant.
     */
    enabled: boolean;
};
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
export type ThemeBackground = Record<ThemeAppearance, ThemeBackgroundSide>;
/**
 * Where a fresh image starts, per appearance: visible enough to read, calm
 * enough for text. Dark starts lower because a bright wallpaper over a dark
 * palette is harsher than the same image over the light one, and the panel
 * colour has to win more of the mix.
 */
export declare const THEME_BACKGROUND_DEFAULT_OPACITY: ThemeAppearancePair;
/** A fresh image is sharp in both appearances. */
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
 * A side with no media yet, carrying the defaults for its own appearance. This
 * is where every "add an image" gesture starts: the picker fills `asset` in
 * later, and until it does the side simply paints nothing.
 */
export declare function emptyBackgroundSide(appearance: ThemeAppearance): ThemeBackgroundSide;
/** Whether either side names media; a background with none is no background. */
export declare function backgroundHasAsset(background: ThemeBackground): boolean;
/**
 * Bytes one uploaded image may occupy. A large image is re-encoded until it
 * fits this cap, so it is deliberately smaller than the archive entry cap: an
 * image that reaches the roster must also survive an export.
 */
export declare const THEME_IMAGE_MAX_BYTES: number;
/**
 * Bytes one uploaded background video may occupy.
 *
 * A video cannot be re-encoded in the browser the way an image is, so this cap
 * is much larger: a clip small enough for the image cap would be a few seconds
 * at a low resolution. It is also the largest single asset the Host stores, so
 * the upload route and the archive reader bound themselves by this value.
 */
export declare const THEME_VIDEO_MAX_BYTES: number;
/** Largest single asset of any kind; the upload route's body cap. */
export declare const THEME_ASSET_MAX_BYTES: number;
/**
 * Largest stylesheet a custom theme may carry. CSS is injected into the page,
 * so an unbounded file would block the main thread; 256 KiB is far more than a
 * hand-written theme needs and still small enough to read when the theme
 * becomes active. The file is not a media asset, so it has a cap of its own.
 */
export declare const THEME_CSS_MAX_BYTES: number;
/**
 * File name of the optional stylesheet. It sits beside `theme.json` in the
 * theme's own directory and at the archive root, so the directory stays the
 * self-contained unit an export copies.
 */
export declare const THEME_CSS_NAME = "theme.css";
/**
 * Accepted media extensions and the type each is served with. Shared by the
 * upload route, the archive reader/writer and the asset directory scanner, so
 * one table answers "what may a theme carry" everywhere.
 *
 * MP4 and WebM are the two containers a Chromium `<video>` plays without a
 * plugin; anything else a user picks is refused rather than stored and then
 * found unplayable.
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
/**
 * Fold any stored or posted background into this build's shape, or drop it.
 *
 * Both document generations read here: a v3 background carries its two sides
 * outright, while v1/v2 stored one asset with a shared or per-appearance
 * opacity/blur. A background that names media on neither side is no
 * background, which keeps `null` the one "no wallpaper" value downstream.
 */
export declare function normalizeBackground(raw: unknown): ThemeBackground | null;
/**
 * The background a theme may keep: `raw` normalized, but with each side kept
 * only while the file it names is actually stored beside the theme. A side that
 * points at a missing file is emptied rather than rendering a broken
 * wallpaper, and a background with no media left on either side is dropped.
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
/** Route segment below a theme id that holds its optional stylesheet. */
export declare const THEME_API_SEGMENT_CSS = "css";
/** Route segment below the stylesheet that opens it on the Host desktop. */
export declare const THEME_API_SEGMENT_OPEN = "open";
/** Read/write URL of one theme's stylesheet. */
export declare function themeCssPath(id: string): string;
/** Native-open URL of one theme's stylesheet. It accepts no filesystem path. */
export declare function themeCssOpenPath(id: string): string;
/**
 * One theme's stylesheet as the Host reports it. The text is absent when the
 * file is missing or exceeds {@link THEME_CSS_MAX_BYTES}; `bytes` and
 * `tooLarge` distinguish those two states so the panel can say which one it is
 * without reading the file again.
 */
export type ThemeCssInfo = {
    /** The CSS text, or null when absent or too large to apply. */
    css: string | null;
    /** Whether `theme.json` allows the file to apply. */
    enabled: boolean;
    /** Display path, with the home directory folded to `~` where possible. */
    path: string;
    /** Absolute path, for the copy fallback. */
    absolutePath: string;
    /** File size in bytes; 0 when absent. */
    bytes: number;
    /** File mtime in ISO form, or null when absent. */
    updatedAt: string | null;
    /** True when the page is local enough for the Host to open the file. */
    canOpen: boolean;
    /** True when the file exists but is over {@link THEME_CSS_MAX_BYTES}. */
    tooLarge: boolean;
};
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
 * Import bounds. A theme is a small JSON document plus its media, so anything
 * past these caps is refused before it is parsed rather than after it has been
 * held in memory. The entry cap follows the largest asset the upload route
 * accepts, and the archive cap leaves room for one video per appearance.
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