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
//# sourceMappingURL=contract.d.ts.map