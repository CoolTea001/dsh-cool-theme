/**
 * Host entry for dsh-cool-theme.
 * No host routes needed — theme is purely client-side (localStorage + overrideTokens).
 * Keep a minimal apply so the cordis patch has a mount point.
 */

export const name = 'dsh-cool-theme'

export const inject: string[] = []

export function apply(_ctx: any) {}
