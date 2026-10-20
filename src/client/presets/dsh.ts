import type { StaticMap } from '../css/primitives.js'
import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#FFFFFF', '#0F1115', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFFFFF', '#000000', NEUTRAL_STEPS)

// DSH's own palette is appearance-independent below the alias layer, so both
// appearances share the same semantic scales.
const semantic = buildSemanticScales({
  deepseek: '#4176E6',
  blue: '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
})

export const dsh = {
  label: 'DSH',
  light: {
    ...bluish,
    ...neutral,
    ...semantic,
  },
  dark: {
    ...bluish,
    ...neutral,
    ...semantic,
  },
} as const satisfies { label: string; light: StaticMap; dark: StaticMap }
