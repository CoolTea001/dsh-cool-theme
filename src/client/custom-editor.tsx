/**
 * Presentational pieces of the custom-theme editor.
 *
 * `ThemePanel` owns every piece of state (the draft, the picker, the roster);
 * these components only draw what they are handed and report gestures back
 * through props. Keeping them stateless is what makes this a move rather than a
 * rewrite: the state flow in the panel is unchanged, and every expression below
 * is the one that used to sit inline in `components.tsx`.
 */

import * as React from 'react'
import { HexAlphaColorPicker, HexColorInput, HexColorPicker } from 'react-colorful'
import {
  THEME_BACKGROUND_MAX_BLUR,
  type ThemeAssetKind,
  type ThemeBackgroundSide,
  type ThemeCssInfo,
} from '../contract.js'
import { BACKGROUND_ACCEPT } from './background.js'
import { PICKER_HEIGHT, PICKER_HEIGHT_WITH_ALPHA, withAlpha } from './color-picker.js'
import type { ThemeKey } from './locales.js'
import { Switch, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * One editable colour. The dot edits whichever appearance the mode toggle is
 * on; the tooltip carries the seed's plain-language description.
 */
export type SeedDot = {
  key: string
  name: string
  hint: string
  /** The opaque colour: what the swatch paints and the hex field shows. */
  value: string
  /** A value typed into the hex field; always an opaque colour. */
  onChange: (v: string) => void
  /**
   * The opacity channel, for the one seed that has one (the border). Its
   * presence swaps the opaque picker for the alpha-aware one, which is the same
   * saturation panel and hue slider with an opacity slider under them: `value`
   * seeds that slider and `onPicked` receives the picker's own colour-plus-
   * opacity value, so one gesture over either the panel or either slider writes
   * both channels in one update.
   */
  alpha?: { value: number; onPicked: (v: string) => void }
  /** Swatch paint; defaults to a flat fill of `value`. */
  swatch?: React.CSSProperties
}

/**
 * Height of the box one seed's dot opens. Only the border seed's picker carries
 * an opacity slider, and that seed is the one that declares it, so the height
 * follows `SeedDot.alpha` rather than a name.
 */
function seedPickerHeight(dot: SeedDot): number {
  return dot.alpha ? PICKER_HEIGHT_WITH_ALPHA : PICKER_HEIGHT
}

/** A group row: its name on the left, every seed's dot on the right. */
export function SeedDotRow(props: {
  rowKey: string
  label: string
  dots: SeedDot[]
  /** The seed whose popover is open, for `aria-expanded`. */
  expandedKey: string | null
  onToggle: (key: string, anchor: HTMLElement, height: number) => void
}) {
  const { rowKey, label, dots, expandedKey, onToggle } = props
  return React.createElement(
    'div',
    { className: 'ct-seed-row', key: rowKey },
    React.createElement('div', { className: 'ct-seed-label' }, label),
    React.createElement(
      'div',
      { className: 'ct-seed-dots' },
      ...dots.map((d) =>
        React.createElement(Tooltip, {
          key: d.key,
          // The bubble names the token; the swatch's own accessible name keeps
          // the fuller description, which the bubble is too small to carry.
          label: d.name,
          side: 'top',
          gap: 6,
          children: React.createElement('button', {
            type: 'button',
            className: 'ct-seed-dot',
            // The button itself paints the colour — a flat fill, or the border
            // seed's own overlay preview — and opens the popover picker
            // anchored to it.
            style: d.swatch ?? { background: d.value },
            'aria-haspopup': 'dialog',
            'aria-expanded': expandedKey === d.key,
            'aria-label': `${d.name} — ${d.hint}`,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) =>
              onToggle(d.key, e.currentTarget, seedPickerHeight(d)),
          }),
        }),
      ),
    ),
  )
}

/**
 * The react-colorful popover for the seed whose dot is open, pinned to its
 * swatch. It is a DOM child of the editor card (`position:fixed`, so the card's
 * box does not clip or place it) — the dirty-draft guard passes clicks inside
 * `[data-ct-editor]`, and every picker interaction is exactly such a click.
 *
 * The picker is the panel/hue/opacity stack the library lays out itself, with
 * the hex field under it. The border seed swaps in the alpha-aware picker, which
 * is the same stack with one more slider and one more 24px of height
 * (`ct-color-pop-alpha`), so both popovers keep the same panel size.
 */
export function ColorPopover(props: {
  dot: SeedDot
  position: { left: number; top: number }
  popRef: React.RefObject<HTMLDivElement>
}) {
  const { dot, position, popRef } = props
  const alpha = dot.alpha
  return React.createElement(
    'div',
    {
      key: 'color-picker',
      className: alpha ? 'ct-color-pop ct-color-pop-alpha' : 'ct-color-pop',
      ref: popRef,
      style: { left: position.left, top: position.top },
    },
    React.createElement(alpha ? HexAlphaColorPicker : HexColorPicker, {
      // The seed's colour, plus its opacity when it has one: the picker carries
      // opacity as a hex channel, while the seed keeps it as a field of its own.
      color: alpha ? withAlpha(dot.value, alpha.value) : dot.value,
      // Dragging the panel or either slider writes colour and opacity together;
      // typing in the hex field below only moves the colour.
      onChange: alpha ? alpha.onPicked : (v: string) => dot.onChange(v.toUpperCase()),
    }),
    React.createElement(HexColorInput, {
      className: 'ct-hex-input',
      color: dot.value,
      'aria-label': dot.name,
      onChange: (v: string) => dot.onChange(v.toUpperCase()),
    }),
  )
}

/** One slider row: name, track, value. */
export function BackgroundRangeRow(props: {
  rowKey: string
  label: string
  value: number
  max: number
  suffix: string
  ariaLabel: string
  onChange: (next: number) => void
}) {
  const { rowKey, label, value, max, suffix, ariaLabel, onChange } = props
  return React.createElement(
    'div',
    { className: 'ct-bg-field', key: rowKey },
    // The value rides with the label (`透明度 · 40%`), so the slider owns the
    // whole right-hand side and the row has one reading order.
    React.createElement('div', { className: 'ct-bg-field-label' }, `${label} · ${String(value)}${suffix}`),
    React.createElement('input', {
      className: 'ct-range',
      type: 'range',
      min: 0,
      max,
      value,
      'aria-label': ariaLabel,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
    }),
  )
}

/**
 * The wallpaper section of the open editor: the side on show, its commands, its
 * thumbnail and its two sliders. A preset has no document of its own to carry
 * one, and the panel only shows this card inside custom mode.
 */
export function BackgroundSection(props: {
  t: (key: ThemeKey) => string
  /** The appearance the editor's toggle is on, for the sliders' accessible names. */
  modeName: string
  side: ThemeBackgroundSide | null
  previewUrl: string | null
  previewKind: ThemeAssetKind | null
  /** A stored asset or a picked file: what the switch can turn on. */
  hasMedia: boolean
  inputRef: React.RefObject<HTMLInputElement>
  onPick: () => void
  onRemove: () => void
  onToggleEnabled: (on: boolean) => void
  onOpacity: (value: number) => void
  onBlur: (value: number) => void
  onFilePicked: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const {
    t,
    modeName,
    side,
    previewUrl,
    previewKind,
    hasMedia,
    inputRef,
    onPick,
    onRemove,
    onToggleEnabled,
    onOpacity,
    onBlur,
    onFilePicked,
  } = props

  // The wallpaper's commands are text links rather than buttons, so the section
  // title stays the strongest thing in the row, and the switch is its fixed last
  // item: whatever the state, the section always shows one.
  const actions: React.ReactNode[] = []
  if (!hasMedia) {
    actions.push(
      React.createElement(
        'button',
        { key: 'add', type: 'button', className: 'ct-bg-link', onClick: onPick },
        t('background.add'),
      ),
    )
  } else if (side?.enabled) {
    // Off hides every command but the switch: with nothing painted there is
    // nothing to replace, remove or tune until the media comes back on.
    actions.push(
      React.createElement(
        'button',
        { key: 'replace', type: 'button', className: 'ct-bg-link', onClick: onPick },
        t('background.replace'),
      ),
      React.createElement(
        'button',
        { key: 'remove', type: 'button', className: 'ct-bg-link', onClick: onRemove },
        t('background.remove'),
      ),
    )
  }
  actions.push(
    // Also the reason "remove" is not the only way out of a wallpaper: off keeps
    // the file and the settings, so the theme can go back to plain surfaces
    // without losing the media it was set up with. A side with no media at all
    // is simply the same switch in its off state, waiting until there is
    // something to turn on. The switch is per appearance: turning the light
    // image off leaves the dark video playing.
    React.createElement(Switch, {
      key: 'enabled',
      className: 'ct-bg-switch',
      checked: side?.enabled ?? false,
      disabled: !hasMedia,
      label: t('background.title'),
      onChange: onToggleEnabled,
    }),
  )

  return React.createElement(
    'div',
    { className: 'ct-bg-section' },
    React.createElement(
      'div',
      { className: 'ct-bg-head' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('background.title')),
      ),
      React.createElement('div', { className: 'ct-bg-actions' }, ...actions),
    ),
    // The thumbnail and both sliders describe the media that is painted, so they
    // belong to the on state with it.
    side !== null && side.enabled && hasMedia
      ? React.createElement(
          'div',
          { className: 'ct-bg-body' },
          React.createElement(
            'div',
            {
              className: 'ct-bg-thumb',
              'aria-hidden': 'true',
              // An image stays a CSS background; a video needs an element so its
              // frames can move. Both fill the same thumbnail box.
              style: previewUrl && previewKind === 'image' ? { backgroundImage: `url("${previewUrl}")` } : undefined,
            },
            previewUrl && previewKind === 'video'
              ? React.createElement('video', {
                  className: 'ct-bg-thumb-video',
                  src: previewUrl,
                  // The thumbnail is a live preview, so it loops muted like the
                  // wallpaper itself.
                  muted: true,
                  loop: true,
                  autoPlay: true,
                  playsInline: true,
                  preload: 'auto',
                  'aria-hidden': 'true',
                })
              : null,
          ),
          React.createElement(
            'div',
            { className: 'ct-bg-controls' },
            React.createElement(BackgroundRangeRow, {
              rowKey: 'bg-opacity',
              label: t('background.opacity'),
              value: side.opacity,
              max: 100,
              suffix: '%',
              ariaLabel: `${modeName} ${t('background.opacity')}`,
              onChange: onOpacity,
            }),
            React.createElement(BackgroundRangeRow, {
              rowKey: 'bg-blur',
              label: t('background.blur'),
              value: side.blur,
              max: THEME_BACKGROUND_MAX_BLUR,
              suffix: ' px',
              ariaLabel: `${modeName} ${t('background.blur')}`,
              onChange: onBlur,
            }),
          ),
        )
      : null,
    React.createElement('input', {
      ref: inputRef,
      type: 'file',
      accept: BACKGROUND_ACCEPT,
      style: { display: 'none' },
      onChange: onFilePicked,
    }),
  )
}

/**
 * The starter stylesheet written when the user opens a theme that has none.
 *
 * It is comment-only, so creating the file cannot change the interface, and it
 * names the three things a first rule usually needs: when the sheet applies,
 * the dark-appearance marker, and how to override a token. The theme name is
 * user data and may arrive from a shared archive, so a closing comment marker
 * in it must not end the comment early.
 */
export function cssTemplate(t: (key: ThemeKey) => string, name: string, id: string): string {
  const safeName = name.replace(/\*\//g, '* /')
  return [
    '/*',
    ` * ${safeName} — ${t('custom.css.title')}`,
    ' *',
    ` * ${t('custom.css.template.active')}`,
    ` * ${t('custom.css.template.dark')}`,
    ` * ${t('custom.css.template.token')}`,
    ` * ${t('custom.css.template.assets')} /cool-theme/api/themes/${id}/assets/<file>`,
    ` * ${t('custom.css.template.warning')}`,
    ' */',
    '',
  ].join('\n')
}

/**
 * The stylesheet row of the open editor: its title, the on/off switch, and the
 * action that opens the file once the switch is on. It is stateless; the panel
 * owns the fetch, the busy state and the toast.
 *
 * The switch is the primary control: off by default, it creates the file when
 * turned on, and turning it off hides the open action while keeping the file.
 * The action is "Open stylesheet" on a loopback page, where the Host can
 * launch a native editor, and "Copy path" elsewhere.
 */
export function CssSection(props: {
  t: (key: ThemeKey) => string
  /** Metadata of the open entry's file; null while loading or after a failure. */
  info: ThemeCssInfo | null
  error: 'unavailable' | 'failed' | null
  busy: boolean
  /** True while the card is composing a brand-new, unsaved theme. */
  newTheme: boolean
  onOpen: () => void
  onCopyPath: () => void
  onToggle: (on: boolean) => void
}) {
  const { t, info, error, busy, newTheme, onOpen, onCopyPath, onToggle } = props
  const hint = newTheme
    ? t('custom.css.newTheme')
    : error === 'unavailable'
      ? t('custom.toast.unavailable')
      : error === 'failed'
        ? t('custom.css.loadFailed')
        : info === null
          ? t('custom.css.loading')
          : info.tooLarge
            ? t('custom.css.tooLarge')
            : info.enabled && info.css === null
              ? t('custom.css.missingHint')
              : ''
  // The switch is the opt-in and the only control that creates the file; the
  // open action exists only while it is on.
  const showSwitch = info !== null && !newTheme && error === null
  const action = info !== null && info.enabled && !newTheme && error === null
    ? info.canOpen
      ? React.createElement(
          'button',
          {
            key: 'open',
            type: 'button',
            className: 'ct-css-link',
            disabled: busy,
            title: info.path,
            onClick: onOpen,
          },
          t('custom.css.open'),
        )
      : React.createElement(
          'button',
          {
            key: 'copy',
            type: 'button',
            className: 'ct-css-link',
            disabled: busy,
            title: info.path,
            onClick: onCopyPath,
          },
          t('custom.css.copyPath'),
        )
    : null
  return React.createElement(
    'div',
    { className: 'ct-css-section' },
    React.createElement(
      'div',
      { className: 'ct-css-head' },
      React.createElement(
        'div',
        { className: 'ct-row-main' },
        React.createElement('div', { className: 'ct-row-title' }, t('custom.css.title')),
        hint ? React.createElement('div', { className: 'ct-row-desc' }, hint) : null,
      ),
      React.createElement(
        'div',
        { className: 'ct-css-actions' },
        action,
        showSwitch && info
          ? React.createElement(Switch, {
              key: 'enabled',
              className: 'ct-css-switch',
              checked: info.enabled,
              disabled: busy,
              label: t('custom.css.enable'),
              onChange: onToggle,
            })
          : null,
      ),
    ),
  )
}
