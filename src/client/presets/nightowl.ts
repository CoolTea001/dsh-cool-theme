import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Night Owl (Sarah Drasner): #F7F9FF -> #011627
const bluish = buildScale('--dsw-static-neutral-bluish', '#F7F9FF', '#011627', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#F7F9FF', '#011627', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#0B2948',
  blue: '#0B2948',
  green: '#0A7A5A',
  amber: '#8A6A00',
  red: '#B93D3D',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#82AAFF',
  blue: '#82AAFF',
  green: '#22DA6E',
  amber: '#FFEB95',
  red: '#EF5350',
})

export const nightowl = {
  label: 'Night Owl',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#0B2948',
    '--shiki-token-string': '#0A7A5A',
    '--shiki-token-comment': '#6B7B8D',
    '--shiki-token-keyword': '#7C3AED',
    '--shiki-token-parameter': '#8A6A00',
    '--shiki-token-function': '#0B2948',
    '--shiki-token-string-expression': '#0A7A5A',
    '--shiki-token-punctuation': '#2C3E50',
    '--shiki-token-link': '#0B2948',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FFEB95',
    '--shiki-token-string': '#22DA6E',
    '--shiki-token-comment': '#637777',
    '--shiki-token-keyword': '#C792EA',
    '--shiki-token-parameter': '#F78C6C',
    '--shiki-token-function': '#82AAFF',
    '--shiki-token-string-expression': '#22DA6E',
    '--shiki-token-punctuation': '#D6DEEB',
    '--shiki-token-link': '#7FDBCA',
  },
} as const
