import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Orng: warm orange #FFF4E6 -> deep #1A0F00
const bluish = buildScale('--dsw-static-neutral-bluish', '#FFF4E6', '#1A0F00', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFF4E6', '#1A0F00', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#9A3412',
  blue: '#9A3412',
  green: '#166534',
  amber: '#EA580C',
  red: '#DC2626',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#FF6B00',
  blue: '#FF6B00',
  green: '#22C55E',
  amber: '#FF8A00',
  red: '#F43F5E',
})

export const orng = {
  label: 'Orng',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#9A3412',
    '--shiki-token-string': '#166534',
    '--shiki-token-comment': '#9A8B7A',
    '--shiki-token-keyword': '#C2410C',
    '--shiki-token-parameter': '#EA580C',
    '--shiki-token-function': '#9A3412',
    '--shiki-token-string-expression': '#166534',
    '--shiki-token-punctuation': '#451A03',
    '--shiki-token-link': '#9A3412',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FF8A00',
    '--shiki-token-string': '#22C55E',
    '--shiki-token-comment': '#8C6A4A',
    '--shiki-token-keyword': '#FF6B00',
    '--shiki-token-parameter': '#FDBA74',
    '--shiki-token-function': '#FF6B00',
    '--shiki-token-string-expression': '#22C55E',
    '--shiki-token-punctuation': '#FFEFD6',
    '--shiki-token-link': '#FF6B00',
  },
} as const
