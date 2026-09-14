/**
 * Theme files owned by the Host.
 *
 * One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
 * document at `theme.json` and — once themes carry media — the originals under
 * `assets/`. Keeping a theme a self-contained directory is what makes the later
 * export a copy of that directory rather than a reassembly of scattered rows.
 */

import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { THEME_FILE_VERSION } from '../contract.js'
import type { ThemeAsset, ThemeDocument } from '../contract.js'

/** Directory name of the theme document inside one theme's own directory. */
const DOCUMENT_NAME = 'theme.json'

/** Media directory beside the document; unused until themes carry media. */
const ASSETS_DIR = 'assets'

/**
 * Theme ids become directory names, so they are restricted to a conservative
 * slug: anything else could escape or alias the themes root.
 */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isThemeId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value)
}

/**
 * The harness home, resolved the way the rest of DSH resolves it: an explicit
 * `DSH_HOME`, else `~/.dsh`.
 */
export function harnessHome(): string {
  const configured = process.env.DSH_HOME?.trim()
  return configured && configured !== '' ? configured : join(homedir(), '.dsh')
}

/** Root of every stored theme. */
export function themesRoot(): string {
  return join(harnessHome(), 'cool-theme', 'themes')
}

/** One theme's own directory. Callers must have validated `id`. */
export function themeDir(id: string): string {
  return join(themesRoot(), id)
}

function documentPath(id: string): string {
  return join(themeDir(id), DOCUMENT_NAME)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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
    const assets = Array.isArray(parsed.assets) ? parsed.assets.filter(isAsset) : []
    return {
      v: typeof parsed.v === 'number' ? parsed.v : THEME_FILE_VERSION,
      id: parsed.id,
      name: parsed.name,
      base: parsed.base,
      theme: parsed.theme,
      assets,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date(0).toISOString(),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    }
  } catch {
    return null
  }
}

function isAsset(value: unknown): value is ThemeAsset {
  if (!isRecord(value)) return false
  return typeof value.name === 'string'
    && (value.kind === 'image' || value.kind === 'video')
    && typeof value.mime === 'string'
    && typeof value.bytes === 'number'
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

/** Every stored theme, newest first; unreadable directories are skipped. */
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
  documents.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
  return documents
}

/**
 * Insert or replace one document. `createdAt` is the caller's when the theme is
 * new and the stored value when it already exists, so a later rename or edit
 * cannot rewrite when the theme was made.
 */
export async function putTheme(input: {
  id: string
  name: string
  base: string
  theme: unknown
  assets: ThemeAsset[]
}): Promise<ThemeDocument> {
  const existing = await readDocument(input.id)
  const now = new Date().toISOString()
  const doc: ThemeDocument = {
    v: THEME_FILE_VERSION,
    id: input.id,
    name: input.name,
    base: input.base,
    theme: input.theme,
    assets: input.assets,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await writeDocument(doc)
  return doc
}

/** Remove one theme directory. A missing directory is already the goal. */
export async function deleteTheme(id: string): Promise<void> {
  await rm(themeDir(id), { recursive: true, force: true })
}

/** Absolute path of a theme's media directory; used once themes carry media. */
export function assetsDir(id: string): string {
  return join(themeDir(id), ASSETS_DIR)
}
