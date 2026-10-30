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

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  THEME_ARCHIVE_ASSETS_DIR,
  THEME_ARCHIVE_DOCUMENT,
  THEME_ARCHIVE_MAX_ENTRIES,
  THEME_ARCHIVE_MAX_ENTRY_BYTES,
  THEME_CSS_MAX_BYTES,
  THEME_CSS_NAME,
  THEME_FILE_VERSION,
  assetTypeOf,
  backgroundForAssets,
  errorMessage,
  isRecord,
} from '../contract.js'
import type { ThemeAsset, ThemeBackground, ThemeDocument } from '../contract.js'
import { listAssets } from './assets.js'
import { assetsDir, isThemeId, themeDir } from './paths.js'
import { createZip, readZip, type ZipEntry } from './zip.js'

/** The document as it is packed; the timestamps are the Host's own bookkeeping. */
type PackedDocument = Pick<ThemeDocument, 'id' | 'name' | 'base' | 'theme' | 'cssEnabled' | 'assets'> & {
  background: ThemeBackground | null
}

/** A share refused for a reason worth showing the user. */
export class ArchiveError extends Error {}

/**
 * Pack one theme directory. A theme with no media still gets an archive holding
 * its document alone, so sharing a plain theme needs no second code path.
 */
export async function packTheme(id: string): Promise<{
  fileName: string
  bytes: Buffer
  document: PackedDocument
}> {
  const raw = await readFile(join(themeDir(id), THEME_ARCHIVE_DOCUMENT), 'utf8')
  const doc = JSON.parse(raw) as ThemeDocument

  // Media is optional and additive: whatever sits in `assets/` travels, and the
  // document's own `assets` list is rebuilt from what was actually packed so an
  // entry can never point at a file the archive does not carry. A video is
  // already compressed, so the archive stores it rather than spending seconds
  // inflating it only to find the result larger.
  const entries: ZipEntry[] = []
  const assets: ThemeAsset[] = []
  for (const asset of await listAssets(id)) {
    const bytes = await readFile(join(assetsDir(id), asset.name))
    entries.push({
      name: `${THEME_ARCHIVE_ASSETS_DIR}/${asset.name}`,
      data: bytes,
      compress: asset.kind !== 'video',
    })
    assets.push({ ...asset, bytes: bytes.byteLength })
  }

  const background = backgroundForAssets(doc.background, assets)

  // The stylesheet travels at the archive root and compresses like the
  // document. An absent file is simply not an entry.
  let css: string | null = null
  try {
    css = await readFile(join(themeDir(id), THEME_CSS_NAME), 'utf8')
  } catch {
    // No stylesheet: the archive is still a complete theme.
  }
  if (css !== null) {
    const cssBytes = Buffer.byteLength(css, 'utf8')
    if (cssBytes > THEME_CSS_MAX_BYTES) {
      throw new ArchiveError(`custom CSS is larger than ${String(THEME_CSS_MAX_BYTES)} bytes`)
    }
    entries.push({ name: THEME_CSS_NAME, data: Buffer.from(css, 'utf8'), compress: true })
  }

  // Re-encoded rather than re-emitted byte for byte: an archive should carry the
  // canonical document, and a hand-edited file still packs. The version is
  // stamped so an older build refuses a package whose CSS it would otherwise
  // filter out and silently drop.
  const canonical = {
    ...doc,
    v: THEME_FILE_VERSION,
    cssEnabled: doc.cssEnabled === true,
    assets,
    background,
  }
  entries.unshift({
    name: THEME_ARCHIVE_DOCUMENT,
    data: Buffer.from(`${JSON.stringify(canonical, null, 2)}\n`, 'utf8'),
  })

  const packed: PackedDocument = {
    id: doc.id,
    name: doc.name,
    base: doc.base,
    theme: doc.theme,
    cssEnabled: doc.cssEnabled === true,
    assets,
    background,
  }
  return {
    fileName: doc.name,
    bytes: createZip(entries),
    document: packed,
  }
}

/** An archive's document, validated; anything else throws {@link ArchiveError}. */
export type UnpackedTheme = {
  /** The validated document; the Host assigns a fresh id and name when storing it. */
  document: PackedDocument
  /** Media carried beside the document, already bounds-checked. */
  assets: { name: string; bytes: Buffer; kind: ThemeAsset['kind']; mime: string }[]
  /** The optional stylesheet at the archive root, already bounds-checked. */
  css: string | null
}

/**
 * Read an archive back into a theme. Only the document, its media and its
 * optional stylesheet are accepted; every path is required to be exactly one of
 * those shapes, so a directory entry or a nested path is refused rather than
 * normalised.
 */
export function unpackTheme(archive: Buffer): UnpackedTheme {
  let entries
  try {
    entries = readZip(archive, {
      maxEntryBytes: THEME_ARCHIVE_MAX_ENTRY_BYTES,
      filter: (name) =>
        name === THEME_ARCHIVE_DOCUMENT
        || name === THEME_CSS_NAME
        || (name.startsWith(`${THEME_ARCHIVE_ASSETS_DIR}/`) && name.length > THEME_ARCHIVE_ASSETS_DIR.length + 1),
    })
  } catch (error) {
    throw new ArchiveError(errorMessage(error))
  }
  if (entries.length > THEME_ARCHIVE_MAX_ENTRIES) {
    throw new ArchiveError('archive carries too many files')
  }

  const documentEntry = entries.find((entry) => entry.name === THEME_ARCHIVE_DOCUMENT)
  if (!documentEntry) {
    throw new ArchiveError(`archive is missing ${THEME_ARCHIVE_DOCUMENT}`)
  }
  let parsed: unknown
  try {
    // A BOM is not JSON, and archives repacked on Windows tend to acquire one;
    // dropping it here keeps a shareable document shareable.
    parsed = JSON.parse(documentEntry.data.toString('utf8').replace(/^\uFEFF/, ''))
  } catch {
    throw new ArchiveError(`${THEME_ARCHIVE_DOCUMENT} is not valid JSON`)
  }
  if (!isRecord(parsed)) throw new ArchiveError(`${THEME_ARCHIVE_DOCUMENT} must be an object`)

  const version = typeof parsed.v === 'number' ? parsed.v : THEME_FILE_VERSION
  if (version > THEME_FILE_VERSION) {
    throw new ArchiveError(`theme format v${String(version)} is newer than this plugin reads`)
  }
  if (!isThemeId(parsed.id)) throw new ArchiveError('theme id must be a safe slug')
  if (typeof parsed.name !== 'string' || parsed.name.trim() === '') {
    throw new ArchiveError('theme name must be a non-empty string')
  }
  if (typeof parsed.base !== 'string') throw new ArchiveError('theme base must be a string')
  if (!isRecord(parsed.theme)) throw new ArchiveError('theme colours must be an object')

  // The stylesheet is a text entry at the root, not a media asset. It is
  // bounded like the write route so an archive cannot smuggle in a stylesheet
  // larger than the host would ever store.
  const cssEntry = entries.find((entry) => entry.name === THEME_CSS_NAME)
  if (cssEntry && cssEntry.data.byteLength > THEME_CSS_MAX_BYTES) {
    throw new ArchiveError(`custom CSS is larger than ${String(THEME_CSS_MAX_BYTES)} bytes`)
  }
  const css = cssEntry ? cssEntry.data.toString('utf8').replace(/^\uFEFF/, '') : null

  const assets: UnpackedTheme['assets'] = []
  for (const entry of entries) {
    if (entry.name === THEME_ARCHIVE_DOCUMENT || entry.name === THEME_CSS_NAME) continue
    const name = entry.name.slice(THEME_ARCHIVE_ASSETS_DIR.length + 1)
    if (name.includes('/') || name.includes('\\') || name === '' || name.startsWith('.')) {
      throw new ArchiveError(`archive contains an unusable media path: ${entry.name}`)
    }
    const type = assetTypeOf(name)
    if (!type) throw new ArchiveError(`unsupported media type: ${name}`)
    assets.push({ name, bytes: entry.data, kind: type.kind, mime: type.mime })
  }

  // A background survives the trip only when its file did. Dropping it is
  // better than importing a theme whose document points at a missing image: the
  // colours still arrive, and the user can pick a new wallpaper.
  const background = backgroundForAssets(parsed.background, assets)

  return {
    document: {
      id: parsed.id,
      name: parsed.name,
      base: parsed.base,
      theme: parsed.theme,
      // The stored value says what the author intended; the importer forces
      // false so a shared stylesheet never applies on arrival.
      cssEnabled: parsed.cssEnabled === true,
      assets: assets.map((asset) => ({
        name: asset.name,
        kind: asset.kind,
        mime: asset.mime,
        bytes: asset.bytes.byteLength,
      })),
      background,
    },
    assets,
    css,
  }
}
