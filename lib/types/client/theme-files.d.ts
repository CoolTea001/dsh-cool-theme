/**
 * Browser half of the theme-file transport.
 *
 * The Host owns the files; this module is the only place that knows the wire
 * shape, so the rest of the client keeps working with plain `SavedTheme`
 * records. Every call is same-origin against the Host's own prefix route.
 */
import type { ThemeDocument } from '../contract.js';
import { type CustomTheme, type SavedTheme } from './custom.js';
/** Repair one stored document against the preset its seeds derive from. */
export declare function documentToSaved(doc: ThemeDocument, fallbackFor: (base: string) => CustomTheme): SavedTheme;
/** The document payload for one entry; timestamps stay the Host's business. */
export declare function savedToDocument(entry: SavedTheme): Record<string, unknown>;
/**
 * The Host answered as something other than this API — its route half is not
 * mounted (the usual cause is a DSH process started before this plugin's host
 * half existed). Distinguished from a write failure because only this one tells
 * the user to restart, and the browser copy is still intact meanwhile.
 */
export declare class ThemeApiUnavailableError extends Error {
}
/** Every stored theme, in the Host's creation-time order (newest first). */
export declare function fetchThemes(fallbackFor: (base: string) => CustomTheme): Promise<SavedTheme[]>;
/** Insert or replace the given entries; resolves with what the Host stored. */
export declare function pushThemes(entries: SavedTheme[], fallbackFor: (base: string) => CustomTheme): Promise<SavedTheme[]>;
/** Remove one theme's directory. */
export declare function removeTheme(id: string): Promise<void>;
/**
 * The themes a browser saved before files became the store, minus those the
 * Host already has.
 *
 * Ids are the join key: a theme another browser already migrated must not be
 * written twice, while one this roster lacks would otherwise disappear from the
 * UI. Callers adopt the result, then stop reading the browser copy.
 */
export declare function legacyThemesToAdopt(legacy: SavedTheme[], hostThemes: SavedTheme[]): SavedTheme[];
//# sourceMappingURL=theme-files.d.ts.map