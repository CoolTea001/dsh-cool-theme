/**
 * Custom theme: a `PresetDef` generated at runtime from a small set of seeds.
 *
 * The colour maths is deliberately IDENTICAL to the shipped presets — the same
 * `buildScale` / `buildSemanticScales` helpers with the same steps and weights,
 * and the same `t = step / 1000` interpolation. A custom theme is therefore not
 * a special case: it produces a complete 73-primitive + 9-shiki map that flows
 * through `resolvePreset` -> `primitiveOverrides` unchanged. The one structural
 * difference is the neutral ramp, which is built per appearance (see below).
 *
 * Seed groups (7):
 *   neutral  merged `--dsw-static-neutral-bluish-*` + `--dsw-static-neutral-*`,
 *            one ramp PER appearance
 *   accent   merged `--dsw-static-deepseek-*` + `--dsw-static-blue-*`
 *   green / amber / red
 *   border   DSH's border ladder, derived from one seed (l1 is the seed)
 *   shiki    9 syntax tokens
 */

import type { StaticMap } from './css/primitives.js'
import { PRIMITIVES_LIGHT, PRIMITIVES_DARK } from './css/primitives.js'
import type { PresetDef } from './presets.js'
import type { ThemeAppearance, ThemeAsset, ThemeBackground, ThemeBackgroundSide } from '../contract.js'
import { isRecord, normalizeBackground } from '../contract.js'
import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './presets/_helpers.js'

export type { PresetDef }

/** The contract names the light/dark axis; the editor has always called it `Mode`. */
export type Mode = ThemeAppearance

/** One seed colour per appearance. */
export type SeedPair = { light: string; dark: string }

/** The nine `--shiki-token-*` slots, in stylesheet order. */
export const SHIKI_KEYS = [
  'constant',
  'string',
  'comment',
  'keyword',
  'parameter',
  'function',
  'string-expression',
  'punctuation',
  'link',
] as const
export type ShikiKey = (typeof SHIKI_KEYS)[number]

/** The two endpoints of ONE appearance's neutral ramp: step 00 and step 1000. */
export type NeutralRamp = { lightest: string; darkest: string }

/**
 * The border seed. Unlike every other seed it is an overlay rather than a solid
 * fill, so it carries an opaque base colour plus an opacity percentage (0–100).
 * It publishes DSH's whole border ladder: `--dsw-alias-border-l1` is exactly
 * this seed and the stronger levels are derived from it (see
 * {@link borderTokens}).
 */
export type BorderSeed = { color: string; alpha: number }

/** Everything a user can edit. 2*2 + 4*2 + 9*2 = 30 colours, plus 2 borders. */
export type CustomTheme = {
  /**
   * One neutral ramp PER appearance. DSH's alias layer picks a different step
   * per appearance — light reads step 00 for surfaces and step 1000 for text,
   * dark reads step 950 for surfaces and step 50 for text — so a ramp shared by
   * both appearances ties light text to dark surfaces and cannot be tuned. Each
   * ramp still runs lightest -> darkest; only the endpoints are per-appearance.
   *
   * Presets keep the single shared ramp they were authored with; only the
   * runtime-generated custom theme splits it.
   */
  neutral: Record<Mode, NeutralRamp>
  /** `--dsw-static-deepseek-*` and `--dsw-static-blue-*` share this base. */
  accent: SeedPair
  green: SeedPair
  amber: SeedPair
  red: SeedPair
  /** Border colour and opacity per appearance; only l1 is the seed, the rest are derived. */
  border: Record<Mode, BorderSeed>
  shiki: Record<ShikiKey, SeedPair>
}

/** Seed values used when a source preset cannot supply one (e.g. the no-op `dsh`). */
const SHIKI_FALLBACK: Record<Mode, Record<ShikiKey, string>> = {
  light: {
    constant: '#1C7ED6',
    string: '#2F9E44',
    comment: '#868E96',
    keyword: '#D6336C',
    parameter: '#E8590C',
    function: '#6741D9',
    'string-expression': '#2B8A3E',
    punctuation: '#495057',
    link: '#1971C2',
  },
  dark: {
    constant: '#4DABF7',
    string: '#69DB7C',
    comment: '#ADB5BD',
    keyword: '#FAA2C1',
    parameter: '#FFA94D',
    function: '#B197FC',
    'string-expression': '#8CE99A',
    punctuation: '#CED4DA',
    link: '#74C0FC',
  },
}

const HEX = /^#([0-9a-f]{3,8})$/i
const RGB_FN = /^rgba?\(([^)]*)\)$/i
const HSL_FN = /^hsla?\(([^)]*)\)$/i

/**
 * DSH's own `--dsw-alias-border-l1`: a 4% black hairline in light and a 6% white
 * one in dark. A fresh custom theme starts here, so turning custom mode on
 * leaves the borders exactly as the shell paints them until the seed is moved.
 */
export const DEFAULT_BORDER: Record<Mode, BorderSeed> = {
  light: { color: '#000000', alpha: 4 },
  dark: { color: '#FFFFFF', alpha: 6 },
}

/**
 * The border levels a seed drives, in DSH's order of increasing strength. `thin`
 * is not a fifth step: it is the level DSH thins in dark mode.
 */
type BorderLevel = 'l2' | 'l3' | 'l4' | 'thin'

/**
 * How far above the seed each derived level sits, in percentage points — DSH's
 * own spacing. Its light ladder runs 4 / 10 / 12 / 16 and its dark one
 * 6 / 12 / 16 / 20, so these offsets reproduce the shipped values exactly at the
 * default seed while letting one picker move every level together.
 *
 * `thin` tracks l2 where DSH does not thin it (light) and collapses onto l1
 * where it does (dark), which is exactly how the shell's pair is authored.
 */
const BORDER_ALPHA_STEPS: Record<Mode, Record<BorderLevel, number>> = {
  light: { l2: 6, l3: 8, l4: 12, thin: 6 },
  dark: { l2: 6, l3: 10, l4: 14, thin: 0 },
}

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** An opacity percentage, folded into the 0–100 the seed stores. */
const clampAlpha = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/** Accepts both `a, b, c` and the modern `a b c / d` argument syntax. */
function fnArgs(body: string): string[] {
  return body
    .replace(/\//g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean)
}

/** A colour channel: `128` or a percentage. Returns null for anything else. */
function channel(token: string): number | null {
  const pct = token.endsWith('%')
  const v = parseFloat(pct ? token.slice(0, -1) : token)
  if (!Number.isFinite(v)) return null
  return pct ? (v / 100) * 255 : v
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [clamp255(f(0) * 255), clamp255(f(8) * 255), clamp255(f(4) * 255)]
}

const toRgbHex = (rgb: number[]) =>
  '#' + rgb.map((n) => clamp255(n).toString(16).padStart(2, '0')).join('').toUpperCase()

/**
 * Parse a colour into `#RRGGBB`, or null when it is not a format we understand.
 *
 * Accepted: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb()`/`rgba()` with
 * numbers or percentages, and `hsl()`/`hsla()`. Alpha is parsed but dropped:
 * every seed stores an opaque colour, and the one overlay — the border — keeps
 * its opacity in a field of its own.
 *
 * `primitives.ts` stores `rgb(r, g, b)` while presets store hex, so both shapes
 * have to work; the extra forms are there for what users may type.
 */
export function tryToHex(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const s = input.trim()
  if (!s) return null

  const hex = s.match(HEX)
  if (hex) {
    const d = hex[1]
    const twice = (c: string) => c + c
    if (d.length === 3 || d.length === 4) return `#${twice(d[0])}${twice(d[1])}${twice(d[2])}`.toUpperCase()
    if (d.length === 6 || d.length === 8) return `#${d.slice(0, 6)}`.toUpperCase()
    return null
  }

  const rgbFn = s.match(RGB_FN)
  if (rgbFn) {
    const parts = fnArgs(rgbFn[1])
    if (parts.length < 3) return null
    const [r, g, b] = parts.slice(0, 3).map(channel)
    if (r === null || g === null || b === null) return null
    return toRgbHex([r, g, b])
  }

  const hslFn = s.match(HSL_FN)
  if (hslFn) {
    const parts = fnArgs(hslFn[1])
    if (parts.length < 3) return null
    const h = parseFloat(parts[0].replace(/deg$/i, ''))
    const sat = parseFloat(parts[1])
    const lig = parseFloat(parts[2])
    if (![h, sat, lig].every(Number.isFinite)) return null
    return toRgbHex(hslToRgb((((h % 360) + 360) % 360), clamp01(sat / 100), clamp01(lig / 100)))
  }

  return null
}

/** `tryToHex` with a black fallback, for call sites that need a guaranteed value. */
export function toHex(input: unknown): string {
  return tryToHex(input) ?? '#000000'
}

/** A stored opacity: a finite number folded into 0–100, anything else the fallback. */
function pickAlpha(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? clampAlpha(value) : fallback
}

/**
 * One border alias value, at the seed's own opacity or an override of it.
 *
 * Written as `rgba()` rather than an 8-digit hex because the seed stores the
 * opacity as a percentage and `rgba()` is the form DSH's own border tokens take.
 */
export function borderCss(seed: BorderSeed, alpha: number = seed.alpha): string {
  const hex = toHex(seed.color)
  const channel = (from: number) => parseInt(hex.slice(from, from + 2), 16)
  return `rgba(${channel(1)}, ${channel(3)}, ${channel(5)}, ${clampAlpha(alpha) / 100})`
}

/**
 * Every border alias one seed publishes, under DSH's own names. Typed rather
 * than a bare map so a level cannot go missing from the ladder unnoticed.
 */
export type BorderTokens = {
  '--dsw-alias-border-l1': string
  '--dsw-alias-border-l2': string
  '--dsw-alias-border-l3': string
  '--dsw-alias-border-l4': string
  '--dsw-alias-border-l2-darkmode-thin': string
}

/**
 * The whole border ladder, from one seed. l1 is the seed itself and every
 * stronger level is the same hue at DSH's own spacing above it, so a single
 * picker moves sidebars, tab bars, cards and buttons together, and a stronger
 * level can never end up weaker than a subtler one. The alpha is clamped, so a
 * near-opaque seed flattens the top of the ladder instead of overflowing it.
 */
export function borderTokens(mode: Mode, seed: BorderSeed): BorderTokens {
  const step = BORDER_ALPHA_STEPS[mode]
  return {
    '--dsw-alias-border-l1': borderCss(seed),
    '--dsw-alias-border-l2': borderCss(seed, seed.alpha + step.l2),
    '--dsw-alias-border-l3': borderCss(seed, seed.alpha + step.l3),
    '--dsw-alias-border-l4': borderCss(seed, seed.alpha + step.l4),
    '--dsw-alias-border-l2-darkmode-thin': borderCss(seed, seed.alpha + step.thin),
  }
}

function readSeed(map: StaticMap, fallback: StaticMap, key: string): string {
  return toHex(map[key] ?? fallback[key])
}

/**
 * Recover the seed inputs from an already-generated preset.
 *
 * Exact by construction: `buildScale` writes the `start`/`end` arguments to
 * steps 00/1000, and `buildTintShadeScale` writes the base to step 500. This is
 * what lets a user start from any preset without re-declaring its palette.
 */
export function extractSeeds(base: PresetDef): CustomTheme {
  const seed = (key: string, mode: Mode): string =>
    readSeed(mode === 'light' ? base.light : base.dark, mode === 'light' ? PRIMITIVES_LIGHT : PRIMITIVES_DARK, key)

  const pair = (key: string): SeedPair => ({ light: seed(key, 'light'), dark: seed(key, 'dark') })

  /** Both ends of one appearance's ramp, read from that appearance's map. */
  const ramp = (mode: Mode): NeutralRamp => ({
    lightest: seed('--dsw-static-neutral-bluish-00', mode),
    darkest: seed('--dsw-static-neutral-bluish-1000', mode),
  })

  const shiki = SHIKI_KEYS.reduce<Record<ShikiKey, SeedPair>>((acc, k) => {
    const cssKey = `--shiki-token-${k}`
    acc[k] = {
      light: toHex(base.light[cssKey] ?? SHIKI_FALLBACK.light[k]),
      dark: toHex(base.dark[cssKey] ?? SHIKI_FALLBACK.dark[k]),
    }
    return acc
  }, {} as Record<ShikiKey, SeedPair>)

  return {
    // A preset ships the same ramp in both maps, so reading each map for its
    // own ramp reproduces that preset exactly — while the custom editor can now
    // move the two ramps apart.
    neutral: { light: ramp('light'), dark: ramp('dark') },
    accent: pair('--dsw-static-deepseek-500'),
    green: pair('--dsw-static-green-500'),
    amber: pair('--dsw-static-amber-500'),
    red: pair('--dsw-static-red-500'),
    // No preset ships a border token — DSH's own pair lives in its base
    // stylesheets, not in the `--dsw-static-*` scales — so the seed starts from
    // the shipped default, per appearance. Copied rather than referenced, so a
    // draft can never write back into the module constant.
    border: { light: { ...DEFAULT_BORDER.light }, dark: { ...DEFAULT_BORDER.dark } },
    shiki,
  }
}

/**
 * Bump when the `CustomTheme` shape changes so old blobs can be migrated.
 * v2 split the neutral ramp per appearance; v3 added the border seed. Older
 * blobs stay readable: a v1/v2 theme simply starts from the shipped border
 * default, which is what it was already rendering.
 */
export const CUSTOM_SCHEMA_VERSION = 3

/** Every stored version this build still reads; anything else is foreign data. */
const READABLE_SCHEMA_VERSIONS: readonly number[] = [1, 2, CUSTOM_SCHEMA_VERSION]

/** Self-contained stored form: records the preset the seeds were derived from. */
export type CustomEnvelope = { v: number; base: string; theme: unknown }

export function encodeCustom(base: string, theme: CustomTheme): string {
  return JSON.stringify({ v: CUSTOM_SCHEMA_VERSION, base, theme } satisfies CustomEnvelope)
}

/** Parse a stored blob. Returns null for absent/corrupt/foreign-version data. */
export function parseEnvelope(raw: string | null): CustomEnvelope | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    const version = parsed.v
    if (typeof version !== 'number' || !READABLE_SCHEMA_VERSIONS.includes(version)) return null
    return { v: CUSTOM_SCHEMA_VERSION, base: String(parsed.base ?? ''), theme: parsed.theme }
  } catch {
    return null
  }
}

/** Pre-v2 shape: the single neutral ramp shared by both appearances. */
type LegacyNeutral = { neutralLightest?: unknown; neutralDarkest?: unknown }

/**
 * The neutral seeds in the current shape. A pre-v2 blob carried one ramp shared
 * by both appearances; repeating it per appearance reproduces exactly what that
 * blob rendered before the split, so existing themes migrate without a visible
 * change.
 */
function neutralSeeds(src: Partial<CustomTheme> & LegacyNeutral): Partial<Record<Mode, unknown>> {
  if (isRecord(src.neutral)) return src.neutral as Partial<Record<Mode, unknown>>
  const shared: Record<string, unknown> = { lightest: src.neutralLightest, darkest: src.neutralDarkest }
  return { light: shared, dark: shared }
}

/** Repair a partially-invalid object against `fallback`, keeping every valid colour. */
export function normalizeCustom(raw: unknown, fallback: CustomTheme): CustomTheme {
  const src = (raw ?? {}) as Partial<CustomTheme> & LegacyNeutral
  const pick = (value: unknown, fb: string): string => tryToHex(value) ?? fb
  const pickPair = (value: unknown, fb: SeedPair): SeedPair => {
    const v = (value ?? {}) as Partial<SeedPair>
    return { light: pick(v.light, fb.light), dark: pick(v.dark, fb.dark) }
  }
  const pickRamp = (value: unknown, fb: NeutralRamp): NeutralRamp => {
    const v = (value ?? {}) as Partial<NeutralRamp>
    return { lightest: pick(v.lightest, fb.lightest), darkest: pick(v.darkest, fb.darkest) }
  }
  const pickBorder = (value: unknown, fb: BorderSeed): BorderSeed => {
    const v = (value ?? {}) as Partial<BorderSeed>
    return { color: pick(v.color, fb.color), alpha: pickAlpha(v.alpha, fb.alpha) }
  }

  const shikiSrc = (src.shiki ?? {}) as Partial<Record<ShikiKey, Partial<SeedPair>>>
  const shiki = SHIKI_KEYS.reduce<Record<ShikiKey, SeedPair>>((acc, k) => {
    acc[k] = pickPair(shikiSrc[k], fallback.shiki[k])
    return acc
  }, {} as Record<ShikiKey, SeedPair>)

  const neutral = neutralSeeds(src)

  return {
    neutral: {
      light: pickRamp(neutral.light, fallback.neutral.light),
      dark: pickRamp(neutral.dark, fallback.neutral.dark),
    },
    accent: pickPair(src.accent, fallback.accent),
    green: pickPair(src.green, fallback.green),
    amber: pickPair(src.amber, fallback.amber),
    red: pickPair(src.red, fallback.red),
    border: {
      light: pickBorder(src.border?.light, fallback.border.light),
      dark: pickBorder(src.border?.dark, fallback.border.dark),
    },
    shiki,
  }
}

/**
 * Turn seeds into a full `PresetDef` using the presets' own helpers.
 *
 * Unlike the presets (which ship one ramp for both appearances), the ramp is
 * built once per appearance, so the light text and the dark text are no longer
 * the two ends of the same colour axis.
 *
 * The border aliases are the one set of tokens a seed publishes directly
 * instead of through a `--dsw-static-*` ramp: DSH keeps its border levels as
 * alpha overlays in the base stylesheets, so they have no scale to hang off.
 */
export function buildCustomPreset(v: CustomTheme): PresetDef {
  /** One appearance's ramp, published under both prefixes DSH reads from. */
  const ramp = (mode: Mode): StaticMap => {
    const { lightest, darkest } = v.neutral[mode]
    return {
      ...buildScale('--dsw-static-neutral-bluish', lightest, darkest, BLUISH_STEPS),
      ...buildScale('--dsw-static-neutral', lightest, darkest, NEUTRAL_STEPS),
    }
  }

  const semantic = (mode: Mode): StaticMap =>
    buildSemanticScales({
      deepseek: v.accent[mode],
      blue: v.accent[mode],
      green: v.green[mode],
      amber: v.amber[mode],
      red: v.red[mode],
    })

  const shiki = (mode: Mode): StaticMap => {
    const out: StaticMap = {}
    for (const k of SHIKI_KEYS) out[`--shiki-token-${k}`] = v.shiki[k][mode]
    return out
  }

  /** Every border alias, derived from this appearance's one border seed. */
  const border = (mode: Mode): StaticMap => borderTokens(mode, v.border[mode])

  return {
    label: 'Custom',
    light: { ...ramp('light'), ...semantic('light'), ...border('light'), ...shiki('light') },
    dark: { ...ramp('dark'), ...semantic('dark'), ...border('dark'), ...shiki('dark') },
  }
}

// ---------------------------------------------------------------------------
// Saved custom themes (the list under the editor)
// ---------------------------------------------------------------------------

/** A named custom theme the user saved. */
export type SavedTheme = {
  id: string
  name: string
  /** Preset the seeds derive from; used for the "reset" fallback. */
  base: string
  theme: CustomTheme
  /**
   * Media stored beside the seeds. Only the background image uses it today, but
   * the list is carried through every rewrite so a later media user cannot drop
   * a file the theme still references.
   */
  assets: ThemeAsset[]
  /** The wallpaper this theme carries, or null when it has none. */
  background: ThemeBackground | null
}

/** Structural equality of one appearance's wallpaper. */
function sameBackgroundSide(a: ThemeBackgroundSide, b: ThemeBackgroundSide): boolean {
  return a.asset === b.asset && a.enabled === b.enabled && a.opacity === b.opacity && a.blur === b.blur
}

/**
 * Structural equality of two backgrounds, for the editor's dirty comparison.
 * A pending upload is tracked separately by the panel; this compares only what
 * would be written to the document. Each appearance is compared on its own, so
 * editing the dark image cannot leave the light one looking dirty.
 */
export function sameBackground(a: ThemeBackground | null, b: ThemeBackground | null): boolean {
  if (a === null || b === null) return a === b
  return sameBackgroundSide(a.light, b.light) && sameBackgroundSide(a.dark, b.dark)
}

/** Serialize the saved list with its schema version. */
export function encodeList(list: SavedTheme[]): string {
  return JSON.stringify({ v: CUSTOM_SCHEMA_VERSION, items: list })
}

/**
 * Parse the saved list. Entries with a corrupt theme are repaired against
 * `fallbackFor(base)` rather than dropped, so one bad record cannot lose the
 * rest of the list; only structurally unusable entries are skipped.
 */
export function decodeList(
  raw: string | null,
  fallbackFor: (base: string) => CustomTheme,
): SavedTheme[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      !isRecord(parsed)
      || typeof parsed.v !== 'number'
      || !READABLE_SCHEMA_VERSIONS.includes(parsed.v)
      || !Array.isArray(parsed.items)
    ) {
      return []
    }
    const out: SavedTheme[] = []
    for (const item of parsed.items) {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') continue
      const base = typeof item.base === 'string' ? item.base : ''
      out.push({
        id: item.id,
        name: item.name,
        base,
        theme: normalizeCustom(item.theme, fallbackFor(base)),
        assets: Array.isArray(item.assets) ? (item.assets as ThemeAsset[]) : [],
        background: normalizeBackground(item.background),
      })
    }
    return out
  } catch {
    return []
  }
}

/** `${base} 1`, `${base} 2`, … skipping names already taken. */
export function nextThemeName(base: string, taken: string[]): string {
  const used = new Set(taken)
  for (let n = 1; ; n++) {
    const candidate = `${base} ${n}`
    if (!used.has(candidate)) return candidate
  }
}