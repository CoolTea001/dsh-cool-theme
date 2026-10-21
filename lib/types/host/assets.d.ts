/**
 * Media stored beside a theme document.
 *
 * A theme's `assets/` directory is the only place this plugin keeps binary
 * files. The directory is the source of truth: documents record what a theme
 * carries, but every read rebuilds that list by scanning the directory, so a
 * document can never point at a file the Host does not have.
 *
 * Uploads are accepted by content, not by name or declared type: the bytes have
 * to sniff as one of the raster formats a browser can paint. SVG is deliberately
 * absent — served from this same origin it would be an XSS surface, and a
 * wallpaper has no need for it.
 */
import { type ThemeAsset, type ThemeAssetKind } from '../contract.js';
/** A refused asset, with a reason worth showing the user. */
export declare class AssetError extends Error {
}
export type ImageType = {
    ext: string;
    mime: string;
    kind: ThemeAssetKind;
};
/**
 * The raster type of a byte string, read from its magic number rather than
 * from a file name or an upload header. Null means "this plugin will not store
 * it".
 */
export declare function sniffImage(bytes: Buffer): ImageType | null;
/**
 * Write one file where a reader sees either the previous bytes or the next
 * ones, never a half-written file. The caller owns the name's validity.
 */
export declare function writeAssetFile(id: string, name: string, bytes: Buffer): Promise<void>;
/**
 * Store one uploaded image under a content-hashed name and return what the
 * document should record. Hashing makes the read URL immutable: the same bytes
 * always resolve to the same name, and different bytes never collide, so the
 * browser can cache an asset for as long as it likes.
 */
export declare function saveImageAsset(id: string, bytes: Buffer): Promise<ThemeAsset>;
/** Every media file a theme actually stores, with its size on disk. */
export declare function listAssets(id: string): Promise<ThemeAsset[]>;
/** One stored asset's bytes and type, or null when it is missing. */
export declare function readAsset(id: string, name: string): Promise<{
    bytes: Buffer;
    mime: string;
    kind: ThemeAssetKind;
} | null>;
/**
 * Delete every media file that is not in `keep`.
 *
 * A theme's background references at most one asset per appearance, so a save
 * is the natural garbage-collection point: replacing an image writes a new
 * hash, and the save that follows drops the old one — while the other
 * appearance's file, still referenced, is kept. Files this plugin does not
 * recognise are left alone rather than swept.
 */
export declare function pruneAssets(id: string, keep: readonly string[]): Promise<void>;
//# sourceMappingURL=assets.d.ts.map