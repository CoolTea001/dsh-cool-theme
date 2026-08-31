import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#e6e7ed', '#1a1b26', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#e6e7ed', '#1a1b26', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#34548A',
  blue: '#34548A',
  green: '#33635C',
  amber: '#8F5E15',
  red: '#C53B53',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#7AA2F7',
  blue: '#7AA2F7',
  green: '#9ECE6A',
  amber: '#E0AF68',
  red: '#F7768E',
})

export const tokyonight = {
  label: 'Tokyo Night',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#0F4B6E',
      '--shiki-token-string': '#1A7A3A',
      '--shiki-token-comment': '#6E7A9E',
      '--shiki-token-keyword': '#8C4351',
      '--shiki-token-parameter': '#965027',
      '--shiki-token-function': '#34548A',
      '--shiki-token-string-expression': '#1A7A3A',
      '--shiki-token-punctuation': '#5A638C',
      '--shiki-token-link': '#34548A',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#7DCFFF',
      '--shiki-token-string': '#9ECE6A',
      '--shiki-token-comment': '#9197B2',
      '--shiki-token-keyword': '#BB9AF7',
      '--shiki-token-parameter': '#FF9E64',
      '--shiki-token-function': '#7AA2F7',
      '--shiki-token-string-expression': '#9ECE6A',
      '--shiki-token-punctuation': '#C0CAF5',
      '--shiki-token-link': '#7AA2F7',
  },
} as const
