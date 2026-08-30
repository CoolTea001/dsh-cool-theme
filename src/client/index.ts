/**
 * Client entry for dsh-cool-theme.
 */

import { registerTheme } from './theme.js'

export const name = 'dsh-cool-theme/client'

export const inject = ['slots', 'theme', 'locale']

export function apply(ctx: any) {
  registerTheme(ctx)
}
