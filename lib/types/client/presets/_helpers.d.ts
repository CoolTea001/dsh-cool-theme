/**
 * Helpers for preset color scale generation.
 * Uses the same linear RGB interpolation as scripts/interpolate-colors.ts
 */
export declare const BLUISH_STEPS: readonly [0, 50, 60, 75, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 875, 900, 950, 1000];
export declare const NEUTRAL_STEPS: readonly [0, 50, 100, 150, 200, 250, 300, 400, 500, 550, 600, 700, 800, 850, 900, 1000];
/** Semantic steps — kept identical to original hand-picked presets for compatibility */
export declare const DEEPSEEK_STEPS: readonly [50, 100, 200, 300, 400, 450, 500, 600, 800, 900];
export declare const BLUE_STEPS: readonly [50, 100, 300, 400, 450, 500, 600, 800, 900];
export declare const BLUE_EXTRA_STEPS: readonly ["50p", "75", "950"];
export declare const GREEN_STEPS: readonly [100, 400, 500, 900];
export declare const AMBER_STEPS: readonly [100, 400, 500, 600, 900];
export declare const RED_STEPS: readonly [50, 100, 400, 500, 600, 900];
/**
 * Linearly interpolate between two colors (RGB space, same as scripts/interpolate-colors.ts)
 * @param colorStart color at scale 0, e.g. "#FAFAFA"
 * @param colorEnd   color at scale 1000, e.g. "#0D1017"
 * @param steps      array of scales to compute
 * @returns map of scale -> hex color
 */
export declare function interpolateColors(colorStart: string, colorEnd: string, steps: readonly number[]): Record<number, string>;
/**
 * Build CSS variable map for a neutral scale
 * e.g. prefix '--dsw-static-neutral-bluish', start '#FAFAFA', end '#0D1017'
 * -> { '--dsw-static-neutral-bluish-00': '#FAFAFA', '--dsw-static-neutral-bluish-50': '...' }
 */
export declare function buildScale(prefix: string, start: string, end: string, steps: readonly number[]): Record<string, string>;
export declare function buildDeepseekScale(base: string): Record<string, string>;
export declare function buildBlueScale(base: string): Record<string, string>;
export declare function buildGreenScale(base: string): Record<string, string>;
export declare function buildAmberScale(base: string): Record<string, string>;
export declare function buildRedScale(base: string): Record<string, string>;
/** Convenience: build all semantic scales from 5 base colors (500 values) */
export declare function buildSemanticScales(opts: {
    deepseek: string;
    blue: string;
    green: string;
    amber: string;
    red: string;
}): Record<string, string>;
//# sourceMappingURL=_helpers.d.ts.map