import { PRESETS, type PresetId } from './presets.js'
import { PRIMITIVES_LIGHT, PRIMITIVES_DARK, buildPrimitivesCss, primitiveOverrides } from './css/primitives.js'
import { SHIKI_CSS } from './css/shiki.js'

export function buildBaseCss(): string {
  return `${buildPrimitivesCss()}\n\n${SHIKI_CSS}`
}

const NOOP_PRESETS = new Set<PresetId>(['native', 'dsh'])

function resolvePreset(id: PresetId) {
  if (NOOP_PRESETS.has(id)) return null
  const preset = PRESETS[id as keyof typeof PRESETS]
  if (!preset) return null
  return {
    light: { ...PRIMITIVES_LIGHT, ...preset.light },
    dark: { ...PRIMITIVES_DARK, ...preset.dark },
  }
}

export function buildOverrides(id: PresetId): Record<string, { light: string; dark: string }> {
  const resolved = resolvePreset(id)
  if (!resolved) return {}
  return primitiveOverrides(resolved.light, resolved.dark)
}

export function buildFullCssFallback(id: PresetId): string {
  const resolved = resolvePreset(id)
  if (!resolved) return ''
  const toBlock = (m: Record<string, string>) =>
    Object.entries(m)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')
  return `:root{\n${toBlock(resolved.light)}\n}\nhtml[data-ds-dark-theme], body[data-ds-dark-theme]{\n${toBlock(resolved.dark)}\n}`
}
