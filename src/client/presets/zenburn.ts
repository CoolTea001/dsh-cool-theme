import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#FFFFEF', '#3f3f3f', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFFFEF', '#3f3f3f', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#2B6F6F',
  blue: '#2B6F6F',
  green: '#4A6F4A',
  amber: '#8F7A3A',
  red: '#8C3333',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#8CD0D3',
  blue: '#8CD0D3',
  green: '#7F9F7F',
  amber: '#D0BF8F',
  red: '#CC9393',
})

export const zenburn = {
  label: 'Zenburn',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#2B6F6F',
      '--shiki-token-string': '#8C3333',
      '--shiki-token-comment': '#7A8A7A',
      '--shiki-token-keyword': '#705040',
      '--shiki-token-parameter': '#8F5A00',
      '--shiki-token-function': '#2B6F6F',
      '--shiki-token-string-expression': '#8C3333',
      '--shiki-token-punctuation': '#5F6F5F',
      '--shiki-token-link': '#2B6F6F',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#8CD0D3',
      '--shiki-token-string': '#CC9393',
      '--shiki-token-comment': '#7F9F7F',
      '--shiki-token-keyword': '#F0DFAF',
      '--shiki-token-parameter': '#D0BF8F',
      '--shiki-token-function': '#8CD0D3',
      '--shiki-token-string-expression': '#CC9393',
      '--shiki-token-punctuation': '#DCDCCC',
      '--shiki-token-link': '#8CD0D3',
  },
} as const
