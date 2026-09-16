/**
 * The preset ids, in one place both halves can read.
 *
 * `presets.ts` carries the colour maps and is client-only; the Host needs the
 * same id vocabulary to tell an archive that derives from a preset we ship from
 * one that does not, so the names live here and that file checks itself against
 * them.
 */

export const PRESET_IDS = [
  'aura',
  'ayu',
  'catppuccin',
  'catppuccin-frappe',
  'catppuccin-macchiato',
  'cobalt2',
  'cursor',
  'dracula',
  'dsh',
  'everforest',
  'flexoki',
  'github',
  'gruvbox',
  'kanagawa',
  'lucent-orng',
  'material',
  'matrix',
  'mercury',
  'monokai',
  'nightowl',
  'nord',
  'onedark',
  'opencode',
  'orng',
  'osaka-jade',
  'palenight',
  'rosepine',
  'solarized',
  'synthwave84',
  'system',
  'tokyonight',
  'vercel',
  'vesper',
  'zenburn',
] as const

/** One shipped preset id. `native` is a storage alias, not a preset. */
export type BuiltinPresetId = (typeof PRESET_IDS)[number]

/**
 * Whether a theme may name `base` and still be resolved here. `native` is the
 * legacy alias for `dsh`, so a theme that carries it stays usable.
 */
export function isKnownBase(value: string): boolean {
  return value === 'native' || (PRESET_IDS as readonly string[]).includes(value)
}
