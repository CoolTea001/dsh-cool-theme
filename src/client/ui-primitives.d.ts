/**
 * Ambient types for the shell's shared control package.
 *
 * The package is not a build-time dependency of this plugin: it is one of the
 * frozen platform modules the browser module system resolves at runtime (the
 * same table `react` comes from), so `tsdown` keeps the import external and
 * nothing is ever copied into `lib/`. Declaring the small surface this plugin
 * actually calls keeps `tsc` honest without pinning a copy of the host's
 * `node_modules`.
 *
 * Scope: the components this plugin imports, not the whole package. Each
 * interface mirrors the host's own props — including members this plugin never
 * passes — so a later option is checked against the real contract instead of
 * against a guess. The runtime contract is the host package itself; these
 * declarations only describe it, and must be corrected when it is known to
 * differ.
 */

declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import * as React from 'react'

  /** One row of a `Menu`. Separators and group labels are omitted on purpose. */
  export interface MenuItem {
    id: string
    label?: React.ReactNode
    icon?: React.ReactNode
    disabled?: boolean
    danger?: boolean
    shortcut?: { keys: string[]; aria?: string }
    submenu?: MenuItem[]
  }

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'outline' | 'toolbar'
    /** `md` is 36px, `sm` is 28px; both take the global control-radius scale. */
    size?: 'md' | 'sm'
    /** Leading glyph, drawn in the button's own 16px icon slot. */
    icon?: React.ReactNode
  }
  /** Forward-ref component: the ref targets the native button. */
  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >

  export interface MenuProps {
    open: boolean
    /** The trigger. Rendered inside the menu's own root, so clicks on it are not "outside". */
    anchor: React.ReactNode
    items?: MenuItem[]
    children?: React.ReactNode
    /** Marks the row the check selection draws against. */
    selectedId?: string
    selectedIds?: string[]
    onSelect?: (id: string) => void
    /** Owner state change: outside pointerdown, Escape and Shift+Tab all end here. */
    onClose?: () => void
    align?: 'start' | 'end'
    side?: 'top' | 'bottom' | 'right'
    /** Portals the list to `document.body` with viewport-clamped coordinates. */
    portal?: boolean
    closeOnPointerLeave?: boolean
    dense?: boolean
    compact?: boolean
    autoFocus?: boolean
    selection?: 'check' | 'fill'
    getAnchorRect?: () => DOMRect | null
    footer?: MenuItem[]
    className?: string
    listClassName?: string
  }
  export const Menu: React.FC<MenuProps>

  export interface SwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    /** Required, so the control can never ship unnamed. */
    label: string
    disabled?: boolean
    title?: string
    className?: string
  }
  export const Switch: React.FC<SwitchProps>

  export interface SegmentedControlProps {
    /** Seeds each tab id (`<id>-<value>`) and the panel id (`<id>-<value>-panel`). */
    id: string
    value: string
    options: { value: string; label: React.ReactNode; title?: string; disabled?: boolean }[]
    onChange: (value: string) => void
    label: string
    disabled?: boolean
    className?: string
  }
  export const SegmentedControl: React.FC<SegmentedControlProps>

  export interface TooltipProps {
    label: React.ReactNode | (() => React.ReactNode)
    /**
     * Where the bubble sits. Only these three exist: the primitive measures
     * `right` against the anchor and flips `bottom`/`top` to whichever fits,
     * and has no `left` placement to fall back to.
     */
    side?: 'top' | 'bottom' | 'right'
    align?: 'start' | 'center' | 'end'
    delayMs?: number
    focusDelayMs?: number
    gap?: number
    disabled?: boolean
    portal?: boolean
    maxWidth?: number | string
    openOnClick?: boolean
    shortcutKeys?: string[]
    /**
     * The single element the bubble names. The primitive clones it to attach
     * its anchor ref, so it has to arrive as the declared child — which, under
     * `React.createElement`, means putting it in the props object rather than
     * passing it as a rest argument. This is the one place that rule is
     * written down; call sites do not repeat it.
     */
    children: React.ReactElement
  }
  export const Tooltip: React.FC<TooltipProps>

  export interface ToastProps {
    text: React.ReactNode
    icon?: React.ReactNode
    tone?: string
    /** Measures the banner's horizontal center from this element. */
    anchor?: Element | null
    holdMs?: number
    actions?: { label: string; onClick: () => void; prefix?: React.ReactNode }[]
    /** Called once the hold and the fade have both elapsed; unmount here. */
    onDone: () => void
  }
  export const Toast: React.FC<ToastProps>

  export interface IconProps {
    size?: number
    className?: string
  }
  /**
   * The one glyph this plugin still renders from the shell — the select's
   * chevron. Every action icon is the plugin's own (see icons.tsx).
   */
  export const IconChevronDownOutlineRegular: React.FC<IconProps>
}
