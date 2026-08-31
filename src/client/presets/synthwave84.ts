import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Synthwave '84: neon dusk #F5F0FF -> #262335
const bluish = buildScale('--dsw-static-neutral-bluish', '#F5F0FF', '#262335', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#F5F0FF', '#262335', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#6B21A8',
  blue: '#6B21A8',
  green: '#0E7A5A',
  amber: '#9A6A00',
  red: '#C0265A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#FF7EDB',
  blue: '#FF7EDB',
  green: '#36F9F6',
  amber: '#FEDE5D',
  red: '#F97E72',
})

export const synthwave84 = {
  label: 'Synthwave 84',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#6B21A8',
    '--shiki-token-string': '#0E7A5A',
    '--shiki-token-comment': '#8A7FA8',
    '--shiki-token-keyword': '#C0265A',
    '--shiki-token-parameter': '#9A6A00',
    '--shiki-token-function': '#6B21A8',
    '--shiki-token-string-expression': '#0E7A5A',
    '--shiki-token-punctuation': '#3A2E4A',
    '--shiki-token-link': '#6B21A8',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FEDE5D',
    '--shiki-token-string': '#36F9F6',
    '--shiki-token-comment': '#848BBD',
    '--shiki-token-keyword': '#FF7EDB',
    '--shiki-token-parameter': '#FEDE5D',
    '--shiki-token-function': '#FF7EDB',
    '--shiki-token-string-expression': '#36F9F6',
    '--shiki-token-punctuation': '#FFFFFF',
    '--shiki-token-link': '#36F9F6',
  },
} as const
