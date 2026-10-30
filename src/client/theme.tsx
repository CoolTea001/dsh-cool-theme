import * as React from 'react'
import {
  THEME_STORAGE_KEY,
  THEME_STORAGE_KEY_LEGACY,
  CUSTOM_THEME_STORAGE_KEY,
  CUSTOM_LIST_STORAGE_KEY,
  CUSTOM_ACTIVE_STORAGE_KEY,
  CUSTOM_MIGRATED_STORAGE_KEY,
  SIDEBAR_TRANSPARENT_STORAGE_KEY,
  themeAssetUrl,
  assetTypeOf,
  type ThemeAppearance,
  type ThemeBackground,
} from '../contract.js'
import { PRESETS, NOOP_PRESET_IDS, isBuiltinPresetId, type PresetId, type PresetDef } from './presets.js'
import { buildBaseCss, buildOverrides, buildFullCssFallback } from './tokens.js'
import { PANEL_CSS } from './css/panel.js'
import { createStyleInjector } from './style-injector.js'
import { ThemePanel, CUSTOM_SELECTION, type Selection, type CustomState } from './components.js'
import {
  type CustomTheme,
  type SavedTheme,
  buildCustomPreset,
  encodeCustom,
  decodeList,
  extractSeeds,
  normalizeCustom,
  parseEnvelope,
} from './custom.js'
import {
  BACKGROUND_CSS,
  backgroundHasMedia,
  createBackgroundLayer,
  type ResolvedBackground,
  type ResolvedBackgroundSide,
} from './background.js'
import { THEME_NAV_MARKUP } from './icons.js'
import {
  fetchThemeCss,
  fetchThemes,
  pushThemes,
  removeTheme as removeThemeFile,
  legacyThemesToAdopt,
} from './theme-files.js'
import { zh, en, type ThemeKey } from './locales.js'

function isValidSelection(v: string | null): v is Selection {
  return !!v && (v === CUSTOM_SELECTION || NOOP_PRESET_IDS.has(v as PresetId) || isBuiltinPresetId(v))
}

function presetDef(id: PresetId): PresetDef {
  return isBuiltinPresetId(id) ? PRESETS[id] : PRESETS.dsh
}

/**
 * The source last applied, plus the custom theme whose stylesheet belongs to
 * it. The id is explicit rather than derived from the active pointer: while a
 * brand-new draft is open, the pointer still names the previously active entry,
 * and a draft must not inherit that entry's CSS.
 */
type Applied = { src: Selection | PresetDef; cssId: string | null }

export function registerTheme(ctx: any) {
  const slots = ctx.get('slots')
  const theme = ctx.get('theme')
  if (!slots) return

  const NS = 'cool-theme'
  const locale = ctx.get('locale')
  let t: (key: ThemeKey) => string = (key) => zh[key]
  if (locale) {
    ctx.effect(() => locale.register(NS, { zh, en }), 'dsh-cool-theme: theme dictionaries')
    t = locale.bind(NS)
  }

  const injector = createStyleInjector()
  const pluginCssDisposer = injector.insert(`${PANEL_CSS}\n\n${BACKGROUND_CSS}`)
  const backgroundLayer = createBackgroundLayer()
  // The background the editor is previewing, which outranks the committed one
  // until the draft is saved or discarded. Kept here rather than in the panel so
  // a palette rebuild (a colour drag) keeps painting it. `previewActive` has to
  // be separate from the value: a draft with no background is a deliberate
  // "nothing" that must hide the active entry's committed wallpaper, not fall back
  // to it.
  let previewActive = false
  let previewBackground: ResolvedBackground | null = null
  /** The last source applied, so a preview change can rebuild the same one. */
  let lastApplied: Applied | null = null
  /** The custom preset currently painted, for its two surface colours. */
  let lastCustom: PresetDef | null = null
  let baselineDisposer: (() => void) | null = null
  let overrideDispose: (() => void) | null = null
  let fallbackDispose: (() => void) | null = null
  /**
   * The stylesheet layer currently on the page, and the file version it was
   * built from. The cache is keyed by theme id; `updatedAt` lets a focus reload
   * skip re-injecting an unchanged file.
   */
  let cssDisposer: (() => void) | null = null
  let cssApplied: { id: string; updatedAt: string } | null = null
  const cssCache = new Map<string, { text: string; updatedAt: string }>()
  let cssSeq = 0

  // Resolve the initial selection before any closure below can read `lastPreset`.
  const initialSelection = getSelection()
  /** The preset the custom editor seeds from; updated whenever a preset is applied. */
  let lastPreset: PresetId = initialSelection === CUSTOM_SELECTION ? 'dsh' : initialSelection
  if (initialSelection === CUSTOM_SELECTION) {
    const env = parseEnvelope(readRaw(CUSTOM_THEME_STORAGE_KEY))
    if (env && isBuiltinPresetId(env.base)) lastPreset = env.base
  }

  /** Run one disposer, swallowing what it throws: teardown must never cascade. */
  const release = (fn: (() => void) | null) => {
    if (!fn) return null
    try {
      fn()
    } catch {
      // Best effort: one failing disposer must not keep the others from running.
    }
    return null
  }

  function ensureBaseline(active: boolean) {
    if (active) {
      if (!baselineDisposer) baselineDisposer = injector.insert(buildBaseCss())
    } else if (baselineDisposer) {
      baselineDisposer = release(baselineDisposer)
    }
  }

  /** Raw localStorage access; an absent or blocked store reads as empty, writes are dropped. */
  function readRaw(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  function writeRaw(key: string, value: string | null) {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch {
      // A blocked or full store drops the write; the in-memory state still stands,
      // and the next load simply sees the previous value.
    }
  }

  // --- sidebar transparency ------------------------------------------------
  //
  // DSH's darwin shell paints the sidebar column translucently (a gradient over
  // a 50%-alpha fill) so the window's native `vibrancy: "sidebar"` shows
  // through. The switch turns that back on; off — the default — paints the
  // column with the same fill, fully opaque, so the native material stays on but
  // nothing transparent is left to reveal it. The selector matches the
  // CSS-module class by substring, because the hashed prefix
  // (`_6Qf49G_sidebarCol`) rotates between builds; `sidebarCollapsed` contains
  // the same substring, so it is excluded rather than painted opaque with the
  // column.
  // `:not(.ct-bg-on)` keeps this rule inert while a wallpaper is mounted, so a
  // custom theme's background always wins over the switch without needing to
  // out-specify this `!important` declaration.
  const SIDEBAR_OPAQUE_CSS =
    'html[data-platform="darwin"]:not(.ct-bg-on) [class*="sidebarCol"]:not([class*="sidebarCollapsed"]){background:var(--dsw-specific-sidebar-fill) !important;}'
  let sidebarOpaqueDisposer: (() => void) | null = null

  /**
   * Whether the sidebar keeps DSH's translucency. Only an explicit '1' turns it
   * on: an absent key means opaque, which is the state a fresh install starts in.
   */
  function sidebarTransparent(): boolean {
    return readRaw(SIDEBAR_TRANSPARENT_STORAGE_KEY) === '1'
  }

  /** Paint the sidebar column opaque (on), or hand it back to DSH (off). */
  function applySidebarOpaque(opaque: boolean) {
    if (opaque) {
      if (!sidebarOpaqueDisposer) sidebarOpaqueDisposer = injector.insert(SIDEBAR_OPAQUE_CSS)
    } else if (sidebarOpaqueDisposer) {
      sidebarOpaqueDisposer = release(sidebarOpaqueDisposer)
    }
  }

  function setSidebarTransparent(on: boolean) {
    writeRaw(SIDEBAR_TRANSPARENT_STORAGE_KEY, on ? '1' : '0')
    applySidebarOpaque(!on)
  }

  function getSelection(): Selection {
    for (const key of [THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY] as const) {
      const cur = readRaw(key)
      if (!isValidSelection(cur)) continue
      const normalized = cur === 'native' ? 'dsh' : cur
      // Migrate a legacy key, or the `native` alias, onto the current key.
      if (cur !== normalized || key === THEME_STORAGE_KEY_LEGACY) {
        writeRaw(THEME_STORAGE_KEY, normalized)
      }
      return normalized
    }
    return 'dsh'
  }

  /** The preset the custom seeds derive from, restored from the stored blob. */
  function customBase(): PresetId {
    const env = parseEnvelope(readRaw(CUSTOM_THEME_STORAGE_KEY))
    if (env && isBuiltinPresetId(env.base)) return env.base
    return lastPreset
  }

  function loadCustom(): CustomState {
    const base = customBase()
    const fallback = extractSeeds(presetDef(base))
    const env = parseEnvelope(readRaw(CUSTOM_THEME_STORAGE_KEY))
    return { base, theme: normalizeCustom(env?.theme, fallback) }
  }

  function persistCustom(theme: CustomTheme) {
    writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(customBase(), theme))
  }

  /**
   * Choose the preset a future custom theme seeds from, without touching the
   * colours currently on screen. The custom editor stays the live theme; the
   * preset is only the template the next "add" inherits.
   */
  function setCustomBase(base: PresetId) {
    lastPreset = base
    writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(base, loadCustom().theme))
  }

  /**
   * Install a palette. The override layer for our source is replaced in place
   * rather than torn down first: `theme.overrideTokens` restacks the same source
   * atomically, while disposing the old layer emits an extra `theme/change` with
   * our variables missing. The shell's presenter answers that by removing every
   * token from `body`, so the whole page falls back to the base palette and
   * repaints before the new layer lands — twice the DOM work and a visible
   * flash per change, which is exactly what a dragged colour slider produces.
   *
   * A custom theme that carries a background needs nothing extra here: the
   * canvas is cleared by `BACKGROUND_CSS` while the layer is mounted, and the
   * tokens themselves stay opaque so every overlay that has to occlude
   * scrolling content keeps working.
   */
  function apply(src: Selection | PresetDef, cssId: string | null = null) {
    lastApplied = { src, cssId }
    const isCustom = src === CUSTOM_SELECTION || typeof src !== 'string'
    const target: PresetId | PresetDef = src === CUSTOM_SELECTION ? buildCustomPreset(loadCustom().theme) : src
    // Presets never carry media; a background only exists on a custom theme.
    const bg = isCustom ? selectedBackground() : null
    lastCustom = isCustom && typeof target !== 'string' ? (target as PresetDef) : null

    if (typeof target === 'string' && NOOP_PRESET_IDS.has(target)) {
      // The base stylesheets are the theme again, so the layer has to go.
      overrideDispose = release(overrideDispose)
      fallbackDispose = release(fallbackDispose)
      ensureBaseline(false)
      backgroundLayer.render(null, null)
      applyCss(null)
      return
    }
    ensureBaseline(true)
    renderBackground(bg)
    const overrides = buildOverrides(target)
    if (theme?.overrideTokens) {
      try {
        overrideDispose = theme.overrideTokens('dsh-cool-theme', overrides)
        // The token layer owns the palette now; a previous CSS fallback is inert.
        fallbackDispose = release(fallbackDispose)
        applyCss(cssId)
        return
      } catch {
        // No token service to install into: fall through to the stylesheet
        // fallback below rather than leaving the palette unpainted.
      }
    }
    overrideDispose = release(overrideDispose)
    fallbackDispose = release(fallbackDispose)
    fallbackDispose = injector.insert(buildFullCssFallback(target))
    applyCss(cssId)
  }

  /**
   * Put the active custom theme's stylesheet on the page, or take it off.
   *
   * The text is cached per theme and re-read only when the panel asks or the
   * window regains focus, so dragging a colour never refetches it. A fetch that
   * lands after a switch is dropped by the generation check; a failed reload
   * keeps the layer already applied, while a file that disappeared is reported
   * as `css: null` and does remove it.
   */
  function applyCss(id: string | null) {
    if (id === null) {
      cssDisposer = release(cssDisposer)
      cssApplied = null
      return
    }
    const entry = readList().find((item) => item.id === id)
    if (!entry || !entry.cssEnabled) {
      cssDisposer = release(cssDisposer)
      cssApplied = null
      return
    }
    const cached = cssCache.get(id)
    // A cache hit avoids a refetch while the same theme is being repainted (a
    // colour drag). A switch to another theme re-reads the file instead, so an
    // edit made while that theme was inactive cannot come back stale.
    if (cached !== undefined && cssApplied?.id === id) {
      injectCss(id, cached)
      return
    }
    const seq = ++cssSeq
    void fetchThemeCss(id)
      .then((info) => {
        if (seq !== cssSeq || lastApplied?.cssId !== id) return
        if (info.css === null) {
          // Missing, or over the cap: there is nothing safe to inject. The
          // panel still offers to open and trim the file.
          cssDisposer = release(cssDisposer)
          cssApplied = null
          return
        }
        const next = { text: info.css, updatedAt: info.updatedAt ?? '' }
        cssCache.set(id, next)
        injectCss(id, next)
      })
      .catch(() => {
        // A transient read failure keeps whatever layer is already on screen.
      })
  }

  /** Inject one cached stylesheet, skipping a re-insert of the same version. */
  function injectCss(id: string, cached: { text: string; updatedAt: string }) {
    if (cssApplied?.id === id && cssApplied.updatedAt === cached.updatedAt) return
    cssDisposer = release(cssDisposer)
    if (cached.text.trim() !== '') cssDisposer = injector.insert(cached.text)
    cssApplied = { id, updatedAt: cached.updatedAt }
  }

  /** Drop the cached text and re-read it, for an external edit or the panel. */
  function reloadCss(id: string) {
    cssCache.delete(id)
    if (lastApplied?.cssId === id) applyCss(id)
  }

  /**
   * The background a custom theme actually carries: the committed one on the
   * active entry. The draft's colours may be unsaved, but its wallpaper is not
   * previewed through here — the panel sets `previewBackground` for that.
   *
   * Each appearance resolves on its own: a side that is switched off or carries
   * no media simply paints nothing, and only when neither side paints is the
   * whole background nothing at all. That is what lets every consumer stay
   * unaware of the per-side flags: no layer is mounted, so the canvas keeps its
   * own opaque surfaces and the sidebar switch works again, exactly as on a
   * theme that never had a wallpaper.
   */
  function resolveActiveBackground(): ResolvedBackground | null {
    const id = readActiveId()
    if (id === null) return null
    const entry = readList().find((item) => item.id === id)
    const background = entry?.background
    if (!background) return null
    const side = (appearance: ThemeAppearance): ResolvedBackgroundSide => {
      const half = background[appearance]
      if (!half.enabled || half.asset === '') return { url: null, kind: null, opacity: 0, blur: 0 }
      const type = assetTypeOf(half.asset)
      if (type === null) return { url: null, kind: null, opacity: 0, blur: 0 }
      return {
        url: themeAssetUrl(id, half.asset),
        kind: type.kind,
        opacity: half.opacity,
        blur: half.blur,
      }
    }
    const resolved: ResolvedBackground = { light: side('light'), dark: side('dark') }
    return backgroundHasMedia(resolved) ? resolved : null
  }

  /**
   * The background on screen: the open editor's preview when one is active,
   * else the active entry's committed one. An active preview with a null value
   * means "this draft deliberately has no wallpaper".
   */
  function selectedBackground(): ResolvedBackground | null {
    return previewActive ? previewBackground : resolveActiveBackground()
  }

  /**
   * Paint the layer with the current custom palette's own surface colours. The
   * image is composited over those colours, so the panel colour is what shows
   * through when the media opacity is lowered.
   */
  function renderBackground(bg: ResolvedBackground | null) {
    if (bg === null || lastCustom === null) {
      backgroundLayer.render(null, null)
      return
    }
    const light = lastCustom.light['--dsw-static-neutral-bluish-00'] ?? '#FFFFFF'
    const dark = lastCustom.dark['--dsw-static-neutral-bluish-950'] ?? '#151517'
    backgroundLayer.render(bg, { light, dark })
  }

  /**
   * Coalesce a burst of palette applications into one.
   *
   * A colour picker fires continuously while its slider is dragged. Each
   * application rebuilds both ramps, rewrites every token on
   * `body` and forces a style flush in the shell's presenter, so applying once
   * per event is what makes the colour editor stutter. The first change lands
   * immediately and the rest are throttled to one per interval, newest request
   * winning: the palette the pointer is released on is always the one applied.
   */
  const APPLY_INTERVAL_MS = 80
  let pendingApply: (() => void) | null = null
  let applyTimer: ReturnType<typeof setTimeout> | null = null
  let lastApplyAt = 0
  // Set by the fiber cleanup. A slot teardown can still reach `setCustom` after
  // it (the settings panel keeps its own unmount handler), and a palette applied
  // then would install a layer with nothing left to release it.
  let disposed = false

  /** Run the newest pending application now, if any. */
  function flushApply() {
    if (applyTimer !== null) {
      clearTimeout(applyTimer)
      applyTimer = null
    }
    const run = pendingApply
    pendingApply = null
    if (!run) return
    lastApplyAt = Date.now()
    run()
  }

  /** Drop a coalesced application, for a fiber that is going away. */
  function cancelApply() {
    if (applyTimer !== null) {
      clearTimeout(applyTimer)
      applyTimer = null
    }
    pendingApply = null
  }

  /**
   * Apply a palette, at most once per interval while a burst of edits is
   * running. The callback is deferred whole, so a dropped intermediate edit
   * never even rebuilds its ramps; only the newest one is executed.
   */
  function scheduleApply(run: () => void) {
    if (disposed) return
    pendingApply = run
    const elapsed = Date.now() - lastApplyAt
    if (elapsed >= APPLY_INTERVAL_MS) {
      flushApply()
      return
    }
    if (applyTimer === null) applyTimer = setTimeout(flushApply, APPLY_INTERVAL_MS - elapsed)
  }

  /**
   * Re-run the last selection. Used when something outside the palette changes
   * whether the canvas is transparent — a background preview, or the roster
   * arriving with the active theme's background.
   */
  function reapply() {
    if (lastApplied === null) return
    const { src, cssId } = lastApplied
    scheduleApply(() => apply(src, cssId))
  }

  /**
   * Preview a background while the editor is open, or clear the preview when it
   * closes. `undefined` means "no preview, show the committed background";
   * `null` means "the open draft has no background", which must hide the
   * committed one too. A change that only moves opacity or blur repaints
   * the layer alone; one that turns the layer on or off also has to add or
   * remove the transparent tokens, so that case goes through the coalesced
   * palette rebuild.
   */
  function setBackgroundPreview(next: ResolvedBackground | null | undefined) {
    const wasOn = previewActive && previewBackground !== null
    previewActive = next !== undefined
    previewBackground = next ?? null
    if (lastApplied === null) return
    const nowOn = previewActive && previewBackground !== null
    if (nowOn !== wasOn) {
      reapply()
      return
    }
    renderBackground(selectedBackground())
  }

  function setSelection(id: Selection) {
    writeRaw(THEME_STORAGE_KEY, id)
    if (id !== CUSTOM_SELECTION) lastPreset = id as PresetId
    // CUSTOM_SELECTION is resolved when it runs, so a burst ends on the newest
    // seeds in storage rather than a snapshot taken at schedule time. The CSS
    // id follows the selection: a preset has none, a custom selection uses the
    // active entry.
    const cssId = id === CUSTOM_SELECTION ? readActiveId() : null
    scheduleApply(() => apply(id, cssId))
  }

  function setCustom(next: CustomTheme, cssId: string | null = null) {
    // Persist synchronously: the roster reads the draft back from storage, so it
    // must never observe a coalesced edit. Only the visual application is lazy.
    persistCustom(next)
    scheduleApply(() => apply(buildCustomPreset(next), cssId))
  }

  function resetCustom(cssId: string | null = null): CustomTheme {
    const base = customBase()
    const theme = extractSeeds(presetDef(base))
    persistCustom(theme)
    scheduleApply(() => apply(buildCustomPreset(theme), cssId))
    return theme
  }

  // --- saved custom themes -------------------------------------------------

  const fallbackForBase = (base: string): CustomTheme =>
    extractSeeds(presetDef(isBuiltinPresetId(base) ? base : lastPreset))

  /**
   * The roster as the Host last reported it; `null` means it has not answered
   * yet. Files are the source of truth, so this is a read-through cache the
   * panel renders from, and every mutation is a round trip plus a refresh.
   */
  let themeCache: SavedTheme[] | null = null

  /** The legacy browser list, read only until the Host has answered. */
  const legacyList = () => decodeList(readRaw(CUSTOM_LIST_STORAGE_KEY), fallbackForBase)

  /** The roster to render and resolve ids against. */
  const readList = (): SavedTheme[] => themeCache ?? legacyList()

  function readActiveId(): string | null {
    const id = readRaw(CUSTOM_ACTIVE_STORAGE_KEY)
    return id && readList().some((e) => e.id === id) ? id : null
  }

  /**
   * Adopt the themes this browser saved before they lived in files. Runs once:
   * the marker keeps a stale browser copy from being migrated twice, and is only
   * set after a confirmed write, so a failed migration retries next load.
   */
  async function migrateLegacyThemes(hostThemes: SavedTheme[]): Promise<SavedTheme[]> {
    if (readRaw(CUSTOM_MIGRATED_STORAGE_KEY) !== null) return hostThemes
    const adopt = legacyThemesToAdopt(legacyList(), hostThemes)
    if (adopt.length > 0) {
      // Throws on failure, which leaves the marker unset and the browser copy in
      // place for the next load.
      await pushThemes(adopt, fallbackForBase)
    }
    writeRaw(CUSTOM_MIGRATED_STORAGE_KEY, new Date().toISOString())
    writeRaw(CUSTOM_LIST_STORAGE_KEY, null)
    // Re-read rather than merging locally: the Host owns ordering and stamps.
    return adopt.length > 0 ? fetchThemes(fallbackForBase) : hostThemes
  }

  /** Re-read the roster from the Host, migrating the legacy list on first load. */
  async function refreshSaved(): Promise<SavedTheme[]> {
    themeCache = await migrateLegacyThemes(await fetchThemes(fallbackForBase))
    // The initial custom selection resolved before the roster existed, so its
    // CSS id could not be known then. Now that the active id is, attach it to
    // the same applied source. A draft applies a `PresetDef`, not
    // `CUSTOM_SELECTION`, so this never gives a new draft the previous entry's
    // stylesheet.
    if (lastApplied !== null && lastApplied.src === CUSTOM_SELECTION && lastApplied.cssId === null) {
      const active = readActiveId()
      if (active !== null) lastApplied = { ...lastApplied, cssId: active }
    }
    // The active theme's background lives in this roster, so the first answer
    // can change what the canvas has to paint even though no palette moved.
    reapply()
    return themeCache
  }

  /** Load a saved entry into the draft and make it the active theme. */
  function loadSaved(id: string): CustomTheme | null {
    const entry = readList().find((e) => e.id === id)
    if (!entry) return null
    if (isBuiltinPresetId(entry.base)) lastPreset = entry.base
    writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id)
    writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(entry.base, entry.theme))
    scheduleApply(() => apply(buildCustomPreset(entry.theme), entry.id))
    return entry.theme
  }

  const saved = {
    /** The cached roster, or the legacy browser list until the Host answers. */
    list: readList,
    activeId: readActiveId,
    load: loadSaved,
    /** Point the "in use" badge at an entry, or clear it entirely. */
    setActive(id: string | null) {
      writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, id)
    },
    refresh: refreshSaved,
    /**
     * Persist the current draft as a named entry and make it active. The id is
     * the panel's because a background image or video is uploaded to the theme's own
     * directory, and that upload needs the id before the document is written.
     */
    async create(id: string, name: string, background: ThemeBackground | null): Promise<SavedTheme[]> {
      const draft = loadCustom()
      const entry: SavedTheme = {
        id,
        name,
        base: draft.base,
        theme: draft.theme,
        // Every theme starts with the stylesheet off; the panel's switch creates
        // and enables the file, so an unused theme never grows one by itself.
        cssEnabled: false,
        assets: [],
        background,
      }
      await pushThemes([entry], fallbackForBase)
      writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id)
      // The draft applied a `PresetDef` with no id; the new entry owns whatever
      // stylesheet is already in its directory.
      if (lastApplied !== null) lastApplied = { ...lastApplied, cssId: entry.id }
      return refreshSaved()
    },
    /** Write the current draft (and a new name) back to an existing entry. */
    async update(id: string, name: string, background: ThemeBackground | null): Promise<SavedTheme[]> {
      const entry = readList().find((e) => e.id === id)
      if (!entry) return readList()
      const draft = loadCustom()
      await pushThemes([{ ...entry, name, theme: draft.theme, background }], fallbackForBase)
      return refreshSaved()
    },
    async remove(id: string): Promise<SavedTheme[]> {
      if (readRaw(CUSTOM_ACTIVE_STORAGE_KEY) === id) writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, null)
      await removeThemeFile(id)
      // The deleted theme's stylesheet must not survive on the page or in the
      // cache; a remaining fallback entry re-attaches its own id through
      // `loadSaved` below.
      if (lastApplied?.cssId === id) lastApplied = { ...lastApplied, cssId: null }
      cssCache.delete(id)
      const next = await refreshSaved()
      // Deleting the active entry would otherwise leave no selection while the
      // list still has entries: fall back to the first one, which also swaps in
      // its theme so the removal takes effect on screen instead of leaving the
      // deleted theme applied.
      if (readActiveId() === null && next[0]) loadSaved(next[0].id)
      return next
    },
  }

  apply(initialSelection, initialSelection === CUSTOM_SELECTION ? readActiveId() : null)
  // Restore the sidebar switch before the panel is ever opened.
  applySidebarOpaque(!sidebarTransparent())
  // A background lives in the roster, not in localStorage, so a custom theme
  // that was active before a reload only gets its wallpaper once the files have
  // been read. Load them at startup rather than waiting for Settings to open;
  // the panel's own refresh then finds the cache warm.
  void refreshSaved().catch(() => {
    // The panel's own refresh retries; a failed startup load is not worth a toast.
  })

  // A stylesheet is a file the user may edit while the theme is active, so a
  // focus return re-reads the active theme's copy. The debounce coalesces the
  // burst of focus/visibility events a window switch can produce.
  let focusTimer: ReturnType<typeof setTimeout> | null = null
  function onWindowFocus() {
    if (focusTimer !== null) clearTimeout(focusTimer)
    focusTimer = setTimeout(() => {
      focusTimer = null
      const id = lastApplied?.cssId
      if (id) reloadCss(id)
    }, 150)
  }
  if (typeof window !== 'undefined') window.addEventListener('focus', onWindowFocus)

  ctx.effect(() => () => {
    // A coalesced application must not outlive the fiber: firing after this
    // cleanup would install a token layer nothing is left to release.
    disposed = true
    cancelApply()
    release(pluginCssDisposer)
    baselineDisposer = release(baselineDisposer)
    overrideDispose = release(overrideDispose)
    fallbackDispose = release(fallbackDispose)
    cssDisposer = release(cssDisposer)
    // Invalidate any stylesheet fetch still in flight, and forget cached text.
    cssSeq += 1
    cssCache.clear()
    if (focusTimer !== null) {
      clearTimeout(focusTimer)
      focusTimer = null
    }
    if (typeof window !== 'undefined') window.removeEventListener('focus', onWindowFocus)
    sidebarOpaqueDisposer = release(sidebarOpaqueDisposer)
    backgroundLayer.dispose()
    injector.disposeAll()
  })

  slots.inject('settings.section', () => {
    const options: any = { name: 'settings.section', id: 'cool-theme', order: 5, label: () => t('nav') }
    if (locale) options.locale = NS
    return slots.register(options, (props: any) =>
      React.createElement(ThemePanel, {
        t: props?.t ?? ((key: ThemeKey) => zh[key]),
        theme,
        getSelection,
        setSelection,
        getCustom: loadCustom,
        setCustom,
        setCustomBase,
        resetCustom,
        saved,
        getSidebarTransparent: sidebarTransparent,
        setSidebarTransparent,
        // Preview the draft's wallpaper on the page while its card is open.
        // Clearing it restores the committed background of the active entry.
        onPreviewBackground: setBackgroundPreview,
        // The shell's close seat. Absent on a host that does not offer it, which
        // also disables the unsaved-draft guard: without a way to leave, blocking
        // the close would strand the user.
        onRequestClose: typeof props?.close === 'function' ? props.close : null,
      }),
    )
  })

  // Fix nav icon: the settings panel draws a gear for an unknown section id. The
  // Theme section gets a palette from `assets/theme.svg` instead — as markup
  // rather than as a component, because the seat being rewritten is the shell's
  // own DOM (see THEME_NAV_MARKUP in icons.tsx).
  let paletteObs: MutationObserver | null = null
  function patchThemeNavIcon() {
    if (typeof document === 'undefined') return
    // Resolve current label in both locales — nav label is locale-sensitive
    let currentLabel = ''
    try {
      currentLabel = t('nav')
    } catch {
      // The dictionaries are ours, but a host that cannot bind them still gets
      // the two literal labels below.
    }
    const candidates = [currentLabel, zh.nav, en.nav].filter(Boolean) as string[]
    // Settings nav cells: the hashed class is zOa2rq_navCell, but match broadly
    // for forward-compat and fall back to any button inside the nav when the
    // hash rotates and the class selector no longer matches.
    const cells = document.querySelectorAll('[class*="navCell"], button[class*="navCell"]')
    const toPatch =
      cells.length > 0
        ? Array.from(cells)
        : Array.from(document.querySelectorAll('[class*="nav"] button'))
    for (const cell of toPatch) {
      const labelEl = cell.querySelector('[class*="navLabel"]') || cell
      const text = (labelEl?.textContent || cell.textContent || '').trim()
      const isThemeCell = candidates.some((lbl) => text === lbl || text.includes(lbl))
      if (!isThemeCell) continue
      // Already patched?
      if (cell.querySelector('[data-palette-icon]')) continue
      const svg = cell.querySelector('svg')
      if (!svg) continue
      // Hide gear and insert palette
      ;(svg as unknown as HTMLElement).style.display = 'none'
      svg.setAttribute('data-palette-hidden', '1')
      const holder = document.createElement('span')
      holder.setAttribute('data-palette-icon', '1')
      holder.style.display = 'inline-flex'
      holder.style.flex = 'none'
      holder.setAttribute('aria-hidden', 'true')
      holder.innerHTML = THEME_NAV_MARKUP
      svg.parentNode?.insertBefore(holder, svg.nextSibling)
    }
  }

  /**
   * Patch the nav, swallowing a failure. The nav is shell-owned DOM: a build
   * that moves or renames a cell must not break the observer, the settings
   * panel, or the plugin's whole apply step.
   */
  function safePatchThemeNavIcon() {
    try {
      patchThemeNavIcon()
    } catch {
      // Best effort: a shell that does not expose this seat is simply skipped.
    }
  }

  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    // Run once and observe future panel opens / locale switches.
    safePatchThemeNavIcon()
    try {
      paletteObs = new MutationObserver(safePatchThemeNavIcon)
      paletteObs.observe(document.body, { childList: true, subtree: true, characterData: true })
    } catch {
      // A document without a body cannot be observed; the one-off patch above
      // already ran, so the icon is still correct for this pass.
    }
    ctx.effect(() => () => {
      if (paletteObs) {
        const observer = paletteObs
        paletteObs = null
        release(() => observer.disconnect())
      }
      // Restore hidden gears on dispose
      if (typeof document !== 'undefined') {
        document.querySelectorAll('svg[data-palette-hidden="1"]').forEach((el) => {
          ;(el as unknown as HTMLElement).style.display = ''
          el.removeAttribute('data-palette-hidden')
        })
        document.querySelectorAll('[data-palette-icon]').forEach((el) => el.remove())
      }
    })
  }

  // Hide the built-in Appearance switch in General settings and unify on
  // dsh-cool-theme's Theme panel (light/dark/system + presets). Primary
  // mechanism is slot shadowing: a low-priority empty entry for the same id
  // wins the list cell and renders nothing, so the original AppearanceRow is
  // never projected. A lightweight CSS + MutationObserver fallback covers
  // hashed-class rotation and future template shifts.
  // The shell's own General section and the row inside it. The hashes rotate
  // between DSH builds, so only the stable parts are matched, and the selectors
  // live here rather than being spelled out again in each patch.
  const GENERAL_SECTION_SELECTOR = '.OVFIkW_section [data-slot="settings.general.item"]'
  /** Title text the built-in AppearanceRow renders, one entry per shipped locale. */
  const APPEARANCE_TITLES = ['外观', 'Appearance'] as const
  const HIDE_APPEARANCE_CSS = `${GENERAL_SECTION_SELECTOR} .D7wrZG_group{display:none !important;}`
  let hideCssDisposer: (() => void) | null = null
  let apObs: MutationObserver | null = null

  function isAppearanceNode(el: Element): boolean {
    // AppearanceRow is the only item that renders three theme cubes / the
    // appearance title.
    const text = el.textContent || ''
    const hasTitle = APPEARANCE_TITLES.some((title) => text.includes(title))
    const hasCubes =
      el.querySelector('[class*="themeCube"]') !== null ||
      el.querySelector('[class*="D7wrZG"]') !== null
    return hasTitle && hasCubes
  }

  function hideAppearanceInGeneral() {
    if (typeof document === 'undefined') return
    const container = document.querySelector(GENERAL_SECTION_SELECTOR)
    if (!container) return
    for (const child of Array.from(container.children)) {
      if (isAppearanceNode(child as Element)) {
        ;(child as HTMLElement).style.display = 'none'
      }
    }
  }

  slots.inject('settings.general.item', () => {
    try {
      hideCssDisposer = injector.insert(HIDE_APPEARANCE_CSS)
    } catch {
      // A failed insert only costs the CSS fallback; the shadow entry below is
      // what actually hides the built-in row.
    }
    // Slot shadowing: priority -1 outranks the built-in 0 and renders null
    let disposeShadow: (() => void) | null = null
    try {
      disposeShadow = slots.register(
        { name: 'settings.general.item', id: 'appearance', priority: -1 } as any,
        () => null,
      )
    } catch {
      // Best effort: a host without this slot simply shows its own row.
    }

    // Fallback observer: if shadowing is ignored (e.g. future DSH changes), hide by DOM inspection
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      hideAppearanceInGeneral()
      try {
        apObs = new MutationObserver(hideAppearanceInGeneral)
        const target = document.body
        apObs.observe(target, { childList: true, subtree: true })
      } catch {
        // A document without a body cannot be observed; the one-off hide above
        // already ran.
      }
    }

    return () => {
      disposeShadow = release(disposeShadow)
      hideCssDisposer = release(hideCssDisposer)
      if (apObs) {
        const observer = apObs
        apObs = null
        release(() => observer.disconnect())
      }
      // Restore any fallback-hidden nodes
      if (typeof document !== 'undefined') {
        const container = document.querySelector(GENERAL_SECTION_SELECTOR)
        if (container) {
          for (const child of Array.from(container.children)) {
            const el = child as HTMLElement
            if (el.style.display === 'none') el.style.display = ''
          }
        }
      }
    }
  })
}
