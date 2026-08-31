import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#FAFAFA', '#282a36', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FAFAFA', '#282a36', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#7C3AED',
  blue: '#7C3AED',
  green: '#2A9D4A',
  amber: '#B78100',
  red: '#E63C3C',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#BD93F9',
  blue: '#BD93F9',
  green: '#50FA7B',
  amber: '#F1FA8C',
  red: '#FF5555',
})

export const dracula = {
  label: 'Dracula',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#6A3FB5',
      '--shiki-token-string': '#1A7A3A',
      '--shiki-token-comment': '#6D7A9E',
      '--shiki-token-keyword': '#A21CAF',
      '--shiki-token-parameter': '#B45309',
      '--shiki-token-function': '#7C3AED',
      '--shiki-token-string-expression': '#1A7A3A',
      '--shiki-token-punctuation': '#44475A',
      '--shiki-token-link': '#7C3AED',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#8BE9FD',
      '--shiki-token-string': '#50FA7B',
      '--shiki-token-comment': '#99A3C4',
      '--shiki-token-keyword': '#FF79C6',
      '--shiki-token-parameter': '#FFB86C',
      '--shiki-token-function': '#BD93F9',
      '--shiki-token-string-expression': '#50FA7B',
      '--shiki-token-punctuation': '#F8F8F2',
      '--shiki-token-link': '#BD93F9',
  },
} as const
