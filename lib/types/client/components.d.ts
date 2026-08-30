/**
 * Theme settings UI: scheme selector + preset picker.
 */
import * as React from 'react';
import { type PresetId } from './presets.js';
import { type ThemeKey } from './locales.js';
export declare function ThemePanel(props: {
    theme: any;
    getPreset: () => PresetId;
    setPreset: (id: PresetId) => void;
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