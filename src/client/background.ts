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
  THEME_BACKGROUND_DARK_FACTOR,
  THEME_BACKGROUND_DEFAULT_OPACITY,
  THEME_BACKGROUND_MAX_BLUR,
  assetTypeOf,
  type ThemeBackgroundFit,
} from '../contract.js'

/** What the input accepts and what the Host will store. */
export const BACKGROUND_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif'

/** One background as the renderer needs it: where the bytes are, and how to paint them. */
export type ResolvedBackground = {
  url: string
  opacity: number
  fit: ThemeBackgroundFit
  blur: number
}

/** The two surface colours the image is composited over, per appearance. */
export type BackgroundSurfaceColors = { light: string; dark: string }

/**
 * The layer's own stylesheet. Opacity and blur are custom properties so a
 * slider can move them without rebuilding the theme's token layer: the shell
 * never sees a `theme/change` while the user drags.
 */
export const BACKGROUND_CSS = [
  '.ct-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-color:var(--ct-bg-light,#fff);}',
  'html[data-ds-dark-theme] .ct-bg,body[data-ds-dark-theme] .ct-bg{background-color:var(--ct-bg-dark,#151517);}',
  '.ct-bg-image{position:absolute;inset:0;background-image:var(--ct-bg-image,none);background-position:center;background-repeat:var(--ct-bg-repeat,no-repeat);background-size:var(--ct-bg-size,cover);opacity:var(--ct-bg-opacity-light,0);filter:blur(var(--ct-bg-blur,0px));}',
  'html[data-ds-dark-theme] .ct-bg-image,body[data-ds-dark-theme] .ct-bg-image{opacity:var(--ct-bg-opacity-dark,0);}',
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
  // The drawer's own opaque frame, which the sidebar setting would otherwise
  // keep painting over the layer on Windows and Linux.
  'html:not([data-platform="darwin"]).ct-bg-on #root > [class*="frame"]{background:transparent !important;}',
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
  'html.ct-bg-on [class*="centerCol"] [data-phase="active"] [data-composer-seat]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(var(--ct-bg-wash,transparent),var(--ct-bg-wash,transparent)),var(--ct-bg-image,none);background-size:auto,var(--ct-bg-size,cover);background-position:center,center;background-repeat:no-repeat,var(--ct-bg-repeat,no-repeat);background-attachment:fixed,fixed;filter:blur(var(--ct-bg-blur,0px));-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 36px);mask-image:linear-gradient(180deg,transparent 0,#000 36px);}',
  // The wash is the panel colour at the alpha the image leaves free; it has to
  // follow the appearance, exactly like the layer's own opacity does.
  'html{--ct-bg-wash:var(--ct-bg-wash-light,transparent);}',
  'html[data-ds-dark-theme],body[data-ds-dark-theme]{--ct-bg-wash:var(--ct-bg-wash-dark,transparent);}',
].join('\n')

const clampOpacity = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

/** The layer's custom properties, all set on `<html>` so the composer can read them. */
const BACKGROUND_VARIABLES = [
  '--ct-bg-light',
  '--ct-bg-dark',
  '--ct-bg-opacity-light',
  '--ct-bg-opacity-dark',
  '--ct-bg-blur',
  '--ct-bg-image',
  '--ct-bg-size',
  '--ct-bg-repeat',
  '--ct-bg-wash-light',
  '--ct-bg-wash-dark',
] as const

/**
 * The panel colour at the alpha the image does not cover. Laid over the image it
 * reproduces the layer's own `colour + image at opacity` composite.
 */
function surfaceWash(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${String(100 - clampOpacity(opacity))}%, transparent)`
}

/** The opacity the dark appearance actually paints, derived from the light one. */
export function darkOpacity(lightOpacity: number): number {
  return clampOpacity(clampOpacity(lightOpacity) * THEME_BACKGROUND_DARK_FACTOR)
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
   * not shown.
   */
  function render(bg: ResolvedBackground | null, colors: BackgroundSurfaceColors | null): void {
    if (bg === null || colors === null) {
      unmount()
      return
    }
    ensure()
    if (layer === null || image === null) return
    const opacity = clampOpacity(bg.opacity)
    const dark = darkOpacity(opacity)
    const blur = Math.max(0, Math.min(THEME_BACKGROUND_MAX_BLUR, bg.blur))
    // On `<html>` rather than on the layer: the composer's copy of the
    // wallpaper lives outside this element and reads the same properties.
    const style = document.documentElement.style
    style.setProperty('--ct-bg-light', colors.light)
    style.setProperty('--ct-bg-dark', colors.dark)
    style.setProperty('--ct-bg-opacity-light', String(opacity / 100))
    style.setProperty('--ct-bg-opacity-dark', String(dark / 100))
    style.setProperty('--ct-bg-blur', `${String(blur)}px`)
    style.setProperty('--ct-bg-image', cssUrl(bg.url))
    style.setProperty('--ct-bg-size', bg.fit === 'tile' ? 'auto auto' : bg.fit)
    style.setProperty('--ct-bg-repeat', bg.fit === 'tile' ? 'repeat' : 'no-repeat')
    style.setProperty('--ct-bg-wash-light', surfaceWash(colors.light, opacity))
    style.setProperty('--ct-bg-wash-dark', surfaceWash(colors.dark, dark))
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
  const limit = 4 * 1024 * 1024
  if (file.size <= 1.5 * 1024 * 1024) {
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
    const scale = Math.min(1, 3840 / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)

    let best: Blob | null = null
    for (const quality of [0.85, 0.7, 0.55]) {
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

/** A fresh background's first settings: what a picker should start from. */
export const DEFAULT_BACKGROUND = {
  opacity: THEME_BACKGROUND_DEFAULT_OPACITY,
  fit: 'cover' as const,
  blur: 0,
}
