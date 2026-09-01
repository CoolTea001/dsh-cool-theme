import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Lucent Orng: warm paper #FFF7ED -> deep brown #1C130E
const bluish = buildScale('--dsw-static-neutral-bluish', '#FFF7ED', '#1C130E', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FFF7ED', '#1C130E', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#9A3412',
  blue: '#9A3412',
  green: '#166534',
  amber: '#EA580C',
  red: '#DC2626',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#FF8904',
  blue: '#FF8904',
  green: '#4ADE80',
  amber: '#FB923C',
  red: '#F87171',
})

export const lucentOrng = {
  label: 'Lucent Orng',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#9A3412',
    '--shiki-token-string': '#166534',
    '--shiki-token-comment': '#9A8B7A',
    '--shiki-token-keyword': '#C2410C',
    '--shiki-token-parameter': '#EA580C',
    '--shiki-token-function': '#9A3412',
    '--shiki-token-string-expression': '#166534',
    '--shiki-token-punctuation': '#57534E',
    '--shiki-token-link': '#9A3412',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#FB923C',
    '--shiki-token-string': '#4ADE80',
    '--shiki-token-comment': '#8C7A65',
    '--shiki-token-keyword': '#FF8904',
    '--shiki-token-parameter': '#FDBA74',
    '--shiki-token-function': '#FF8904',
    '--shiki-token-string-expression': '#4ADE80',
    '--shiki-token-punctuation': '#F5E6D3',
    '--shiki-token-link': '#FF8904',
  },
} as const
