import type { StaticMap } from './css/primitives.js';
import { type BuiltinPresetId } from '../presets-ids.js';
/** A fully resolved theme: one primitive map per appearance. */
export type PresetDef = {
    label: string;
    light: StaticMap;
    dark: StaticMap;
};
/**
 * Every shipped preset, one entry per {@link PRESET_IDS} name. The mapped type
 * makes the two lists agree at compile time: a preset without a colour map, or a
 * name with no entry here, is a type error rather than a theme that goes missing
 * from the picker (or from an import's validation).
 */
export declare const PRESETS: Record<BuiltinPresetId, PresetDef>;
/** `native` is a legacy storage alias for `dsh` — both mean "system default, no overrides". */
export type PresetId = keyof typeof PRESETS | 'native';
/**
 * Presets that override nothing: the shell keeps its own colours. The single
 * source of this set, so the token layer and the panel cannot drift on it.
 */
export declare const NOOP_PRESET_IDS: ReadonlySet<PresetId>;
export declare const presetOptions: {
    value: PresetId;
    label: string;
}[];
//# sourceMappingURL=presets.d.ts.map