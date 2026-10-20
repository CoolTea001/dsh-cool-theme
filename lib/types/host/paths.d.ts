/**
 * Where a theme lives on disk.
 *
 * Split out of `theme-files.ts` so the asset store can resolve a theme's
 * `assets/` directory without importing the document store — the document store
 * imports the asset store, and a cycle between the two would make every bundle
 * order-sensitive for no gain.
 */
export declare function isThemeId(value: unknown): value is string;
/**
 * The harness home, resolved the way the rest of DSH resolves it: an explicit
 * `DSH_HOME`, else `~/.dsh`.
 */
export declare function harnessHome(): string;
/** Root of every stored theme. */
export declare function themesRoot(): string;
/** One theme's own directory. Callers must have validated `id`. */
export declare function themeDir(id: string): string;
/** Directory name of the theme document inside one theme's own directory. */
export declare const DOCUMENT_NAME = "theme.json";
/** Media directory beside the document. */
export declare const ASSETS_DIR = "assets";
/** Absolute path of a theme's media directory. */
export declare function assetsDir(id: string): string;
/**
 * A fresh theme id. The same shape the client mints (`ct_` + time + noise), so
 * an id never says which half created it, and `isThemeId` is the only rule both
 * halves apply.
 */
export declare function newThemeId(): string;
//# sourceMappingURL=paths.d.ts.map