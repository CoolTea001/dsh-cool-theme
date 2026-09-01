import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Catppuccin Macchiato: Latte #EFF1F5 -> Macchiato #24273A (official base)
const bluish = buildScale('--dsw-static-neutral-bluish', '#EFF1F5', '#24273A', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#EFF1F5', '#24273A', NEUTRAL_STEPS)

// Latte light is shared across all Catppuccin flavors
const lightSemantic = buildSemanticScales({
  deepseek: '#7287FD',
  blue: '#7287FD',
  green: '#40A02B',
  amber: '#DF8E1D',
  red: '#D20F39',
})

// Macchiato palette: Lavender #B7BDF8 / Blue #8AADF4 / Green #A6DA95 / Peach #F5A97F / Red #ED8796
const darkSemantic = buildSemanticScales({
  deepseek: '#B7BDF8',
  blue: '#B7BDF8',
  green: '#A6DA95',
  amber: '#F5A97F',
  red: '#ED8796',
})

export const catppuccinMacchiato = {
  label: 'Catppuccin Macchiato',
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
    '--shiki-token-constant': '#F5A97F',
    '--shiki-token-string': '#A6DA95',
    '--shiki-token-comment': '#8087A2',
    '--shiki-token-keyword': '#C6A0F6',
    '--shiki-token-parameter': '#8AADF4',
    '--shiki-token-function': '#B7BDF8',
    '--shiki-token-string-expression': '#A6DA95',
    '--shiki-token-punctuation': '#CAD3F5',
    '--shiki-token-link': '#91D7E3',
  },
} as const
