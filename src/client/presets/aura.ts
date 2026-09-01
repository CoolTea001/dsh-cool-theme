import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#EDE9FE', '#15141B', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#EDE9FE', '#15141B', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#7C3AED',
  blue: '#7C3AED',
  green: '#059669',
  amber: '#D97706',
  red: '#E11D48',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#A277FF',
  blue: '#A277FF',
  green: '#61FFCA',
  amber: '#FFCA85',
  red: '#FF6767',
})

export const aura = {
  label: 'Aura',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#7C3AED',
    '--shiki-token-string': '#059669',
    '--shiki-token-comment': '#6B7280',
    '--shiki-token-keyword': '#C026D3',
    '--shiki-token-parameter': '#B45309',
    '--shiki-token-function': '#7C3AED',
    '--shiki-token-string-expression': '#059669',
    '--shiki-token-punctuation': '#4B5563',
    '--shiki-token-link': '#7C3AED',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FFCA85',
    '--shiki-token-string': '#61FFCA',
    '--shiki-token-comment': '#6C6F93',
    '--shiki-token-keyword': '#FF61EF',
    '--shiki-token-parameter': '#FFCA85',
    '--shiki-token-function': '#A277FF',
    '--shiki-token-string-expression': '#61FFCA',
    '--shiki-token-punctuation': '#B4B7CF',
    '--shiki-token-link': '#A277FF',
  },
} as const
