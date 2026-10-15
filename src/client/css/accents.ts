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
 * colour. Components whose colour is a literal in the shell's stylesheets
 * rather than a step of the palette stay put for the same reason: the
 * `interactive-bg-*` overlays are `rgba()` constants there, and the off-state
 * Switch track is `--dsw-alias-border-l3`, itself a literal hairline. A
 * primitive-only retint has nothing to reach them through, which is why this
 * layer republishes those aliases by name.
 *
 * The accent is read from the palette's own `--dsw-static-deepseek-*` scale: the
 * colour DSH already spends on focus rings, links and `--dsw-alias-state-business-primary`,
 * and the one the custom-theme editor exposes as its Accent seed. Every value
 * here is derived from that scale plus the palette's neutral extremes, because a
 * custom theme's accent is arbitrary and an unreadable on-accent ink or tooltip
 * would be worse than the untinted default.
 */

import type { StaticMap } from './primitives.js'

/** One override layer value: a colour per appearance. */
export type ModePair = { light: string; dark: string }

/** Token name → value pair, the shape `theme.overrideTokens` consumes. */
export type AliasOverrides = Record<string, ModePair>

type Mode = 'light' | 'dark'

type Rgb = [number, number, number]

/**
 * Accent candidates, most specific first. Light takes `deepseek-500` and dark
 * takes `deepseek-400` — the exact steps DSH picks for `state-business-primary`
 * and `button-info-fill`, so the themed controls land on the colour the shell
 * already uses for its own emphasis. The blue scale is the fallback for a
 * palette that renames or omits the DeepSeek one.
 */
const ACCENT_KEYS: Record<Mode, readonly string[]> = {
  light: ['--dsw-static-deepseek-500', '--dsw-static-deepseek-450', '--dsw-static-blue-500', '--dsw-static-blue-450'],
  dark: ['--dsw-static-deepseek-400', '--dsw-static-deepseek-450', '--dsw-static-blue-400', '--dsw-static-blue-450'],
}

/**
 * The step next to the accent on the light→dark axis, which DSH itself uses as
 * the filled button's hover (`button-info-fill: deepseek-500` with
 * `button-info-hover: deepseek-400` in light, the pair reversed in dark).
 */
const HOVER_KEYS: Record<Mode, readonly string[]> = {
  light: ['--dsw-static-deepseek-400', '--dsw-static-deepseek-450', '--dsw-static-blue-400', '--dsw-static-blue-450'],
  dark: ['--dsw-static-deepseek-500', '--dsw-static-deepseek-450', '--dsw-static-blue-500', '--dsw-static-blue-450'],
}

/**
 * The palette's extremes, used as the two ink candidates. A preset keeps its
 * neutral ramp identical in both appearances (the alias layer forks, the
 * primitives do not), so `neutral-bluish-00` is the lightest colour of the theme
 * in light *and* dark — which is also the label the shell prints on a Tooltip.
 */
const LIGHTEST_INK_KEY = '--dsw-static-neutral-bluish-00'
const DARKEST_INK_KEY = '--dsw-static-neutral-bluish-1000'

/**
 * Alpha of the accent on the interaction overlays. Taken from the literals DSH
 * ships (`#2631480f`/`#2631481a` light, `#ffffff14`/`#ffffff24` dark), so only
 * the hue changes and hover weight stays exactly as the shell tuned it.
 */
const OVERLAY_ALPHA: Record<Mode, { hover: number; active: number }> = {
  light: { hover: 6, active: 10 },
  dark: { hover: 8, active: 14 },
}

/** Share of the palette's darkest neutral mixed into the accent for the tooltip. */
const TOOLTIP_INK_WEIGHT = 0.55
/** Shifting applied per retry when the tooltip label is not yet legible. */
const TOOLTIP_SHIFT_STEP = 0.25
/** Retry cap, so a palette whose lightest ink sits next to the bubble cannot spin here. */
const TOOLTIP_SHIFT_RETRIES = 6
/** WCAG 2.1 AA contrast for normal text. */
const TOOLTIP_MIN_CONTRAST = 4.5

const BLACK: Rgb = [0, 0, 0]
const WHITE: Rgb = [255, 255, 255]

/**
 * Read one of `keys` from the palette as RGB. `null` when the palette carries
 * none of them, or carries a value this layer cannot reason about (a `var()`,
 * a `color-mix()`, a named colour): without a concrete triple there is no way to
 * derive an ink or a tooltip that is guaranteed to stay readable.
 */
function pickRgb(palette: StaticMap, keys: readonly string[]): Rgb | null {
  for (const key of keys) {
    const value = palette[key]
    if (value === undefined) continue
    const rgb = parseColor(value)
    if (rgb) return rgb
  }
  return null
}

function parseColor(value: string): Rgb | null {
  const text = value.trim()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ]
  }
  const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text)
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])]
  return null
}

function linear(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance. */
function luminance(rgb: Rgb): number {
  return 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2])
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const first = luminance(a)
  const second = luminance(b)
  const [high, low] = first >= second ? [first, second] : [second, first]
  return (high + 0.05) / (low + 0.05)
}

/** Mix in RGB, weight 0 → `from`, 1 → `to` (the space the preset ramps use). */
function mix(from: Rgb, to: Rgb, weight: number): Rgb {
  return [
    from[0] * (1 - weight) + to[0] * weight,
    from[1] * (1 - weight) + to[1] * weight,
    from[2] * (1 - weight) + to[2] * weight,
  ]
}

function toHex(rgb: Rgb): string {
  const channel = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`
}

/** Every value one appearance contributes to the layer. */
type AccentPalette = {
  accent: string
  hover: string
  onAccent: string
  tooltipBg: string
  hoverOverlay: string
  activeOverlay: string
}

function accentPalette(palette: StaticMap, mode: Mode): AccentPalette | null {
  const accent = pickRgb(palette, ACCENT_KEYS[mode])
  const lightest = pickRgb(palette, [LIGHTEST_INK_KEY])
  const darkest = pickRgb(palette, [DARKEST_INK_KEY])
  if (!accent || !lightest || !darkest) return null

  // Whatever the appearance, the shell prints the tooltip label with the
  // lightest neutral, so the bubble starts as the inverted surface DSH paints —
  // the palette's darkest neutral tinted with the accent — and is pushed until
  // that label is legible on it. A custom theme can tune its per-appearance ramp
  // so that this "lightest" step is itself dark; the direction of the push then
  // follows the label instead of assuming a light one.
  const tooltipTarget = contrastRatio(lightest, BLACK) >= contrastRatio(lightest, WHITE) ? BLACK : WHITE
  let tooltipBg = mix(accent, darkest, TOOLTIP_INK_WEIGHT)
  let retry = 0
  while (retry < TOOLTIP_SHIFT_RETRIES && contrastRatio(tooltipBg, lightest) < TOOLTIP_MIN_CONTRAST) {
    tooltipBg = mix(tooltipBg, tooltipTarget, TOOLTIP_SHIFT_STEP)
    retry += 1
  }

  // The ink on an accent fill is an accent problem, not a foreground problem:
  // the accent can be dark (a mid-tone blue) or light (a pastel), and the two
  // appearances disagree about which. Whichever palette extreme reads better on
  // it wins, so a custom theme's arbitrary accent cannot produce an invisible
  // button label or switch thumb.
  const onAccent = contrastRatio(accent, lightest) >= contrastRatio(accent, darkest) ? lightest : darkest

  const accentHex = toHex(accent)
  return {
    accent: accentHex,
    hover: toHex(pickRgb(palette, HOVER_KEYS[mode]) ?? accent),
    onAccent: toHex(onAccent),
    tooltipBg: toHex(tooltipBg),
    hoverOverlay: `color-mix(in srgb, ${accentHex} ${OVERLAY_ALPHA[mode].hover}%, transparent)`,
    activeOverlay: `color-mix(in srgb, ${accentHex} ${OVERLAY_ALPHA[mode].active}%, transparent)`,
  }
}

/**
 * The alias tokens that carry the accent. Empty when either appearance has no
 * usable accent: publishing half a layer would leave the two appearances
 * disagreeing about the theme's brand colour.
 */
export function accentOverrides(light: StaticMap, dark: StaticMap): AliasOverrides {
  const lightPalette = accentPalette(light, 'light')
  const darkPalette = accentPalette(dark, 'dark')
  if (!lightPalette || !darkPalette) return {}
  return {
    // The brand knob: the "on" Switch track, checkbox and radio fills, and the
    // text colour of the few links the shell paints with it.
    '--dsw-alias-brand-primary': { light: lightPalette.accent, dark: darkPalette.accent },
    // DSH derives the filled button's background from the brand, but the token
    // is named here too so a future re-pointing of that indirection cannot
    // silently drop the accent from the button.
    '--dsw-alias-button-primary-fill': { light: lightPalette.accent, dark: darkPalette.accent },
    // The hover is a literal neutral in the base palette; on an accent fill it
    // has to stay in the accent's family.
    '--dsw-alias-button-primary-hover': { light: lightPalette.hover, dark: darkPalette.hover },
    // The ink printed on that fill, and the "on" Switch thumb.
    '--dsw-alias-label-primary-foreground': { light: lightPalette.onAccent, dark: darkPalette.onAccent },
    '--dsw-alias-tooltip-bg': { light: lightPalette.tooltipBg, dark: darkPalette.tooltipBg },
    // Ghost and outline buttons, rows, badges: every hover and press wash the
    // shell paints, re-hued onto the accent at DSH's own alpha.
    '--dsw-alias-interactive-bg-hover': { light: lightPalette.hoverOverlay, dark: darkPalette.hoverOverlay },
    '--dsw-alias-interactive-bg-active': { light: lightPalette.activeOverlay, dark: darkPalette.activeOverlay },
  }
}

/**
 * The same layer as CSS, for the fallback used when the client exposes no
 * `theme.overrideTokens`. DSH declares its aliases on `body`, so the light block
 * rides on `:root` (a pseudo-class outranks it) and the dark block adds
 * `html[data-ds-dark-theme] body` to outrank `body[data-ds-dark-theme]`
 * regardless of where the injected sheet lands in the cascade.
 */
export function buildAccentCss(light: StaticMap, dark: StaticMap): string {
  const overrides = accentOverrides(light, dark)
  const names = Object.keys(overrides)
  if (names.length === 0) return ''
  const block = (selector: string, mode: Mode) =>
    `${selector} {\n${names.map((name) => `  ${name}: ${overrides[name][mode]};`).join('\n')}\n}`
  return `${block(':root, body', 'light')}\n\n${block('html[data-ds-dark-theme] body, body[data-ds-dark-theme]', 'dark')}`
}
