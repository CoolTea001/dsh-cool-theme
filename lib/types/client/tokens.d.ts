/**
 * Token projection: preset palette -> DSH theme-token overrides.
 */
import { type PresetId } from './presets.js';
type Palette = {
    base: string;
    l1: string;
    l2: string;
    l3: string;
    overlay: string;
    b1: string;
    b2: string;
    brand: string;
    lp: string;
    ls: string;
    err: string;
    ok: string;
    warn: string;
    side: string;
};
export declare function aliasCss(p: Palette): Record<string, string>;
export declare function staticCss(p: Palette): Record<string, string>;
export declare function shikiCss(p: Palette): Record<string, string>;
export declare function buildOverrides(id: PresetId): Record<string, {
    light: string;
    dark: string;
}>;
export declare function buildFullCssFallback(id: PresetId): string;
export {};
//# sourceMappingURL=tokens.d.ts.map