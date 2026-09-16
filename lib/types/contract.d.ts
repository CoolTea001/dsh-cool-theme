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
/**
 * Documents are one directory each — `<root>/<id>/theme.json` — so a theme can
 * later carry media beside its seeds without changing this contract.
 */
export declare const THEME_FILE_VERSION = 1;
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
    createdAt: string;
    updatedAt: string;
};
/**
 * The Host's theme-file API, all below one prefix route. Kept here so the two
 * halves cannot drift on a path.
 */
export declare const THEME_API_PREFIX = "/cool-theme/api";
export declare const THEME_API_PATH_THEMES = "/cool-theme/api/themes";
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