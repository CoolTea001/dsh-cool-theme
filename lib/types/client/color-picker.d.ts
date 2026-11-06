/**
 * Picker geometry and the two conversions between a picker value and a seed.
 *
 * `react-colorful` carries opacity as an 8-bit hex channel, while a seed keeps
 * it as a whole percentage: these are the only places the two shapes meet. They
 * are pure, so the panel stays about state and this file stays about maths.
 */
/**
 * The colour popover's box. It comes in two heights: the picker itself is a
 * saturation panel plus a hue slider, and the border seed's picker carries an
 * opacity slider under those. These are estimates for choosing which side of
 * the swatch to open on — the popover is `position:fixed`, so being taller than
 * estimated only means it hangs higher.
 */
export declare const PICKER_WIDTH = 224;
export declare const PICKER_HEIGHT = 240;
/** One more 24px control in the picker, one more 24px of popover. */
export declare const PICKER_HEIGHT_WITH_ALPHA: number;
export declare const PICKER_GAP = 8;
export declare const PICKER_MARGIN = 8;
/**
 * The alpha checkerboard behind a translucent swatch. Both squares are the same
 * grey at different alphas, so the pattern reads on a light and a dark panel
 * alike without needing a colour per appearance.
 */
export declare const ALPHA_CHECKERBOARD = "repeating-conic-gradient(rgba(128, 128, 128, .45) 0% 25%, rgba(128, 128, 128, .18) 0% 50%)";
/**
 * A seed as the picker reads it: `#RRGGBB`, plus `#RRGGBBAA` when there is an
 * opacity to carry. An opaque colour stays six digits, which is the form the
 * picker itself hands back.
 */
export declare function withAlpha(hex: string, alpha: number): string;
/** A picker value back in seed shape: the opaque colour and its opacity. */
export declare function splitAlpha(value: string): {
    color: string;
    alpha: number;
};
//# sourceMappingURL=color-picker.d.ts.map