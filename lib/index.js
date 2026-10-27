import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { deflateRawSync, inflateRawSync } from "node:zlib";
//#region src/contract.ts
/** A plain JSON object: not null, not an array, and not a primitive. */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
* A fresh theme id. Both halves mint ids in the same shape, so an id never says
* which half created it; the Host is the side that validates the pattern.
*/
function newThemeId() {
	return `ct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
/** The two appearances, in the order the editor reads them. */
const THEME_APPEARANCES = ["light", "dark"];
/**
* Where a fresh image starts, per appearance: visible enough to read, calm
* enough for text. Dark starts lower because a bright wallpaper over a dark
* palette is harsher than the same image over the light one, and the panel
* colour has to win more of the mix.
*/
const THEME_BACKGROUND_DEFAULT_OPACITY = {
	light: 40,
	dark: 30
};
/** A fresh image is sharp in both appearances. */
const THEME_BACKGROUND_DEFAULT_BLUR = {
	light: 0,
	dark: 0
};
/**
* How much a background written before the split dims in dark mode. Only
* {@link legacyDarkOpacity} reads it: a current background stores its dark
* opacity outright, so nothing derives it any more.
*/
const THEME_BACKGROUND_LEGACY_DARK_FACTOR = .7;
/** Fold an opacity into the 0–100 percentage a background stores. */
function clampBackgroundOpacity(value) {
	return Math.max(0, Math.min(100, Math.round(value)));
}
/** Fold a blur radius into the 0–{@link THEME_BACKGROUND_MAX_BLUR} px a background stores. */
function clampBackgroundBlur(value) {
	return Math.max(0, Math.min(24, Math.round(value)));
}
/**
* The dark opacity a pre-split background paints: its light value dimmed by
* {@link THEME_BACKGROUND_LEGACY_DARK_FACTOR}. Migration-only, so an existing
* wallpaper keeps the exact look it had rather than jumping to a new default.
*/
function legacyDarkOpacity(lightOpacity) {
	return clampBackgroundOpacity(clampBackgroundOpacity(lightOpacity) * THEME_BACKGROUND_LEGACY_DARK_FACTOR);
}
/**
* A side with no media yet, carrying the defaults for its own appearance. This
* is where every "add an image" gesture starts: the picker fills `asset` in
* later, and until it does the side simply paints nothing.
*/
function emptyBackgroundSide(appearance) {
	return {
		asset: "",
		opacity: THEME_BACKGROUND_DEFAULT_OPACITY[appearance],
		blur: THEME_BACKGROUND_DEFAULT_BLUR[appearance],
		enabled: true
	};
}
/** Whether either side names media; a background with none is no background. */
function backgroundHasAsset(background) {
	return background.light.asset !== "" || background.dark.asset !== "";
}
/**
* Bytes one uploaded image may occupy. A large image is re-encoded until it
* fits this cap, so it is deliberately smaller than the archive entry cap: an
* image that reaches the roster must also survive an export.
*/
const THEME_IMAGE_MAX_BYTES = 4194304;
/**
* Bytes one uploaded background video may occupy.
*
* A video cannot be re-encoded in the browser the way an image is, so this cap
* is much larger: a clip small enough for the image cap would be a few seconds
* at a low resolution. It is also the largest single asset the Host stores, so
* the upload route and the archive reader bound themselves by this value.
*/
const THEME_VIDEO_MAX_BYTES = 33554432;
/** Largest single asset of any kind; the upload route's body cap. */
const THEME_ASSET_MAX_BYTES = Math.max(THEME_IMAGE_MAX_BYTES, THEME_VIDEO_MAX_BYTES);
/**
* Accepted media extensions and the type each is served with. Shared by the
* upload route, the archive reader/writer and the asset directory scanner, so
* one table answers "what may a theme carry" everywhere.
*
* MP4 and WebM are the two containers a Chromium `<video>` plays without a
* plugin; anything else a user picks is refused rather than stored and then
* found unplayable.
*/
const THEME_ASSET_TYPES = {
	".png": {
		kind: "image",
		mime: "image/png"
	},
	".jpg": {
		kind: "image",
		mime: "image/jpeg"
	},
	".jpeg": {
		kind: "image",
		mime: "image/jpeg"
	},
	".webp": {
		kind: "image",
		mime: "image/webp"
	},
	".gif": {
		kind: "image",
		mime: "image/gif"
	},
	".avif": {
		kind: "image",
		mime: "image/avif"
	},
	".mp4": {
		kind: "video",
		mime: "video/mp4"
	},
	".webm": {
		kind: "video",
		mime: "video/webm"
	}
};
/** The type of a file name, or null when a theme may not carry it. */
function assetTypeOf(name) {
	const dot = name.lastIndexOf(".");
	if (dot < 0) return null;
	return THEME_ASSET_TYPES[name.slice(dot).toLowerCase()] ?? null;
}
/**
* Asset names become path segments, so they are restricted the way theme ids
* are: one conservative name, no separators, no leading dot. A content-hashed
* name (`bg-<hash>.webp`) is what the Host writes, but an imported archive may
* carry any name that passes this check.
*/
const ASSET_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
function isThemeAssetName(value) {
	return typeof value === "string" && ASSET_NAME_PATTERN.test(value);
}
/**
* One appearance-tagged background value, from a pre-v3 document.
*
* A document written before the split stores one flat number for both
* appearances; it is the light value, and `deriveDark` reproduces the dark
* value that build painted from it, so an existing wallpaper keeps the exact
* look it had. The pair form is read as stored: each half falls back to its own
* default only when it is missing or not a real number (`Number(null)` is 0,
* which would turn a malformed document into an invisible image).
*/
function readAppearancePair(raw, clamp, fallback, deriveDark) {
	const read = (value) => typeof value === "number" && Number.isFinite(value) ? clamp(value) : null;
	if (typeof raw === "number") {
		const light = read(raw);
		return light === null ? { ...fallback } : {
			light,
			dark: clamp(deriveDark(light))
		};
	}
	if (isRecord(raw)) return {
		light: read(raw.light) ?? fallback.light,
		dark: read(raw.dark) ?? fallback.dark
	};
	return { ...fallback };
}
/** A stored asset name that this build would accept, or '' when it is unusable. */
function readAssetName(raw) {
	return isThemeAssetName(raw) && assetTypeOf(raw) ? raw : "";
}
/** One finite number, clamped; null when it is missing or not a real number. */
function readNumber(raw, clamp) {
	return typeof raw === "number" && Number.isFinite(raw) ? clamp(raw) : null;
}
/**
* One appearance's side, read from the v3 shape. A side that names no usable
* file is still returned: that is "this appearance has no image", not a
* malformed document, and the other side must not be lost with it.
*/
function readBackgroundSide(raw, appearance) {
	const fallback = emptyBackgroundSide(appearance);
	if (!isRecord(raw)) return fallback;
	return {
		asset: readAssetName(raw.asset),
		opacity: readNumber(raw.opacity, clampBackgroundOpacity) ?? fallback.opacity,
		blur: readNumber(raw.blur, clampBackgroundBlur) ?? fallback.blur,
		enabled: raw.enabled !== false
	};
}
/**
* A pre-v3 document's two sides: it stored one asset shared by both
* appearances, so repeating it reproduces exactly what that build painted —
* each appearance keeping the opacity and blur it already had.
*/
function readSharedBackground(raw) {
	const asset = readAssetName(raw.asset);
	const opacity = readAppearancePair(raw.opacity, clampBackgroundOpacity, THEME_BACKGROUND_DEFAULT_OPACITY, legacyDarkOpacity);
	const blur = readAppearancePair(raw.blur, clampBackgroundBlur, THEME_BACKGROUND_DEFAULT_BLUR, (light) => light);
	const enabled = raw.enabled !== false;
	return {
		light: {
			asset,
			opacity: opacity.light,
			blur: blur.light,
			enabled
		},
		dark: {
			asset,
			opacity: opacity.dark,
			blur: blur.dark,
			enabled
		}
	};
}
/**
* Fold any stored or posted background into this build's shape, or drop it.
*
* Both document generations read here: a v3 background carries its two sides
* outright, while v1/v2 stored one asset with a shared or per-appearance
* opacity/blur. A background that names media on neither side is no
* background, which keeps `null` the one "no wallpaper" value downstream.
*/
function normalizeBackground(raw) {
	if (!isRecord(raw)) return null;
	const background = isRecord(raw.light) || isRecord(raw.dark) ? {
		light: readBackgroundSide(raw.light, "light"),
		dark: readBackgroundSide(raw.dark, "dark")
	} : readSharedBackground(raw);
	return backgroundHasAsset(background) ? background : null;
}
/**
* The background a theme may keep: `raw` normalized, but with each side kept
* only while the file it names is actually stored beside the theme. A side that
* points at a missing file is emptied rather than rendering a broken
* wallpaper, and a background with no media left on either side is dropped.
*/
function backgroundForAssets(raw, assets) {
	const background = normalizeBackground(raw);
	if (background === null) return null;
	const stored = new Set(assets.map((asset) => asset.name));
	const keep = (side) => side.asset === "" || stored.has(side.asset) ? side : {
		...side,
		asset: "",
		enabled: false
	};
	const next = {
		light: keep(background.light),
		dark: keep(background.dark)
	};
	return backgroundHasAsset(next) ? next : null;
}
/**
* The Host's theme-file API, all below one prefix route. Kept here so the two
* halves cannot drift on a path.
*/
const THEME_API_PREFIX = "/cool-theme/api";
const THEME_API_PATH_THEMES = `${THEME_API_PREFIX}/themes`;
/**
* Share archive: one theme directory zipped. The document keeps the name it has
* on disk, so an archive is a copy of the directory rather than a new format,
* and media added later travels with it under {@link THEME_ARCHIVE_ASSETS_DIR}.
*/
const THEME_ARCHIVE_DOCUMENT = "theme.json";
const THEME_ARCHIVE_ASSETS_DIR = "assets";
/** Content type of an exported archive, and the extension a name gets. */
const THEME_ARCHIVE_MIME = "application/zip";
const THEME_ARCHIVE_EXTENSION = ".zip";
/**
* Import bounds. A theme is a small JSON document plus its media, so anything
* past these caps is refused before it is parsed rather than after it has been
* held in memory. The entry cap follows the largest asset the upload route
* accepts, and the archive cap leaves room for one video per appearance.
*/
const THEME_ARCHIVE_MAX_BYTES = 100663296;
/** Cap on one uncompressed entry, so a zip bomb cannot expand without bound. */
const THEME_ARCHIVE_MAX_ENTRY_BYTES = THEME_VIDEO_MAX_BYTES;
const THEME_API_PATH_IMPORT = `${THEME_API_PATH_THEMES}/import`;
/**
* Name the Host suggests for a downloaded archive. The archive keeps the
* theme's name so a user can tell two exports apart, with the characters a
* filesystem refuses folded to spaces; the id is the fallback for a name that
* folds away to nothing.
*/
function archiveFileName(name, id) {
	const folded = name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 64);
	const base = folded === "" ? id : folded;
	return base.endsWith(".zip") ? base : `${base}${THEME_ARCHIVE_EXTENSION}`;
}
/**
* `base`, else `${base} 2`, `${base} 3`, … An imported theme keeps the name it
* was shared under — that name is the point of the share — so a clash is
* resolved by numbering rather than by renaming the incoming theme. The Host
* owns this because it owns the roster the names have to be free in.
*/
function freeThemeName(base, taken) {
	const name = base.trim() === "" ? "theme" : base.trim();
	const used = new Set(taken.map((entry) => entry.trim()));
	if (!used.has(name)) return name;
	for (let n = 2;; n += 1) {
		const candidate = `${name} ${n}`;
		if (!used.has(candidate)) return candidate;
	}
}
//#endregion
//#region src/presets-ids.ts
/**
* The preset ids, in one place both halves can read.
*
* `presets.ts` carries the colour maps and is client-only; the Host needs the
* same id vocabulary to tell an archive that derives from a preset we ship from
* one that does not, so the names live here and that file checks itself against
* them.
*/
const PRESET_IDS = [
	"aura",
	"ayu",
	"catppuccin",
	"catppuccin-frappe",
	"catppuccin-macchiato",
	"cobalt2",
	"cursor",
	"dracula",
	"dsh",
	"everforest",
	"flexoki",
	"github",
	"gruvbox",
	"kanagawa",
	"lucent-orng",
	"material",
	"matrix",
	"mercury",
	"monokai",
	"nightowl",
	"nord",
	"onedark",
	"opencode",
	"orng",
	"osaka-jade",
	"palenight",
	"rosepine",
	"solarized",
	"synthwave84",
	"system",
	"tokyonight",
	"vercel",
	"vesper",
	"zenburn"
];
/**
* Whether a theme may name `base` and still be resolved here. `native` is the
* legacy alias for `dsh`, so a theme that carries it stays usable.
*/
function isKnownBase(value) {
	return value === "native" || PRESET_IDS.includes(value);
}
//#endregion
//#region src/host/paths.ts
/**
* Where a theme lives on disk.
*
* Split out of `theme-files.ts` so the asset store can resolve a theme's
* `assets/` directory without importing the document store — the document store
* imports the asset store, and a cycle between the two would make every bundle
* order-sensitive for no gain.
*/
/**
* Theme ids become directory names, so they are restricted to a conservative
* slug: anything else could escape or alias the themes root.
*/
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
function isThemeId(value) {
	return typeof value === "string" && ID_PATTERN.test(value);
}
/**
* The harness home, resolved the way the rest of DSH resolves it: an explicit
* `DSH_HOME`, else `~/.dsh`.
*/
function harnessHome() {
	const configured = process.env.DSH_HOME?.trim();
	return configured ? configured : join(homedir(), ".dsh");
}
/** Root of every stored theme. */
function themesRoot() {
	return join(harnessHome(), "cool-theme", "themes");
}
/** One theme's own directory. Callers must have validated `id`. */
function themeDir(id) {
	return join(themesRoot(), id);
}
/** File name of the theme document inside one theme's own directory. */
const DOCUMENT_NAME = "theme.json";
/** Media directory beside the document. */
const ASSETS_DIR = "assets";
/** Absolute path of a theme's media directory. */
function assetsDir(id) {
	return join(themeDir(id), ASSETS_DIR);
}
//#endregion
//#region src/host/assets.ts
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
/** A refused asset, with a reason worth showing the user. */
var AssetError = class extends Error {};
const PNG_SIGNATURE = Buffer.from([
	137,
	80,
	78,
	71,
	13,
	10,
	26,
	10
]);
/**
* ISO base media brands a browser will play as MP4. The brand list is what
* distinguishes a video from the still-image members of the same container
* (AVIF/HEIC), which share the `ftyp` box.
*/
const MP4_VIDEO_BRANDS = /* @__PURE__ */ new Set([
	"isom",
	"iso2",
	"iso4",
	"iso5",
	"iso6",
	"mp41",
	"mp42",
	"avc1",
	"av01",
	"vp09",
	"dash",
	"M4V ",
	"MSNV"
]);
/**
* The media type of a byte string, read from its magic number rather than from
* a file name or an upload header. Null means "this plugin will not store it".
*/
function sniffMedia(bytes) {
	if (bytes.length < 12) return null;
	if (bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return {
		ext: ".png",
		mime: "image/png",
		kind: "image"
	};
	if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return {
		ext: ".jpg",
		mime: "image/jpeg",
		kind: "image"
	};
	const head = bytes.toString("ascii", 0, 6);
	if (head === "GIF87a" || head === "GIF89a") return {
		ext: ".gif",
		mime: "image/gif",
		kind: "image"
	};
	if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return {
		ext: ".webp",
		mime: "image/webp",
		kind: "image"
	};
	if (bytes.toString("ascii", 4, 8) === "ftyp") {
		const brand = bytes.toString("ascii", 8, 12);
		if (brand === "avif" || brand === "avis") return {
			ext: ".avif",
			mime: "image/avif",
			kind: "image"
		};
		if (MP4_VIDEO_BRANDS.has(brand)) return {
			ext: ".mp4",
			mime: "video/mp4",
			kind: "video"
		};
	}
	if (bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163) {
		if (bytes.toString("ascii", 0, Math.min(bytes.length, 64)).includes("webm")) return {
			ext: ".webm",
			mime: "video/webm",
			kind: "video"
		};
	}
	return null;
}
function mediaPath(id, name) {
	return join(assetsDir(id), name);
}
/**
* Write one file where a reader sees either the previous bytes or the next
* ones, never a half-written file. The caller owns the name's validity.
*/
async function writeAssetFile(id, name, bytes) {
	if (!isThemeAssetName(name)) throw new AssetError("asset name must be a safe file name");
	const dir = assetsDir(id);
	await mkdir(dir, { recursive: true });
	const temp = join(dir, `.${name}.${process.pid}.${Date.now()}.tmp`);
	await writeFile(temp, bytes);
	await rename(temp, mediaPath(id, name));
}
/**
* Store one uploaded media file under a content-hashed name and return what the
* document should record. Hashing makes the read URL immutable: the same bytes
* always resolve to the same name, and different bytes never collide, so the
* browser can cache an asset for as long as it likes.
*/
async function saveMediaAsset(id, bytes) {
	const type = sniffMedia(bytes);
	if (type === null) throw new AssetError("unsupported media format; use PNG, JPEG, WebP, AVIF, GIF, MP4 or WebM");
	const name = `bg-${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}${type.ext}`;
	await writeAssetFile(id, name, bytes);
	return {
		name,
		kind: type.kind,
		mime: type.mime,
		bytes: bytes.byteLength
	};
}
/** Every media file a theme actually stores, with its size on disk. */
async function listAssets(id) {
	let names;
	try {
		names = await readdir(assetsDir(id));
	} catch {
		return [];
	}
	const assets = [];
	for (const name of names.sort()) {
		const type = assetTypeOf(name);
		if (type === null || name.startsWith(".")) continue;
		try {
			const info = await stat(mediaPath(id, name));
			if (!info.isFile()) continue;
			assets.push({
				name,
				kind: type.kind,
				mime: type.mime,
				bytes: info.size
			});
		} catch {}
	}
	return assets;
}
/** One stored asset's bytes and type, or null when it is missing. */
async function readAsset(id, name) {
	const type = assetTypeOf(name);
	if (type === null || !isThemeAssetName(name)) return null;
	try {
		return {
			bytes: await readFile(mediaPath(id, name)),
			mime: type.mime,
			kind: type.kind
		};
	} catch {
		return null;
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
async function pruneAssets(id, keep) {
	const keepSet = new Set(keep);
	let names;
	try {
		names = await readdir(assetsDir(id));
	} catch {
		return;
	}
	for (const name of names) {
		if (keepSet.has(name) || assetTypeOf(name) === null) continue;
		try {
			await rm(mediaPath(id, name), { force: true });
		} catch {}
	}
}
//#endregion
//#region src/host/theme-files.ts
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
function documentPath(id) {
	return join(themeDir(id), DOCUMENT_NAME);
}
/** Whether a theme directory already holds a readable document. */
async function themeExists(id) {
	try {
		return (await stat(documentPath(id))).isFile();
	} catch {
		return false;
	}
}
/**
* Read one document back into the shape this plugin writes. Returns null when
* the file is missing or unusable; a corrupt theme must not take the roster
* down with it, so the caller skips it and keeps the rest.
*/
async function readDocument(id) {
	let raw;
	try {
		raw = await readFile(documentPath(id), "utf8");
	} catch {
		return null;
	}
	try {
		const parsed = JSON.parse(raw);
		if (!isRecord(parsed)) return null;
		if (!isThemeId(parsed.id) || parsed.id !== id) return null;
		if (typeof parsed.name !== "string" || typeof parsed.base !== "string") return null;
		const assets = await listAssets(id);
		const background = backgroundForAssets(parsed.background, assets);
		return {
			v: typeof parsed.v === "number" ? parsed.v : 4,
			id: parsed.id,
			name: parsed.name,
			base: parsed.base,
			theme: parsed.theme,
			assets,
			background,
			createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : (/* @__PURE__ */ new Date(0)).toISOString(),
			updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : (/* @__PURE__ */ new Date(0)).toISOString()
		};
	} catch {
		return null;
	}
}
/**
* Write one document where a reader either sees the previous file or the next
* one — never a half-written one: the bytes land in a sibling temp file that is
* renamed over the target.
*/
async function writeDocument(doc) {
	const dir = themeDir(doc.id);
	await mkdir(dir, { recursive: true });
	const temp = join(dir, `${DOCUMENT_NAME}.tmp`);
	await writeFile(temp, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
	await rename(temp, documentPath(doc.id));
}
/** Every stored theme, oldest by creation time first; unreadable directories are skipped. */
async function listThemes() {
	let entries;
	try {
		entries = await readdir(themesRoot());
	} catch {
		return [];
	}
	const documents = [];
	for (const id of entries) {
		if (!isThemeId(id)) continue;
		const doc = await readDocument(id);
		if (doc !== null) documents.push(doc);
	}
	documents.sort((a, b) => a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);
	return documents;
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
async function putTheme(input) {
	const existing = await readDocument(input.id);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const assets = await listAssets(input.id);
	const background = backgroundForAssets(input.background, assets);
	const doc = {
		v: 4,
		id: input.id,
		name: input.name,
		base: input.base,
		theme: input.theme,
		assets,
		background,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now
	};
	await writeDocument(doc);
	const keep = background ? THEME_APPEARANCES.map((appearance) => background[appearance].asset).filter((name) => name !== "") : [];
	await pruneAssets(input.id, keep);
	return doc;
}
/** Remove one theme directory. A missing directory is already the goal. */
async function deleteTheme(id) {
	await rm(themeDir(id), {
		recursive: true,
		force: true
	});
}
//#endregion
//#region src/host/zip.ts
/**
* The little of ZIP that sharing a theme needs.
*
* A theme is one small JSON document plus whatever media sits beside it, so the
* archive format is worth exactly this much: a writer that emits stored/deflated
* entries with a central directory, and a reader that walks that directory back.
* Node owns the compression (`zlib.deflateRawSync` / `inflateRawSync`); the
* CRC-32 and the record layout are all that has to be written here, which keeps
* the plugin dependency-free.
*
* Reading is strict: every entry's CRC is verified and the bytes it may inflate
* are capped, so a corrupt or oversized archive is refused rather than becoming
* a half-parsed theme.
*
* Deliberately unsupported, because nothing this plugin writes ever produces
* them: zip64, encrypted entries, multi-disk archives, and data descriptors.
*/
/** Local file header. */
const SIG_LOCAL = 67324752;
/** Central directory file header. */
const SIG_CENTRAL = 33639248;
/** End of central directory. */
const SIG_EOCD = 101010256;
/** What a reader must find at the start of every entry this writer emits. */
const FLAG_UTF8 = 2048;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
/** zip64 escape markers; anything carrying one is refused rather than misread. */
const ZIP64_LIMIT = 4294967295;
const ZIP64_ENTRIES = 65535;
const U32_LIMIT = 4294967295;
const CRC_TABLE = (() => {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let i = 0; i < 256; i += 1) {
		let value = i;
		for (let bit = 0; bit < 8; bit += 1) value = (value & 1) === 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
		table[i] = value >>> 0;
	}
	return table;
})();
/** CRC-32 of one entry, as the archive records it. */
function crc32(data) {
	let crc = 4294967295;
	for (let i = 0; i < data.length; i += 1) crc = CRC_TABLE[(crc ^ data[i]) & 255] ^ crc >>> 8;
	return (crc ^ 4294967295) >>> 0;
}
/**
* Pack entries into one archive. Directory entries are not emitted: every
* consumer this format targets infers them from the entry paths.
*/
function createZip(entries) {
	const locals = [];
	const centrals = [];
	let offset = 0;
	for (const entry of entries) {
		const name = Buffer.from(entry.name, "utf8");
		const raw = entry.data;
		if (raw.byteLength > U32_LIMIT) throw new Error(`entry too large to archive: ${entry.name}`);
		const deflated = entry.compress === false ? null : deflateRawSync(raw);
		const stored = deflated === null || deflated.byteLength >= raw.byteLength;
		const body = stored ? raw : deflated;
		const method = stored ? METHOD_STORE : METHOD_DEFLATE;
		const crc = crc32(raw);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(SIG_LOCAL, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(FLAG_UTF8, 6);
		local.writeUInt16LE(method, 8);
		local.writeUInt16LE(0, 10);
		local.writeUInt16LE(0, 12);
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(body.byteLength, 18);
		local.writeUInt32LE(raw.byteLength, 22);
		local.writeUInt16LE(name.byteLength, 26);
		local.writeUInt16LE(0, 28);
		locals.push(local, name, body);
		const central = Buffer.alloc(46);
		central.writeUInt32LE(SIG_CENTRAL, 0);
		central.writeUInt16LE(20, 4);
		central.writeUInt16LE(20, 6);
		central.writeUInt16LE(FLAG_UTF8, 8);
		central.writeUInt16LE(method, 10);
		central.writeUInt16LE(0, 12);
		central.writeUInt16LE(0, 14);
		central.writeUInt32LE(crc, 16);
		central.writeUInt32LE(body.byteLength, 20);
		central.writeUInt32LE(raw.byteLength, 24);
		central.writeUInt16LE(name.byteLength, 28);
		central.writeUInt16LE(0, 30);
		central.writeUInt16LE(0, 32);
		central.writeUInt16LE(0, 34);
		central.writeUInt16LE(0, 36);
		central.writeUInt32LE(0, 38);
		central.writeUInt32LE(offset, 42);
		centrals.push(central, name);
		offset += local.byteLength + name.byteLength + body.byteLength;
	}
	const centralBuffer = Buffer.concat(centrals);
	if (entries.length > ZIP64_ENTRIES || offset > U32_LIMIT || centralBuffer.byteLength > U32_LIMIT) throw new Error("archive too large for the supported zip flavour");
	const end = Buffer.alloc(22);
	end.writeUInt32LE(SIG_EOCD, 0);
	end.writeUInt16LE(0, 4);
	end.writeUInt16LE(0, 6);
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(centralBuffer.byteLength, 12);
	end.writeUInt32LE(offset, 16);
	end.writeUInt16LE(0, 20);
	return Buffer.concat([
		...locals,
		centralBuffer,
		end
	]);
}
function findEndOfCentralDirectory(input) {
	const earliest = Math.max(0, input.length - 22 - 65535);
	for (let at = input.length - 22; at >= earliest; at -= 1) if (input.readUInt32LE(at) === SIG_EOCD) return at;
	return -1;
}
/**
* Entry bytes from one archive, with `filter` deciding which entries are worth
* inflating. Throws on anything this writer would not have produced, so a file
* that is not one of our archives fails as "unreadable" rather than as a
* half-parsed theme.
*/
function readZip(input, options = {}) {
	const { filter, maxEntryBytes } = options;
	const end = findEndOfCentralDirectory(input);
	if (end < 0) throw new Error("not a zip archive");
	const count = input.readUInt16LE(end + 10);
	const centralSize = input.readUInt32LE(end + 12);
	const centralOffset = input.readUInt32LE(end + 16);
	if (count === ZIP64_ENTRIES || centralOffset === ZIP64_LIMIT || centralSize === ZIP64_LIMIT) throw new Error("zip64 archives are not supported");
	if (centralOffset + centralSize > input.length) throw new Error("zip central directory is out of range");
	const entries = [];
	let at = centralOffset;
	for (let index = 0; index < count; index += 1) {
		if (at + 46 > input.length || input.readUInt32LE(at) !== SIG_CENTRAL) throw new Error("zip central directory is malformed");
		const method = input.readUInt16LE(at + 10);
		const crc = input.readUInt32LE(at + 16);
		const compressedSize = input.readUInt32LE(at + 20);
		const uncompressedSize = input.readUInt32LE(at + 24);
		const nameLength = input.readUInt16LE(at + 28);
		const extraLength = input.readUInt16LE(at + 30);
		const commentLength = input.readUInt16LE(at + 32);
		const localOffset = input.readUInt32LE(at + 42);
		if (compressedSize === ZIP64_LIMIT || uncompressedSize === ZIP64_LIMIT || localOffset === ZIP64_LIMIT) throw new Error("zip64 archives are not supported");
		const name = input.toString("utf8", at + 46, at + 46 + nameLength);
		if (localOffset + 30 > input.length || input.readUInt32LE(localOffset) !== SIG_LOCAL) throw new Error("zip local header is malformed");
		const localNameLength = input.readUInt16LE(localOffset + 26);
		const localExtraLength = input.readUInt16LE(localOffset + 28);
		const dataStart = localOffset + 30 + localNameLength + localExtraLength;
		const dataEnd = dataStart + compressedSize;
		if (dataEnd > input.length) throw new Error("zip entry data is out of range");
		if (filter === void 0 || filter(name)) {
			if (maxEntryBytes !== void 0 && uncompressedSize > maxEntryBytes) throw new Error(`zip entry too large: ${name}`);
			const body = input.subarray(dataStart, dataEnd);
			const data = method === METHOD_STORE ? Buffer.from(body) : method === METHOD_DEFLATE ? inflateRawSync(body, maxEntryBytes === void 0 ? void 0 : { maxOutputLength: maxEntryBytes }) : null;
			if (data === null) throw new Error(`unsupported zip compression method ${String(method)}`);
			if (maxEntryBytes !== void 0 && data.byteLength > maxEntryBytes) throw new Error(`zip entry too large: ${name}`);
			if (crc32(data) !== crc) throw new Error(`zip entry checksum mismatch: ${name}`);
			entries.push({
				name,
				data
			});
		}
		at += 46 + nameLength + extraLength + commentLength;
	}
	return entries;
}
//#endregion
//#region src/host/theme-share.ts
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
/** A share refused for a reason worth showing the user. */
var ArchiveError = class extends Error {};
/**
* Pack one theme directory. A theme with no media still gets an archive holding
* its document alone, so sharing a plain theme needs no second code path.
*/
async function packTheme(id) {
	const raw = await readFile(join(themeDir(id), THEME_ARCHIVE_DOCUMENT), "utf8");
	const doc = JSON.parse(raw);
	const entries = [{
		name: THEME_ARCHIVE_DOCUMENT,
		data: Buffer.from(`${JSON.stringify(doc, null, 2)}\n`, "utf8")
	}];
	const assets = [];
	for (const asset of await listAssets(id)) {
		const bytes = await readFile(join(assetsDir(id), asset.name));
		entries.push({
			name: `${THEME_ARCHIVE_ASSETS_DIR}/${asset.name}`,
			data: bytes,
			compress: asset.kind !== "video"
		});
		assets.push({
			...asset,
			bytes: bytes.byteLength
		});
	}
	const background = backgroundForAssets(doc.background, assets);
	const packed = {
		id: doc.id,
		name: doc.name,
		base: doc.base,
		theme: doc.theme,
		assets,
		background
	};
	return {
		fileName: doc.name,
		bytes: createZip(entries),
		document: packed
	};
}
/**
* Read an archive back into a theme. Only the document and its media are
* accepted; every path is required to be exactly one of those two shapes, so a
* directory entry or a nested path is refused rather than normalised.
*/
function unpackTheme(archive) {
	let entries;
	try {
		entries = readZip(archive, {
			maxEntryBytes: THEME_ARCHIVE_MAX_ENTRY_BYTES,
			filter: (name) => name === "theme.json" || name.startsWith(`assets/`) && name.length > 7
		});
	} catch (error) {
		throw new ArchiveError(error instanceof Error ? error.message : String(error));
	}
	if (entries.length > 256) throw new ArchiveError("archive carries too many files");
	const documentEntry = entries.find((entry) => entry.name === THEME_ARCHIVE_DOCUMENT);
	if (!documentEntry) throw new ArchiveError(`archive is missing ${THEME_ARCHIVE_DOCUMENT}`);
	let parsed;
	try {
		parsed = JSON.parse(documentEntry.data.toString("utf8").replace(/^\uFEFF/, ""));
	} catch {
		throw new ArchiveError(`${THEME_ARCHIVE_DOCUMENT} is not valid JSON`);
	}
	if (!isRecord(parsed)) throw new ArchiveError(`${THEME_ARCHIVE_DOCUMENT} must be an object`);
	const version = typeof parsed.v === "number" ? parsed.v : 4;
	if (version > 4) throw new ArchiveError(`theme format v${String(version)} is newer than this plugin reads`);
	if (!isThemeId(parsed.id)) throw new ArchiveError("theme id must be a safe slug");
	if (typeof parsed.name !== "string" || parsed.name.trim() === "") throw new ArchiveError("theme name must be a non-empty string");
	if (typeof parsed.base !== "string") throw new ArchiveError("theme base must be a string");
	if (!isRecord(parsed.theme)) throw new ArchiveError("theme colours must be an object");
	const assets = [];
	for (const entry of entries) {
		if (entry.name === "theme.json") continue;
		const name = entry.name.slice(7);
		if (name.includes("/") || name.includes("\\") || name === "" || name.startsWith(".")) throw new ArchiveError(`archive contains an unusable media path: ${entry.name}`);
		const type = assetTypeOf(name);
		if (!type) throw new ArchiveError(`unsupported media type: ${name}`);
		assets.push({
			name,
			bytes: entry.data,
			kind: type.kind,
			mime: type.mime
		});
	}
	const background = backgroundForAssets(parsed.background, assets);
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
				bytes: asset.bytes.byteLength
			})),
			background
		},
		assets
	};
}
//#endregion
//#region src/host/index.ts
const name = "dsh-cool-theme";
const inject = ["webServer"];
/** Refuse cross-site callers: this API reads and writes the user's own files. */
function sameOrigin(req) {
	const origin = req.headers.origin;
	if (typeof origin !== "string" || origin === "" || origin === "null") return true;
	const host = req.headers.host;
	if (typeof host !== "string" || host === "") return false;
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}
function sendJson(res, status, body) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	});
	res.end(JSON.stringify(body));
}
/** Answer 405 unless the request uses one of the allowed methods. */
function methodAllowed(req, res, allowed) {
	const method = req.method ?? "GET";
	if (allowed.includes(method)) return true;
	res.writeHead(405, { allow: allowed.join(", ") });
	res.end();
	return false;
}
/** Read a bounded request body; a theme document is small by construction. */
async function readBody(req, limit = 1e6) {
	return (await readBuffer(req, limit)).toString("utf8");
}
/** Read a bounded binary body; the archive and media routes need the bytes themselves. */
async function readBuffer(req, limit) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buf = chunk;
		size += buf.byteLength;
		if (size > limit) throw new Error("request body too large");
		chunks.push(buf);
	}
	return Buffer.concat(chunks);
}
/** The roster, oldest first, as the browser half reads it. */
async function handleList(res) {
	sendJson(res, 200, {
		ok: true,
		themes: await listThemes()
	});
}
/**
* Upsert the posted documents. The browser half sends exactly the entries it
* changed, so one round trip covers save, rename and background change. Media
* bytes have their own route; this one only records which asset a theme uses.
*/
async function handlePut(req, res) {
	let payload;
	try {
		payload = JSON.parse(await readBody(req));
	} catch {
		sendJson(res, 400, {
			ok: false,
			error: "invalid JSON body"
		});
		return;
	}
	const incoming = isRecord(payload) && Array.isArray(payload.themes) ? payload.themes : null;
	if (incoming === null) {
		sendJson(res, 400, {
			ok: false,
			error: "expected { themes: [...] }"
		});
		return;
	}
	const saved = [];
	for (const raw of incoming) {
		if (!isRecord(raw) || !isThemeId(raw.id)) {
			sendJson(res, 400, {
				ok: false,
				error: "theme id must be a safe slug"
			});
			return;
		}
		if (typeof raw.name !== "string" || raw.name.trim() === "") {
			sendJson(res, 400, {
				ok: false,
				error: "theme name must be a non-empty string"
			});
			return;
		}
		if (typeof raw.base !== "string") {
			sendJson(res, 400, {
				ok: false,
				error: "theme base must be a string"
			});
			return;
		}
		saved.push(await putTheme({
			id: raw.id,
			name: raw.name,
			base: raw.base,
			theme: raw.theme,
			background: raw.background
		}));
	}
	sendJson(res, 200, {
		ok: true,
		themes: saved
	});
}
/** Delete one theme directory. */
async function handleDelete(res, id) {
	await deleteTheme(id);
	sendJson(res, 200, { ok: true });
}
/**
* Download one theme as an archive. The body is binary, so it is the only route
* here that does not answer JSON — and the only one that sets a filename.
*/
async function handleExport(res, id) {
	if (!await themeExists(id)) {
		sendJson(res, 404, {
			ok: false,
			error: "unknown theme"
		});
		return;
	}
	const packed = await packTheme(id);
	const name = archiveFileName(packed.fileName, id);
	res.writeHead(200, {
		"content-type": THEME_ARCHIVE_MIME,
		"content-length": packed.bytes.byteLength,
		"content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
		"cache-control": "no-store"
	});
	res.end(packed.bytes);
}
/**
* Accept one background image or video. The body is the media itself rather
* than JSON: base64 in a JSON string would inflate the file by a third and
* force the whole thing through a parser for no gain. The type comes from the
* bytes, never from the request.
*/
async function handleAssetUpload(req, res, id) {
	if (!await themeExists(id)) {
		sendJson(res, 404, {
			ok: false,
			error: "unknown theme"
		});
		return;
	}
	let bytes;
	try {
		bytes = await readBuffer(req, THEME_ASSET_MAX_BYTES);
	} catch (error) {
		sendJson(res, 413, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
		return;
	}
	try {
		sendJson(res, 200, {
			ok: true,
			asset: await saveMediaAsset(id, bytes)
		});
	} catch (error) {
		if (!(error instanceof AssetError)) throw error;
		sendJson(res, 400, {
			ok: false,
			error: error.message
		});
	}
}
/**
* One satisfiable byte range from a `Range` header. The caller distinguishes
* "no header" from "unusable range" before calling, so null here means the
* request cannot be answered as a partial response.
*/
function rangeOf(header, size) {
	if (size === 0) return null;
	const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
	if (!match) return null;
	const startRaw = match[1] ?? "";
	const endRaw = match[2] ?? "";
	if (startRaw === "" && endRaw === "") return null;
	let start;
	let end;
	if (startRaw === "") {
		const suffix = Number(endRaw);
		if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
		start = Math.max(0, size - suffix);
		end = size - 1;
	} else {
		start = Number(startRaw);
		end = endRaw === "" ? size - 1 : Math.min(Number(endRaw), size - 1);
		if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return null;
	}
	return {
		start,
		end
	};
}
/**
* Serve one stored asset. Names are content-hashed, so the response is
* immutable: the same URL always means the same bytes.
*
* Range requests are supported because a video is the one asset the browser may
* seek in; a plain 200 makes Chromium buffer the whole clip before it can loop
* cleanly. The handler still reads the file whole — an asset is bounded by
* {@link THEME_ASSET_MAX_BYTES} — and answers the requested slice.
*
* The CSP header makes the file inert if a browser ever navigates to it
* directly, and `nosniff` keeps a mislabelled file from being reinterpreted.
*/
async function handleAssetRead(req, res, id, name) {
	if (!isThemeAssetName(name)) {
		sendJson(res, 400, {
			ok: false,
			error: "asset name must be a safe file name"
		});
		return;
	}
	const asset = await readAsset(id, name);
	if (asset === null) {
		sendJson(res, 404, {
			ok: false,
			error: "unknown asset"
		});
		return;
	}
	const total = asset.bytes.byteLength;
	const headers = {
		"content-type": asset.mime,
		"accept-ranges": "bytes",
		"cache-control": "public, max-age=31536000, immutable",
		"x-content-type-options": "nosniff",
		"content-security-policy": "default-src 'none'"
	};
	const rangeHeader = req.headers.range;
	if (rangeHeader !== void 0) {
		const range = rangeOf(rangeHeader, total);
		if (range === null) {
			res.writeHead(416, {
				...headers,
				"content-range": `bytes */${String(total)}`
			});
			res.end();
			return;
		}
		const slice = asset.bytes.subarray(range.start, range.end + 1);
		res.writeHead(206, {
			...headers,
			"content-range": `bytes ${String(range.start)}-${String(range.end)}/${String(total)}`,
			"content-length": String(slice.byteLength)
		});
		res.end(req.method === "HEAD" ? void 0 : slice);
		return;
	}
	res.writeHead(200, {
		...headers,
		"content-length": String(total)
	});
	res.end(req.method === "HEAD" ? void 0 : asset.bytes);
}
/**
* Read an uploaded archive back into a theme and store it.
*
* The Host owns the whole import: it validates the archive, writes its media,
* names the theme and writes the document, so an import cannot half-happen in
* the client. The client only learns what was stored, which keeps the roster's
* own writes from having to grow a second path just for imports.
*/
async function handleImport(req, res) {
	let archive;
	try {
		archive = await readBuffer(req, THEME_ARCHIVE_MAX_BYTES);
	} catch (error) {
		sendJson(res, 413, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
		return;
	}
	let unpacked;
	try {
		unpacked = unpackTheme(archive);
	} catch (error) {
		if (!(error instanceof ArchiveError)) throw error;
		sendJson(res, 400, {
			ok: false,
			error: error.message
		});
		return;
	}
	const existing = await listThemes();
	const id = newThemeId();
	const taken = existing.map((doc) => doc.name);
	for (const asset of unpacked.assets) await writeAssetFile(id, asset.name, asset.bytes);
	sendJson(res, 200, {
		ok: true,
		theme: await putTheme({
			id,
			name: freeThemeName(unpacked.document.name, taken),
			base: isKnownBase(unpacked.document.base) ? unpacked.document.base : "dsh",
			theme: unpacked.document.theme,
			background: unpacked.document.background
		})
	});
}
/** Decode one path segment, treating a malformed escape as no match. */
function decodeSegment(segment) {
	try {
		return decodeURIComponent(segment);
	} catch {
		return null;
	}
}
function apply(ctx) {
	const route = (handler) => ctx.webServer.register({
		kind: "prefix",
		path: THEME_API_PREFIX,
		handler: (req, res) => {
			if (!sameOrigin(req)) {
				sendJson(res, 403, {
					ok: false,
					error: "cross-origin request refused"
				});
				return;
			}
			return handler(req, res);
		}
	});
	ctx.effect(() => {
		const dispose = route(async (req, res) => {
			const pathname = new URL(req.url ?? "/", "http://dsh.invalid").pathname;
			try {
				if (pathname === THEME_API_PATH_THEMES) {
					if (!methodAllowed(req, res, ["GET", "POST"])) return;
					if (req.method === "GET") return await handleList(res);
					return await handlePut(req, res);
				}
				if (pathname === THEME_API_PATH_IMPORT) {
					if (!methodAllowed(req, res, ["POST"])) return;
					return await handleImport(req, res);
				}
				const rest = pathname.startsWith(`${THEME_API_PATH_THEMES}/`) ? pathname.slice(THEME_API_PATH_THEMES.length + 1) : null;
				const parts = rest === null ? [] : rest.split("/");
				const id = parts.length > 0 ? decodeSegment(parts[0]) : null;
				if (id !== null && isThemeId(id)) {
					if (parts.length === 1) {
						if (!methodAllowed(req, res, ["DELETE"])) return;
						return await handleDelete(res, id);
					}
					if (parts.length === 2 && parts[1] === "export") {
						if (!methodAllowed(req, res, ["GET"])) return;
						return await handleExport(res, id);
					}
					if (parts.length === 2 && parts[1] === "assets") {
						if (!methodAllowed(req, res, ["POST"])) return;
						return await handleAssetUpload(req, res, id);
					}
					if (parts.length === 3 && parts[1] === "assets") {
						if (!methodAllowed(req, res, ["GET", "HEAD"])) return;
						const name = decodeSegment(parts[2]);
						if (name === null) {
							sendJson(res, 400, {
								ok: false,
								error: "asset name must be a safe file name"
							});
							return;
						}
						return await handleAssetRead(req, res, id, name);
					}
				}
				sendJson(res, 404, {
					ok: false,
					error: "unknown route"
				});
			} catch (error) {
				sendJson(res, 500, {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		});
		return () => {
			dispose();
		};
	}, "dsh-cool-theme: theme-file routes");
}
//#endregion
export { apply, inject, name };
