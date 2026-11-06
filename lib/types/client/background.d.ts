/**
 * The wallpaper layer behind the app: one image or video per appearance.
 *
 * The theme's own surface colour is painted by this layer, not by the shell's
 * tokens: the media sits *on top of* that colour at its own opacity, so lowering
 * the opacity reveals the panel colour — the panel never becomes transparent to
 * reveal the wallpaper.
 *
 * One fixed layer spans the whole window, so the sidebar and the main canvas
 * always share the same wallpaper and the same alignment. Only the two canvas
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
 *
 * A video cannot be painted by a CSS background, so the composer's copy is a
 * real element: a wrapper inserted into the shell's `[data-composer-seat]`, with
 * a `position: fixed` video that the wrapper's `overflow: hidden` clips to the
 * seat's box. The wrapper lives inside the seat's stacking context, which is
 * what lets it cover the transcript exactly like the image copy does.
 */
import { type ThemeAppearance, type ThemeAssetKind } from '../contract.js';
/** What the input accepts and what the Host will store. */
export declare const BACKGROUND_ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif,video/mp4,video/webm";
/** One appearance's wallpaper as the renderer needs it: a URL and its kind, or none. */
export type ResolvedBackgroundSide = {
    /** null when this appearance paints no media of its own. */
    url: string | null;
    /** How to paint the URL; null exactly when `url` is null. */
    kind: ThemeAssetKind | null;
    /** Opacity 0–100, and blur in px, for this appearance's own media. */
    opacity: number;
    blur: number;
};
/**
 * The wallpaper pair the layer paints. The two appearances are independent
 * files, so this is a side each rather than one URL with two sets of numbers.
 */
export type ResolvedBackground = Record<ThemeAppearance, ResolvedBackgroundSide>;
/** Whether either appearance has media; a pair with none is not worth mounting. */
export declare function backgroundHasMedia(background: ResolvedBackground): boolean;
/** The two surface colours the media is composited over, per appearance. */
export type BackgroundSurfaceColors = {
    light: string;
    dark: string;
};
/**
 * The layer's own stylesheet. Opacity and blur are custom properties so a
 * slider can move them without rebuilding the theme's token layer: the shell
 * never sees a `theme/change` while the user drags. Media URL, opacity and blur
 * all have one property per appearance, so each side is fully independent.
 */
export declare const BACKGROUND_CSS: string;
export declare function createBackgroundLayer(): {
    render: (bg: ResolvedBackground | null, colors: BackgroundSurfaceColors | null) => void;
    unmount: () => void;
    dispose: () => void;
};
export type BackgroundLayer = ReturnType<typeof createBackgroundLayer>;
/** The kind of media a picked file carries, or null when the Host would refuse it. */
export declare function backgroundKindOf(file: File): ThemeAssetKind | null;
/** What one prepared upload carries, and how the editor should preview it. */
export type PreparedBackgroundMedia = {
    blob: Blob;
    kind: ThemeAssetKind;
};
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
export declare function prepareBackgroundMedia(file: File): Promise<PreparedBackgroundMedia>;
//# sourceMappingURL=background.d.ts.map