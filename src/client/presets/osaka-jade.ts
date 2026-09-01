import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Osaka Jade: jade paper #F0FAF5 -> deep jade #0F2A1F
const bluish = buildScale('--dsw-static-neutral-bluish', '#F0FAF5', '#0F2A1F', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#F0FAF5', '#0F2A1F', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#0F6F5C',
  blue: '#0F6F5C',
  green: '#0F6F5C',
  amber: '#8A6A00',
  red: '#9F1239',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#00A86B',
  blue: '#00A86B',
  green: '#00A86B',
  amber: '#E6C384',
  red: '#E46876',
})

export const osakaJade = {
  label: 'Osaka Jade',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#0F6F5C',
    '--shiki-token-string': '#0B7A3E',
    '--shiki-token-comment': '#6B8A7A',
    '--shiki-token-keyword': '#0F6F5C',
    '--shiki-token-parameter': '#8A6A00',
    '--shiki-token-function': '#0F6F5C',
    '--shiki-token-string-expression': '#0B7A3E',
    '--shiki-token-punctuation': '#1A3A2A',
    '--shiki-token-link': '#0F6F5C',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#6A9589',
    '--shiki-token-string': '#98BB6C',
    '--shiki-token-comment': '#6B8A7A',
    '--shiki-token-keyword': '#00A86B',
    '--shiki-token-parameter': '#E6C384',
    '--shiki-token-function': '#00A86B',
    '--shiki-token-string-expression': '#98BB6C',
    '--shiki-token-punctuation': '#D0E8D8',
    '--shiki-token-link': '#7FB4CA',
  },
} as const
