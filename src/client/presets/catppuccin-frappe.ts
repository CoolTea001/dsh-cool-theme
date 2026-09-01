import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Catppuccin Frappe: Latte #EFF1F5 -> Frappe #303446 (official base)
const bluish = buildScale('--dsw-static-neutral-bluish', '#EFF1F5', '#303446', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#EFF1F5', '#303446', NEUTRAL_STEPS)

// Latte light is shared across all Catppuccin flavors
const lightSemantic = buildSemanticScales({
  deepseek: '#7287FD',
  blue: '#7287FD',
  green: '#40A02B',
  amber: '#DF8E1D',
  red: '#D20F39',
})

// Frappe palette: Lavender #BABBF1 / Blue #8CAAEE / Green #A6D189 / Peach #EF9F76 / Red #E78284
const darkSemantic = buildSemanticScales({
  deepseek: '#BABBF1',
  blue: '#BABBF1',
  green: '#A6D189',
  amber: '#EF9F76',
  red: '#E78284',
})

export const catppuccinFrappe = {
  label: 'Catppuccin Frappe',
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
    '--shiki-token-constant': '#EF9F76',
    '--shiki-token-string': '#A6D189',
    '--shiki-token-comment': '#838BA7',
    '--shiki-token-keyword': '#CA9EE6',
    '--shiki-token-parameter': '#8CAAEE',
    '--shiki-token-function': '#BABBF1',
    '--shiki-token-string-expression': '#A6D189',
    '--shiki-token-punctuation': '#C6D0F5',
    '--shiki-token-link': '#99D1DB',
  },
} as const
