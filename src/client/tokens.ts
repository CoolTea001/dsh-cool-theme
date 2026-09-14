import { PRESETS, type PresetId, type PresetDef } from './presets.js'
import { PRIMITIVES_LIGHT, PRIMITIVES_DARK, buildPrimitivesCss, primitiveOverrides } from './css/primitives.js'
import { SHIKI_CSS } from './css/shiki.js'

export function buildBaseCss(): string {
  return `${buildPrimitivesCss()}\n\n${SHIKI_CSS}`
}

const NOOP_PRESETS = new Set<PresetId>(['native', 'dsh'])

/**
 * Accepts either a preset id or an already-built `PresetDef` (what a custom
 * theme produces). Both go through the identical merge, so a custom theme is
 * not a special case anywhere downstream.
 */
export function resolvePreset(src: PresetId | PresetDef) {
  let preset: PresetDef | null
  if (typeof src === 'string') {
    if (NOOP_PRESETS.has(src)) return null
    preset = PRESETS[src as keyof typeof PRESETS] ?? null
  } else {
    preset = src
  }
  if (!preset) return null
  return {
    light: { ...PRIMITIVES_LIGHT, ...preset.light },
    dark: { ...PRIMITIVES_DARK, ...preset.dark },
  }
}

export function buildOverrides(src: PresetId | PresetDef): Record<string, { light: string; dark: string }> {
  const resolved = resolvePreset(src)
  if (!resolved) return {}
  return primitiveOverrides(resolved.light, resolved.dark)
}

export function buildFullCssFallback(src: PresetId | PresetDef): string {
  const resolved = resolvePreset(src)
  if (!resolved) return ''
  const toBlock = (m: Record<string, string>) =>
    Object.entries(m)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')
  return `:root{\n${toBlock(resolved.light)}\n}\nhtml[data-ds-dark-theme], body[data-ds-dark-theme]{\n${toBlock(resolved.dark)}\n}`
}
