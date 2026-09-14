/**
 * Theme files owned by the Host.
 *
 * One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
 * document at `theme.json` and — once themes carry media — the originals under
 * `assets/`. Keeping a theme a self-contained directory is what makes the later
 * export a copy of that directory rather than a reassembly of scattered rows.
 */
import type { ThemeAsset, ThemeDocument } from '../contract.js';
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
/** Every stored theme, newest first; unreadable directories are skipped. */
export declare function listThemes(): Promise<ThemeDocument[]>;
/**
 * Insert or replace one document. `createdAt` is the caller's when the theme is
 * new and the stored value when it already exists, so a later rename or edit
 * cannot rewrite when the theme was made.
 */
export declare function putTheme(input: {
    id: string;
    name: string;
    base: string;
    theme: unknown;
    assets: ThemeAsset[];
}): Promise<ThemeDocument>;
/** Remove one theme directory. A missing directory is already the goal. */
export declare function deleteTheme(id: string): Promise<void>;
/** Absolute path of a theme's media directory; used once themes carry media. */
export declare function assetsDir(id: string): string;
//# sourceMappingURL=theme-files.d.ts.map