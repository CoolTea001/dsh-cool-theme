/**
 * Theme settings dictionaries (zh is the key-set source of truth; en mirrors
 * it completely). Preset names stay as proper nouns in both locales, so they
 * live in presets.ts, not here.
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  nav: '主题',
  'appearance.title': '外观',
  'appearance.desc': '深色 / 浅色 / 跟随系统',
  'presets.title': '预设主题',
  'presets.desc': '一键套用主流配色方案',
  'scheme.light': '浅色',
  'scheme.dark': '深色',
  'scheme.system': '跟随系统',
} satisfies Record<string, string>

/** The theme settings namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  nav: 'Theme',
  'appearance.title': 'Appearance',
  'appearance.desc': 'Dark / Light / System',
  'presets.title': 'Preset themes',
  'presets.desc': 'Apply popular color schemes in one click',
  'scheme.light': 'Light',
  'scheme.dark': 'Dark',
  'scheme.system': 'System',
} satisfies Record<ThemeKey, string>
