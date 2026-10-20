/**
 * Primitives layer: the ONLY place theme authors should edit to create a new theme.
 *
 * Architecture:
 *   :root                                                → light values for --dsw-static-*
 *   html[data-ds-dark-theme], body[data-ds-dark-theme]   → dark values for the SAME --dsw-static-* keys
 *   the shell's alias layer (design-platform.css)        → one `var(--dsw-static-*)` mapping per appearance
 *   accents.ts                                           → the alias tokens that follow the accent, not the foreground
 *
 * Changing a theme = providing a new light + dark map for these variables.
 * Semantic aliases — and the accent layer built on them — automatically follow.
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