import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Cursor (Linear-inspired dark): light #FAFAFA -> dark #0E0E10 (near-black with blue tint)
const bluish = buildScale('--dsw-static-neutral-bluish', '#F2F2F3', '#0E0E10', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FAFAFA', '#0E0E10', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#4F46E5',
  blue: '#4F46E5',
  green: '#059669',
  amber: '#D97706',
  red: '#DC2626',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#5E6AD2',
  blue: '#5E6AD2',
  green: '#0DBF6A',
  amber: '#FF8A00',
  red: '#FF6467',
})

export const cursor = {
  label: 'Cursor',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#4F46E5',
    '--shiki-token-string': '#059669',
    '--shiki-token-comment': '#6B7280',
    '--shiki-token-keyword': '#7C3AED',
    '--shiki-token-parameter': '#B45309',
    '--shiki-token-function': '#4F46E5',
    '--shiki-token-string-expression': '#059669',
    '--shiki-token-punctuation': '#3F3F46',
    '--shiki-token-link': '#4F46E5',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#5E6AD2',
    '--shiki-token-string': '#0DBF6A',
    '--shiki-token-comment': '#6B7280',
    '--shiki-token-keyword': '#A78BFA',
    '--shiki-token-parameter': '#FF8A00',
    '--shiki-token-function': '#5E6AD2',
    '--shiki-token-string-expression': '#0DBF6A',
    '--shiki-token-punctuation': '#A1A1AA',
    '--shiki-token-link': '#5E6AD2',
  },
} as const
