import { type PresetId } from './presets.js';
export declare function buildBaseCss(): string;
export declare function buildOverrides(id: PresetId): Record<string, {
    light: string;
    dark: string;
}>;
export declare function buildFullCssFallback(id: PresetId): string;
//# sourceMappingURL=tokens.d.ts.map