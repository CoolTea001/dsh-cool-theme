/**
 * Theme settings UI: scheme selector, preset picker, and the custom colour editor.
 */

import * as React from 'react'
import { CUSTOM_PRESET_ID } from '../contract.js'
import { type PresetId, presetOptions } from './presets.js'
import { type ThemeKey } from './locales.js'
import { ThemeApiUnavailableError } from './theme-files.js'
import {
  type CustomTheme,
  type Mode,
  type NeutralRamp,
  type SavedTheme,
  type SeedPair,
  SHIKI_KEYS,
  nextThemeName,
} from './custom.js'

/** Reserved menu value that switches to the user-defined theme. */
export const CUSTOM_SELECTION = CUSTOM_PRESET_ID
export type Selection = PresetId | typeof CUSTOM_SELECTION

export type CustomState = { base: PresetId; theme: CustomTheme }

/**
 * The card currently open in the editor, plus the state to restore if the user
 * cancels. Editing previews live, so cancel has to put the previous theme back.
 */
type Editing = {
  /** null while composing a brand-new theme. */
  id: string | null
  name: string
  /** Active entry before editing began; null when none was active. */
  originId: string | null
  originDraft: CustomTheme
  /** Committed name of the entry being edited; '' for a brand-new theme. */
  originName: string
  /** Committed seeds of the entry being edited, for the dirty comparison. */
  originTheme: CustomTheme
  /**
   * Appearance preference in force when editing began. The mode toggle previews
   * the other appearance on the whole page, so leaving the editor has to put
   * this preference back rather than keeping the preview.
   */
  originScheme: string
}

/** Structural equality of the two seeds in one pair. */
function samePair(a: SeedPair | undefined, b: SeedPair | undefined): boolean {
  return a?.light === b?.light && a?.dark === b?.dark
}

/** Structural equality of the two endpoints of one neutral ramp. */
function sameRamp(a: NeutralRamp | undefined, b: NeutralRamp | undefined): boolean {
  return a?.lightest === b?.lightest && a?.darkest === b?.darkest
}

/** Structural equality over all 30 seeds, ignoring key order. */
function sameSeeds(a: CustomTheme, b: CustomTheme): boolean {
  if (!sameRamp(a.neutral?.light, b.neutral?.light) || !sameRamp(a.neutral?.dark, b.neutral?.dark)) return false
  if (!samePair(a.accent, b.accent) || !samePair(a.green, b.green)) return false
  if (!samePair(a.amber, b.amber) || !samePair(a.red, b.red)) return false
  return SHIKI_KEYS.every((k) => samePair(a.shiki?.[k], b.shiki?.[k]))
}

/** The two roles one appearance's neutral ramp fills, in display order. */
const NEUTRAL_ROLES = ['background', 'foreground'] as const
type NeutralRole = (typeof NEUTRAL_ROLES)[number]

/**
 * The ramp end that paints an appearance's background or foreground. DSH points
 * its aliases at step 00 for light surfaces and step 1000 for light text, then
 * swaps both in dark (950 surfaces, 50 text), so the same end means opposite
 * things in the two appearances. Naming the role and resolving it per appearance
 * keeps the swatches in a stable background-then-foreground order.
 */
function neutralEndForRole(mode: Mode, role: NeutralRole): 'lightest' | 'darkest' {
  const backgroundIsLightest = mode === 'light'
  return (role === 'background') === backgroundIsLightest ? 'lightest' : 'darkest'
}

/**
 * Whether the open editor holds work a close would throw away. A brand-new
 * theme has never been committed, so it always counts as unsaved; a reopened
 * entry is dirty only once its name or one of its seeds actually moved.
 */
function isDirty(open: Editing, current: CustomTheme): boolean {
  if (open.id === null) return true
  return open.name.trim() !== open.originName.trim() || !sameSeeds(current, open.originTheme)
}

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

/** The menu's selected-row tick: 16px, pushed to the trailing edge. */
function IconCheck(props: { size?: number; className?: string }) {
  const { size = 16, className } = props
  return React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      className,
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
  /**
   * Locked while the custom theme owns the colours. The custom editor is the
   * live source of colours then, and new custom themes inherit whatever preset
   * was chosen before the switch was turned on.
   */
  disabled?: boolean
}) {
  const { value, options, onSelect, disabled } = props
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
        disabled,
        'aria-haspopup': 'menu',
        'aria-expanded': open && !disabled,
        onClick: () => setOpen(!open),
      },
      React.createElement('span', { className: 'ct-select-label' }, selected?.label ?? ''),
      React.createElement('span', { className: 'ct-select-chevron' }, React.createElement(IconChevron, null)),
    ),
    open && !disabled
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
              sel ? React.createElement(IconCheck, { className: 'ct-menu-check' }) : null,
            )
          }),
        )
      : null,
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

/** Which banner a failed roster call deserves. */
function toastKeyFor(error: unknown): ThemeKey {
  return error instanceof ThemeApiUnavailableError ? 'custom.toast.unavailable' : 'custom.toast.failed'
}

/** Full-opacity hold before the fade starts. DSH's own default; mirrors the stylesheet's delay. */
const TOAST_HOLD_MS = 3000
/** Fade duration. Mirrors the stylesheet's fade animation. */
const TOAST_FADE_MS = 1000

/**
 * Transient confirmation banner: a leading result badge plus the copy, top
 * center, sliding in, holding, fading out, then reporting done so the owner can
 * unmount it. Metrics, tokens, badge and timing follow DSH's own toast — the
 * badge is the success circle its confirmations wear — but the component is
 * local: the plugin must keep answering a save on a host that does not share
 * the primitives module.
 *
 * TOAST_HOLD_MS and TOAST_FADE_MS have to agree with the `ct-toast` animation
 * in the injected stylesheet, which owns the visual timing.
 * @param props.text - resolved, already-localized copy.
 * @param props.onDone - called once the fade completes; unmount the toast here.
 */
function Toast(props: { text: string; onDone: () => void }) {
  const { text, onDone } = props
  React.useEffect(() => {
    const timer = setTimeout(onDone, TOAST_HOLD_MS + TOAST_FADE_MS)
    return () => clearTimeout(timer)
  }, [onDone])
  // `status` rather than DSH's `alert`: these confirm an action the user just
  // took, so they should not interrupt whatever the screen reader is saying.
  return React.createElement(
    'div',
    { className: 'ct-toast', role: 'status' },
    React.createElement(ToastBadge),
    React.createElement('span', { className: 'ct-toast-text' }, text),
  )
}

/** The leading badge every confirmation wears: a success ring around the check. */
function ToastBadge() {
  return React.createElement(
    'span',
    { className: 'ct-toast-icon', 'aria-hidden': true },
    React.createElement(IconCheck, { size: 12 }),
  )
}

/**
 * Plus glyph for the add button, path data taken verbatim from DSH's own
 * `IconPlusOutline16` so the two controls read as the same affordance.
 */
function IconPlus(props: { size?: number }) {
  const { size = 14 } = props
  return React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 16 16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      'aria-hidden': true,
      focusable: false,
    },
    React.createElement('path', {
      d: 'M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z',
      fill: 'currentColor',
    }),
  )
}

/**
 * One collapsed saved-theme card: the name activates the theme, and the trailing
 * controls open the editor or delete it. The card as a whole is a click target
 * too, but its controls own their clicks.
 */
function ThemeCard(props: {
  entry: SavedTheme
  active: boolean
  /** Locked while another card is open in the editor. */
  disabled: boolean
  t: (key: ThemeKey) => string
  onActivate: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { entry, active, disabled, t, onActivate, onEdit, onDelete } = props

  /** One dense capsule action; `danger` is the borderless delete variant. */
  const action = (label: string, onClick: () => void, danger?: boolean) =>
    React.createElement(
      'button',
      {
        type: 'button',
        className: danger ? 'ct-list-btn ct-list-btn-danger' : 'ct-list-btn',
        onClick,
      },
      label,
    )

  return React.createElement(
    'div',
    {
      className: 'ct-list-row',
      onClick: disabled ? undefined : onActivate,
    },
    React.createElement(
      'span',
      { className: 'ct-list-identity' },
      React.createElement(
        'button',
        {
          className: 'ct-list-name',
          type: 'button',
          disabled,
          // Keeps the keyboard/AT path to loading and stops the card's own
          // handler from loading the same theme a second time.
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation()
            onActivate()
          },
        },
        entry.name,
      ),
    ),
    React.createElement(
      'div',
      {
        className: 'ct-list-actions',
        // The actions own their clicks: without this the card would also load
        // the theme on every edit or delete.
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      },
      // The active card is tagged on the trailing edge, beside its actions.
      active ? React.createElement('span', { className: 'ct-list-badge' }, t('custom.inUse')) : null,
      action(t('custom.edit'), onEdit),
      action(t('custom.delete'), onDelete, true),
    ),
  )
}

/**
 * Which appearance the colour dots edit. `system` resolves through the same
 * media query the shell uses, so the editor opens on what is on screen.
 */
function effectiveMode(scheme: string): Mode {
  if (scheme === 'dark') return 'dark'
  if (scheme === 'light') return 'light'
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemePanel(props: {
  theme: any
  getSelection: () => Selection
  setSelection: (s: Selection) => void
  getCustom: () => CustomState
  setCustom: (theme: CustomTheme) => void
  /** Pick the preset future custom themes seed from, without applying it. */
  setCustomBase: (base: PresetId) => void
  resetCustom: () => CustomTheme
  saved: {
    /** Cached roster; empty until `refresh` resolves. */
    list: () => SavedTheme[]
    activeId: () => string | null
    load: (id: string) => CustomTheme | null
    /** Point the "in use" badge at an entry, or clear it entirely. */
    setActive: (id: string | null) => void
    /** Re-read the roster from the Host, migrating the legacy browser list once. */
    refresh: () => Promise<SavedTheme[]>
    /** Persist the current draft as a new named entry and make it active. */
    create: (name: string) => Promise<SavedTheme[]>
    /** Write the current draft (and name) back to an existing entry. */
    update: (id: string, name: string) => Promise<SavedTheme[]>
    remove: (id: string) => Promise<SavedTheme[]>
  }
  /**
   * The shell's own Toast, or null when the host does not share its primitives
   * module with plugins. Read at render time: the async resolution lands long
   * before the first action a banner can report.
   */
  getHostToast: () => ((props: any) => any) | null
  t: (key: ThemeKey) => string
  /**
   * The shell's own close seat, or null on a host that does not offer it. The
   * settings modal is shell-owned, so this is both the only way to leave after
   * a confirmed discard and the gate on whether guarding a close is worthwhile.
   */
  onRequestClose: (() => void) | null
}) {
  const { theme, getSelection, setSelection, getCustom, setCustom, setCustomBase, resetCustom, saved, getHostToast, t, onRequestClose } = props
  let initScheme = 'system'
  try {
    const snap = theme?.getTheme()
    if (snap?.preference) initScheme = snap.preference
  } catch {}
  const [scheme, setScheme] = React.useState(initScheme)
  // The appearance the dots edit. Following the appearance switch keeps the
  // editor showing the colours that are actually on screen; the toggle inside
  // the editor can still override it for a one-off edit of the other side.
  const [seedMode, setSeedMode] = React.useState<Mode>(() => effectiveMode(initScheme))
  React.useEffect(() => {
    setSeedMode(effectiveMode(scheme))
  }, [scheme])
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
  // The card open in the editor. Null means every card is collapsed and only the
  // "add" button is showing, which is the state the panel opens in.
  const [editing, setEditing] = React.useState<Editing | null>(null)
  // The question raised when a shell close would throw an unsaved draft away.
  const [confirmClose, setConfirmClose] = React.useState(false)
  // The question raised when a click outside the open card would abandon it.
  const [confirmLeave, setConfirmLeave] = React.useState(false)
  // Read by the unmount cleanup, which must not depend on a re-render to see the
  // current draft, and by `saveEdit` so a save in flight is not mistaken for an
  // abandoned edit.
  const editingRef = React.useRef<Editing | null>(null)
  editingRef.current = editing
  const savingRef = React.useRef(false)
  // The appearance on screen, readable from callbacks that outlive one render
  // (the unmount cleanup, and a save that resolved after an await).
  const schemeRef = React.useRef(scheme)
  schemeRef.current = scheme
  // The close guard runs from document listeners that outlive a single render,
  // so every fact it consults is mirrored into a ref.
  const dirtyRef = React.useRef(false)
  dirtyRef.current = editing !== null && isDirty(editing, custom)
  const confirmCloseRef = React.useRef(false)
  confirmCloseRef.current = confirmClose
  const confirmLeaveRef = React.useRef(false)
  confirmLeaveRef.current = confirmLeave
  const pendingDeleteRef = React.useRef<SavedTheme | null>(null)
  pendingDeleteRef.current = pendingDelete
  // `seq` keys the banner so an identical repeated message restarts its cycle
  // instead of reusing the mounted one, whose timer has already run out.
  const [toast, setToast] = React.useState<{ seq: number; text: string } | null>(null)
  const toastSeq = React.useRef(0)

  function showToast(text: string) {
    toastSeq.current += 1
    setToast({ seq: toastSeq.current, text })
  }

  /** Re-read both the list and the active pointer after any list mutation. */
  function syncSaved() {
    setList(saved.list())
    setActiveId(saved.activeId())
  }

  // The roster lives in the Host's files, so it arrives asynchronously. Until
  // it does the list renders empty rather than flashing the legacy browser
  // copy the migration is about to replace.
  React.useEffect(() => {
    let cancelled = false
    void saved
      .refresh()
      .then(() => {
        if (!cancelled) syncSaved()
      })
      .catch((error: unknown) => {
        // Unreachable Host: keep whatever the browser still has, and say which
        // failure this is rather than showing an empty roster as if nothing
        // were saved.
        if (!cancelled) showToast(t(toastKeyFor(error)))
      })
    return () => { cancelled = true }
    // Mount-only: the store owns its own cache and every mutation refreshes it.
  }, [])

  /** Run one roster mutation, surfacing a failed round trip as a banner. */
  async function mutate<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      showToast(t(toastKeyFor(error)))
      return null
    }
  }

  function onLoadSaved(id: string) {
    const next = saved.load(id)
    if (next) setCustomState(next)
    syncSaved()
  }

  /** Snapshot the state an edit must return to when it is cancelled. */
  function beginEditing(id: string | null, name: string, originName: string, originTheme: CustomTheme): Editing {
    return {
      id,
      name,
      originId: saved.activeId(),
      originDraft: getCustom().theme,
      originName,
      originTheme,
      originScheme: schemeRef.current,
    }
  }

  /** Commit an appearance preference, through the Theme service when it is there. */
  function applyAppearance(id: string) {
    setScheme(id)
    try {
      theme?.setTheme(id)
    } catch {}
  }

  /**
   * Preview an appearance on the whole page while its colours are edited: a
   * custom theme carries both variants, so the other one's seeds are only
   * visible once the page actually wears that appearance. A no-op when the page
   * already resolves to `mode` — clicking the active half of the toggle must not
   * quietly turn a `system` preference into a pinned one.
   */
  function previewAppearance(mode: Mode) {
    if (effectiveMode(schemeRef.current) === mode) return
    applyAppearance(mode)
  }

  /**
   * End a preview: put the appearance the editor opened on back. The preference
   * is a global setting the mode toggle only borrows, so it must not survive the
   * editor — not even on save, which commits the colours alone.
   */
  function restoreAppearance(open: Editing) {
    if (schemeRef.current === open.originScheme) return
    applyAppearance(open.originScheme)
  }

  /**
   * Undo an open (unsaved) edit: editing previews live and persists on every
   * change, so abandoning the card has to write the pre-edit theme back.
   */
  function revertEditing(open: Editing) {
    restoreAppearance(open)
    if (open.originId) onLoadSaved(open.originId)
    else {
      setCustom(open.originDraft)
      setCustomState(open.originDraft)
      // Previewing the edited entry moved the active pointer; put it back.
      saved.setActive(null)
    }
  }

  // Closing the settings panel is not a save. Without this an abandoned draft
  // would stay applied, and reopening the panel would show the edits as if they
  // had been committed. Unmount-safe: it only calls storage/theme side effects,
  // never setState.
  React.useEffect(
    () => () => {
      const open = editingRef.current
      if (!open || savingRef.current) return
      // The mode toggle borrowed the appearance preference; a panel that goes
      // away with a draft gives it back here, where setState is no longer safe.
      if (schemeRef.current !== open.originScheme) {
        try {
          theme?.setTheme(open.originScheme)
        } catch {}
      }
      if (open.originId) saved.load(open.originId)
      else {
        setCustom(open.originDraft)
        saved.setActive(null)
      }
    },
    // Store handles are stable for the life of the plugin.
    [],
  )

  // The settings modal is shell-owned: its close button, its mask and Escape all
  // call the shell's own `close`, and an unmount throws the draft above away.
  // The shell offers no veto, so while a draft is dirty those three close
  // affordances are intercepted in the capture phase — the event never reaches
  // the shell — and our own dialog asks first. Its "discard" answer calls the
  // section's `close` seat, the documented way for a section to leave settings.
  //
  // Every other click that lands outside the open card abandons the draft just
  // as surely: it would collapse the editor through the settings nav, another
  // card's edit button or the custom switch, or is simply a click the user meant
  // for somewhere else. Those are intercepted too and asked about with a second
  // question, whose "discard" answer only closes the editor; the panel stays.
  React.useEffect(() => {
    /** The header button carrying the `settings.close` seat, if `node` is in it. */
    function isCloseButton(node: Element): boolean {
      const seat = node.ownerDocument.querySelector('[data-slot="settings.close"]')
      const button = node.closest('button')
      return !!seat && !!button && button.contains(seat)
    }

    /** The settings panel itself; the close seat is unique to it. */
    function settingsPanel(): Element | null {
      const seat = document.querySelector('[data-slot="settings.close"]')
      return seat?.closest('[role="dialog"]') ?? null
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      // Our own questions own Escape while one is up: dismiss the question only.
      if (confirmCloseRef.current || confirmLeaveRef.current) {
        e.preventDefault()
        e.stopPropagation()
        setConfirmClose(false)
        setConfirmLeave(false)
        return
      }
      if (!dirtyRef.current || !onRequestClose) return
      e.preventDefault()
      e.stopPropagation()
      setConfirmClose(true)
    }

    function onClick(e: MouseEvent) {
      // A question already holding the screen keeps its own event flow.
      if (
        !dirtyRef.current ||
        confirmCloseRef.current ||
        confirmLeaveRef.current ||
        pendingDeleteRef.current
      ) {
        return
      }
      const target = e.target instanceof Element ? e.target : null
      if (!target) return
      // Clicks inside the open card — the name field, a dot, cancel/save — are
      // the edit itself, not a way out of it.
      if (target.closest('[data-ct-editor]')) return
      const panel = settingsPanel()
      // A click outside the panel is the mask; inside it, only the header button
      // closes. Everything else in the panel falls to the second question below.
      const isMask = !!panel && !panel.contains(target)
      if (isMask || isCloseButton(target)) {
        // Without a close seat there is no way to honour a confirmed discard, so
        // the close gestures are left to the shell rather than trapped.
        if (!onRequestClose) return
        e.preventDefault()
        e.stopPropagation()
        setConfirmClose(true)
        return
      }
      if (!panel || !panel.contains(target)) return
      e.preventDefault()
      e.stopPropagation()
      setConfirmLeave(true)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('click', onClick, true)
    }
    // Mount-only: the handlers read live state through refs, and the close seat
    // is stable for the life of the panel.
  }, [onRequestClose])

  /** Open a fresh, unsaved theme seeded from the currently selected preset. */
  function startAdd() {
    // Snapshot the previous draft before `resetCustom` overwrites it, so cancel
    // can put the user back on the theme they had. The preset is only the seed
    // for a brand-new theme, so it is stamped as the new theme's base here.
    const origin = beginEditing(
      null,
      nextThemeName(t('custom.defaultName'), list.map((e) => e.name)),
      '',
      getCustom().theme,
    )
    setCustomBase(shownPreset)
    const draft = resetCustom()
    setEditing(origin)
    setCustomState(draft)
  }

  /** Open an existing card for editing; it also becomes the previewed theme. */
  function startEdit(entry: SavedTheme) {
    const next = beginEditing(entry.id, entry.name, entry.name, entry.theme)
    setEditing(next)
    onLoadSaved(entry.id)
  }

  /** Discard the open editor and put the previously applied theme back. */
  function cancelEdit() {
    if (!editing) return
    revertEditing(editing)
    setEditing(null)
    syncSaved()
  }

  /** Commit the open editor: create a new entry, or update the one being edited. */
  async function saveEdit() {
    if (!editing) return
    const name = editing.name.trim() || t('custom.defaultName')
    const id = editing.id
    savingRef.current = true
    const next = await mutate(() => (id === null ? saved.create(name) : saved.update(id, name)))
    savingRef.current = false
    if (next === null) return
    setEditing(null)
    // Saving commits the colours, not the appearance the preview borrowed.
    restoreAppearance(editing)
    syncSaved()
    setCustomState(getCustom().theme)
    showToast(t('custom.toast.saved'))
  }

  async function onConfirmDelete() {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    // A deleted card must not stay open in the editor.
    setEditing((cur) => (cur?.id === id ? null : cur))
    const next = await mutate(() => saved.remove(id))
    if (next === null) return
    setActiveId(saved.activeId())
    // Removing the active entry re-seats the first remaining one, so the draft
    // has to follow it rather than keeping the deleted theme's seeds on screen.
    setCustomState(getCustom().theme)
    setList(saved.list())
    // Deleting the last card leaves custom mode with nothing to reopen, so the
    // colours go back to the preset the picker is showing. Custom mode itself
    // stays on — deleting every theme is a common step before creating a new
    // one, and forcing the switch off would only make the user turn it back on.
    // The draft is reseeded from that preset as well: otherwise the deleted
    // theme would stay in the stored blob and come back as a "new" unsaved
    // theme the next time the editor opens.
    if (next.length === 0) {
      setEditing(null)
      setCustomBase(shownPreset)
      setCustomState(resetCustom())
    }
  }

  function pickScheme(id: string) {
    applyAppearance(id)
    // A deliberate pick while the editor is open becomes the edit's own
    // baseline: leaving the editor must restore this, not the value from before
    // it opened — the user just asked for this appearance.
    setEditing((cur) => (cur ? { ...cur, originScheme: id } : cur))
  }

  /**
   * The preset picker. Unreachable while custom mode is on — the picker is
   * disabled then — so this only ever applies the chosen preset.
   */
  function pickPreset(id: PresetId) {
    setSelectionState(id)
    setSelection(id)
    setShownPreset(id)
  }

  /**
   * The custom switch. Preset and custom are independent selections: turning
   * custom on leaves the preset row untouched, and turning it off goes back to
   * the preset the user had chosen, not to the custom theme's own base.
   */
  function toggleCustom(on: boolean) {
    if (on) {
      setSelectionState(CUSTOM_SELECTION)
      setSelection(CUSTOM_SELECTION)
      // Entering custom mode may have just seeded a fresh palette.
      setCustomState(getCustom().theme)
      return
    }
    // The editor only exists inside custom mode, so leaving closes any draft —
    // and an unsaved one has to be rolled back rather than left applied.
    if (editing) revertEditing(editing)
    setEditing(null)
    setSelectionState(shownPreset)
    setSelection(shownPreset)
    setShownPreset(shownPreset)
  }

  function editCustom(next: CustomTheme) {
    setCustomState(next)
    setCustom(next)
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
        React.createElement('div', { className: 'ct-row-desc' }, t(customOn ? 'presets.disabled' : 'presets.desc')),
      ),
      React.createElement(SchemeMenu, {
        value: customOn ? shownPreset : selection,
        options: presetOptions,
        onSelect: (v) => pickPreset(v as PresetId),
        // Custom mode owns the colours, and the preset it inherited is fixed
        // for as long as it stays on.
        disabled: customOn,
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
    /**
     * One editable colour. The dot edits whichever appearance the mode toggle
     * is on; the tooltip carries the seed's plain-language description.
     */
    type SeedDot = {
      key: string
      name: string
      hint: string
      value: string
      onChange: (v: string) => void
    }

    /** A group row: its name on the left, every seed's dot on the right. */
    const dotRow = (key: string, label: string, dots: SeedDot[]) =>
      React.createElement(
        'div',
        { className: 'ct-seed-row', key },
        React.createElement('div', { className: 'ct-seed-label' }, label),
        React.createElement(
          'div',
          { className: 'ct-seed-dots' },
          ...dots.map((d) =>
            React.createElement(
              'label',
              {
                key: d.key,
                className: 'ct-seed-dot',
                // The wrapper paints the colour; the input inside is invisible.
                style: { background: d.value },
                // Names the token this swatch edits; rendered as the styled
                // bubble by `.ct-seed-dot::after` (the invisible input on top is
                // the real hover target, so a native `title` would never fire).
                'data-tip': d.name,
              },
              React.createElement('input', {
                className: 'ct-seed-input',
                type: 'color',
                value: d.value,
                // The bubble above names the token; assistive tech also gets the
                // fuller description, which the bubble is too small to carry.
                'aria-label': `${d.name} — ${d.hint}`,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => d.onChange(e.target.value.toUpperCase()),
              }),
            ),
          ),
        ),
      )

    const pair = (key: 'accent' | 'green' | 'amber' | 'red', title: ThemeKey, desc: ThemeKey): SeedDot => ({
      key,
      name: t(title),
      hint: t(desc),
      value: custom[key][seedMode],
      onChange: (v: string) => editCustom({ ...custom, [key]: { ...custom[key], [seedMode]: v } }),
    })

    // One dot per role, always background then foreground: the ramp is
    // per-appearance now, so these two dots only ever move the appearance the
    // toggle is on — the light dots can no longer change the dark body text.
    // Which end each role sits on flips with the appearance, so it is resolved
    // rather than hard-coded.
    const neutralDots: SeedDot[] = NEUTRAL_ROLES.map((role) => {
      const end = neutralEndForRole(seedMode, role)
      return {
        key: `neutral-${end}`,
        name: t(role === 'background' ? 'custom.neutral.roleBackground' : 'custom.neutral.roleForeground'),
        hint: `${t('custom.neutral.title')} · ${t('custom.neutral.desc')} — ${t(end === 'lightest' ? 'custom.neutral.lightest' : 'custom.neutral.darkest')}`,
        value: custom.neutral[seedMode][end],
        onChange: (v: string) =>
          editCustom({
            ...custom,
            neutral: { ...custom.neutral, [seedMode]: { ...custom.neutral[seedMode], [end]: v } },
          }),
      }
    })

    const seedDots: SeedDot[] = [
      pair('accent', 'custom.accent.title', 'custom.accent.desc'),
      ...neutralDots,
      pair('green', 'custom.green.title', 'custom.green.desc'),
      pair('amber', 'custom.amber.title', 'custom.amber.desc'),
      pair('red', 'custom.red.title', 'custom.red.desc'),
    ]

    const shikiDots: SeedDot[] = SHIKI_KEYS.map((k) => ({
      key: k,
      name: t(`shiki.${k}` as ThemeKey),
      hint: t('custom.shiki.desc'),
      value: custom.shiki[k][seedMode],
      onChange: (v: string) =>
        editCustom({ ...custom, shiki: { ...custom.shiki, [k]: { ...custom.shiki[k], [seedMode]: v } } }),
    }))

    /** The light/dark segmented control above the dots. */
    // Picking a half switches which seeds the dots edit and previews that
    // appearance on the page, so the colours being edited are the ones on
    // screen. The preview is temporary: leaving the editor restores the
    // preference it borrowed.
    const modeButton = (id: Mode, label: string) =>
      React.createElement(
        'button',
        {
          key: id,
          type: 'button',
          className: seedMode === id ? 'ct-mode-btn ct-mode-btn-on' : 'ct-mode-btn',
          'aria-pressed': seedMode === id,
          onClick: () => {
            setSeedMode(id)
            previewAppearance(id)
          },
        },
        label,
      )

    const modeToggle = React.createElement(
      'div',
      { className: 'ct-mode', role: 'group', 'aria-label': t('custom.mode.label') },
      modeButton('light', t('custom.seed.light')),
      modeButton('dark', t('custom.seed.dark')),
    )

    // The open editor: a name field, the two colour groups, then cancel/save.
    // Both a brand-new draft and a reopened saved entry share this body.
    const editorName = React.createElement('input', {
      className: 'ct-editor-name',
      type: 'text',
      value: editing?.name ?? '',
      placeholder: t('custom.name.placeholder'),
      'aria-label': t('custom.name.placeholder'),
      autoFocus: true,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setEditing((cur) => (cur ? { ...cur, name: e.target.value } : cur)),
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') void saveEdit()
        else if (e.key === 'Escape') cancelEdit()
      },
    })

    const editorActions = React.createElement(
      'div',
      { className: 'ct-editor-actions' },
      React.createElement('button', { type: 'button', className: 'ct-btn', onClick: cancelEdit }, t('custom.cancel')),
      React.createElement(
        'button',
        { type: 'button', className: 'ct-btn ct-btn-primary', onClick: () => void saveEdit() },
        t('custom.save'),
      ),
    )

    const editorCard = (key: string) =>
      React.createElement(
        'div',
        // `data-ct-editor` marks the one region the click-away guard lets through:
        // everything the user does to the draft happens inside this node.
        { className: 'ct-editor', key, 'data-ct-editor': 'true' },
        React.createElement(
          'div',
          { className: 'ct-editor-head' },
          editorName,
          modeToggle,
        ),
        dotRow('seeds', t('custom.group.seeds'), seedDots),
        dotRow('shiki', t('custom.group.shiki'), shikiDots),
        editorActions,
      )

    const cards: any[] = list.map((entry) =>
      editing && editing.id === entry.id
        ? editorCard(entry.id)
        : React.createElement(ThemeCard, {
            key: entry.id,
            entry,
            active: activeId === entry.id,
            // One editor at a time: other cards keep their actions, but a click
            // on the card body must not fight the open draft for the preview.
            disabled: editing !== null,
            t,
            onActivate: () => onLoadSaved(entry.id),
            onEdit: () => startEdit(entry),
            onDelete: () => setPendingDelete(entry),
          }),
    )

    // A new theme is appended above the add button, matching the order the cards
    // are listed in.
    if (editing && editing.id === null) cards.push(editorCard('new-editor'))

    children.push(
      React.createElement('div', { className: 'ct-list', key: 'saved-list' }, ...cards),
      React.createElement(
        'button',
        {
          key: 'add',
          type: 'button',
          className: 'ct-add-btn',
          disabled: editing !== null,
          onClick: startAdd,
        },
        React.createElement(IconPlus, null),
        t('custom.add'),
      ),
    )
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

  // The unsaved-draft question. Confirming discards: the panel unmounts on the
  // shell's close and the unmount cleanup writes the pre-edit theme back, so
  // nothing is reverted here.
  if (confirmClose && editing && onRequestClose) {
    children.push(
      React.createElement(ConfirmDialog, {
        key: 'confirm-close',
        title: t('custom.unsaved.title'),
        description: t('custom.unsaved.desc').replace(
          '{0}',
          editing.name.trim() || t('custom.defaultName'),
        ),
        confirmLabel: t('custom.unsaved.confirm'),
        cancelLabel: t('custom.unsaved.cancel'),
        onConfirm: () => {
          setConfirmClose(false)
          onRequestClose()
        },
        onCancel: () => setConfirmClose(false),
      }),
    )
  }

  // The click-away question. Confirming only collapses the open card through the
  // same path as Cancel — `cancelEdit` writes the pre-edit theme back — so the
  // settings panel itself stays open and nothing else here has to be reverted.
  if (confirmLeave && editing) {
    children.push(
      React.createElement(ConfirmDialog, {
        key: 'confirm-leave',
        title: t('custom.unsaved.title'),
        description: t('custom.unsaved.leaveDesc').replace(
          '{0}',
          editing.name.trim() || t('custom.defaultName'),
        ),
        confirmLabel: t('custom.unsaved.leaveConfirm'),
        cancelLabel: t('custom.unsaved.cancel'),
        onConfirm: () => {
          setConfirmLeave(false)
          cancelEdit()
        },
        onCancel: () => setConfirmLeave(false),
      }),
    )
  }

  // Outside the custom-mode branch: the banner reports the action, not the
  // editor state, so switching the editor off mid-toast must not kill it.
  if (toast) {
    const onDone = () => setToast((cur) => (cur?.seq === toast.seq ? null : cur))
    // The shell's toast when the host shares it — same banner the rest of DSH
    // raises, portal included; the local one only covers a host without the
    // primitives module.
    const HostToast = getHostToast()
    children.push(
      HostToast
        ? React.createElement(HostToast, {
            key: `toast-${String(toast.seq)}`,
            text: toast.text,
            icon: React.createElement(ToastBadge),
            onDone,
          })
        : React.createElement(Toast, {
            key: `toast-${String(toast.seq)}`,
            text: toast.text,
            onDone,
          }),
    )
  }

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: 760, paddingBottom: 8 } },
    ...children,
  )
}
