import * as React from 'react'
import {
  THEME_STORAGE_KEY,
  THEME_STORAGE_KEY_LEGACY,
  CUSTOM_THEME_STORAGE_KEY,
  CUSTOM_LIST_STORAGE_KEY,
  CUSTOM_ACTIVE_STORAGE_KEY,
  CUSTOM_MIGRATED_STORAGE_KEY,
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
  decodeList,
  extractSeeds,
  newThemeId,
  normalizeCustom,
  parseEnvelope,
} from './custom.js'
import {
  fetchThemes,
  pushThemes,
  removeTheme as removeThemeFile,
  legacyThemesToAdopt,
} from './theme-files.js'
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
  // Colour editor: one row per group, its name on the left and every seed's
  // round swatch on the right. The swatch IS the native picker, so a click
  // opens the platform colour chooser directly.
  '.ct-seed-row{display:flex;align-items:center;gap:16px;padding:12px 0;}',
  '.ct-seed-label{flex:0 0 auto;min-width:96px;padding-left:2px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);}',
  '.ct-seed-dots{flex:1 1 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px;}',
  // The visible swatch is the wrapper, not the native colour input: its shape
  // and its border therefore come from one `border-radius` and cannot disagree
  // with the engine's own swatch rendering. The input sits on top, invisible,
  // and is the hit target that opens the platform picker. No `overflow:hidden`:
  // the input never paints, and the tooltip below has to escape the circle.
  '.ct-seed-dot{position:relative;box-sizing:border-box;display:inline-block;flex:none;width:26px;height:26px;border:1px solid var(--dsw-alias-border-l2);border-radius:50%;cursor:pointer;}',
  '.ct-seed-input{position:absolute;inset:0;box-sizing:border-box;width:100%;height:100%;padding:0;border:none;background:transparent;opacity:0;cursor:pointer;}',
  '.ct-seed-dot:focus-within{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  // Hover tooltip naming the token, matching DSH's own `data-tip` bubble.
  '.ct-seed-dot::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 7px);left:50%;z-index:20;transform:translateX(-50%);padding:3px 8px;border-radius:6px;background:var(--dsw-alias-label-primary,#151517);color:var(--dsw-alias-bg-layer-3,#fff);font-size:11px;font-weight:400;line-height:17px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;}',
  '.ct-seed-dot:hover::after,.ct-seed-dot:focus-within::after{opacity:1;}',
  // Saved-theme cards, matching DSH's own provider rows: an outlined card with
  // the name and its "in use" dot on the left, and the row's actions on the
  // right. The active entry is marked by the dot alone, so selection never
  // competes with the hover fill.
  '.ct-list{margin-top:4px;display:flex;flex-direction:column;gap:8px;}',
  '.ct-list-row{display:flex;align-items:center;gap:10px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;background:transparent;cursor:pointer;transition:border-color .16s ease,background .16s ease;}',
  '.ct-list-row:hover{background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-list-identity{display:inline-flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;}',
  // The name is clickable (loads the theme); the card's own hover fill is the
  // only cue — an underline on top of it would read as a link, not a surface.
  '.ct-list-name{min-width:0;text-align:left;border:none;background:transparent;cursor:pointer;font:inherit;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0;}',
  '.ct-list-name:disabled{cursor:default;}',
  // DSH's configured-credential dot: an 8px success circle that annotates the
  // name rather than competing with it.
  '.ct-list-dot{box-sizing:border-box;display:inline-block;flex:none;width:8px;height:8px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-success-primary);}',
  '.ct-list-actions{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto;}',
  // The dense capsule (DSH Button `.sm`) every row action wears.
  '.ct-list-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:14px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:12px;line-height:18px;}',
  '.ct-list-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-list-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  // Delete is the borderless danger variant, exactly as DSH styles row removal.
  '.ct-list-btn-danger{border:none;color:var(--dsw-alias-state-error-primary);}',
  '.ct-list-btn-danger:hover{background:var(--dsw-alias-interactive-bg-hover-danger);}',
  // Expanded editor card: the same 16px face as a collapsed row, opened up.
  // Spacing is carried entirely by the children's own padding (no flex `gap`),
  // so the head, the colour rows and the footer all sit on one 24px rhythm.
  '.ct-editor{padding:16px;border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;background:transparent;display:flex;flex-direction:column;gap:0;}',
  '.ct-editor-head{display:flex;align-items:center;gap:10px;padding-bottom:12px;}',
  '.ct-editor-name{flex:1 1 auto;min-width:0;box-sizing:border-box;height:36px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;}',
  '.ct-editor-name::placeholder{color:var(--dsw-alias-label-tertiary);}',
  '.ct-editor-name:hover{border-color:var(--dsw-alias-border-l3);}',
  '.ct-editor-name:focus{outline:none;border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);}',
  // Light/dark segmented control: which appearance the swatches below edit.
  // Sized to the name field beside it so the two share one row height.
  '.ct-mode{box-sizing:border-box;display:inline-flex;flex:none;height:36px;padding:2px;border-radius:10px;background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-2));}',
  '.ct-mode-btn{box-sizing:border-box;height:32px;padding:0 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:inherit;font-size:12px;line-height:18px;}',
  '.ct-mode-btn:hover{color:var(--dsw-alias-label-primary);}',
  '.ct-mode-btn-on{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}',
  '.ct-mode-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-editor-actions{display:flex;justify-content:flex-end;gap:12px;padding-top:12px;}',
  // The large, full-width call to action that appends a new theme card. Dashed
  // like DSH's own "add" affordances on the model settings page, so it reads as
  // a place rather than a command: same 44px height, 16px radius and plus glyph.
  '.ct-add-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;height:44px;margin-top:8px;padding:0 14px;border:1px dashed var(--dsw-alias-border-l3);border-radius:16px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;}',
  '.ct-add-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-add-btn:disabled{opacity:.4;cursor:default;}',
  '.ct-add-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
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
  // Transient confirmation banner, matching DSH's own toast: a success badge
  // plus the copy, top center, slide in, hold, fade out. The 3000ms/1000ms pair
  // has to agree with TOAST_HOLD_MS and TOAST_FADE_MS in components.tsx, which
  // own the unmount timer.
  '.ct-toast{position:fixed;top:40px;left:50%;z-index:1100;pointer-events:none;display:flex;align-items:center;gap:10px;width:max-content;max-width:min(640px,calc(100vw - 48px));padding:12px 16px;border-radius:14px;background:var(--dsw-alias-button-contrast-fill);color:var(--dsw-alias-label-primary-inverted);font-size:14px;line-height:22px;box-shadow:var(--dsw-shadow-lv3);transform:translateX(-50%);animation:ct-toast-in 160ms ease-out,ct-toast-fade 1s ease 3s forwards;}',
  // The badge DSH's confirmations wear: an 18px success ring around the check.
  '.ct-toast-icon{display:grid;place-items:center;flex:none;width:18px;height:18px;border:1.5px solid var(--dsw-alias-state-success-primary);border-radius:50%;corner-shape:round;color:var(--dsw-alias-state-success-primary);}',
  '.ct-toast-text{min-width:0;}',
  '@keyframes ct-toast-in{from{opacity:0;transform:translate(-50%,-6px);}to{opacity:1;transform:translate(-50%,0);}}',
  '@keyframes ct-toast-fade{to{opacity:0;}}',
  // The delayed fade is an opacity change, not movement: keeping it under
  // reduced motion still ends the banner before the timed unmount.
  '@media (prefers-reduced-motion: reduce){.ct-toast{animation:ct-toast-fade 1s ease 3s forwards;}}',
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

  /**
   * Choose the preset a future custom theme seeds from, without touching the
   * colours currently on screen. The custom editor stays the live theme; the
   * preset is only the template the next "add" inherits.
   */
  function setCustomBase(base: PresetId) {
    lastPreset = base
    try {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, encodeCustom(base, loadCustom().theme))
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

  /**
   * The roster as the Host last reported it; `null` means it has not answered
   * yet. Files are the source of truth, so this is a read-through cache the
   * panel renders from, and every mutation is a round trip plus a refresh.
   */
  let themeCache: SavedTheme[] | null = null

  /** The legacy browser list, read only until the Host has answered. */
  const legacyList = () => decodeList(readRaw(CUSTOM_LIST_STORAGE_KEY), fallbackForBase)

  /** The roster to render and resolve ids against. */
  const readList = (): SavedTheme[] => themeCache ?? legacyList()

  function readActiveId(): string | null {
    const id = readRaw(CUSTOM_ACTIVE_STORAGE_KEY)
    return id && readList().some((e) => e.id === id) ? id : null
  }

  /**
   * Adopt the themes this browser saved before they lived in files. Runs once:
   * the marker keeps a stale browser copy from being migrated twice, and is only
   * set after a confirmed write, so a failed migration retries next load.
   */
  async function migrateLegacyThemes(hostThemes: SavedTheme[]): Promise<SavedTheme[]> {
    if (readRaw(CUSTOM_MIGRATED_STORAGE_KEY) !== null) return hostThemes
    const adopt = legacyThemesToAdopt(legacyList(), hostThemes)
    if (adopt.length > 0) {
      // Throws on failure, which leaves the marker unset and the browser copy in
      // place for the next load.
      await pushThemes(adopt, fallbackForBase)
    }
    writeRaw(CUSTOM_MIGRATED_STORAGE_KEY, new Date().toISOString())
    writeRaw(CUSTOM_LIST_STORAGE_KEY, null)
    // Re-read rather than merging locally: the Host owns ordering and stamps.
    return adopt.length > 0 ? fetchThemes(fallbackForBase) : hostThemes
  }

  /** Re-read the roster from the Host, migrating the legacy list on first load. */
  async function refreshSaved(): Promise<SavedTheme[]> {
    themeCache = await migrateLegacyThemes(await fetchThemes(fallbackForBase))
    return themeCache
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
    /** The cached roster, or the legacy browser list until the Host answers. */
    list: readList,
    activeId: readActiveId,
    load: loadSaved,
    /** Point the "in use" badge at an entry, or clear it entirely. */
    setActive(id: string | null) {
      writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, id)
    },
    refresh: refreshSaved,
    /** Persist the current draft as a new named entry and make it active. */
    async create(name: string): Promise<SavedTheme[]> {
      const draft = loadCustom()
      const entry: SavedTheme = {
        id: newThemeId(),
        name,
        base: draft.base,
        theme: draft.theme,
        assets: [],
      }
      await pushThemes([entry], fallbackForBase)
      writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id)
      return refreshSaved()
    },
    /** Write the current draft (and a new name) back to an existing entry. */
    async update(id: string, name: string): Promise<SavedTheme[]> {
      const entry = readList().find((e) => e.id === id)
      if (!entry) return readList()
      const draft = loadCustom()
      await pushThemes([{ ...entry, name, theme: draft.theme }], fallbackForBase)
      return refreshSaved()
    },
    /** Copy an entry so the copy can be tweaked independently; the copy becomes active. */
    async duplicate(id: string): Promise<CustomTheme | null> {
      const src = readList().find((e) => e.id === id)
      if (!src) return null
      const entry: SavedTheme = {
        id: newThemeId(),
        name: `${src.name} ${t('custom.copySuffix')}`,
        base: src.base,
        theme: src.theme,
        assets: src.assets,
      }
      await pushThemes([entry], fallbackForBase)
      await refreshSaved()
      return loadSaved(entry.id)
    },
    async remove(id: string): Promise<SavedTheme[]> {
      if (readRaw(CUSTOM_ACTIVE_STORAGE_KEY) === id) writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, null)
      await removeThemeFile(id)
      const next = await refreshSaved()
      // Deleting the active entry would otherwise leave no selection while the
      // list still has entries: fall back to the first one, which also swaps in
      // its theme so the removal takes effect on screen instead of leaving the
      // deleted theme applied.
      if (readActiveId() === null && next[0]) loadSaved(next[0].id)
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

  // The shell's own toast, when the host shares its primitives module with
  // plugins. Resolved once at mount: the module table is static, so a miss is
  // permanent and simply keeps the local fallback in components.tsx.
  let sharedToast: ((props: any) => any) | null = null
  const modules: any = ctx.get('modules')
  try {
    void modules
      ?.import?.('@deepseek-ai/dsh-client-ui-primitives')
      .then((mod: any) => {
        if (typeof mod?.Toast === 'function') sharedToast = mod.Toast
      })
      .catch(() => {})
  } catch {}

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
        setCustomBase,
        resetCustom,
        saved,
        getHostToast: () => sharedToast,
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
