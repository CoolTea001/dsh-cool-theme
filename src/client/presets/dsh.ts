import type { StaticMap } from '../css/primitives.js'

export const dsh = {
  label: 'DSH',
  light: {},
  dark: {},
} as const satisfies { label: string; light: StaticMap; dark: StaticMap }
