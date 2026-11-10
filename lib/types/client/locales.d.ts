/**
 * Locale entry point for the theme settings panel.
 *
 * One file per language in `locales/`, this module only re-exports them and
 * derives the namespace key union from the Chinese source of truth.
 *
 * The ids are the shell's own (`zh`, `en`, `ja`, `es`, `fr`, `de`, `ru`, `pt`),
 * so a language picked in Settings reaches this panel without a mapping table.
 * `zh` and `en` are the locale service's required baselines; the rest are
 * optional ids, each still checked against this same key union.
 *
 * Preset names stay as proper nouns in every locale, so they live in
 * `presets.ts` rather than here.
 */
export { zh } from './locales/zh.js';
export { en } from './locales/en.js';
export { ja } from './locales/ja.js';
export { es } from './locales/es.js';
export { fr } from './locales/fr.js';
export { de } from './locales/de.js';
export { ru } from './locales/ru.js';
export { pt } from './locales/pt.js';
import { zh } from './locales/zh.js';
/** The theme settings namespace key union, derived from the Chinese dictionary. */
export type ThemeKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map