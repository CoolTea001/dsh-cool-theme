import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#ffffff', '#0d1117', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#ffffff', '#0d1117', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#0969da',
  blue: '#0969da',
  green: '#1A7F37',
  amber: '#9A6700',
  red: '#CF222E',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#58A6FF',
  blue: '#58A6FF',
  green: '#3FB950',
  amber: '#D29922',
  red: '#F85149',
})

export const github = {
  label: 'GitHub',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#0550AE',
      '--shiki-token-string': '#0A3069',
      '--shiki-token-comment': '#6E7781',
      '--shiki-token-keyword': '#CF222E',
      '--shiki-token-parameter': '#953800',
      '--shiki-token-function': '#8250DF',
      '--shiki-token-string-expression': '#1A7F37',
      '--shiki-token-punctuation': '#656D76',
      '--shiki-token-link': '#0969DA',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#79C0FF',
      '--shiki-token-string': '#A5D6FF',
      '--shiki-token-comment': '#8B949E',
      '--shiki-token-keyword': '#FF7B72',
      '--shiki-token-parameter': '#FFA657',
      '--shiki-token-function': '#D2A8FF',
      '--shiki-token-string-expression': '#7EE787',
      '--shiki-token-punctuation': '#8B949E',
      '--shiki-token-link': '#58A6FF',
  },
} as const
