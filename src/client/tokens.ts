import { PRESETS, type PresetId } from './presets.js'
import { PRIMITIVES_LIGHT, PRIMITIVES_DARK, buildPrimitivesCss, primitiveOverrides } from './css/primitives.js'
import { SHIKI_CSS } from './css/shiki.js'

export function buildBaseCss(): string {
  return `${buildPrimitivesCss()}\n\n${SHIKI_CSS}`
}

const NOOP_PRESETS = new Set<PresetId>(['native', 'dsh'])

function aliasMaps(light: Record<string, string>, dark: Record<string, string>) {
  const pick = (k: string, fallback: string) => light[k] ?? fallback
  const pickDark = (k: string, fallback: string) => dark[k] ?? fallback
  // Core label aliases — derived from static 1000/500 so text follows preset
  const lightAlias: Record<string, string> = {
    '--dsw-alias-label-primary': pick('--dsw-static-neutral-bluish-1000', pick('--dsw-static-neutral-1000', '')),
    '--dsw-alias-label-primary-inverted': pick('--dsw-static-neutral-bluish-00', pick('--dsw-static-neutral-00', '')),
    '--dsw-alias-label-primary-foreground': pick('--dsw-static-neutral-bluish-00', pick('--dsw-static-neutral-00', '')),
    '--dsw-alias-label-secondary': pick('--dsw-static-neutral-bluish-500', pick('--dsw-static-neutral-500', '')),
    '--dsw-alias-label-tertiary': pick('--dsw-static-neutral-bluish-600', pick('--dsw-static-neutral-600', pick('--dsw-static-neutral-bluish-500', ''))),
    '--dsw-alias-label-caption': pick('--dsw-static-neutral-bluish-500', pick('--dsw-static-neutral-500', '')),
    '--dsw-alias-label-dimmed': pick('--dsw-static-neutral-400', ''),
    '--dsw-alias-bg-base': pick('--dsw-static-neutral-bluish-00', pick('--dsw-static-neutral-00', '')),
    '--dsw-alias-bg-layer-1': pick('--dsw-static-neutral-bluish-50', pick('--dsw-static-neutral-50', '')),
    '--dsw-alias-bg-layer-2': pick('--dsw-static-neutral-bluish-100', pick('--dsw-static-neutral-100', '')),
    '--dsw-alias-bg-layer-3': pick('--dsw-static-neutral-bluish-75', pick('--dsw-static-neutral-75', '')),
    '--dsw-alias-bg-module-platform': pick('--dsw-static-neutral-bluish-50', pick('--dsw-static-neutral-50', '')),
    '--dsw-alias-border-l1': pick('--dsw-static-neutral-200', ''),
    '--dsw-alias-border-l2': pick('--dsw-static-neutral-300', ''),
    '--dsw-alias-border-l3': pick('--dsw-static-neutral-400', ''),
  }
  const darkAlias: Record<string, string> = {
    '--dsw-alias-label-primary': pickDark('--dsw-static-neutral-bluish-1000', pickDark('--dsw-static-neutral-1000', '')),
    '--dsw-alias-label-primary-inverted': pickDark('--dsw-static-neutral-bluish-00', pickDark('--dsw-static-neutral-00', '')),
    '--dsw-alias-label-primary-foreground': pickDark('--dsw-static-neutral-bluish-00', pickDark('--dsw-static-neutral-00', '')),
    '--dsw-alias-label-secondary': pickDark('--dsw-static-neutral-bluish-500', pickDark('--dsw-static-neutral-500', '')),
    '--dsw-alias-label-tertiary': pickDark('--dsw-static-neutral-bluish-600', pickDark('--dsw-static-neutral-600', pickDark('--dsw-static-neutral-bluish-500', ''))),
    '--dsw-alias-label-caption': pickDark('--dsw-static-neutral-bluish-500', pickDark('--dsw-static-neutral-500', '')),
    '--dsw-alias-label-dimmed': pickDark('--dsw-static-neutral-400', ''),
    '--dsw-alias-bg-base': pickDark('--dsw-static-neutral-bluish-00', pickDark('--dsw-static-neutral-00', '')),
    '--dsw-alias-bg-layer-1': pickDark('--dsw-static-neutral-bluish-50', pickDark('--dsw-static-neutral-50', '')),
    '--dsw-alias-bg-layer-2': pickDark('--dsw-static-neutral-bluish-100', pickDark('--dsw-static-neutral-100', '')),
    '--dsw-alias-bg-layer-3': pickDark('--dsw-static-neutral-bluish-75', pickDark('--dsw-static-neutral-75', '')),
    '--dsw-alias-bg-module-platform': pickDark('--dsw-static-neutral-bluish-50', pickDark('--dsw-static-neutral-50', '')),
    '--dsw-alias-border-l1': pickDark('--dsw-static-neutral-200', ''),
    '--dsw-alias-border-l2': pickDark('--dsw-static-neutral-300', ''),
    '--dsw-alias-border-l3': pickDark('--dsw-static-neutral-400', ''),
  }
  // Filter out empty
  for (const k of Object.keys(lightAlias)) if (!lightAlias[k]) delete lightAlias[k]
  for (const k of Object.keys(darkAlias)) if (!darkAlias[k]) delete darkAlias[k]
  return { lightAlias, darkAlias }
}

export function buildOverrides(id: PresetId): Record<string, { light: string; dark: string }> {
  if (NOOP_PRESETS.has(id)) return {}
  const preset = PRESETS[id as keyof typeof PRESETS]
  if (!preset) return {}
  const light = { ...PRIMITIVES_LIGHT, ...preset.light }
  const dark = { ...PRIMITIVES_DARK, ...preset.dark }
  const { lightAlias, darkAlias } = aliasMaps(light, dark)
  const mergedLight = { ...light, ...lightAlias }
  const mergedDark = { ...dark, ...darkAlias }
  return primitiveOverrides(mergedLight, mergedDark)
}

export function buildFullCssFallback(id: PresetId): string {
  if (NOOP_PRESETS.has(id)) return ''
  const preset = PRESETS[id as keyof typeof PRESETS]
  if (!preset) return ''
  const light = { ...PRIMITIVES_LIGHT, ...preset.light }
  const dark = { ...PRIMITIVES_DARK, ...preset.dark }
  const { lightAlias, darkAlias } = aliasMaps(light, dark)
  const fullLight = { ...light, ...lightAlias }
  const fullDark = { ...dark, ...darkAlias }
  const toBlock = (m: Record<string, string>) => Object.entries(m).map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `:root{\n${toBlock(fullLight)}\n}\nhtml[data-ds-dark-theme], body[data-ds-dark-theme]{\n${toBlock(fullDark)}\n}`
}
