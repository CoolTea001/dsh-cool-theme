import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#FAFAFA', '#0D1017', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FAFAFA', '#0F1419', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#4AA8C8',
  blue: '#4AA8C8',
  green: '#5FB978',
  amber: '#EA9F41',
  red: '#E6656A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#3FB7E3',
  blue: '#3FB7E3',
  green: '#78D05C',
  amber: '#E4A75C',
  red: '#F58572',
})

export const ayu = {
  label: 'Ayu',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#A37ACC',
      '--shiki-token-string': '#6F8F00',
      '--shiki-token-comment': '#6E7681',
      '--shiki-token-keyword': '#C76A1A',
      '--shiki-token-parameter': '#B87500',
      '--shiki-token-function': '#227FC0',
      '--shiki-token-string-expression': '#6F8F00',
      '--shiki-token-punctuation': '#4F5964',
      '--shiki-token-link': '#2F86B7',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#D2A6FF',
      '--shiki-token-string': '#AAD94C',
      '--shiki-token-comment': '#5A6673',
      '--shiki-token-keyword': '#FF8F40',
      '--shiki-token-parameter': '#FFB454',
      '--shiki-token-function': '#59C2FF',
      '--shiki-token-string-expression': '#AAD94C',
      '--shiki-token-punctuation': '#D6DAE0',
      '--shiki-token-link': '#39BAE6',
  },
} as const
