import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#fdf6e3', '#002b36', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#fdf6e3', '#002b36', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#268BD2',
  blue: '#268BD2',
  green: '#859900',
  amber: '#B58900',
  red: '#DC322F',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#78B7E3',
  blue: '#78B7E3',
  green: '#B3C061',
  amber: '#D1B661',
  red: '#E9807E',
})

export const solarized = {
  label: 'Solarized',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#2AA198',
      '--shiki-token-string': '#586E75',
      '--shiki-token-comment': '#93A1A1',
      '--shiki-token-keyword': '#859900',
      '--shiki-token-parameter': '#CB4B16',
      '--shiki-token-function': '#268BD2',
      '--shiki-token-string-expression': '#2AA198',
      '--shiki-token-punctuation': '#657B83',
      '--shiki-token-link': '#268BD2',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#66BBB5',
      '--shiki-token-string': '#859900',
      '--shiki-token-comment': '#92A1A5',
      '--shiki-token-keyword': '#268BD2',
      '--shiki-token-parameter': '#DA7D57',
      '--shiki-token-function': '#B58900',
      '--shiki-token-string-expression': '#66BBB5',
      '--shiki-token-punctuation': '#93A1A1',
      '--shiki-token-link': '#63ABDF',
  },
} as const
