import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Flexoki (Steph Ango): paper #FFFCF0 -> black #100F0F
const bluish = buildScale('--dsw-static-neutral-bluish', '#FFFCF0', '#100F0F', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFFCF0', '#100F0F', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#205EA6',
  blue: '#205EA6',
  green: '#66800B',
  amber: '#AD8301',
  red: '#AF3029',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#4385BE',
  blue: '#4385BE',
  green: '#879A39',
  amber: '#D0A215',
  red: '#D14D41',
})

export const flexoki = {
  label: 'Flexoki',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#BC5215',
    '--shiki-token-string': '#66800B',
    '--shiki-token-comment': '#6F6E69',
    '--shiki-token-keyword': '#A02F6F',
    '--shiki-token-parameter': '#AD8301',
    '--shiki-token-function': '#205EA6',
    '--shiki-token-string-expression': '#66800B',
    '--shiki-token-punctuation': '#575653',
    '--shiki-token-link': '#205EA6',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#DA702C',
    '--shiki-token-string': '#879A39',
    '--shiki-token-comment': '#6F6E69',
    '--shiki-token-keyword': '#CE5D97',
    '--shiki-token-parameter': '#D0A215',
    '--shiki-token-function': '#4385BE',
    '--shiki-token-string-expression': '#879A39',
    '--shiki-token-punctuation': '#CECDC3',
    '--shiki-token-link': '#4385BE',
  },
} as const
