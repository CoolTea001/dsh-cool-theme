/**
 * Theme settings UI: scheme selector, preset picker, and the custom colour editor.
 */

import * as React from 'react'
import {
  CUSTOM_PRESET_ID,
  THEME_APPEARANCES,
  THEME_ARCHIVE_EXTENSION,
  THEME_IMAGE_MAX_BYTES,
  THEME_VIDEO_MAX_BYTES,
  assetTypeOf,
  emptyBackgroundSide,
  errorMessage,
  newThemeId,
  themeAssetUrl,
  type ThemeAssetKind,
  type ThemeBackground,
  type ThemeBackgroundSide,
} from '../contract.js'
import { type PresetId, presetOptions } from './presets.js'
import { type ThemeKey } from './locales.js'
import {
  ThemeApiUnavailableError,
  exportTheme,
  importTheme,
  uploadThemeMedia,
} from './theme-files.js'
import {
  backgroundHasMedia,
  backgroundKindOf,
  prepareBackgroundMedia,
  type ResolvedBackground,
  type ResolvedBackgroundSide,
} from './background.js'
import {
  type BorderSeed,
  type CustomTheme,
  type Mode,
  type NeutralRamp,
  type SavedTheme,
  type SeedPair,
  SHIKI_KEYS,
  borderCss,
  nextThemeName,
  sameBackground,
} from './custom.js'
import {
  ALPHA_CHECKERBOARD,
  PICKER_GAP,
  PICKER_HEIGHT,
  PICKER_MARGIN,
  PICKER_WIDTH,
  splitAlpha,
} from './color-picker.js'
import { BackgroundSection, ColorPopover, SeedDotRow, type SeedDot } from './custom-editor.js'
import { IconDelete, IconEdit, IconExport, IconImport, IconPlus } from './icons.js'
// The shell's own controls, resolved at runtime from the frozen platform module
// table (see ui-primitives.d.ts and tsdown's `deps.neverBundle`). Reusing them
// rather than restyling a copy is the package's own rule, and it is what keeps
// this panel tracking DSH's menu, switch, segmented and tooltip changes without
// a plugin release. The one glyph still taken from the shell is the select's
// chevron: every action icon is this plugin's own (see icons.tsx).
import {
  Button,
  IconChevronDownOutlineRegular,
  Menu,
  SegmentedControl,
  Switch,
  Toast,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'

/** Reserved menu value that switches to the user-defined theme. */
export const CUSTOM_SELECTION = CUSTOM_PRESET_ID
export type Selection = PresetId | typeof CUSTOM_SELECTION

export type CustomState = { base: PresetId; theme: CustomTheme }

/**
 * Base id of the light/dark control in the colour editor — and the only place
 * that string is written. The shell's `SegmentedControl` derives both the tab
 * ids (`<id>-<value>`) and the panel ids (`<id>-<value>-panel`) from it, so the
 * tabpanel that answers them has to be built from the same value: a second
 * literal would drift silently and leave `aria-controls` pointing at nothing.
 */
const SEED_MODE_CONTROL_ID = 'ct-seed-mode'

/**
 * Key of the border swatch in the shared colour popover. It is the one seed that
 * is not a plain fill — it carries an opacity too — which is why its picker is
 * the alpha-aware one and one control taller (see `seedPickerHeight` in
 * custom-editor.tsx).
 */
const BORDER_SEED_KEY = 'border'

/**
 * The one glyph size this panel draws at, passed explicitly by every call site.
 * The two halves of a row disagree on their own: the shell's chevron falls back
 * to 14 while this plugin's icons default to 16, so leaving it implicit would
 * silently mix two scales in the same panel. 14 is what the shell's own settings
 * pages pass.
 */
const ICON_SIZE = 14

/** Bytes in one megabyte, for naming the upload cap in the user's units. */
const BYTES_PER_MB = 1024 * 1024
/** The upload caps as the whole megabytes a localized message can name. */
const THEME_IMAGE_MAX_MB = String(THEME_IMAGE_MAX_BYTES / BYTES_PER_MB)
const THEME_VIDEO_MAX_MB = String(THEME_VIDEO_MAX_BYTES / BYTES_PER_MB)

/**
 * A cheap sanity gate before decoding: the picker can hand over a camera RAW of
 * hundreds of megabytes, so an image far past the cap is refused before the
 * browser tries to decode it. A video is never re-encoded, so it gets no such
 * allowance and is refused as soon as it passes the upload cap itself.
 */
const BACKGROUND_PICK_MAX_IMAGE_BYTES = THEME_IMAGE_MAX_BYTES * 4

/** The failure shapes the Host reports, most specific first. */
const IMPORT_FAILURE_MATCHERS: readonly (readonly [RegExp, ThemeKey])[] = [
  [
    /not a zip archive|zip central directory|zip local header|zip64|unsupported zip compression/i,
    'custom.importFailed.notArchive',
  ],
  [/missing theme\.json/i, 'custom.importFailed.noDocument'],
  [/newer than this plugin/i, 'custom.importFailed.tooNew'],
  [/carries media|unsupported media type|unusable media path/i, 'custom.importFailed.media'],
  [/larger than|too large|too many files/i, 'custom.importFailed.tooLarge'],
  [/not valid JSON|must be|unusable theme|did not report/i, 'custom.importFailed.badDocument'],
]

/**
 * Which message an import failure deserves. The Host answers with its own
 * reason, so the shape of that reason is what selects the localized text; an
 * unrecognised failure keeps the Host's own words rather than hiding them.
 */
function importFailureMessage(t: (key: ThemeKey) => string, error: unknown): string {
  const message = errorMessage(error)
  if (error instanceof ThemeApiUnavailableError) return t('custom.toast.unavailable')
  const key = IMPORT_FAILURE_MATCHERS.find(([pattern]) => pattern.test(message))?.[1] ?? 'custom.importFailed.other'
  return t(key).replace('{0}', message)
}

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
  /** Committed wallpaper of the entry being edited; null when it had none. */
  originBackground: ThemeBackground | null
  /** The wallpaper draft this card is editing. */
  background: ThemeBackground | null
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

/** Structural equality of one border seed: both its channels have to match. */
function sameBorder(a: BorderSeed | undefined, b: BorderSeed | undefined): boolean {
  return a?.color === b?.color && a?.alpha === b?.alpha
}

/** Structural equality over every seed, ignoring key order. */
function sameSeeds(a: CustomTheme, b: CustomTheme): boolean {
  if (!sameRamp(a.neutral?.light, b.neutral?.light) || !sameRamp(a.neutral?.dark, b.neutral?.dark)) return false
  if (!samePair(a.accent, b.accent) || !samePair(a.green, b.green)) return false
  if (!samePair(a.amber, b.amber) || !samePair(a.red, b.red)) return false
  if (!sameBorder(a.border?.light, b.border?.light) || !sameBorder(a.border?.dark, b.border?.dark)) return false
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
 * entry is dirty only once its name, one of its seeds or its wallpaper moved.
 * A picked image or video that has not been uploaded counts too: it lives only
 * in this panel's memory until Save uploads it.
 */
function isDirty(
  open: Editing,
  current: CustomTheme,
  currentBackground: ThemeBackground | null,
  hasPendingMedia: boolean,
): boolean {
  if (open.id === null) return true
  return (
    open.name.trim() !== open.originName.trim()
    || !sameSeeds(current, open.originTheme)
    || !sameBackground(currentBackground, open.originBackground)
    || hasPendingMedia
  )
}

/** A picked image or video waiting for Save to upload it. */
type PendingMedia = { file: File; url: string; kind: ThemeAssetKind }

/**
 * A draft's background with both sides materialized. A side is seeded the first
 * time it is touched, so the shape the panel holds is always the shape the
 * document is written with — and a save can never write half a background.
 */
function materializeBackground(background: ThemeBackground | null): ThemeBackground {
  return {
    light: background?.light ?? emptyBackgroundSide('light'),
    dark: background?.dark ?? emptyBackgroundSide('dark'),
  }
}

/** One side of a draft's background patched, with the other side left intact. */
function patchBackgroundSide(
  background: ThemeBackground | null,
  mode: Mode,
  patch: Partial<ThemeBackgroundSide>,
): ThemeBackground {
  const base = materializeBackground(background)
  return { ...base, [mode]: { ...base[mode], ...patch } }
}

/**
 * The panel's value picker: a trigger in the row, the shell's `Menu` for the
 * list. Everything the list needs — outside pointerdown, Escape, the arrow
 * walk, the focus return to the trigger, the translucent material, the
 * viewport-clamped portal — belongs to the primitive, so this owns `open` and
 * which label the trigger shows, and nothing else.
 */
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
  const selected = options.find((o) => o.value === value)
  const expanded = open && !disabled
  return React.createElement(Menu, {
    open: expanded,
    align: 'end',
    side: 'bottom',
    // The settings card clips its own overflow, so the list leaves the card:
    // portalled, exactly as DSH's own settings switcher portals its menu.
    portal: true,
    items: options.map((o) => ({ id: o.value, label: o.label })),
    selectedId: value,
    onSelect: (v: string) => {
      setOpen(false)
      onSelect(v)
    },
    onClose: () => setOpen(false),
    anchor: React.createElement(
      'button',
      {
        type: 'button',
        className: 'ct-select',
        disabled,
        'aria-haspopup': 'menu',
        'aria-expanded': expanded,
        onClick: () => setOpen(!open),
      },
      React.createElement('span', { className: 'ct-select-label' }, selected?.label ?? ''),
      React.createElement(
        'span',
        { className: 'ct-select-chevron' },
        React.createElement(IconChevronDownOutlineRegular, { size: ICON_SIZE }),
      ),
    ),
  })
}

/**
 * Confirmation dialog for destructive actions, mirroring DSH's own Modal
 * (design-platform mask token + blur, `radius-panel` card on layer-2,
 * prominent shadow) and the footer its `RiskConfirmation` lays out: an outline
 * cancel beside the confirming action.
 * Still rendered inline rather than through the shell's `Modal`: its Escape has
 * to take part in the panel's own leave-the-draft questions, and a shell-owned
 * modal layer would answer the key before this dialog could.
 */
function ConfirmDialog(props: {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  /**
   * Tints the confirming action with the error token. DSH never fills a
   * destructive button solid — its own delete affordance is an outlined face in
   * the error colour — so the caller names which question is the destructive
   * one and the pair switches to that recipe.
   */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { title, description, confirmLabel, cancelLabel, danger, onConfirm, onCancel } = props
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
        // The shell's own action pair, in the order its `RiskConfirmation`
        // modal footer uses: an outline cancel, then the confirming action.
        // The min-widths are that component's own, so both dialogs line up.
        React.createElement(
          Button,
          { variant: 'outline', className: 'ct-action-cancel', onClick: onCancel },
          cancelLabel,
        ),
        React.createElement(
          Button,
          {
            variant: danger ? 'outline' : 'primary',
            className: danger ? 'ct-action-confirm ct-danger' : 'ct-action-confirm',
            onClick: onConfirm,
          },
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

/**
 * Which banner a failed background upload deserves. The Host and the browser
 * answer with different words for the same three causes — an unsupported file,
 * an oversized one, and a route that is not mounted — so the message selects
 * the localized text by its shape and keeps anything unrecognised verbatim.
 */
function backgroundFailureMessage(
  t: (key: ThemeKey) => string,
  error: unknown,
  kind: ThemeAssetKind,
): string {
  if (error instanceof ThemeApiUnavailableError) return t('custom.toast.unavailable')
  const message = errorMessage(error)
  if (/too large|larger than|413/i.test(message)) {
    return t('background.tooLarge').replace(
      '{0}',
      kind === 'video' ? THEME_VIDEO_MAX_MB : THEME_IMAGE_MAX_MB,
    )
  }
  if (/unsupported|decode|encode|format/i.test(message)) return t('background.badType')
  return t('background.uploadFailed')
}

/**
 * One collapsed saved-theme card: the name activates the theme, and the trailing
 * controls export it, open the editor or delete it. The card as a whole is a
 * click target too, but its controls own their clicks.
 */
function ThemeCard(props: {
  entry: SavedTheme
  active: boolean
  /** Locked while another card is open in the editor. */
  disabled: boolean
  t: (key: ThemeKey) => string
  onActivate: () => void
  /** Download this card as an archive. */
  onExport: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { entry, active, disabled, t, onActivate, onExport, onEdit, onDelete } = props

  /**
   * One square icon action. The glyph is decorative, so the label travels as
   * the accessible name and as the shell's own `Tooltip` above the button.
   * `danger` paints the error face; `leave` marks the button on the markup the
   * outside-click guard watches (see that guard) — it is not a visual state.
   */
  const action = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    marks?: { danger?: boolean; leave?: boolean },
  ) => {
    const button = React.createElement(
      'button',
      {
        type: 'button',
        className: marks?.danger ? 'ct-list-btn ct-list-btn-danger' : 'ct-list-btn',
        'aria-label': label,
        ...(marks?.leave ? { 'data-ct-leave': 'true', 'data-ct-entry': entry.id } : {}),
        onClick,
      },
      icon,
    )
    return React.createElement(Tooltip, { label, side: 'top', gap: 6, children: button })
  }

  return React.createElement(
    'div',
    {
      className: 'ct-list-row',
      // Marks the gestures that would abandon an open draft — loading this card
      // and opening it in the editor — so the outside-click guard asks about
      // exactly those and nothing else. Export and delete are excluded: neither
      // disturbs the open card, and delete raises its own confirmation.
      'data-ct-leave': 'true',
      'data-ct-entry': entry.id,
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
        // the theme on every edit, export or delete.
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      },
      // The active card is tagged on the trailing edge, beside its actions.
      active ? React.createElement('span', { className: 'ct-list-badge' }, t('custom.inUse')) : null,
      action(
        t('custom.edit'),
        React.createElement(IconEdit, { size: ICON_SIZE }),
        onEdit,
        { leave: true },
      ),
      action(t('custom.export'), React.createElement(IconExport, { size: ICON_SIZE }), onExport),
      action(
        t('custom.delete'),
        React.createElement(IconDelete, { size: ICON_SIZE }),
        onDelete,
        { danger: true },
      ),
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

/** The slice of the shell's Theme service this panel reads and writes. */
type ThemeService = {
  getTheme?: () => { preference?: string } | null
  setTheme?: (preference: string) => void
} | undefined

export function ThemePanel(props: {
  theme: ThemeService
  getSelection: () => Selection
  setSelection: (s: Selection) => void
  getCustom: () => CustomState
  setCustom: (theme: CustomTheme) => void
  /** Pick the preset future custom themes seed from, without applying it. */
  setCustomBase: (base: PresetId) => void
  resetCustom: () => CustomTheme
  /** Whether the sidebar keeps DSH's native translucency (darwin only). */
  getSidebarTransparent: () => boolean
  setSidebarTransparent: (on: boolean) => void
  /**
   * Paint the draft's wallpaper on the page while its card is open. `undefined`
   * restores the committed background of the active entry; `null` says the open
   * draft deliberately has none and the committed one must stay hidden.
   */
  onPreviewBackground: (background: ResolvedBackground | null | undefined) => void
  saved: {
    /** Cached roster; empty until `refresh` resolves. */
    list: () => SavedTheme[]
    activeId: () => string | null
    load: (id: string) => CustomTheme | null
    /** Point the "in use" badge at an entry, or clear it entirely. */
    setActive: (id: string | null) => void
    /** Re-read the roster from the Host, migrating the legacy browser list once. */
    refresh: () => Promise<SavedTheme[]>
    /** Persist a new entry (with its pre-minted id) and make it active. */
    create: (id: string, name: string, background: ThemeBackground | null) => Promise<SavedTheme[]>
    /** Write the current draft (and name) back to an existing entry. */
    update: (id: string, name: string, background: ThemeBackground | null) => Promise<SavedTheme[]>
    remove: (id: string) => Promise<SavedTheme[]>
  }
  t: (key: ThemeKey) => string
  /**
   * The shell's own close seat, or null on a host that does not offer it. The
   * settings modal is shell-owned, so this is both the only way to leave after
   * a confirmed discard and the gate on whether guarding a close is worthwhile.
   */
  onRequestClose: (() => void) | null
}) {
  const {
    theme,
    getSelection,
    setSelection,
    getCustom,
    setCustom,
    setCustomBase,
    resetCustom,
    saved,
    getSidebarTransparent,
    setSidebarTransparent,
    onPreviewBackground,
    t,
    onRequestClose,
  } = props
  let initScheme = 'system'
  try {
    const snap = theme?.getTheme?.()
    if (snap?.preference) initScheme = snap.preference
  } catch {
    // The Theme service is optional: without it the panel starts on `system`.
  }
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
  // The sidebar-transparency switch mirrors the persisted preference. It is
  // independent of the theme selection, so it holds its own local state.
  const [sidebarTransparent, setSidebarTransparentState] = React.useState<boolean>(() => getSidebarTransparent())
  const [pendingDelete, setPendingDelete] = React.useState<SavedTheme | null>(null)
  // An archive being read. The picker is the browser's, so this only gates the
  // import button and the second picker opening while the first is still in
  // flight.
  const [importing, setImporting] = React.useState(false)
  /** The hidden picker the import button opens. */
  const importInputRef = React.useRef<HTMLInputElement | null>(null)
  /** The hidden picker the background editor opens. */
  const backgroundInputRef = React.useRef<HTMLInputElement | null>(null)
  /**
   * The appearance the picker was opened for. The picker is one shared input, so
   * the side a file belongs to is recorded when the dialog opens rather than
   * read from the toggle when it closes — the user may switch the toggle while
   * the browser's file dialog holds the screen.
   */
  const pickModeRef = React.useRef<Mode>('light')
  // An image or video picked for the open draft, one per appearance, before
  // Save uploads it. The object URL is the preview; `file` is what gets
  // compressed (images only) and `kind` decides how that preview is painted.
  const [pending, setPending] = React.useState<Record<Mode, PendingMedia | null>>({
    light: null,
    dark: null,
  })
  /** Whether any appearance has a file waiting to be uploaded by Save. */
  const hasPendingMedia = THEME_APPEARANCES.some((mode) => pending[mode] !== null)
  // The card open in the editor. Null means every card is collapsed and only the
  // "add" button is showing, which is the state the panel opens in.
  const [editing, setEditing] = React.useState<Editing | null>(null)
  // The question raised when a shell close would throw an unsaved draft away.
  const [confirmClose, setConfirmClose] = React.useState(false)
  // The question raised when a gesture outside the open card would abandon it.
  // The entry records a gesture that was already resolved to another card, so a
  // confirmed discard can carry on into it instead of dropping the user's click.
  const [pendingLeave, setPendingLeave] = React.useState<{
    entry: SavedTheme | null
    edit: boolean
  } | null>(null)
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
  dirtyRef.current =
    editing !== null
    && isDirty(editing, custom, editing.background, hasPendingMedia)
  const confirmCloseRef = React.useRef(false)
  confirmCloseRef.current = confirmClose
  const pendingLeaveRef = React.useRef<{ entry: SavedTheme | null; edit: boolean } | null>(null)
  pendingLeaveRef.current = pendingLeave
  // The guard's click handler outlives one render, so the roster it searches for
  // the clicked card is mirrored the same way.
  const listRef = React.useRef<SavedTheme[]>(list)
  listRef.current = list
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

  // --- background image/video -----------------------------------------------
  //
  // A picked file is not uploaded until Save: the editor previews it from an
  // object URL, and cancelling has to leave the theme's directory untouched.
  // One pick is held per appearance, because the two sides are edited and saved
  // independently. The ref mirrors the state for the unmount cleanup, which must
  // revoke every URL even when the panel closes mid-edit.
  const pendingRef = React.useRef<Record<Mode, PendingMedia | null>>({
    light: null,
    dark: null,
  })
  pendingRef.current = pending

  React.useEffect(
    () => () => {
      for (const mode of THEME_APPEARANCES) {
        const pick = pendingRef.current[mode]
        if (pick) URL.revokeObjectURL(pick.url)
      }
    },
    [],
  )

  /** Replace one appearance's pending pick, revoking the URL it supersedes. */
  function replacePending(mode: Mode, pick: PendingMedia | null) {
    const previous = pendingRef.current[mode]
    if (previous) URL.revokeObjectURL(previous.url)
    const next: Record<Mode, PendingMedia | null> = {
      ...pendingRef.current,
      [mode]: pick,
    }
    // The ref is written here rather than waiting for the next render: two picks
    // in one tick must not revoke the same URL twice or leak the second's.
    pendingRef.current = next
    setPending(next)
  }

  /** Drop every pending pick; the card that owned them is going away. */
  function clearPending() {
    for (const mode of THEME_APPEARANCES) replacePending(mode, null)
  }

  /** One side's inputs, folded into a string the preview effect can compare. */
  function backgroundSideKey(side: ThemeBackgroundSide | undefined): string {
    return side ? `${side.asset}:${String(side.opacity)}:${String(side.blur)}:${String(side.enabled)}` : ''
  }

  /**
   * What the editor paints: the pending pick when there is one, otherwise the
   * stored asset of the entry being edited — resolved per appearance, because
   * each side has its own media and its own switch. Every input of the preview
   * effect is in the key, so a slider move repaints without rebuilding the
   * palette.
   */
  const backgroundKey =
    editing === null
      ? ''
      : [
          editing.id ?? 'new',
          backgroundSideKey(editing.background?.light),
          backgroundSideKey(editing.background?.dark),
          pending.light?.url ?? '',
          pending.dark?.url ?? '',
        ].join('|')

  React.useEffect(() => {
    if (!editing) {
      // No editor: hand the page back to the active entry's committed wallpaper.
      onPreviewBackground(undefined)
      return
    }
    const background = editing.background
    const resolve = (mode: Mode): ResolvedBackgroundSide => {
      const side = background?.[mode]
      // Switched off, or nothing picked for this appearance: this side paints
      // nothing, and must not let the committed wallpaper show through either.
      if (!side || !side.enabled) return { url: null, kind: null, opacity: 0, blur: 0 }
      const stored = editing.id && side.asset ? themeAssetUrl(editing.id, side.asset) : null
      const pendingMedia = pending[mode]
      const url = pendingMedia?.url ?? stored
      const kind = pendingMedia?.kind ?? (side.asset ? assetTypeOf(side.asset)?.kind ?? null : null)
      return url && kind
        ? { url, kind, opacity: side.opacity, blur: side.blur }
        : { url: null, kind: null, opacity: 0, blur: 0 }
    }
    const resolved: ResolvedBackground = { light: resolve('light'), dark: resolve('dark') }
    // A draft with no media on either side is a draft with no wallpaper: pass
    // null so the committed one is hidden rather than showing through.
    onPreviewBackground(backgroundHasMedia(resolved) ? resolved : null)
    // `backgroundKey` names every input of this effect.
  }, [backgroundKey])

  // --- colour picker popover ------------------------------------------------
  //
  // The seed dots open a react-colorful popover instead of the platform's own
  // colour dialog. One popover is shared by all thirty dots: `pickerDotKey`
  // names the seed being edited and `pickerPos` holds the viewport coordinates
  // the popover is pinned at. It is rendered as a `position:fixed` child of the
  // editor card — fixed keeps it outside every `overflow:hidden` ancestor (the
  // settings dialog clips its card), while staying inside the card's subtree,
  // which is what lets the dirty-draft click-away guard recognise its clicks as
  // part of the edit.
  const [pickerDotKey, setPickerDotKey] = React.useState<string | null>(null)
  const [pickerPos, setPickerPos] = React.useState<{ left: number; top: number } | null>(null)
  const pickerOpen = pickerDotKey !== null
  // The Escape guard lives in a mount-only document listener, so it reads the
  // open state through this ref rather than a stale closure.
  const pickerOpenRef = React.useRef(false)
  pickerOpenRef.current = pickerOpen
  /** The swatch the popover is anchored to; re-read on every reposition. */
  const pickerAnchorRef = React.useRef<HTMLElement | null>(null)
  /** The popover node itself; outside-pointerdown detection needs its bounds. */
  const pickerPopRef = React.useRef<HTMLDivElement | null>(null)
  /**
   * Height of the box the open popover was placed with, captured beside its
   * anchor. The two popovers differ by one control, and a scroll or resize has
   * to rebuild the same box; the clicked dot is not in that scope, so its own
   * fact travels here rather than being re-derived from the dot's key.
   */
  const pickerHeightRef = React.useRef(PICKER_HEIGHT)

  /**
   * Viewport coordinates that put the popover beside its anchor swatch. The
   * caller passes the height of the box being opened, because the border seed's
   * popover carries one more row than every other seed's.
   */
  function placePicker(anchor: HTMLElement, height: number): { left: number; top: number } {
    const rect = anchor.getBoundingClientRect()
    const viewW = window.innerWidth
    const viewH = window.innerHeight
    // Right-align with the swatch: the dots hug the panel's trailing edge, so
    // the popover grows leftward into the free column beside the labels.
    const left = Math.min(
      Math.max(PICKER_MARGIN, rect.right - PICKER_WIDTH),
      Math.max(PICKER_MARGIN, viewW - PICKER_WIDTH - PICKER_MARGIN),
    )
    // Drop below when there is room; otherwise hang above the swatch.
    const below = rect.bottom + PICKER_GAP + height <= viewH - PICKER_MARGIN
    const top = below ? rect.bottom + PICKER_GAP : Math.max(PICKER_MARGIN, rect.top - PICKER_GAP - height)
    return { left, top }
  }

  /**
   * Toggle one seed's popover; `anchor` is the swatch that was clicked and
   * `height` the height of the box it opens.
   */
  function togglePicker(key: string, anchor: HTMLElement, height: number) {
    if (pickerDotKey === key) {
      closePicker()
      return
    }
    pickerAnchorRef.current = anchor
    pickerHeightRef.current = height
    setPickerDotKey(key)
    setPickerPos(placePicker(anchor, height))
  }

  function closePicker() {
    setPickerDotKey(null)
    setPickerPos(null)
  }

  // A pointerdown anywhere outside the popover and its swatch dismisses it —
  // capture phase, so it wins over the click handlers that would otherwise
  // consume the gesture first.
  React.useEffect(() => {
    if (!pickerOpen) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target instanceof Element ? e.target : null
      if (!target) return
      if (pickerPopRef.current?.contains(target)) return
      if (pickerAnchorRef.current?.contains(target)) return
      closePicker()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [pickerOpen])

  // Fixed positioning is viewport-relative, so every scroll and resize would
  // strand the popover away from its swatch: track the anchor while open.
  React.useEffect(() => {
    if (!pickerOpen) return
    let raf = 0
    const update = () => {
      const anchor = pickerAnchorRef.current
      if (!anchor) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setPickerPos(placePicker(anchor, pickerHeightRef.current)))
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(raf)
    }
    // `pickerDotKey` stays a dependency: switching dots re-places the popover on
    // the new anchor even before the next scroll or resize.
  }, [pickerOpen, pickerDotKey])

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

  /** Load a card: the store moves the active pointer itself, so `syncSaved`
   * re-reads the badge rather than a separate `setActive` call. */
  function onLoadSaved(id: string) {
    const next = saved.load(id)
    if (next) setCustomState(next)
    syncSaved()
  }

  /** Snapshot the state an edit must return to when it is cancelled. */
  function beginEditing(
    id: string | null,
    name: string,
    originName: string,
    originTheme: CustomTheme,
    originBackground: ThemeBackground | null,
  ): Editing {
    return {
      id,
      name,
      originId: saved.activeId(),
      originDraft: getCustom().theme,
      originName,
      originTheme,
      originBackground,
      background: originBackground,
      originScheme: schemeRef.current,
    }
  }

  /** Commit an appearance preference, through the Theme service when it is there. */
  function applyAppearance(id: string) {
    setScheme(id)
    try {
      theme?.setTheme?.(id)
    } catch {
      // The local preference is already set; a service that refuses only means
      // the page keeps the appearance it had.
    }
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
          theme?.setTheme?.(open.originScheme)
        } catch {
          // Unmount cannot report a failure, and the stored preference is the
          // one the next mount reads, so this stays silent.
        }
      }
      if (open.originId) saved.load(open.originId)
      else {
        setCustom(open.originDraft)
        saved.setActive(null)
      }
      // The draft's wallpaper preview must not outlive the panel; the committed
      // background of the entry restored above is what should stay on screen.
      onPreviewBackground(undefined)
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
  // Exactly two other gestures would abandon a dirty draft, and both are asked
  // about: switching sections (a click on a nav cell, not merely somewhere in
  // the rail) and moving to another custom card (loading it, or opening it in
  // the editor). Both are marked in the markup — `data-ct-leave` for cards,
  // `isNavCell` for the rail — rather than inferred from "the click was
  // somewhere outside the card", because plenty of clicks inside the panel are
  // not a way out at all: naming the draft, changing its appearance or picking a
  // scheme preset all belong to the edit itself, and bubbling them up as a
  // "discard?" question only interrupted the user.
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

    /**
     * Whether `node` sits on a nav *cell* — the buttons that switch sections —
     * rather than anywhere else in the rail. Cells are the only buttons in the
     * nav, and the shell marks the active one with `aria-current`; taking that
     * button's parent gives the cell list itself, which still matches once the
     * active cell moves to whatever was just clicked.
     */
    function isNavCell(panel: Element | null, node: Element): boolean {
      const list = panel?.querySelector('nav button[aria-current]')?.parentElement
      const button = node.closest('button')
      return !!list && !!button && list.contains(button)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      // The colour popover owns Escape while it is open: the first press puts
      // it away, and only a later one reaches the draft's own questions.
      if (pickerOpenRef.current) {
        e.preventDefault()
        e.stopPropagation()
        closePicker()
        return
      }
      // Our own questions own Escape while one is up: dismiss the question only.
      if (confirmCloseRef.current || pendingLeaveRef.current) {
        e.preventDefault()
        e.stopPropagation()
        setConfirmClose(false)
        setPendingLeave(null)
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
        pendingLeaveRef.current ||
        pendingDeleteRef.current
      ) {
        return
      }
      const target = e.target instanceof Element ? e.target : null
      if (!target) return
      // Clicks inside the open card — the name field, a dot, cancel/save — are
      // the edit itself, not a way out of it.
      if (target.closest('[data-ct-editor]')) return
      // Nor is a row of the shell's portalled `Menu`: its list is rendered on
      // `document.body` so the settings card cannot clip it, which puts every
      // row outside this panel's box. Picking an appearance from that list
      // belongs to the edit (`pickScheme` even re-seats the edit's baseline on
      // it), so the click is allowed through rather than read as the mask.
      if (target.closest('[role="menu"]')) return
      const panel = settingsPanel()
      // A click outside the panel is the mask; inside it, only the header button
      // closes. Each raises the same leave-the-panel question.
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
      // Switching sections abandons the draft exactly as closing does, so it
      // takes the same question and the same answer: leave settings. Only a
      // click on a nav cell counts; the rail's own chrome is not a tab switch.
      if (isNavCell(panel, target)) {
        if (!onRequestClose) return
        e.preventDefault()
        e.stopPropagation()
        setConfirmClose(true)
        return
      }
      // A gesture that moves to another card. The editor's own card is not in
      // the list while it is open, so any marked card here is a different one.
      const leave = target.closest('[data-ct-leave]')
      if (!leave) return
      const entry = listRef.current.find((item) => item.id === leave.getAttribute('data-ct-entry'))
      if (!entry) return
      e.preventDefault()
      e.stopPropagation()
      setPendingLeave({ entry, edit: !!target.closest('button[data-ct-leave]') })
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
    // The popover belongs to the editor card; a stale key must not resurface it
    // inside the next card the user opens.
    closePicker()
    // A pick left over from a previous card must not attach to the new draft.
    clearPending()
    // Snapshot the previous draft before `resetCustom` overwrites it, so cancel
    // can put the user back on the theme they had. The preset is only the seed
    // for a brand-new theme, so it is stamped as the new theme's base here.
    const origin = beginEditing(
      null,
      nextThemeName(t('custom.defaultName'), list.map((e) => e.name)),
      '',
      getCustom().theme,
      null,
    )
    setCustomBase(shownPreset)
    const draft = resetCustom()
    setEditing(origin)
    setCustomState(draft)
  }

  /** Open an existing card for editing; it also becomes the previewed theme. */
  function startEdit(entry: SavedTheme) {
    closePicker()
    // A pick left over from a previous card must not attach to this one.
    clearPending()
    const next = beginEditing(entry.id, entry.name, entry.name, entry.theme, entry.background)
    setEditing(next)
    onLoadSaved(entry.id)
  }

  /** Discard the open editor and put the previously applied theme back. */
  function cancelEdit() {
    if (!editing) return
    closePicker()
    revertEditing(editing)
    clearPending()
    setEditing(null)
    syncSaved()
  }

  /**
   * Send one card out as an archive. Export never touches the draft or the
   * roster, so it stays available while an editor is open and needs no guard.
   */
  async function exportCard(entry: SavedTheme) {
    try {
      await exportTheme(entry.id, entry.name)
      showToast(t('custom.toast.exported').replace('{0}', entry.name))
    } catch (error) {
      showToast(t(error instanceof ThemeApiUnavailableError ? 'custom.toast.unavailable' : 'custom.toast.failed'))
    }
  }

  /**
   * Take one archive in. The Host validates the archive and writes the theme it
   * carried — a theme is a document, so an import stores exactly what an export
   * packed, with the Host choosing the id and a free name. The draft is never
   * involved, so importing leaves an open editor exactly as it was.
   */
  async function importArchive(file: File) {
    setImporting(true)
    try {
      const imported = await importTheme(file)
      await reloadRoster()
      showToast(t('custom.toast.imported').replace('{0}', imported.name))
    } catch (error) {
      showToast(importFailureMessage(t, error))
    } finally {
      setImporting(false)
    }
  }

  /**
   * Re-read the roster after a write the store did not make. The import route is
   * the Host's own: the cached list still holds the pre-import roster, so without
   * this the new card only appears once some later mutation refreshes the cache.
   * A failed re-read is not a failed import — the theme is stored either way — so
   * the card is left to the next roster mutation rather than reported as an error.
   */
  async function reloadRoster() {
    try {
      await saved.refresh()
      syncSaved()
    } catch {
      // Deliberately silent: see above.
    }
  }

  /** Open the picker, clearing the previous choice so the same file can be re-picked. */
  function startImport() {
    const input = importInputRef.current
    if (!input) return
    input.value = ''
    input.click()
  }

  function onImportPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void importArchive(file)
  }

  /** Open the background picker for the appearance currently on show. */
  function startBackgroundPick() {
    const input = backgroundInputRef.current
    if (!input) return
    // Record the side now: the dialog holds the screen, and the toggle may be
    // switched before the file comes back.
    pickModeRef.current = seedMode
    input.value = ''
    input.click()
  }

  function onBackgroundPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editing) return
    const kind = backgroundKindOf(file)
    if (kind === null) {
      showToast(t('background.badType'))
      return
    }
    // A cheap sanity gate before decoding: the picker can hand over a RAW image
    // of hundreds of megabytes, and there is no point decoding one that is
    // already far past the upload cap. A video is never decoded by this panel
    // before the upload, so it only has to pass its own cap.
    const pickLimit = kind === 'video' ? THEME_VIDEO_MAX_BYTES : BACKGROUND_PICK_MAX_IMAGE_BYTES
    if (file.size > pickLimit) {
      const cap = kind === 'video' ? THEME_VIDEO_MAX_MB : THEME_IMAGE_MAX_MB
      showToast(t('background.tooLarge').replace('{0}', cap))
      return
    }
    const mode = pickModeRef.current
    replacePending(mode, { file, url: URL.createObjectURL(file), kind })
    setEditing((cur) => {
      if (!cur) return cur
      // Both sides are materialized so the draft always has the shape the
      // document will be written with; only the picked one is switched on.
      return { ...cur, background: patchBackgroundSide(cur.background, mode, { enabled: true }) }
    })
  }

  /**
   * Push one field of the appearance on show. The editor's light/dark toggle
   * picks the side being edited, so a control only ever moves that side — which
   * is the whole point of the split: the light media and the dark media are
   * separate, not one file with two sets of numbers.
   */
  function updateBackgroundSide(patch: Partial<ThemeBackgroundSide>) {
    setEditing((cur) => {
      if (!cur) return cur
      return { ...cur, background: patchBackgroundSide(cur.background, seedMode, patch) }
    })
  }

  /**
   * Drop the wallpaper from the appearance on show; Save then removes the
   * stored file too. The other appearance keeps its own media and settings, and
   * the draft only becomes "no wallpaper" once both sides are empty.
   */
  function removeBackground() {
    const mode = seedMode
    replacePending(mode, null)
    setEditing((cur) => {
      if (!cur?.background) return cur
      const next: ThemeBackground = {
        ...cur.background,
        [mode]: { ...cur.background[mode], asset: '', enabled: false },
      }
      const empty = next.light.asset === '' && next.dark.asset === ''
      return { ...cur, background: empty ? null : next }
    })
  }

  /** Commit the open editor: create a new entry, or update the one being edited. */
  async function saveEdit() {
    if (!editing) return
    closePicker()
    const open = editing
    const name = open.name.trim() || t('custom.defaultName')
    // A brand-new theme needs its id before the media can be uploaded to its
    // directory, so the panel mints it here and the Host stores the document
    // under that id.
    const id = open.id ?? newThemeId()
    const draftBackground = open.background
    // A side whose asset is still empty is a picked file that has not been
    // uploaded yet; a draft with no stored file on either side is written as no
    // background at all, and the upload below fills in whichever side it can.
    const committed =
      draftBackground && (draftBackground.light.asset !== '' || draftBackground.dark.asset !== '')
        ? draftBackground
        : null
    const picks = THEME_APPEARANCES.filter((mode) => pending[mode] !== null)

    savingRef.current = true
    try {
      const next = await mutate(() =>
        open.id === null ? saved.create(id, name, committed) : saved.update(id, name, committed),
      )
      if (next === null) return

      // The document is stored either way; a failed media upload only costs that
      // side's wallpaper, so it is reported without undoing the save. The sides
      // are uploaded one by one: one bad file must not discard the other's.
      let failure: string | null = null
      let uploaded: ThemeBackground | null = committed
      for (const mode of picks) {
        const pick = pending[mode]
        if (!pick) continue
        try {
          const { blob } = await prepareBackgroundMedia(pick.file)
          const asset = await uploadThemeMedia(id, blob)
          uploaded = patchBackgroundSide(uploaded, mode, { asset: asset.name, enabled: true })
        } catch (error) {
          failure = backgroundFailureMessage(t, error, pick.kind)
        }
      }
      // Only a side that actually landed changes the stored document.
      if (uploaded !== committed) {
        const updated = await saved.update(id, name, uploaded)
        if (updated === null) failure = failure ?? t('custom.toast.failed')
      }

      setEditing(null)
      clearPending()
      // Saving commits the colours, not the appearance the preview borrowed.
      restoreAppearance(open)
      syncSaved()
      setCustomState(getCustom().theme)
      showToast(failure ?? t('custom.toast.saved'))
    } finally {
      savingRef.current = false
    }
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
    closePicker()
    if (editing) revertEditing(editing)
    setEditing(null)
    setSelectionState(shownPreset)
    setSelection(shownPreset)
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

  const children: React.ReactNode[] = [
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
      { className: 'ct-row', key: 'sidebar-transparency' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('sidebar.title')),
        React.createElement('div', { className: 'ct-row-desc' }, t('sidebar.desc')),
      ),
      React.createElement(Switch, {
        checked: sidebarTransparent,
        label: t('sidebar.title'),
        onChange: (on: boolean) => {
          setSidebarTransparentState(on)
          setSidebarTransparent(on)
        },
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
    /** One seed pair (accent, green, amber, red), edited for the appearance on show. */
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

    /**
     * The border swatch. It is the one seed that is an overlay rather than a
     * fill, so it is also the only one whose picker carries an opacity slider
     * (`SeedDot.alpha`) and whose swatch previews that opacity over a
     * checkerboard. DSH's whole border ladder follows from it: l1 is the seed
     * and every stronger level is derived while the palette is built.
     */
    const borderDot = (): SeedDot => {
      const seed = custom.border[seedMode]
      const set = (next: Partial<BorderSeed>) =>
        editCustom({ ...custom, border: { ...custom.border, [seedMode]: { ...seed, ...next } } })
      const rgba = borderCss(seed)
      return {
        key: BORDER_SEED_KEY,
        name: t('custom.border.title'),
        // The opacity travels in the accessible name: the tooltip bubble only
        // has room for the seed's name, and the percentage is exactly what a
        // swatch this faint cannot show on its own.
        hint: `${t('custom.border.desc')} — ${seed.alpha}%`,
        value: seed.color,
        onChange: (v: string) => set({ color: v }),
        // The picker hands colour and opacity back as one value, so both
        // channels land in a single update while the panel or a slider is
        // dragged.
        alpha: { value: seed.alpha, onPicked: (v: string) => set(splitAlpha(v)) },
        // The overlay over the checkerboard rather than a flat fill: painted
        // straight onto the panel, the default 4% hairline would be invisible.
        swatch: {
          backgroundImage: `linear-gradient(${rgba}, ${rgba}), ${ALPHA_CHECKERBOARD}`,
          backgroundSize: 'auto, 10px 10px',
        },
      }
    }

    const seedDots: SeedDot[] = [
      pair('accent', 'custom.accent.title', 'custom.accent.desc'),
      ...neutralDots,
      // Between the foreground and the success swatches: a border separates the
      // neutral ramp's surfaces, so it belongs beside them rather than with the
      // state colours.
      borderDot(),
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
    // preference it borrowed. The shell's `SegmentedControl` owns the tablist
    // keyboard walk, the sliding indicator and the `<id>-<value>-panel` ids the
    // colour rows below answer as that panel; `ct-mode` only pins its width
    // beside the name field.
    const modeToggle = React.createElement(SegmentedControl, {
      id: SEED_MODE_CONTROL_ID,
      value: seedMode,
      options: [
        { value: 'light', label: t('custom.seed.light') },
        { value: 'dark', label: t('custom.seed.dark') },
      ],
      onChange: (next: string) => {
        // The control offers only the two halves, so its value is one of them.
        const mode = next as Mode
        setSeedMode(mode)
        previewAppearance(mode)
      },
      label: t('custom.mode.label'),
      className: 'ct-mode',
    })

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

    // The shell's own action pair again, so the editor's footer and every
    // dialog's footer read as one convention: outline cancel, primary save.
    const editorActions = React.createElement(
      'div',
      { className: 'ct-editor-actions' },
      React.createElement(Button, { variant: 'outline', onClick: cancelEdit }, t('custom.cancel')),
      React.createElement(Button, { variant: 'primary', onClick: () => void saveEdit() }, t('custom.save')),
    )

    // The seed whose popover is open, if any. `ColorPopover` draws it; the
    // selection lives here because Escape and the outside-click guard both close
    // it through `pickerDotKey`.
    const pickerDot = pickerDotKey ? [...seedDots, ...shikiDots].find((d) => d.key === pickerDotKey) ?? null : null
    // The wallpaper is edited one appearance at a time, following the editor's
    // own light/dark toggle. Each side carries its own image or video, its own
    // switch and its own numbers, so everything below describes the side on
    // show — picking a dark video while the light image stays untouched is the
    // whole point.
    const backgroundSide = editing?.background?.[seedMode] ?? null
    const backgroundPending = pending[seedMode]
    const backgroundPreviewUrl =
      backgroundPending?.url
      ?? (editing?.id && backgroundSide?.asset
        ? themeAssetUrl(editing.id, backgroundSide.asset)
        : null)
    // The stored asset's extension decides how the thumbnail is painted; a
    // pending pick already knows its own kind and outranks the stored one.
    const backgroundPreviewKind =
      backgroundPending?.kind
      ?? (backgroundSide?.asset ? assetTypeOf(backgroundSide.asset)?.kind ?? null : null)
    // Whether this side has anything to paint or to turn on: a stored asset, or
    // a file picked and waiting for Save to upload it.
    const backgroundSideHasMedia =
      backgroundSide !== null && (backgroundSide.asset !== '' || backgroundPending !== null)
    // Which side the toggle is on is the segmented control's own state, so the
    // labels stay plain (`透明度 · 40%`) rather than repeating it on every row;
    // a screen reader gets it in the accessible name, where there is no toggle.
    const backgroundModeName = t(`custom.seed.${seedMode}`)

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
        // The colour rows are the panel the segmented control's tabs control:
        // the shell's control points `aria-controls` at `<id>-<value>-panel`,
        // so both ids are built from `SEED_MODE_CONTROL_ID` and follow the half
        // whose seeds are on show. A plain block wrapper changes no layout —
        // the rows carry their own padding.
        React.createElement(
          'div',
          {
            role: 'tabpanel',
            id: `${SEED_MODE_CONTROL_ID}-${seedMode}-panel`,
            'aria-labelledby': `${SEED_MODE_CONTROL_ID}-${seedMode}`,
          },
          React.createElement(SeedDotRow, {
            rowKey: 'seeds',
            label: t('custom.group.seeds'),
            dots: seedDots,
            expandedKey: pickerDotKey,
            onToggle: togglePicker,
          }),
          React.createElement(SeedDotRow, {
            rowKey: 'shiki',
            label: t('custom.group.shiki'),
            dots: shikiDots,
            expandedKey: pickerDotKey,
            onToggle: togglePicker,
          }),
        ),
        React.createElement(BackgroundSection, {
          t,
          modeName: backgroundModeName,
          side: backgroundSide,
          previewUrl: backgroundPreviewUrl,
          previewKind: backgroundPreviewKind,
          hasMedia: backgroundSideHasMedia,
          inputRef: backgroundInputRef,
          onPick: startBackgroundPick,
          onRemove: removeBackground,
          onToggleEnabled: (on: boolean) => updateBackgroundSide({ enabled: on }),
          onOpacity: (value: number) => updateBackgroundSide({ opacity: value }),
          onBlur: (value: number) => updateBackgroundSide({ blur: value }),
          onFilePicked: onBackgroundPicked,
        }),
        editorActions,
        pickerDot && pickerPos
          ? React.createElement(ColorPopover, {
              dot: pickerDot,
              position: pickerPos,
              popRef: pickerPopRef,
            })
          : null,
      )

    const cards: React.ReactNode[] = list.map((entry) =>
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
            onExport: () => void exportCard(entry),
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
        'div',
        // The row is a marker the click-away guard ignores; only its two buttons
        // matter, and neither disturbs an open draft.
        { className: 'ct-add-row', key: 'add-row' },
        React.createElement(
          'button',
          {
            key: 'import',
            type: 'button',
            // The same dashed face as add: importing is the other way to get a
            // card, so the two split the row rather than one dominating it.
            className: 'ct-add-btn',
            disabled: importing,
            onClick: startImport,
          },
          React.createElement(IconImport, { size: ICON_SIZE }),
          t('custom.import'),
        ),
        React.createElement(
          'button',
          {
            key: 'add',
            type: 'button',
            className: 'ct-add-btn',
            disabled: editing !== null,
            onClick: startAdd,
          },
          React.createElement(IconPlus, { size: ICON_SIZE }),
          t('custom.add'),
        ),
        // The browser's own picker, kept out of the layout but inside this
        // subtree: it belongs to the button that opens it, so the two travel
        // together when the custom-mode branch unmounts.
        React.createElement('input', {
          key: 'import-input',
          ref: importInputRef,
          type: 'file',
          accept: `${THEME_ARCHIVE_EXTENSION},application/zip`,
          style: { display: 'none' },
          onChange: onImportPicked,
        }),
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
        // Removing a saved theme is the destructive question; the two
        // unsaved-draft questions below are not, and stay on the primary face.
        danger: true,
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

  // The unsaved-draft question raised by moving to another card. Confirming
  // discards through the same path as Cancel — `cancelEdit` writes the pre-edit
  // theme back — and then carries the interrupted gesture through, so the click
  // the guard swallowed still does what it said. The panel stays open.
  if (pendingLeave && editing) {
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
          const next = pendingLeave
          setPendingLeave(null)
          cancelEdit()
          if (next.entry) {
            if (next.edit) startEdit(next.entry)
            else onLoadSaved(next.entry.id)
          }
        },
        onCancel: () => setPendingLeave(null),
      }),
    )
  }

  // Outside the custom-mode branch: the banner reports the action, not the
  // editor state, so switching the editor off mid-toast must not kill it.
  if (toast) {
    children.push(
      React.createElement(Toast, {
        // One key per report: a repeat action remounts the banner, so the
        // shell's own hold and fade start again instead of continuing.
        key: `toast-${String(toast.seq)}`,
        text: toast.text,
        tone: 'success',
        onDone: () => setToast((cur) => (cur?.seq === toast.seq ? null : cur)),
      }),
    )
  }

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: 760, paddingBottom: 8 } },
    ...children,
  )
}
