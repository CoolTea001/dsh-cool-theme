/**
 * Primitives layer: the ONLY place theme authors should edit to create a new theme.
 *
 * Architecture (user-selected strategy B):
 *   :root                                                → light values for --dsw-static-*
 *   html[data-ds-dark-theme], body[data-ds-dark-theme]   → dark values for the SAME --dsw-static-* keys
 *   semantic layer (semantic.ts)                         → single `var(--dsw-static-*)` mapping, no light/dark fork
 *
 * Changing a theme = providing a new light + dark map for these 85 variables.
 * Semantic aliases automatically follow. No other file needs to change.
 *
 * Baseline below is the Figma baseline the user provided (light ≡ dark initially).
 * To make dark mode actually dark, override the dark map via a preset (see presets.ts).
 */
export type StaticMap = Record<string, string>;
export declare const PRIMITIVES_LIGHT: StaticMap;
export declare const PRIMITIVES_DARK: StaticMap;
export declare function buildPrimitivesCss(light?: StaticMap, dark?: StaticMap): string;
export declare function primitiveOverrides(light: StaticMap, dark: StaticMap): Record<string, {
    light: string;
    dark: string;
}>;
//# sourceMappingURL=primitives.d.ts.map