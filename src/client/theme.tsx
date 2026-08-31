import * as React from 'react'
import { THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY } from '../contract.js'
import { PRESETS, type PresetId } from './presets.js'
import { buildBaseCss, buildOverrides, buildFullCssFallback } from './tokens.js'
import { createStyleInjector } from './style-injector.js'
import { ThemePanel } from './components.js'
import { zh, en, type ThemeKey } from './locales.js'

const BASE_CSS = [
  '.ct-select{box-sizing:border-box;display:inline-flex;align-items:center;gap:12px;height:36px;padding:0 14px;border:none;border-radius:18px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;white-space:nowrap;width:auto;min-width:0;max-width:100%;}',
  '.ct-select:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-select:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-select-label{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}',
  '.ct-select-chevron{flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform 120ms ease;}',
  '.ct-select[aria-expanded="true"] .ct-select-chevron{transform:rotate(180deg);}',
  '.ct-menu-list{box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:0;border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);min-width:218px;max-width:360px;}',
  '.ct-menu-item{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:8px 10px;border:none;border-radius:10px;background:transparent;cursor:pointer;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);text-align:left;font-family:inherit;}',
  '.ct-menu-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-menu-check{flex:none;color:var(--dsw-alias-label-primary);display:inline-flex;margin-left:auto;}',
  '.ct-menu-item-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
  '.ct-row{border-bottom:1px solid var(--dsw-alias-border-l2);padding:16px 2px;display:flex;align-items:center;gap:16px;}',
  '.ct-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-right:48px;}',
  '.ct-row-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;}',
  '.ct-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;}',
].join('\n')

const NOOP = new Set<PresetId>(['native', 'dsh'])

function isValidPreset(v: string | null): v is PresetId {
  return !!v && (NOOP.has(v as PresetId) || v in PRESETS)
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

  function getPreset(): PresetId {
    for (const key of [THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY] as const) {
      try {
        const cur = localStorage.getItem(key)
        if (!isValidPreset(cur)) continue
        const normalized = cur === 'native' ? 'dsh' : (cur as PresetId)
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

  function applyPreset(id: PresetId) {
    overrideDispose = release(overrideDispose)
    fallbackDispose = release(fallbackDispose)
    if (NOOP.has(id)) {
      ensureBaseline(false)
      return
    }
    ensureBaseline(true)
    const overrides = buildOverrides(id)
    if (theme?.overrideTokens) {
      try {
        overrideDispose = theme.overrideTokens('dsh-cool-theme', overrides)
        return
      } catch {}
    }
    fallbackDispose = injector.insert(buildFullCssFallback(id))
  }

  function setPreset(id: PresetId) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id)
    } catch {}
    applyPreset(id)
  }

  applyPreset(getPreset())

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
      React.createElement(ThemePanel, { t: props?.t ?? ((key: ThemeKey) => zh[key]), theme, getPreset, setPreset }),
    )
  })

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
