/**
 * Helpers for preset color scale generation.
 * Uses the same linear RGB interpolation as scripts/interpolate-colors.ts
 */

export const BLUISH_STEPS = [0, 50, 60, 75, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 875, 900, 950, 1000] as const

export const NEUTRAL_STEPS = [0, 50, 100, 150, 200, 250, 300, 400, 500, 550, 600, 700, 800, 850, 900, 1000] as const

/** Semantic steps — kept identical to original hand-picked presets for compatibility */
export const DEEPSEEK_STEPS = [50, 100, 200, 300, 400, 450, 500, 600, 800, 900] as const
export const BLUE_STEPS = [50, 100, 300, 400, 450, 500, 600, 800, 900] as const
export const BLUE_EXTRA_STEPS = ['50p', '75', '950'] as const
export const GREEN_STEPS = [100, 400, 500, 900] as const
export const AMBER_STEPS = [100, 400, 500, 600, 900] as const
export const RED_STEPS = [50, 100, 400, 500, 600, 900] as const

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, '')
  if (clean.length !== 6) throw new Error(`Invalid hex color: ${hex}`)
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ]
}

function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => Math.round(v).toString(16).padStart(2, '0').toUpperCase())
  return `#${r}${g}${b}`
}

/**
 * Linearly interpolate between two colors (RGB space, same as scripts/interpolate-colors.ts)
 * @param colorStart color at scale 0, e.g. "#FAFAFA"
 * @param colorEnd   color at scale 1000, e.g. "#0D1017"
 * @param steps      array of scales to compute
 * @returns map of scale -> hex color
 */
export function interpolateColors(colorStart: string, colorEnd: string, steps: readonly number[]): Record<number, string> {
  const start = hexToRgb(colorStart)
  const end = hexToRgb(colorEnd)
  const diffR = end[0] - start[0]
  const diffG = end[1] - start[1]
  const diffB = end[2] - start[2]
  const result: Record<number, string> = {}
  for (const step of steps) {
    const t = step / 1000
    let r = Math.round(start[0] + diffR * t)
    let g = Math.round(start[1] + diffG * t)
    let b = Math.round(start[2] + diffB * t)
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))
    result[step] = rgbToHex([r, g, b])
  }
  return result
}

/**
 * Build CSS variable map for a neutral scale
 * e.g. prefix '--dsw-static-neutral-bluish', start '#FAFAFA', end '#0D1017'
 * -> { '--dsw-static-neutral-bluish-00': '#FAFAFA', '--dsw-static-neutral-bluish-50': '...' }
 */
export function buildScale(prefix: string, start: string, end: string, steps: readonly number[]): Record<string, string> {
  const colors = interpolateColors(start, end, steps)
  const map: Record<string, string> = {}
  for (const step of steps) {
    const key = step === 0 ? `${prefix}-00` : `${prefix}-${step}`
    map[key] = colors[step]
  }
  return map
}

// ---------------------------------------------------------------------------
// Semantic helpers — same `interpolateColors` primitive, but via tints/shades
// ---------------------------------------------------------------------------

/** Mix two colors linearly in RGB. weight 0 -> colorA, 1 -> colorB */
function mix(colorA: string, colorB: string, weight: number): string {
  const a = hexToRgb(colorA)
  const b = hexToRgb(colorB)
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex([a[0] * (1 - w) + b[0] * w, a[1] * (1 - w) + b[1] * w, a[2] * (1 - w) + b[2] * w])
}

/**
 * Semantic weight maps — tuned to approximate the original hand-picked palettes
 * while staying deterministic. Light steps (<500) are tints (white -> base),
 * dark steps (>500) are shades (base -> black). Values are intentionally
 * shared across all presets for consistency; per-preset drift vs. hand-picked
 * is typically <= 8 per channel.
 */
const DEEPSEEK_WEIGHTS: Record<number, number> = {
  50: 0.08,
  100: 0.15,
  200: 0.32,
  300: 0.52,
  400: 0.78,
  450: 0.88,
  500: 1,
  600: 0.82, // shade: base -> black
  800: 0.55,
  900: 0.35,
}

const BLUE_WEIGHTS: Record<number, number> = {
  50: 0.08,
  100: 0.15,
  300: 0.52,
  400: 0.78,
  450: 0.88,
  500: 1,
  600: 0.82,
  800: 0.55,
  900: 0.35,
}

const BLUE_EXTRA_WEIGHTS: Record<string, number> = {
  '50p': 0.1,
  '75': 0.12,
  '950': 0.25,
}

const GREEN_WEIGHTS: Record<number, number> = {
  100: 0.15,
  400: 0.78,
  500: 1,
  900: 0.35,
}

const AMBER_WEIGHTS: Record<number, number> = {
  100: 0.15,
  400: 0.78,
  500: 1,
  600: 0.82,
  900: 0.35,
}

const RED_WEIGHTS: Record<number, number> = {
  50: 0.08,
  100: 0.15,
  400: 0.78,
  500: 1,
  600: 0.82,
  900: 0.35,
}

function buildTintShadeScale(
  prefix: string,
  base: string,
  steps: readonly (number | string)[],
  weights: Record<string | number, number>,
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const step of steps) {
    const w = weights[step as string]
    if (w === undefined) continue
    // 500 is the base itself; >500 and '950' are shades (base → black), the rest are tints (white → base)
    const isShade = (typeof step === 'number' && step > 500) || step === '950'
    const color =
      step === 500 || step === '500'
        ? base.toUpperCase()
        : isShade
          ? mix('#000000', base, w)
          : mix('#FFFFFF', base, w)
    map[`${prefix}-${step}`] = color
  }
  return map
}

export function buildDeepseekScale(base: string): Record<string, string> {
  return buildTintShadeScale('--dsw-static-deepseek', base, DEEPSEEK_STEPS, DEEPSEEK_WEIGHTS)
}

export function buildBlueScale(base: string): Record<string, string> {
  const main = buildTintShadeScale('--dsw-static-blue', base, BLUE_STEPS, BLUE_WEIGHTS)
  const extra = buildTintShadeScale('--dsw-static-blue', base, BLUE_EXTRA_STEPS, BLUE_EXTRA_WEIGHTS)
  return { ...main, ...extra }
}

export function buildGreenScale(base: string): Record<string, string> {
  return buildTintShadeScale('--dsw-static-green', base, GREEN_STEPS, GREEN_WEIGHTS)
}

export function buildAmberScale(base: string): Record<string, string> {
  return buildTintShadeScale('--dsw-static-amber', base, AMBER_STEPS, AMBER_WEIGHTS)
}

export function buildRedScale(base: string): Record<string, string> {
  return buildTintShadeScale('--dsw-static-red', base, RED_STEPS, RED_WEIGHTS)
}

/** Convenience: build all semantic scales from 5 base colors (500 values) */
export function buildSemanticScales(opts: {
  deepseek: string
  blue: string
  green: string
  amber: string
  red: string
}): Record<string, string> {
  return {
    ...buildDeepseekScale(opts.deepseek),
    ...buildBlueScale(opts.blue),
    ...buildGreenScale(opts.green),
    ...buildAmberScale(opts.amber),
    ...buildRedScale(opts.red),
    // deepseek-700-delete is an alias of 600 with ~0.85 shade; keep for compat
    '--dsw-static-deepseek-700-delete': mix('#000000', opts.deepseek, 0.7),
  }
}
