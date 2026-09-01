import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Palenight (Material Palenight): #FAFAFA -> #292D3E
const bluish = buildScale('--dsw-static-neutral-bluish', '#FAFAFA', '#292D3E', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FAFAFA', '#292D3E', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#3A4A6B',
  blue: '#3A4A6B',
  green: '#2E7D32',
  amber: '#B47A00',
  red: '#C62828',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#82AAFF',
  blue: '#82AAFF',
  green: '#C3E88D',
  amber: '#FFCB6B',
  red: '#F07178',
})

export const palenight = {
  label: 'Palenight',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#3A4A6B',
    '--shiki-token-string': '#2E7D32',
    '--shiki-token-comment': '#6B7C8D',
    '--shiki-token-keyword': '#7C4DFF',
    '--shiki-token-parameter': '#B47A00',
    '--shiki-token-function': '#3A4A6B',
    '--shiki-token-string-expression': '#2E7D32',
    '--shiki-token-punctuation': '#3C435E',
    '--shiki-token-link': '#3A4A6B',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FFCB6B',
    '--shiki-token-string': '#C3E88D',
    '--shiki-token-comment': '#676E95',
    '--shiki-token-keyword': '#C792EA',
    '--shiki-token-parameter': '#FFCB6B',
    '--shiki-token-function': '#82AAFF',
    '--shiki-token-string-expression': '#C3E88D',
    '--shiki-token-punctuation': '#A6ACCD',
    '--shiki-token-link': '#82AAFF',
  },
} as const
