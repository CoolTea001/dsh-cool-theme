import { buildScale, BLUISH_STEPS, NEUTRAL_STEPS, buildSemanticScales } from './_helpers.js'

const bluish = buildScale('--dsw-static-neutral-bluish', '#FAFAFA', '#383A42', BLUISH_STEPS)
const neutral = buildScale('--dsw-static-neutral', '#FAFAFA', '#383A42', NEUTRAL_STEPS)

const lightSemantic = buildSemanticScales({
  deepseek: '#4078F2',
  blue: '#4078F2',
  green: '#50A14F',
  amber: '#C18401',
  red: '#E45649',
})

const darkSemantic = buildSemanticScales({
  deepseek: '#61AFEF',
  blue: '#61AFEF',
  green: '#98C379',
  amber: '#E5C07B',
  red: '#E06C75',
})

export const onedark = {
  label: 'One Dark',
  light: {
    ...bluish,
    ...neutral,
    ...lightSemantic,
      '--shiki-token-constant': '#0B7EA4',
      '--shiki-token-string': '#1F7A3A',
      '--shiki-token-comment': '#76808F',
      '--shiki-token-keyword': '#A626A4',
      '--shiki-token-parameter': '#986801',
      '--shiki-token-function': '#4078F2',
      '--shiki-token-string-expression': '#1F7A3A',
      '--shiki-token-punctuation': '#5C6370',
      '--shiki-token-link': '#4078F2',
  },
  dark: {
    ...bluish,
    ...neutral,
    ...darkSemantic,
      '--shiki-token-constant': '#56B6C2',
      '--shiki-token-string': '#98C379',
      '--shiki-token-comment': '#A0A6B0',
      '--shiki-token-keyword': '#C678DD',
      '--shiki-token-parameter': '#D19A66',
      '--shiki-token-function': '#61AFEF',
      '--shiki-token-string-expression': '#98C379',
      '--shiki-token-punctuation': '#ABB2BF',
      '--shiki-token-link': '#61AFEF',
  },
} as const
