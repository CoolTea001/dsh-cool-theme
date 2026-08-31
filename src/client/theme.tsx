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
  '.ct-row:last-child{border-bottom:none;}',
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
