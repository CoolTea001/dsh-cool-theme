/**
 * Custom theme: a `PresetDef` generated at runtime from a small set of seeds.
 *
 * The colour maths is deliberately IDENTICAL to the shipped presets — the same
 * `buildScale` / `buildSemanticScales` helpers with the same steps and weights,
 * and the same `t = step / 1000` interpolation. A custom theme is therefore not
 * a special case: it produces a complete 73-primitive + 9-shiki map that flows
 * through `resolvePreset` -> `primitiveOverrides` unchanged.
 *
 * Seed groups (6):
 *   neutral  merged `--dsw-static-neutral-bluish-*` + `--dsw-static-neutral-*`
 *   accent   merged `--dsw-static-deepseek-*` + `--dsw-static-blue-*`
 *   green / amber / red
 *   shiki    9 syntax tokens
 */

import type { StaticMap } from './css/primitives.js'
import { PRIMITIVES_LIGHT, PRIMITIVES_DARK } from './css/primitives.js'
import type { PresetDef } from './presets.js'
import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './presets/_helpers.js'

export type { PresetDef }

export type Mode = 'light' | 'dark'

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

/** Everything a user can edit. 2 + 4*2 + 9*2 = 28 colours. */
export type CustomTheme = {
  /**
   * Endpoints of the ONE neutral ramp shared by both appearances, matching how
   * presets call `buildScale`. They are the ramp's lightest and darkest values,
   * not the light/dark background colours themselves: DSH reads step 00 for the
   * light `bg-base` and step 950 for the dark one.
   */
  neutralLightest: string
  neutralDarkest: string
  /** `--dsw-static-deepseek-*` and `--dsw-static-blue-*` share this base. */
  accent: SeedPair
  green: SeedPair
  amber: SeedPair
  red: SeedPair
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

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

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
 * numbers or percentages, and `hsl()`/`hsla()`. Alpha is parsed but dropped —
 * every token these seeds drive is an opaque theme colour.
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
    const rgb = parts.slice(0, 3).map(channel)
    if (rgb.some((n) => n === null)) return null
    return toRgbHex(rgb as number[])
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

  const shiki = SHIKI_KEYS.reduce<Record<ShikiKey, SeedPair>>((acc, k) => {
    const cssKey = `--shiki-token-${k}`
    const lightMap = base.light as Record<string, string | undefined>
    const darkMap = base.dark as Record<string, string | undefined>
    acc[k] = {
      light: toHex(lightMap[cssKey] ?? SHIKI_FALLBACK.light[k]),
      dark: toHex(darkMap[cssKey] ?? SHIKI_FALLBACK.dark[k]),
    }
    return acc
  }, {} as Record<ShikiKey, SeedPair>)

  return {
    neutralLightest: seed('--dsw-static-neutral-bluish-00', 'light'),
    neutralDarkest: seed('--dsw-static-neutral-bluish-1000', 'dark'),
    accent: pair('--dsw-static-deepseek-500'),
    green: pair('--dsw-static-green-500'),
    amber: pair('--dsw-static-amber-500'),
    red: pair('--dsw-static-red-500'),
    shiki,
  }
}

/** Bump when the `CustomTheme` shape changes so old blobs can be migrated. */
export const CUSTOM_SCHEMA_VERSION = 1

/** Self-contained stored form: records the preset the seeds were derived from. */
export type CustomEnvelope = { v: number; base: string; theme: unknown }

export function encodeCustom(base: string, theme: CustomTheme): string {
  return JSON.stringify({ v: CUSTOM_SCHEMA_VERSION, base, theme } satisfies CustomEnvelope)
}

/** Parse a stored blob. Returns null for absent/corrupt/foreign-version data. */
export function parseEnvelope(raw: string | null): CustomEnvelope | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<CustomEnvelope>
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.v !== CUSTOM_SCHEMA_VERSION) return null
    return { v: CUSTOM_SCHEMA_VERSION, base: String(parsed.base ?? ''), theme: parsed.theme }
  } catch {
    return null
  }
}

/** Repair a partially-invalid object against `fallback`, keeping every valid colour. */export function normalizeCustom(raw: unknown, fallback: CustomTheme): CustomTheme {
  const src = (raw ?? {}) as Partial<CustomTheme>
  const pick = (value: unknown, fb: string): string => tryToHex(value) ?? fb
  const pickPair = (value: unknown, fb: SeedPair): SeedPair => {
    const v = (value ?? {}) as Partial<SeedPair>
    return { light: pick(v.light, fb.light), dark: pick(v.dark, fb.dark) }
  }

  const shikiSrc = (src.shiki ?? {}) as Partial<Record<ShikiKey, Partial<SeedPair>>>
  const shiki = SHIKI_KEYS.reduce<Record<ShikiKey, SeedPair>>((acc, k) => {
    acc[k] = pickPair(shikiSrc[k], fallback.shiki[k])
    return acc
  }, {} as Record<ShikiKey, SeedPair>)

  return {
    neutralLightest: pick(src.neutralLightest, fallback.neutralLightest),
    neutralDarkest: pick(src.neutralDarkest, fallback.neutralDarkest),
    accent: pickPair(src.accent, fallback.accent),
    green: pickPair(src.green, fallback.green),
    amber: pickPair(src.amber, fallback.amber),
    red: pickPair(src.red, fallback.red),
    shiki,
  }
}

/**
 * Turn seeds into a full `PresetDef` using the presets' own helpers.
 *
 * The neutral ramp is built once and shared by both appearances, exactly as
 * 30 of the 34 shipped presets do.
 */
export function buildCustomPreset(v: CustomTheme): PresetDef {
  const neutral: StaticMap = {
    ...buildScale('--dsw-static-neutral-bluish', v.neutralLightest, v.neutralDarkest, BLUISH_STEPS),
    ...buildScale('--dsw-static-neutral', v.neutralLightest, v.neutralDarkest, NEUTRAL_STEPS),
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

  return {
    label: 'Custom',
    light: { ...neutral, ...semantic('light'), ...shiki('light') },
    dark: { ...neutral, ...semantic('dark'), ...shiki('dark') },
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
}

/** Collision-resistant enough for a local list, and stable across reloads. */
export function newThemeId(): string {
  return `ct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

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
    const parsed = JSON.parse(raw) as { v?: number; items?: unknown }
    if (!parsed || parsed.v !== CUSTOM_SCHEMA_VERSION || !Array.isArray(parsed.items)) return []
    const out: SavedTheme[] = []
    for (const item of parsed.items) {
      const e = item as Partial<SavedTheme>
      if (typeof e?.id !== 'string' || typeof e?.name !== 'string') continue
      const base = typeof e.base === 'string' ? e.base : ''
      out.push({ id: e.id, name: e.name, base, theme: normalizeCustom(e.theme, fallbackFor(base)) })
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
