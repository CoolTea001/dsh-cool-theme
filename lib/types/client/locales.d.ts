/**
 * Theme settings dictionaries (zh is the key-set source of truth; en mirrors
 * it completely). Preset names stay as proper nouns in both locales, so they
 * live in presets.ts, not here.
 */
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    nav: string;
    'appearance.title': string;
    'appearance.desc': string;
    'presets.title': string;
    'presets.desc': string;
    'scheme.light': string;
    'scheme.dark': string;
    'scheme.system': string;
};
/** The theme settings namespace key union. */
export type ThemeKey = keyof typeof zh;
/** English dictionary, checked complete against the zh key set. */
export declare const en: {
    nav: string;
    'appearance.title': string;
    'appearance.desc': string;
    'presets.title': string;
    'presets.desc': string;
    'scheme.light': string;
    'scheme.dark': string;
    'scheme.system': string;
};
//# sourceMappingURL=locales.d.ts.map