/**
 * Custom theme: a `PresetDef` generated at runtime from a small set of seeds.
 *
 * The colour maths is deliberately IDENTICAL to the shipped presets — the same
 * `buildScale` / `buildSemanticScales` helpers with the same steps and weights,
 * and the same `t = step / 1000` interpolation. A custom theme is therefore not
 * a special case: it produces a complete 73-primitive + 9-shiki map that flows
 * through `resolvePreset` -> `primitiveOverrides` unchanged.
 *
 * Seed groups (6):
 *   neutral  merged `--dsw-static-neutral-bluish-*` + `--dsw-static-neutral-*`
 *   accent   merged `--dsw-static-deepseek-*` + `--dsw-static-blue-*`
 *   green / amber / red
 *   shiki    9 syntax tokens
 */
import type { PresetDef } from './presets.js';
export type { PresetDef };
export type Mode = 'light' | 'dark';
/** One seed colour per appearance. */
export type SeedPair = {
    light: string;
    dark: string;
};
/** The nine `--shiki-token-*` slots, in stylesheet order. */
export declare const SHIKI_KEYS: readonly ["constant", "string", "comment", "keyword", "parameter", "function", "string-expression", "punctuation", "link"];
export type ShikiKey = (typeof SHIKI_KEYS)[number];
/** Everything a user can edit. 2 + 4*2 + 9*2 = 28 colours. */
export type CustomTheme = {
    /**
     * Endpoints of the ONE neutral ramp shared by both appearances, matching how
     * presets call `buildScale`. They are the ramp's lightest and darkest values,
     * not the light/dark background colours themselves: DSH reads step 00 for the
     * light `bg-base` and step 950 for the dark one.
     */
    neutralLightest: string;
    neutralDarkest: string;
    /** `--dsw-static-deepseek-*` and `--dsw-static-blue-*` share this base. */
    accent: SeedPair;
    green: SeedPair;
    amber: SeedPair;
    red: SeedPair;
    shiki: Record<ShikiKey, SeedPair>;
};
/**
 * Parse a colour into `#RRGGBB`, or null when it is not a format we understand.
 *
 * Accepted: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb()`/`rgba()` with
 * numbers or percentages, and `hsl()`/`hsla()`. Alpha is parsed but dropped —
 * every token these seeds drive is an opaque theme colour.
 *
 * `primitives.ts` stores `rgb(r, g, b)` while presets store hex, so both shapes
 * have to work; the extra forms are there for what users may type.
 */
export declare function tryToHex(input: unknown): string | null;
/** `tryToHex` with a black fallback, for call sites that need a guaranteed value. */
export declare function toHex(input: unknown): string;
/**
 * Recover the seed inputs from an already-generated preset.
 *
 * Exact by construction: `buildScale` writes the `start`/`end` arguments to
 * steps 00/1000, and `buildTintShadeScale` writes the base to step 500. This is
 * what lets a user start from any preset without re-declaring its palette.
 */
export declare function extractSeeds(base: PresetDef): CustomTheme;
/** Bump when the `CustomTheme` shape changes so old blobs can be migrated. */
export declare const CUSTOM_SCHEMA_VERSION = 1;
/** Self-contained stored form: records the preset the seeds were derived from. */
export type CustomEnvelope = {
    v: number;
    base: string;
    theme: unknown;
};
export declare function encodeCustom(base: string, theme: CustomTheme): string;
/** Parse a stored blob. Returns null for absent/corrupt/foreign-version data. */
export declare function parseEnvelope(raw: string | null): CustomEnvelope | null;
/** Repair a partially-invalid object against `fallback`, keeping every valid colour. */ export declare function normalizeCustom(raw: unknown, fallback: CustomTheme): CustomTheme;
/**
 * Turn seeds into a full `PresetDef` using the presets' own helpers.
 *
 * The neutral ramp is built once and shared by both appearances, exactly as
 * 30 of the 34 shipped presets do.
 */
export declare function buildCustomPreset(v: CustomTheme): PresetDef;
/** A named custom theme the user saved. */
export type SavedTheme = {
    id: string;
    name: string;
    /** Preset the seeds derive from; used for the "reset" fallback. */
    base: string;
    theme: CustomTheme;
};
/** Collision-resistant enough for a local list, and stable across reloads. */
export declare function newThemeId(): string;
export declare function encodeList(list: SavedTheme[]): string;
/**
 * Parse the saved list. Entries with a corrupt theme are repaired against
 * `fallbackFor(base)` rather than dropped, so one bad record cannot lose the
 * rest of the list; only structurally unusable entries are skipped.
 */
export declare function decodeList(raw: string | null, fallbackFor: (base: string) => CustomTheme): SavedTheme[];
/** `${base} 1`, `${base} 2`, … skipping names already taken. */
export declare function nextThemeName(base: string, taken: string[]): string;
//# sourceMappingURL=custom.d.ts.map