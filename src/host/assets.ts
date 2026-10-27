/**
 * Media stored beside a theme document.
 *
 * A theme's `assets/` directory is the only place this plugin keeps binary
 * files. The directory is the source of truth: documents record what a theme
 * carries, but every read rebuilds that list by scanning the directory, so a
 * document can never point at a file the Host does not have.
 *
 * Uploads are accepted by content, not by name or declared type: the bytes have
 * to sniff as one of the raster images or video containers a browser can paint.
 * SVG is deliberately absent — served from this same origin it would be an XSS
 * surface, and a wallpaper has no need for it.
 */

import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { assetTypeOf, isThemeAssetName, type ThemeAsset, type ThemeAssetKind } from '../contract.js'
import { assetsDir } from './paths.js'

/** A refused asset, with a reason worth showing the user. */
export class AssetError extends Error {}

export type MediaType = { ext: string; mime: string; kind: ThemeAssetKind }

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/**
 * ISO base media brands a browser will play as MP4. The brand list is what
 * distinguishes a video from the still-image members of the same container
 * (AVIF/HEIC), which share the `ftyp` box.
 */
const MP4_VIDEO_BRANDS = new Set([
  'isom',
  'iso2',
  'iso4',
  'iso5',
  'iso6',
  'mp41',
  'mp42',
  'avc1',
  'av01',
  'vp09',
  'dash',
  'M4V ',
  'MSNV',
])

/**
 * The media type of a byte string, read from its magic number rather than from
 * a file name or an upload header. Null means "this plugin will not store it".
 */
export function sniffMedia(bytes: Buffer): MediaType | null {
  if (bytes.length < 12) return null
  if (bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { ext: '.png', mime: 'image/png', kind: 'image' }
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg', kind: 'image' }
  }
  const head = bytes.toString('ascii', 0, 6)
  if (head === 'GIF87a' || head === 'GIF89a') {
    return { ext: '.gif', mime: 'image/gif', kind: 'image' }
  }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return { ext: '.webp', mime: 'image/webp', kind: 'image' }
  }
  if (bytes.toString('ascii', 4, 8) === 'ftyp') {
    const brand = bytes.toString('ascii', 8, 12)
    if (brand === 'avif' || brand === 'avis') {
      return { ext: '.avif', mime: 'image/avif', kind: 'image' }
    }
    if (MP4_VIDEO_BRANDS.has(brand)) {
      return { ext: '.mp4', mime: 'video/mp4', kind: 'video' }
    }
  }
  // WebM shares EBML with Matroska, so the magic alone is not enough: the
  // DocType inside the header is what tells Chromium it can play it.
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    const header = bytes.toString('ascii', 0, Math.min(bytes.length, 64))
    if (header.includes('webm')) return { ext: '.webm', mime: 'video/webm', kind: 'video' }
  }
  return null
}

function mediaPath(id: string, name: string): string {
  return join(assetsDir(id), name)
}

/**
 * Write one file where a reader sees either the previous bytes or the next
 * ones, never a half-written file. The caller owns the name's validity.
 */
export async function writeAssetFile(id: string, name: string, bytes: Buffer): Promise<void> {
  if (!isThemeAssetName(name)) throw new AssetError('asset name must be a safe file name')
  const dir = assetsDir(id)
  await mkdir(dir, { recursive: true })
  const temp = join(dir, `.${name}.${process.pid}.${Date.now()}.tmp`)
  await writeFile(temp, bytes)
  await rename(temp, mediaPath(id, name))
}

/**
 * Store one uploaded media file under a content-hashed name and return what the
 * document should record. Hashing makes the read URL immutable: the same bytes
 * always resolve to the same name, and different bytes never collide, so the
 * browser can cache an asset for as long as it likes.
 */
export async function saveMediaAsset(id: string, bytes: Buffer): Promise<ThemeAsset> {
  const type = sniffMedia(bytes)
  if (type === null) {
    throw new AssetError('unsupported media format; use PNG, JPEG, WebP, AVIF, GIF, MP4 or WebM')
  }
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16)
  const name = `bg-${hash}${type.ext}`
  await writeAssetFile(id, name, bytes)
  return { name, kind: type.kind, mime: type.mime, bytes: bytes.byteLength }
}

/** Every media file a theme actually stores, with its size on disk. */
export async function listAssets(id: string): Promise<ThemeAsset[]> {
  let names: string[]
  try {
    names = await readdir(assetsDir(id))
  } catch {
    return []
  }
  const assets: ThemeAsset[] = []
  for (const name of names.sort()) {
    const type = assetTypeOf(name)
    if (type === null || name.startsWith('.')) continue
    try {
      const info = await stat(mediaPath(id, name))
      if (!info.isFile()) continue
      assets.push({ name, kind: type.kind, mime: type.mime, bytes: info.size })
    } catch {
      // A file that vanished between readdir and stat is simply not listed.
    }
  }
  return assets
}

/** One stored asset's bytes and type, or null when it is missing. */
export async function readAsset(
  id: string,
  name: string,
): Promise<{ bytes: Buffer; mime: string; kind: ThemeAssetKind } | null> {
  const type = assetTypeOf(name)
  if (type === null || !isThemeAssetName(name)) return null
  try {
    const bytes = await readFile(mediaPath(id, name))
    return { bytes, mime: type.mime, kind: type.kind }
  } catch {
    return null
  }
}

/**
 * Delete every media file that is not in `keep`.
 *
 * A theme's background references at most one asset per appearance, so a save
 * is the natural garbage-collection point: replacing a file writes a new hash,
 * and the save that follows drops the old one — while the other appearance's
 * file, still referenced, is kept. Files this plugin does not recognise are
 * left alone rather than swept.
 */
export async function pruneAssets(id: string, keep: readonly string[]): Promise<void> {
  const keepSet = new Set(keep)
  let names: string[]
  try {
    names = await readdir(assetsDir(id))
  } catch {
    return
  }
  for (const name of names) {
    if (keepSet.has(name) || assetTypeOf(name) === null) continue
    try {
      await rm(mediaPath(id, name), { force: true })
    } catch {
      // Best effort: a file that cannot be removed is simply retried next save.
    }
  }
}
