import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#fcfcfa', '#2d2a2e', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#fcfcfa', '#2d2a2e', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#6B42A0',
  blue: '#6B42A0',
  green: '#5A8A2A',
  amber: '#B87A00',
  red: '#FF6188',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#AB9DF2',
  blue: '#AB9DF2',
  green: '#A9DC76',
  amber: '#FFD866',
  red: '#FF9DB5',
})

export const monokai = {
  label: 'Monokai',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#6B42A0',
      '--shiki-token-string': '#2A7A2A',
      '--shiki-token-comment': '#8A8A8A',
      '--shiki-token-keyword': '#C4265E',
      '--shiki-token-parameter': '#B45A00',
      '--shiki-token-function': '#6B42A0',
      '--shiki-token-string-expression': '#2A7A2A',
      '--shiki-token-punctuation': '#5B5956',
      '--shiki-token-link': '#6B42A0',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#AB9DF2',
      '--shiki-token-string': '#A9DC76',
      '--shiki-token-comment': '#A9A8A7',
      '--shiki-token-keyword': '#FF6188',
      '--shiki-token-parameter': '#FC9867',
      '--shiki-token-function': '#78DCE8',
      '--shiki-token-string-expression': '#A9DC76',
      '--shiki-token-punctuation': '#FCFCFA',
      '--shiki-token-link': '#AB9DF2',
  },
} as const
