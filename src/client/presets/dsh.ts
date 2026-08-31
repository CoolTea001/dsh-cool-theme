import type { StaticMap } from '../css/primitives.js'
import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#FFFFFF', '#0F1115', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFFFFF', '#000000', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#4176E6',
  blue: '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
})

const darkSemantic = buildSemanticScales({
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
    ...lightSemantic,

  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,

  },
} as const satisfies { label: string; light: StaticMap; dark: StaticMap }
