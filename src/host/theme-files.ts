/**
 * Theme files owned by the Host.
 *
 * One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
 * document at `theme.json` and the theme's media under `assets/`. Keeping a
 * theme a self-contained directory is what makes the export a copy of that
 * directory rather than a reassembly of scattered rows.
 *
 * The directory is the source of truth for media: `readDocument` rebuilds the
 * asset list by scanning `assets/` instead of trusting the JSON, so a document
 * can never describe files that are not there. A background is kept only while
 * the file it names is still on disk.
 */

import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { THEME_APPEARANCES, THEME_FILE_VERSION, backgroundForAssets, isRecord } from '../contract.js'
import type { ThemeDocument } from '../contract.js'
import { listAssets, pruneAssets } from './assets.js'
import { DOCUMENT_NAME, assetsDir, isThemeId, themeDir, themesRoot } from './paths.js'

export { DOCUMENT_NAME, assetsDir, harnessHome, isThemeId, themeDir, themesRoot } from './paths.js'

function documentPath(id: string): string {
  return join(themeDir(id), DOCUMENT_NAME)
}

/** Whether a theme directory already holds a readable document. */
export async function themeExists(id: string): Promise<boolean> {
  try {
    const info = await stat(documentPath(id))
    return info.isFile()
  } catch {
    return false
  }
}

/**
 * Read one document back into the shape this plugin writes. Returns null when
 * the file is missing or unusable; a corrupt theme must not take the roster
 * down with it, so the caller skips it and keeps the rest.
 */
async function readDocument(id: string): Promise<ThemeDocument | null> {
  let raw: string
  try {
    raw = await readFile(documentPath(id), 'utf8')
  } catch {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    if (!isThemeId(parsed.id) || parsed.id !== id) return null
    if (typeof parsed.name !== 'string' || typeof parsed.base !== 'string') return null
    // The directory decides what media exists; the document only says which of
    // it the theme actually uses.
    const assets = await listAssets(id)
    const background = backgroundForAssets(parsed.background, assets)
    return {
      v: typeof parsed.v === 'number' ? parsed.v : THEME_FILE_VERSION,
      id: parsed.id,
      name: parsed.name,
      base: parsed.base,
      theme: parsed.theme,
      assets,
      background,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date(0).toISOString(),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    }
  } catch {
    return null
  }
}

/**
 * Write one document where a reader either sees the previous file or the next
 * one — never a half-written one: the bytes land in a sibling temp file that is
 * renamed over the target.
 */
async function writeDocument(doc: ThemeDocument): Promise<void> {
  const dir = themeDir(doc.id)
  await mkdir(dir, { recursive: true })
  const temp = join(dir, `${DOCUMENT_NAME}.tmp`)
  await writeFile(temp, `${JSON.stringify(doc, null, 2)}\n`, 'utf8')
  await rename(temp, documentPath(doc.id))
}

/** Every stored theme, oldest by creation time first; unreadable directories are skipped. */
export async function listThemes(): Promise<ThemeDocument[]> {
  let entries: string[]
  try {
    entries = await readdir(themesRoot())
  } catch {
    return []
  }
  const documents: ThemeDocument[] = []
  for (const id of entries) {
    if (!isThemeId(id)) continue
    const doc = await readDocument(id)
    if (doc !== null) documents.push(doc)
  }
  // Creation time, oldest first: a rename or an edit must not move a theme, so
  // only a brand-new one changes the list, and it lands at the bottom. Ties
  // keep their directory order.
  documents.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
  return documents
}

/**
 * Insert or replace one document. `createdAt` is the caller's when the theme is
 * new and the stored value when it already exists, so a later rename or edit
 * cannot rewrite when the theme was made.
 *
 * Media files are pruned here rather than by the caller: a theme's background
 * references at most one asset per appearance, so the save that commits a new
 * image is also the save that can drop the file it replaced.
 */
export async function putTheme(input: {
  id: string
  name: string
  base: string
  theme: unknown
  /** Wire value from the client; repaired against the stored assets below. */
  background?: unknown
}): Promise<ThemeDocument> {
  const existing = await readDocument(input.id)
  const now = new Date().toISOString()
  // Scan before pruning: a just-uploaded file is already on disk, and the list
  // written into the document has to include it.
  const assets = await listAssets(input.id)
  const background = backgroundForAssets(input.background, assets)
  const doc: ThemeDocument = {
    v: THEME_FILE_VERSION,
    id: input.id,
    name: input.name,
    base: input.base,
    theme: input.theme,
    assets,
    background,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await writeDocument(doc)
  // Both appearances may name a file, and a side with no image names none; what
  // the document does not reference is what this save drops.
  const keep = background
    ? THEME_APPEARANCES.map((appearance) => background[appearance].asset).filter((name) => name !== '')
    : []
  await pruneAssets(input.id, keep)
  return doc
}

/** Remove one theme directory. A missing directory is already the goal. */
export async function deleteTheme(id: string): Promise<void> {
  await rm(themeDir(id), { recursive: true, force: true })
}
