/**
 * Bubble layer: the surface behind the user's own message in a conversation.
 *
 * DSH paints that bubble from `--dsw-specific-bubble`, and the shell points the
 * token at two unrelated scales — `deepseek-50` in light, `neutral-bluish-850`
 * in dark. A theme that only retints the primitives therefore moves the bubble
 * as a side effect of retinting the accent and the neutral ramp at once, and a
 * theme that wants a different bubble surface has no single knob to turn.
 *
 * This layer republishes the token by name and points it at
 * `--dsw-alias-button-primary-dimmed`, the shell's own quiet accent surface: one
 * alias, forked by appearance in the shell's alias layer, which already resolves
 * through the primitive ramps a preset retints. The value stays a `var()`
 * *reference* rather than a resolved colour, so the light/dark fork keeps coming
 * from the shell and a custom theme's own stylesheet can retarget the surface it
 * ends up on.
 *
 * No companion foreground override is needed: DSH prints
 * `--dsw-alias-label-primary` on the bubble, and that ink stays legible on a
 * dimmed accent in both appearances.
 *
 * Every user-message bubble shares the token, so the goal command echo and the
 * question reply follow the conversation bubble without a rule of their own.
 */

import type { AliasOverrides } from './accents.js'

/** The shell's own token for the bubble surface. */
export const BUBBLE_TOKEN = '--dsw-specific-bubble'

/** What this plugin points it at. */
export const BUBBLE_BACKGROUND = 'var(--dsw-alias-interactive-bg-hover)'

/**
 * The bubble override as a token layer. Both appearances carry the same
 * `var()` reference on purpose: the alias it names is the thing that forks, so
 * resolving a side here would freeze one appearance's answer into both.
 */
export function bubbleOverrides(): AliasOverrides {
  return { [BUBBLE_TOKEN]: { light: BUBBLE_BACKGROUND, dark: BUBBLE_BACKGROUND } }
}

/**
 * The same layer as CSS, for the fallback used when the client exposes no
 * `theme.overrideTokens`.
 *
 * DSH declares the token on `body` in light and on `body[data-ds-dark-theme]` in
 * dark — the dark attribute lands on `body`, not on `html` (boot-theme.ts writes
 * it there). Both of these selectors outrank those declarations by specificity
 * rather than by sheet order: `html body` is (0,0,2) against `body`'s (0,0,1),
 * and `html body[data-ds-dark-theme]` is (0,1,2) against the shell's (0,1,1).
 * A `:root`-only rule would not do either: the shell sets the property directly
 * on `body`, and an inherited value always loses to a declaration on the element
 * itself, no matter the specificity.
 */
export function buildBubbleCss(): string {
  return `html body, html body[data-ds-dark-theme] {\n  ${BUBBLE_TOKEN}: ${BUBBLE_BACKGROUND};\n}`
}
