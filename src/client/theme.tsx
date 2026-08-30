/**
 * Client theme module — registers settings.section id=cool-theme.
 */

import * as React from 'react'
import { THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY } from '../contract.js'
import { PRESETS, type PresetId } from './presets.js'
import { buildOverrides, buildFullCssFallback } from './tokens.js'
import { createStyleInjector } from './style-injector.js'
import { ThemePanel } from './components.js'
import { zh, en, type ThemeKey } from './locales.js'

const PALETTE_ICON_PATH =
  'M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z'
const PALETTE_ICON_DOTS: Array<{ cx: string; cy: string; r: string }> = [
  { cx: '13.5', cy: '6.5', r: '1.4' },
  { cx: '17.5', cy: '10.5', r: '1.4' },
  { cx: '6.5', cy: '12.5', r: '1.4' },
  { cx: '8.5', cy: '7.5', r: '1.4' },
]

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

  const baseCss = [
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
    '[class*="navCell"]:hover{background:var(--dsw-specific-sidebar-nav-item-hover) !important;}',
    '[class*="navCell"].active,[class*="navCell"][aria-current="true"]{background:var(--dsw-specific-sidebar-nav-item-active) !important;font-weight:500;}',
    '[class*="navCell"].active [class*="navIcon"],[class*="navCell"][aria-current="true"] [class*="navIcon"]{color:var(--dsw-alias-brand-primary) !important;}',
    '.ct-select:hover,.ct-select[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover) !important;}',
    '.ct-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover) !important;}',
    '.ct-menu-item:active{background:var(--dsw-alias-interactive-bg-active) !important;}',
    '[class*="AppearanceRow_group"]{display:none !important;}',
    ':root{--dsw-cool-theme-toast-bg:#ffffff;--dsw-cool-theme-toast-fg:#2e3440;--dsw-cool-theme-toast-border:#e5e9f0;}',
    'body[data-ds-dark-theme]{--dsw-cool-theme-toast-bg:#3b4252;--dsw-cool-theme-toast-fg:#eceff4;--dsw-cool-theme-toast-border:#4c566a;}',
    '[class*="Toast_toast"],[class*="toast"],[role="alert"],[data-sonner-toast]{background:var(--dsw-cool-theme-toast-bg) !important;color:var(--dsw-cool-theme-toast-fg) !important;border:1px solid var(--dsw-cool-theme-toast-border, var(--dsw-alias-border-l1)) !important;box-shadow:var(--dsw-shadow-lv3, 0 8px 24px rgba(0,0,0,.12)) !important;}',
    'body:not([data-ds-dark-theme]) [class*="toast"], body:not([data-ds-dark-theme]) [class*="Toast_toast"], body:not([data-ds-dark-theme]) [data-sonner-toast]{background:#ffffff !important;color:#2e3440 !important;border-color:#e5e9f0 !important;}',
    'body[data-ds-dark-theme] [class*="toast"], body[data-ds-dark-theme] [class*="Toast_toast"], body[data-ds-dark-theme] [data-sonner-toast]{background:#3b4252 !important;color:#eceff4 !important;border-color:#4c566a !important;}',
    '[data-sonner-toast]{--normal-bg:var(--dsw-cool-theme-toast-bg) !important;--normal-border:var(--dsw-cool-theme-toast-border) !important;--normal-text:var(--dsw-cool-theme-toast-fg) !important;}',
    'button[class*="Button_primary"]:hover,button[class*="primary"]:hover{background:var(--dsw-alias-button-primary-hover) !important;color:var(--dsw-alias-label-primary-foreground) !important;}',
    'button[class*="Button_outline"]:hover{color:var(--dsw-alias-label-primary) !important;}',
  ].join('\n')

  const injector = createStyleInjector()
  const baseDisposer = injector.insert(baseCss)

  let overrideDispose: (() => void) | null = null
  let fallbackDispose: (() => void) | null = null

  function isValidPreset(v: string | null): v is PresetId {
    return !!v && (v === 'native' || v in PRESETS)
  }

  function getPreset(): PresetId {
    try {
      const cur = localStorage.getItem(THEME_STORAGE_KEY)
      if (isValidPreset(cur)) return cur
      const legacy = localStorage.getItem(THEME_STORAGE_KEY_LEGACY)
      if (isValidPreset(legacy)) {
        // one-time migration to new key
        try {
          localStorage.setItem(THEME_STORAGE_KEY, legacy)
        } catch {}
        return legacy
      }
    } catch {}
    return 'native'
  }

  function applyPreset(id: PresetId) {
    try {
      overrideDispose?.()
    } catch {}
    overrideDispose = null
    try {
      fallbackDispose?.()
    } catch {}
    fallbackDispose = null
    if (id === 'native') return
    const overrides = buildOverrides(id)
    if (theme && typeof theme.overrideTokens === 'function') {
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

  try {
    const init = getPreset()
    if (init !== 'native') applyPreset(init)
  } catch {}

  function hideGeneralAppearance() {
    try {
      const titles = document.querySelectorAll('[class*="AppearanceRow_title"], [class*="title"]')
      for (const el of Array.from(titles) as HTMLElement[]) {
        const txt = (el.textContent || '').trim()
        if (txt === '外观' || txt === 'Appearance' || txt.toLowerCase() === 'appearance') {
          const group =
            (el.closest('[class*="AppearanceRow_group"]') as HTMLElement | null) ||
            (el.closest('[class*="group"]') as HTMLElement | null) ||
            (el.parentElement as HTMLElement | null)
          if (group && group.querySelector('[class*="themeCube"]')) group.style.display = 'none'
        }
      }
      const groups = document.querySelectorAll('[class*="AppearanceRow_group"]')
      for (const g of Array.from(groups) as HTMLElement[]) {
        if (g.querySelector('[class*="themeCube"]')) (g as HTMLElement).style.display = 'none'
      }
    } catch {}
  }

  function fixThemeNavIcon() {
    try {
      const cells = document.querySelectorAll('[class*="navCell"]')
      for (const cell of Array.from(cells) as HTMLElement[]) {
        const label = cell.querySelector('[class*="navLabel"]')
        if (!label) continue
        const txt = (label.textContent || '').trim()
        if (txt !== '主题' && txt !== 'Theme') continue
        const icon = cell.querySelector('svg') as SVGElement | null
        if (!icon || icon.dataset.ctPalette === '1') continue
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('class', icon.getAttribute('class') || '')
        svg.setAttribute('width', '16')
        svg.setAttribute('height', '16')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'none')
        svg.setAttribute('data-ct-palette', '1')
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        body.setAttribute('fill', 'none')
        body.setAttribute('stroke', 'currentColor')
        body.setAttribute('stroke-width', '2')
        body.setAttribute('stroke-linecap', 'round')
        body.setAttribute('stroke-linejoin', 'round')
        body.setAttribute('d', PALETTE_ICON_PATH)
        svg.appendChild(body)
        for (const dot of PALETTE_ICON_DOTS) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          circle.setAttribute('fill', 'currentColor')
          circle.setAttribute('stroke', 'none')
          circle.setAttribute('cx', dot.cx)
          circle.setAttribute('cy', dot.cy)
          circle.setAttribute('r', dot.r)
          svg.appendChild(circle)
        }
        icon.replaceWith(svg)
      }
    } catch {}
  }

  hideGeneralAppearance()
  fixThemeNavIcon()
  try {
    const obs = new MutationObserver(() => {
      hideGeneralAppearance()
      fixThemeNavIcon()
    })
    obs.observe(document.body, { childList: true, subtree: true })
    ctx.effect(() => () => obs.disconnect())
  } catch {}

  ctx.effect(() => () => {
    try {
      baseDisposer()
    } catch {}
    try {
      overrideDispose?.()
    } catch {}
    try {
      fallbackDispose?.()
    } catch {}
    try {
      injector.disposeAll()
    } catch {}
  })

  slots.inject('settings.section', () => {
    const options: any = {
      name: 'settings.section',
      id: 'cool-theme',
      order: 5,
      label: () => t('nav'),
    }
    if (locale) options.locale = NS
    return slots.register(options, (props: any) =>
      React.createElement(ThemePanel, {
        t: props?.t ?? ((key: ThemeKey) => zh[key]),
        theme,
        getPreset,
        setPreset,
      }),
    )
  })
}
