import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#D8DEE9', '#2E3440', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#D8DEE9', '#2E3440', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#5E81AC',
  blue: '#5E81AC',
  green: '#A3BE8C',
  amber: '#EBCB8B',
  red: '#BF616A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#88C0D0',
  blue: '#88C0D0',
  green: '#C6D7B8',
  amber: '#F3DFB7',
  red: '#D79DA3',
})

export const nord = {
  label: 'Nord',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#2E6EA6',
      '--shiki-token-string': '#3D7A1F',
      '--shiki-token-comment': '#6C7A8E',
      '--shiki-token-keyword': '#8B4A9A',
      '--shiki-token-parameter': '#9A5D2E',
      '--shiki-token-function': '#2F6F8A',
      '--shiki-token-string-expression': '#3D7A1F',
      '--shiki-token-punctuation': '#4C566A',
      '--shiki-token-link': '#5E81AC',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#8BE9FD',
      '--shiki-token-string': '#A3BE8C',
      '--shiki-token-comment': '#99A3C4',
      '--shiki-token-keyword': '#FF79C6',
      '--shiki-token-parameter': '#D08770',
      '--shiki-token-function': '#88C0D0',
      '--shiki-token-string-expression': '#A3BE8C',
      '--shiki-token-punctuation': '#8CA0B8',
      '--shiki-token-link': '#88C0D0',
  },
} as const
