import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#fbf1c7', '#282828', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#fbf1c7', '#282828', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#076678',
  blue: '#076678',
  green: '#98971A',
  amber: '#D79921',
  red: '#CC241D',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#83A598',
  blue: '#83A598',
  green: '#B8BB26',
  amber: '#FABD2F',
  red: '#FB4934',
})

export const gruvbox = {
  label: 'Gruvbox',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#076678',
      '--shiki-token-string': '#79740E',
      '--shiki-token-comment': '#928374',
      '--shiki-token-keyword': '#9D0006',
      '--shiki-token-parameter': '#AF3A03',
      '--shiki-token-function': '#076678',
      '--shiki-token-string-expression': '#79740E',
      '--shiki-token-punctuation': '#504945',
      '--shiki-token-link': '#076678',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#83A598',
      '--shiki-token-string': '#B8BB26',
      '--shiki-token-comment': '#B1A69B',
      '--shiki-token-keyword': '#FB4934',
      '--shiki-token-parameter': '#FE8019',
      '--shiki-token-function': '#FABD2F',
      '--shiki-token-string-expression': '#B8BB26',
      '--shiki-token-punctuation': '#EBDBB2',
      '--shiki-token-link': '#83A598',
  },
} as const
