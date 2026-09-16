import type { StaticMap } from './css/primitives.js'
import { PRESET_IDS, type BuiltinPresetId } from '../presets-ids.js'

import { aura } from './presets/aura.js'
import { ayu } from './presets/ayu.js'
import { catppuccin } from './presets/catppuccin.js'
import { catppuccinFrappe } from './presets/catppuccin-frappe.js'
import { catppuccinMacchiato } from './presets/catppuccin-macchiato.js'
import { cobalt2 } from './presets/cobalt2.js'
import { cursor } from './presets/cursor.js'
import { dracula } from './presets/dracula.js'
import { dsh } from './presets/dsh.js'
import { everforest } from './presets/everforest.js'
import { flexoki } from './presets/flexoki.js'
import { github } from './presets/github.js'
import { gruvbox } from './presets/gruvbox.js'
import { kanagawa } from './presets/kanagawa.js'
import { lucentOrng } from './presets/lucent-orng.js'
import { material } from './presets/material.js'
import { matrix } from './presets/matrix.js'
import { mercury } from './presets/mercury.js'
import { monokai } from './presets/monokai.js'
import { nightowl } from './presets/nightowl.js'
import { nord } from './presets/nord.js'
import { onedark } from './presets/onedark.js'
import { opencode } from './presets/opencode.js'
import { orng } from './presets/orng.js'
import { osakaJade } from './presets/osaka-jade.js'
import { palenight } from './presets/palenight.js'
import { rosepine } from './presets/rosepine.js'
import { solarized } from './presets/solarized.js'
import { synthwave84 } from './presets/synthwave84.js'
import { system } from './presets/system.js'
import { tokyonight } from './presets/tokyonight.js'
import { vercel } from './presets/vercel.js'
import { vesper } from './presets/vesper.js'
import { zenburn } from './presets/zenburn.js'

/** A fully resolved theme: one primitive map per appearance. */
export type PresetDef = { label: string; light: StaticMap; dark: StaticMap }

/**
 * Every shipped preset, one entry per {@link PRESET_IDS} name. The mapped type
 * makes the two lists agree at compile time: a preset without a colour map, or a
 * name with no entry here, is a type error rather than a theme that goes missing
 * from the picker (or from an import's validation).
 */
export const PRESETS: Record<BuiltinPresetId, PresetDef> = {
  aura,
  ayu,
  catppuccin,
  'catppuccin-frappe': catppuccinFrappe,
  'catppuccin-macchiato': catppuccinMacchiato,
  cobalt2,
  cursor,
  dracula,
  dsh,
  everforest,
  flexoki,
  github,
  gruvbox,
  kanagawa,
  'lucent-orng': lucentOrng,
  material,
  matrix,
  mercury,
  monokai,
  nightowl,
  nord,
  onedark,
  opencode,
  orng,
  'osaka-jade': osakaJade,
  palenight,
  rosepine,
  solarized,
  synthwave84,
  system,
  tokyonight,
  vercel,
  vesper,
  zenburn,
}

/** `native` is a legacy storage alias for `dsh` — both mean "system default, no overrides". */
export type PresetId = keyof typeof PRESETS | 'native'

/**
 * Presets that override nothing: the shell keeps its own colours. The single
 * source of this set, so the token layer and the panel cannot drift on it.
 */
export const NOOP_PRESET_IDS: ReadonlySet<PresetId> = new Set<PresetId>(['native', 'dsh'])

export const presetOptions: { value: PresetId; label: string }[] = [
  { value: 'dsh', label: PRESETS.dsh.label },
  // The shipped order comes from the id list, not from the map's insertion
  // order, so the picker cannot reorder itself when the map is edited.
  ...PRESET_IDS.filter((id) => id !== 'dsh').map((id) => ({
    value: id as PresetId,
    label: PRESETS[id].label,
  })),
]
