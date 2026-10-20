/**
 * Theme files owned by the Host.
 *
 * One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
 * document at `theme.json` and the theme's media under `assets/`. Keeping a
 * theme a self-contained directory is what makes the export a copy of that
 * directory rather than a reassembly of scattered rows.
 *
 * The directory is the source of truth for media: `readDocument` rebuilds the
 * asset list by scanning `assets/` instead of trusting the JSON, so a document
 * can never describe files that are not there. A background is kept only while
 * the file it names is still on disk.
 */
import type { ThemeDocument } from '../contract.js';
export { DOCUMENT_NAME, assetsDir, harnessHome, isThemeId, themeDir, themesRoot } from './paths.js';
/** Whether a theme directory already holds a readable document. */
export declare function themeExists(id: string): Promise<boolean>;
/** Every stored theme, oldest by creation time first; unreadable directories are skipped. */
export declare function listThemes(): Promise<ThemeDocument[]>;
/**
 * Insert or replace one document. `createdAt` is the caller's when the theme is
 * new and the stored value when it already exists, so a later rename or edit
 * cannot rewrite when the theme was made.
 *
 * Media files are pruned here rather than by the caller: a theme can reference
 * exactly one asset (its background), so the save that commits a new background
 * is also the save that can drop the replaced file.
 */
export declare function putTheme(input: {
    id: string;
    name: string;
    base: string;
    theme: unknown;
    /** Wire value from the client; repaired against the stored assets below. */
    background?: unknown;
}): Promise<ThemeDocument>;
/** Remove one theme directory. A missing directory is already the goal. */
export declare function deleteTheme(id: string): Promise<void>;
//# sourceMappingURL=theme-files.d.ts.map