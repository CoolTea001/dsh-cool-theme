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
 * Content cards keep their own opaque surfaces on top of the layer.
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
  '.ct-bg-image{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;opacity:var(--ct-bg-opacity-light,0);filter:blur(var(--ct-bg-blur,0px));transform:scale(1.03);}',
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
].join('\n')

const clampOpacity = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

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
    if (typeof document !== 'undefined') document.documentElement.classList.remove('ct-bg-on')
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
    const blur = Math.max(0, Math.min(THEME_BACKGROUND_MAX_BLUR, bg.blur))
    layer.style.setProperty('--ct-bg-light', colors.light)
    layer.style.setProperty('--ct-bg-dark', colors.dark)
    layer.style.setProperty('--ct-bg-opacity-light', String(opacity / 100))
    layer.style.setProperty('--ct-bg-opacity-dark', String(darkOpacity(opacity) / 100))
    layer.style.setProperty('--ct-bg-blur', `${String(blur)}px`)
    image.style.backgroundImage = cssUrl(bg.url)
    image.style.backgroundSize = bg.fit === 'tile' ? 'auto auto' : bg.fit
    image.style.backgroundRepeat = bg.fit === 'tile' ? 'repeat' : 'no-repeat'
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
