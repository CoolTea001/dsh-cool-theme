import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Material (Palenight/Ocean): #FAFAFA -> #0F111A (material ocean)
const bluish = buildScale('--dsw-static-neutral-bluish', '#FAFAFA', '#0F111A', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FAFAFA', '#0F111A', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#1565C0',
  blue: '#1565C0',
  green: '#2E7D32',
  amber: '#EF6C00',
  red: '#C62828',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#82AAFF',
  blue: '#82AAFF',
  green: '#C3E88D',
  amber: '#FFCB6B',
  red: '#F07178',
})

export const material = {
  label: 'Material',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#1565C0',
    '--shiki-token-string': '#2E7D32',
    '--shiki-token-comment': '#6B7C8D',
    '--shiki-token-keyword': '#7C4DFF',
    '--shiki-token-parameter': '#EF6C00',
    '--shiki-token-function': '#1565C0',
    '--shiki-token-string-expression': '#2E7D32',
    '--shiki-token-punctuation': '#37474F',
    '--shiki-token-link': '#1565C0',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FFCB6B',
    '--shiki-token-string': '#C3E88D',
    '--shiki-token-comment': '#676E95',
    '--shiki-token-keyword': '#C792EA',
    '--shiki-token-parameter': '#FFCB6B',
    '--shiki-token-function': '#82AAFF',
    '--shiki-token-string-expression': '#C3E88D',
    '--shiki-token-punctuation': '#EEFFFF',
    '--shiki-token-link': '#82AAFF',
  },
} as const
