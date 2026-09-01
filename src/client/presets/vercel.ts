import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Vercel: pure #FFFFFF -> #000000, accent #0070F3
const bluish = buildScale('--dsw-static-neutral-bluish', '#FFFFFF', '#000000', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFFFFF', '#000000', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#0070F3',
  blue: '#0070F3',
  green: '#0A7A42',
  amber: '#B45309',
  red: '#E00C1A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#3291FF',
  blue: '#3291FF',
  green: '#0CCB6A',
  amber: '#F5A623',
  red: '#FF6166',
})

export const vercel = {
  label: 'Vercel',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#0070F3',
    '--shiki-token-string': '#0A7A42',
    '--shiki-token-comment': '#8A8A8A',
    '--shiki-token-keyword': '#000000',
    '--shiki-token-parameter': '#B45309',
    '--shiki-token-function': '#0070F3',
    '--shiki-token-string-expression': '#0A7A42',
    '--shiki-token-punctuation': '#000000',
    '--shiki-token-link': '#0070F3',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#3291FF',
    '--shiki-token-string': '#0CCB6A',
    '--shiki-token-comment': '#8A8A8A',
    '--shiki-token-keyword': '#FFFFFF',
    '--shiki-token-parameter': '#F5A623',
    '--shiki-token-function': '#3291FF',
    '--shiki-token-string-expression': '#0CCB6A',
    '--shiki-token-punctuation': '#FFFFFF',
    '--shiki-token-link': '#3291FF',
  },
} as const
