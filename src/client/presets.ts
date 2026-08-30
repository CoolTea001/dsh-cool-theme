import type { StaticMap } from './css/primitives.js'

import { ayu } from './presets/ayu.js'
import { catppuccin } from './presets/catppuccin.js'
import { dracula } from './presets/dracula.js'
import { dsh } from './presets/dsh.js'
import { github } from './presets/github.js'
import { gruvbox } from './presets/gruvbox.js'
import { monokai } from './presets/monokai.js'
import { nord } from './presets/nord.js'
import { onedark } from './presets/onedark.js'
import { rosepine } from './presets/rosepine.js'
import { solarized } from './presets/solarized.js'
import { tokyonight } from './presets/tokyonight.js'
import { zenburn } from './presets/zenburn.js'

type PresetDef = { label: string; light: StaticMap; dark: StaticMap }

export const PRESETS = {
  ayu,
  catppuccin,
  dracula,
  dsh,
  github,
  gruvbox,
  monokai,
  nord,
  onedark,
  rosepine,
  solarized,
  tokyonight,
  zenburn,
} as const satisfies Record<string, PresetDef>

/** `native` is a legacy storage alias for `dsh` — both mean “system default, no overrides”. */
export type PresetId = keyof typeof PRESETS | 'native'

export const presetOptions: { value: PresetId; label: string }[] = [
  { value: 'dsh', label: 'DSH' },
  { value: 'ayu', label: 'Ayu' },
  { value: 'catppuccin', label: 'Catppuccin' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'github', label: 'GitHub' },
  { value: 'gruvbox', label: 'Gruvbox' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'nord', label: 'Nord' },
  { value: 'onedark', label: 'One Dark' },
  { value: 'rosepine', label: 'Rosé Pine' },
  { value: 'solarized', label: 'Solarized' },
  { value: 'tokyonight', label: 'Tokyo Night' },
  { value: 'zenburn', label: 'Zenburn' },
]
