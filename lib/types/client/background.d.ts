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
import { type ThemeAppearance } from '../contract.js';
/** What the input accepts and what the Host will store. */
export declare const BACKGROUND_ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif";
/** One appearance's wallpaper as the renderer needs it: a URL, or none at all. */
export type ResolvedBackgroundSide = {
    /** null when this appearance paints no image of its own. */
    url: string | null;
    /** Opacity 0–100, and blur in px, for this appearance's own image. */
    opacity: number;
    blur: number;
};
/**
 * The wallpaper pair the layer paints. The two appearances are independent
 * images, so this is a side each rather than one URL with two sets of numbers.
 */
export type ResolvedBackground = Record<ThemeAppearance, ResolvedBackgroundSide>;
/** Whether either appearance has an image; a pair with none is not worth mounting. */
export declare function backgroundHasImage(background: ResolvedBackground): boolean;
/** The two surface colours the images are composited over, per appearance. */
export type BackgroundSurfaceColors = {
    light: string;
    dark: string;
};
/**
 * The layer's own stylesheet. Opacity and blur are custom properties so a
 * slider can move them without rebuilding the theme's token layer: the shell
 * never sees a `theme/change` while the user drags. Image, opacity and blur all
 * have one property per appearance, so each side is fully independent.
 */
export declare const BACKGROUND_CSS: string;
export declare function createBackgroundLayer(): {
    render: (bg: ResolvedBackground | null, colors: BackgroundSurfaceColors | null) => void;
    unmount: () => void;
    dispose: () => void;
};
export type BackgroundLayer = ReturnType<typeof createBackgroundLayer>;
/**
 * Turn the picked file into the bytes the Host will store.
 *
 * A small image is uploaded untouched, which keeps its original quality and any
 * animation. A large one is decoded, bounded to 3840 px on its long edge and
 * re-encoded, because a wallpaper is painted at viewport size: shipping a
 * twelve-megapixel camera original would cost decode memory on every reload for
 * pixels nobody sees.
 */
export declare function prepareBackgroundImage(file: File): Promise<Blob>;
/** Whether the picker's file is one of the types the Host may store. */
export declare function isSupportedImage(file: File): boolean;
//# sourceMappingURL=background.d.ts.map