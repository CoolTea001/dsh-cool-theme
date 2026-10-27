import { PRESETS, NOOP_PRESET_IDS, isBuiltinPresetId, type PresetId, type PresetDef } from './presets.js'
import { PRIMITIVES_LIGHT, PRIMITIVES_DARK, buildPrimitivesCss, primitiveOverrides } from './css/primitives.js'
import { accentOverrides, buildAccentCss } from './css/accents.js'
import { SHIKI_CSS } from './css/shiki.js'

export function buildBaseCss(): string {
  return `${buildPrimitivesCss()}\n\n${SHIKI_CSS}`
}

/**
 * Accepts either a preset id or an already-built `PresetDef` (what a custom
 * theme produces). Both go through the identical merge, so a custom theme is
 * not a special case anywhere downstream.
 */
export function resolvePreset(src: PresetId | PresetDef) {
  let preset: PresetDef | null
  if (typeof src === 'string') {
    if (NOOP_PRESET_IDS.has(src)) return null
    preset = isBuiltinPresetId(src) ? PRESETS[src] : null
  } else {
    preset = src
  }
  if (!preset) return null
  return {
    light: { ...PRIMITIVES_LIGHT, ...preset.light },
    dark: { ...PRIMITIVES_DARK, ...preset.dark },
  }
}

/**
 * Every token a theme publishes, in one layer: the primitive ramps it retints,
 * plus the alias tokens that move DSH's interactive components onto the theme's
 * accent (see css/accents.ts). The accent goes last so it wins over any alias a
 * custom theme's own map happens to carry.
 */
export function buildOverrides(src: PresetId | PresetDef): Record<string, { light: string; dark: string }> {
  const resolved = resolvePreset(src)
  if (!resolved) return {}
  return {
    ...primitiveOverrides(resolved.light, resolved.dark),
    ...accentOverrides(resolved.light, resolved.dark),
  }
}

export function buildFullCssFallback(src: PresetId | PresetDef): string {
  const resolved = resolvePreset(src)
  if (!resolved) return ''
  return `${buildPrimitivesCss(resolved.light, resolved.dark)}\n\n${buildAccentCss(resolved.light, resolved.dark)}`
}
