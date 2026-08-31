import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#faf4ed', '#191724', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#faf4ed', '#191724', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#907AA9',
  blue: '#907AA9',
  green: '#286983',
  amber: '#EA9D34',
  red: '#B4637A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#C4A7E7',
  blue: '#C4A7E7',
  green: '#9CCFD8',
  amber: '#F6C177',
  red: '#EB6F92',
})

export const rosepine = {
  label: 'Rosé Pine',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#56949F',
      '--shiki-token-string': '#286983',
      '--shiki-token-comment': '#9893A5',
      '--shiki-token-keyword': '#907AA9',
      '--shiki-token-parameter': '#B4637A',
      '--shiki-token-function': '#907AA9',
      '--shiki-token-string-expression': '#286983',
      '--shiki-token-punctuation': '#575279',
      '--shiki-token-link': '#907AA9',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#9CCFD8',
      '--shiki-token-string': '#EBBCBA',
      '--shiki-token-comment': '#A19EB0',
      '--shiki-token-keyword': '#C4A7E7',
      '--shiki-token-parameter': '#EB6F92',
      '--shiki-token-function': '#E0DEF4',
      '--shiki-token-string-expression': '#EBBCBA',
      '--shiki-token-punctuation': '#E0DEF4',
      '--shiki-token-link': '#C4A7E7',
  },
} as const
