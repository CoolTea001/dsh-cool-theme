/**
 * The plugin's own icon set.
 *
 * Every glyph lives in `assets/` as an SVG, and that file is the source of
 * truth for its artwork: `tsdown` inlines it as text (the `loader` map in
 * tsdown.config.ts, described by assets.d.ts), and the wrapper below narrows the
 * markup to the same `{ size, className }` surface the shell's icons expose, so
 * a call site swaps one for the other without touching its layout.
 *
 * Two properties of the artwork the wrapper keeps: the strokes draw in
 * `currentColor`, so whichever control owns an icon goes on painting it — hover,
 * disabled and the danger face included — with no CSS here; and React owns the
 * `<svg>` root, so `size` stays a real prop instead of riding on the asset's own
 * `1em` box.
 */
import * as React from 'react';
/** What a caller may set on one of these icons — the shell's own `IconProps`. */
export interface IconProps {
    /** Square edge length in px. Defaults to 16, the box the artwork is drawn for. */
    size?: number;
    className?: string;
}
export declare const IconDelete: React.FC<IconProps>;
export declare const IconEdit: React.FC<IconProps>;
export declare const IconExport: React.FC<IconProps>;
export declare const IconImport: React.FC<IconProps>;
export declare const IconPlus: React.FC<IconProps>;
/**
 * The palette as markup instead of as a component, because its only consumer
 * patches shell DOM rather than rendering it: `patchThemeNavIcon` in theme.tsx
 * hides the gear the settings nav draws for an unknown section and writes this
 * into the seat beside it. The string therefore travels whole, with width and
 * height pinned to the shell's 16px icon slot — the asset's own `1em` would
 * resolve against whatever font the nav happens to carry.
 */
export declare const THEME_NAV_MARKUP: string;
//# sourceMappingURL=icons.d.ts.map