import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Cobalt2 (Wes Bos): light #EAF2FF -> dark #193549 (official background)
const bluish = buildScale('--dsw-static-neutral-bluish', '#EAF2FF', '#193549', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#EAF2FF', '#193549', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#0054A6',
  blue: '#0054A6',
  green: '#0E7A4A',
  amber: '#8A6A00',
  red: '#D42A2A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#0088FF',
  blue: '#0088FF',
  green: '#3AD900',
  amber: '#FFC600',
  red: '#FF628C',
})

export const cobalt2 = {
  label: 'Cobalt2',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#0054A6',
    '--shiki-token-string': '#0E7A4A',
    '--shiki-token-comment': '#6B7C8D',
    '--shiki-token-keyword': '#A31515',
    '--shiki-token-parameter': '#8A6A00',
    '--shiki-token-function': '#0054A6',
    '--shiki-token-string-expression': '#0E7A4A',
    '--shiki-token-punctuation': '#334454',
    '--shiki-token-link': '#0054A6',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FFC600',
    '--shiki-token-string': '#3AD900',
    '--shiki-token-comment': '#7C8B9E',
    '--shiki-token-keyword': '#FF9D00',
    '--shiki-token-parameter': '#FFC600',
    '--shiki-token-function': '#0088FF',
    '--shiki-token-string-expression': '#3AD900',
    '--shiki-token-punctuation': '#E1EFFF',
    '--shiki-token-link': '#0088FF',
  },
} as const
