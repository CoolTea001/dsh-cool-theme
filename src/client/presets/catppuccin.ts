import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#eff1f5', '#1e1e2e', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#eff1f5', '#1e1e2e', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#7287FD',
  blue: '#7287FD',
  green: '#40A02B',
  amber: '#DF8E1D',
  red: '#D20F39',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#B4BEFE',
  blue: '#B4BEFE',
  green: '#A6D189',
  amber: '#F4B8E4',
  red: '#F38BA8',
})

export const catppuccin = {
  label: 'Catppuccin',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#CA6702',
      '--shiki-token-string': '#40A02B',
      '--shiki-token-comment': '#6C7086',
      '--shiki-token-keyword': '#8839EF',
      '--shiki-token-parameter': '#1E66F5',
      '--shiki-token-function': '#7287FD',
      '--shiki-token-string-expression': '#40A02B',
      '--shiki-token-punctuation': '#5C5F77',
      '--shiki-token-link': '#04A5E5',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#FAB387',
      '--shiki-token-string': '#A6D189',
      '--shiki-token-comment': '#6C7086',
      '--shiki-token-keyword': '#CBA6F7',
      '--shiki-token-parameter': '#89B4FA',
      '--shiki-token-function': '#B4BEFE',
      '--shiki-token-string-expression': '#A6D189',
      '--shiki-token-punctuation': '#CDD6F4',
      '--shiki-token-link': '#89DCEB',
  },
} as const
