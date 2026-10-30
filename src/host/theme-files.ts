/**
 * Theme files owned by the Host.
 *
 * One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
 * document at `theme.json`, the optional stylesheet at `theme.css`, and the
 * theme's media under `assets/`. Keeping a theme a self-contained directory is
 * what makes the export a copy of that directory rather than a reassembly of
 * scattered rows.
 *
 * The directory is the source of truth for media: `readDocument` rebuilds the
 * asset list by scanning `assets/` instead of trusting the JSON, so a document
 * can never describe files that are not there. A background is kept only while
 * the file it names is still on disk.
 *
 * The stylesheet is not a media asset: `assets.ts` ignores it, and the document
 * only records whether it may apply. Its text is read and written on demand so
 * the roster stays small.
 */

import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, sep } from 'node:path'
import {
  THEME_APPEARANCES,
  THEME_CSS_MAX_BYTES,
  THEME_CSS_NAME,
  THEME_FILE_VERSION,
  backgroundForAssets,
  isRecord,
} from '../contract.js'
import type { ThemeCssInfo, ThemeDocument } from '../contract.js'
import { listAssets, pruneAssets } from './assets.js'
import { DOCUMENT_NAME, cssPath, isThemeId, themeDir, themesRoot } from './paths.js'

export { DOCUMENT_NAME, assetsDir, cssPath, harnessHome, isThemeId, themeDir, themesRoot } from './paths.js'

/** Timestamp a document written without one reads as: the epoch, in ISO form. */
const EPOCH_ISO = new Date(0).toISOString()

/** A stylesheet refused for exceeding {@link THEME_CSS_MAX_BYTES}. */
export class CssTooLargeError extends Error {}

function documentPath(id: string): string {
  return join(themeDir(id), DOCUMENT_NAME)
}

/**
 * The stylesheet path as the panel shows it: the user's home directory folded
 * to `~` where possible, otherwise the absolute path. Copying the absolute
 * path is the panel's fallback when the native open action is unavailable.
 */
function displayPath(id: string): string {
  const file = cssPath(id)
  const home = homedir()
  return file === home || file.startsWith(`${home}${sep}`) ? `~${file.slice(home.length)}` : file
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
      // A document written before v5 has no flag and no CSS file, so `false`
      // keeps the switch off until the user opts in.
      cssEnabled: parsed.cssEnabled === true,
      assets,
      background,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : EPOCH_ISO,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : EPOCH_ISO,
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
 * file is also the save that can drop the one it replaced.
 */
export async function putTheme(input: {
  id: string
  name: string
  base: string
  theme: unknown
  /** Wire value from the client; repaired against the stored assets below. */
  background?: unknown
  /**
   * Stylesheet trust flag. It is used only when the theme is new: the CSS route
   * owns the flag on an existing theme, and a roster save must not clobber it.
   * A new theme starts off; the import path passes false explicitly.
   */
  cssEnabled?: boolean
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
    cssEnabled: existing?.cssEnabled ?? (input.cssEnabled === true),
    assets,
    background,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await writeDocument(doc)
  // Both appearances may name a file, and a side with no media names none; what
  // the document does not reference is what this save drops.
  const keep = background
    ? THEME_APPEARANCES.map((appearance) => background[appearance].asset).filter((name) => name !== '')
    : []
  await pruneAssets(input.id, keep)
  return doc
}

/**
 * One theme's stylesheet metadata, plus its text when it is small enough to
 * apply. A missing file is `css: null` with `bytes: 0`; a file over the cap is
 * `css: null` with `tooLarge: true` and its real size, so the panel can still
 * offer to open and trim it.
 */
export async function readThemeCss(id: string): Promise<Omit<ThemeCssInfo, 'canOpen'>> {
  const doc = await readDocument(id)
  if (doc === null) throw new Error('unknown theme')
  const file = cssPath(id)
  const describe = (
    css: string | null,
    bytes: number,
    updatedAt: string | null,
    tooLarge: boolean,
  ): Omit<ThemeCssInfo, 'canOpen'> => ({
    css,
    enabled: doc.cssEnabled,
    path: displayPath(id),
    absolutePath: file,
    bytes,
    updatedAt,
    tooLarge,
  })
  let info
  try {
    info = await stat(file)
  } catch {
    return describe(null, 0, null, false)
  }
  if (!info.isFile()) return describe(null, 0, null, false)
  const updatedAt = info.mtime.toISOString()
  if (info.size > THEME_CSS_MAX_BYTES) return describe(null, info.size, updatedAt, true)
  const css = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
  return describe(css, info.size, updatedAt, false)
}

/** Whether one theme's stylesheet is on disk. Used by the native-open route. */
export async function themeCssExists(id: string): Promise<boolean> {
  try {
    const info = await stat(cssPath(id))
    return info.isFile()
  } catch {
    return false
  }
}

/**
 * Write one stylesheet with the same temp-and-rename pattern as the document,
 * so a reader never sees a half-written file. Returns its UTF-8 byte length.
 */
export async function writeThemeCss(id: string, css: string): Promise<number> {
  const text = css.replace(/^\uFEFF/, '')
  const bytes = Buffer.byteLength(text, 'utf8')
  if (bytes > THEME_CSS_MAX_BYTES) {
    throw new CssTooLargeError(`custom CSS is larger than ${String(THEME_CSS_MAX_BYTES)} bytes`)
  }
  const dir = themeDir(id)
  await mkdir(dir, { recursive: true })
  const temp = join(dir, `.${THEME_CSS_NAME}.${String(process.pid)}.${String(Date.now())}.tmp`)
  await writeFile(temp, text, 'utf8')
  await rename(temp, cssPath(id))
  return bytes
}

/**
 * Remove the stylesheet and turn the flag off, so a theme with no file cannot
 * be left "enabled" in the roster. A missing file is already the goal.
 */
export async function deleteThemeCss(id: string): Promise<void> {
  await rm(cssPath(id), { force: true })
  await setThemeCssEnabled(id, false)
}

/**
 * The stylesheet trust switch. It is deliberately its own write path: the panel
 * toggles it without touching the card's draft, and a later roster save keeps
 * the stored value instead of overwriting it.
 */
export async function setThemeCssEnabled(id: string, enabled: boolean): Promise<void> {
  const doc = await readDocument(id)
  if (doc === null) throw new Error('unknown theme')
  doc.cssEnabled = enabled
  // Stamp the current format; a v4 document that gains the flag is v5 now.
  doc.v = THEME_FILE_VERSION
  doc.updatedAt = new Date().toISOString()
  await writeDocument(doc)
}

/** Remove one theme directory. A missing directory is already the goal. */
export async function deleteTheme(id: string): Promise<void> {
  await rm(themeDir(id), { recursive: true, force: true })
}
