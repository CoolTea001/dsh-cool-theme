import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Everforest (sainnhe): light #FDF6E3 (medium) -> dark #2D353B (medium)
const bluish = buildScale('--dsw-static-neutral-bluish', '#FDF6E3', '#2D353B', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FDF6E3', '#2D353B', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#42675A',
  blue: '#42675A',
  green: '#8DA101',
  amber: '#DFA000',
  red: '#F85552',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#7FBBB3',
  blue: '#7FBBB3',
  green: '#A7C080',
  amber: '#DBBC7F',
  red: '#E67E80',
})

export const everforest = {
  label: 'Everforest',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#8DA101',
    '--shiki-token-string': '#4D7D0F',
    '--shiki-token-comment': '#8B9A7E',
    '--shiki-token-keyword': '#DF69A0',
    '--shiki-token-parameter': '#DFA000',
    '--shiki-token-function': '#42675A',
    '--shiki-token-string-expression': '#4D7D0F',
    '--shiki-token-punctuation': '#5C6A72',
    '--shiki-token-link': '#3A94C5',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#DBBC7F',
    '--shiki-token-string': '#A7C080',
    '--shiki-token-comment': '#859289',
    '--shiki-token-keyword': '#D699B6',
    '--shiki-token-parameter': '#E69875',
    '--shiki-token-function': '#7FBBB3',
    '--shiki-token-string-expression': '#A7C080',
    '--shiki-token-punctuation': '#D3C6AA',
    '--shiki-token-link': '#83C092',
  },
} as const
