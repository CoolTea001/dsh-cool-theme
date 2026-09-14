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
export declare function buildOverrides(src: PresetId | PresetDef): Record<string, {
    light: string;
    dark: string;
}>;
export declare function buildFullCssFallback(src: PresetId | PresetDef): string;
//# sourceMappingURL=tokens.d.ts.map