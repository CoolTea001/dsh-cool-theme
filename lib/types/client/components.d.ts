/**
 * Theme settings UI: scheme selector, preset picker, and the custom colour editor.
 */
import * as React from 'react';
import { type PresetId } from './presets.js';
import { type ThemeKey } from './locales.js';
import { type CustomTheme, type SavedTheme } from './custom.js';
/** Reserved menu value that switches to the user-defined theme. */
export declare const CUSTOM_SELECTION = "custom";
export type Selection = PresetId | typeof CUSTOM_SELECTION;
export type CustomState = {
    base: PresetId;
    theme: CustomTheme;
};
export declare function ThemePanel(props: {
    theme: any;
    getSelection: () => Selection;
    setSelection: (s: Selection) => void;
    getCustom: () => CustomState;
    setCustom: (theme: CustomTheme) => void;
    rebaseCustom: (base: PresetId) => CustomTheme;
    resetCustom: () => CustomTheme;
    saved: {
        list: () => SavedTheme[];
        activeId: () => string | null;
        save: () => SavedTheme[];
        load: (id: string) => CustomTheme | null;
        rename: (id: string, name: string) => SavedTheme[];
        duplicate: (id: string) => CustomTheme | null;
        remove: (id: string) => SavedTheme[];
    };
    t: (key: ThemeKey) => string;
}): React.DetailedReactHTMLElement<{
    style: {
        display: "flex";
        flexDirection: "column";
        maxWidth: number;
        paddingBottom: number;
    };
}, HTMLElement>;
//# sourceMappingURL=components.d.ts.map