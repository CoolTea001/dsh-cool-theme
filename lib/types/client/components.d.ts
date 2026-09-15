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
    /** Pick the preset future custom themes seed from, without applying it. */
    setCustomBase: (base: PresetId) => void;
    resetCustom: () => CustomTheme;
    saved: {
        /** Cached roster; empty until `refresh` resolves. */
        list: () => SavedTheme[];
        activeId: () => string | null;
        load: (id: string) => CustomTheme | null;
        /** Point the "in use" badge at an entry, or clear it entirely. */
        setActive: (id: string | null) => void;
        /** Re-read the roster from the Host, migrating the legacy browser list once. */
        refresh: () => Promise<SavedTheme[]>;
        /** Persist the current draft as a new named entry and make it active. */
        create: (name: string) => Promise<SavedTheme[]>;
        /** Write the current draft (and name) back to an existing entry. */
        update: (id: string, name: string) => Promise<SavedTheme[]>;
        remove: (id: string) => Promise<SavedTheme[]>;
    };
    /**
     * The shell's own Toast, or null when the host does not share its primitives
     * module with plugins. Read at render time: the async resolution lands long
     * before the first action a banner can report.
     */
    getHostToast: () => ((props: any) => any) | null;
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