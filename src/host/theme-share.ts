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
  THEME_FILE_VERSION,
  assetTypeOf,
  backgroundForAssets,
  isRecord,
} from '../contract.js'
import type { ThemeAsset, ThemeBackground, ThemeDocument } from '../contract.js'
import { listAssets } from './assets.js'
import { assetsDir, isThemeId, themeDir } from './paths.js'
import { createZip, readZip, type ZipEntry } from './zip.js'

/** The document as it is packed; the timestamps are the Host's own bookkeeping. */
type PackedDocument = Pick<ThemeDocument, 'id' | 'name' | 'base' | 'theme' | 'assets'> & {
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
  // Re-encoded rather than re-emitted byte for byte: an archive should carry the
  // canonical document, and a hand-edited file still packs.
  const entries: ZipEntry[] = [
    { name: THEME_ARCHIVE_DOCUMENT, data: Buffer.from(`${JSON.stringify(doc, null, 2)}\n`, 'utf8') },
  ]

  // Media is optional and additive: whatever sits in `assets/` travels, and the
  // document's own `assets` list is rebuilt from what was actually packed so an
  // entry can never point at a file the archive does not carry. A video is
  // already compressed, so the archive stores it rather than spending seconds
  // inflating it only to find the result larger.
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

  const packed: PackedDocument = {
    id: doc.id,
    name: doc.name,
    base: doc.base,
    theme: doc.theme,
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
}

/**
 * Read an archive back into a theme. Only the document and its media are
 * accepted; every path is required to be exactly one of those two shapes, so a
 * directory entry or a nested path is refused rather than normalised.
 */
export function unpackTheme(archive: Buffer): UnpackedTheme {
  let entries
  try {
    entries = readZip(archive, {
      maxEntryBytes: THEME_ARCHIVE_MAX_ENTRY_BYTES,
      filter: (name) =>
        name === THEME_ARCHIVE_DOCUMENT
        || (name.startsWith(`${THEME_ARCHIVE_ASSETS_DIR}/`) && name.length > THEME_ARCHIVE_ASSETS_DIR.length + 1),
    })
  } catch (error) {
    throw new ArchiveError(error instanceof Error ? error.message : String(error))
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

  const assets: UnpackedTheme['assets'] = []
  for (const entry of entries) {
    if (entry.name === THEME_ARCHIVE_DOCUMENT) continue
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
      assets: assets.map((asset) => ({
        name: asset.name,
        kind: asset.kind,
        mime: asset.mime,
        bytes: asset.bytes.byteLength,
      })),
      background,
    },
    assets,
  }
}
