/**
 * The wallpaper layer behind the app.
 *
 * The theme's own surface colour is painted by this layer, not by the shell's
 * tokens: while a background is on, `--dsw-alias-bg-base` and the sidebar fill
 * are overridden to transparent (see `tokens.ts`), which lets both columns show
 * this one layer. The image sits *on top of* that colour at its own opacity, so
 * lowering the opacity reveals the panel colour — the panel never becomes
 * transparent to reveal the image.
 *
 * One fixed layer spans the whole window, so the sidebar and the main canvas
 * always share the same image and the same alignment. Content cards keep their
 * own opaque surfaces on top of it.
 */
import { type ThemeBackgroundFit } from '../contract.js';
/** What the input accepts and what the Host will store. */
export declare const BACKGROUND_ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif";
/** One background as the renderer needs it: where the bytes are, and how to paint them. */
export type ResolvedBackground = {
    url: string;
    opacity: number;
    fit: ThemeBackgroundFit;
    blur: number;
};
/** The two surface colours the image is composited over, per appearance. */
export type BackgroundSurfaceColors = {
    light: string;
    dark: string;
};
/**
 * The layer's own stylesheet. Opacity and blur are custom properties so a
 * slider can move them without rebuilding the theme's token layer: the shell
 * never sees a `theme/change` while the user drags.
 */
export declare const BACKGROUND_CSS: string;
/** The opacity the dark appearance actually paints, derived from the light one. */
export declare function darkOpacity(lightOpacity: number): number;
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
/** A fresh background's first settings: what a picker should start from. */
export declare const DEFAULT_BACKGROUND: {
    opacity: number;
    fit: "cover";
    blur: number;
};
//# sourceMappingURL=background.d.ts.map