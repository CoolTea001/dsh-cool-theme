import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
//#region src/contract.ts
/**
* The Host's theme-file API, all below one prefix route. Kept here so the two
* halves cannot drift on a path.
*/
const THEME_API_PREFIX = "/cool-theme/api";
const THEME_API_PATH_THEMES = `${THEME_API_PREFIX}/themes`;
//#endregion
//#region src/host/theme-files.ts
/**
* Theme files owned by the Host.
*
* One directory per theme below `$DSH_HOME/cool-theme/themes/<id>/`, holding the
* document at `theme.json` and — once themes carry media — the originals under
* `assets/`. Keeping a theme a self-contained directory is what makes the later
* export a copy of that directory rather than a reassembly of scattered rows.
*/
/** Directory name of the theme document inside one theme's own directory. */
const DOCUMENT_NAME = "theme.json";
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
	return configured && configured !== "" ? configured : join(homedir(), ".dsh");
}
/** Root of every stored theme. */
function themesRoot() {
	return join(harnessHome(), "cool-theme", "themes");
}
/** One theme's own directory. Callers must have validated `id`. */
function themeDir(id) {
	return join(themesRoot(), id);
}
function documentPath(id) {
	return join(themeDir(id), DOCUMENT_NAME);
}
function isRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
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
		if (!isRecord$1(parsed)) return null;
		if (!isThemeId(parsed.id) || parsed.id !== id) return null;
		if (typeof parsed.name !== "string" || typeof parsed.base !== "string") return null;
		const assets = Array.isArray(parsed.assets) ? parsed.assets.filter(isAsset) : [];
		return {
			v: typeof parsed.v === "number" ? parsed.v : 1,
			id: parsed.id,
			name: parsed.name,
			base: parsed.base,
			theme: parsed.theme,
			assets,
			createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : (/* @__PURE__ */ new Date(0)).toISOString(),
			updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : (/* @__PURE__ */ new Date(0)).toISOString()
		};
	} catch {
		return null;
	}
}
function isAsset(value) {
	if (!isRecord$1(value)) return false;
	return typeof value.name === "string" && (value.kind === "image" || value.kind === "video") && typeof value.mime === "string" && typeof value.bytes === "number";
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
/** Every stored theme, newest by creation time first; unreadable directories are skipped. */
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
	documents.sort((a, b) => a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0);
	return documents;
}
/**
* Insert or replace one document. `createdAt` is the caller's when the theme is
* new and the stored value when it already exists, so a later rename or edit
* cannot rewrite when the theme was made.
*/
async function putTheme(input) {
	const existing = await readDocument(input.id);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const doc = {
		v: 1,
		id: input.id,
		name: input.name,
		base: input.base,
		theme: input.theme,
		assets: input.assets,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now
	};
	await writeDocument(doc);
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
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const buf = chunk;
		size += buf.byteLength;
		if (size > limit) throw new Error("request body too large");
		chunks.push(buf);
	}
	return Buffer.concat(chunks).toString("utf8");
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** The roster, newest first, as the browser half reads it. */
async function handleList(res) {
	sendJson(res, 200, {
		ok: true,
		themes: await listThemes()
	});
}
/**
* Upsert the posted documents. The browser half sends exactly the entries it
* changed, so one round trip covers save, rename and duplicate.
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
			assets: Array.isArray(raw.assets) ? raw.assets : []
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
				const rest = pathname.startsWith(`${THEME_API_PATH_THEMES}/`) ? pathname.slice(THEME_API_PATH_THEMES.length + 1) : null;
				if (rest !== null && isThemeId(rest)) {
					if (!methodAllowed(req, res, ["DELETE"])) return;
					return await handleDelete(res, rest);
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
