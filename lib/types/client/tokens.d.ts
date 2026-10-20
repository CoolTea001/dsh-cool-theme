import { type PresetId, type PresetDef } from './presets.js';
export declare function buildBaseCss(): string;
/**
 * Accepts either a preset id or an already-built `PresetDef` (what a custom
 * theme produces). Both go through the identical merge, so a custom theme is
 * not a special case anywhere downstream.
 */
export declare function resolvePreset(src: PresetId | PresetDef): {
    light: {
        [x: string]: string;
    };
    dark: {
        [x: string]: string;
    };
} | null;
/** Options a palette can be published with. */
export type OverrideOptions = {
    /**
     * Make the two canvas tokens (`bg-base` and the sidebar fill) transparent so
     * the background layer below them shows through. Only a custom theme that
     * carries a background asks for this; presets and plain custom themes keep
     * the shell's opaque surfaces.
     */
    transparentBase?: boolean;
};
/**
 * Every token a theme publishes, in one layer: the primitive ramps it retints,
 * plus the alias tokens that move DSH's interactive components onto the theme's
 * accent (see css/accents.ts). The accent goes last so it wins over any alias a
 * custom theme's own map happens to carry.
 */
export declare function buildOverrides(src: PresetId | PresetDef, options?: OverrideOptions): Record<string, {
    light: string;
    dark: string;
}>;
export declare function buildFullCssFallback(src: PresetId | PresetDef, options?: OverrideOptions): string;
//# sourceMappingURL=tokens.d.ts.map