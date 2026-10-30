/**
 * Theme sharing: packing one stored theme into an archive and reading one back.
 *
 * An archive is the theme directory itself — the same `theme.json` and `assets/`
 * a theme occupies on disk — so sharing never invents a second format, and a
 * theme's background image or video travels with it automatically. The Host owns
 * both halves because the browser can neither read the theme's files nor
 * decompress an archive on its behalf.
 *
 * Reading is deliberately strict: an archive either validates as one of ours or
 * is refused with a reason. Nothing half-valid is ever handed to the client to
 * repair, because a foreign or damaged file must not be able to seed the roster.
 */
import type { ThemeAsset, ThemeBackground, ThemeDocument } from '../contract.js';
/** The document as it is packed; the timestamps are the Host's own bookkeeping. */
type PackedDocument = Pick<ThemeDocument, 'id' | 'name' | 'base' | 'theme' | 'cssEnabled' | 'assets'> & {
    background: ThemeBackground | null;
};
/** A share refused for a reason worth showing the user. */
export declare class ArchiveError extends Error {
}
/**
 * Pack one theme directory. A theme with no media still gets an archive holding
 * its document alone, so sharing a plain theme needs no second code path.
 */
export declare function packTheme(id: string): Promise<{
    fileName: string;
    bytes: Buffer;
    document: PackedDocument;
}>;
/** An archive's document, validated; anything else throws {@link ArchiveError}. */
export type UnpackedTheme = {
    /** The validated document; the Host assigns a fresh id and name when storing it. */
    document: PackedDocument;
    /** Media carried beside the document, already bounds-checked. */
    assets: {
        name: string;
        bytes: Buffer;
        kind: ThemeAsset['kind'];
        mime: string;
    }[];
    /** The optional stylesheet at the archive root, already bounds-checked. */
    css: string | null;
};
/**
 * Read an archive back into a theme. Only the document, its media and its
 * optional stylesheet are accepted; every path is required to be exactly one of
 * those shapes, so a directory entry or a nested path is refused rather than
 * normalised.
 */
export declare function unpackTheme(archive: Buffer): UnpackedTheme;
export {};
//# sourceMappingURL=theme-share.d.ts.map