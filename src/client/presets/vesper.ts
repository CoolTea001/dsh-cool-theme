import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Vesper: warm twilight #FDFCFB -> #0A0A0B
const bluish = buildScale('--dsw-static-neutral-bluish', '#FDFCFB', '#0A0A0B', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FDFCFB', '#0A0A0B', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#3A3A3A',
  blue: '#3A3A3A',
  green: '#5A7A3A',
  amber: '#8A6A2E',
  red: '#8A2A2E',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#E8E8E8',
  blue: '#E8E8E8',
  green: '#B8C8A8',
  amber: '#D6C8A8',
  red: '#C9A8A8',
})

export const vesper = {
  label: 'Vesper',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#3A3A3A',
    '--shiki-token-string': '#5A7A3A',
    '--shiki-token-comment': '#8A8A8A',
    '--shiki-token-keyword': '#3A3A3A',
    '--shiki-token-parameter': '#8A6A2E',
    '--shiki-token-function': '#3A3A3A',
    '--shiki-token-string-expression': '#5A7A3A',
    '--shiki-token-punctuation': '#2A2A2A',
    '--shiki-token-link': '#3A3A3A',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#E8E8E8',
    '--shiki-token-string': '#B8C8A8',
    '--shiki-token-comment': '#8A8A8A',
    '--shiki-token-keyword': '#E8E8E8',
    '--shiki-token-parameter': '#D6C8A8',
    '--shiki-token-function': '#E8E8E8',
    '--shiki-token-string-expression': '#B8C8A8',
    '--shiki-token-punctuation': '#E8E8E8',
    '--shiki-token-link': '#E8E8E8',
  },
} as const
