import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Kanagawa (rebelot/kanagawa.nvim): fujiWhite #F2ECBC -> sumiInk1 #1F1F28
const bluish = buildScale('--dsw-static-neutral-bluish', '#F2ECBC', '#1F1F28', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#F2ECBC', '#1F1F28', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#2D4F67',
  blue: '#2D4F67',
  green: '#587353',
  amber: '#8A6A2E',
  red: '#9E3A3D',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#7E9CD8',
  blue: '#7E9CD8',
  green: '#98BB6C',
  amber: '#E6C384',
  red: '#E46876',
})

export const kanagawa = {
  label: 'Kanagawa',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#5A6A8A',
    '--shiki-token-string': '#587353',
    '--shiki-token-comment': '#8A9A7B',
    '--shiki-token-keyword': '#957FB8',
    '--shiki-token-parameter': '#8A6A2E',
    '--shiki-token-function': '#2D4F67',
    '--shiki-token-string-expression': '#587353',
    '--shiki-token-punctuation': '#43436C',
    '--shiki-token-link': '#2D4F67',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#DCA561',
    '--shiki-token-string': '#98BB6C',
    '--shiki-token-comment': '#727169',
    '--shiki-token-keyword': '#957FB8',
    '--shiki-token-parameter': '#FFA066',
    '--shiki-token-function': '#7E9CD8',
    '--shiki-token-string-expression': '#98BB6C',
    '--shiki-token-punctuation': '#DCD7BA',
    '--shiki-token-link': '#7FB4CA',
  },
} as const
