/**
 * Shared contract for dsh-cool-theme.
 */

// Current key; legacy key kept for one-time migration from dsh-cooltea.
// Holds either a preset id or the reserved custom-theme id.
export const THEME_STORAGE_KEY = 'cool-theme-preset'
export const THEME_STORAGE_KEY_LEGACY = 'cooltea-theme-preset'

// Reserved value of THEME_STORAGE_KEY selecting the user-defined theme.
export const CUSTOM_PRESET_ID = 'custom'

// JSON blob holding the custom theme seeds and the preset they derive from.
// This is the working draft the editor always edits; it stays live even before
// the draft is saved as a named entry.
export const CUSTOM_THEME_STORAGE_KEY = 'cool-theme-custom'

// JSON array of named, saved custom themes (the list below the editor).
export const CUSTOM_LIST_STORAGE_KEY = 'cool-theme-custom-list'

// Id of the saved entry the draft currently belongs to; absent when the draft
// has never been saved.
export const CUSTOM_ACTIVE_STORAGE_KEY = 'cool-theme-custom-active'
