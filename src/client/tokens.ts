/**
 * Token projection: preset palette -> DSH theme-token overrides.
 */

import { PRESETS, type PresetId } from './presets.js'
import { hexLum, pickCodeBlockColors } from './colors.js'

type Palette = {
  base: string
  l1: string
  l2: string
  l3: string
  overlay: string
  b1: string
  b2: string
  brand: string
  lp: string
  ls: string
  err: string
  ok: string
  warn: string
  side: string
}

function brightest(...colors: string[]) {
  let best = colors[0]
  let max = -1
  for (const c of colors) {
    const l = hexLum(c)
    if (l > max) {
      max = l
      best = c
    }
  }
  return best
}

export function aliasCss(p: Palette) {
  const m: Record<string, string> = {}
  const base = (p as any).base ?? p.l1
  const isLight = hexLum(base) > 128

  m['--dsw-alias-bg-base'] = base
  m['--dsw-alias-bg-layer-1'] = p.l1
  m['--dsw-alias-bg-layer-2'] = p.l2
  m['--dsw-alias-bg-layer-3'] = p.l3
  m['--dsw-alias-bg-mask-1'] = base + '3d'
  m['--dsw-alias-bg-mask-2'] = base + '1f'
  m['--dsw-alias-bg-mask-3'] = base + '7a'
  m['--dsw-alias-bg-mask-photo'] = '#000000e0'
  m['--dsw-alias-bg-mask-drop'] = base + 'b3'
  m['--dsw-alias-bg-module-platform'] = isLight ? p.l1 : p.l3
  m['--dsw-alias-bg-multi-select'] = isLight ? p.l1 : p.l3
  m['--dsw-alias-bg-overlay'] = p.l2
  m['--dsw-alias-bg-skeleton'] = p.b1 + '0a'
  m['--dsw-alias-border-inverted2'] = '#0000'
  m['--dsw-alias-border-inverted'] = '#0000'
  m['--dsw-alias-border-l1'] = p.b1
  m['--dsw-alias-border-l2-darkmode-thin'] = p.b2
  m['--dsw-alias-border-l2'] = p.b2
  m['--dsw-alias-border-l3'] = p.b2
  m['--dsw-alias-border-l4'] = p.b2
  m['--dsw-alias-brand-primary-invert'] = p.lp
  m['--dsw-alias-brand-primary-new-colorprimary-new-color'] = p.brand
  m['--dsw-alias-brand-primary'] = p.brand
  m['--dsw-alias-brand-text'] = p.brand
  m['--dsw-alias-button-contrast-fill'] = p.lp
  m['--dsw-alias-button-elevated-fill'] = isLight ? base : p.l2
  m['--dsw-alias-button-floating-fill'] = isLight ? base : p.l2
  m['--dsw-alias-button-floating-hover'] = isLight ? p.l2 : p.l3
  m['--dsw-alias-button-ghost-active-border'] = p.b1
  m['--dsw-alias-button-ghost-active-fill'] = p.l2
  m['--dsw-alias-button-ghost-active-hover'] = p.l3
  m['--dsw-alias-button-info-fill'] = p.brand
  m['--dsw-alias-button-info-hover'] = p.brand
  m['--dsw-alias-button-primary-dimmed'] = p.l2
  m['--dsw-alias-button-primary-fill'] = p.brand
  m['--dsw-alias-button-primary-hover'] = p.lp
  m['--dsw-alias-button-tool-bar-fill-invisible'] = p.l2 + '5c'
  m['--dsw-alias-button-tool-bar-fill'] = p.b1 + '80'
  m['--dsw-alias-button-tool-bar-hover'] = p.b1 + '99'

  const interactiveHover = isLight ? p.l3 : p.b2
  const interactiveActive = isLight ? p.b2 : p.l3
  m['--dsw-alias-interactive-bg-active'] = interactiveActive
  m['--dsw-alias-interactive-bg-hover-accent'] = p.brand + '14'
  m['--dsw-alias-interactive-bg-hover-danger'] = p.err + '14'
  m['--dsw-alias-interactive-bg-hover-solid'] = interactiveHover
  m['--dsw-alias-interactive-bg-hover'] = interactiveHover
  m['--dsw-alias-label-caption'] = p.lp + '99'
  m['--dsw-alias-label-dimmed'] = p.b1
  m['--dsw-alias-label-primary-bluish'] = p.brand
  m['--dsw-alias-label-primary-dimmed'] = p.lp
  m['--dsw-alias-label-primary-foreground'] = base
  m['--dsw-alias-label-primary-inverted'] = base
  m['--dsw-alias-label-primary'] = p.lp
  m['--dsw-alias-label-secondary'] = p.ls
  m['--dsw-alias-label-tertiary'] = p.ls
  m['--dsw-alias-markdown-citation'] = p.l3
  const code = pickCodeBlockColors(p)
  m['--dsw-alias-markdown-code-block-banner'] = code.banner
  m['--dsw-alias-markdown-code-block'] = code.block
  m['--dsw-alias-markdown-code-segment-selected'] = p.l2
  m['--dsw-alias-markdown-code-segment-unselected'] = p.l3
  m['--dsw-alias-markdown-inline-code'] = p.l3
  m['--dsw-alias-markdown-placeholder'] = p.b1
  m['--dsw-alias-markdown-tag'] = p.l3
  m['--dsw-alias-scrollbar-bg-l1'] = p.b1
  m['--dsw-alias-scrollbar-bg-l2'] = p.b2
  m['--dsw-alias-scrollbar-hover-l1'] = p.b2
  m['--dsw-alias-scrollbar-hover-l2'] = p.b2
  m['--dsw-alias-state-business-primary'] = p.brand
  m['--dsw-alias-state-business-tertiary'] = p.brand + '20'
  m['--dsw-alias-state-error-primary'] = p.err
  m['--dsw-alias-state-error-secondary'] = p.err
  m['--dsw-alias-state-success-primary'] = p.ok
  m['--dsw-alias-state-success-secondary'] = p.ok
  m['--dsw-alias-state-success-tertiary'] = p.ok + '20'
  m['--dsw-alias-state-warn-label'] = p.warn
  m['--dsw-alias-state-warn-primary'] = p.warn
  m['--dsw-alias-state-warn-secondary'] = p.warn
  m['--dsw-alias-state-warn-tertiary'] = p.warn + '20'
  m['--dsw-alias-toast-bg'] = isLight ? base : p.l3
  m['--dsw-cool-theme-toast-bg'] = isLight ? base : p.l3
  m['--dsw-cool-theme-toast-fg'] = p.lp
  m['--dsw-cool-theme-toast-border'] = p.b1
  m['--dsw-alias-tooltip-bg'] = isLight ? p.l3 : brightest(p.l3, p.b2)
  m['--dsw-specific-bubble-highlight'] = p.brand + '30'
  m['--dsw-specific-bubble'] = p.brand + '15'
  m['--dsw-specific-input-major'] = isLight ? base : p.l1
  m['--dsw-specific-login-input'] = p.l1
  m['--dsw-specific-menu'] = p.l2
  m['--dsw-specific-selector'] = isLight ? p.l1 : p.l3
  m['--dsw-specific-sidebar-fill'] = p.l1
  m['--dsw-specific-sidebar-nav-item-hover'] = p.l3
  m['--dsw-specific-sidebar-nav-item-active'] = p.l3
  m['--dsw-specific-sidebar-nav-item-active-accent'] = p.brand + '20'
  m['--dsw-specific-tip'] = p.l1
  return m
}

export function staticCss(p: Palette) {
  const m: Record<string, string> = {}
  const base = (p as any).base ?? p.l1
  m['--dsw-static-neutral-bluish-00'] = p.lp
  m['--dsw-static-neutral-bluish-50'] = p.lp
  m['--dsw-static-neutral-bluish-60'] = p.l3
  m['--dsw-static-neutral-bluish-75'] = p.l3
  m['--dsw-static-neutral-bluish-100'] = p.ls
  m['--dsw-static-neutral-bluish-150'] = p.ls
  m['--dsw-static-neutral-bluish-200'] = p.b1
  m['--dsw-static-neutral-bluish-300'] = p.b1
  m['--dsw-static-neutral-bluish-400'] = p.b1
  m['--dsw-static-neutral-bluish-500'] = p.b2
  m['--dsw-static-neutral-bluish-600'] = p.b2
  m['--dsw-static-neutral-bluish-700'] = p.l2
  m['--dsw-static-neutral-bluish-750'] = p.l2
  m['--dsw-static-neutral-bluish-800'] = p.l2
  m['--dsw-static-neutral-bluish-850'] = p.l1
  m['--dsw-static-neutral-bluish-875'] = p.l1
  m['--dsw-static-neutral-bluish-900'] = p.l1
  m['--dsw-static-neutral-bluish-950'] = base
  m['--dsw-static-neutral-bluish-1000'] = base
  for (const k of ['100', '200', '300', '400', '450', '500', '600', '800', '900']) {
    m[`--dsw-static-deepseek-${k}`] = p.brand
    m[`--dsw-static-blue-${k}`] = p.brand
  }
  m['--dsw-static-deepseek-50'] = p.brand + '15'
  m['--dsw-static-blue-50'] = p.brand + '15'
  m['--dsw-static-blue-50p'] = p.brand + '15'
  m['--dsw-static-blue-75'] = p.brand + '20'
  m['--dsw-static-green-100'] = p.ok + '20'
  m['--dsw-static-green-400'] = p.ok
  m['--dsw-static-green-500'] = p.ok
  m['--dsw-static-green-900'] = p.ok + '30'
  m['--dsw-static-amber-100'] = p.warn + '20'
  m['--dsw-static-amber-400'] = p.warn
  m['--dsw-static-amber-500'] = p.warn
  m['--dsw-static-amber-600'] = p.warn
  m['--dsw-static-amber-900'] = p.warn + '30'
  m['--dsw-static-red-50'] = p.err + '15'
  m['--dsw-static-red-100'] = p.err + '20'
  m['--dsw-static-red-400'] = p.err
  m['--dsw-static-red-500'] = p.err
  m['--dsw-static-red-600'] = p.err
  m['--dsw-static-red-900'] = p.err + '30'
  m['--dsw-static-neutral-00'] = p.lp
  m['--dsw-static-neutral-50'] = p.lp
  m['--dsw-static-neutral-100'] = p.ls
  m['--dsw-static-neutral-150'] = p.ls
  m['--dsw-static-neutral-200'] = p.b1
  m['--dsw-static-neutral-250'] = p.b1
  m['--dsw-static-neutral-300'] = p.b1
  m['--dsw-static-neutral-400'] = p.b1
  m['--dsw-static-neutral-500'] = p.b2
  m['--dsw-static-neutral-550'] = p.b2
  m['--dsw-static-neutral-600'] = p.b2
  m['--dsw-static-neutral-700'] = p.l2
  m['--dsw-static-neutral-800'] = p.l2
  m['--dsw-static-neutral-850'] = p.l1
  m['--dsw-static-neutral-900'] = base
  m['--dsw-static-neutral-1000'] = base
  return m
}

// Shiki token table keyed by palette object identity
const SHIKI_TABLE = new Map<object, Record<string, string>>(
  [
    [PRESETS.nord.light, { constant: '#2e6ea6', string: '#3d7a1f', comment: '#6c7a8e', keyword: '#8b4a9a', parameter: '#9a5d2e', function: '#2f6f8a', stringExpression: '#3d7a1f', punctuation: '#4c566a', link: '#5e81ac' }],
    [PRESETS.nord.dark, { constant: '#8be9fd', string: '#a3be8c', comment: '#6272a4', keyword: '#ff79c6', parameter: '#d08770', function: '#88c0d0', stringExpression: '#a3be8c', punctuation: '#8ca0b8', link: '#88c0d0' }],
    [PRESETS.onedark.light, { constant: '#0b7ea4', string: '#1f7a3a', comment: '#76808f', keyword: '#a626a4', parameter: '#986801', function: '#4078f2', stringExpression: '#1f7a3a', punctuation: '#5c6370', link: '#4078f2' }],
    [PRESETS.onedark.dark, { constant: '#56b6c2', string: '#98c379', comment: '#7f848e', keyword: '#c678dd', parameter: '#d19a66', function: '#61afef', stringExpression: '#98c379', punctuation: '#abb2bf', link: '#61afef' }],
    [PRESETS.github.light, { constant: '#0550ae', string: '#0a3069', comment: '#6e7781', keyword: '#cf222e', parameter: '#953800', function: '#8250df', stringExpression: '#1a7f37', punctuation: '#656d76', link: '#0969da' }],
    [PRESETS.github.dark, { constant: '#79c0ff', string: '#a5d6ff', comment: '#8b949e', keyword: '#ff7b72', parameter: '#ffa657', function: '#d2a8ff', stringExpression: '#7ee787', punctuation: '#8b949e', link: '#58a6ff' }],
    [PRESETS.catppuccin.light, { constant: '#0b7ec8', string: '#1a7a3a', comment: '#7a7f8e', keyword: '#8839ef', parameter: '#fe640b', function: '#1e66f5', stringExpression: '#1a7a3a', punctuation: '#5c5f77', link: '#1e66f5' }],
    [PRESETS.catppuccin.dark, { constant: '#89dceb', string: '#a6e3a1', comment: '#6c7086', keyword: '#cba6f7', parameter: '#fab387', function: '#89b4fa', stringExpression: '#a6e3a1', punctuation: '#bac2de', link: '#89b4fa' }],
    [PRESETS.dracula.light, { constant: '#6a3fb5', string: '#1a7a3a', comment: '#6d7a9e', keyword: '#a21caf', parameter: '#b45309', function: '#7c3aed', stringExpression: '#1a7a3a', punctuation: '#44475a', link: '#7c3aed' }],
    [PRESETS.dracula.dark, { constant: '#8be9fd', string: '#50fa7b', comment: '#6272a4', keyword: '#ff79c6', parameter: '#ffb86c', function: '#bd93f9', stringExpression: '#50fa7b', punctuation: '#f8f8f2', link: '#bd93f9' }],
    [PRESETS.tokyonight.light, { constant: '#0f4b6e', string: '#1a7a3a', comment: '#6e7a9e', keyword: '#8c4351', parameter: '#965027', function: '#34548a', stringExpression: '#1a7a3a', punctuation: '#5a638c', link: '#34548a' }],
    [PRESETS.tokyonight.dark, { constant: '#7dcfff', string: '#9ece6a', comment: '#565f89', keyword: '#bb9af7', parameter: '#ff9e64', function: '#7aa2f7', stringExpression: '#9ece6a', punctuation: '#c0caf5', link: '#7aa2f7' }],
    [PRESETS.solarized.light, { constant: '#2aa198', string: '#586e75', comment: '#93a1a1', keyword: '#859900', parameter: '#cb4b16', function: '#268bd2', stringExpression: '#2aa198', punctuation: '#657b83', link: '#268bd2' }],
    [PRESETS.solarized.dark, { constant: '#2aa198', string: '#859900', comment: '#586e75', keyword: '#268bd2', parameter: '#cb4b16', function: '#b58900', stringExpression: '#2aa198', punctuation: '#93a1a1', link: '#268bd2' }],
    [PRESETS.gruvbox.light, { constant: '#076678', string: '#79740e', comment: '#928374', keyword: '#9d0006', parameter: '#af3a03', function: '#076678', stringExpression: '#79740e', punctuation: '#504945', link: '#076678' }],
    [PRESETS.gruvbox.dark, { constant: '#83a598', string: '#b8bb26', comment: '#928374', keyword: '#fb4934', parameter: '#fe8019', function: '#fabd2f', stringExpression: '#b8bb26', punctuation: '#ebdbb2', link: '#83a598' }],
    [PRESETS.monokai.light, { constant: '#6b42a0', string: '#2a7a2a', comment: '#8a8a8a', keyword: '#c4265e', parameter: '#b45a00', function: '#6b42a0', stringExpression: '#2a7a2a', punctuation: '#5b5956', link: '#6b42a0' }],
    [PRESETS.monokai.dark, { constant: '#ab9df2', string: '#a9dc76', comment: '#7a7978', keyword: '#ff6188', parameter: '#fc9867', function: '#78dce8', stringExpression: '#a9dc76', punctuation: '#fcfcfa', link: '#ab9df2' }],
    [PRESETS.rosepine.light, { constant: '#56949f', string: '#286983', comment: '#9893a5', keyword: '#907aa9', parameter: '#b4637a', function: '#907aa9', stringExpression: '#286983', punctuation: '#575279', link: '#907aa9' }],
    [PRESETS.rosepine.dark, { constant: '#9ccfd8', string: '#ebbcba', comment: '#6e6a86', keyword: '#c4a7e7', parameter: '#eb6f92', function: '#e0def4', stringExpression: '#ebbcba', punctuation: '#e0def4', link: '#c4a7e7' }],
    [PRESETS.ayu.light, { constant: '#55b4d4', string: '#86b300', comment: '#a8b0bb', keyword: '#fa8d3e', parameter: '#f07171', function: '#55b4d4', stringExpression: '#86b300', punctuation: '#5c6773', link: '#55b4d4' }],
    [PRESETS.ayu.dark, { constant: '#39bae6', string: '#7fd962', comment: '#5c6773', keyword: '#ffb454', parameter: '#ff8f40', function: '#59e1ff', stringExpression: '#7fd962', punctuation: '#c5cddb', link: '#39bae6' }],
    [PRESETS.zenburn.light, { constant: '#2b6f6f', string: '#8c3333', comment: '#7a8a7a', keyword: '#705040', parameter: '#8f5a00', function: '#2b6f6f', stringExpression: '#8c3333', punctuation: '#5f6f5f', link: '#2b6f6f' }],
    [PRESETS.zenburn.dark, { constant: '#8cd0d3', string: '#cc9393', comment: '#7f9f7f', keyword: '#f0dfaf', parameter: '#d0bf8f', function: '#8cd0d3', stringExpression: '#cc9393', punctuation: '#dcdccc', link: '#8cd0d3' }],
  ] as unknown as [object, Record<string, string>][],
)

const SHIKI_FALLBACK = { constant: '#0550ae', string: '#1a7f37', comment: '#6e7781', keyword: '#cf222e', parameter: '#953800', function: '#8250df', stringExpression: '#1a7f37', punctuation: '#656d76', link: '#0969da' }

export function shikiCss(p: Palette) {
  const m: Record<string, string> = {}
  m['--shiki-foreground'] = p.lp
  m['--shiki-background'] = pickCodeBlockColors(p).block
  const t = SHIKI_TABLE.get(p) ?? SHIKI_FALLBACK
  m['--shiki-token-constant'] = t.constant
  m['--shiki-token-string'] = t.string
  m['--shiki-token-comment'] = t.comment
  m['--shiki-token-keyword'] = t.keyword
  m['--shiki-token-parameter'] = t.parameter
  m['--shiki-token-function'] = t.function
  m['--shiki-token-string-expression'] = t.stringExpression
  m['--shiki-token-punctuation'] = t.punctuation
  m['--shiki-token-link'] = t.link
  return m
}

function getTokenMaps(id: PresetId) {
  const preset = PRESETS[id as keyof typeof PRESETS]
  return {
    lightAlias: aliasCss(preset.light),
    darkAlias: aliasCss(preset.dark),
    lightStat: staticCss(preset.light),
    darkStat: staticCss(preset.dark),
    lightShiki: shikiCss(preset.light),
    darkShiki: shikiCss(preset.dark),
  }
}

export function buildOverrides(id: PresetId): Record<string, { light: string; dark: string }> {
  if (id === 'native') return {}
  const { lightAlias, darkAlias, lightStat, darkStat, lightShiki, darkShiki } = getTokenMaps(id)
  const overrides: Record<string, { light: string; dark: string }> = {}
  const add = (a: Record<string, string>, b: Record<string, string>) => {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      overrides[k] = { light: a[k] ?? b[k], dark: b[k] ?? a[k] }
    }
  }
  add(lightAlias, darkAlias)
  add(lightStat, darkStat)
  add(lightShiki, darkShiki)
  return overrides
}

// CSS fallback when overrideTokens is unavailable (older shell)
export function buildFullCssFallback(id: PresetId) {
  if (id === 'native') return ''
  const { lightAlias, darkAlias, lightStat, darkStat, lightShiki, darkShiki } = getTokenMaps(id)
  const block = (map: Record<string, string>) => Object.entries(map).map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `:root{\n${block(lightStat)}\n${block(lightAlias)}\n${block(lightShiki)}\n}\nbody[data-ds-dark-theme]{\n${block(darkStat)}\n${block(darkAlias)}\n${block(darkShiki)}\n}`
}
