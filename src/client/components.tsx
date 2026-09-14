/**
 * Theme settings UI: scheme selector, preset picker, and the custom colour editor.
 */

import * as React from 'react'
import { CUSTOM_PRESET_ID } from '../contract.js'
import { type PresetId, presetOptions } from './presets.js'
import { type ThemeKey } from './locales.js'
import {
  type CustomTheme,
  type SavedTheme,
  type SeedPair,
  SHIKI_KEYS,
  tryToHex,
} from './custom.js'

/** Reserved menu value that switches to the user-defined theme. */
export const CUSTOM_SELECTION = CUSTOM_PRESET_ID
export type Selection = PresetId | typeof CUSTOM_SELECTION

export type CustomState = { base: PresetId; theme: CustomTheme }

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

/**
 * One table cell: a swatch that opens the native picker, plus a text field that
 * accepts the colour in several notations. The field edits a local draft so
 * half-typed input never reaches the theme; it commits on Enter or blur and
 * reverts when the text cannot be parsed.
 */
function ColorCell(props: { value: string; label: string; onChange: (v: string) => void }) {
  const { value, label, onChange } = props
  const [draft, setDraft] = React.useState(value)
  const [editing, setEditing] = React.useState(false)

  // Follow outside changes (preset switch, reset, swatch pick) unless the user
  // is mid-edit, in which case their text wins until they commit or leave.
  React.useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  function commit(raw: string) {
    const next = tryToHex(raw)
    if (next) onChange(next)
    else setDraft(value)
  }

  return React.createElement(
    'div',
    { className: 'ct-cell' },
    React.createElement('input', {
      className: 'ct-cell-swatch',
      type: 'color',
      value,
      'aria-label': label,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.toUpperCase()
        setDraft(v)
        onChange(v)
      },
    }),
    React.createElement('input', {
      className: 'ct-cell-text',
      type: 'text',
      value: draft,
      'aria-label': label,
      spellCheck: false,
      autoComplete: 'off',
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        setEditing(true)
        // Select the whole value so the first click lets the user type a
        // replacement. A later click in the already-focused field still places
        // a caret, so partial edits keep working.
        e.currentTarget.select()
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        setEditing(false)
        commit(e.target.value)
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        const el = e.target as HTMLInputElement
        if (e.key === 'Enter') {
          commit(el.value)
          el.blur()
        } else if (e.key === 'Escape') {
          setDraft(value)
          el.blur()
        }
      },
    }),
  )
}

/** One `<tr>` of the editor table: name, then a light and a dark swatch cell. */function SeedRow(props: {
  name: string
  hint: string
  lightLabel: string
  darkLabel: string
  pair: SeedPair
  onChange: (next: SeedPair) => void
}) {
  const { name, hint, lightLabel, darkLabel, pair, onChange } = props
  return React.createElement(
    'tr',
    null,
    // The full description lives in the tooltip so the table stays compact.
    React.createElement('td', { className: 'ct-td-name', title: hint }, name),
    React.createElement(
      'td',
      { className: 'ct-td-color' },
      React.createElement(ColorCell, {
        label: `${name} ${lightLabel}`,
        value: pair.light,
        onChange: (v: string) => onChange({ ...pair, light: v }),
      }),
    ),
    React.createElement(
      'td',
      { className: 'ct-td-color' },
      React.createElement(ColorCell, {
        label: `${name} ${darkLabel}`,
        value: pair.dark,
        onChange: (v: string) => onChange({ ...pair, dark: v }),
      }),
    ),
  )
}

/** Accessible on/off switch used to enable the custom theme. */
function Switch(props: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  const { checked, label, onChange } = props
  return React.createElement(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-checked': checked,
      'aria-label': label,
      className: checked ? 'ct-switch ct-switch-on' : 'ct-switch',
      onClick: () => onChange(!checked),
    },
    React.createElement('span', { className: 'ct-switch-knob' }),
  )
}

/**
 * Confirmation dialog for destructive actions, mirroring DSH's own Modal
 * (design-platform mask token + blur, r24 card on layer-2, prominent shadow).
 * Rendered inline rather than through a portal so it needs no react-dom import.
 */
function ConfirmDialog(props: {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const { title, description, confirmLabel, cancelLabel, onConfirm, onCancel } = props
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return React.createElement(
    'div',
    { className: 'ct-modal-root' },
    React.createElement('div', { className: 'ct-modal-mask', 'aria-hidden': true, onClick: onCancel }),
    React.createElement(
      'div',
      { className: 'ct-modal-card', role: 'dialog', 'aria-modal': true, 'aria-label': title },
      React.createElement('div', { className: 'ct-modal-title' }, title),
      React.createElement('div', { className: 'ct-modal-desc' }, description),
      React.createElement(
        'div',
        { className: 'ct-modal-footer' },
        React.createElement('button', { type: 'button', className: 'ct-btn', onClick: onCancel }, cancelLabel),
        React.createElement(
          'button',
          { type: 'button', className: 'ct-btn ct-btn-danger', onClick: onConfirm },
          confirmLabel,
        ),
      ),
    ),
  )
}

/**
 * Inline Lucide icons (ISC), so the plugin needs no icon dependency.
 * Path data taken verbatim from lucide-static v1.45.0.
 */
type IconNode = { tag: 'path' | 'rect'; attrs: Record<string, string | number> }

const ICON_RENAME: IconNode[] = [
  { tag: 'path', attrs: { d: 'M13 21h8' } },
  { tag: 'path', attrs: { d: 'm15 5 4 4' } },
  {
    tag: 'path',
    attrs: {
      d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    },
  },
]

const ICON_COPY: IconNode[] = [
  { tag: 'rect', attrs: { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 } },
  { tag: 'path', attrs: { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' } },
]

const ICON_TRASH: IconNode[] = [
  { tag: 'path', attrs: { d: 'M10 11v6' } },
  { tag: 'path', attrs: { d: 'M14 11v6' } },
  { tag: 'path', attrs: { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' } },
  { tag: 'path', attrs: { d: 'M3 6h18' } },
  { tag: 'path', attrs: { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' } },
]

function Icon(props: { nodes: IconNode[] }) {
  return React.createElement(
    'svg',
    {
      width: 15,
      height: 15,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
    },
    ...props.nodes.map((n, i) => React.createElement(n.tag, { key: i, ...n.attrs })),
  )
}

/**
 * Icon-only action button. The label rides on `data-tip` for the styled bubble
 * and on `aria-label` for assistive tech — no `title`, which would stack the
 * native tooltip on top of ours.
 */
function IconButton(props: {
  label: string
  nodes: IconNode[]
  danger?: boolean
  onClick: () => void
}) {
  const { label, nodes, danger, onClick } = props
  return React.createElement(
    'button',
    {
      type: 'button',
      className: danger ? 'ct-icon-btn ct-icon-btn-danger' : 'ct-icon-btn',
      'data-tip': label,
      'aria-label': label,
      onClick,
    },
    React.createElement(Icon, { nodes }),
  )
}

/** The saved-theme list under the editor: activate, rename, duplicate, delete. */
function SavedList(props: {
  list: SavedTheme[]
  activeId: string | null
  t: (key: ThemeKey) => string
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (entry: SavedTheme) => void
  onLoad: (id: string) => void
}) {
  const { list, activeId, t, onRename, onDuplicate, onDelete, onLoad } = props
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState('')

  function startRename(entry: SavedTheme) {
    setEditingId(entry.id)
    setDraft(entry.name)
  }
  function commit(id: string) {
    const name = draft.trim()
    if (name) onRename(id, name)
    setEditingId(null)
  }

  return React.createElement(
    'div',
    { className: 'ct-list' },
    ...list.map((entry) =>
      React.createElement(
        'div',
        { className: 'ct-list-row', key: entry.id },
        editingId === entry.id
          ? React.createElement('input', {
              className: 'ct-list-input',
              type: 'text',
              value: draft,
              autoFocus: true,
              'aria-label': t('custom.rename'),
              // Rename starts ready to overwrite: the whole name is selected.
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select(),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
              onBlur: () => commit(entry.id),
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') commit(entry.id)
                else if (e.key === 'Escape') setEditingId(null)
              },
            })
          : React.createElement(
              'button',
              { className: 'ct-list-name', type: 'button', onClick: () => onLoad(entry.id) },
              entry.name,
            ),
        React.createElement(
          'div',
          { className: 'ct-list-actions' },
          activeId === entry.id
            ? React.createElement('span', { className: 'ct-list-badge' }, t('custom.inUse'))
            : null,
          React.createElement(IconButton, {
            label: t('custom.rename'),
            nodes: ICON_RENAME,
            onClick: () => startRename(entry),
          }),
          React.createElement(IconButton, {
            label: t('custom.duplicate'),
            nodes: ICON_COPY,
            onClick: () => onDuplicate(entry.id),
          }),
          React.createElement(IconButton, {
            label: t('custom.delete'),
            nodes: ICON_TRASH,
            danger: true,
            onClick: () => onDelete(entry),
          }),
        ),
      ),
    ),
  )
}

export function ThemePanel(props: {
  theme: any
  getSelection: () => Selection
  setSelection: (s: Selection) => void
  getCustom: () => CustomState
  setCustom: (theme: CustomTheme) => void
  rebaseCustom: (base: PresetId) => CustomTheme
  resetCustom: () => CustomTheme
  saved: {
    list: () => SavedTheme[]
    activeId: () => string | null
    save: () => SavedTheme[]
    load: (id: string) => CustomTheme | null
    rename: (id: string, name: string) => SavedTheme[]
    duplicate: (id: string) => CustomTheme | null
    remove: (id: string) => SavedTheme[]
  }
  t: (key: ThemeKey) => string
}) {
  const { theme, getSelection, setSelection, getCustom, setCustom, rebaseCustom, resetCustom, saved, t } = props
  let initScheme = 'system'
  try {
    const snap = theme?.getTheme()
    if (snap?.preference) initScheme = snap.preference
  } catch {}
  const [scheme, setScheme] = React.useState(initScheme)
  const [selection, setSelectionState] = React.useState<Selection>(() => getSelection())
  const [custom, setCustomState] = React.useState<CustomTheme>(() => getCustom().theme)
  // The preset the picker keeps showing. Turning the custom switch on must not
  // blank the dropdown, so the last chosen preset stays on display.
  const [shownPreset, setShownPreset] = React.useState<PresetId>(() => {
    const initial = getSelection()
    return initial === CUSTOM_SELECTION ? getCustom().base : initial
  })
  const [list, setList] = React.useState<SavedTheme[]>(() => saved.list())
  const [activeId, setActiveId] = React.useState<string | null>(() => saved.activeId())
  const [pendingDelete, setPendingDelete] = React.useState<SavedTheme | null>(null)

  /** Re-read both the list and the active pointer after any list mutation. */
  function syncSaved() {
    setList(saved.list())
    setActiveId(saved.activeId())
  }

  function onSave() {
    setList(saved.save())
    setActiveId(saved.activeId())
  }

  function onLoadSaved(id: string) {
    const next = saved.load(id)
    if (next) setCustomState(next)
    syncSaved()
  }

  function onDuplicate(id: string) {
    const next = saved.duplicate(id)
    if (next) setCustomState(next)
    syncSaved()
  }

  function onConfirmDelete() {
    if (!pendingDelete) return
    setList(saved.remove(pendingDelete.id))
    setActiveId(saved.activeId())
    setPendingDelete(null)
  }

  function pickScheme(id: string) {
    setScheme(id)
    try {
      theme?.setTheme(id)
    } catch {}
  }

  /**
   * The preset picker. With the custom switch on, the choice re-seeds the
   * editor table from that preset and custom mode stays on; otherwise it just
   * switches the active preset.
   */
  function pickPreset(id: PresetId) {
    if (customOn) {
      setCustomState(rebaseCustom(id))
      setShownPreset(id)
      return
    }
    setSelectionState(id)
    setSelection(id)
    setShownPreset(id)
  }

  /** The custom switch. Turning it off returns to the preset seeds came from. */
  function toggleCustom(on: boolean) {
    if (on) {
      setSelectionState(CUSTOM_SELECTION)
      setSelection(CUSTOM_SELECTION)
      // Entering custom mode may have just seeded a fresh palette.
      setCustomState(getCustom().theme)
      return
    }
    const target = getCustom().base
    setSelectionState(target)
    setSelection(target)
    setShownPreset(target)
  }

  function editCustom(next: CustomTheme) {
    setCustomState(next)
    setCustom(next)
  }

  function onReset() {
    setCustomState(resetCustom())
  }

  const schemeOptions = [
    { value: 'light', label: t('scheme.light') },
    { value: 'dark', label: t('scheme.dark') },
    { value: 'system', label: t('scheme.system') },
  ]

  const customOn = selection === CUSTOM_SELECTION

  const children: any[] = [
    React.createElement(
      'div',
      { className: 'ct-row', key: 'appearance' },
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
      { className: 'ct-row', key: 'presets' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('presets.title')),
        React.createElement('div', { className: 'ct-row-desc' }, t('presets.desc')),
      ),
      React.createElement(SchemeMenu, {
        value: customOn ? shownPreset : selection,
        options: presetOptions,
        onSelect: (v) => pickPreset(v as PresetId),
      }),
    ),
    React.createElement(
      'div',
      { className: 'ct-row ct-row-flush', key: 'custom-toggle' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('custom.title')),
        React.createElement('div', { className: 'ct-row-desc' }, t('custom.toggle.desc')),
      ),
      React.createElement(Switch, {
        checked: customOn,
        label: t('custom.title'),
        onChange: toggleCustom,
      }),
    ),
  ]

  if (customOn) {
    /** A plain seed row: one base colour per appearance. */
    const seedRow = (key: 'accent' | 'green' | 'amber' | 'red', title: ThemeKey, desc: ThemeKey) =>
      React.createElement(SeedRow, {
        key,
        name: t(title),
        hint: t(desc),
        lightLabel: t('custom.seed.light'),
        darkLabel: t('custom.seed.dark'),
        pair: custom[key],
        onChange: (next: SeedPair) => editCustom({ ...custom, [key]: next } as CustomTheme),
      })

    /** The neutral row edits the ramp's two endpoints rather than two per-mode
     *  colours, so its column labels differ from every other row. */
    const neutralRow = React.createElement(SeedRow, {
      key: 'neutral',
      name: t('custom.neutral.title'),
      hint: t('custom.neutral.desc'),
      lightLabel: t('custom.neutral.lightest'),
      darkLabel: t('custom.neutral.darkest'),
      pair: { light: custom.neutralLightest, dark: custom.neutralDarkest },
      onChange: (p: SeedPair) =>
        editCustom({ ...custom, neutralLightest: p.light, neutralDarkest: p.dark }),
    })

    const seedRows: any[] = [
      seedRow('accent', 'custom.accent.title', 'custom.accent.desc'),
      neutralRow,
      seedRow('green', 'custom.green.title', 'custom.green.desc'),
      seedRow('amber', 'custom.amber.title', 'custom.amber.desc'),
      seedRow('red', 'custom.red.title', 'custom.red.desc'),
    ]

    const shikiRows = SHIKI_KEYS.map((k) =>
      React.createElement(SeedRow, {
        key: `shiki-${k}`,
        name: t(`shiki.${k}` as ThemeKey),
        hint: t('custom.shiki.desc'),
        lightLabel: t('custom.seed.light'),
        darkLabel: t('custom.seed.dark'),
        pair: custom.shiki[k],
        onChange: (next: SeedPair) => editCustom({ ...custom, shiki: { ...custom.shiki, [k]: next } }),
      }),
    )

    /** One bordered table: its first column header names the group. */
    const group = (key: string, firstColumn: ThemeKey, rows: any[]) =>
      React.createElement(
        'div',
        { className: 'ct-group', key },
        React.createElement(
          'div',
          { className: 'ct-table-wrap' },
          React.createElement(
            'table',
            { className: 'ct-table' },
            React.createElement(
              'thead',
              null,
              React.createElement(
                'tr',
                null,
                React.createElement('th', { className: 'ct-td-name' }, t(firstColumn)),
                React.createElement('th', { className: 'ct-td-color' }, t('custom.seed.light')),
                React.createElement('th', { className: 'ct-td-color' }, t('custom.seed.dark')),
              ),
            ),
            React.createElement('tbody', null, ...rows),
          ),
        ),
      )

    children.push(
      group('seeds', 'custom.table.seeds', seedRows),
      group('shiki', 'custom.table.shiki', shikiRows),
      // Actions sit on the right: reset re-seeds the draft, save commits it to
      // the list (updating the active entry, or creating the first one).
      React.createElement(
        'div',
        { className: 'ct-actions', key: 'actions' },
        React.createElement(
          'button',
          { type: 'button', className: 'ct-btn', onClick: onReset },
          t('custom.reset'),
        ),
        React.createElement(
          'button',
          { type: 'button', className: 'ct-btn ct-btn-primary', onClick: onSave },
          t('custom.save'),
        ),
      ),
    )

    if (list.length > 0) {
      children.push(
        React.createElement(SavedList, {
          key: 'saved-list',
          list,
          activeId,
          t,
          onRename: (id: string, name: string) => setList(saved.rename(id, name)),
          onDuplicate,
          onDelete: (entry: SavedTheme) => setPendingDelete(entry),
          onLoad: onLoadSaved,
        }),
      )
    }
  }

  if (pendingDelete) {
    children.push(
      React.createElement(ConfirmDialog, {
        key: 'confirm-delete',
        title: t('custom.delete.title'),
        description: t('custom.delete.desc').replace('{0}', pendingDelete.name),
        confirmLabel: t('custom.delete'),
        cancelLabel: t('custom.cancel'),
        onConfirm: onConfirmDelete,
        onCancel: () => setPendingDelete(null),
      }),
    )
  }

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: 760, paddingBottom: 8 } },
    ...children,
  )
}
