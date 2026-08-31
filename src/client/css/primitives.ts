/**
 * Primitives layer: the ONLY place theme authors should edit to create a new theme.
 *
 * Architecture (user-selected strategy B):
 *   :root                                                → light values for --dsw-static-*
 *   html[data-ds-dark-theme], body[data-ds-dark-theme]   → dark values for the SAME --dsw-static-* keys
 *   semantic layer (semantic.ts)                         → single `var(--dsw-static-*)` mapping, no light/dark fork
 *
 * Changing a theme = providing a new light + dark map for these 85 variables.
 * Semantic aliases automatically follow. No other file needs to change.
 */

export type StaticMap = Record<string, string>

export const PRIMITIVES_LIGHT: StaticMap = {
  '--dsw-static-amber-100': 'rgb(254, 245, 231)',
  '--dsw-static-amber-400': 'rgb(247, 173, 49)',
  '--dsw-static-amber-500': 'rgb(245, 158, 11)',
  '--dsw-static-amber-600': 'rgb(221, 134, 41)',
  '--dsw-static-amber-900': 'rgb(39, 36, 31)',
  '--dsw-static-blue-100': 'rgb(219, 234, 254)',
  '--dsw-static-blue-300': 'rgb(147, 197, 253)',
  '--dsw-static-blue-400': 'rgb(96, 165, 250)',
  '--dsw-static-blue-450': 'rgb(77, 147, 248)',
  '--dsw-static-blue-500': 'rgb(59, 130, 246)',
  '--dsw-static-blue-50': 'rgb(239, 246, 255)',
  '--dsw-static-blue-50p': 'rgb(234, 243, 255)',
  '--dsw-static-blue-600': 'rgb(37, 99, 235)',
  '--dsw-static-blue-75': 'rgb(229, 240, 255)',
  '--dsw-static-blue-800': 'rgb(30, 64, 175)',
  '--dsw-static-blue-900': 'rgb(14, 48, 116)',
  '--dsw-static-blue-950': 'rgb(23, 37, 84)',
  '--dsw-static-deepseek-100': 'rgb(228, 237, 253)',
  '--dsw-static-deepseek-200': 'rgb(211, 226, 255)',
  '--dsw-static-deepseek-300': 'rgb(183, 200, 254)',
  '--dsw-static-deepseek-400': 'rgb(103, 158, 254)',
  '--dsw-static-deepseek-450': 'rgb(86, 134, 254)',
  '--dsw-static-deepseek-500': 'rgb(65, 118, 230)',
  '--dsw-static-deepseek-50': 'rgb(237, 243, 254)',
  '--dsw-static-deepseek-600': 'rgb(72, 104, 178)',
  '--dsw-static-deepseek-700-delete': 'rgb(47, 76, 143)',
  '--dsw-static-deepseek-800': 'rgb(52, 65, 91)',
  '--dsw-static-deepseek-900': 'rgb(40, 49, 66)',
  '--dsw-static-green-100': 'rgb(230, 250, 237)',
  '--dsw-static-green-400': 'rgb(78, 209, 126)',
  '--dsw-static-green-500': 'rgb(34, 197, 94)',
  '--dsw-static-green-900': 'rgb(35, 60, 44)',
  '--dsw-static-neutral-00': 'rgb(255, 255, 255)',
  '--dsw-static-neutral-1000': 'rgb(0, 0, 0)',
  '--dsw-static-neutral-100': 'rgb(245, 245, 245)',
  '--dsw-static-neutral-150': 'rgb(237, 237, 237)',
  '--dsw-static-neutral-200': 'rgb(229, 229, 229)',
  '--dsw-static-neutral-250': 'rgb(220, 220, 220)',
  '--dsw-static-neutral-300': 'rgb(212, 212, 212)',
  '--dsw-static-neutral-400': 'rgb(162, 164, 166)',
  '--dsw-static-neutral-500': 'rgb(127, 130, 135)',
  '--dsw-static-neutral-50': 'rgb(250, 250, 250)',
  '--dsw-static-neutral-550': 'rgb(101, 103, 107)',
  '--dsw-static-neutral-600': 'rgb(84, 85, 87)',
  '--dsw-static-neutral-700': 'rgb(60, 60, 61)',
  '--dsw-static-neutral-800': 'rgb(41, 41, 41)',
  '--dsw-static-neutral-850': 'rgb(33, 33, 35)',
  '--dsw-static-neutral-900': 'rgb(15, 15, 15)',
  '--dsw-static-neutral-bluish-00': 'rgb(255, 255, 255)',
  '--dsw-static-neutral-bluish-1000': 'rgb(15, 17, 21)',
  '--dsw-static-neutral-bluish-100': 'rgb(235, 238, 242)',
  '--dsw-static-neutral-bluish-150': 'rgb(233, 236, 242)',
  '--dsw-static-neutral-bluish-200': 'rgb(225, 229, 238)',
  '--dsw-static-neutral-bluish-300': 'rgb(207, 211, 214)',
  '--dsw-static-neutral-bluish-400': 'rgb(173, 178, 184)',
  '--dsw-static-neutral-bluish-500': 'rgb(151, 157, 166)',
  '--dsw-static-neutral-bluish-50': 'rgb(249, 250, 251)',
  '--dsw-static-neutral-bluish-600': 'rgb(129, 133, 140)',
  '--dsw-static-neutral-bluish-60': 'rgb(245, 246, 247)',
  '--dsw-static-neutral-bluish-700': 'rgb(97, 102, 107)',
  '--dsw-static-neutral-bluish-750': 'rgb(67, 69, 74)',
  '--dsw-static-neutral-bluish-75': 'rgb(241, 243, 245)',
  '--dsw-static-neutral-bluish-800': 'rgb(53, 54, 56)',
  '--dsw-static-neutral-bluish-850': 'rgb(44, 44, 46)',
  '--dsw-static-neutral-bluish-875': 'rgb(35, 35, 36)',
  '--dsw-static-neutral-bluish-900': 'rgb(27, 27, 28)',
  '--dsw-static-neutral-bluish-950': 'rgb(21, 21, 23)',
  '--dsw-static-red-100': 'rgb(254, 226, 226)',
  '--dsw-static-red-400': 'rgb(242, 90, 90)',
  '--dsw-static-red-500': 'rgb(239, 68, 68)',
  '--dsw-static-red-50': 'rgb(254, 242, 242)',
  '--dsw-static-red-600': 'rgb(236, 19, 19)',
  '--dsw-static-red-900': 'rgb(87, 12, 12)',
}

// Dark differs from light only in the neutral scales (inverted for dark mode);
// every other token (amber/blue/deepseek/green/red) stays identical.
export const PRIMITIVES_DARK: StaticMap = {
  ...PRIMITIVES_LIGHT,
  '--dsw-static-neutral-00': 'rgb(21, 21, 23)',
  '--dsw-static-neutral-1000': 'rgb(255, 255, 255)',
  '--dsw-static-neutral-100': 'rgb(27, 27, 28)',
  '--dsw-static-neutral-150': 'rgb(35, 35, 36)',
  '--dsw-static-neutral-200': 'rgb(44, 44, 46)',
  '--dsw-static-neutral-250': 'rgb(53, 54, 56)',
  '--dsw-static-neutral-300': 'rgb(67, 69, 74)',
  '--dsw-static-neutral-400': 'rgb(97, 102, 107)',
  '--dsw-static-neutral-500': 'rgb(129, 133, 140)',
  '--dsw-static-neutral-50': 'rgb(33, 33, 35)',
  '--dsw-static-neutral-550': 'rgb(151, 157, 166)',
  '--dsw-static-neutral-600': 'rgb(173, 178, 184)',
  '--dsw-static-neutral-700': 'rgb(207, 211, 214)',
  '--dsw-static-neutral-800': 'rgb(225, 229, 238)',
  '--dsw-static-neutral-850': 'rgb(235, 238, 242)',
  '--dsw-static-neutral-900': 'rgb(241, 243, 245)',
  '--dsw-static-neutral-bluish-00': 'rgb(21, 21, 23)',
  '--dsw-static-neutral-bluish-1000': 'rgb(255, 255, 255)',
  '--dsw-static-neutral-bluish-100': 'rgb(53, 54, 56)',
  '--dsw-static-neutral-bluish-150': 'rgb(67, 69, 74)',
  '--dsw-static-neutral-bluish-200': 'rgb(97, 102, 107)',
  '--dsw-static-neutral-bluish-300': 'rgb(129, 133, 140)',
  '--dsw-static-neutral-bluish-400': 'rgb(151, 157, 166)',
  '--dsw-static-neutral-bluish-50': 'rgb(27, 27, 28)',
  '--dsw-static-neutral-bluish-500': 'rgb(173, 178, 184)',
  '--dsw-static-neutral-bluish-600': 'rgb(207, 211, 214)',
  '--dsw-static-neutral-bluish-60': 'rgb(35, 35, 36)',
  '--dsw-static-neutral-bluish-700': 'rgb(225, 229, 238)',
  '--dsw-static-neutral-bluish-750': 'rgb(233, 236, 242)',
  '--dsw-static-neutral-bluish-75': 'rgb(44, 44, 46)',
  '--dsw-static-neutral-bluish-800': 'rgb(235, 238, 242)',
  '--dsw-static-neutral-bluish-850': 'rgb(241, 243, 245)',
  '--dsw-static-neutral-bluish-875': 'rgb(245, 246, 247)',
  '--dsw-static-neutral-bluish-900': 'rgb(249, 250, 251)',
  '--dsw-static-neutral-bluish-950': 'rgb(255, 255, 255)',
}

export function buildPrimitivesCss(light: StaticMap = PRIMITIVES_LIGHT, dark: StaticMap = PRIMITIVES_DARK): string {
  const toBlock = (selector: string, map: StaticMap) =>
    `${selector} {\n${Object.entries(map)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`
  return `${toBlock(':root', light)}\n\n${toBlock('html[data-ds-dark-theme], body[data-ds-dark-theme]', dark)}`
}

export function primitiveOverrides(light: StaticMap, dark: StaticMap): Record<string, { light: string; dark: string }> {
  const out: Record<string, { light: string; dark: string }> = {}
  const keys = new Set([...Object.keys(light), ...Object.keys(dark)])
  for (const k of keys) out[k] = { light: light[k] ?? dark[k], dark: dark[k] ?? light[k] }
  return out
}
