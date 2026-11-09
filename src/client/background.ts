/**
 * The wallpaper layer behind the app: one image or video per appearance.
 *
 * The theme's own surface colour is painted by this layer, not by the shell's
 * tokens: the media sits *on top of* that colour at its own opacity, so lowering
 * the opacity reveals the panel colour — the panel never becomes transparent to
 * reveal the wallpaper.
 *
 * One fixed layer spans the whole window, so the sidebar and the main canvas
 * always share the same wallpaper and the same alignment. Since the two
 * appearances carry independent media, the canvases are cleared only while the
 * appearance on screen has a wallpaper of its own: the other side paints
 * nothing, and emptying the shell's surfaces for it would only replace their
 * own paint with the layer's flat colour. Only the two canvas surfaces are
 * cleared (`BACKGROUND_CSS`): the shell's background tokens stay
 * opaque, because the composer's fade, sticky code-block banners and table
 * headers paint themselves with those same tokens to occlude what scrolls under
 * them. Making the tokens transparent is what let scrolled text show through
 * the composer.
 *
 * The composer still has to hide the messages that scroll under it, but painting
 * the panel colour there would cut a solid band out of the wallpaper. Instead
 * the seat re-paints the same wallpaper — the same image, `background-attachment:
 * fixed`, with the panel colour laid on top at `1 - opacity` — so the band is
 * pixel-identical to the layer below and only the fade at its top edge shows
 * that anything is being covered. Content cards keep their own opaque surfaces
 * on top of the layer.
 *
 * A video cannot be painted by a CSS background, so the composer's copy is a
 * real element: a wrapper inserted into the shell's `[data-composer-seat]`, with
 * a `position: fixed` video that the wrapper's `overflow: hidden` clips to the
 * seat's box. The wrapper lives inside the seat's stacking context, which is
 * what lets it cover the transcript exactly like the image copy does.
 */

import {
  THEME_APPEARANCES,
  THEME_IMAGE_MAX_BYTES,
  THEME_VIDEO_MAX_BYTES,
  assetTypeOf,
  clampBackgroundBlur,
  clampBackgroundOpacity,
  type ThemeAppearance,
  type ThemeAssetKind,
} from '../contract.js'

/** What the input accepts and what the Host will store. */
export const BACKGROUND_ACCEPT =
  'image/png,image/jpeg,image/webp,image/avif,image/gif,video/mp4,video/webm'

/** Longest edge a re-encoded wallpaper image keeps; pixels past it are never painted. */
const BACKGROUND_MAX_EDGE_PX = 3840

/** A file at or below this size is uploaded untouched, keeping quality and animation. */
const BACKGROUND_KEEP_ORIGINAL_BYTES = 1.5 * 1024 * 1024

/** Encoder qualities tried in order until the re-encoded image fits the upload cap. */
const BACKGROUND_ENCODE_QUALITIES = [0.85, 0.7, 0.55] as const

/** One appearance's wallpaper as the renderer needs it: a URL and its kind, or none. */
export type ResolvedBackgroundSide = {
  /** null when this appearance paints no media of its own. */
  url: string | null
  /** How to paint the URL; null exactly when `url` is null. */
  kind: ThemeAssetKind | null
  /** Opacity 0–100, and blur in px, for this appearance's own media. */
  opacity: number
  blur: number
}

/**
 * The wallpaper pair the layer paints. The two appearances are independent
 * files, so this is a side each rather than one URL with two sets of numbers.
 */
export type ResolvedBackground = Record<ThemeAppearance, ResolvedBackgroundSide>

/** Whether either appearance has media; a pair with none is not worth mounting. */
export function backgroundHasMedia(background: ResolvedBackground): boolean {
  return background.light.url !== null || background.dark.url !== null
}

/**
 * Whether one appearance actually paints. A URL without a kind is not paint:
 * `render` skips it, so every other reader has to skip it too.
 */
function sidePaints(side: ResolvedBackgroundSide): boolean {
  return side.url !== null && side.kind !== null
}

/** The two surface colours the media is composited over, per appearance. */
export type BackgroundSurfaceColors = { light: string; dark: string }

/**
 * The layer's own stylesheet. Opacity and blur are custom properties so a
 * slider can move them without rebuilding the theme's token layer: the shell
 * never sees a `theme/change` while the user drags. Media URL, opacity and blur
 * all have one property per appearance, so each side is fully independent.
 */
export const BACKGROUND_CSS = [
  '.ct-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-color:var(--ct-bg-light,#fff);}',
  'html[data-ds-dark-theme] .ct-bg,body[data-ds-dark-theme] .ct-bg{background-color:var(--ct-bg-dark,#151517);}',
  // One wrapper per appearance carries that side's opacity and blur, so an
  // image and a video are tuned by the same two sliders. Only one side is
  // painted at a time; the other is hidden outright below.
  '.ct-bg-side{position:absolute;inset:0;opacity:var(--ct-bg-opacity-light,0);filter:blur(var(--ct-bg-blur-light,0px));}',
  'html[data-ds-dark-theme] .ct-bg-side,body[data-ds-dark-theme] .ct-bg-side{opacity:var(--ct-bg-opacity-dark,0);filter:blur(var(--ct-bg-blur-dark,0px));}',
  // Each wrapper carries its own appearance's media, and the opacity variable
  // is the *active* appearance's, so both wrappers would paint the same image
  // if both were left visible. Hide the one whose appearance is not on screen;
  // the properties above then only ever drive the visible side.
  'html:not([data-ds-dark-theme]) body:not([data-ds-dark-theme]) .ct-bg-side[data-appearance="dark"]{display:none;}',
  'html[data-ds-dark-theme] .ct-bg-side[data-appearance="light"],body[data-ds-dark-theme] .ct-bg-side[data-appearance="light"]{display:none;}',
  // The image is still a CSS background: it keeps `cover` positioning and
  // costs nothing to update while a slider moves.
  '.ct-bg-image{position:absolute;inset:0;background-image:var(--ct-bg-image-light,none);background-position:center;background-repeat:no-repeat;background-size:cover;}',
  'html[data-ds-dark-theme] .ct-bg-image,body[data-ds-dark-theme] .ct-bg-image{background-image:var(--ct-bg-image-dark,none);}',
  // A video is an element painted over the same box. `object-fit: cover` is the
  // element equivalent of `background-size: cover`, and `center` matches the
  // image's `background-position`.
  '.ct-bg-video{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center;background:transparent;}',
  '.ct-bg-side[data-kind="image"] .ct-bg-video{display:none;}',
  '.ct-bg-side[data-kind="video"] .ct-bg-image{background-image:none;}',
  '.ct-bg-side[data-kind="none"]{display:none;}',
  // The canvas surfaces that clear for the layer. They are matched by class
  // substring because the hashed prefix (`_6Qf49G_centerCol`) rotates between
  // builds; the conversation root has a stable `data-phase` attribute instead.
  // `centerCol` and `sidebarCol` are the only layout classes carrying these
  // names, and the desktop frame patch is limited to non-darwin, where macOS
  // already leaves the frame transparent.
  //
  // `ct-bg-on` means "the appearance on screen has a wallpaper", not merely
  // "a wallpaper is mounted": the two sides are independent files, so one of
  // them can be empty. Clearing the shell's surfaces for a side that paints
  // nothing would replace their own paint with the layer's flat colour, and on
  // macOS it would also hide the vibrancy the sidebar switch exposes. The class
  // therefore follows the appearance, as {@link syncCanvas} keeps it in step.
  'html.ct-bg-on [data-phase]{background:transparent !important;}',
  'html.ct-bg-on [class*="centerCol"]{background:transparent !important;}',
  // The layer's own flat surface colour is the base the media is composited
  // over, so it is only ever meant to show through a cleared canvas. With the
  // gate off the layer stays mounted (the other appearance still needs it) but
  // paints nothing — including this colour, which would otherwise sit opaque
  // behind the shell and hide the macOS vibrancy the sidebar switch exposes.
  // The dark variant is named explicitly: it ties with the base rule above on
  // specificity, so the outcome would otherwise depend on this list's order.
  'html:not(.ct-bg-on) .ct-bg,html:not(.ct-bg-on) body[data-ds-dark-theme] .ct-bg{background-color:transparent;}',
  // The sidebar column and its own root both paint with the sidebar fill, so
  // the token is cleared on the column and inherited by everything under it.
  'html.ct-bg-on body [class*="sidebarCol"]{--dsw-specific-sidebar-fill:transparent;background:transparent !important;}',
  // The desktop drawer's own opaque frame, which the sidebar setting would
  // otherwise keep painting over the layer on Windows and Linux. It is the root
  // slot occupant, so it is a CHILD of the renderer's `[data-slot="root"]`
  // anchor (`display: contents`), not of `#root` itself — matching `#root >`
  // never hit and the frame stayed opaque on Windows, hiding the whole layer.
  // macOS is unaffected: its shell already paints the frame with `background:
  // 0 0` for vibrancy, so the wallpaper shows there either way.
  'html:not([data-platform="darwin"]).ct-bg-on [data-slot="root"] > [class*="frame"]{background:transparent !important;}',
  // The Windows titlebar strip the same frame draws in front of that background.
  // The native window-controls overlay usually covers it, and in fullscreen it
  // would otherwise cut a solid band out of the wallpaper.
  'html:not([data-platform="darwin"]).ct-bg-on [data-slot="root"] > [class*="frame"]::before{background:transparent !important;}',
  // The native window-controls overlay the frame sits under. DSH's Windows
  // preload appends a hidden probe to `body`, measures `--dsw-specific-sidebar-
  // fill` from it and hands that colour to the main process, which paints the
  // caption's button rectangle with it. The frame's strip is cleared above, but
  // the rectangle stays opaque over the wallpaper and reads as a sidebar-
  // coloured band behind the three buttons — the most visible seam in dark mode,
  // where the fill and the image diverge. Clear the probe's own fill, so the
  // overlay goes transparent and the layer shows through the buttons like it
  // does the rest of the strip. Ungated on purpose: the preload re-measures only
  // on head/body mutations, while mounting the layer flips a class it does not
  // watch, so a gated rule could sit unmeasured until something else touched the
  // DOM. Transparency is also the right paint without a layer — the shell's own
  // strip fills that band with the same sidebar colour. The probe is the only
  // `body`-level span whose inline style names this fill.
  'html[data-windows-titlebar] body > span[style*="--dsw-specific-sidebar-fill"]{background-color:transparent !important;}',
  // Windows desktop draws no panel edge at all: its sidebar's right border is
  // cancelled for the rounded content card and the centre column never had
  // one, so the wallpaper makes the tabbed panel fuse into the image. Outline
  // the column itself — the same `border-l3` hairline macOS already gives its
  // centre column, plus the top edge the Windows caption strip leaves above
  // it. The shell's 16px top-left radius joins the two hairlines, so the panel
  // reads as one rounded card; the header keeps its own bottom rule inside it.
  // The left hairline is skipped while the sidebar is collapsed: no column
  // edge is left to separate, the same call the macOS rule makes. The top one
  // stays, because that edge is under the caption strip either way.
  'html[data-windows-titlebar].ct-bg-on [data-slot="root"] > [class*="frame"] > [class*="centerCol"]{border-top:.5px solid var(--dsw-alias-border-l3);}',
  'html[data-windows-titlebar].ct-bg-on [data-slot="root"] > [class*="frame"]:not([data-sidebar-collapsed]) > [class*="centerCol"]{border-left:.5px solid var(--dsw-alias-border-l3);}',
  // The status row does not overlay the transcript, so it can clear too.
  'html.ct-bg-on [class*="bottomRow"]{background:transparent !important;}',
  // The right sidebar is a dock: its column and the tab host inside it both
  // paint `bg-base`, which is why the panel stayed solid. Clearing that token
  // inside the column reveals the wallpaper behind it; the panel's cards and
  // entries keep their layer-1 surfaces.
  'html.ct-bg-on [data-rightbar-col]{--dsw-alias-bg-base:transparent;}',
  // The trajectory view (`data-conversation-composer-overlay` is its own hook,
  // and the only element that carries it) paints its whole canvas with layer-1.
  // Clearing that token inside it keeps the wallpaper visible under the table,
  // while the layer-2 timeline strip and the sticky table header keep theirs.
  'html.ct-bg-on [data-conversation-composer-overlay]{--dsw-alias-bg-layer-1:transparent;}',
  // The composer overlays the transcript: keep its seat transparent and let a
  // pseudo-element repaint the very same wallpaper over it. `background-
  // attachment: fixed` anchors both layers to the viewport, which is exactly
  // where `.ct-bg` painted them, so the copy lines up to the pixel. The panel
  // colour sits on top at `1 - media opacity`; compositing that over the media
  // reproduces `.ct-bg`'s `colour + media at opacity` exactly. The top 36px is
  // masked, matching the fade the shell itself used to draw. A video side has
  // no image here — the injected copy below takes over. `isolation` is not
  // cosmetic: the copy is a negative-z-index layer that has to sit behind the
  // composer's own content but above the transcript. Without a stacking context
  // on the seat, that negative layer falls into the page's and the transcript
  // paints over it.
  //
  // `will-change` is reset for the same reason the copy can work at all: DSH
  // gives the active seat `will-change: transform` for its sticky scroll, and
  // that declaration silently turns the seat into the containing block for
  // everything fixed inside it. Both copies below are fixed on purpose — the
  // pseudo-element's `background-attachment: fixed` and the video's `position:
  // fixed` — so under that containment they stop tracking the viewport and are
  // laid out against the seat's own 128px box instead: the wallpaper is
  // re-scaled and re-centred inside the band, and the video is squeezed into
  // it. The seam at the band's top edge is that rescale showing. Resetting the
  // property costs only the compositor hint; the copies then anchor to the
  // viewport again, which is where `.ct-bg` painted them.
  'html.ct-bg-on [class*="centerCol"] [data-phase="active"] [data-composer-seat]{background:transparent !important;isolation:isolate;will-change:auto !important;}',
  'html.ct-bg-on [class*="centerCol"] [data-phase="active"] [data-composer-seat]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(var(--ct-bg-wash,transparent),var(--ct-bg-wash,transparent)),var(--ct-bg-image,none);background-size:auto,cover;background-position:center,center;background-repeat:no-repeat;background-attachment:fixed,fixed;filter:blur(var(--ct-bg-blur,0px));-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 36px);mask-image:linear-gradient(180deg,transparent 0,#000 36px);}',
  // The plugin manager's page bar does the same job for its own page: it is a
  // sticky band whose `::before` paints the whole `bg-base` rectangle so the
  // scrolling list is occluded behind the title, the actions and the tab strip.
  // Clearing it would let the list scroll through the heading, so it gets the
  // same treatment as the composer band — repaint the wallpaper instead of the
  // flat colour. The bar is matched by `data-plugin-bar`, which is a stable
  // public hook: its class hash rotates, and so do the `--plugin-*` variables.
  // `data-natural` only gates the sticky behaviour, not the paint, so the copy
  // is not limited to it; a measuring clone carries neither attribute.
  //
  // The copy is a plain background, not a nested fixed element, so it does not
  // need the containing-block care the composer's video copy does: the bar sets
  // `container-type`, and confinement was measured not to affect a fixed
  // background there — the grid stayed on the same phase as the layer above,
  // `275, 367, 459…` in both. No mask: the shell's band has a hard top edge,
  // and the bar clips its own head with `clip-path` as it collapses.
  'html.ct-bg-on [data-plugin-bar]::before{background-image:linear-gradient(var(--ct-bg-wash,transparent),var(--ct-bg-wash,transparent)),var(--ct-bg-image,none) !important;background-size:auto,cover !important;background-position:center,center !important;background-repeat:no-repeat !important;background-attachment:fixed,fixed !important;filter:blur(var(--ct-bg-blur,0px));}',
  // The video copy of that same band. The wrapper is a real child of the seat
  // (see `ensureComposer`) and the mask fades its top edge. It exists only while
  // the active side is a video; an image keeps using the pseudo-element above.
  //
  // `clip-path` rather than `overflow: hidden` is what clips the copy, because
  // the seat no longer establishes a containing block for it: `overflow` only
  // clips descendants whose containing block is the clipping box, and a fixed
  // child is now contained by the viewport instead, so it would escape the
  // wrapper and cover the whole window. `clip-path` clips by geometry, so it
  // holds either way — which also keeps this wrapper honest if a future shell
  // reintroduces a containing block on the seat.
  '.ct-bg-composer{position:absolute;inset:0;z-index:-1;pointer-events:none;display:none;clip-path:inset(0);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 36px);mask-image:linear-gradient(180deg,transparent 0,#000 36px);}',
  '.ct-bg-composer[data-kind="video"]{display:block;}',
  '.ct-bg-composer-video{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:blur(var(--ct-bg-blur,0px));}',
  '.ct-bg-composer-wash{position:absolute;inset:0;background:var(--ct-bg-wash,transparent);}',
  // The plugin page bar's video copy, built by the same helper and clipped the
  // same way. Its height follows the painted band rather than the bar's own
  // box: the bar keeps the tag strip's full height while the paint shrinks to
  // the compact header, so `inset: 0` would repaint wallpaper over the list.
  // Prepended, and at z-index 0, so it paints above the `::before` that would
  // otherwise draw the wash twice but below the head, which is later in tree
  // order and carries the title and tabs.
  '.ct-bg-pagebar{position:absolute;left:0;right:0;top:0;height:var(--plugin-header-paint-height,var(--plugin-header-rest-height,100%));z-index:0;pointer-events:none;display:none;clip-path:inset(0);}',
  '.ct-bg-pagebar[data-kind="video"]{display:block;}',
  '.ct-bg-pagebar-video{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:blur(var(--ct-bg-blur,0px));}',
  '.ct-bg-pagebar-wash{position:absolute;inset:0;background:var(--ct-bg-wash,transparent);}',
  // The video copy carries the wash itself, so the band's own `::before` has to
  // stop painting it: two washes over one frame is `1-(1-a)^2` opaque instead of
  // `a`, which washes the wallpaper out. A video side aliases `--ct-bg-image` to
  // `none`, so clearing the whole background costs nothing else.
  'html.ct-bg-on [data-plugin-bar][data-ct-copy="video"]::before{background:none !important;}',
  // The wash is the panel colour at the alpha the media leaves free, and the
  // composer copy blurs by the same radius as the layer below; media, wash and
  // blur all have to follow the appearance, exactly like the layer's own
  // opacity does. One alias per property keeps the composer rules free of a
  // second light/dark pair. A side with no media aliases to `none` and to the
  // panel colour, so the copy is a plain band of the layer's own background
  // rather than a hole that lets the transcript show through.
  'html{--ct-bg-image:var(--ct-bg-image-light,none);--ct-bg-wash:var(--ct-bg-wash-light,transparent);--ct-bg-blur:var(--ct-bg-blur-light,0px);}',
  'html[data-ds-dark-theme],body[data-ds-dark-theme]{--ct-bg-image:var(--ct-bg-image-dark,none);--ct-bg-wash:var(--ct-bg-wash-dark,transparent);--ct-bg-blur:var(--ct-bg-blur-dark,0px);}',
].join('\n')

/** The layer's custom properties, all set on `<html>` so the composer can read them. */
const BACKGROUND_VARIABLES = [
  '--ct-bg-light',
  '--ct-bg-dark',
  '--ct-bg-image-light',
  '--ct-bg-image-dark',
  '--ct-bg-opacity-light',
  '--ct-bg-opacity-dark',
  '--ct-bg-blur-light',
  '--ct-bg-blur-dark',
  '--ct-bg-wash-light',
  '--ct-bg-wash-dark',
] as const

/**
 * The panel colour at the alpha the media does not cover. Laid over the media it
 * reproduces the layer's own `colour + media at opacity` composite.
 */
function surfaceWash(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${String(100 - clampBackgroundOpacity(opacity))}%, transparent)`
}

/** Quote a URL for a CSS `url()` token. */
function cssUrl(url: string): string {
  return `url("${url.replace(/[\\"]/g, '\\$&')}")`
}

/** Whether the shell is wearing its dark appearance right now. */
function isDarkAppearance(): boolean {
  if (typeof document === 'undefined') return false
  if (document.documentElement.hasAttribute('data-ds-dark-theme')) return true
  return document.body?.hasAttribute('data-ds-dark-theme') === true
}

/** A background `<video>`: muted, looping and inline, which is what autoplays. */
function createVideo(): HTMLVideoElement {
  const video = document.createElement('video')
  // Chromium only autoplays a muted video without a user gesture. Setting the
  // property is not enough in every embedding context, so the attribute is
  // written too.
  video.muted = true
  video.defaultMuted = true
  video.setAttribute('muted', '')
  video.loop = true
  video.autoplay = true
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.preload = 'auto'
  video.disablePictureInPicture = true
  video.tabIndex = -1
  video.setAttribute('aria-hidden', 'true')
  return video
}

/** Point one video at `url`, reloading only when the source actually changes. */
function setVideoSource(video: HTMLVideoElement, url: string): void {
  if (video.dataset.src !== url) {
    video.dataset.src = url
    // Assigning `src` is what starts the load; a second `load()` would refetch.
    video.src = url
  }
  // A wrapper React discarded and this layer re-appended comes back paused, so
  // the play attempt is not limited to source changes. Rejection is expected
  // while the element is detached or undecoded; the next render tries again.
  if (video.paused) void video.play().catch(() => {})
}

/** Release a video's source, so an inactive appearance does not keep decoding. */
function clearVideoSource(video: HTMLVideoElement): void {
  if (video.dataset.src === undefined) return
  delete video.dataset.src
  video.pause()
  video.removeAttribute('src')
  video.load()
}

export function createBackgroundLayer() {
  let layer: HTMLDivElement | null = null
  let sides: Record<ThemeAppearance, HTMLDivElement> | null = null
  let videos: Record<ThemeAppearance, HTMLVideoElement> | null = null
  /** The video copy painted inside the shell's composer seat. */
  let composer: HTMLDivElement | null = null
  let composerVideo: HTMLVideoElement | null = null
  /** The same, inside the plugin manager's sticky page bar. */
  let pageBar: HTMLDivElement | null = null
  let pageBarVideo: HTMLVideoElement | null = null
  /** Re-attaches the composer copy if React removes it; bound to a video side. */
  let composerTimer: ReturnType<typeof setInterval> | null = null
  /** Follows the shell's appearance attribute so the right side's video plays. */
  let appearanceObserver: MutationObserver | null = null
  /** The background currently rendered, as `syncVideoSources` reads it. */
  let current: ResolvedBackground | null = null

  function ensure(): void {
    if (typeof document === 'undefined' || !document.body) return
    if (layer !== null && document.body.contains(layer)) return
    layer = document.createElement('div')
    layer.className = 'ct-bg'
    layer.setAttribute('aria-hidden', 'true')
    const nextSides = {} as Record<ThemeAppearance, HTMLDivElement>
    const nextVideos = {} as Record<ThemeAppearance, HTMLVideoElement>
    for (const appearance of THEME_APPEARANCES) {
      const side = document.createElement('div')
      side.className = 'ct-bg-side'
      side.dataset.appearance = appearance
      side.dataset.kind = 'none'
      const image = document.createElement('div')
      image.className = 'ct-bg-image'
      const video = createVideo()
      video.className = 'ct-bg-video'
      side.append(image, video)
      layer.append(side)
      nextSides[appearance] = side
      nextVideos[appearance] = video
    }
    sides = nextSides
    videos = nextVideos
    // Prepended, and at z-index -1: the layer sits above the document canvas
    // but below every in-flow column, so no class hash is involved.
    document.body.prepend(layer)
    observeAppearance()
  }

  /**
   * Follow `data-ds-dark-theme`, which decides both which side's video decodes
   * and whether the canvases clear at all.
   */
  function observeAppearance(): void {
    if (typeof MutationObserver === 'undefined') return
    appearanceObserver?.disconnect()
    appearanceObserver = new MutationObserver(() => {
      syncVideoSources()
      syncCanvas()
    })
    appearanceObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-ds-dark-theme'],
      subtree: true,
    })
  }

  /** Whether the appearance on screen paints a wallpaper of its own. */
  function activeHasMedia(): boolean {
    if (current === null) return false
    return sidePaints(current[isDarkAppearance() ? 'dark' : 'light'])
  }

  /**
   * Clear the shell's canvases exactly while the appearance on screen has a
   * wallpaper, and hand them back the moment it does not.
   *
   * The pair's two sides are independent files, so "a wallpaper is mounted" is
   * not the same question as "this appearance paints one". Clearing for an empty
   * side would replace the shell's own paint — the sidebar fill, the base
   * surface — with the layer's flat colour, which shows up as a seam between the
   * sidebar and the canvas where their two tokens differ, and on macOS it hides
   * the vibrancy the sidebar switch exposes. `ct-bg-on` is therefore driven by
   * the active side, on every render and on every appearance change.
   */
  function syncCanvas(): void {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('ct-bg-on', activeHasMedia())
  }

  /**
   * Insert the composer's video copy into the shell's seat. The wrapper is the
   * only DOM this plugin adds outside its own layer; it is appended rather than
   * replacing anything, and `syncComposer` re-attaches it if React discards it.
   */
  function ensureComposer(): HTMLDivElement | null {
    if (typeof document === 'undefined') return null
    const seat = document.querySelector(
      '[class*="centerCol"] [data-phase="active"] [data-composer-seat]',
    )
    if (!seat) return null
    if (composer !== null && composerVideo !== null) {
      if (composer.parentElement !== seat) seat.append(composer)
      return composer
    }
    const wrapper = document.createElement('div')
    wrapper.className = 'ct-bg-composer'
    wrapper.dataset.kind = 'none'
    wrapper.setAttribute('aria-hidden', 'true')
    const video = createVideo()
    video.className = 'ct-bg-composer-video'
    const wash = document.createElement('div')
    wash.className = 'ct-bg-composer-wash'
    wrapper.append(video, wash)
    seat.append(wrapper)
    composer = wrapper
    composerVideo = video
    return wrapper
  }

  function ensurePageBar(): HTMLDivElement | null {
    if (typeof document === 'undefined') return null
    const bar = document.querySelector('[data-plugin-bar]')
    if (!(bar instanceof HTMLElement)) return null
    if (pageBar !== null && pageBarVideo !== null) {
      if (pageBar.parentElement !== bar) bar.prepend(pageBar)
      return pageBar
    }
    const wrapper = document.createElement('div')
    wrapper.className = 'ct-bg-pagebar'
    wrapper.dataset.kind = 'none'
    wrapper.setAttribute('aria-hidden', 'true')
    const video = createVideo()
    video.className = 'ct-bg-pagebar-video'
    const wash = document.createElement('div')
    wash.className = 'ct-bg-pagebar-wash'
    wrapper.append(video, wash)
    bar.prepend(wrapper)
    pageBar = wrapper
    pageBarVideo = video
    return wrapper
  }

  /** Keep the composer copy attached while the active side is a video. */
  function startComposerTimer(): void {
    if (composerTimer !== null) return
    composerTimer = setInterval(() => {
      if (current === null) return
      const side = current[isDarkAppearance() ? 'dark' : 'light']
      if (side.kind !== 'video' || side.url === null) {
        stopComposer()
        return
      }
      // Both copies are retried independently: they belong to different pages,
      // so at most one of them has a host element at a time, and neither may
      // block the other.
      const wrapper = ensureComposer()
      if (wrapper !== null) {
        wrapper.dataset.kind = 'video'
        if (composerVideo !== null) setVideoSource(composerVideo, side.url)
      }
      const bar = ensurePageBar()
      if (bar !== null) {
        bar.dataset.kind = 'video'
        if (pageBarVideo !== null) setVideoSource(pageBarVideo, side.url)
        // Marking is part of showing the copy, not a separate step: reaching
        // this page after the initial render is the common path, and without
        // the mark the bar's own `::before` would paint the wash a second time.
        markPageBarCopy(true)
      }
      if (wrapper === null && bar === null) stopComposer()
    }, 1000)
  }

  function stopComposer(): void {
    if (composerTimer !== null) {
      clearInterval(composerTimer)
      composerTimer = null
    }
    if (composerVideo !== null) clearVideoSource(composerVideo)
    if (composer !== null) composer.dataset.kind = 'none'
    if (pageBarVideo !== null) clearVideoSource(pageBarVideo)
    if (pageBar !== null) pageBar.dataset.kind = 'none'
    // With no copy painting the band, its own `::before` is the only painter
    // again, so the wash it applies must come back.
    markPageBarCopy(false)
  }

  /**
   * Point the visible side's video at its URL and release the other side's.
   * A CSS background costs nothing to leave set, but a decoded video does.
   */
  function syncVideoSources(): void {
    if (videos === null || current === null) return
    const active = isDarkAppearance() ? 'dark' : 'light'
    for (const appearance of THEME_APPEARANCES) {
      const side = current[appearance]
      const video = videos[appearance]
      if (appearance === active && side.kind === 'video' && side.url !== null) {
        setVideoSource(video, side.url)
      } else {
        clearVideoSource(video)
      }
    }
    syncComposer(active)
  }

  /** Show, hide or point the composer's video copy at the active side. */
  function syncComposer(active: ThemeAppearance): void {
    const side = current?.[active]
    if (side === undefined || side.kind !== 'video' || side.url === null) {
      stopComposer()
      markPageBarCopy(false)
      return
    }
    startComposerTimer()
    // The page bar may be mounted while the seat is not (its page has no
    // composer), so each copy is driven on its own.
    const bar = ensurePageBar()
    if (bar !== null && pageBarVideo !== null) {
      bar.dataset.kind = 'video'
      setVideoSource(pageBarVideo, side.url)
    }
    markPageBarCopy(true)
    const wrapper = ensureComposer()
    if (wrapper === null || composerVideo === null) return
    wrapper.dataset.kind = 'video'
    setVideoSource(composerVideo, side.url)
  }

  /**
   * Tell the page bar's own `::before` whether a video copy is painting it, so
   * the wash is applied once. The attribute lives on the shell's element, not on
   * this plugin's, because the rule that reads it targets that element.
   */
  function markPageBarCopy(copying: boolean): void {
    if (typeof document === 'undefined') return
    const bar = document.querySelector('[data-plugin-bar]')
    if (!(bar instanceof HTMLElement)) return
    if (copying) bar.dataset.ctCopy = 'video'
    else delete bar.dataset.ctCopy
  }

  function unmount(): void {
    stopComposer()
    appearanceObserver?.disconnect()
    appearanceObserver = null
    composer?.remove()
    composer = null
    composerVideo = null
    pageBar?.remove()
    pageBar = null
    pageBarVideo = null
    markPageBarCopy(false)
    layer?.remove()
    layer = null
    sides = null
    videos = null
    current = null
    if (typeof document === 'undefined') return
    document.documentElement.classList.remove('ct-bg-on')
    for (const name of BACKGROUND_VARIABLES) document.documentElement.style.removeProperty(name)
  }

  /**
   * Paint one background, or take the layer away. `colors` are the theme's own
   * surface colours; without them there is no colour to reveal, so the layer is
   * not shown. A pair with no media on either side is the same as no background.
   */
  function render(bg: ResolvedBackground | null, colors: BackgroundSurfaceColors | null): void {
    if (bg === null || colors === null || !backgroundHasMedia(bg)) {
      unmount()
      return
    }
    ensure()
    if (layer === null || sides === null || videos === null) return
    current = bg
    // The shell's canvases clear per appearance, not per mount: only the side on
    // screen is ever painted, so only that side may leave a hole for it.
    syncCanvas()
    // On `<html>` rather than on the layer: the composer's copy of the
    // wallpaper lives outside this element and reads the same properties.
    const style = document.documentElement.style
    style.setProperty('--ct-bg-light', colors.light)
    style.setProperty('--ct-bg-dark', colors.dark)
    for (const appearance of THEME_APPEARANCES) {
      const side = bg[appearance]
      // The same predicate `activeHasMedia` clears the canvases by, so a side
      // can never leave a hole it does not paint into.
      const kind: ThemeAssetKind | 'none' = sidePaints(side) && side.kind !== null ? side.kind : 'none'
      sides[appearance].dataset.kind = kind
      if (kind === 'none') {
        // No media on this side: nothing paints in the layer. The composer
        // copy is still the panel colour rather than transparent, because the
        // layer behind it is exactly that colour and the transcript must stay
        // hidden even when the active side has no wallpaper.
        style.setProperty(`--ct-bg-image-${appearance}`, 'none')
        style.setProperty(`--ct-bg-opacity-${appearance}`, '0')
        style.setProperty(`--ct-bg-blur-${appearance}`, '0px')
        style.setProperty(`--ct-bg-wash-${appearance}`, colors[appearance])
        continue
      }
      const opacity = clampBackgroundOpacity(side.opacity)
      style.setProperty(
        `--ct-bg-image-${appearance}`,
        kind === 'image' && side.url !== null ? cssUrl(side.url) : 'none',
      )
      style.setProperty(`--ct-bg-opacity-${appearance}`, String(opacity / 100))
      style.setProperty(`--ct-bg-blur-${appearance}`, `${String(clampBackgroundBlur(side.blur))}px`)
      style.setProperty(`--ct-bg-wash-${appearance}`, surfaceWash(colors[appearance], opacity))
    }
    syncVideoSources()
  }

  return { render, unmount, dispose: unmount }
}

export type BackgroundLayer = ReturnType<typeof createBackgroundLayer>

/** The kind of media a picked file carries, or null when the Host would refuse it. */
export function backgroundKindOf(file: File): ThemeAssetKind | null {
  // The extension is the stored kind's source of truth, so it is checked first;
  // a mislabelled MIME type cannot turn a video into a compressed image.
  const typed = assetTypeOf(file.name)
  if (typed !== null) return typed.kind
  if (/^image\/(png|jpeg|webp|avif|gif)$/i.test(file.type)) return 'image'
  if (/^video\/(mp4|webm)$/i.test(file.type)) return 'video'
  return null
}

/** What one prepared upload carries, and how the editor should preview it. */
export type PreparedBackgroundMedia = { blob: Blob; kind: ThemeAssetKind }

/**
 * Turn the picked file into the bytes the Host will store.
 *
 * A video is uploaded untouched: the browser cannot re-encode one without a
 * codec stack, and a wallpaper clip is already compressed. An image is handled
 * exactly as before — a small one keeps its original bytes, while a large one is
 * decoded, bounded to 3840 px on its long edge and re-encoded, because a
 * wallpaper is painted at viewport size and shipping a twelve-megapixel camera
 * original would cost decode memory on every reload for pixels nobody sees.
 */
export async function prepareBackgroundMedia(file: File): Promise<PreparedBackgroundMedia> {
  const kind = backgroundKindOf(file)
  if (kind === null) throw new Error('unsupported media type')
  if (kind === 'video') {
    if (file.size > THEME_VIDEO_MAX_BYTES) throw new Error('the video is too large')
    return { blob: file, kind }
  }
  return { blob: await prepareImage(file), kind }
}

/** The image half of {@link prepareBackgroundMedia}. */
async function prepareImage(file: File): Promise<Blob> {
  const limit = THEME_IMAGE_MAX_BYTES
  if (file.size <= BACKGROUND_KEEP_ORIGINAL_BYTES) {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    try {
      bitmap = await createImageBitmap(file)
    } catch {
      throw new Error('the image could not be decoded')
    }
  }

  try {
    const scale = Math.min(1, BACKGROUND_MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)

    let best: Blob | null = null
    for (const quality of BACKGROUND_ENCODE_QUALITIES) {
      const encoded = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', quality)
      })
      if (encoded === null) continue
      best = encoded
      if (encoded.size <= limit) return encoded
    }
    // Re-encoding can lose to an already-optimised original; a file that fits
    // is better than a blurry one that does not.
    if (file.size <= limit) return file
    if (best !== null) throw new Error('the image is still too large after compression')
    throw new Error('the image could not be encoded')
  } finally {
    bitmap.close()
  }
}
