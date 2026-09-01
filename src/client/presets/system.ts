import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// System: iOS system gray #F5F5F7 -> #1C1C1E
const bluish = buildScale('--dsw-static-neutral-bluish', '#F5F5F7', '#1C1C1E', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#F5F5F7', '#1C1C1E', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#007AFF',
  blue: '#007AFF',
  green: '#34C759',
  amber: '#FF9500',
  red: '#FF3B30',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#0A84FF',
  blue: '#0A84FF',
  green: '#30D158',
  amber: '#FF9F0A',
  red: '#FF453A',
})

export const system = {
  label: 'System',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#007AFF',
    '--shiki-token-string': '#34C759',
    '--shiki-token-comment': '#8E8E93',
    '--shiki-token-keyword': '#AF52DE',
    '--shiki-token-parameter': '#FF9500',
    '--shiki-token-function': '#007AFF',
    '--shiki-token-string-expression': '#34C759',
    '--shiki-token-punctuation': '#1C1C1E',
    '--shiki-token-link': '#007AFF',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#0A84FF',
    '--shiki-token-string': '#30D158',
    '--shiki-token-comment': '#8E8E93',
    '--shiki-token-keyword': '#BF5AF2',
    '--shiki-token-parameter': '#FF9F0A',
    '--shiki-token-function': '#0A84FF',
    '--shiki-token-string-expression': '#30D158',
    '--shiki-token-punctuation': '#F5F5F7',
    '--shiki-token-link': '#0A84FF',
  },
} as const
