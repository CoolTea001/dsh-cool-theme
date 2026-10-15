/**
 * The plugin's own icon set.
 *
 * Every glyph lives in `assets/` as an SVG, and that file is the source of
 * truth for its artwork: `tsdown` inlines it as text (the `loader` map in
 * tsdown.config.ts, described by assets.d.ts), and the wrapper below narrows the
 * markup to the same `{ size, className }` surface the shell's icons expose, so
 * a call site swaps one for the other without touching its layout.
 *
 * Two properties of the artwork the wrapper keeps: the strokes draw in
 * `currentColor`, so whichever control owns an icon goes on painting it — hover,
 * disabled and the danger face included — with no CSS here; and React owns the
 * `<svg>` root, so `size` stays a real prop instead of riding on the asset's own
 * `1em` box.
 */

import * as React from 'react'

import deleteSource from './assets/delete.svg'
import editSource from './assets/edit.svg'
import exportSource from './assets/export.svg'
import importSource from './assets/import.svg'
import plusSource from './assets/plus.svg'
import themeSource from './assets/theme.svg'

/** What a caller may set on one of these icons — the shell's own `IconProps`. */
export interface IconProps {
  /** Square edge length in px. Defaults to 16, the box the artwork is drawn for. */
  size?: number
  className?: string
}

/** One asset, split into the two pieces its renderer needs. */
interface IconAsset {
  /** The artboard, read from the file so a redrawn glyph keeps its own grid. */
  viewBox: string
  /** Everything the asset holds inside its root `<svg>`, verbatim. */
  inner: string
}

/**
 * Splits the root `<svg>` off an asset. The halves are needed separately because
 * React draws the root — that is where `size` and `className` land — while the
 * inside ships exactly as the file wrote it.
 *
 * A source that is not one `<svg>` carrying a `viewBox` is a mistake in this repo
 * and not something a user can reach, so it throws instead of quietly drawing an
 * empty box.
 */
function parseAsset(source: string, file: string): IconAsset {
  const match = /<svg\b[^>]*\bviewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/.exec(source)
  if (match === null) throw new Error(`dsh-cool-theme: assets/${file} is not a single <svg> with a viewBox`)
  return { viewBox: match[1], inner: match[2] }
}

/**
 * Builds one icon component from an asset.
 *
 * The inner markup is this repo's own build-time text, never user input — which
 * is what makes `dangerouslySetInnerHTML` safe here, and the only way to keep the
 * paths byte-identical to the set's own drawing, `stroke-width` and all.
 */
function icon(displayName: string, file: string, source: string): React.FC<IconProps> {
  const { viewBox, inner } = parseAsset(source, file)
  const Icon = ({ size = 16, className }: IconProps) =>
    React.createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox,
      className,
      // Decorative: the control around an icon carries the accessible name.
      'aria-hidden': 'true',
      dangerouslySetInnerHTML: { __html: inner },
    })
  Icon.displayName = displayName
  return Icon
}

export const IconDelete = icon('IconDelete', 'delete.svg', deleteSource)
export const IconEdit = icon('IconEdit', 'edit.svg', editSource)
export const IconExport = icon('IconExport', 'export.svg', exportSource)
export const IconImport = icon('IconImport', 'import.svg', importSource)
export const IconPlus = icon('IconPlus', 'plus.svg', plusSource)

/** The palette is the one glyph whose seat belongs to the shell; see below. */
const THEME_ASSET = parseAsset(themeSource, 'theme.svg')
const THEME_NAV_ICON_SIZE = 16

/**
 * The palette as markup instead of as a component, because its only consumer
 * patches shell DOM rather than rendering it: `patchThemeNavIcon` in theme.tsx
 * hides the gear the settings nav draws for an unknown section and writes this
 * into the seat beside it. The string therefore travels whole, with width and
 * height pinned to the shell's 16px icon slot — the asset's own `1em` would
 * resolve against whatever font the nav happens to carry.
 */
export const THEME_NAV_MARKUP =
  '<svg xmlns="http://www.w3.org/2000/svg" ' +
  `width="${THEME_NAV_ICON_SIZE}" height="${THEME_NAV_ICON_SIZE}" viewBox="${THEME_ASSET.viewBox}" aria-hidden="true">` +
  `${THEME_ASSET.inner}</svg>`
