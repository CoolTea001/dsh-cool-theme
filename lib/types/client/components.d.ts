/**
 * Theme settings UI: scheme selector, preset picker, and the custom colour editor.
 */
import * as React from 'react';
import { type ThemeBackground } from '../contract.js';
import { type PresetId } from './presets.js';
import { type ThemeKey } from './locales.js';
import { type ResolvedBackground } from './background.js';
import { type CustomTheme, type SavedTheme } from './custom.js';
/** Reserved menu value that switches to the user-defined theme. */
export declare const CUSTOM_SELECTION = "custom";
export type Selection = PresetId | typeof CUSTOM_SELECTION;
export type CustomState = {
    base: PresetId;
    theme: CustomTheme;
};
/** The slice of the shell's Theme service this panel reads and writes. */
type ThemeService = {
    getTheme?: () => {
        preference?: string;
    } | null;
    setTheme?: (preference: string) => void;
} | undefined;
export declare function ThemePanel(props: {
    theme: ThemeService;
    getSelection: () => Selection;
    setSelection: (s: Selection) => void;
    getCustom: () => CustomState;
    setCustom: (theme: CustomTheme) => void;
    /** Pick the preset future custom themes seed from, without applying it. */
    setCustomBase: (base: PresetId) => void;
    resetCustom: () => CustomTheme;
    /** Whether the sidebar keeps DSH's native translucency (darwin only). */
    getSidebarTransparent: () => boolean;
    setSidebarTransparent: (on: boolean) => void;
    /**
     * Paint the draft's wallpaper on the page while its card is open. `undefined`
     * restores the committed background of the active entry; `null` says the open
     * draft deliberately has none and the committed one must stay hidden.
     */
    onPreviewBackground: (background: ResolvedBackground | null | undefined) => void;
    saved: {
        /** Cached roster; empty until `refresh` resolves. */
        list: () => SavedTheme[];
        activeId: () => string | null;
        load: (id: string) => CustomTheme | null;
        /** Point the "in use" badge at an entry, or clear it entirely. */
        setActive: (id: string | null) => void;
        /** Re-read the roster from the Host, migrating the legacy browser list once. */
        refresh: () => Promise<SavedTheme[]>;
        /** Persist a new entry (with its pre-minted id) and make it active. */
        create: (id: string, name: string, background: ThemeBackground | null) => Promise<SavedTheme[]>;
        /** Write the current draft (and name) back to an existing entry. */
        update: (id: string, name: string, background: ThemeBackground | null) => Promise<SavedTheme[]>;
        remove: (id: string) => Promise<SavedTheme[]>;
    };
    t: (key: ThemeKey) => string;
    /**
     * The shell's own close seat, or null on a host that does not offer it. The
     * settings modal is shell-owned, so this is both the only way to leave after
     * a confirmed discard and the gate on whether guarding a close is worthwhile.
     */
    onRequestClose: (() => void) | null;
}): React.DetailedReactHTMLElement<{
    style: {
        display: "flex";
        flexDirection: "column";
        maxWidth: number;
        paddingBottom: number;
    };
}, HTMLElement>;
export {};
//# sourceMappingURL=components.d.ts.map