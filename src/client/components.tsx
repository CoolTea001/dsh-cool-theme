/**
 * Theme settings UI: scheme selector + preset picker.
 */

import * as React from 'react'
import { type PresetId, presetOptions } from './presets.js'
import { type ThemeKey } from './locales.js'

function IconChevron() {
  return React.createElement(
    'svg',
    { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    React.createElement('path', {
      d: 'M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z',
      fill: 'currentColor',
    }),
  )
}

function IconCheck() {
  return React.createElement(
    'svg',
    {
      width: 16,
      height: 16,
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      style: { marginLeft: 'auto', color: 'var(--dsw-alias-label-primary)', display: 'inline-flex' },
    },
    React.createElement('path', {
      d: 'M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z',
      fill: 'currentColor',
    }),
  )
}

function SchemeMenu(props: {
  value: string
  options: { value: string; label: string }[]
  onSelect: (v: string) => void
}) {
  const { value, options, onSelect } = props
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (!(e.target instanceof Node)) return
      if (rootRef.current?.contains(e.target)) return
      if (listRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  return React.createElement(
    'span',
    { ref: rootRef, style: { position: 'relative', display: 'inline-flex' } },
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'ct-select',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onClick: () => setOpen(!open),
      },
      React.createElement('span', { className: 'ct-select-label' }, selected?.label ?? ''),
      React.createElement('span', { className: 'ct-select-chevron' }, React.createElement(IconChevron, null)),
    ),
    open
      ? React.createElement(
          'div',
          {
            ref: listRef,
            className: 'ct-menu-list',
            style: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100 },
            role: 'menu',
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          },
          ...options.map((o) => {
            const sel = o.value === value
            return React.createElement(
              'button',
              {
                key: o.value,
                type: 'button',
                role: 'menuitem',
                className: 'ct-menu-item',
                onClick: () => {
                  setOpen(false)
                  onSelect(o.value)
                },
              },
              React.createElement('span', { className: 'ct-menu-item-label' }, o.label),
              sel ? React.createElement(IconCheck, null) : null,
            )
          }),
        )
      : null,
  )
}

export function ThemePanel(props: {
  theme: any
  getPreset: () => PresetId
  setPreset: (id: PresetId) => void
  t: (key: ThemeKey) => string
}) {
  const { theme, getPreset, setPreset, t } = props
  let initScheme = 'system'
  try {
    const snap = theme?.getTheme()
    if (snap?.preference) initScheme = snap.preference
  } catch {}
  const [scheme, setScheme] = React.useState(initScheme)
  const [active, setActive] = React.useState<PresetId>(() => getPreset())

  function pickScheme(id: string) {
    setScheme(id)
    try {
      theme?.setTheme(id)
    } catch {}
  }
  function pickPreset(id: PresetId) {
    setActive(id)
    setPreset(id)
  }

  const schemeOptions = [
    { value: 'light', label: t('scheme.light') },
    { value: 'dark', label: t('scheme.dark') },
    { value: 'system', label: t('scheme.system') },
  ]

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: 760, paddingBottom: 8 } },
    React.createElement(
      'div',
      { className: 'ct-row' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('appearance.title')),
        React.createElement('div', { className: 'ct-row-desc' }, t('appearance.desc')),
      ),
      React.createElement(SchemeMenu, { value: scheme, options: schemeOptions, onSelect: pickScheme }),
    ),
    React.createElement(
      'div',
      { className: 'ct-row' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('presets.title')),
        React.createElement('div', { className: 'ct-row-desc' }, t('presets.desc')),
      ),
      React.createElement(SchemeMenu, {
        value: active,
        options: presetOptions,
        onSelect: (v) => pickPreset(v as PresetId),
      }),
    ),
  )
}
