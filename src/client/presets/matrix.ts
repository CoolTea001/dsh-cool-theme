import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Matrix: pale green #E8F5E9 -> deep matrix #001100 (black-green)
const bluish = buildScale('--dsw-static-neutral-bluish', '#E8F5E9', '#0D1A0D', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#E8F5E9', '#001100', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#0A5300',
  blue: '#0A5300',
  green: '#0A5300',
  amber: '#5A7A00',
  red: '#8A1A1A',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#00FF41',
  blue: '#00FF41',
  green: '#00FF41',
  amber: '#76FF03',
  red: '#FF3D57',
})

export const matrix = {
  label: 'Matrix',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#0A5300',
    '--shiki-token-string': '#0A7A00',
    '--shiki-token-comment': '#5A7A5A',
    '--shiki-token-keyword': '#0A5300',
    '--shiki-token-parameter': '#5A7A00',
    '--shiki-token-function': '#0A5300',
    '--shiki-token-string-expression': '#0A7A00',
    '--shiki-token-punctuation': '#2E3B2E',
    '--shiki-token-link': '#0A5300',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#76FF03',
    '--shiki-token-string': '#00E676',
    '--shiki-token-comment': '#4A7A4A',
    '--shiki-token-keyword': '#00FF41',
    '--shiki-token-parameter': '#76FF03',
    '--shiki-token-function': '#00FF41',
    '--shiki-token-string-expression': '#00E676',
    '--shiki-token-punctuation': '#CCFFCC',
    '--shiki-token-link': '#00FF41',
  },
} as const
