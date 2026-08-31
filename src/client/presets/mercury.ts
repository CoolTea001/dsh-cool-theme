import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

// Mercury: cool slate #F8FAFC -> #0F172A (slate-900)
const bluish = buildScale('--dsw-static-neutral-bluish', '#F8FAFC', '#0F172A', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#F8FAFC', '#0F172A', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#334155',
  blue: '#334155',
  green: '#047857',
  amber: '#B45309',
  red: '#BE123C',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#38BDF8',
  blue: '#38BDF8',
  green: '#34D399',
  amber: '#FBBF24',
  red: '#F43F5E',
})

export const mercury = {
  label: 'Mercury',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
    '--shiki-token-constant': '#334155',
    '--shiki-token-string': '#047857',
    '--shiki-token-comment': '#64748B',
    '--shiki-token-keyword': '#7C3AED',
    '--shiki-token-parameter': '#B45309',
    '--shiki-token-function': '#334155',
    '--shiki-token-string-expression': '#047857',
    '--shiki-token-punctuation': '#334155',
    '--shiki-token-link': '#0284C7',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
    '--shiki-token-constant': '#38BDF8',
    '--shiki-token-string': '#34D399',
    '--shiki-token-comment': '#64748B',
    '--shiki-token-keyword': '#A78BFA',
    '--shiki-token-parameter': '#FBBF24',
    '--shiki-token-function': '#38BDF8',
    '--shiki-token-string-expression': '#34D399',
    '--shiki-token-punctuation': '#E2E8F0',
    '--shiki-token-link': '#38BDF8',
  },
} as const
