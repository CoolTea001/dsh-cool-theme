import * as React from 'react'
import {
  THEME_STORAGE_KEY,
  THEME_STORAGE_KEY_LEGACY,
  CUSTOM_THEME_STORAGE_KEY,
  CUSTOM_LIST_STORAGE_KEY,
  CUSTOM_ACTIVE_STORAGE_KEY,
} from '../contract.js'
import { PRESETS, type PresetId, type PresetDef } from './presets.js'
import { buildBaseCss, buildOverrides, buildFullCssFallback } from './tokens.js'
import { createStyleInjector } from './style-injector.js'
import { ThemePanel, CUSTOM_SELECTION, type Selection, type CustomState } from './components.js'
import {
  type CustomTheme,
  type SavedTheme,
  buildCustomPreset,
  encodeCustom,
  encodeList,
  decodeList,
  extractSeeds,
  newThemeId,
  nextThemeName,
  normalizeCustom,
  parseEnvelope,
} from './custom.js'
import { zh, en, type ThemeKey } from './locales.js'

const BASE_CSS = [
  '.ct-select{box-sizing:border-box;display:inline-flex;align-items:center;gap:12px;height:36px;padding:0 14px;border:none;border-radius:18px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;white-space:nowrap;width:auto;min-width:0;max-width:100%;}',
  '.ct-select:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-select:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-select-label{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}',
  '.ct-select-chevron{flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform 120ms ease;}',
  '.ct-select[aria-expanded="true"] .ct-select-chevron{transform:rotate(180deg);}',
  '.ct-menu-list{box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:0;border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);min-width:218px;max-width:360px;max-height:min(320px,50vh);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;scrollbar-gutter:stable;}',
  '.ct-menu-list:not(:hover){scrollbar-color:transparent transparent;}',
  '.ct-menu-list::-webkit-scrollbar{width:8px;height:8px;}',
  '.ct-menu-list::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:999px;border:2px solid var(--dsw-specific-menu);background-clip:content-box;transition:background 150ms ease, border-color 150ms ease;}',
  '.ct-menu-list::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-label-tertiary);border:2px solid var(--dsw-specific-menu);background-clip:content-box;}',
  '.ct-menu-list::-webkit-scrollbar-thumb:active{background:var(--dsw-alias-label-secondary, var(--dsw-alias-label-tertiary));border:2px solid var(--dsw-specific-menu);background-clip:content-box;}',
  '.ct-menu-list:not(:hover)::-webkit-scrollbar-thumb{background:transparent;border-color:transparent;}',
  '.ct-menu-list::-webkit-scrollbar-track{background:transparent;margin:4px 0;}',
  '.ct-menu-list::-webkit-scrollbar-corner{background:transparent;}',
  '.ct-menu-item{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:8px 10px;border:none;border-radius:10px;background:transparent;cursor:pointer;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);text-align:left;font-family:inherit;}',
  '.ct-menu-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-menu-check{flex:none;color:var(--dsw-alias-label-primary);display:inline-flex;margin-left:auto;}',
  '.ct-menu-item-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
  '.ct-row{border-bottom:1px solid var(--dsw-alias-border-l2);padding:16px 2px;display:flex;align-items:center;gap:16px;}',
  '.ct-row:last-child{border-bottom:none;}',
  '.ct-row-flush{border-bottom:none;}',
  '.ct-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-right:48px;}',
  '.ct-row-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;}',
  '.ct-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;}',
  '.ct-group{padding:8px 0px}',
  // The wrapper owns the outer border and the radius, and clips the grid to it.
  // Cells therefore draw only the inner rules.
  '.ct-table-wrap{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden;}',
  '.ct-table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);}',
  '.ct-table th,.ct-table td{border-right:1px solid var(--dsw-alias-border-l2);border-bottom:1px solid var(--dsw-alias-border-l2);padding:9px 14px;text-align:left;vertical-align:middle;}',
  '.ct-table th:last-child,.ct-table td:last-child{border-right:none;}',
  // Transparent rather than absent: the last row keeps its 1px border box so
  // every row measures the same, while the wrapper paints the bottom edge.
  '.ct-table tbody tr:last-child td{border-bottom-color:transparent;}',
  // Header shares the cells' colour, a 22px line box so the row is exactly as
  // tall as a body row (whose height comes from the 22px swatch), and a
  // distinct surface so it still reads as a header band.
  '.ct-table thead th{font-size:13px;line-height:22px;font-weight:600;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-2));}',
  '.ct-table tbody tr:hover{background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-table .ct-td-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
  '.ct-table .ct-td-color{width:152px;}',
  // Block-level flex: an inline-flex swatch would sit on the cell's text
  // baseline and pick up descender space, which would make body rows taller
  // than the header. A block box keeps every body row at exactly 22px + padding.
  '.ct-cell{display:flex;align-items:center;gap:6px;min-width:0;}',
  '.ct-cell-swatch{appearance:none;-webkit-appearance:none;flex:none;width:20px;height:20px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;cursor:pointer;}',
  '.ct-cell-swatch::-webkit-color-swatch-wrapper{padding:0px;}',
  '.ct-cell-swatch::-webkit-color-swatch{border:none;border-radius:4px;}',
  '.ct-cell-swatch::-moz-color-swatch{border:none;border-radius:4px;}',
  '.ct-cell-swatch:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-cell-text{flex:1 1 auto;min-width:0;box-sizing:border-box;height:22px;padding:0 6px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,var(--dsw-alias-label-tertiary));font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:20px;font-variant-numeric:tabular-nums;}',
  '.ct-cell-text:hover{border-color:var(--dsw-alias-border-l2);}',
  '.ct-cell-text:focus{outline:none;border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}',
  '.ct-actions{padding:16px 2px;display:flex;gap:12px;justify-content:flex-end;}',
  // Saved-theme list under the editor.
  '.ct-list{margin-top:4px;border-top:1px solid var(--dsw-alias-border-l2);}',
  '.ct-list-row{display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid var(--dsw-alias-border-l2);}',
  '.ct-list-row:last-child{border-bottom:none;}',
  '.ct-list-name{flex:1 1 auto;min-width:0;text-align:left;border:none;background:transparent;cursor:pointer;font:inherit;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:2px 0;}',
  // The name is clickable (loads the theme), so hover keeps a cue without a colour shift.
  '.ct-list-name:hover{text-decoration:underline;}',
  // Metrics match .ct-list-name on purpose: renaming should look like editing the
  // existing text, not like a form control appearing.
  '.ct-list-input{flex:1 1 auto;min-width:0;box-sizing:border-box;padding:2px 0;border:none;border-radius:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;}',
  '.ct-list-input:focus{outline:none;}',
  '.ct-list-actions{display:flex;align-items:center;gap:2px;flex:none;}',
  // High-contrast chip: inverting label-primary/bg-layer-3 stays readable in both
  // appearances, and does not depend on the accent the user happens to pick.
  '.ct-list-badge{font-size:11px;line-height:18px;font-weight:500;padding:0 8px;border-radius:9px;margin-right:6px;color:var(--dsw-alias-bg-layer-3,#fff);background:var(--dsw-alias-label-primary,#151517);}',
  '.ct-icon-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;}',
  // Tooltip bubble, matching DSH's icon-row `data-tip` pseudo-element.
  '.ct-icon-btn::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);padding:3px 8px;border-radius:6px;background:var(--dsw-alias-label-primary,#151517);color:var(--dsw-alias-bg-layer-3,#fff);font-size:11px;line-height:17px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;}',
  '.ct-icon-btn:hover::after,.ct-icon-btn:focus-visible::after{opacity:1;}',
  '.ct-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}',
  '.ct-icon-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-icon-btn-danger:hover{color:var(--dsw-static-red-500,rgb(239,68,68));}',
  // Confirm dialog, matching DSH's own Modal metrics.
  '.ct-modal-root{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;}',
  '.ct-modal-mask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,.24));backdrop-filter:var(--dsw-mask-blur,blur(2px));}',
  '.ct-modal-card{position:relative;z-index:1;display:flex;flex-direction:column;gap:12px;width:min(380px,100%);padding:24px;border-radius:24px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);}',
  '.ct-modal-title{font-size:16px;line-height:24px;font-weight:600;color:var(--dsw-alias-label-primary);}',
  '.ct-modal-desc{font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary);}',
  '.ct-modal-footer{display:flex;justify-content:flex-end;gap:12px;margin-top:12px;}',
  '.ct-switch{position:relative;flex:none;width:40px;height:24px;padding:0;border:none;border-radius:12px;background:var(--dsw-alias-border-l2);cursor:pointer;transition:background 150ms ease;}',
  '.ct-switch-on{background:var(--dsw-static-deepseek-500,rgb(65,118,230));}',
  '.ct-switch-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 150ms ease;}',
  '.ct-switch-on .ct-switch-knob{transform:translateX(16px);}',
  '.ct-switch:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-btn{box-sizing:border-box;display:inline-flex;align-items:center;height:34px;padding:0 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:17px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px;line-height:20px;}',
  '.ct-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  // Variants come after the base rule so equal-specificity overrides win.
  '.ct-btn-primary{background:var(--dsw-static-deepseek-500,rgb(65,118,230));border-color:transparent;color:#fff;}',
  '.ct-btn-primary:hover{background:var(--dsw-static-deepseek-450,var(--dsw-static-deepseek-500,rgb(86,134,254)));}',
  '.ct-btn-danger{background:var(--dsw-static-red-500,rgb(239,68,68));border-color:transparent;color:#fff;}',
  '.ct-btn-danger:hover{background:var(--dsw-static-red-600,var(--dsw-static-red-500,rgb(236,19,19)));}',
].join('\n')

const NOOP = new Set<PresetId>(['native', 'dsh'])

function isValidSelection(v: string | null): v is Selection {
  return !!v && (v === CUSTOM_SELECTION || NOOP.has(v as PresetId) || v in PRESETS)
}

function isPresetId(v: unknown): v is PresetId {
  return typeof v === 'string' && v in PRESETS
}

function presetDef(id: PresetId): PresetDef {
  return (PRESETS[id as keyof typeof PRESETS] ?? PRESETS.dsh) as PresetDef
}

export function registerTheme(ctx: any) {
  const slots = ctx.get('slots')
  const theme = ctx.get('theme')
  if (!slots) return

  const NS = 'cool-theme'
  const locale = ctx.get('locale')
  let t: (key: ThemeKey) => string = (key) => zh[key]
  if (locale) {
    ctx.effect(() => locale.register(NS, { zh, en }), 'dsh-cool-theme: theme dictionaries')
    t = locale.bind(NS)
  }

  const injector = createStyleInjector()
  const pluginCssDisposer = injector.insert(BASE_CSS)
  let baselineDisposer: (() => void) | null = null
  let overrideDispose: (() => void) | null = null
  let fallbackDispose: (() => void) | null = null

  const release = (fn: (() => void) | null) => {
    if (!fn) return null
    try {
      fn()
    } catch {}
    return null
  }

  function ensureBaseline(active: boolean) {
    if (active) {
      if (!baselineDisposer) baselineDisposer = injector.insert(buildBaseCss())
    } else if (baselineDisposer) {
      baselineDisposer = release(baselineDisposer)
    }
  }

  function getSelection(): Selection {
    for (const key of [THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY] as const) {
      try {
        const cur = localStorage.getItem(key)
        if (!isValidSelection(cur)) continue
        const normalized = cur === 'native' ? 'dsh' : (cur as Selection)
        if (cur !== normalized) {
          try {
            localStorage.setItem(THEME_STORAGE_KEY, normalized)
          } catch {}
        } else if (key === THEME_STORAGE_KEY_LEGACY) {
          try {
            localStorage.setItem(THEME_STORAGE_KEY, cur!)
          } catch {}
        }
        return normalized
      } catch {}
    }
    return 'dsh'
  }

  /** The preset the custom seeds derive from, restored from the stored blob. */
  function customBase(): PresetId {
    const env = parseEnvelope(readCustomRaw())
    if (env && isPresetId(env.base)) return env.base
    return lastPreset
  }

  function readCustomRaw(): string | null {
    try {
      return localStorage.getItem(CUSTOM_THEME_STORAGE_KEY)
    } catch {
      return null
    }
  }

  function loadCustom(): CustomState {
    const base = customBase()
    const fallback = extractSeeds(presetDef(base))
    const env = parseEnvelope(readCustomRaw())
    return { base, theme: normalizeCustom(env?.theme, fallback) }
  }

  function persistCustom(theme: CustomTheme) {
    try {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, encodeCustom(customBase(), theme))
    } catch {}
  }

  function apply(src: Selection | PresetDef) {
    overrideDispose = release(overrideDispose)
    fallbackDispose = release(fallbackDispose)

    const target: PresetId | PresetDef = src === CUSTOM_SELECTION ? buildCustomPreset(loadCustom().theme) : src

    if (typeof target === 'string' && NOOP.has(target)) {
      ensureBaseline(false)
      return
    }
    ensureBaseline(true)
    const overrides = buildOverrides(target)
    if (theme?.overrideTokens) {
      try {
        overrideDispose = theme.overrideTokens('dsh-cool-theme', overrides)
        return
      } catch {}
    }
    fallbackDispose = injector.insert(buildFullCssFallback(target))
  }

  function setSelection(id: Selection) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id)
    } catch {}
    if (id !== CUSTOM_SELECTION) lastPreset = id as PresetId
    apply(id)
  }

  function setCustom(next: CustomTheme) {
    persistCustom(next)
    apply(buildCustomPreset(next))
  }

  /**
   * Re-seed the custom theme from another preset while staying in custom mode.
   * Used when the preset picker changes with the custom switch already on, so
   * the switch stays on and the editor table picks up that preset's palette.
   */
  function rebaseCustom(nextBase: PresetId): CustomTheme {
    const next = extractSeeds(presetDef(nextBase))
    try {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, encodeCustom(nextBase, next))
    } catch {}
    lastPreset = nextBase
    apply(buildCustomPreset(next))
    return next
  }

  function resetCustom(): CustomTheme {
    const base = customBase()
    const theme = extractSeeds(presetDef(base))
    persistCustom(theme)
    apply(buildCustomPreset(theme))
    return theme
  }

  // --- saved custom themes -------------------------------------------------

  function readRaw(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  function writeRaw(key: string, value: string | null) {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch {}
  }

  const fallbackForBase = (base: string): CustomTheme =>
    extractSeeds(presetDef(isPresetId(base) ? base : lastPreset))

  const readList = () => decodeList(readRaw(CUSTOM_LIST_STORAGE_KEY), fallbackForBase)
  const writeList = (list: SavedTheme[]) => writeRaw(CUSTOM_LIST_STORAGE_KEY, encodeList(list))

  function readActiveId(): string | null {
    const id = readRaw(CUSTOM_ACTIVE_STORAGE_KEY)
    return id && readList().some((e) => e.id === id) ? id : null
  }

  /** Load a saved entry into the draft and make it the active theme. */
  function loadSaved(id: string): CustomTheme | null {
    const entry = readList().find((e) => e.id === id)
    if (!entry) return null
    if (isPresetId(entry.base)) lastPreset = entry.base
    writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id)
    writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(entry.base, entry.theme))
    apply(buildCustomPreset(entry.theme))
    return entry.theme
  }

  const saved = {
    list: readList,
    activeId: readActiveId,
    load: loadSaved,
    /** Update the active entry, or create one on the first save. */
    save(): SavedTheme[] {
      const draft = loadCustom()
      const list = readList()
      const active = readActiveId()
      if (active) {
        const next = list.map((e) => (e.id === active ? { ...e, base: draft.base, theme: draft.theme } : e))
        writeList(next)
        return next
      }
      const entry: SavedTheme = {
        id: newThemeId(),
        name: nextThemeName(t('custom.defaultName'), list.map((e) => e.name)),
        base: draft.base,
        theme: draft.theme,
      }
      const next = [...list, entry]
      writeList(next)
      writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id)
      return next
    },
    rename(id: string, name: string): SavedTheme[] {
      const next = readList().map((e) => (e.id === id ? { ...e, name } : e))
      writeList(next)
      return next
    },
    /** Copy an entry so the copy can be tweaked independently; the copy becomes active. */
    duplicate(id: string): CustomTheme | null {
      const list = readList()
      const src = list.find((e) => e.id === id)
      if (!src) return null
      const entry: SavedTheme = {
        id: newThemeId(),
        name: `${src.name} ${t('custom.copySuffix')}`,
        base: src.base,
        theme: src.theme,
      }
      writeList([...list, entry])
      return loadSaved(entry.id)
    },
    remove(id: string): SavedTheme[] {
      const next = readList().filter((e) => e.id !== id)
      writeList(next)
      if (readRaw(CUSTOM_ACTIVE_STORAGE_KEY) === id) writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, null)
      return next
    },
  }

  const initialSelection = getSelection()
  // Resolve the custom base without reading `lastPreset`, which is still being
  // initialised here (reading it would hit the temporal dead zone).
  let lastPreset: PresetId = initialSelection === CUSTOM_SELECTION ? 'dsh' : initialSelection
  if (initialSelection === CUSTOM_SELECTION) {
    const env = parseEnvelope(readCustomRaw())
    if (env && isPresetId(env.base)) lastPreset = env.base
  }

  apply(initialSelection)

  ctx.effect(() => () => {
    release(pluginCssDisposer)
    baselineDisposer = release(baselineDisposer)
    overrideDispose = release(overrideDispose)
    fallbackDispose = release(fallbackDispose)
    injector.disposeAll()
  })

  slots.inject('settings.section', () => {
    const options: any = { name: 'settings.section', id: 'cool-theme', order: 5, label: () => t('nav') }
    if (locale) options.locale = NS
    return slots.register(options, (props: any) =>
      React.createElement(ThemePanel, {
        t: props?.t ?? ((key: ThemeKey) => zh[key]),
        theme,
        getSelection,
        setSelection,
        getCustom: loadCustom,
        setCustom,
        rebaseCustom,
        resetCustom,
        saved,
      }),
    )
  })

  // Fix nav icon: settings panel uses a gear for unknown section ids. Replace it with a palette for the Theme section.
  const PALETTE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></g></svg>'

  let paletteObs: MutationObserver | null = null
  function patchThemeNavIcon() {
    if (typeof document === 'undefined') return
    // Resolve current label in both locales — nav label is locale-sensitive
    let currentLabel = ''
    try {
      currentLabel = t('nav')
    } catch {}
    const candidates = new Set<string>([currentLabel, zh.nav, en.nav].filter(Boolean) as string[])
    // Settings nav cells: hashed class is zOa2rq_navCell but match broadly for forward-compat
    const cells = document.querySelectorAll(
      '[class*="navCell"], button[class*="navCell"]',
    )
    const toPatch: Element[] = []
    if (cells.length > 0) {
      cells.forEach((c) => toPatch.push(c))
    } else {
      // Fallback: any button inside the settings nav
      document.querySelectorAll('[class*="nav"] button').forEach((b) => toPatch.push(b))
    }
    for (const cell of toPatch) {
      const labelEl = cell.querySelector('[class*="navLabel"]') || cell
      const text = (labelEl?.textContent || cell.textContent || '').trim()
      const isThemeCell = Array.from(candidates).some((lbl) => text === lbl || text.includes(lbl))
      if (!isThemeCell) continue
      // Already patched?
      if (cell.querySelector('[data-palette-icon]')) continue
      const svg = cell.querySelector('svg')
      if (!svg) continue
      // Hide gear and insert palette
      ;(svg as unknown as HTMLElement).style.display = 'none'
      svg.setAttribute('data-palette-hidden', '1')
      const holder = document.createElement('span')
      holder.setAttribute('data-palette-icon', '1')
      holder.style.display = 'inline-flex'
      holder.style.flex = 'none'
      holder.setAttribute('aria-hidden', 'true')
      holder.innerHTML = PALETTE_SVG
      svg.parentNode?.insertBefore(holder, svg.nextSibling)
    }
  }

  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    // Run once and observe future panel opens / locale switches
    try {
      patchThemeNavIcon()
    } catch {}
    try {
      paletteObs = new MutationObserver(() => {
        try {
          patchThemeNavIcon()
        } catch {}
      })
      paletteObs.observe(document.body, { childList: true, subtree: true, characterData: true })
    } catch {}
    ctx.effect(() => () => {
      if (paletteObs) {
        try {
          paletteObs.disconnect()
        } catch {}
        paletteObs = null
      }
      // Restore hidden gears on dispose
      if (typeof document !== 'undefined') {
        document.querySelectorAll('svg[data-palette-hidden="1"]').forEach((el) => {
          ;(el as unknown as HTMLElement).style.display = ''
          el.removeAttribute('data-palette-hidden')
        })
        document.querySelectorAll('[data-palette-icon]').forEach((el) => el.remove())
      }
    })
  }

  // Hide the built-in Appearance switch in General settings and unify on
  // dsh-cool-theme's Theme panel (light/dark/system + presets). Primary
  // mechanism is slot shadowing: a low-priority empty entry for the same id
  // wins the list cell and renders nothing, so the original AppearanceRow is
  // never projected. A lightweight CSS + MutationObserver fallback covers
  // hashed-class rotation and future template shifts.
  const HIDE_APPEARANCE_CSS =
    '.OVFIkW_section [data-slot="settings.general.item"] .D7wrZG_group{display:none !important;}'
  let hideCssDisposer: (() => void) | null = null
  let apObs: MutationObserver | null = null

  function isAppearanceNode(el: Element): boolean {
    // AppearanceRow is the only item that renders three theme cubes / the title "外观"/"Appearance"
    const text = el.textContent || ''
    const hasTitle = text.includes('外观') || text.includes('Appearance')
    const hasCubes =
      el.querySelector('[class*="themeCube"]') !== null ||
      el.querySelector('[class*="D7wrZG"]') !== null
    return hasTitle && hasCubes
  }

  function hideAppearanceInGeneral() {
    if (typeof document === 'undefined') return
    const container = document.querySelector('.OVFIkW_section [data-slot="settings.general.item"]')
    if (!container) return
    for (const child of Array.from(container.children)) {
      if (isAppearanceNode(child as Element)) {
        ;(child as HTMLElement).style.display = 'none'
      }
    }
  }

  slots.inject('settings.general.item', () => {
    try {
      hideCssDisposer = injector.insert(HIDE_APPEARANCE_CSS)
    } catch {}
    // Slot shadowing: priority -1 outranks the built-in 0 and renders null
    let disposeShadow: (() => void) | null = null
    try {
      disposeShadow = slots.register(
        { name: 'settings.general.item', id: 'appearance', priority: -1 } as any,
        () => null,
      )
    } catch {}

    // Fallback observer: if shadowing is ignored (e.g. future DSH changes), hide by DOM inspection
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      hideAppearanceInGeneral()
      try {
        apObs = new MutationObserver(hideAppearanceInGeneral)
        const target = document.body
        apObs.observe(target, { childList: true, subtree: true })
      } catch {}
    }

    return () => {
      if (disposeShadow) {
        try {
          disposeShadow()
        } catch {}
        disposeShadow = null
      }
      if (hideCssDisposer) {
        try {
          hideCssDisposer()
        } catch {}
        hideCssDisposer = null
      }
      if (apObs) {
        try {
          apObs.disconnect()
        } catch {}
        apObs = null
      }
      // Restore any fallback-hidden nodes
      if (typeof document !== 'undefined') {
        const container = document.querySelector('.OVFIkW_section [data-slot="settings.general.item"]')
        if (container) {
          for (const child of Array.from(container.children)) {
            const el = child as HTMLElement
            if (el.style.display === 'none') el.style.display = ''
          }
        }
      }
    }
  })
}
