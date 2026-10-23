/**
 * The wallpaper layer behind the app.
 *
 * The theme's own surface colour is painted by this layer, not by the shell's
 * tokens: the image sits *on top of* that colour at its own opacity, so lowering
 * the opacity reveals the panel colour — the panel never becomes transparent to
 * reveal the image.
 *
 * One fixed layer spans the whole window, so the sidebar and the main canvas
 * always share the same image and the same alignment. Only the two canvas
 * surfaces are cleared (`BACKGROUND_CSS`): the shell's background tokens stay
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
 */

import {
  THEME_APPEARANCES,
  THEME_ASSET_MAX_BYTES,
  assetTypeOf,
  clampBackgroundBlur,
  clampBackgroundOpacity,
  type ThemeAppearance,
} from '../contract.js'

/** What the input accepts and what the Host will store. */
export const BACKGROUND_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif'

/** Longest edge a re-encoded wallpaper keeps; pixels past it are never painted. */
const BACKGROUND_MAX_EDGE_PX = 3840

/** A file at or below this size is uploaded untouched, keeping quality and animation. */
const BACKGROUND_KEEP_ORIGINAL_BYTES = 1.5 * 1024 * 1024

/** Encoder qualities tried in order until the re-encoded image fits the upload cap. */
const BACKGROUND_ENCODE_QUALITIES = [0.85, 0.7, 0.55] as const

/** One appearance's wallpaper as the renderer needs it: a URL, or none at all. */
export type ResolvedBackgroundSide = {
  /** null when this appearance paints no image of its own. */
  url: string | null
  /** Opacity 0–100, and blur in px, for this appearance's own image. */
  opacity: number
  blur: number
}

/**
 * The wallpaper pair the layer paints. The two appearances are independent
 * images, so this is a side each rather than one URL with two sets of numbers.
 */
export type ResolvedBackground = Record<ThemeAppearance, ResolvedBackgroundSide>

/** Whether either appearance has an image; a pair with none is not worth mounting. */
export function backgroundHasImage(background: ResolvedBackground): boolean {
  return background.light.url !== null || background.dark.url !== null
}

/** The two surface colours the images are composited over, per appearance. */
export type BackgroundSurfaceColors = { light: string; dark: string }

/**
 * The layer's own stylesheet. Opacity and blur are custom properties so a
 * slider can move them without rebuilding the theme's token layer: the shell
 * never sees a `theme/change` while the user drags. Image, opacity and blur all
 * have one property per appearance, so each side is fully independent.
 */
export const BACKGROUND_CSS = [
  '.ct-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-color:var(--ct-bg-light,#fff);}',
  'html[data-ds-dark-theme] .ct-bg,body[data-ds-dark-theme] .ct-bg{background-color:var(--ct-bg-dark,#151517);}',
  // One element carries both appearances: only one is active at a time, and the
  // per-appearance properties select which image to paint.
  '.ct-bg-image{position:absolute;inset:0;background-image:var(--ct-bg-image-light,none);background-position:center;background-repeat:no-repeat;background-size:cover;opacity:var(--ct-bg-opacity-light,0);filter:blur(var(--ct-bg-blur-light,0px));}',
  'html[data-ds-dark-theme] .ct-bg-image,body[data-ds-dark-theme] .ct-bg-image{background-image:var(--ct-bg-image-dark,none);opacity:var(--ct-bg-opacity-dark,0);filter:blur(var(--ct-bg-blur-dark,0px));}',
  // The canvas surfaces that clear for the layer. They are matched by class
  // substring because the hashed prefix (`_6Qf49G_centerCol`) rotates between
  // builds; the conversation root has a stable `data-phase` attribute instead.
  // `centerCol` and `sidebarCol` are the only layout classes carrying these
  // names, and the desktop frame patch is limited to non-darwin, where macOS
  // already leaves the frame transparent.
  'html.ct-bg-on [data-phase]{background:transparent !important;}',
  'html.ct-bg-on [class*="centerCol"]{background:transparent !important;}',
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
  // colour sits on top at `1 - image opacity`; compositing that over the image
  // reproduces `.ct-bg`'s `colour + image at opacity` exactly. The top 36px is
  // masked, matching the fade the shell itself used to draw.
  'html.ct-bg-on [class*="centerCol"] [data-phase="active"] [data-composer-seat]{background:transparent !important;}',
  'html.ct-bg-on [class*="centerCol"] [data-phase="active"] [data-composer-seat]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(var(--ct-bg-wash,transparent),var(--ct-bg-wash,transparent)),var(--ct-bg-image,none);background-size:auto,cover;background-position:center,center;background-repeat:no-repeat;background-attachment:fixed,fixed;filter:blur(var(--ct-bg-blur,0px));-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 36px);mask-image:linear-gradient(180deg,transparent 0,#000 36px);}',
  // The wash is the panel colour at the alpha the image leaves free, and the
  // composer copy blurs by the same radius as the layer below; image, wash and
  // blur all have to follow the appearance, exactly like the layer's own
  // opacity does. One alias per property keeps the composer rule free of a
  // second light/dark pair. A side with no image aliases to `none`/`transparent`,
  // so the copy paints nothing rather than cutting a solid band out of the layer.
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
 * The panel colour at the alpha the image does not cover. Laid over the image it
 * reproduces the layer's own `colour + image at opacity` composite.
 */
function surfaceWash(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${String(100 - clampBackgroundOpacity(opacity))}%, transparent)`
}

/** Quote a URL for a CSS `url()` token. */
function cssUrl(url: string): string {
  return `url("${url.replace(/[\\"]/g, '\\$&')}")`
}

export function createBackgroundLayer() {
  let layer: HTMLDivElement | null = null
  let image: HTMLDivElement | null = null

  function ensure(): void {
    if (typeof document === 'undefined' || !document.body) return
    if (layer !== null && document.body.contains(layer)) return
    layer = document.createElement('div')
    layer.className = 'ct-bg'
    layer.setAttribute('aria-hidden', 'true')
    image = document.createElement('div')
    image.className = 'ct-bg-image'
    layer.append(image)
    // Prepended, and at z-index -1: the layer sits above the document canvas
    // but below every in-flow column, so no class hash is involved.
    document.body.prepend(layer)
    // `BACKGROUND_CSS` clears the canvas only while this class is present, so
    // removing the wallpaper hands the shell its own opaque surfaces back.
    document.documentElement.classList.add('ct-bg-on')
  }

  function unmount(): void {
    layer?.remove()
    layer = null
    image = null
    if (typeof document === 'undefined') return
    document.documentElement.classList.remove('ct-bg-on')
    for (const name of BACKGROUND_VARIABLES) document.documentElement.style.removeProperty(name)
  }

  /**
   * Paint one background, or take the layer away. `colors` are the theme's own
   * surface colours; without them there is no colour to reveal, so the layer is
   * not shown. A pair with no image on either side is the same as no background.
   */
  function render(bg: ResolvedBackground | null, colors: BackgroundSurfaceColors | null): void {
    if (bg === null || colors === null || !backgroundHasImage(bg)) {
      unmount()
      return
    }
    ensure()
    if (layer === null || image === null) return
    // On `<html>` rather than on the layer: the composer's copy of the
    // wallpaper lives outside this element and reads the same properties.
    const style = document.documentElement.style
    style.setProperty('--ct-bg-light', colors.light)
    style.setProperty('--ct-bg-dark', colors.dark)
    for (const appearance of THEME_APPEARANCES) {
      const side = bg[appearance]
      if (side.url === null) {
        // No image on this side: nothing paints, and the composer copy has to
        // stay invisible too, or it would cut an opaque band out of the layer.
        style.setProperty(`--ct-bg-image-${appearance}`, 'none')
        style.setProperty(`--ct-bg-opacity-${appearance}`, '0')
        style.setProperty(`--ct-bg-blur-${appearance}`, '0px')
        style.setProperty(`--ct-bg-wash-${appearance}`, 'transparent')
        continue
      }
      const opacity = clampBackgroundOpacity(side.opacity)
      style.setProperty(`--ct-bg-image-${appearance}`, cssUrl(side.url))
      style.setProperty(`--ct-bg-opacity-${appearance}`, String(opacity / 100))
      style.setProperty(`--ct-bg-blur-${appearance}`, `${String(clampBackgroundBlur(side.blur))}px`)
      style.setProperty(`--ct-bg-wash-${appearance}`, surfaceWash(colors[appearance], opacity))
    }
  }

  return { render, unmount, dispose: unmount }
}

export type BackgroundLayer = ReturnType<typeof createBackgroundLayer>

/**
 * Turn the picked file into the bytes the Host will store.
 *
 * A small image is uploaded untouched, which keeps its original quality and any
 * animation. A large one is decoded, bounded to 3840 px on its long edge and
 * re-encoded, because a wallpaper is painted at viewport size: shipping a
 * twelve-megapixel camera original would cost decode memory on every reload for
 * pixels nobody sees.
 */
export async function prepareBackgroundImage(file: File): Promise<Blob> {
  if (!isSupportedImage(file)) {
    throw new Error('unsupported image type')
  }
  const limit = THEME_ASSET_MAX_BYTES
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

/** Whether the picker's file is one of the types the Host may store. */
export function isSupportedImage(file: File): boolean {
  if (/^image\/(png|jpeg|webp|avif|gif)$/i.test(file.type)) return true
  return assetTypeOf(file.name) !== null
}
