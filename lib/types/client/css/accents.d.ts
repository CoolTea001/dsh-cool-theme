/**
 * Accent layer: the alias tokens that put the theme's accent colour on DSH's
 * interactive components instead of its foreground.
 *
 * DSH paints the filled Button, the Switch track, the checkbox/radio fills and
 * the Tooltip bubble from alias tokens that all resolve to the *foreground*
 * neutral: `--dsw-alias-brand-primary` and `--dsw-alias-label-primary` name the
 * same `--dsw-static-neutral-bluish-*` step in both appearances, so the brand is
 * monochrome by construction. A preset that retints only the primitive layer
 * therefore cannot separate them — the button simply becomes the new text
 * colour. Components the shell wires to no token at all (the off-state Switch
 * track, the `interactive-bg-*` overlays) are literal hex values in
 * `design-platform.css` and stay put for the same reason.
 *
 * The accent is read from the palette's own `--dsw-static-deepseek-*` scale: the
 * colour DSH already spends on focus rings, links and `--dsw-alias-state-business-primary`,
 * and the one the custom-theme editor exposes as its Accent seed. Every value
 * here is derived from that scale plus the palette's neutral extremes, because a
 * custom theme's accent is arbitrary and an unreadable on-accent ink or tooltip
 * would be worse than the untinted default.
 */
import type { StaticMap } from './primitives.js';
/** One override layer value: a colour per appearance. */
export type ModePair = {
    light: string;
    dark: string;
};
/** Token name → value pair, the shape `theme.overrideTokens` consumes. */
export type AliasOverrides = Record<string, ModePair>;
/**
 * The alias tokens that carry the accent. Empty when either appearance has no
 * usable accent: publishing half a layer would leave the two appearances
 * disagreeing about the theme's brand colour.
 */
export declare function accentOverrides(light: StaticMap, dark: StaticMap): AliasOverrides;
/**
 * The same layer as CSS, for the fallback used when the client exposes no
 * `theme.overrideTokens`. DSH declares its aliases on `body`, so the light block
 * rides on `:root` (a pseudo-class outranks it) and the dark block adds
 * `html[data-ds-dark-theme] body` to outrank `body[data-ds-dark-theme]`
 * regardless of where the injected sheet lands in the cascade.
 */
export declare function buildAccentCss(light: StaticMap, dark: StaticMap): string;
//# sourceMappingURL=accents.d.ts.map