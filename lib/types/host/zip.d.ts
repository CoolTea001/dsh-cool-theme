/**
 * The little of ZIP that sharing a theme needs.
 *
 * A theme is one small JSON document plus whatever media sits beside it, so the
 * archive format is worth exactly this much: a writer that emits stored/deflated
 * entries with a central directory, and a reader that walks that directory back.
 * Node owns the compression (`zlib.deflateRawSync` / `inflateRawSync`); the two
 * checksums and the record layout are all that has to be written here, which
 * keeps the plugin dependency-free.
 *
 * Deliberately unsupported, because nothing this plugin writes ever produces
 * them: zip64, encrypted entries, multi-disk archives, and data descriptors.
 */
export type ZipEntry = {
    /** Path inside the archive, always with forward slashes. */
    name: string;
    data: Buffer;
};
/** How a read should select and bound the entries it inflates. */
export type ReadZipOptions = {
    filter?: (name: string) => boolean;
    /** Largest uncompressed entry to accept; a bigger one is a refusal, not a skip. */
    maxEntryBytes?: number;
};
/** CRC-32 of one entry, as the archive records it. */
export declare function crc32(data: Buffer): number;
/**
 * Pack entries into one archive. Directory entries are not emitted: every
 * consumer this format targets infers them from the entry paths.
 */
export declare function createZip(entries: ZipEntry[]): Buffer;
/**
 * Entry bytes from one archive, with `filter` deciding which entries are worth
 * inflating. Throws on anything this writer would not have produced, so a file
 * that is not one of our archives fails as "unreadable" rather than as a
 * half-parsed theme.
 */
export declare function readZip(input: Buffer, options?: ReadZipOptions): ZipEntry[];
//# sourceMappingURL=zip.d.ts.map