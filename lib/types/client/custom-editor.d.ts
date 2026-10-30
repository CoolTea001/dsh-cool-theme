/**
 * Presentational pieces of the custom-theme editor.
 *
 * `ThemePanel` owns every piece of state (the draft, the picker, the roster);
 * these components only draw what they are handed and report gestures back
 * through props. Keeping them stateless is what makes this a move rather than a
 * rewrite: the state flow in the panel is unchanged, and every expression below
 * is the one that used to sit inline in `components.tsx`.
 */
import * as React from 'react';
import { type ThemeAssetKind, type ThemeBackgroundSide, type ThemeCssInfo } from '../contract.js';
import type { ThemeKey } from './locales.js';
/**
 * One editable colour. The dot edits whichever appearance the mode toggle is
 * on; the tooltip carries the seed's plain-language description.
 */
export type SeedDot = {
    key: string;
    name: string;
    hint: string;
    /** The opaque colour: what the swatch paints and the hex field shows. */
    value: string;
    /** A value typed into the hex field; always an opaque colour. */
    onChange: (v: string) => void;
    /**
     * The opacity channel, for the one seed that has one (the border). Its
     * presence swaps the opaque picker for the alpha-aware one, which is the same
     * saturation panel and hue slider with an opacity slider under them: `value`
     * seeds that slider and `onPicked` receives the picker's own colour-plus-
     * opacity value, so one gesture over either the panel or either slider writes
     * both channels in one update.
     */
    alpha?: {
        value: number;
        onPicked: (v: string) => void;
    };
    /** Swatch paint; defaults to a flat fill of `value`. */
    swatch?: React.CSSProperties;
};
/** A group row: its name on the left, every seed's dot on the right. */
export declare function SeedDotRow(props: {
    rowKey: string;
    label: string;
    dots: SeedDot[];
    /** The seed whose popover is open, for `aria-expanded`. */
    expandedKey: string | null;
    onToggle: (key: string, anchor: HTMLElement, height: number) => void;
}): React.DetailedReactHTMLElement<{
    className: string;
    key: string;
}, HTMLElement>;
/**
 * The react-colorful popover for the seed whose dot is open, pinned to its
 * swatch. It is a DOM child of the editor card (`position:fixed`, so the card's
 * box does not clip or place it) — the dirty-draft guard passes clicks inside
 * `[data-ct-editor]`, and every picker interaction is exactly such a click.
 *
 * The picker is the panel/hue/opacity stack the library lays out itself, with
 * the hex field under it. The border seed swaps in the alpha-aware picker, which
 * is the same stack with one more slider and one more 24px of height
 * (`ct-color-pop-alpha`), so both popovers keep the same panel size.
 */
export declare function ColorPopover(props: {
    dot: SeedDot;
    position: {
        left: number;
        top: number;
    };
    popRef: React.RefObject<HTMLDivElement>;
}): React.DetailedReactHTMLElement<{
    key: string;
    className: string;
    ref: React.RefObject<HTMLDivElement>;
    style: {
        left: number;
        top: number;
    };
}, HTMLDivElement>;
/** One slider row: name, track, value. */
export declare function BackgroundRangeRow(props: {
    rowKey: string;
    label: string;
    value: number;
    max: number;
    suffix: string;
    ariaLabel: string;
    onChange: (next: number) => void;
}): React.DetailedReactHTMLElement<{
    className: string;
    key: string;
}, HTMLElement>;
/**
 * The wallpaper section of the open editor: the side on show, its commands, its
 * thumbnail and its two sliders. A preset has no document of its own to carry
 * one, and the panel only shows this card inside custom mode.
 */
export declare function BackgroundSection(props: {
    t: (key: ThemeKey) => string;
    /** The appearance the editor's toggle is on, for the sliders' accessible names. */
    modeName: string;
    side: ThemeBackgroundSide | null;
    previewUrl: string | null;
    previewKind: ThemeAssetKind | null;
    /** A stored asset or a picked file: what the switch can turn on. */
    hasMedia: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    onPick: () => void;
    onRemove: () => void;
    onToggleEnabled: (on: boolean) => void;
    onOpacity: (value: number) => void;
    onBlur: (value: number) => void;
    onFilePicked: (event: React.ChangeEvent<HTMLInputElement>) => void;
}): React.DetailedReactHTMLElement<{
    className: string;
}, HTMLElement>;
/**
 * The starter stylesheet written when the user opens a theme that has none.
 *
 * It is comment-only, so creating the file cannot change the interface, and it
 * names the three things a first rule usually needs: when the sheet applies,
 * the dark-appearance marker, and how to override a token. The theme name is
 * user data and may arrive from a shared archive, so a closing comment marker
 * in it must not end the comment early.
 */
export declare function cssTemplate(t: (key: ThemeKey) => string, name: string, id: string): string;
/**
 * The stylesheet row of the open editor: its title, the on/off switch, and the
 * action that opens the file once the switch is on. It is stateless; the panel
 * owns the fetch, the busy state and the toast.
 *
 * The switch is the primary control: off by default, it creates the file when
 * turned on, and turning it off hides the open action while keeping the file.
 * The action is "Open stylesheet" on a loopback page, where the Host can
 * launch a native editor, and "Copy path" elsewhere.
 */
export declare function CssSection(props: {
    t: (key: ThemeKey) => string;
    /** Metadata of the open entry's file; null while loading or after a failure. */
    info: ThemeCssInfo | null;
    error: 'unavailable' | 'failed' | null;
    busy: boolean;
    /** True while the card is composing a brand-new, unsaved theme. */
    newTheme: boolean;
    onOpen: () => void;
    onCopyPath: () => void;
    onToggle: (on: boolean) => void;
}): React.DetailedReactHTMLElement<{
    className: string;
}, HTMLElement>;
//# sourceMappingURL=custom-editor.d.ts.map