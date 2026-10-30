/**
 * Theme files owned by the Host.
 *
 * One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
 * document at `theme.json`, the optional stylesheet at `theme.css`, and the
 * theme's media under `assets/`. Keeping a theme a self-contained directory is
 * what makes the export a copy of that directory rather than a reassembly of
 * scattered rows.
 *
 * The directory is the source of truth for media: `readDocument` rebuilds the
 * asset list by scanning `assets/` instead of trusting the JSON, so a document
 * can never describe files that are not there. A background is kept only while
 * the file it names is still on disk.
 *
 * The stylesheet is not a media asset: `assets.ts` ignores it, and the document
 * only records whether it may apply. Its text is read and written on demand so
 * the roster stays small.
 */
import type { ThemeCssInfo, ThemeDocument } from '../contract.js';
export { DOCUMENT_NAME, assetsDir, cssPath, harnessHome, isThemeId, themeDir, themesRoot } from './paths.js';
/** A stylesheet refused for exceeding {@link THEME_CSS_MAX_BYTES}. */
export declare class CssTooLargeError extends Error {
}
/** Whether a theme directory already holds a readable document. */
export declare function themeExists(id: string): Promise<boolean>;
/** Every stored theme, oldest by creation time first; unreadable directories are skipped. */
export declare function listThemes(): Promise<ThemeDocument[]>;
/**
 * Insert or replace one document. `createdAt` is the caller's when the theme is
 * new and the stored value when it already exists, so a later rename or edit
 * cannot rewrite when the theme was made.
 *
 * Media files are pruned here rather than by the caller: a theme's background
 * references at most one asset per appearance, so the save that commits a new
 * file is also the save that can drop the one it replaced.
 */
export declare function putTheme(input: {
    id: string;
    name: string;
    base: string;
    theme: unknown;
    /** Wire value from the client; repaired against the stored assets below. */
    background?: unknown;
    /**
     * Stylesheet trust flag. It is used only when the theme is new: the CSS route
     * owns the flag on an existing theme, and a roster save must not clobber it.
     * A new theme starts off; the import path passes false explicitly.
     */
    cssEnabled?: boolean;
}): Promise<ThemeDocument>;
/**
 * One theme's stylesheet metadata, plus its text when it is small enough to
 * apply. A missing file is `css: null` with `bytes: 0`; a file over the cap is
 * `css: null` with `tooLarge: true` and its real size, so the panel can still
 * offer to open and trim it.
 */
export declare function readThemeCss(id: string): Promise<Omit<ThemeCssInfo, 'canOpen'>>;
/** Whether one theme's stylesheet is on disk. Used by the native-open route. */
export declare function themeCssExists(id: string): Promise<boolean>;
/**
 * Write one stylesheet with the same temp-and-rename pattern as the document,
 * so a reader never sees a half-written file. Returns its UTF-8 byte length.
 */
export declare function writeThemeCss(id: string, css: string): Promise<number>;
/**
 * Remove the stylesheet and turn the flag off, so a theme with no file cannot
 * be left "enabled" in the roster. A missing file is already the goal.
 */
export declare function deleteThemeCss(id: string): Promise<void>;
/**
 * The stylesheet trust switch. It is deliberately its own write path: the panel
 * toggles it without touching the card's draft, and a later roster save keeps
 * the stored value instead of overwriting it.
 */
export declare function setThemeCssEnabled(id: string, enabled: boolean): Promise<void>;
/** Remove one theme directory. A missing directory is already the goal. */
export declare function deleteTheme(id: string): Promise<void>;
//# sourceMappingURL=theme-files.d.ts.map