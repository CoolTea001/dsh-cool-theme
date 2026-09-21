window.__ModuleLoader__.load({
	id: "dsh-cool-theme",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		//#region src/contract.ts
		/**
		* Shared contract for dsh-cool-theme.
		*/
		const THEME_STORAGE_KEY = "cool-theme-preset";
		const THEME_STORAGE_KEY_LEGACY = "cooltea-theme-preset";
		const CUSTOM_PRESET_ID = "custom";
		const CUSTOM_THEME_STORAGE_KEY = "cool-theme-custom";
		const CUSTOM_LIST_STORAGE_KEY = "cool-theme-custom-list";
		const CUSTOM_ACTIVE_STORAGE_KEY = "cool-theme-custom-active";
		const CUSTOM_MIGRATED_STORAGE_KEY = "cool-theme-custom-migrated";
		const THEME_API_PATH_THEMES = `/cool-theme/api/themes`;
		const THEME_ARCHIVE_EXTENSION = ".zip";
		/**
		* Import bounds. A theme is a small JSON document, so anything past these caps
		* is refused before it is parsed rather than after it has been held in memory.
		*/
		const THEME_ARCHIVE_MAX_BYTES = 8388608;
		/** Route segments below {@link THEME_API_PATH_THEMES}: `/<id>/export`, `/import`. */
		const THEME_API_SEGMENT_EXPORT = "export";
		const THEME_API_PATH_IMPORT = `${THEME_API_PATH_THEMES}/import`;
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
		//#endregion
		//#region src/client/presets/_helpers.ts
		/**
		* Helpers for preset color scale generation.
		* Uses the same linear RGB interpolation as scripts/interpolate-colors.ts
		*/
		const BLUISH_STEPS = [
			0,
			50,
			60,
			75,
			100,
			150,
			200,
			300,
			400,
			500,
			600,
			700,
			750,
			800,
			850,
			875,
			900,
			950,
			1e3
		];
		const NEUTRAL_STEPS = [
			0,
			50,
			100,
			150,
			200,
			250,
			300,
			400,
			500,
			550,
			600,
			700,
			800,
			850,
			900,
			1e3
		];
		/** Semantic steps — kept identical to original hand-picked presets for compatibility */
		const DEEPSEEK_STEPS = [
			50,
			100,
			200,
			300,
			400,
			450,
			500,
			600,
			800,
			900
		];
		const BLUE_STEPS = [
			50,
			100,
			300,
			400,
			450,
			500,
			600,
			800,
			900
		];
		const BLUE_EXTRA_STEPS = [
			"50p",
			"75",
			"950"
		];
		const GREEN_STEPS = [
			100,
			400,
			500,
			900
		];
		const AMBER_STEPS = [
			100,
			400,
			500,
			600,
			900
		];
		const RED_STEPS = [
			50,
			100,
			400,
			500,
			600,
			900
		];
		function hexToRgb(hex) {
			const clean = hex.replace(/^#/, "");
			if (clean.length !== 6) throw new Error(`Invalid hex color: ${hex}`);
			return [
				parseInt(clean.substring(0, 2), 16),
				parseInt(clean.substring(2, 4), 16),
				parseInt(clean.substring(4, 6), 16)
			];
		}
		function rgbToHex(rgb) {
			const [r, g, b] = rgb.map((v) => Math.round(v).toString(16).padStart(2, "0").toUpperCase());
			return `#${r}${g}${b}`;
		}
		/**
		* Linearly interpolate between two colors (RGB space, same as scripts/interpolate-colors.ts)
		* @param colorStart color at scale 0, e.g. "#FAFAFA"
		* @param colorEnd   color at scale 1000, e.g. "#0D1017"
		* @param steps      array of scales to compute
		* @returns map of scale -> hex color
		*/
		function interpolateColors(colorStart, colorEnd, steps) {
			const start = hexToRgb(colorStart);
			const end = hexToRgb(colorEnd);
			const diffR = end[0] - start[0];
			const diffG = end[1] - start[1];
			const diffB = end[2] - start[2];
			const result = {};
			for (const step of steps) {
				const t = step / 1e3;
				let r = Math.round(start[0] + diffR * t);
				let g = Math.round(start[1] + diffG * t);
				let b = Math.round(start[2] + diffB * t);
				r = Math.max(0, Math.min(255, r));
				g = Math.max(0, Math.min(255, g));
				b = Math.max(0, Math.min(255, b));
				result[step] = rgbToHex([
					r,
					g,
					b
				]);
			}
			return result;
		}
		/**
		* Build CSS variable map for a neutral scale
		* e.g. prefix '--dsw-static-neutral-bluish', start '#FAFAFA', end '#0D1017'
		* -> { '--dsw-static-neutral-bluish-00': '#FAFAFA', '--dsw-static-neutral-bluish-50': '...' }
		*/
		function buildScale(prefix, start, end, steps) {
			const colors = interpolateColors(start, end, steps);
			const map = {};
			for (const step of steps) {
				const key = step === 0 ? `${prefix}-00` : `${prefix}-${step}`;
				map[key] = colors[step];
			}
			return map;
		}
		/** Mix two colors linearly in RGB. weight 0 -> colorA, 1 -> colorB */
		function mix(colorA, colorB, weight) {
			const a = hexToRgb(colorA);
			const b = hexToRgb(colorB);
			const w = Math.max(0, Math.min(1, weight));
			return rgbToHex([
				a[0] * (1 - w) + b[0] * w,
				a[1] * (1 - w) + b[1] * w,
				a[2] * (1 - w) + b[2] * w
			]);
		}
		/**
		* Semantic weight maps — tuned to approximate the original hand-picked palettes
		* while staying deterministic. Light steps (<500) are tints (white -> base),
		* dark steps (>500) are shades (base -> black). Values are intentionally
		* shared across all presets for consistency; per-preset drift vs. hand-picked
		* is typically <= 8 per channel.
		*/
		const DEEPSEEK_WEIGHTS = {
			50: .08,
			100: .15,
			200: .32,
			300: .52,
			400: .78,
			450: .88,
			500: 1,
			600: .82,
			800: .55,
			900: .35
		};
		const BLUE_WEIGHTS = {
			50: .08,
			100: .15,
			300: .52,
			400: .78,
			450: .88,
			500: 1,
			600: .82,
			800: .55,
			900: .35
		};
		const BLUE_EXTRA_WEIGHTS = {
			"50p": .1,
			"75": .12,
			"950": .25
		};
		const GREEN_WEIGHTS = {
			100: .15,
			400: .78,
			500: 1,
			900: .35
		};
		const AMBER_WEIGHTS = {
			100: .15,
			400: .78,
			500: 1,
			600: .82,
			900: .35
		};
		const RED_WEIGHTS = {
			50: .08,
			100: .15,
			400: .78,
			500: 1,
			600: .82,
			900: .35
		};
		function buildTintShadeScale(prefix, base, steps, weights) {
			const map = {};
			for (const step of steps) {
				const w = weights[step];
				if (w === void 0) continue;
				const color = step === 500 || step === "500" ? base.toUpperCase() : typeof step === "number" && step > 500 || step === "950" ? mix("#000000", base, w) : mix("#FFFFFF", base, w);
				map[`${prefix}-${step}`] = color;
			}
			return map;
		}
		function buildDeepseekScale(base) {
			return buildTintShadeScale("--dsw-static-deepseek", base, DEEPSEEK_STEPS, DEEPSEEK_WEIGHTS);
		}
		function buildBlueScale(base) {
			const main = buildTintShadeScale("--dsw-static-blue", base, BLUE_STEPS, BLUE_WEIGHTS);
			const extra = buildTintShadeScale("--dsw-static-blue", base, BLUE_EXTRA_STEPS, BLUE_EXTRA_WEIGHTS);
			return {
				...main,
				...extra
			};
		}
		function buildGreenScale(base) {
			return buildTintShadeScale("--dsw-static-green", base, GREEN_STEPS, GREEN_WEIGHTS);
		}
		function buildAmberScale(base) {
			return buildTintShadeScale("--dsw-static-amber", base, AMBER_STEPS, AMBER_WEIGHTS);
		}
		function buildRedScale(base) {
			return buildTintShadeScale("--dsw-static-red", base, RED_STEPS, RED_WEIGHTS);
		}
		/** Convenience: build all semantic scales from 5 base colors (500 values) */
		function buildSemanticScales(opts) {
			return {
				...buildDeepseekScale(opts.deepseek),
				...buildBlueScale(opts.blue),
				...buildGreenScale(opts.green),
				...buildAmberScale(opts.amber),
				...buildRedScale(opts.red),
				"--dsw-static-deepseek-700-delete": mix("#000000", opts.deepseek, .7)
			};
		}
		//#endregion
		//#region src/client/presets/aura.ts
		const bluish$33 = buildScale("--dsw-static-neutral-bluish", "#EDE9FE", "#15141B", BLUISH_STEPS);
		const neutral$33 = buildScale("--dsw-static-neutral", "#EDE9FE", "#15141B", NEUTRAL_STEPS);
		const lightSemantic$33 = buildSemanticScales({
			deepseek: "#7C3AED",
			blue: "#7C3AED",
			green: "#059669",
			amber: "#D97706",
			red: "#E11D48"
		});
		const darkSemantic$33 = buildSemanticScales({
			deepseek: "#A277FF",
			blue: "#A277FF",
			green: "#61FFCA",
			amber: "#FFCA85",
			red: "#FF6767"
		});
		const aura = {
			label: "Aura",
			light: {
				...bluish$33,
				...neutral$33,
				...lightSemantic$33,
				"--shiki-token-constant": "#7C3AED",
				"--shiki-token-string": "#059669",
				"--shiki-token-comment": "#6B7280",
				"--shiki-token-keyword": "#C026D3",
				"--shiki-token-parameter": "#B45309",
				"--shiki-token-function": "#7C3AED",
				"--shiki-token-string-expression": "#059669",
				"--shiki-token-punctuation": "#4B5563",
				"--shiki-token-link": "#7C3AED"
			},
			dark: {
				...bluish$33,
				...neutral$33,
				...darkSemantic$33,
				"--shiki-token-constant": "#FFCA85",
				"--shiki-token-string": "#61FFCA",
				"--shiki-token-comment": "#6C6F93",
				"--shiki-token-keyword": "#FF61EF",
				"--shiki-token-parameter": "#FFCA85",
				"--shiki-token-function": "#A277FF",
				"--shiki-token-string-expression": "#61FFCA",
				"--shiki-token-punctuation": "#B4B7CF",
				"--shiki-token-link": "#A277FF"
			}
		};
		//#endregion
		//#region src/client/presets/ayu.ts
		const bluish$32 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#0D1017", BLUISH_STEPS);
		const neutral$32 = buildScale("--dsw-static-neutral", "#FAFAFA", "#0F1419", NEUTRAL_STEPS);
		const lightSemantic$32 = buildSemanticScales({
			deepseek: "#4AA8C8",
			blue: "#4AA8C8",
			green: "#5FB978",
			amber: "#EA9F41",
			red: "#E6656A"
		});
		const darkSemantic$32 = buildSemanticScales({
			deepseek: "#3FB7E3",
			blue: "#3FB7E3",
			green: "#78D05C",
			amber: "#E4A75C",
			red: "#F58572"
		});
		const ayu = {
			label: "Ayu",
			light: {
				...bluish$32,
				...neutral$32,
				...lightSemantic$32,
				"--shiki-token-constant": "#A37ACC",
				"--shiki-token-string": "#6F8F00",
				"--shiki-token-comment": "#6E7681",
				"--shiki-token-keyword": "#C76A1A",
				"--shiki-token-parameter": "#B87500",
				"--shiki-token-function": "#227FC0",
				"--shiki-token-string-expression": "#6F8F00",
				"--shiki-token-punctuation": "#4F5964",
				"--shiki-token-link": "#2F86B7"
			},
			dark: {
				...bluish$32,
				...neutral$32,
				...darkSemantic$32,
				"--shiki-token-constant": "#D2A6FF",
				"--shiki-token-string": "#AAD94C",
				"--shiki-token-comment": "#5A6673",
				"--shiki-token-keyword": "#FF8F40",
				"--shiki-token-parameter": "#FFB454",
				"--shiki-token-function": "#59C2FF",
				"--shiki-token-string-expression": "#AAD94C",
				"--shiki-token-punctuation": "#D6DAE0",
				"--shiki-token-link": "#39BAE6"
			}
		};
		//#endregion
		//#region src/client/presets/catppuccin.ts
		const bluish$31 = buildScale("--dsw-static-neutral-bluish", "#eff1f5", "#1e1e2e", BLUISH_STEPS);
		const neutral$31 = buildScale("--dsw-static-neutral", "#eff1f5", "#1e1e2e", NEUTRAL_STEPS);
		const lightSemantic$31 = buildSemanticScales({
			deepseek: "#7287FD",
			blue: "#7287FD",
			green: "#40A02B",
			amber: "#DF8E1D",
			red: "#D20F39"
		});
		const darkSemantic$31 = buildSemanticScales({
			deepseek: "#B4BEFE",
			blue: "#B4BEFE",
			green: "#A6D189",
			amber: "#F4B8E4",
			red: "#F38BA8"
		});
		const catppuccin = {
			label: "Catppuccin",
			light: {
				...bluish$31,
				...neutral$31,
				...lightSemantic$31,
				"--shiki-token-constant": "#CA6702",
				"--shiki-token-string": "#40A02B",
				"--shiki-token-comment": "#6C7086",
				"--shiki-token-keyword": "#8839EF",
				"--shiki-token-parameter": "#1E66F5",
				"--shiki-token-function": "#7287FD",
				"--shiki-token-string-expression": "#40A02B",
				"--shiki-token-punctuation": "#5C5F77",
				"--shiki-token-link": "#04A5E5"
			},
			dark: {
				...bluish$31,
				...neutral$31,
				...darkSemantic$31,
				"--shiki-token-constant": "#FAB387",
				"--shiki-token-string": "#A6D189",
				"--shiki-token-comment": "#6C7086",
				"--shiki-token-keyword": "#CBA6F7",
				"--shiki-token-parameter": "#89B4FA",
				"--shiki-token-function": "#B4BEFE",
				"--shiki-token-string-expression": "#A6D189",
				"--shiki-token-punctuation": "#CDD6F4",
				"--shiki-token-link": "#89DCEB"
			}
		};
		//#endregion
		//#region src/client/presets/catppuccin-frappe.ts
		const bluish$30 = buildScale("--dsw-static-neutral-bluish", "#EFF1F5", "#303446", BLUISH_STEPS);
		const neutral$30 = buildScale("--dsw-static-neutral", "#EFF1F5", "#303446", NEUTRAL_STEPS);
		const lightSemantic$30 = buildSemanticScales({
			deepseek: "#7287FD",
			blue: "#7287FD",
			green: "#40A02B",
			amber: "#DF8E1D",
			red: "#D20F39"
		});
		const darkSemantic$30 = buildSemanticScales({
			deepseek: "#BABBF1",
			blue: "#BABBF1",
			green: "#A6D189",
			amber: "#EF9F76",
			red: "#E78284"
		});
		const catppuccinFrappe = {
			label: "Catppuccin Frappe",
			light: {
				...bluish$30,
				...neutral$30,
				...lightSemantic$30,
				"--shiki-token-constant": "#CA6702",
				"--shiki-token-string": "#40A02B",
				"--shiki-token-comment": "#6C7086",
				"--shiki-token-keyword": "#8839EF",
				"--shiki-token-parameter": "#1E66F5",
				"--shiki-token-function": "#7287FD",
				"--shiki-token-string-expression": "#40A02B",
				"--shiki-token-punctuation": "#5C5F77",
				"--shiki-token-link": "#04A5E5"
			},
			dark: {
				...bluish$30,
				...neutral$30,
				...darkSemantic$30,
				"--shiki-token-constant": "#EF9F76",
				"--shiki-token-string": "#A6D189",
				"--shiki-token-comment": "#838BA7",
				"--shiki-token-keyword": "#CA9EE6",
				"--shiki-token-parameter": "#8CAAEE",
				"--shiki-token-function": "#BABBF1",
				"--shiki-token-string-expression": "#A6D189",
				"--shiki-token-punctuation": "#C6D0F5",
				"--shiki-token-link": "#99D1DB"
			}
		};
		//#endregion
		//#region src/client/presets/catppuccin-macchiato.ts
		const bluish$29 = buildScale("--dsw-static-neutral-bluish", "#EFF1F5", "#24273A", BLUISH_STEPS);
		const neutral$29 = buildScale("--dsw-static-neutral", "#EFF1F5", "#24273A", NEUTRAL_STEPS);
		const lightSemantic$29 = buildSemanticScales({
			deepseek: "#7287FD",
			blue: "#7287FD",
			green: "#40A02B",
			amber: "#DF8E1D",
			red: "#D20F39"
		});
		const darkSemantic$29 = buildSemanticScales({
			deepseek: "#B7BDF8",
			blue: "#B7BDF8",
			green: "#A6DA95",
			amber: "#F5A97F",
			red: "#ED8796"
		});
		const catppuccinMacchiato = {
			label: "Catppuccin Macchiato",
			light: {
				...bluish$29,
				...neutral$29,
				...lightSemantic$29,
				"--shiki-token-constant": "#CA6702",
				"--shiki-token-string": "#40A02B",
				"--shiki-token-comment": "#6C7086",
				"--shiki-token-keyword": "#8839EF",
				"--shiki-token-parameter": "#1E66F5",
				"--shiki-token-function": "#7287FD",
				"--shiki-token-string-expression": "#40A02B",
				"--shiki-token-punctuation": "#5C5F77",
				"--shiki-token-link": "#04A5E5"
			},
			dark: {
				...bluish$29,
				...neutral$29,
				...darkSemantic$29,
				"--shiki-token-constant": "#F5A97F",
				"--shiki-token-string": "#A6DA95",
				"--shiki-token-comment": "#8087A2",
				"--shiki-token-keyword": "#C6A0F6",
				"--shiki-token-parameter": "#8AADF4",
				"--shiki-token-function": "#B7BDF8",
				"--shiki-token-string-expression": "#A6DA95",
				"--shiki-token-punctuation": "#CAD3F5",
				"--shiki-token-link": "#91D7E3"
			}
		};
		//#endregion
		//#region src/client/presets/cobalt2.ts
		const bluish$28 = buildScale("--dsw-static-neutral-bluish", "#EAF2FF", "#193549", BLUISH_STEPS);
		const neutral$28 = buildScale("--dsw-static-neutral", "#EAF2FF", "#193549", NEUTRAL_STEPS);
		const lightSemantic$28 = buildSemanticScales({
			deepseek: "#0054A6",
			blue: "#0054A6",
			green: "#0E7A4A",
			amber: "#8A6A00",
			red: "#D42A2A"
		});
		const darkSemantic$28 = buildSemanticScales({
			deepseek: "#0088FF",
			blue: "#0088FF",
			green: "#3AD900",
			amber: "#FFC600",
			red: "#FF628C"
		});
		const cobalt2 = {
			label: "Cobalt2",
			light: {
				...bluish$28,
				...neutral$28,
				...lightSemantic$28,
				"--shiki-token-constant": "#0054A6",
				"--shiki-token-string": "#0E7A4A",
				"--shiki-token-comment": "#6B7C8D",
				"--shiki-token-keyword": "#A31515",
				"--shiki-token-parameter": "#8A6A00",
				"--shiki-token-function": "#0054A6",
				"--shiki-token-string-expression": "#0E7A4A",
				"--shiki-token-punctuation": "#334454",
				"--shiki-token-link": "#0054A6"
			},
			dark: {
				...bluish$28,
				...neutral$28,
				...darkSemantic$28,
				"--shiki-token-constant": "#FFC600",
				"--shiki-token-string": "#3AD900",
				"--shiki-token-comment": "#7C8B9E",
				"--shiki-token-keyword": "#FF9D00",
				"--shiki-token-parameter": "#FFC600",
				"--shiki-token-function": "#0088FF",
				"--shiki-token-string-expression": "#3AD900",
				"--shiki-token-punctuation": "#E1EFFF",
				"--shiki-token-link": "#0088FF"
			}
		};
		//#endregion
		//#region src/client/presets/cursor.ts
		const bluish$27 = buildScale("--dsw-static-neutral-bluish", "#F2F2F3", "#0E0E10", BLUISH_STEPS);
		const neutral$27 = buildScale("--dsw-static-neutral", "#FAFAFA", "#0E0E10", NEUTRAL_STEPS);
		const lightSemantic$27 = buildSemanticScales({
			deepseek: "#4F46E5",
			blue: "#4F46E5",
			green: "#059669",
			amber: "#D97706",
			red: "#DC2626"
		});
		const darkSemantic$27 = buildSemanticScales({
			deepseek: "#5E6AD2",
			blue: "#5E6AD2",
			green: "#0DBF6A",
			amber: "#FF8A00",
			red: "#FF6467"
		});
		const cursor = {
			label: "Cursor",
			light: {
				...bluish$27,
				...neutral$27,
				...lightSemantic$27,
				"--shiki-token-constant": "#4F46E5",
				"--shiki-token-string": "#059669",
				"--shiki-token-comment": "#6B7280",
				"--shiki-token-keyword": "#7C3AED",
				"--shiki-token-parameter": "#B45309",
				"--shiki-token-function": "#4F46E5",
				"--shiki-token-string-expression": "#059669",
				"--shiki-token-punctuation": "#3F3F46",
				"--shiki-token-link": "#4F46E5"
			},
			dark: {
				...bluish$27,
				...neutral$27,
				...darkSemantic$27,
				"--shiki-token-constant": "#5E6AD2",
				"--shiki-token-string": "#0DBF6A",
				"--shiki-token-comment": "#6B7280",
				"--shiki-token-keyword": "#A78BFA",
				"--shiki-token-parameter": "#FF8A00",
				"--shiki-token-function": "#5E6AD2",
				"--shiki-token-string-expression": "#0DBF6A",
				"--shiki-token-punctuation": "#A1A1AA",
				"--shiki-token-link": "#5E6AD2"
			}
		};
		//#endregion
		//#region src/client/presets/dracula.ts
		const bluish$26 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#282a36", BLUISH_STEPS);
		const neutral$26 = buildScale("--dsw-static-neutral", "#FAFAFA", "#282a36", NEUTRAL_STEPS);
		const lightSemantic$26 = buildSemanticScales({
			deepseek: "#7C3AED",
			blue: "#7C3AED",
			green: "#2A9D4A",
			amber: "#B78100",
			red: "#E63C3C"
		});
		const darkSemantic$26 = buildSemanticScales({
			deepseek: "#BD93F9",
			blue: "#BD93F9",
			green: "#50FA7B",
			amber: "#F1FA8C",
			red: "#FF5555"
		});
		const dracula = {
			label: "Dracula",
			light: {
				...bluish$26,
				...neutral$26,
				...lightSemantic$26,
				"--shiki-token-constant": "#6A3FB5",
				"--shiki-token-string": "#1A7A3A",
				"--shiki-token-comment": "#6D7A9E",
				"--shiki-token-keyword": "#A21CAF",
				"--shiki-token-parameter": "#B45309",
				"--shiki-token-function": "#7C3AED",
				"--shiki-token-string-expression": "#1A7A3A",
				"--shiki-token-punctuation": "#44475A",
				"--shiki-token-link": "#7C3AED"
			},
			dark: {
				...bluish$26,
				...neutral$26,
				...darkSemantic$26,
				"--shiki-token-constant": "#8BE9FD",
				"--shiki-token-string": "#50FA7B",
				"--shiki-token-comment": "#99A3C4",
				"--shiki-token-keyword": "#FF79C6",
				"--shiki-token-parameter": "#FFB86C",
				"--shiki-token-function": "#BD93F9",
				"--shiki-token-string-expression": "#50FA7B",
				"--shiki-token-punctuation": "#F8F8F2",
				"--shiki-token-link": "#BD93F9"
			}
		};
		//#endregion
		//#region src/client/presets/dsh.ts
		const bluish$25 = buildScale("--dsw-static-neutral-bluish", "#FFFFFF", "#0F1115", BLUISH_STEPS);
		const neutral$25 = buildScale("--dsw-static-neutral", "#FFFFFF", "#000000", NEUTRAL_STEPS);
		const lightSemantic$25 = buildSemanticScales({
			deepseek: "#4176E6",
			blue: "#3B82F6",
			green: "#22C55E",
			amber: "#F59E0B",
			red: "#EF4444"
		});
		const darkSemantic$25 = buildSemanticScales({
			deepseek: "#4176E6",
			blue: "#3B82F6",
			green: "#22C55E",
			amber: "#F59E0B",
			red: "#EF4444"
		});
		const dsh = {
			label: "DSH",
			light: {
				...bluish$25,
				...neutral$25,
				...lightSemantic$25
			},
			dark: {
				...bluish$25,
				...neutral$25,
				...darkSemantic$25
			}
		};
		//#endregion
		//#region src/client/presets/everforest.ts
		const bluish$24 = buildScale("--dsw-static-neutral-bluish", "#FDF6E3", "#2D353B", BLUISH_STEPS);
		const neutral$24 = buildScale("--dsw-static-neutral", "#FDF6E3", "#2D353B", NEUTRAL_STEPS);
		const lightSemantic$24 = buildSemanticScales({
			deepseek: "#42675A",
			blue: "#42675A",
			green: "#8DA101",
			amber: "#DFA000",
			red: "#F85552"
		});
		const darkSemantic$24 = buildSemanticScales({
			deepseek: "#7FBBB3",
			blue: "#7FBBB3",
			green: "#A7C080",
			amber: "#DBBC7F",
			red: "#E67E80"
		});
		const everforest = {
			label: "Everforest",
			light: {
				...bluish$24,
				...neutral$24,
				...lightSemantic$24,
				"--shiki-token-constant": "#8DA101",
				"--shiki-token-string": "#4D7D0F",
				"--shiki-token-comment": "#8B9A7E",
				"--shiki-token-keyword": "#DF69A0",
				"--shiki-token-parameter": "#DFA000",
				"--shiki-token-function": "#42675A",
				"--shiki-token-string-expression": "#4D7D0F",
				"--shiki-token-punctuation": "#5C6A72",
				"--shiki-token-link": "#3A94C5"
			},
			dark: {
				...bluish$24,
				...neutral$24,
				...darkSemantic$24,
				"--shiki-token-constant": "#DBBC7F",
				"--shiki-token-string": "#A7C080",
				"--shiki-token-comment": "#859289",
				"--shiki-token-keyword": "#D699B6",
				"--shiki-token-parameter": "#E69875",
				"--shiki-token-function": "#7FBBB3",
				"--shiki-token-string-expression": "#A7C080",
				"--shiki-token-punctuation": "#D3C6AA",
				"--shiki-token-link": "#83C092"
			}
		};
		//#endregion
		//#region src/client/presets/flexoki.ts
		const bluish$23 = buildScale("--dsw-static-neutral-bluish", "#FFFCF0", "#100F0F", BLUISH_STEPS);
		const neutral$23 = buildScale("--dsw-static-neutral", "#FFFCF0", "#100F0F", NEUTRAL_STEPS);
		const lightSemantic$23 = buildSemanticScales({
			deepseek: "#205EA6",
			blue: "#205EA6",
			green: "#66800B",
			amber: "#AD8301",
			red: "#AF3029"
		});
		const darkSemantic$23 = buildSemanticScales({
			deepseek: "#4385BE",
			blue: "#4385BE",
			green: "#879A39",
			amber: "#D0A215",
			red: "#D14D41"
		});
		const flexoki = {
			label: "Flexoki",
			light: {
				...bluish$23,
				...neutral$23,
				...lightSemantic$23,
				"--shiki-token-constant": "#BC5215",
				"--shiki-token-string": "#66800B",
				"--shiki-token-comment": "#6F6E69",
				"--shiki-token-keyword": "#A02F6F",
				"--shiki-token-parameter": "#AD8301",
				"--shiki-token-function": "#205EA6",
				"--shiki-token-string-expression": "#66800B",
				"--shiki-token-punctuation": "#575653",
				"--shiki-token-link": "#205EA6"
			},
			dark: {
				...bluish$23,
				...neutral$23,
				...darkSemantic$23,
				"--shiki-token-constant": "#DA702C",
				"--shiki-token-string": "#879A39",
				"--shiki-token-comment": "#6F6E69",
				"--shiki-token-keyword": "#CE5D97",
				"--shiki-token-parameter": "#D0A215",
				"--shiki-token-function": "#4385BE",
				"--shiki-token-string-expression": "#879A39",
				"--shiki-token-punctuation": "#CECDC3",
				"--shiki-token-link": "#4385BE"
			}
		};
		//#endregion
		//#region src/client/presets/github.ts
		const bluish$22 = buildScale("--dsw-static-neutral-bluish", "#ffffff", "#0d1117", BLUISH_STEPS);
		const neutral$22 = buildScale("--dsw-static-neutral", "#ffffff", "#0d1117", NEUTRAL_STEPS);
		const lightSemantic$22 = buildSemanticScales({
			deepseek: "#0969da",
			blue: "#0969da",
			green: "#1A7F37",
			amber: "#9A6700",
			red: "#CF222E"
		});
		const darkSemantic$22 = buildSemanticScales({
			deepseek: "#58A6FF",
			blue: "#58A6FF",
			green: "#3FB950",
			amber: "#D29922",
			red: "#F85149"
		});
		const github = {
			label: "GitHub",
			light: {
				...bluish$22,
				...neutral$22,
				...lightSemantic$22,
				"--shiki-token-constant": "#0550AE",
				"--shiki-token-string": "#0A3069",
				"--shiki-token-comment": "#6E7781",
				"--shiki-token-keyword": "#CF222E",
				"--shiki-token-parameter": "#953800",
				"--shiki-token-function": "#8250DF",
				"--shiki-token-string-expression": "#1A7F37",
				"--shiki-token-punctuation": "#656D76",
				"--shiki-token-link": "#0969DA"
			},
			dark: {
				...bluish$22,
				...neutral$22,
				...darkSemantic$22,
				"--shiki-token-constant": "#79C0FF",
				"--shiki-token-string": "#A5D6FF",
				"--shiki-token-comment": "#8B949E",
				"--shiki-token-keyword": "#FF7B72",
				"--shiki-token-parameter": "#FFA657",
				"--shiki-token-function": "#D2A8FF",
				"--shiki-token-string-expression": "#7EE787",
				"--shiki-token-punctuation": "#8B949E",
				"--shiki-token-link": "#58A6FF"
			}
		};
		//#endregion
		//#region src/client/presets/gruvbox.ts
		const bluish$21 = buildScale("--dsw-static-neutral-bluish", "#fbf1c7", "#282828", BLUISH_STEPS);
		const neutral$21 = buildScale("--dsw-static-neutral", "#fbf1c7", "#282828", NEUTRAL_STEPS);
		const lightSemantic$21 = buildSemanticScales({
			deepseek: "#076678",
			blue: "#076678",
			green: "#98971A",
			amber: "#D79921",
			red: "#CC241D"
		});
		const darkSemantic$21 = buildSemanticScales({
			deepseek: "#83A598",
			blue: "#83A598",
			green: "#B8BB26",
			amber: "#FABD2F",
			red: "#FB4934"
		});
		const gruvbox = {
			label: "Gruvbox",
			light: {
				...bluish$21,
				...neutral$21,
				...lightSemantic$21,
				"--shiki-token-constant": "#076678",
				"--shiki-token-string": "#79740E",
				"--shiki-token-comment": "#928374",
				"--shiki-token-keyword": "#9D0006",
				"--shiki-token-parameter": "#AF3A03",
				"--shiki-token-function": "#076678",
				"--shiki-token-string-expression": "#79740E",
				"--shiki-token-punctuation": "#504945",
				"--shiki-token-link": "#076678"
			},
			dark: {
				...bluish$21,
				...neutral$21,
				...darkSemantic$21,
				"--shiki-token-constant": "#83A598",
				"--shiki-token-string": "#B8BB26",
				"--shiki-token-comment": "#B1A69B",
				"--shiki-token-keyword": "#FB4934",
				"--shiki-token-parameter": "#FE8019",
				"--shiki-token-function": "#FABD2F",
				"--shiki-token-string-expression": "#B8BB26",
				"--shiki-token-punctuation": "#EBDBB2",
				"--shiki-token-link": "#83A598"
			}
		};
		//#endregion
		//#region src/client/presets/kanagawa.ts
		const bluish$20 = buildScale("--dsw-static-neutral-bluish", "#F2ECBC", "#1F1F28", BLUISH_STEPS);
		const neutral$20 = buildScale("--dsw-static-neutral", "#F2ECBC", "#1F1F28", NEUTRAL_STEPS);
		const lightSemantic$20 = buildSemanticScales({
			deepseek: "#2D4F67",
			blue: "#2D4F67",
			green: "#587353",
			amber: "#8A6A2E",
			red: "#9E3A3D"
		});
		const darkSemantic$20 = buildSemanticScales({
			deepseek: "#7E9CD8",
			blue: "#7E9CD8",
			green: "#98BB6C",
			amber: "#E6C384",
			red: "#E46876"
		});
		const kanagawa = {
			label: "Kanagawa",
			light: {
				...bluish$20,
				...neutral$20,
				...lightSemantic$20,
				"--shiki-token-constant": "#5A6A8A",
				"--shiki-token-string": "#587353",
				"--shiki-token-comment": "#8A9A7B",
				"--shiki-token-keyword": "#957FB8",
				"--shiki-token-parameter": "#8A6A2E",
				"--shiki-token-function": "#2D4F67",
				"--shiki-token-string-expression": "#587353",
				"--shiki-token-punctuation": "#43436C",
				"--shiki-token-link": "#2D4F67"
			},
			dark: {
				...bluish$20,
				...neutral$20,
				...darkSemantic$20,
				"--shiki-token-constant": "#DCA561",
				"--shiki-token-string": "#98BB6C",
				"--shiki-token-comment": "#727169",
				"--shiki-token-keyword": "#957FB8",
				"--shiki-token-parameter": "#FFA066",
				"--shiki-token-function": "#7E9CD8",
				"--shiki-token-string-expression": "#98BB6C",
				"--shiki-token-punctuation": "#DCD7BA",
				"--shiki-token-link": "#7FB4CA"
			}
		};
		//#endregion
		//#region src/client/presets/lucent-orng.ts
		const bluish$19 = buildScale("--dsw-static-neutral-bluish", "#FFF7ED", "#1C130E", BLUISH_STEPS);
		const neutral$19 = buildScale("--dsw-static-neutral", "#FFF7ED", "#1C130E", NEUTRAL_STEPS);
		const lightSemantic$19 = buildSemanticScales({
			deepseek: "#9A3412",
			blue: "#9A3412",
			green: "#166534",
			amber: "#EA580C",
			red: "#DC2626"
		});
		const darkSemantic$19 = buildSemanticScales({
			deepseek: "#FF8904",
			blue: "#FF8904",
			green: "#4ADE80",
			amber: "#FB923C",
			red: "#F87171"
		});
		const lucentOrng = {
			label: "Lucent Orng",
			light: {
				...bluish$19,
				...neutral$19,
				...lightSemantic$19,
				"--shiki-token-constant": "#9A3412",
				"--shiki-token-string": "#166534",
				"--shiki-token-comment": "#9A8B7A",
				"--shiki-token-keyword": "#C2410C",
				"--shiki-token-parameter": "#EA580C",
				"--shiki-token-function": "#9A3412",
				"--shiki-token-string-expression": "#166534",
				"--shiki-token-punctuation": "#57534E",
				"--shiki-token-link": "#9A3412"
			},
			dark: {
				...bluish$19,
				...neutral$19,
				...darkSemantic$19,
				"--shiki-token-constant": "#FB923C",
				"--shiki-token-string": "#4ADE80",
				"--shiki-token-comment": "#8C7A65",
				"--shiki-token-keyword": "#FF8904",
				"--shiki-token-parameter": "#FDBA74",
				"--shiki-token-function": "#FF8904",
				"--shiki-token-string-expression": "#4ADE80",
				"--shiki-token-punctuation": "#F5E6D3",
				"--shiki-token-link": "#FF8904"
			}
		};
		//#endregion
		//#region src/client/presets/material.ts
		const bluish$18 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#0F111A", BLUISH_STEPS);
		const neutral$18 = buildScale("--dsw-static-neutral", "#FAFAFA", "#0F111A", NEUTRAL_STEPS);
		const lightSemantic$18 = buildSemanticScales({
			deepseek: "#1565C0",
			blue: "#1565C0",
			green: "#2E7D32",
			amber: "#EF6C00",
			red: "#C62828"
		});
		const darkSemantic$18 = buildSemanticScales({
			deepseek: "#82AAFF",
			blue: "#82AAFF",
			green: "#C3E88D",
			amber: "#FFCB6B",
			red: "#F07178"
		});
		const material = {
			label: "Material",
			light: {
				...bluish$18,
				...neutral$18,
				...lightSemantic$18,
				"--shiki-token-constant": "#1565C0",
				"--shiki-token-string": "#2E7D32",
				"--shiki-token-comment": "#6B7C8D",
				"--shiki-token-keyword": "#7C4DFF",
				"--shiki-token-parameter": "#EF6C00",
				"--shiki-token-function": "#1565C0",
				"--shiki-token-string-expression": "#2E7D32",
				"--shiki-token-punctuation": "#37474F",
				"--shiki-token-link": "#1565C0"
			},
			dark: {
				...bluish$18,
				...neutral$18,
				...darkSemantic$18,
				"--shiki-token-constant": "#FFCB6B",
				"--shiki-token-string": "#C3E88D",
				"--shiki-token-comment": "#676E95",
				"--shiki-token-keyword": "#C792EA",
				"--shiki-token-parameter": "#FFCB6B",
				"--shiki-token-function": "#82AAFF",
				"--shiki-token-string-expression": "#C3E88D",
				"--shiki-token-punctuation": "#EEFFFF",
				"--shiki-token-link": "#82AAFF"
			}
		};
		//#endregion
		//#region src/client/presets/matrix.ts
		const bluish$17 = buildScale("--dsw-static-neutral-bluish", "#E8F5E9", "#0D1A0D", BLUISH_STEPS);
		const neutral$17 = buildScale("--dsw-static-neutral", "#E8F5E9", "#001100", NEUTRAL_STEPS);
		const lightSemantic$17 = buildSemanticScales({
			deepseek: "#0A5300",
			blue: "#0A5300",
			green: "#0A5300",
			amber: "#5A7A00",
			red: "#8A1A1A"
		});
		const darkSemantic$17 = buildSemanticScales({
			deepseek: "#00FF41",
			blue: "#00FF41",
			green: "#00FF41",
			amber: "#76FF03",
			red: "#FF3D57"
		});
		const matrix = {
			label: "Matrix",
			light: {
				...bluish$17,
				...neutral$17,
				...lightSemantic$17,
				"--shiki-token-constant": "#0A5300",
				"--shiki-token-string": "#0A7A00",
				"--shiki-token-comment": "#5A7A5A",
				"--shiki-token-keyword": "#0A5300",
				"--shiki-token-parameter": "#5A7A00",
				"--shiki-token-function": "#0A5300",
				"--shiki-token-string-expression": "#0A7A00",
				"--shiki-token-punctuation": "#2E3B2E",
				"--shiki-token-link": "#0A5300"
			},
			dark: {
				...bluish$17,
				...neutral$17,
				...darkSemantic$17,
				"--shiki-token-constant": "#76FF03",
				"--shiki-token-string": "#00E676",
				"--shiki-token-comment": "#4A7A4A",
				"--shiki-token-keyword": "#00FF41",
				"--shiki-token-parameter": "#76FF03",
				"--shiki-token-function": "#00FF41",
				"--shiki-token-string-expression": "#00E676",
				"--shiki-token-punctuation": "#CCFFCC",
				"--shiki-token-link": "#00FF41"
			}
		};
		//#endregion
		//#region src/client/presets/mercury.ts
		const bluish$16 = buildScale("--dsw-static-neutral-bluish", "#F8FAFC", "#0F172A", BLUISH_STEPS);
		const neutral$16 = buildScale("--dsw-static-neutral", "#F8FAFC", "#0F172A", NEUTRAL_STEPS);
		const lightSemantic$16 = buildSemanticScales({
			deepseek: "#334155",
			blue: "#334155",
			green: "#047857",
			amber: "#B45309",
			red: "#BE123C"
		});
		const darkSemantic$16 = buildSemanticScales({
			deepseek: "#38BDF8",
			blue: "#38BDF8",
			green: "#34D399",
			amber: "#FBBF24",
			red: "#F43F5E"
		});
		const mercury = {
			label: "Mercury",
			light: {
				...bluish$16,
				...neutral$16,
				...lightSemantic$16,
				"--shiki-token-constant": "#334155",
				"--shiki-token-string": "#047857",
				"--shiki-token-comment": "#64748B",
				"--shiki-token-keyword": "#7C3AED",
				"--shiki-token-parameter": "#B45309",
				"--shiki-token-function": "#334155",
				"--shiki-token-string-expression": "#047857",
				"--shiki-token-punctuation": "#334155",
				"--shiki-token-link": "#0284C7"
			},
			dark: {
				...bluish$16,
				...neutral$16,
				...darkSemantic$16,
				"--shiki-token-constant": "#38BDF8",
				"--shiki-token-string": "#34D399",
				"--shiki-token-comment": "#64748B",
				"--shiki-token-keyword": "#A78BFA",
				"--shiki-token-parameter": "#FBBF24",
				"--shiki-token-function": "#38BDF8",
				"--shiki-token-string-expression": "#34D399",
				"--shiki-token-punctuation": "#E2E8F0",
				"--shiki-token-link": "#38BDF8"
			}
		};
		//#endregion
		//#region src/client/presets/monokai.ts
		const bluish$15 = buildScale("--dsw-static-neutral-bluish", "#fcfcfa", "#2d2a2e", BLUISH_STEPS);
		const neutral$15 = buildScale("--dsw-static-neutral", "#fcfcfa", "#2d2a2e", NEUTRAL_STEPS);
		const lightSemantic$15 = buildSemanticScales({
			deepseek: "#6B42A0",
			blue: "#6B42A0",
			green: "#5A8A2A",
			amber: "#B87A00",
			red: "#FF6188"
		});
		const darkSemantic$15 = buildSemanticScales({
			deepseek: "#AB9DF2",
			blue: "#AB9DF2",
			green: "#A9DC76",
			amber: "#FFD866",
			red: "#FF9DB5"
		});
		const monokai = {
			label: "Monokai",
			light: {
				...bluish$15,
				...neutral$15,
				...lightSemantic$15,
				"--shiki-token-constant": "#6B42A0",
				"--shiki-token-string": "#2A7A2A",
				"--shiki-token-comment": "#8A8A8A",
				"--shiki-token-keyword": "#C4265E",
				"--shiki-token-parameter": "#B45A00",
				"--shiki-token-function": "#6B42A0",
				"--shiki-token-string-expression": "#2A7A2A",
				"--shiki-token-punctuation": "#5B5956",
				"--shiki-token-link": "#6B42A0"
			},
			dark: {
				...bluish$15,
				...neutral$15,
				...darkSemantic$15,
				"--shiki-token-constant": "#AB9DF2",
				"--shiki-token-string": "#A9DC76",
				"--shiki-token-comment": "#A9A8A7",
				"--shiki-token-keyword": "#FF6188",
				"--shiki-token-parameter": "#FC9867",
				"--shiki-token-function": "#78DCE8",
				"--shiki-token-string-expression": "#A9DC76",
				"--shiki-token-punctuation": "#FCFCFA",
				"--shiki-token-link": "#AB9DF2"
			}
		};
		//#endregion
		//#region src/client/presets/nightowl.ts
		const bluish$14 = buildScale("--dsw-static-neutral-bluish", "#F7F9FF", "#011627", BLUISH_STEPS);
		const neutral$14 = buildScale("--dsw-static-neutral", "#F7F9FF", "#011627", NEUTRAL_STEPS);
		const lightSemantic$14 = buildSemanticScales({
			deepseek: "#0B2948",
			blue: "#0B2948",
			green: "#0A7A5A",
			amber: "#8A6A00",
			red: "#B93D3D"
		});
		const darkSemantic$14 = buildSemanticScales({
			deepseek: "#82AAFF",
			blue: "#82AAFF",
			green: "#22DA6E",
			amber: "#FFEB95",
			red: "#EF5350"
		});
		const nightowl = {
			label: "Night Owl",
			light: {
				...bluish$14,
				...neutral$14,
				...lightSemantic$14,
				"--shiki-token-constant": "#0B2948",
				"--shiki-token-string": "#0A7A5A",
				"--shiki-token-comment": "#6B7B8D",
				"--shiki-token-keyword": "#7C3AED",
				"--shiki-token-parameter": "#8A6A00",
				"--shiki-token-function": "#0B2948",
				"--shiki-token-string-expression": "#0A7A5A",
				"--shiki-token-punctuation": "#2C3E50",
				"--shiki-token-link": "#0B2948"
			},
			dark: {
				...bluish$14,
				...neutral$14,
				...darkSemantic$14,
				"--shiki-token-constant": "#FFEB95",
				"--shiki-token-string": "#22DA6E",
				"--shiki-token-comment": "#637777",
				"--shiki-token-keyword": "#C792EA",
				"--shiki-token-parameter": "#F78C6C",
				"--shiki-token-function": "#82AAFF",
				"--shiki-token-string-expression": "#22DA6E",
				"--shiki-token-punctuation": "#D6DEEB",
				"--shiki-token-link": "#7FDBCA"
			}
		};
		//#endregion
		//#region src/client/presets/nord.ts
		const bluish$13 = buildScale("--dsw-static-neutral-bluish", "#D8DEE9", "#2E3440", BLUISH_STEPS);
		const neutral$13 = buildScale("--dsw-static-neutral", "#D8DEE9", "#2E3440", NEUTRAL_STEPS);
		const lightSemantic$13 = buildSemanticScales({
			deepseek: "#5E81AC",
			blue: "#5E81AC",
			green: "#A3BE8C",
			amber: "#EBCB8B",
			red: "#BF616A"
		});
		const darkSemantic$13 = buildSemanticScales({
			deepseek: "#88C0D0",
			blue: "#88C0D0",
			green: "#C6D7B8",
			amber: "#F3DFB7",
			red: "#D79DA3"
		});
		const nord = {
			label: "Nord",
			light: {
				...bluish$13,
				...neutral$13,
				...lightSemantic$13,
				"--shiki-token-constant": "#2E6EA6",
				"--shiki-token-string": "#3D7A1F",
				"--shiki-token-comment": "#6C7A8E",
				"--shiki-token-keyword": "#8B4A9A",
				"--shiki-token-parameter": "#9A5D2E",
				"--shiki-token-function": "#2F6F8A",
				"--shiki-token-string-expression": "#3D7A1F",
				"--shiki-token-punctuation": "#4C566A",
				"--shiki-token-link": "#5E81AC"
			},
			dark: {
				...bluish$13,
				...neutral$13,
				...darkSemantic$13,
				"--shiki-token-constant": "#8BE9FD",
				"--shiki-token-string": "#A3BE8C",
				"--shiki-token-comment": "#99A3C4",
				"--shiki-token-keyword": "#FF79C6",
				"--shiki-token-parameter": "#D08770",
				"--shiki-token-function": "#88C0D0",
				"--shiki-token-string-expression": "#A3BE8C",
				"--shiki-token-punctuation": "#8CA0B8",
				"--shiki-token-link": "#88C0D0"
			}
		};
		//#endregion
		//#region src/client/presets/onedark.ts
		const bluish$12 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#383A42", BLUISH_STEPS);
		const neutral$12 = buildScale("--dsw-static-neutral", "#FAFAFA", "#383A42", NEUTRAL_STEPS);
		const lightSemantic$12 = buildSemanticScales({
			deepseek: "#4078F2",
			blue: "#4078F2",
			green: "#50A14F",
			amber: "#C18401",
			red: "#E45649"
		});
		const darkSemantic$12 = buildSemanticScales({
			deepseek: "#61AFEF",
			blue: "#61AFEF",
			green: "#98C379",
			amber: "#E5C07B",
			red: "#E06C75"
		});
		const onedark = {
			label: "One Dark",
			light: {
				...bluish$12,
				...neutral$12,
				...lightSemantic$12,
				"--shiki-token-constant": "#0B7EA4",
				"--shiki-token-string": "#1F7A3A",
				"--shiki-token-comment": "#76808F",
				"--shiki-token-keyword": "#A626A4",
				"--shiki-token-parameter": "#986801",
				"--shiki-token-function": "#4078F2",
				"--shiki-token-string-expression": "#1F7A3A",
				"--shiki-token-punctuation": "#5C6370",
				"--shiki-token-link": "#4078F2"
			},
			dark: {
				...bluish$12,
				...neutral$12,
				...darkSemantic$12,
				"--shiki-token-constant": "#56B6C2",
				"--shiki-token-string": "#98C379",
				"--shiki-token-comment": "#A0A6B0",
				"--shiki-token-keyword": "#C678DD",
				"--shiki-token-parameter": "#D19A66",
				"--shiki-token-function": "#61AFEF",
				"--shiki-token-string-expression": "#98C379",
				"--shiki-token-punctuation": "#ABB2BF",
				"--shiki-token-link": "#61AFEF"
			}
		};
		//#endregion
		//#region src/client/presets/opencode.ts
		const bluish$11 = buildScale("--dsw-static-neutral-bluish", "#F5F5F5", "#0A0A0A", BLUISH_STEPS);
		const neutral$11 = buildScale("--dsw-static-neutral", "#F5F5F5", "#0A0A0A", NEUTRAL_STEPS);
		const lightSemantic$11 = buildSemanticScales({
			deepseek: "#4F46E5",
			blue: "#4F46E5",
			green: "#059669",
			amber: "#D97706",
			red: "#DC2626"
		});
		const darkSemantic$11 = buildSemanticScales({
			deepseek: "#5E6AD2",
			blue: "#5E6AD2",
			green: "#0DBF6A",
			amber: "#FF8A00",
			red: "#FF6467"
		});
		const opencode = {
			label: "OpenCode",
			light: {
				...bluish$11,
				...neutral$11,
				...lightSemantic$11,
				"--shiki-token-constant": "#4F46E5",
				"--shiki-token-string": "#059669",
				"--shiki-token-comment": "#6B7280",
				"--shiki-token-keyword": "#7C3AED",
				"--shiki-token-parameter": "#B45309",
				"--shiki-token-function": "#4F46E5",
				"--shiki-token-string-expression": "#059669",
				"--shiki-token-punctuation": "#27272A",
				"--shiki-token-link": "#4F46E5"
			},
			dark: {
				...bluish$11,
				...neutral$11,
				...darkSemantic$11,
				"--shiki-token-constant": "#5E6AD2",
				"--shiki-token-string": "#0DBF6A",
				"--shiki-token-comment": "#6B7280",
				"--shiki-token-keyword": "#A78BFA",
				"--shiki-token-parameter": "#FF8A00",
				"--shiki-token-function": "#5E6AD2",
				"--shiki-token-string-expression": "#0DBF6A",
				"--shiki-token-punctuation": "#A1A1AA",
				"--shiki-token-link": "#5E6AD2"
			}
		};
		//#endregion
		//#region src/client/presets/orng.ts
		const bluish$10 = buildScale("--dsw-static-neutral-bluish", "#FFF4E6", "#1A0F00", BLUISH_STEPS);
		const neutral$10 = buildScale("--dsw-static-neutral", "#FFF4E6", "#1A0F00", NEUTRAL_STEPS);
		const lightSemantic$10 = buildSemanticScales({
			deepseek: "#9A3412",
			blue: "#9A3412",
			green: "#166534",
			amber: "#EA580C",
			red: "#DC2626"
		});
		const darkSemantic$10 = buildSemanticScales({
			deepseek: "#FF6B00",
			blue: "#FF6B00",
			green: "#22C55E",
			amber: "#FF8A00",
			red: "#F43F5E"
		});
		const orng = {
			label: "Orng",
			light: {
				...bluish$10,
				...neutral$10,
				...lightSemantic$10,
				"--shiki-token-constant": "#9A3412",
				"--shiki-token-string": "#166534",
				"--shiki-token-comment": "#9A8B7A",
				"--shiki-token-keyword": "#C2410C",
				"--shiki-token-parameter": "#EA580C",
				"--shiki-token-function": "#9A3412",
				"--shiki-token-string-expression": "#166534",
				"--shiki-token-punctuation": "#451A03",
				"--shiki-token-link": "#9A3412"
			},
			dark: {
				...bluish$10,
				...neutral$10,
				...darkSemantic$10,
				"--shiki-token-constant": "#FF8A00",
				"--shiki-token-string": "#22C55E",
				"--shiki-token-comment": "#8C6A4A",
				"--shiki-token-keyword": "#FF6B00",
				"--shiki-token-parameter": "#FDBA74",
				"--shiki-token-function": "#FF6B00",
				"--shiki-token-string-expression": "#22C55E",
				"--shiki-token-punctuation": "#FFEFD6",
				"--shiki-token-link": "#FF6B00"
			}
		};
		//#endregion
		//#region src/client/presets/osaka-jade.ts
		const bluish$9 = buildScale("--dsw-static-neutral-bluish", "#F0FAF5", "#0F2A1F", BLUISH_STEPS);
		const neutral$9 = buildScale("--dsw-static-neutral", "#F0FAF5", "#0F2A1F", NEUTRAL_STEPS);
		const lightSemantic$9 = buildSemanticScales({
			deepseek: "#0F6F5C",
			blue: "#0F6F5C",
			green: "#0F6F5C",
			amber: "#8A6A00",
			red: "#9F1239"
		});
		const darkSemantic$9 = buildSemanticScales({
			deepseek: "#00A86B",
			blue: "#00A86B",
			green: "#00A86B",
			amber: "#E6C384",
			red: "#E46876"
		});
		const osakaJade = {
			label: "Osaka Jade",
			light: {
				...bluish$9,
				...neutral$9,
				...lightSemantic$9,
				"--shiki-token-constant": "#0F6F5C",
				"--shiki-token-string": "#0B7A3E",
				"--shiki-token-comment": "#6B8A7A",
				"--shiki-token-keyword": "#0F6F5C",
				"--shiki-token-parameter": "#8A6A00",
				"--shiki-token-function": "#0F6F5C",
				"--shiki-token-string-expression": "#0B7A3E",
				"--shiki-token-punctuation": "#1A3A2A",
				"--shiki-token-link": "#0F6F5C"
			},
			dark: {
				...bluish$9,
				...neutral$9,
				...darkSemantic$9,
				"--shiki-token-constant": "#6A9589",
				"--shiki-token-string": "#98BB6C",
				"--shiki-token-comment": "#6B8A7A",
				"--shiki-token-keyword": "#00A86B",
				"--shiki-token-parameter": "#E6C384",
				"--shiki-token-function": "#00A86B",
				"--shiki-token-string-expression": "#98BB6C",
				"--shiki-token-punctuation": "#D0E8D8",
				"--shiki-token-link": "#7FB4CA"
			}
		};
		//#endregion
		//#region src/client/presets/palenight.ts
		const bluish$8 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#292D3E", BLUISH_STEPS);
		const neutral$8 = buildScale("--dsw-static-neutral", "#FAFAFA", "#292D3E", NEUTRAL_STEPS);
		const lightSemantic$8 = buildSemanticScales({
			deepseek: "#3A4A6B",
			blue: "#3A4A6B",
			green: "#2E7D32",
			amber: "#B47A00",
			red: "#C62828"
		});
		const darkSemantic$8 = buildSemanticScales({
			deepseek: "#82AAFF",
			blue: "#82AAFF",
			green: "#C3E88D",
			amber: "#FFCB6B",
			red: "#F07178"
		});
		const palenight = {
			label: "Palenight",
			light: {
				...bluish$8,
				...neutral$8,
				...lightSemantic$8,
				"--shiki-token-constant": "#3A4A6B",
				"--shiki-token-string": "#2E7D32",
				"--shiki-token-comment": "#6B7C8D",
				"--shiki-token-keyword": "#7C4DFF",
				"--shiki-token-parameter": "#B47A00",
				"--shiki-token-function": "#3A4A6B",
				"--shiki-token-string-expression": "#2E7D32",
				"--shiki-token-punctuation": "#3C435E",
				"--shiki-token-link": "#3A4A6B"
			},
			dark: {
				...bluish$8,
				...neutral$8,
				...darkSemantic$8,
				"--shiki-token-constant": "#FFCB6B",
				"--shiki-token-string": "#C3E88D",
				"--shiki-token-comment": "#676E95",
				"--shiki-token-keyword": "#C792EA",
				"--shiki-token-parameter": "#FFCB6B",
				"--shiki-token-function": "#82AAFF",
				"--shiki-token-string-expression": "#C3E88D",
				"--shiki-token-punctuation": "#A6ACCD",
				"--shiki-token-link": "#82AAFF"
			}
		};
		//#endregion
		//#region src/client/presets/rosepine.ts
		const bluish$7 = buildScale("--dsw-static-neutral-bluish", "#faf4ed", "#191724", BLUISH_STEPS);
		const neutral$7 = buildScale("--dsw-static-neutral", "#faf4ed", "#191724", NEUTRAL_STEPS);
		const lightSemantic$7 = buildSemanticScales({
			deepseek: "#907AA9",
			blue: "#907AA9",
			green: "#286983",
			amber: "#EA9D34",
			red: "#B4637A"
		});
		const darkSemantic$7 = buildSemanticScales({
			deepseek: "#C4A7E7",
			blue: "#C4A7E7",
			green: "#9CCFD8",
			amber: "#F6C177",
			red: "#EB6F92"
		});
		const rosepine = {
			label: "Rosé Pine",
			light: {
				...bluish$7,
				...neutral$7,
				...lightSemantic$7,
				"--shiki-token-constant": "#56949F",
				"--shiki-token-string": "#286983",
				"--shiki-token-comment": "#9893A5",
				"--shiki-token-keyword": "#907AA9",
				"--shiki-token-parameter": "#B4637A",
				"--shiki-token-function": "#907AA9",
				"--shiki-token-string-expression": "#286983",
				"--shiki-token-punctuation": "#575279",
				"--shiki-token-link": "#907AA9"
			},
			dark: {
				...bluish$7,
				...neutral$7,
				...darkSemantic$7,
				"--shiki-token-constant": "#9CCFD8",
				"--shiki-token-string": "#EBBCBA",
				"--shiki-token-comment": "#A19EB0",
				"--shiki-token-keyword": "#C4A7E7",
				"--shiki-token-parameter": "#EB6F92",
				"--shiki-token-function": "#E0DEF4",
				"--shiki-token-string-expression": "#EBBCBA",
				"--shiki-token-punctuation": "#E0DEF4",
				"--shiki-token-link": "#C4A7E7"
			}
		};
		//#endregion
		//#region src/client/presets/solarized.ts
		const bluish$6 = buildScale("--dsw-static-neutral-bluish", "#fdf6e3", "#002b36", BLUISH_STEPS);
		const neutral$6 = buildScale("--dsw-static-neutral", "#fdf6e3", "#002b36", NEUTRAL_STEPS);
		const lightSemantic$6 = buildSemanticScales({
			deepseek: "#268BD2",
			blue: "#268BD2",
			green: "#859900",
			amber: "#B58900",
			red: "#DC322F"
		});
		const darkSemantic$6 = buildSemanticScales({
			deepseek: "#78B7E3",
			blue: "#78B7E3",
			green: "#B3C061",
			amber: "#D1B661",
			red: "#E9807E"
		});
		const solarized = {
			label: "Solarized",
			light: {
				...bluish$6,
				...neutral$6,
				...lightSemantic$6,
				"--shiki-token-constant": "#2AA198",
				"--shiki-token-string": "#586E75",
				"--shiki-token-comment": "#93A1A1",
				"--shiki-token-keyword": "#859900",
				"--shiki-token-parameter": "#CB4B16",
				"--shiki-token-function": "#268BD2",
				"--shiki-token-string-expression": "#2AA198",
				"--shiki-token-punctuation": "#657B83",
				"--shiki-token-link": "#268BD2"
			},
			dark: {
				...bluish$6,
				...neutral$6,
				...darkSemantic$6,
				"--shiki-token-constant": "#66BBB5",
				"--shiki-token-string": "#859900",
				"--shiki-token-comment": "#92A1A5",
				"--shiki-token-keyword": "#268BD2",
				"--shiki-token-parameter": "#DA7D57",
				"--shiki-token-function": "#B58900",
				"--shiki-token-string-expression": "#66BBB5",
				"--shiki-token-punctuation": "#93A1A1",
				"--shiki-token-link": "#63ABDF"
			}
		};
		//#endregion
		//#region src/client/presets/synthwave84.ts
		const bluish$5 = buildScale("--dsw-static-neutral-bluish", "#F5F0FF", "#262335", BLUISH_STEPS);
		const neutral$5 = buildScale("--dsw-static-neutral", "#F5F0FF", "#262335", NEUTRAL_STEPS);
		const lightSemantic$5 = buildSemanticScales({
			deepseek: "#6B21A8",
			blue: "#6B21A8",
			green: "#0E7A5A",
			amber: "#9A6A00",
			red: "#C0265A"
		});
		const darkSemantic$5 = buildSemanticScales({
			deepseek: "#FF7EDB",
			blue: "#FF7EDB",
			green: "#36F9F6",
			amber: "#FEDE5D",
			red: "#F97E72"
		});
		const synthwave84 = {
			label: "Synthwave 84",
			light: {
				...bluish$5,
				...neutral$5,
				...lightSemantic$5,
				"--shiki-token-constant": "#6B21A8",
				"--shiki-token-string": "#0E7A5A",
				"--shiki-token-comment": "#8A7FA8",
				"--shiki-token-keyword": "#C0265A",
				"--shiki-token-parameter": "#9A6A00",
				"--shiki-token-function": "#6B21A8",
				"--shiki-token-string-expression": "#0E7A5A",
				"--shiki-token-punctuation": "#3A2E4A",
				"--shiki-token-link": "#6B21A8"
			},
			dark: {
				...bluish$5,
				...neutral$5,
				...darkSemantic$5,
				"--shiki-token-constant": "#FEDE5D",
				"--shiki-token-string": "#36F9F6",
				"--shiki-token-comment": "#848BBD",
				"--shiki-token-keyword": "#FF7EDB",
				"--shiki-token-parameter": "#FEDE5D",
				"--shiki-token-function": "#FF7EDB",
				"--shiki-token-string-expression": "#36F9F6",
				"--shiki-token-punctuation": "#FFFFFF",
				"--shiki-token-link": "#36F9F6"
			}
		};
		//#endregion
		//#region src/client/presets/system.ts
		const bluish$4 = buildScale("--dsw-static-neutral-bluish", "#F5F5F7", "#1C1C1E", BLUISH_STEPS);
		const neutral$4 = buildScale("--dsw-static-neutral", "#F5F5F7", "#1C1C1E", NEUTRAL_STEPS);
		const lightSemantic$4 = buildSemanticScales({
			deepseek: "#007AFF",
			blue: "#007AFF",
			green: "#34C759",
			amber: "#FF9500",
			red: "#FF3B30"
		});
		const darkSemantic$4 = buildSemanticScales({
			deepseek: "#0A84FF",
			blue: "#0A84FF",
			green: "#30D158",
			amber: "#FF9F0A",
			red: "#FF453A"
		});
		const system = {
			label: "System",
			light: {
				...bluish$4,
				...neutral$4,
				...lightSemantic$4,
				"--shiki-token-constant": "#007AFF",
				"--shiki-token-string": "#34C759",
				"--shiki-token-comment": "#8E8E93",
				"--shiki-token-keyword": "#AF52DE",
				"--shiki-token-parameter": "#FF9500",
				"--shiki-token-function": "#007AFF",
				"--shiki-token-string-expression": "#34C759",
				"--shiki-token-punctuation": "#1C1C1E",
				"--shiki-token-link": "#007AFF"
			},
			dark: {
				...bluish$4,
				...neutral$4,
				...darkSemantic$4,
				"--shiki-token-constant": "#0A84FF",
				"--shiki-token-string": "#30D158",
				"--shiki-token-comment": "#8E8E93",
				"--shiki-token-keyword": "#BF5AF2",
				"--shiki-token-parameter": "#FF9F0A",
				"--shiki-token-function": "#0A84FF",
				"--shiki-token-string-expression": "#30D158",
				"--shiki-token-punctuation": "#F5F5F7",
				"--shiki-token-link": "#0A84FF"
			}
		};
		//#endregion
		//#region src/client/presets/tokyonight.ts
		const bluish$3 = buildScale("--dsw-static-neutral-bluish", "#e6e7ed", "#1a1b26", BLUISH_STEPS);
		const neutral$3 = buildScale("--dsw-static-neutral", "#e6e7ed", "#1a1b26", NEUTRAL_STEPS);
		const lightSemantic$3 = buildSemanticScales({
			deepseek: "#34548A",
			blue: "#34548A",
			green: "#33635C",
			amber: "#8F5E15",
			red: "#C53B53"
		});
		const darkSemantic$3 = buildSemanticScales({
			deepseek: "#7AA2F7",
			blue: "#7AA2F7",
			green: "#9ECE6A",
			amber: "#E0AF68",
			red: "#F7768E"
		});
		const tokyonight = {
			label: "Tokyo Night",
			light: {
				...bluish$3,
				...neutral$3,
				...lightSemantic$3,
				"--shiki-token-constant": "#0F4B6E",
				"--shiki-token-string": "#1A7A3A",
				"--shiki-token-comment": "#6E7A9E",
				"--shiki-token-keyword": "#8C4351",
				"--shiki-token-parameter": "#965027",
				"--shiki-token-function": "#34548A",
				"--shiki-token-string-expression": "#1A7A3A",
				"--shiki-token-punctuation": "#5A638C",
				"--shiki-token-link": "#34548A"
			},
			dark: {
				...bluish$3,
				...neutral$3,
				...darkSemantic$3,
				"--shiki-token-constant": "#7DCFFF",
				"--shiki-token-string": "#9ECE6A",
				"--shiki-token-comment": "#9197B2",
				"--shiki-token-keyword": "#BB9AF7",
				"--shiki-token-parameter": "#FF9E64",
				"--shiki-token-function": "#7AA2F7",
				"--shiki-token-string-expression": "#9ECE6A",
				"--shiki-token-punctuation": "#C0CAF5",
				"--shiki-token-link": "#7AA2F7"
			}
		};
		//#endregion
		//#region src/client/presets/vercel.ts
		const bluish$2 = buildScale("--dsw-static-neutral-bluish", "#FFFFFF", "#000000", BLUISH_STEPS);
		const neutral$2 = buildScale("--dsw-static-neutral", "#FFFFFF", "#000000", NEUTRAL_STEPS);
		const lightSemantic$2 = buildSemanticScales({
			deepseek: "#0070F3",
			blue: "#0070F3",
			green: "#0A7A42",
			amber: "#B45309",
			red: "#E00C1A"
		});
		const darkSemantic$2 = buildSemanticScales({
			deepseek: "#3291FF",
			blue: "#3291FF",
			green: "#0CCB6A",
			amber: "#F5A623",
			red: "#FF6166"
		});
		const vercel = {
			label: "Vercel",
			light: {
				...bluish$2,
				...neutral$2,
				...lightSemantic$2,
				"--shiki-token-constant": "#0070F3",
				"--shiki-token-string": "#0A7A42",
				"--shiki-token-comment": "#8A8A8A",
				"--shiki-token-keyword": "#000000",
				"--shiki-token-parameter": "#B45309",
				"--shiki-token-function": "#0070F3",
				"--shiki-token-string-expression": "#0A7A42",
				"--shiki-token-punctuation": "#000000",
				"--shiki-token-link": "#0070F3"
			},
			dark: {
				...bluish$2,
				...neutral$2,
				...darkSemantic$2,
				"--shiki-token-constant": "#3291FF",
				"--shiki-token-string": "#0CCB6A",
				"--shiki-token-comment": "#8A8A8A",
				"--shiki-token-keyword": "#FFFFFF",
				"--shiki-token-parameter": "#F5A623",
				"--shiki-token-function": "#3291FF",
				"--shiki-token-string-expression": "#0CCB6A",
				"--shiki-token-punctuation": "#FFFFFF",
				"--shiki-token-link": "#3291FF"
			}
		};
		//#endregion
		//#region src/client/presets/vesper.ts
		const bluish$1 = buildScale("--dsw-static-neutral-bluish", "#FDFCFB", "#0A0A0B", BLUISH_STEPS);
		const neutral$1 = buildScale("--dsw-static-neutral", "#FDFCFB", "#0A0A0B", NEUTRAL_STEPS);
		const lightSemantic$1 = buildSemanticScales({
			deepseek: "#3A3A3A",
			blue: "#3A3A3A",
			green: "#5A7A3A",
			amber: "#8A6A2E",
			red: "#8A2A2E"
		});
		const darkSemantic$1 = buildSemanticScales({
			deepseek: "#E8E8E8",
			blue: "#E8E8E8",
			green: "#B8C8A8",
			amber: "#D6C8A8",
			red: "#C9A8A8"
		});
		const vesper = {
			label: "Vesper",
			light: {
				...bluish$1,
				...neutral$1,
				...lightSemantic$1,
				"--shiki-token-constant": "#3A3A3A",
				"--shiki-token-string": "#5A7A3A",
				"--shiki-token-comment": "#8A8A8A",
				"--shiki-token-keyword": "#3A3A3A",
				"--shiki-token-parameter": "#8A6A2E",
				"--shiki-token-function": "#3A3A3A",
				"--shiki-token-string-expression": "#5A7A3A",
				"--shiki-token-punctuation": "#2A2A2A",
				"--shiki-token-link": "#3A3A3A"
			},
			dark: {
				...bluish$1,
				...neutral$1,
				...darkSemantic$1,
				"--shiki-token-constant": "#E8E8E8",
				"--shiki-token-string": "#B8C8A8",
				"--shiki-token-comment": "#8A8A8A",
				"--shiki-token-keyword": "#E8E8E8",
				"--shiki-token-parameter": "#D6C8A8",
				"--shiki-token-function": "#E8E8E8",
				"--shiki-token-string-expression": "#B8C8A8",
				"--shiki-token-punctuation": "#E8E8E8",
				"--shiki-token-link": "#E8E8E8"
			}
		};
		//#endregion
		//#region src/client/presets/zenburn.ts
		const bluish = buildScale("--dsw-static-neutral-bluish", "#FFFFEF", "#3f3f3f", BLUISH_STEPS);
		const neutral = buildScale("--dsw-static-neutral", "#FFFFEF", "#3f3f3f", NEUTRAL_STEPS);
		const lightSemantic = buildSemanticScales({
			deepseek: "#2B6F6F",
			blue: "#2B6F6F",
			green: "#4A6F4A",
			amber: "#8F7A3A",
			red: "#8C3333"
		});
		const darkSemantic = buildSemanticScales({
			deepseek: "#8CD0D3",
			blue: "#8CD0D3",
			green: "#7F9F7F",
			amber: "#D0BF8F",
			red: "#CC9393"
		});
		//#endregion
		//#region src/client/presets.ts
		/**
		* Every shipped preset, one entry per {@link PRESET_IDS} name. The mapped type
		* makes the two lists agree at compile time: a preset without a colour map, or a
		* name with no entry here, is a type error rather than a theme that goes missing
		* from the picker (or from an import's validation).
		*/
		const PRESETS = {
			aura,
			ayu,
			catppuccin,
			"catppuccin-frappe": catppuccinFrappe,
			"catppuccin-macchiato": catppuccinMacchiato,
			cobalt2,
			cursor,
			dracula,
			dsh,
			everforest,
			flexoki,
			github,
			gruvbox,
			kanagawa,
			"lucent-orng": lucentOrng,
			material,
			matrix,
			mercury,
			monokai,
			nightowl,
			nord,
			onedark,
			opencode,
			orng,
			"osaka-jade": osakaJade,
			palenight,
			rosepine,
			solarized,
			synthwave84,
			system,
			tokyonight,
			vercel,
			vesper,
			zenburn: {
				label: "Zenburn",
				light: {
					...bluish,
					...neutral,
					...lightSemantic,
					"--shiki-token-constant": "#2B6F6F",
					"--shiki-token-string": "#8C3333",
					"--shiki-token-comment": "#7A8A7A",
					"--shiki-token-keyword": "#705040",
					"--shiki-token-parameter": "#8F5A00",
					"--shiki-token-function": "#2B6F6F",
					"--shiki-token-string-expression": "#8C3333",
					"--shiki-token-punctuation": "#5F6F5F",
					"--shiki-token-link": "#2B6F6F"
				},
				dark: {
					...bluish,
					...neutral,
					...darkSemantic,
					"--shiki-token-constant": "#8CD0D3",
					"--shiki-token-string": "#CC9393",
					"--shiki-token-comment": "#7F9F7F",
					"--shiki-token-keyword": "#F0DFAF",
					"--shiki-token-parameter": "#D0BF8F",
					"--shiki-token-function": "#8CD0D3",
					"--shiki-token-string-expression": "#CC9393",
					"--shiki-token-punctuation": "#DCDCCC",
					"--shiki-token-link": "#8CD0D3"
				}
			}
		};
		/**
		* Presets that override nothing: the shell keeps its own colours. The single
		* source of this set, so the token layer and the panel cannot drift on it.
		*/
		const NOOP_PRESET_IDS = /* @__PURE__ */ new Set(["native", "dsh"]);
		const presetOptions = [{
			value: "dsh",
			label: PRESETS.dsh.label
		}, ...PRESET_IDS.filter((id) => id !== "dsh").map((id) => ({
			value: id,
			label: PRESETS[id].label
		}))];
		//#endregion
		//#region src/client/css/primitives.ts
		const PRIMITIVES_LIGHT = {
			"--dsw-static-amber-100": "rgb(254, 245, 231)",
			"--dsw-static-amber-400": "rgb(247, 173, 49)",
			"--dsw-static-amber-500": "rgb(245, 158, 11)",
			"--dsw-static-amber-600": "rgb(221, 134, 41)",
			"--dsw-static-amber-900": "rgb(39, 36, 31)",
			"--dsw-static-blue-100": "rgb(219, 234, 254)",
			"--dsw-static-blue-300": "rgb(147, 197, 253)",
			"--dsw-static-blue-400": "rgb(96, 165, 250)",
			"--dsw-static-blue-450": "rgb(77, 147, 248)",
			"--dsw-static-blue-500": "rgb(59, 130, 246)",
			"--dsw-static-blue-50": "rgb(239, 246, 255)",
			"--dsw-static-blue-50p": "rgb(234, 243, 255)",
			"--dsw-static-blue-600": "rgb(37, 99, 235)",
			"--dsw-static-blue-75": "rgb(229, 240, 255)",
			"--dsw-static-blue-800": "rgb(30, 64, 175)",
			"--dsw-static-blue-900": "rgb(14, 48, 116)",
			"--dsw-static-blue-950": "rgb(23, 37, 84)",
			"--dsw-static-deepseek-100": "rgb(228, 237, 253)",
			"--dsw-static-deepseek-200": "rgb(211, 226, 255)",
			"--dsw-static-deepseek-300": "rgb(183, 200, 254)",
			"--dsw-static-deepseek-400": "rgb(103, 158, 254)",
			"--dsw-static-deepseek-450": "rgb(86, 134, 254)",
			"--dsw-static-deepseek-500": "rgb(65, 118, 230)",
			"--dsw-static-deepseek-50": "rgb(237, 243, 254)",
			"--dsw-static-deepseek-600": "rgb(72, 104, 178)",
			"--dsw-static-deepseek-700-delete": "rgb(47, 76, 143)",
			"--dsw-static-deepseek-800": "rgb(52, 65, 91)",
			"--dsw-static-deepseek-900": "rgb(40, 49, 66)",
			"--dsw-static-green-100": "rgb(230, 250, 237)",
			"--dsw-static-green-400": "rgb(78, 209, 126)",
			"--dsw-static-green-500": "rgb(34, 197, 94)",
			"--dsw-static-green-900": "rgb(35, 60, 44)",
			"--dsw-static-neutral-00": "rgb(255, 255, 255)",
			"--dsw-static-neutral-1000": "rgb(0, 0, 0)",
			"--dsw-static-neutral-100": "rgb(245, 245, 245)",
			"--dsw-static-neutral-150": "rgb(237, 237, 237)",
			"--dsw-static-neutral-200": "rgb(229, 229, 229)",
			"--dsw-static-neutral-250": "rgb(220, 220, 220)",
			"--dsw-static-neutral-300": "rgb(212, 212, 212)",
			"--dsw-static-neutral-400": "rgb(162, 164, 166)",
			"--dsw-static-neutral-500": "rgb(127, 130, 135)",
			"--dsw-static-neutral-50": "rgb(250, 250, 250)",
			"--dsw-static-neutral-550": "rgb(101, 103, 107)",
			"--dsw-static-neutral-600": "rgb(84, 85, 87)",
			"--dsw-static-neutral-700": "rgb(60, 60, 61)",
			"--dsw-static-neutral-800": "rgb(41, 41, 41)",
			"--dsw-static-neutral-850": "rgb(33, 33, 35)",
			"--dsw-static-neutral-900": "rgb(15, 15, 15)",
			"--dsw-static-neutral-bluish-00": "rgb(255, 255, 255)",
			"--dsw-static-neutral-bluish-1000": "rgb(15, 17, 21)",
			"--dsw-static-neutral-bluish-100": "rgb(235, 238, 242)",
			"--dsw-static-neutral-bluish-150": "rgb(233, 236, 242)",
			"--dsw-static-neutral-bluish-200": "rgb(225, 229, 238)",
			"--dsw-static-neutral-bluish-300": "rgb(207, 211, 214)",
			"--dsw-static-neutral-bluish-400": "rgb(173, 178, 184)",
			"--dsw-static-neutral-bluish-500": "rgb(151, 157, 166)",
			"--dsw-static-neutral-bluish-50": "rgb(249, 250, 251)",
			"--dsw-static-neutral-bluish-600": "rgb(129, 133, 140)",
			"--dsw-static-neutral-bluish-60": "rgb(245, 246, 247)",
			"--dsw-static-neutral-bluish-700": "rgb(97, 102, 107)",
			"--dsw-static-neutral-bluish-750": "rgb(67, 69, 74)",
			"--dsw-static-neutral-bluish-75": "rgb(241, 243, 245)",
			"--dsw-static-neutral-bluish-800": "rgb(53, 54, 56)",
			"--dsw-static-neutral-bluish-850": "rgb(44, 44, 46)",
			"--dsw-static-neutral-bluish-875": "rgb(35, 35, 36)",
			"--dsw-static-neutral-bluish-900": "rgb(27, 27, 28)",
			"--dsw-static-neutral-bluish-950": "rgb(21, 21, 23)",
			"--dsw-static-red-100": "rgb(254, 226, 226)",
			"--dsw-static-red-400": "rgb(242, 90, 90)",
			"--dsw-static-red-500": "rgb(239, 68, 68)",
			"--dsw-static-red-50": "rgb(254, 242, 242)",
			"--dsw-static-red-600": "rgb(236, 19, 19)",
			"--dsw-static-red-900": "rgb(87, 12, 12)"
		};
		const PRIMITIVES_DARK = {
			...PRIMITIVES_LIGHT,
			"--dsw-static-neutral-00": "rgb(21, 21, 23)",
			"--dsw-static-neutral-1000": "rgb(255, 255, 255)",
			"--dsw-static-neutral-100": "rgb(27, 27, 28)",
			"--dsw-static-neutral-150": "rgb(35, 35, 36)",
			"--dsw-static-neutral-200": "rgb(44, 44, 46)",
			"--dsw-static-neutral-250": "rgb(53, 54, 56)",
			"--dsw-static-neutral-300": "rgb(67, 69, 74)",
			"--dsw-static-neutral-400": "rgb(97, 102, 107)",
			"--dsw-static-neutral-500": "rgb(129, 133, 140)",
			"--dsw-static-neutral-50": "rgb(33, 33, 35)",
			"--dsw-static-neutral-550": "rgb(151, 157, 166)",
			"--dsw-static-neutral-600": "rgb(173, 178, 184)",
			"--dsw-static-neutral-700": "rgb(207, 211, 214)",
			"--dsw-static-neutral-800": "rgb(225, 229, 238)",
			"--dsw-static-neutral-850": "rgb(235, 238, 242)",
			"--dsw-static-neutral-900": "rgb(241, 243, 245)",
			"--dsw-static-neutral-bluish-00": "rgb(21, 21, 23)",
			"--dsw-static-neutral-bluish-1000": "rgb(255, 255, 255)",
			"--dsw-static-neutral-bluish-100": "rgb(53, 54, 56)",
			"--dsw-static-neutral-bluish-150": "rgb(67, 69, 74)",
			"--dsw-static-neutral-bluish-200": "rgb(97, 102, 107)",
			"--dsw-static-neutral-bluish-300": "rgb(129, 133, 140)",
			"--dsw-static-neutral-bluish-400": "rgb(151, 157, 166)",
			"--dsw-static-neutral-bluish-50": "rgb(27, 27, 28)",
			"--dsw-static-neutral-bluish-500": "rgb(173, 178, 184)",
			"--dsw-static-neutral-bluish-600": "rgb(207, 211, 214)",
			"--dsw-static-neutral-bluish-60": "rgb(35, 35, 36)",
			"--dsw-static-neutral-bluish-700": "rgb(225, 229, 238)",
			"--dsw-static-neutral-bluish-750": "rgb(233, 236, 242)",
			"--dsw-static-neutral-bluish-75": "rgb(44, 44, 46)",
			"--dsw-static-neutral-bluish-800": "rgb(235, 238, 242)",
			"--dsw-static-neutral-bluish-850": "rgb(241, 243, 245)",
			"--dsw-static-neutral-bluish-875": "rgb(245, 246, 247)",
			"--dsw-static-neutral-bluish-900": "rgb(249, 250, 251)",
			"--dsw-static-neutral-bluish-950": "rgb(255, 255, 255)"
		};
		function buildPrimitivesCss(light = PRIMITIVES_LIGHT, dark = PRIMITIVES_DARK) {
			const toBlock = (selector, map) => `${selector} {\n${Object.entries(map).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;
			return `${toBlock(":root", light)}\n\n${toBlock("html[data-ds-dark-theme], body[data-ds-dark-theme]", dark)}`;
		}
		function primitiveOverrides(light, dark) {
			const out = {};
			const keys = /* @__PURE__ */ new Set([...Object.keys(light), ...Object.keys(dark)]);
			for (const k of keys) out[k] = {
				light: light[k] ?? dark[k],
				dark: dark[k] ?? light[k]
			};
			return out;
		}
		//#endregion
		//#region src/client/css/shiki.ts
		/**
		* Shiki token palette: values behind --shiki-* custom properties emitted by
		* ui-primitives CodeBlock. Light values on :root, dark overrides on
		* body[data-ds-dark-theme] — same cascade as every other token sheet.
		*
		* Background/foreground alias the markdown code-block tokens so highlighted
		* and plain blocks agree.
		* Dark selector covers both html and body for DSH compatibility.
		*/
		const SHIKI_CSS = `
:root {
  --shiki-foreground: var(--dsw-alias-label-primary);
  --shiki-background: var(--dsw-alias-markdown-code-block);
  --shiki-token-constant: #1c7ed6;
  --shiki-token-string: #2f9e44;
  --shiki-token-comment: #868e96;
  --shiki-token-keyword: #d6336c;
  --shiki-token-parameter: #e8590c;
  --shiki-token-function: #6741d9;
  --shiki-token-string-expression: #2b8a3e;
  --shiki-token-punctuation: #495057;
  --shiki-token-link: #1971c2;
}

html[data-ds-dark-theme], body[data-ds-dark-theme] {
  --shiki-token-constant: #4dabf7;
  --shiki-token-string: #69db7c;
  --shiki-token-comment: #adb5bd;
  --shiki-token-keyword: #faa2c1;
  --shiki-token-parameter: #ffa94d;
  --shiki-token-function: #b197fc;
  --shiki-token-string-expression: #8ce99a;
  --shiki-token-punctuation: #ced4da;
  --shiki-token-link: #74c0fc;
}
`;
		//#endregion
		//#region src/client/tokens.ts
		function buildBaseCss() {
			return `${buildPrimitivesCss()}\n\n${SHIKI_CSS}`;
		}
		/**
		* Accepts either a preset id or an already-built `PresetDef` (what a custom
		* theme produces). Both go through the identical merge, so a custom theme is
		* not a special case anywhere downstream.
		*/
		function resolvePreset(src) {
			let preset;
			if (typeof src === "string") {
				if (NOOP_PRESET_IDS.has(src)) return null;
				preset = PRESETS[src] ?? null;
			} else preset = src;
			if (!preset) return null;
			return {
				light: {
					...PRIMITIVES_LIGHT,
					...preset.light
				},
				dark: {
					...PRIMITIVES_DARK,
					...preset.dark
				}
			};
		}
		function buildOverrides(src) {
			const resolved = resolvePreset(src);
			if (!resolved) return {};
			return primitiveOverrides(resolved.light, resolved.dark);
		}
		function buildFullCssFallback(src) {
			const resolved = resolvePreset(src);
			if (!resolved) return "";
			return buildPrimitivesCss(resolved.light, resolved.dark);
		}
		//#endregion
		//#region src/client/style-injector.ts
		function createStyleInjector() {
			const disposers = /* @__PURE__ */ new Set();
			function track(dispose) {
				const wrapped = () => {
					try {
						dispose();
					} catch {}
					disposers.delete(wrapped);
				};
				disposers.add(wrapped);
				return wrapped;
			}
			function insert(css) {
				try {
					if (typeof styles !== "undefined" && typeof styles.insert === "function") {
						const dispose = styles.insert(css);
						if (typeof dispose === "function") return track(dispose);
					}
				} catch {}
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-cool-theme";
				tag.textContent = css;
				document.head.appendChild(tag);
				return track(() => tag.remove());
			}
			function disposeAll() {
				for (const d of [...disposers]) try {
					d();
				} catch {}
				disposers.clear();
			}
			return {
				insert,
				disposeAll
			};
		}
		//#endregion
		//#region node_modules/.pnpm/react-colorful@5.8.1_react-dom@19.3.0_react@18.3.1__react@18.3.1/node_modules/react-colorful/dist/index.mjs
		function l() {
			return (l = Object.assign || function(e) {
				for (var r = 1; r < arguments.length; r++) {
					var n = arguments[r];
					for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
				}
				return e;
			}).apply(this, arguments);
		}
		function c(e, r) {
			if (null == e) return {};
			var n, t, o = {}, a = Object.keys(e);
			for (t = 0; t < a.length; t++) r.indexOf(n = a[t]) >= 0 || (o[n] = e[n]);
			return o;
		}
		function i(e) {
			var n = (0, react.useRef)(e), t = (0, react.useRef)(function(e) {
				n.current && n.current(e);
			});
			return n.current = e, t.current;
		}
		var s = function(e, r, n) {
			return void 0 === r && (r = 0), void 0 === n && (n = 1), e > n ? n : e < r ? r : e;
		};
		var f = function(e) {
			return "touches" in e;
		};
		var d = function(e) {
			return e && e.ownerDocument.defaultView || self;
		};
		var v = function(e, r, n) {
			var t = e.getBoundingClientRect(), o = f(r) ? function(e, r) {
				for (var n = 0; n < e.length; n++) if (e[n].identifier === r) return e[n];
				return e[0];
			}(r.touches, n) : r;
			return {
				left: s((o.pageX - (t.left + d(e).pageXOffset)) / t.width),
				top: s((o.pageY - (t.top + d(e).pageYOffset)) / t.height)
			};
		};
		var h = function(e) {
			!f(e) && e.preventDefault();
		};
		var g = react.default.memo(function(o) {
			var a = o.onMove, u = o.onKey, s = o.onEnd, g = c(o, [
				"onMove",
				"onKey",
				"onEnd"
			]), m = (0, react.useRef)(null), p = i(a), b = i(u), _ = i(s), E = (0, react.useRef)(null), C = (0, react.useRef)(!1), x = (0, react.useMemo)(function() {
				var e = function(e) {
					h(e), (f(e) ? e.touches.length > 0 : e.buttons > 0) && m.current ? p(v(m.current, e, E.current)) : (n(!1), _());
				}, r = function() {
					n(!1), _();
				};
				function n(n) {
					var t = C.current, o = d(m.current), a = n ? o.addEventListener : o.removeEventListener;
					a(t ? "touchmove" : "mousemove", e), a(t ? "touchend" : "mouseup", r);
				}
				return [
					function(e) {
						var r = e.nativeEvent, t = m.current;
						if (t && (h(r), !function(e, r) {
							return r && !f(e);
						}(r, C.current) && t)) {
							if (f(r)) {
								C.current = !0;
								var o = r.changedTouches || [];
								o.length && (E.current = o[0].identifier);
							}
							t.focus(), p(v(t, r, E.current)), n(!0);
						}
					},
					function(e) {
						var r = e.which || e.keyCode;
						r < 37 || r > 40 || (e.preventDefault(), b({
							left: 39 === r ? .05 : 37 === r ? -.05 : 0,
							top: 40 === r ? .05 : 38 === r ? -.05 : 0
						}));
					},
					function(e) {
						var r = e.which || e.keyCode;
						r >= 37 && r <= 40 && _();
					},
					n
				];
			}, [
				b,
				p,
				_
			]), H = x[0], M = x[1], N = x[2], w = x[3];
			return (0, react.useEffect)(function() {
				return w;
			}, [w]), react.default.createElement("div", l({}, g, {
				onTouchStart: H,
				onMouseDown: H,
				className: "react-colorful__interactive",
				ref: m,
				onKeyDown: M,
				onKeyUp: N,
				tabIndex: 0,
				role: "slider"
			}));
		});
		var m = function(e) {
			return e.filter(Boolean).join(" ");
		};
		var p = function(r) {
			var n = r.color, t = r.left, o = r.top, a = void 0 === o ? .5 : o, u = m(["react-colorful__pointer", r.className]);
			return react.default.createElement("div", {
				className: u,
				style: {
					top: 100 * a + "%",
					left: 100 * t + "%"
				}
			}, react.default.createElement("div", {
				className: "react-colorful__pointer-fill",
				style: { backgroundColor: n }
			}));
		};
		var b = function(e, r, n) {
			return void 0 === r && (r = 0), void 0 === n && (n = Math.pow(10, r)), Math.round(n * e) / n;
		};
		360 / (2 * Math.PI);
		var E = function(e) {
			return L(C(e));
		};
		var C = function(e) {
			return "#" === e[0] && (e = e.substring(1)), e.length < 6 ? {
				r: parseInt(e[0] + e[0], 16),
				g: parseInt(e[1] + e[1], 16),
				b: parseInt(e[2] + e[2], 16),
				a: 4 === e.length ? b(parseInt(e[3] + e[3], 16) / 255, 2) : 1
			} : {
				r: parseInt(e.substring(0, 2), 16),
				g: parseInt(e.substring(2, 4), 16),
				b: parseInt(e.substring(4, 6), 16),
				a: 8 === e.length ? b(parseInt(e.substring(6, 8), 16) / 255, 2) : 1
			};
		};
		var w = function(e) {
			return B(I(e));
		};
		var y = function(e) {
			var r = e.s, n = e.v, t = e.a, o = (200 - r) * n / 100;
			return {
				h: b(e.h),
				s: b(o > 0 && o < 200 ? r * n / 100 / (o <= 100 ? o : 200 - o) * 100 : 0),
				l: b(o / 2),
				a: b(t, 2)
			};
		};
		var k = function(e) {
			var r = y(e);
			return "hsl(" + r.h + ", " + r.s + "%, " + r.l + "%)";
		};
		var I = function(e) {
			var r = e.h, n = e.s, t = e.v, o = e.a;
			r = r / 360 * 6, n /= 100, t /= 100;
			var a = Math.floor(r), u = t * (1 - n), l = t * (1 - (r - a) * n), c = t * (1 - (1 - r + a) * n), i = a % 6;
			return {
				r: b(255 * [
					t,
					l,
					u,
					u,
					c,
					t
				][i]),
				g: b(255 * [
					c,
					t,
					t,
					l,
					u,
					u
				][i]),
				b: b(255 * [
					u,
					u,
					c,
					t,
					t,
					l
				][i]),
				a: b(o, 2)
			};
		};
		var K = function(e) {
			var r = e.toString(16);
			return r.length < 2 ? "0" + r : r;
		};
		var B = function(e) {
			var r = e.r, n = e.g, t = e.b, o = e.a, a = o < 1 ? K(b(255 * o)) : "";
			return "#" + K(r) + K(n) + K(t) + a;
		};
		var L = function(e) {
			var r = e.r, n = e.g, t = e.b, o = e.a, a = Math.max(r, n, t), u = a - Math.min(r, n, t), l = u ? a === r ? (n - t) / u : a === n ? 2 + (t - r) / u : 4 + (r - n) / u : 0;
			return {
				h: 60 * (l < 0 ? l + 6 : l),
				s: a ? u / a * 100 : 0,
				v: a / 255 * 100,
				a: o
			};
		};
		var R = react.default.memo(function(r) {
			var n = r.hue, t = r.onChange, o = r.onChangeEnd, a = m(["react-colorful__hue", r.className]);
			return react.default.createElement("div", { className: a }, react.default.createElement(g, {
				onMove: function(e) {
					t({ h: 360 * e.left });
				},
				onKey: function(e) {
					t({ h: s(n + 360 * e.left, 0, 360) });
				},
				onEnd: o,
				"aria-label": "Hue",
				"aria-valuenow": b(n),
				"aria-valuemax": "360",
				"aria-valuemin": "0"
			}, react.default.createElement(p, {
				className: "react-colorful__hue-pointer",
				left: n / 360,
				color: k({
					h: n,
					s: 100,
					v: 100,
					a: 1
				})
			})));
		});
		var S = react.default.memo(function(r) {
			var n = r.hsva, t = r.onChange, o = r.onChangeEnd, a = { backgroundColor: k({
				h: n.h,
				s: 100,
				v: 100,
				a: 1
			}) };
			return react.default.createElement("div", {
				className: "react-colorful__saturation",
				style: a
			}, react.default.createElement(g, {
				onMove: function(e) {
					t({
						s: 100 * e.left,
						v: 100 - 100 * e.top
					});
				},
				onKey: function(e) {
					t({
						s: s(n.s + 100 * e.left, 0, 100),
						v: s(n.v - 100 * e.top, 0, 100)
					});
				},
				onEnd: o,
				"aria-label": "Color",
				"aria-valuetext": "Saturation " + b(n.s) + "%, Brightness " + b(n.v) + "%"
			}, react.default.createElement(p, {
				className: "react-colorful__saturation-pointer",
				top: 1 - n.v / 100,
				left: n.s / 100,
				color: k(n)
			})));
		});
		var T = function(e, r) {
			if (e === r) return !0;
			for (var n in e) if (e[n] !== r[n]) return !1;
			return !0;
		};
		var P = function(e, r) {
			return e.toLowerCase() === r.toLowerCase() || T(C(e), C(r));
		};
		function X(e, n, u, l) {
			var c = i(u), s = i(l), f = (0, react.useState)(function() {
				return e.toHsva(n);
			}), d = f[0], v = f[1], h = (0, react.useRef)({
				color: n,
				hsva: d
			}), g = (0, react.useRef)(!1);
			(0, react.useEffect)(function() {
				if (!e.equal(n, h.current.color)) {
					var r = e.toHsva(n);
					h.current = {
						hsva: r,
						color: n
					}, v(r), g.current = !1;
				}
			}, [n, e]), (0, react.useEffect)(function() {
				var r;
				T(d, h.current.hsva) || e.equal(r = e.fromHsva(d), h.current.color) || (h.current = {
					hsva: d,
					color: r
				}, c(r), g.current = !0);
			}, [
				d,
				e,
				c
			]);
			return [
				d,
				(0, react.useCallback)(function(e) {
					v(function(r) {
						return Object.assign({}, r, e);
					});
				}, []),
				(0, react.useCallback)(function() {
					g.current && (g.current = !1, s(h.current.color));
				}, [s])
			];
		}
		var Y;
		var U = "undefined" != typeof window ? react.useLayoutEffect : react.useEffect;
		var V = function() {
			return Y || ("undefined" != typeof __webpack_nonce__ ? __webpack_nonce__ : void 0);
		};
		var $ = /* @__PURE__ */ new WeakMap();
		var G = function(e) {
			U(function() {
				var r = e.current;
				if ("undefined" != typeof document && r) {
					var n = r.getRootNode ? r.getRootNode() : r.ownerDocument, t = n && ("head" in n || "host" in n) ? n : r.ownerDocument;
					if (!$.has(t)) {
						var o = "head" in t ? t.head : t, a = (o.ownerDocument || document).createElement("style");
						a.innerHTML = ".react-colorful{position:relative;display:flex;flex-direction:column;width:200px;height:200px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}.react-colorful__saturation{position:relative;flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,hsla(0,0%,100%,0))}.react-colorful__alpha-gradient,.react-colorful__pointer-fill{content:\"\";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;border-radius:inherit}.react-colorful__alpha-gradient,.react-colorful__saturation{box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}.react-colorful__alpha,.react-colorful__hue{position:relative;height:24px}.react-colorful__hue{background:linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)}.react-colorful__last-control{border-radius:0 0 8px 8px}.react-colorful__interactive{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;outline:none;touch-action:none}.react-colorful__pointer{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}.react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.1)}.react-colorful__alpha,.react-colorful__alpha-pointer{background-color:#fff;background-image:url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill-opacity=\".05\"><path d=\"M8 0h8v8H8zM0 8h8v8H0z\"/></svg>')}.react-colorful__saturation-pointer{z-index:3}.react-colorful__hue-pointer{z-index:2}";
						var u = V();
						u && a.setAttribute("nonce", u), $.set(t, a), o.appendChild(a);
					}
				}
			}, []);
		};
		var J = function(n) {
			var t = n.className, o = n.colorModel, a = n.color, u = void 0 === a ? o.defaultColor : a, i = n.onChange, s = n.onChangeEnd, f = c(n, [
				"className",
				"colorModel",
				"color",
				"onChange",
				"onChangeEnd"
			]), d = (0, react.useRef)(null);
			G(d);
			var v = X(o, u, i, s), h = v[0], g = v[1], p = v[2], b = m(["react-colorful", t]);
			return react.default.createElement("div", l({}, f, {
				ref: d,
				className: b
			}), react.default.createElement(S, {
				hsva: h,
				onChange: g,
				onChangeEnd: p
			}), react.default.createElement(R, {
				hue: h.h,
				onChange: g,
				onChangeEnd: p,
				className: "react-colorful__last-control"
			}));
		};
		var Q = {
			defaultColor: "000",
			toHsva: E,
			fromHsva: function(e) {
				return w({
					h: e.h,
					s: e.s,
					v: e.v,
					a: 1
				});
			},
			equal: P
		};
		var Z = function(r) {
			return react.default.createElement(J, l({}, r, { colorModel: Q }));
		};
		var ke = /^#?([0-9A-F]{3,8})$/i;
		var qe = function(r) {
			var n = r.color, u = void 0 === n ? "" : n, s = r.onChange, f = r.onBlur, d = r.escape, v = r.validate, h = r.format, g = r.process, m = c(r, [
				"color",
				"onChange",
				"onBlur",
				"escape",
				"validate",
				"format",
				"process"
			]), p = (0, react.useState)(function() {
				return d(u);
			}), b = p[0], _ = p[1], E = i(s), C = i(f), x = (0, react.useCallback)(function(e) {
				var r = d(e.target.value);
				_(r), v(r) && E(g ? g(r) : r);
			}, [
				d,
				g,
				v,
				E
			]), H = (0, react.useCallback)(function(e) {
				v(e.target.value) || _(d(u)), C(e);
			}, [
				u,
				d,
				v,
				C
			]);
			return (0, react.useEffect)(function() {
				_(d(u));
			}, [u, d]), react.default.createElement("input", l({}, m, {
				value: h ? h(b) : b,
				spellCheck: "false",
				onChange: x,
				onBlur: H
			}));
		};
		var Ie = function(e) {
			return "#" + e;
		};
		var Oe = function(r) {
			var n = r.prefixed, t = r.alpha, o = c(r, ["prefixed", "alpha"]), u = (0, react.useCallback)(function(e) {
				return e.replace(/([^0-9A-F]+)/gi, "").substring(0, t ? 8 : 6);
			}, [t]), i = (0, react.useCallback)(function(e) {
				return function(e, r) {
					var n = ke.exec(e), t = n ? n[1].length : 0;
					return 3 === t || 6 === t || !!r && 4 === t || !!r && 8 === t;
				}(e, t);
			}, [t]);
			return react.default.createElement(qe, l({}, o, {
				escape: u,
				format: n ? Ie : void 0,
				process: Ie,
				validate: i
			}));
		};
		//#endregion
		//#region src/client/custom.ts
		/** The nine `--shiki-token-*` slots, in stylesheet order. */
		const SHIKI_KEYS = [
			"constant",
			"string",
			"comment",
			"keyword",
			"parameter",
			"function",
			"string-expression",
			"punctuation",
			"link"
		];
		/** Seed values used when a source preset cannot supply one (e.g. the no-op `dsh`). */
		const SHIKI_FALLBACK = {
			light: {
				constant: "#1C7ED6",
				string: "#2F9E44",
				comment: "#868E96",
				keyword: "#D6336C",
				parameter: "#E8590C",
				function: "#6741D9",
				"string-expression": "#2B8A3E",
				punctuation: "#495057",
				link: "#1971C2"
			},
			dark: {
				constant: "#4DABF7",
				string: "#69DB7C",
				comment: "#ADB5BD",
				keyword: "#FAA2C1",
				parameter: "#FFA94D",
				function: "#B197FC",
				"string-expression": "#8CE99A",
				punctuation: "#CED4DA",
				link: "#74C0FC"
			}
		};
		const HEX = /^#([0-9a-f]{3,8})$/i;
		const RGB_FN = /^rgba?\(([^)]*)\)$/i;
		const HSL_FN = /^hsla?\(([^)]*)\)$/i;
		function isRecord$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		const clamp255 = (n) => Math.max(0, Math.min(255, Math.round(n)));
		const clamp01 = (n) => Math.max(0, Math.min(1, n));
		/** Accepts both `a, b, c` and the modern `a b c / d` argument syntax. */
		function fnArgs(body) {
			return body.replace(/\//g, " ").split(/[\s,]+/).filter(Boolean);
		}
		/** A colour channel: `128` or a percentage. Returns null for anything else. */
		function channel(token) {
			const pct = token.endsWith("%");
			const v = parseFloat(pct ? token.slice(0, -1) : token);
			if (!Number.isFinite(v)) return null;
			return pct ? v / 100 * 255 : v;
		}
		function hslToRgb(h, s, l) {
			const a = s * Math.min(l, 1 - l);
			const f = (n) => {
				const k = (n + h / 30) % 12;
				return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
			};
			return [
				clamp255(f(0) * 255),
				clamp255(f(8) * 255),
				clamp255(f(4) * 255)
			];
		}
		const toRgbHex = (rgb) => "#" + rgb.map((n) => clamp255(n).toString(16).padStart(2, "0")).join("").toUpperCase();
		/**
		* Parse a colour into `#RRGGBB`, or null when it is not a format we understand.
		*
		* Accepted: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb()`/`rgba()` with
		* numbers or percentages, and `hsl()`/`hsla()`. Alpha is parsed but dropped —
		* every token these seeds drive is an opaque theme colour.
		*
		* `primitives.ts` stores `rgb(r, g, b)` while presets store hex, so both shapes
		* have to work; the extra forms are there for what users may type.
		*/
		function tryToHex(input) {
			if (typeof input !== "string") return null;
			const s = input.trim();
			if (!s) return null;
			const hex = s.match(HEX);
			if (hex) {
				const d = hex[1];
				const twice = (c) => c + c;
				if (d.length === 3 || d.length === 4) return `#${twice(d[0])}${twice(d[1])}${twice(d[2])}`.toUpperCase();
				if (d.length === 6 || d.length === 8) return `#${d.slice(0, 6)}`.toUpperCase();
				return null;
			}
			const rgbFn = s.match(RGB_FN);
			if (rgbFn) {
				const parts = fnArgs(rgbFn[1]);
				if (parts.length < 3) return null;
				const rgb = parts.slice(0, 3).map(channel);
				if (rgb.some((n) => n === null)) return null;
				return toRgbHex(rgb);
			}
			const hslFn = s.match(HSL_FN);
			if (hslFn) {
				const parts = fnArgs(hslFn[1]);
				if (parts.length < 3) return null;
				const h = parseFloat(parts[0].replace(/deg$/i, ""));
				const sat = parseFloat(parts[1]);
				const lig = parseFloat(parts[2]);
				if (![
					h,
					sat,
					lig
				].every(Number.isFinite)) return null;
				return toRgbHex(hslToRgb((h % 360 + 360) % 360, clamp01(sat / 100), clamp01(lig / 100)));
			}
			return null;
		}
		/** `tryToHex` with a black fallback, for call sites that need a guaranteed value. */
		function toHex(input) {
			return tryToHex(input) ?? "#000000";
		}
		function readSeed(map, fallback, key) {
			return toHex(map[key] ?? fallback[key]);
		}
		/**
		* Recover the seed inputs from an already-generated preset.
		*
		* Exact by construction: `buildScale` writes the `start`/`end` arguments to
		* steps 00/1000, and `buildTintShadeScale` writes the base to step 500. This is
		* what lets a user start from any preset without re-declaring its palette.
		*/
		function extractSeeds(base) {
			const seed = (key, mode) => readSeed(mode === "light" ? base.light : base.dark, mode === "light" ? PRIMITIVES_LIGHT : PRIMITIVES_DARK, key);
			const pair = (key) => ({
				light: seed(key, "light"),
				dark: seed(key, "dark")
			});
			/** Both ends of one appearance's ramp, read from that appearance's map. */
			const ramp = (mode) => ({
				lightest: seed("--dsw-static-neutral-bluish-00", mode),
				darkest: seed("--dsw-static-neutral-bluish-1000", mode)
			});
			const shiki = SHIKI_KEYS.reduce((acc, k) => {
				const cssKey = `--shiki-token-${k}`;
				const lightMap = base.light;
				const darkMap = base.dark;
				acc[k] = {
					light: toHex(lightMap[cssKey] ?? SHIKI_FALLBACK.light[k]),
					dark: toHex(darkMap[cssKey] ?? SHIKI_FALLBACK.dark[k])
				};
				return acc;
			}, {});
			return {
				neutral: {
					light: ramp("light"),
					dark: ramp("dark")
				},
				accent: pair("--dsw-static-deepseek-500"),
				green: pair("--dsw-static-green-500"),
				amber: pair("--dsw-static-amber-500"),
				red: pair("--dsw-static-red-500"),
				shiki
			};
		}
		/** v1 carried one neutral ramp shared by both appearances. */
		const CUSTOM_SCHEMA_VERSION_LEGACY = 1;
		function encodeCustom(base, theme) {
			return JSON.stringify({
				v: 2,
				base,
				theme
			});
		}
		/** Parse a stored blob. Returns null for absent/corrupt/foreign-version data. */
		function parseEnvelope(raw) {
			if (!raw) return null;
			try {
				const parsed = JSON.parse(raw);
				if (!parsed || typeof parsed !== "object") return null;
				if (parsed.v !== 2 && parsed.v !== CUSTOM_SCHEMA_VERSION_LEGACY) return null;
				return {
					v: 2,
					base: String(parsed.base ?? ""),
					theme: parsed.theme
				};
			} catch {
				return null;
			}
		}
		/**
		* The neutral seeds in the current shape. A pre-v2 blob carried one ramp shared
		* by both appearances; repeating it per appearance reproduces exactly what that
		* blob rendered before the split, so existing themes migrate without a visible
		* change.
		*/
		function neutralSeeds(src) {
			if (isRecord$1(src.neutral)) return src.neutral;
			const shared = {
				lightest: src.neutralLightest,
				darkest: src.neutralDarkest
			};
			return {
				light: shared,
				dark: shared
			};
		}
		/** Repair a partially-invalid object against `fallback`, keeping every valid colour. */
		function normalizeCustom(raw, fallback) {
			const src = raw ?? {};
			const pick = (value, fb) => tryToHex(value) ?? fb;
			const pickPair = (value, fb) => {
				const v = value ?? {};
				return {
					light: pick(v.light, fb.light),
					dark: pick(v.dark, fb.dark)
				};
			};
			const pickRamp = (value, fb) => {
				const v = value ?? {};
				return {
					lightest: pick(v.lightest, fb.lightest),
					darkest: pick(v.darkest, fb.darkest)
				};
			};
			const shikiSrc = src.shiki ?? {};
			const shiki = SHIKI_KEYS.reduce((acc, k) => {
				acc[k] = pickPair(shikiSrc[k], fallback.shiki[k]);
				return acc;
			}, {});
			const neutral = neutralSeeds(src);
			return {
				neutral: {
					light: pickRamp(neutral.light, fallback.neutral.light),
					dark: pickRamp(neutral.dark, fallback.neutral.dark)
				},
				accent: pickPair(src.accent, fallback.accent),
				green: pickPair(src.green, fallback.green),
				amber: pickPair(src.amber, fallback.amber),
				red: pickPair(src.red, fallback.red),
				shiki
			};
		}
		/**
		* Turn seeds into a full `PresetDef` using the presets' own helpers.
		*
		* Unlike the presets (which ship one ramp for both appearances), the ramp is
		* built once per appearance, so the light text and the dark text are no longer
		* the two ends of the same colour axis.
		*/
		function buildCustomPreset(v) {
			/** One appearance's ramp, published under both prefixes DSH reads from. */
			const ramp = (mode) => {
				const { lightest, darkest } = v.neutral[mode];
				return {
					...buildScale("--dsw-static-neutral-bluish", lightest, darkest, BLUISH_STEPS),
					...buildScale("--dsw-static-neutral", lightest, darkest, NEUTRAL_STEPS)
				};
			};
			const semantic = (mode) => buildSemanticScales({
				deepseek: v.accent[mode],
				blue: v.accent[mode],
				green: v.green[mode],
				amber: v.amber[mode],
				red: v.red[mode]
			});
			const shiki = (mode) => {
				const out = {};
				for (const k of SHIKI_KEYS) out[`--shiki-token-${k}`] = v.shiki[k][mode];
				return out;
			};
			return {
				label: "Custom",
				light: {
					...ramp("light"),
					...semantic("light"),
					...shiki("light")
				},
				dark: {
					...ramp("dark"),
					...semantic("dark"),
					...shiki("dark")
				}
			};
		}
		/** Collision-resistant enough for a local list, and stable across reloads. */
		function newThemeId() {
			return `ct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
		}
		/**
		* Parse the saved list. Entries with a corrupt theme are repaired against
		* `fallbackFor(base)` rather than dropped, so one bad record cannot lose the
		* rest of the list; only structurally unusable entries are skipped.
		*/
		function decodeList(raw, fallbackFor) {
			if (!raw) return [];
			try {
				const parsed = JSON.parse(raw);
				const known = parsed?.v === 2 || parsed?.v === CUSTOM_SCHEMA_VERSION_LEGACY;
				if (!parsed || !known || !Array.isArray(parsed.items)) return [];
				const out = [];
				for (const item of parsed.items) {
					const e = item;
					if (typeof e?.id !== "string" || typeof e?.name !== "string") continue;
					const base = typeof e.base === "string" ? e.base : "";
					out.push({
						id: e.id,
						name: e.name,
						base,
						theme: normalizeCustom(e.theme, fallbackFor(base)),
						assets: Array.isArray(e.assets) ? e.assets : []
					});
				}
				return out;
			} catch {
				return [];
			}
		}
		/** `${base} 1`, `${base} 2`, … skipping names already taken. */
		function nextThemeName(base, taken) {
			const used = new Set(taken);
			for (let n = 1;; n++) {
				const candidate = `${base} ${n}`;
				if (!used.has(candidate)) return candidate;
			}
		}
		//#endregion
		//#region src/client/theme-files.ts
		/**
		* Browser half of the theme-file transport.
		*
		* The Host owns the files; this module is the only place that knows the wire
		* shape, so the rest of the client keeps working with plain `SavedTheme`
		* records. Every call is same-origin against the Host's own prefix route.
		*/
		/** Repair one stored document against the preset its seeds derive from. */
		function documentToSaved(doc, fallbackFor) {
			return {
				id: doc.id,
				name: doc.name,
				base: doc.base,
				theme: normalizeCustom(doc.theme, fallbackFor(doc.base)),
				assets: Array.isArray(doc.assets) ? doc.assets : []
			};
		}
		/** The document payload for one entry; timestamps stay the Host's business. */
		function savedToDocument(entry) {
			return {
				v: 1,
				id: entry.id,
				name: entry.name,
				base: entry.base,
				theme: entry.theme,
				assets: entry.assets
			};
		}
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* The Host answered as something other than this API — its route half is not
		* mounted (the usual cause is a DSH process started before this plugin's host
		* half existed). Distinguished from a write failure because only this one tells
		* the user to restart, and the browser copy is still intact meanwhile.
		*/
		var ThemeApiUnavailableError = class extends Error {};
		/** One JSON round trip; a non-OK status becomes an Error carrying the reason. */
		async function callApi(path, init) {
			const response = await fetch(path, {
				...init,
				headers: {
					"content-type": "application/json",
					...init?.headers
				}
			});
			let payload;
			try {
				payload = await response.json();
			} catch {
				throw new ThemeApiUnavailableError(`${String(response.status)} ${response.statusText}`);
			}
			if (!response.ok) {
				if (response.status === 404 || response.status === 405) throw new ThemeApiUnavailableError(`${String(response.status)} ${response.statusText}`);
				const reason = isRecord(payload) && typeof payload.error === "string" ? payload.error : response.statusText;
				throw new Error(reason);
			}
			return isRecord(payload) ? payload : {};
		}
		/**
		* The documents in one roster response, repaired into `SavedTheme` records.
		* Every call on this route answers with the same `{ themes: [...] }` body, so
		* both reads share this one parser: an entry missing an id or a name is skipped
		* rather than failing the whole roster.
		*/
		function payloadThemes(payload, fallbackFor) {
			const documents = Array.isArray(payload.themes) ? payload.themes : [];
			const out = [];
			for (const doc of documents) {
				if (!isRecord(doc) || typeof doc.id !== "string" || typeof doc.name !== "string") continue;
				out.push(documentToSaved({
					v: typeof doc.v === "number" ? doc.v : 1,
					id: doc.id,
					name: doc.name,
					base: typeof doc.base === "string" ? doc.base : "",
					theme: doc.theme,
					assets: Array.isArray(doc.assets) ? doc.assets : [],
					createdAt: "",
					updatedAt: ""
				}, fallbackFor));
			}
			return out;
		}
		/** Every stored theme, in the Host's creation-time order (oldest first). */
		async function fetchThemes(fallbackFor) {
			return payloadThemes(await callApi(THEME_API_PATH_THEMES), fallbackFor);
		}
		/** Insert or replace the given entries; resolves with what the Host stored. */
		async function pushThemes(entries, fallbackFor) {
			return payloadThemes(await callApi(THEME_API_PATH_THEMES, {
				method: "POST",
				body: JSON.stringify({ themes: entries.map(savedToDocument) })
			}), fallbackFor);
		}
		/** Remove one theme's directory. */
		async function removeTheme(id) {
			await callApi(`${THEME_API_PATH_THEMES}/${encodeURIComponent(id)}`, { method: "DELETE" });
		}
		/** One theme the Host stored on the client's behalf, as a stored document. */
		function storedTheme(payload) {
			const doc = isRecord(payload.theme) ? payload.theme : {};
			if (typeof doc.id !== "string" || typeof doc.name !== "string") throw new Error("the Host did not report a stored theme");
			return {
				id: doc.id,
				name: doc.name
			};
		}
		/**
		* Download one theme as an archive. The response is the archive itself rather
		* than JSON, so this is the one call that does not go through {@link callApi}.
		*/
		async function exportTheme(id, name) {
			const response = await fetch(`${THEME_API_PATH_THEMES}/${encodeURIComponent(id)}/${THEME_API_SEGMENT_EXPORT}`);
			if (response.status === 404 || response.status === 405) throw new ThemeApiUnavailableError(`${String(response.status)} ${response.statusText}`);
			if (!response.ok) throw new Error(`${String(response.status)} ${response.statusText}`);
			saveBlob(await response.blob(), suggestedName(response.headers.get("content-disposition"), name));
		}
		/**
		* The archive's own filename when the Host sent one, else the theme's name. The
		* Host is the authority because only it knows the theme id behind a bad name.
		*/
		function suggestedName(disposition, fallback) {
			const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
			if (encoded !== void 0) try {
				return decodeURIComponent(encoded);
			} catch {}
			const plain = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
			if (plain !== void 0 && plain !== "") return plain;
			const name = fallback.trim() === "" ? "theme" : fallback.trim();
			return name.endsWith(".zip") ? name : `${name}${THEME_ARCHIVE_EXTENSION}`;
		}
		/** Hand one blob to the browser's own download machinery. */
		function saveBlob(blob, fileName) {
			const url = URL.createObjectURL(blob);
			try {
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = fileName;
				anchor.rel = "noopener";
				document.body.append(anchor);
				anchor.click();
				anchor.remove();
			} finally {
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 0);
			}
		}
		/**
		* Upload one archive. The Host validates it, names the theme and stores it, so
		* a success means the roster already has the theme — the answer carries what to
		* report, not what the client still has to write.
		*/
		async function importTheme(file) {
			if (file.size > 8388608) throw new Error(`archive is larger than ${String(Math.round(THEME_ARCHIVE_MAX_BYTES / 1048576))} MB`);
			return storedTheme(await callApi(THEME_API_PATH_IMPORT, {
				method: "POST",
				headers: { "content-type": "application/octet-stream" },
				body: file
			}));
		}
		/**
		* The themes a browser saved before files became the store, minus those the
		* Host already has.
		*
		* Ids are the join key: a theme another browser already migrated must not be
		* written twice, while one this roster lacks would otherwise disappear from the
		* UI. Callers adopt the result, then stop reading the browser copy.
		*/
		function legacyThemesToAdopt(legacy, hostThemes) {
			const known = new Set(hostThemes.map((entry) => entry.id));
			return legacy.filter((entry) => !known.has(entry.id));
		}
		//#endregion
		//#region src/client/components.tsx
		/**
		* Theme settings UI: scheme selector, preset picker, and the custom colour editor.
		*/
		/** Reserved menu value that switches to the user-defined theme. */
		const CUSTOM_SELECTION = CUSTOM_PRESET_ID;
		/**
		* Which message an import failure deserves. The Host answers with its own
		* reason, so the shape of that reason is what selects the localized text; an
		* unrecognised failure keeps the Host's own words rather than hiding them.
		*/
		function importFailureMessage(t, error) {
			const message = error instanceof Error ? error.message : String(error);
			if (error instanceof ThemeApiUnavailableError) return t("custom.toast.unavailable");
			return t(/not a zip archive|zip central directory|zip local header|zip64|unsupported zip compression/i.test(message) ? "custom.importFailed.notArchive" : /missing theme\.json/i.test(message) ? "custom.importFailed.noDocument" : /newer than this plugin/i.test(message) ? "custom.importFailed.tooNew" : /carries media|unsupported media type|unusable media path/i.test(message) ? "custom.importFailed.media" : /larger than|too large|too many files/i.test(message) ? "custom.importFailed.tooLarge" : /not valid JSON|must be|unusable theme|did not report/i.test(message) ? "custom.importFailed.badDocument" : "custom.importFailed.other").replace("{0}", message);
		}
		/** Structural equality of the two seeds in one pair. */
		function samePair(a, b) {
			return a?.light === b?.light && a?.dark === b?.dark;
		}
		/** Structural equality of the two endpoints of one neutral ramp. */
		function sameRamp(a, b) {
			return a?.lightest === b?.lightest && a?.darkest === b?.darkest;
		}
		/** Structural equality over all 30 seeds, ignoring key order. */
		function sameSeeds(a, b) {
			if (!sameRamp(a.neutral?.light, b.neutral?.light) || !sameRamp(a.neutral?.dark, b.neutral?.dark)) return false;
			if (!samePair(a.accent, b.accent) || !samePair(a.green, b.green)) return false;
			if (!samePair(a.amber, b.amber) || !samePair(a.red, b.red)) return false;
			return SHIKI_KEYS.every((k) => samePair(a.shiki?.[k], b.shiki?.[k]));
		}
		/** The two roles one appearance's neutral ramp fills, in display order. */
		const NEUTRAL_ROLES = ["background", "foreground"];
		/**
		* The ramp end that paints an appearance's background or foreground. DSH points
		* its aliases at step 00 for light surfaces and step 1000 for light text, then
		* swaps both in dark (950 surfaces, 50 text), so the same end means opposite
		* things in the two appearances. Naming the role and resolving it per appearance
		* keeps the swatches in a stable background-then-foreground order.
		*/
		function neutralEndForRole(mode, role) {
			return role === "background" === (mode === "light") ? "lightest" : "darkest";
		}
		/**
		* Whether the open editor holds work a close would throw away. A brand-new
		* theme has never been committed, so it always counts as unsaved; a reopened
		* entry is dirty only once its name or one of its seeds actually moved.
		*/
		function isDirty(open, current) {
			if (open.id === null) return true;
			return open.name.trim() !== open.originName.trim() || !sameSeeds(current, open.originTheme);
		}
		function IconChevron() {
			return react.createElement("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 14 14",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg"
			}, react.createElement("path", {
				d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
				fill: "currentColor"
			}));
		}
		/** The menu's selected-row tick: 16px, pushed to the trailing edge. */
		function IconCheck(props) {
			const { size = 16, className } = props;
			return react.createElement("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				className
			}, react.createElement("path", {
				d: "M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z",
				fill: "currentColor"
			}));
		}
		function SchemeMenu(props) {
			const { value, options, onSelect, disabled } = props;
			const [open, setOpen] = react.useState(false);
			const rootRef = react.useRef(null);
			const listRef = react.useRef(null);
			react.useEffect(() => {
				if (!open) return;
				function onDown(e) {
					if (!(e.target instanceof Node)) return;
					if (rootRef.current?.contains(e.target)) return;
					if (listRef.current?.contains(e.target)) return;
					setOpen(false);
				}
				function onKey(e) {
					if (e.key === "Escape") setOpen(false);
				}
				document.addEventListener("pointerdown", onDown);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("pointerdown", onDown);
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);
			const selected = options.find((o) => o.value === value);
			return react.createElement("span", {
				ref: rootRef,
				style: {
					position: "relative",
					display: "inline-flex"
				}
			}, react.createElement("button", {
				type: "button",
				className: "ct-select",
				disabled,
				"aria-haspopup": "menu",
				"aria-expanded": open && !disabled,
				onClick: () => setOpen(!open)
			}, react.createElement("span", { className: "ct-select-label" }, selected?.label ?? ""), react.createElement("span", { className: "ct-select-chevron" }, react.createElement(IconChevron, null))), open && !disabled ? react.createElement("div", {
				ref: listRef,
				className: "ct-menu-list",
				style: {
					position: "absolute",
					top: "calc(100% + 4px)",
					right: 0,
					zIndex: 100
				},
				role: "menu",
				onClick: (e) => e.stopPropagation()
			}, ...options.map((o) => {
				const sel = o.value === value;
				return react.createElement("button", {
					key: o.value,
					type: "button",
					role: "menuitem",
					className: "ct-menu-item",
					onClick: () => {
						setOpen(false);
						onSelect(o.value);
					}
				}, react.createElement("span", { className: "ct-menu-item-label" }, o.label), sel ? react.createElement(IconCheck, { className: "ct-menu-check" }) : null);
			})) : null);
		}
		/** Accessible on/off switch used to enable the custom theme. */
		function Switch(props) {
			const { checked, label, onChange } = props;
			return react.createElement("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				"aria-label": label,
				className: checked ? "ct-switch ct-switch-on" : "ct-switch",
				onClick: () => onChange(!checked)
			}, react.createElement("span", { className: "ct-switch-knob" }));
		}
		/**
		* Confirmation dialog for destructive actions, mirroring DSH's own Modal
		* (design-platform mask token + blur, r24 card on layer-2, prominent shadow).
		* Rendered inline rather than through a portal so it needs no react-dom import.
		*/
		function ConfirmDialog(props) {
			const { title, description, confirmLabel, cancelLabel, onConfirm, onCancel } = props;
			react.useEffect(() => {
				const onKey = (e) => {
					if (e.key === "Escape") onCancel();
				};
				document.addEventListener("keydown", onKey);
				return () => document.removeEventListener("keydown", onKey);
			}, [onCancel]);
			return react.createElement("div", { className: "ct-modal-root" }, react.createElement("div", {
				className: "ct-modal-mask",
				"aria-hidden": true,
				onClick: onCancel
			}), react.createElement("div", {
				className: "ct-modal-card",
				role: "dialog",
				"aria-modal": true,
				"aria-label": title
			}, react.createElement("div", { className: "ct-modal-title" }, title), react.createElement("div", { className: "ct-modal-desc" }, description), react.createElement("div", { className: "ct-modal-footer" }, react.createElement("button", {
				type: "button",
				className: "ct-btn",
				onClick: onCancel
			}, cancelLabel), react.createElement("button", {
				type: "button",
				className: "ct-btn ct-btn-danger",
				onClick: onConfirm
			}, confirmLabel))));
		}
		/** Which banner a failed roster call deserves. */
		function toastKeyFor(error) {
			return error instanceof ThemeApiUnavailableError ? "custom.toast.unavailable" : "custom.toast.failed";
		}
		/**
		* Transient confirmation banner: a leading result badge plus the copy, top
		* center, sliding in, holding, fading out, then reporting done so the owner can
		* unmount it. Metrics, tokens, badge and timing follow DSH's own toast — the
		* badge is the success circle its confirmations wear — but the component is
		* local: the plugin must keep answering a save on a host that does not share
		* the primitives module.
		*
		* TOAST_HOLD_MS and TOAST_FADE_MS have to agree with the `ct-toast` animation
		* in the injected stylesheet, which owns the visual timing.
		* @param props.text - resolved, already-localized copy.
		* @param props.onDone - called once the fade completes; unmount the toast here.
		*/
		function Toast(props) {
			const { text, onDone } = props;
			react.useEffect(() => {
				const timer = setTimeout(onDone, 4e3);
				return () => clearTimeout(timer);
			}, [onDone]);
			return react.createElement("div", {
				className: "ct-toast",
				role: "status"
			}, react.createElement(ToastBadge), react.createElement("span", { className: "ct-toast-text" }, text));
		}
		/** The leading badge every confirmation wears: a success ring around the check. */
		function ToastBadge() {
			return react.createElement("span", {
				className: "ct-toast-icon",
				"aria-hidden": true
			}, react.createElement(IconCheck, { size: 12 }));
		}
		/**
		* Plus glyph for the add button, path data taken verbatim from DSH's own
		* `IconPlusOutline16` so the two controls read as the same affordance.
		*/
		function IconPlus(props) {
			const { size = 14 } = props;
			return react.createElement("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				focusable: false
			}, react.createElement("path", {
				d: "M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z",
				fill: "currentColor"
			}));
		}
		/**
		* Lucide `edit` (the pencil in a square), path data verbatim. Row actions are
		* icon-only, so the glyph has to read as the label the accessible name still
		* carries.
		*/
		function IconEdit(props) {
			const { size = 14 } = props;
			return react.createElement("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				focusable: false
			}, react.createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), react.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" }));
		}
		/** Lucide `trash`, path data verbatim; the row's danger action. */
		function IconTrash(props) {
			const { size = 14 } = props;
			return react.createElement("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				focusable: false
			}, react.createElement("path", { d: "M3 6h18" }), react.createElement("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }), react.createElement("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }), react.createElement("line", {
				x1: 10,
				y1: 11,
				x2: 10,
				y2: 17
			}), react.createElement("line", {
				x1: 14,
				y1: 11,
				x2: 14,
				y2: 17
			}));
		}
		/** Lucide `share`, path data verbatim; sends one theme out as an archive. */
		function IconShare(props) {
			const { size = 14 } = props;
			return react.createElement("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				focusable: false
			}, react.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }), react.createElement("polyline", { points: "16 6 12 2 8 6" }), react.createElement("line", {
				x1: 12,
				y1: 2,
				x2: 12,
				y2: 15
			}));
		}
		/** Lucide `download`, path data verbatim; takes one archive in. */
		function IconDownload(props) {
			const { size = 14 } = props;
			return react.createElement("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				focusable: false
			}, react.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), react.createElement("polyline", { points: "7 10 12 15 17 10" }), react.createElement("line", {
				x1: 12,
				y1: 15,
				x2: 12,
				y2: 3
			}));
		}
		/**
		* One collapsed saved-theme card: the name activates the theme, and the trailing
		* controls export it, open the editor or delete it. The card as a whole is a
		* click target too, but its controls own their clicks.
		*/
		function ThemeCard(props) {
			const { entry, active, disabled, t, onActivate, onExport, onEdit, onDelete } = props;
			/**
			* One square icon action; `danger` is the tinted delete variant. The glyph is
			* decorative, so the label travels as the accessible name instead of as text,
			* and as `data-tip` for the hover tooltip. `leave` marks the button on the
			* markup the outside-click guard watches (see the guard's own comment).
			*/
			const action = (label, icon, onClick, variant) => react.createElement("button", {
				type: "button",
				className: variant === "danger" ? "ct-list-btn ct-list-btn-danger ct-tip" : "ct-list-btn ct-tip",
				"aria-label": label,
				"data-tip": label,
				...variant === "leave" ? {
					"data-ct-leave": "true",
					"data-ct-entry": entry.id
				} : {},
				onClick
			}, icon);
			return react.createElement("div", {
				className: "ct-list-row",
				"data-ct-leave": "true",
				"data-ct-entry": entry.id,
				onClick: disabled ? void 0 : onActivate
			}, react.createElement("span", { className: "ct-list-identity" }, react.createElement("button", {
				className: "ct-list-name",
				type: "button",
				disabled,
				onClick: (e) => {
					e.stopPropagation();
					onActivate();
				}
			}, entry.name)), react.createElement("div", {
				className: "ct-list-actions",
				onClick: (e) => e.stopPropagation()
			}, active ? react.createElement("span", { className: "ct-list-badge" }, t("custom.inUse")) : null, action(t("custom.edit"), react.createElement(IconEdit, { size: 14 }), onEdit, "leave"), action(t("custom.export"), react.createElement(IconShare, { size: 14 }), onExport), action(t("custom.delete"), react.createElement(IconTrash, { size: 14 }), onDelete, "danger")));
		}
		/**
		* Which appearance the colour dots edit. `system` resolves through the same
		* media query the shell uses, so the editor opens on what is on screen.
		*/
		function effectiveMode(scheme) {
			if (scheme === "dark") return "dark";
			if (scheme === "light") return "light";
			try {
				return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
			} catch {
				return "light";
			}
		}
		function ThemePanel(props) {
			const { theme, getSelection, setSelection, getCustom, setCustom, setCustomBase, resetCustom, saved, getHostToast, t, onRequestClose } = props;
			let initScheme = "system";
			try {
				const snap = theme?.getTheme();
				if (snap?.preference) initScheme = snap.preference;
			} catch {}
			const [scheme, setScheme] = react.useState(initScheme);
			const [seedMode, setSeedMode] = react.useState(() => effectiveMode(initScheme));
			react.useEffect(() => {
				setSeedMode(effectiveMode(scheme));
			}, [scheme]);
			const [selection, setSelectionState] = react.useState(() => getSelection());
			const [custom, setCustomState] = react.useState(() => getCustom().theme);
			const [shownPreset, setShownPreset] = react.useState(() => {
				const initial = getSelection();
				return initial === CUSTOM_SELECTION ? getCustom().base : initial;
			});
			const [list, setList] = react.useState(() => saved.list());
			const [activeId, setActiveId] = react.useState(() => saved.activeId());
			const [pendingDelete, setPendingDelete] = react.useState(null);
			const [importing, setImporting] = react.useState(false);
			/** The hidden picker the import button opens. */
			const importInputRef = react.useRef(null);
			const [editing, setEditing] = react.useState(null);
			const [confirmClose, setConfirmClose] = react.useState(false);
			const [pendingLeave, setPendingLeave] = react.useState(null);
			const editingRef = react.useRef(null);
			editingRef.current = editing;
			const savingRef = react.useRef(false);
			const schemeRef = react.useRef(scheme);
			schemeRef.current = scheme;
			const dirtyRef = react.useRef(false);
			dirtyRef.current = editing !== null && isDirty(editing, custom);
			const confirmCloseRef = react.useRef(false);
			confirmCloseRef.current = confirmClose;
			const pendingLeaveRef = react.useRef(null);
			pendingLeaveRef.current = pendingLeave;
			const listRef = react.useRef(list);
			listRef.current = list;
			const pendingDeleteRef = react.useRef(null);
			pendingDeleteRef.current = pendingDelete;
			const [toast, setToast] = react.useState(null);
			const toastSeq = react.useRef(0);
			function showToast(text) {
				toastSeq.current += 1;
				setToast({
					seq: toastSeq.current,
					text
				});
			}
			const [pickerDotKey, setPickerDotKey] = react.useState(null);
			const [pickerPos, setPickerPos] = react.useState(null);
			const pickerOpen = pickerDotKey !== null;
			const pickerOpenRef = react.useRef(false);
			pickerOpenRef.current = pickerOpen;
			/** The swatch the popover is anchored to; re-read on every reposition. */
			const pickerAnchorRef = react.useRef(null);
			/** The popover node itself; outside-pointerdown detection needs its bounds. */
			const pickerPopRef = react.useRef(null);
			/** Viewport coordinates that put the popover beside its anchor swatch. */
			function placePicker(anchor) {
				const WIDTH = 224;
				const HEIGHT = 240;
				const GAP = 8;
				const MARGIN = 8;
				const rect = anchor.getBoundingClientRect();
				const viewW = window.innerWidth;
				const viewH = window.innerHeight;
				return {
					left: Math.min(Math.max(MARGIN, rect.right - WIDTH), Math.max(MARGIN, viewW - WIDTH - MARGIN)),
					top: rect.bottom + GAP + HEIGHT <= viewH - MARGIN ? rect.bottom + GAP : Math.max(MARGIN, rect.top - GAP - HEIGHT)
				};
			}
			/** Toggle one seed's popover; `anchor` is the swatch that was clicked. */
			function togglePicker(key, anchor) {
				if (pickerDotKey === key) {
					closePicker();
					return;
				}
				pickerAnchorRef.current = anchor;
				setPickerDotKey(key);
				setPickerPos(placePicker(anchor));
			}
			function closePicker() {
				setPickerDotKey(null);
				setPickerPos(null);
			}
			react.useEffect(() => {
				if (!pickerOpen) return;
				function onPointerDown(e) {
					const target = e.target instanceof Element ? e.target : null;
					if (!target) return;
					if (pickerPopRef.current?.contains(target)) return;
					if (pickerAnchorRef.current?.contains(target)) return;
					closePicker();
				}
				document.addEventListener("pointerdown", onPointerDown, true);
				return () => document.removeEventListener("pointerdown", onPointerDown, true);
			}, [pickerOpen]);
			react.useEffect(() => {
				if (!pickerOpen) return;
				let raf = 0;
				const update = () => {
					const anchor = pickerAnchorRef.current;
					if (!anchor) return;
					cancelAnimationFrame(raf);
					raf = requestAnimationFrame(() => setPickerPos(placePicker(anchor)));
				};
				window.addEventListener("scroll", update, true);
				window.addEventListener("resize", update);
				return () => {
					window.removeEventListener("scroll", update, true);
					window.removeEventListener("resize", update);
					cancelAnimationFrame(raf);
				};
			}, [pickerOpen]);
			/** Re-read both the list and the active pointer after any list mutation. */
			function syncSaved() {
				setList(saved.list());
				setActiveId(saved.activeId());
			}
			react.useEffect(() => {
				let cancelled = false;
				saved.refresh().then(() => {
					if (!cancelled) syncSaved();
				}).catch((error) => {
					if (!cancelled) showToast(t(toastKeyFor(error)));
				});
				return () => {
					cancelled = true;
				};
			}, []);
			/** Run one roster mutation, surfacing a failed round trip as a banner. */
			async function mutate(operation) {
				try {
					return await operation();
				} catch (error) {
					showToast(t(toastKeyFor(error)));
					return null;
				}
			}
			/** Load a card: the store moves the active pointer itself, so `syncSaved`
			* re-reads the badge rather than a separate `setActive` call. */
			function onLoadSaved(id) {
				const next = saved.load(id);
				if (next) setCustomState(next);
				syncSaved();
			}
			/** Snapshot the state an edit must return to when it is cancelled. */
			function beginEditing(id, name, originName, originTheme) {
				return {
					id,
					name,
					originId: saved.activeId(),
					originDraft: getCustom().theme,
					originName,
					originTheme,
					originScheme: schemeRef.current
				};
			}
			/** Commit an appearance preference, through the Theme service when it is there. */
			function applyAppearance(id) {
				setScheme(id);
				try {
					theme?.setTheme(id);
				} catch {}
			}
			/**
			* Preview an appearance on the whole page while its colours are edited: a
			* custom theme carries both variants, so the other one's seeds are only
			* visible once the page actually wears that appearance. A no-op when the page
			* already resolves to `mode` — clicking the active half of the toggle must not
			* quietly turn a `system` preference into a pinned one.
			*/
			function previewAppearance(mode) {
				if (effectiveMode(schemeRef.current) === mode) return;
				applyAppearance(mode);
			}
			/**
			* End a preview: put the appearance the editor opened on back. The preference
			* is a global setting the mode toggle only borrows, so it must not survive the
			* editor — not even on save, which commits the colours alone.
			*/
			function restoreAppearance(open) {
				if (schemeRef.current === open.originScheme) return;
				applyAppearance(open.originScheme);
			}
			/**
			* Undo an open (unsaved) edit: editing previews live and persists on every
			* change, so abandoning the card has to write the pre-edit theme back.
			*/
			function revertEditing(open) {
				restoreAppearance(open);
				if (open.originId) onLoadSaved(open.originId);
				else {
					setCustom(open.originDraft);
					setCustomState(open.originDraft);
					saved.setActive(null);
				}
			}
			react.useEffect(() => () => {
				const open = editingRef.current;
				if (!open || savingRef.current) return;
				if (schemeRef.current !== open.originScheme) try {
					theme?.setTheme(open.originScheme);
				} catch {}
				if (open.originId) saved.load(open.originId);
				else {
					setCustom(open.originDraft);
					saved.setActive(null);
				}
			}, []);
			react.useEffect(() => {
				/** The header button carrying the `settings.close` seat, if `node` is in it. */
				function isCloseButton(node) {
					const seat = node.ownerDocument.querySelector("[data-slot=\"settings.close\"]");
					const button = node.closest("button");
					return !!seat && !!button && button.contains(seat);
				}
				/** The settings panel itself; the close seat is unique to it. */
				function settingsPanel() {
					return document.querySelector("[data-slot=\"settings.close\"]")?.closest("[role=\"dialog\"]") ?? null;
				}
				/**
				* Whether `node` sits on a nav *cell* — the buttons that switch sections —
				* rather than anywhere else in the rail. Cells are the only buttons in the
				* nav, and the shell marks the active one with `aria-current`; taking that
				* button's parent gives the cell list itself, which still matches once the
				* active cell moves to whatever was just clicked.
				*/
				function isNavCell(panel, node) {
					const list = panel?.querySelector("nav button[aria-current]")?.parentElement;
					const button = node.closest("button");
					return !!list && !!button && list.contains(button);
				}
				function onKeyDown(e) {
					if (e.key !== "Escape") return;
					if (pickerOpenRef.current) {
						e.preventDefault();
						e.stopPropagation();
						closePicker();
						return;
					}
					if (confirmCloseRef.current || pendingLeaveRef.current) {
						e.preventDefault();
						e.stopPropagation();
						setConfirmClose(false);
						setPendingLeave(null);
						return;
					}
					if (!dirtyRef.current || !onRequestClose) return;
					e.preventDefault();
					e.stopPropagation();
					setConfirmClose(true);
				}
				function onClick(e) {
					if (!dirtyRef.current || confirmCloseRef.current || pendingLeaveRef.current || pendingDeleteRef.current) return;
					const target = e.target instanceof Element ? e.target : null;
					if (!target) return;
					if (target.closest("[data-ct-editor]")) return;
					const panel = settingsPanel();
					if (!!panel && !panel.contains(target) || isCloseButton(target)) {
						if (!onRequestClose) return;
						e.preventDefault();
						e.stopPropagation();
						setConfirmClose(true);
						return;
					}
					if (!panel || !panel.contains(target)) return;
					if (isNavCell(panel, target)) {
						if (!onRequestClose) return;
						e.preventDefault();
						e.stopPropagation();
						setConfirmClose(true);
						return;
					}
					const leave = target.closest("[data-ct-leave]");
					if (!leave) return;
					const entry = listRef.current.find((item) => item.id === leave.getAttribute("data-ct-entry"));
					if (!entry) return;
					e.preventDefault();
					e.stopPropagation();
					setPendingLeave({
						entry,
						edit: !!target.closest("button[data-ct-leave]")
					});
				}
				document.addEventListener("keydown", onKeyDown, true);
				document.addEventListener("click", onClick, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown, true);
					document.removeEventListener("click", onClick, true);
				};
			}, [onRequestClose]);
			/** Open a fresh, unsaved theme seeded from the currently selected preset. */
			function startAdd() {
				closePicker();
				const origin = beginEditing(null, nextThemeName(t("custom.defaultName"), list.map((e) => e.name)), "", getCustom().theme);
				setCustomBase(shownPreset);
				const draft = resetCustom();
				setEditing(origin);
				setCustomState(draft);
			}
			/** Open an existing card for editing; it also becomes the previewed theme. */
			function startEdit(entry) {
				closePicker();
				const next = beginEditing(entry.id, entry.name, entry.name, entry.theme);
				setEditing(next);
				onLoadSaved(entry.id);
			}
			/** Discard the open editor and put the previously applied theme back. */
			function cancelEdit() {
				if (!editing) return;
				closePicker();
				revertEditing(editing);
				setEditing(null);
				syncSaved();
			}
			/**
			* Send one card out as an archive. Export never touches the draft or the
			* roster, so it stays available while an editor is open and needs no guard.
			*/
			async function exportCard(entry) {
				try {
					await exportTheme(entry.id, entry.name);
					showToast(t("custom.toast.exported").replace("{0}", entry.name));
				} catch (error) {
					showToast(t(error instanceof ThemeApiUnavailableError ? "custom.toast.unavailable" : "custom.toast.failed"));
				}
			}
			/**
			* Take one archive in. The Host validates the archive and writes the theme it
			* carried — a theme is a document, so an import stores exactly what an export
			* packed, with the Host choosing the id and a free name. The draft is never
			* involved, so importing leaves an open editor exactly as it was.
			*/
			async function importArchive(file) {
				setImporting(true);
				try {
					const imported = await importTheme(file);
					await reloadRoster();
					showToast(t("custom.toast.imported").replace("{0}", imported.name));
				} catch (error) {
					showToast(importFailureMessage(t, error));
				} finally {
					setImporting(false);
				}
			}
			/**
			* Re-read the roster after a write the store did not make. The import route is
			* the Host's own: the cached list still holds the pre-import roster, so without
			* this the new card only appears once some later mutation refreshes the cache.
			* A failed re-read is not a failed import — the theme is stored either way — so
			* the card is left to the next roster mutation rather than reported as an error.
			*/
			async function reloadRoster() {
				try {
					await saved.refresh();
					syncSaved();
				} catch {}
			}
			/** Open the picker, clearing the previous choice so the same file can be re-picked. */
			function startImport() {
				const input = importInputRef.current;
				if (!input) return;
				input.value = "";
				input.click();
			}
			function onImportPicked(e) {
				const file = e.target.files?.[0];
				e.target.value = "";
				if (file) importArchive(file);
			}
			/** Commit the open editor: create a new entry, or update the one being edited. */
			async function saveEdit() {
				if (!editing) return;
				closePicker();
				const name = editing.name.trim() || t("custom.defaultName");
				const id = editing.id;
				savingRef.current = true;
				const next = await mutate(() => id === null ? saved.create(name) : saved.update(id, name));
				savingRef.current = false;
				if (next === null) return;
				setEditing(null);
				restoreAppearance(editing);
				syncSaved();
				setCustomState(getCustom().theme);
				showToast(t("custom.toast.saved"));
			}
			async function onConfirmDelete() {
				if (!pendingDelete) return;
				const id = pendingDelete.id;
				setPendingDelete(null);
				setEditing((cur) => cur?.id === id ? null : cur);
				const next = await mutate(() => saved.remove(id));
				if (next === null) return;
				setActiveId(saved.activeId());
				setCustomState(getCustom().theme);
				setList(saved.list());
				if (next.length === 0) {
					setEditing(null);
					setCustomBase(shownPreset);
					setCustomState(resetCustom());
				}
			}
			function pickScheme(id) {
				applyAppearance(id);
				setEditing((cur) => cur ? {
					...cur,
					originScheme: id
				} : cur);
			}
			/**
			* The preset picker. Unreachable while custom mode is on — the picker is
			* disabled then — so this only ever applies the chosen preset.
			*/
			function pickPreset(id) {
				setSelectionState(id);
				setSelection(id);
				setShownPreset(id);
			}
			/**
			* The custom switch. Preset and custom are independent selections: turning
			* custom on leaves the preset row untouched, and turning it off goes back to
			* the preset the user had chosen, not to the custom theme's own base.
			*/
			function toggleCustom(on) {
				if (on) {
					setSelectionState(CUSTOM_SELECTION);
					setSelection(CUSTOM_SELECTION);
					setCustomState(getCustom().theme);
					return;
				}
				closePicker();
				if (editing) revertEditing(editing);
				setEditing(null);
				setSelectionState(shownPreset);
				setSelection(shownPreset);
				setShownPreset(shownPreset);
			}
			function editCustom(next) {
				setCustomState(next);
				setCustom(next);
			}
			const schemeOptions = [
				{
					value: "light",
					label: t("scheme.light")
				},
				{
					value: "dark",
					label: t("scheme.dark")
				},
				{
					value: "system",
					label: t("scheme.system")
				}
			];
			const customOn = selection === CUSTOM_SELECTION;
			const children = [
				react.createElement("div", {
					className: "ct-row",
					key: "appearance"
				}, react.createElement("div", { className: "ct-row-main" }, react.createElement("div", { className: "ct-row-title" }, t("appearance.title")), react.createElement("div", { className: "ct-row-desc" }, t("appearance.desc"))), react.createElement(SchemeMenu, {
					value: scheme,
					options: schemeOptions,
					onSelect: pickScheme
				})),
				react.createElement("div", {
					className: "ct-row",
					key: "presets"
				}, react.createElement("div", { className: "ct-row-main" }, react.createElement("div", { className: "ct-row-title" }, t("presets.title")), react.createElement("div", { className: "ct-row-desc" }, t(customOn ? "presets.disabled" : "presets.desc"))), react.createElement(SchemeMenu, {
					value: customOn ? shownPreset : selection,
					options: presetOptions,
					onSelect: (v) => pickPreset(v),
					disabled: customOn
				})),
				react.createElement("div", {
					className: "ct-row ct-row-flush",
					key: "custom-toggle"
				}, react.createElement("div", { className: "ct-row-main" }, react.createElement("div", { className: "ct-row-title" }, t("custom.title")), react.createElement("div", { className: "ct-row-desc" }, t("custom.toggle.desc"))), react.createElement(Switch, {
					checked: customOn,
					label: t("custom.title"),
					onChange: toggleCustom
				}))
			];
			if (customOn) {
				/** A group row: its name on the left, every seed's dot on the right. */
				const dotRow = (key, label, dots) => react.createElement("div", {
					className: "ct-seed-row",
					key
				}, react.createElement("div", { className: "ct-seed-label" }, label), react.createElement("div", { className: "ct-seed-dots" }, ...dots.map((d) => react.createElement("button", {
					key: d.key,
					type: "button",
					className: "ct-seed-dot ct-tip",
					style: { background: d.value },
					"data-tip": d.name,
					"aria-haspopup": "dialog",
					"aria-expanded": pickerDotKey === d.key,
					"aria-label": `${d.name} — ${d.hint}`,
					onClick: (e) => togglePicker(d.key, e.currentTarget)
				}))));
				const pair = (key, title, desc) => ({
					key,
					name: t(title),
					hint: t(desc),
					value: custom[key][seedMode],
					onChange: (v) => editCustom({
						...custom,
						[key]: {
							...custom[key],
							[seedMode]: v
						}
					})
				});
				const neutralDots = NEUTRAL_ROLES.map((role) => {
					const end = neutralEndForRole(seedMode, role);
					return {
						key: `neutral-${end}`,
						name: t(role === "background" ? "custom.neutral.roleBackground" : "custom.neutral.roleForeground"),
						hint: `${t("custom.neutral.title")} · ${t("custom.neutral.desc")} — ${t(end === "lightest" ? "custom.neutral.lightest" : "custom.neutral.darkest")}`,
						value: custom.neutral[seedMode][end],
						onChange: (v) => editCustom({
							...custom,
							neutral: {
								...custom.neutral,
								[seedMode]: {
									...custom.neutral[seedMode],
									[end]: v
								}
							}
						})
					};
				});
				const seedDots = [
					pair("accent", "custom.accent.title", "custom.accent.desc"),
					...neutralDots,
					pair("green", "custom.green.title", "custom.green.desc"),
					pair("amber", "custom.amber.title", "custom.amber.desc"),
					pair("red", "custom.red.title", "custom.red.desc")
				];
				const shikiDots = SHIKI_KEYS.map((k) => ({
					key: k,
					name: t(`shiki.${k}`),
					hint: t("custom.shiki.desc"),
					value: custom.shiki[k][seedMode],
					onChange: (v) => editCustom({
						...custom,
						shiki: {
							...custom.shiki,
							[k]: {
								...custom.shiki[k],
								[seedMode]: v
							}
						}
					})
				}));
				/** The light/dark segmented control above the dots. */
				const modeButton = (id, label) => react.createElement("button", {
					key: id,
					type: "button",
					className: seedMode === id ? "ct-mode-btn ct-mode-btn-on" : "ct-mode-btn",
					"aria-pressed": seedMode === id,
					onClick: () => {
						setSeedMode(id);
						previewAppearance(id);
					}
				}, label);
				const modeToggle = react.createElement("div", {
					className: "ct-mode",
					role: "group",
					"aria-label": t("custom.mode.label")
				}, modeButton("light", t("custom.seed.light")), modeButton("dark", t("custom.seed.dark")));
				const editorName = react.createElement("input", {
					className: "ct-editor-name",
					type: "text",
					value: editing?.name ?? "",
					placeholder: t("custom.name.placeholder"),
					"aria-label": t("custom.name.placeholder"),
					autoFocus: true,
					onChange: (e) => setEditing((cur) => cur ? {
						...cur,
						name: e.target.value
					} : cur),
					onKeyDown: (e) => {
						if (e.key === "Enter") saveEdit();
						else if (e.key === "Escape") cancelEdit();
					}
				});
				const editorActions = react.createElement("div", { className: "ct-editor-actions" }, react.createElement("button", {
					type: "button",
					className: "ct-btn",
					onClick: cancelEdit
				}, t("custom.cancel")), react.createElement("button", {
					type: "button",
					className: "ct-btn ct-btn-primary",
					onClick: () => void saveEdit()
				}, t("custom.save")));
				const pickerDot = pickerDotKey ? [...seedDots, ...shikiDots].find((d) => d.key === pickerDotKey) ?? null : null;
				const pickerPop = pickerDot && pickerPos ? react.createElement("div", {
					key: "color-picker",
					className: "ct-color-pop",
					ref: pickerPopRef,
					style: {
						left: pickerPos.left,
						top: pickerPos.top
					}
				}, react.createElement(Z, {
					color: pickerDot.value,
					onChange: (v) => pickerDot.onChange(v.toUpperCase())
				}), react.createElement(Oe, {
					className: "ct-hex-input",
					color: pickerDot.value,
					"aria-label": pickerDot.name,
					onChange: (v) => pickerDot.onChange(v.toUpperCase())
				})) : null;
				const editorCard = (key) => react.createElement("div", {
					className: "ct-editor",
					key,
					"data-ct-editor": "true"
				}, react.createElement("div", { className: "ct-editor-head" }, editorName, modeToggle), dotRow("seeds", t("custom.group.seeds"), seedDots), dotRow("shiki", t("custom.group.shiki"), shikiDots), editorActions, pickerPop);
				const cards = list.map((entry) => editing && editing.id === entry.id ? editorCard(entry.id) : react.createElement(ThemeCard, {
					key: entry.id,
					entry,
					active: activeId === entry.id,
					disabled: editing !== null,
					t,
					onActivate: () => onLoadSaved(entry.id),
					onExport: () => void exportCard(entry),
					onEdit: () => startEdit(entry),
					onDelete: () => setPendingDelete(entry)
				}));
				if (editing && editing.id === null) cards.push(editorCard("new-editor"));
				children.push(react.createElement("div", {
					className: "ct-list",
					key: "saved-list"
				}, ...cards), react.createElement("div", {
					className: "ct-add-row",
					key: "add-row"
				}, react.createElement("button", {
					key: "import",
					type: "button",
					className: "ct-add-btn",
					disabled: importing,
					onClick: startImport
				}, react.createElement(IconDownload, null), t("custom.import")), react.createElement("button", {
					key: "add",
					type: "button",
					className: "ct-add-btn",
					disabled: editing !== null,
					onClick: startAdd
				}, react.createElement(IconPlus, null), t("custom.add")), react.createElement("input", {
					key: "import-input",
					ref: importInputRef,
					type: "file",
					accept: `${THEME_ARCHIVE_EXTENSION},application/zip`,
					style: { display: "none" },
					onChange: onImportPicked
				})));
			}
			if (pendingDelete) children.push(react.createElement(ConfirmDialog, {
				key: "confirm-delete",
				title: t("custom.delete.title"),
				description: t("custom.delete.desc").replace("{0}", pendingDelete.name),
				confirmLabel: t("custom.delete"),
				cancelLabel: t("custom.cancel"),
				onConfirm: onConfirmDelete,
				onCancel: () => setPendingDelete(null)
			}));
			if (confirmClose && editing && onRequestClose) children.push(react.createElement(ConfirmDialog, {
				key: "confirm-close",
				title: t("custom.unsaved.title"),
				description: t("custom.unsaved.desc").replace("{0}", editing.name.trim() || t("custom.defaultName")),
				confirmLabel: t("custom.unsaved.confirm"),
				cancelLabel: t("custom.unsaved.cancel"),
				onConfirm: () => {
					setConfirmClose(false);
					onRequestClose();
				},
				onCancel: () => setConfirmClose(false)
			}));
			if (pendingLeave && editing) children.push(react.createElement(ConfirmDialog, {
				key: "confirm-leave",
				title: t("custom.unsaved.title"),
				description: t("custom.unsaved.leaveDesc").replace("{0}", editing.name.trim() || t("custom.defaultName")),
				confirmLabel: t("custom.unsaved.leaveConfirm"),
				cancelLabel: t("custom.unsaved.cancel"),
				onConfirm: () => {
					const next = pendingLeave;
					setPendingLeave(null);
					cancelEdit();
					if (next.entry) {
						if (next.edit) startEdit(next.entry);
						else onLoadSaved(next.entry.id);
					}
				},
				onCancel: () => setPendingLeave(null)
			}));
			if (toast) {
				const onDone = () => setToast((cur) => cur?.seq === toast.seq ? null : cur);
				const HostToast = getHostToast();
				children.push(HostToast ? react.createElement(HostToast, {
					key: `toast-${String(toast.seq)}`,
					text: toast.text,
					icon: react.createElement(ToastBadge),
					onDone
				}) : react.createElement(Toast, {
					key: `toast-${String(toast.seq)}`,
					text: toast.text,
					onDone
				}));
			}
			return react.createElement("div", { style: {
				display: "flex",
				flexDirection: "column",
				maxWidth: 760,
				paddingBottom: 8
			} }, ...children);
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* Theme settings dictionaries (zh is the key-set source of truth; en mirrors
		* it completely). Preset names stay as proper nouns in both locales, so they
		* live in presets.ts, not here.
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			nav: "主题",
			"appearance.title": "外观",
			"appearance.desc": "深色 / 浅色 / 跟随系统",
			"presets.title": "预设主题",
			"presets.desc": "一键套用主流配色方案",
			"presets.disabled": "自定义主题已启用，关闭后才能选择预设",
			"scheme.light": "浅色",
			"scheme.dark": "深色",
			"scheme.system": "跟随系统",
			"custom.title": "自定义主题",
			"custom.toggle.desc": "创建属于自己的个性化主题",
			"custom.group.seeds": "主色/辅助色",
			"custom.group.shiki": "代码块",
			"custom.mode.label": "编辑的外观",
			"custom.neutral.title": "中性色",
			"custom.neutral.desc": "界面底色与正文。浅色与深色各一条色阶",
			"custom.neutral.lightest": "最浅色端",
			"custom.neutral.darkest": "最深色端",
			"custom.neutral.roleBackground": "背景色",
			"custom.neutral.roleForeground": "前景色",
			"custom.accent.title": "主色",
			"custom.accent.desc": "按钮与强调色（deepseek 与 blue 合并为一组）",
			"custom.green.title": "成功",
			"custom.green.desc": "成功状态",
			"custom.amber.title": "警告",
			"custom.amber.desc": "警告状态",
			"custom.red.title": "错误",
			"custom.red.desc": "错误状态",
			"custom.shiki.desc": "9 个语法标记的颜色",
			"custom.seed.light": "浅色",
			"custom.seed.dark": "深色",
			"custom.save": "保存",
			"custom.add": "添加自定义主题",
			"custom.edit": "编辑",
			"custom.export": "导出",
			"custom.import": "导入主题",
			"custom.name.placeholder": "主题名称",
			"custom.defaultName": "自定义主题",
			"custom.inUse": "使用中",
			"custom.delete": "删除",
			"custom.cancel": "取消",
			"custom.toast.saved": "已保存",
			"custom.toast.failed": "主题文件操作失败",
			"custom.toast.unavailable": "主题文件接口未就绪，请重启 DSH 服务",
			"custom.toast.exported": "已导出「{0}」",
			"custom.toast.imported": "已导入「{0}」",
			"custom.importFailed.notArchive": "导入失败：不是主题压缩包",
			"custom.importFailed.noDocument": "导入失败：压缩包缺少 theme.json",
			"custom.importFailed.badDocument": "导入失败：theme.json 不是有效的主题文件",
			"custom.importFailed.tooNew": "导入失败：主题文件版本比当前插件更新",
			"custom.importFailed.media": "导入失败：主题包含媒体文件，暂不支持导入",
			"custom.importFailed.tooLarge": "导入失败：压缩包超过大小上限",
			"custom.importFailed.other": "导入失败：{0}",
			"custom.delete.title": "删除该自定义主题？",
			"custom.delete.desc": "将删除「{0}」，且无法恢复。",
			"custom.unsaved.title": "放弃未保存的修改？",
			"custom.unsaved.desc": "「{0}」的修改尚未保存，关闭设置后将丢失。",
			"custom.unsaved.confirm": "放弃并关闭",
			"custom.unsaved.leaveDesc": "「{0}」的修改尚未保存，是否确认放弃？",
			"custom.unsaved.leaveConfirm": "放弃修改",
			"custom.unsaved.cancel": "继续编辑",
			"shiki.constant": "常量",
			"shiki.string": "字符串",
			"shiki.comment": "注释",
			"shiki.keyword": "关键字",
			"shiki.parameter": "参数",
			"shiki.function": "函数",
			"shiki.string-expression": "模板字符串",
			"shiki.punctuation": "标点",
			"shiki.link": "链接"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			nav: "Theme",
			"appearance.title": "Appearance",
			"appearance.desc": "Dark / Light / System",
			"presets.title": "Preset themes",
			"presets.desc": "Apply popular color schemes in one click",
			"presets.disabled": "Custom theme is on — turn it off to choose a preset",
			"scheme.light": "Light",
			"scheme.dark": "Dark",
			"scheme.system": "System",
			"custom.title": "Custom theme",
			"custom.toggle.desc": "Create your own personalized theme",
			"custom.group.seeds": "Primary/supporting",
			"custom.group.shiki": "Code block",
			"custom.mode.label": "Appearance being edited",
			"custom.neutral.title": "Neutral",
			"custom.neutral.desc": "Surfaces and body text. One ramp per appearance",
			"custom.neutral.lightest": "Lightest end",
			"custom.neutral.darkest": "Darkest end",
			"custom.neutral.roleBackground": "Background",
			"custom.neutral.roleForeground": "Foreground",
			"custom.accent.title": "Accent",
			"custom.accent.desc": "Buttons and emphasis (deepseek and blue merged into one)",
			"custom.green.title": "Success",
			"custom.green.desc": "Success states",
			"custom.amber.title": "Warning",
			"custom.amber.desc": "Warning states",
			"custom.red.title": "Error",
			"custom.red.desc": "Error states",
			"custom.shiki.desc": "Colors for the nine syntax tokens",
			"custom.seed.light": "Light",
			"custom.seed.dark": "Dark",
			"custom.save": "Save",
			"custom.add": "Add custom theme",
			"custom.edit": "Edit",
			"custom.export": "Export",
			"custom.import": "Import theme",
			"custom.name.placeholder": "Theme name",
			"custom.defaultName": "Custom theme",
			"custom.inUse": "In use",
			"custom.delete": "Delete",
			"custom.cancel": "Cancel",
			"custom.toast.saved": "Saved",
			"custom.toast.failed": "Theme file operation failed",
			"custom.toast.unavailable": "Theme file API not ready — restart the DSH service",
			"custom.toast.exported": "Exported \"{0}\"",
			"custom.toast.imported": "Imported \"{0}\"",
			"custom.importFailed.notArchive": "Import failed: not a theme archive",
			"custom.importFailed.noDocument": "Import failed: the archive has no theme.json",
			"custom.importFailed.badDocument": "Import failed: theme.json is not a usable theme",
			"custom.importFailed.tooNew": "Import failed: the theme file is newer than this plugin reads",
			"custom.importFailed.media": "Import failed: the theme carries media, which cannot be imported yet",
			"custom.importFailed.tooLarge": "Import failed: the archive is over the size limit",
			"custom.importFailed.other": "Import failed: {0}",
			"custom.delete.title": "Delete this custom theme?",
			"custom.delete.desc": "\"{0}\" will be removed. This cannot be undone.",
			"custom.unsaved.title": "Discard unsaved changes?",
			"custom.unsaved.desc": "Changes to \"{0}\" have not been saved and will be lost when settings close.",
			"custom.unsaved.confirm": "Discard and close",
			"custom.unsaved.leaveDesc": "Changes to \"{0}\" have not been saved. Discard them?",
			"custom.unsaved.leaveConfirm": "Discard changes",
			"custom.unsaved.cancel": "Keep editing",
			"shiki.constant": "Constant",
			"shiki.string": "String",
			"shiki.comment": "Comment",
			"shiki.keyword": "Keyword",
			"shiki.parameter": "Parameter",
			"shiki.function": "Function",
			"shiki.string-expression": "Template string",
			"shiki.punctuation": "Punctuation",
			"shiki.link": "Link"
		};
		//#endregion
		//#region src/client/theme.tsx
		const BASE_CSS = [
			".ct-select{box-sizing:border-box;display:inline-flex;align-items:center;gap:12px;height:36px;padding:0 14px;border:none;border-radius:18px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;white-space:nowrap;width:auto;min-width:0;max-width:100%;}",
			".ct-select:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-select:disabled{opacity:.5;cursor:not-allowed;}",
			".ct-select:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-select-label{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}",
			".ct-select-chevron{flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform 120ms ease;}",
			".ct-select[aria-expanded=\"true\"] .ct-select-chevron{transform:rotate(180deg);}",
			".ct-menu-list{box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:0;border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);min-width:218px;max-width:360px;max-height:min(320px,50vh);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;scrollbar-gutter:stable;}",
			".ct-menu-list:not(:hover){scrollbar-color:transparent transparent;}",
			".ct-menu-list::-webkit-scrollbar{width:8px;height:8px;}",
			".ct-menu-list::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:999px;border:2px solid var(--dsw-specific-menu);background-clip:content-box;transition:background 150ms ease, border-color 150ms ease;}",
			".ct-menu-list::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-label-tertiary);border:2px solid var(--dsw-specific-menu);background-clip:content-box;}",
			".ct-menu-list::-webkit-scrollbar-thumb:active{background:var(--dsw-alias-label-secondary, var(--dsw-alias-label-tertiary));border:2px solid var(--dsw-specific-menu);background-clip:content-box;}",
			".ct-menu-list:not(:hover)::-webkit-scrollbar-thumb{background:transparent;border-color:transparent;}",
			".ct-menu-list::-webkit-scrollbar-track{background:transparent;margin:4px 0;}",
			".ct-menu-list::-webkit-scrollbar-corner{background:transparent;}",
			".ct-menu-item{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:8px 10px;border:none;border-radius:10px;background:transparent;cursor:pointer;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);text-align:left;font-family:inherit;}",
			".ct-menu-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-menu-check{flex:none;color:var(--dsw-alias-label-primary);display:inline-flex;margin-left:auto;}",
			".ct-menu-item-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
			".ct-row{border-bottom:1px solid var(--dsw-alias-border-l2);padding:16px 2px;display:flex;align-items:center;gap:16px;}",
			".ct-row:last-child{border-bottom:none;}",
			".ct-row-flush{border-bottom:none;}",
			".ct-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-right:48px;}",
			".ct-row-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;}",
			".ct-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;}",
			".ct-seed-row{display:flex;align-items:center;gap:16px;padding:12px 0;}",
			".ct-seed-label{flex:0 0 auto;min-width:96px;padding-left:3px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);}",
			".ct-seed-dots{flex:1 1 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px;}",
			".ct-seed-dot{position:relative;box-sizing:border-box;display:inline-block;flex:none;width:26px;height:26px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:50%;cursor:pointer;font:inherit;}",
			".ct-seed-dot:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-color-pop{position:fixed;z-index:1200;box-sizing:border-box;width:224px;padding:12px;border:1px solid var(--dsw-alias-border-l4);border-radius:16px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;gap:10px;}",
			".ct-color-pop .react-colorful{width:198px;height:170px;}",
			".ct-color-pop .ct-hex-input{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;text-align:center;outline:none;}",
			".ct-color-pop .ct-hex-input:focus{border-color:var(--dsw-alias-border-l3);}",
			".ct-tip::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);z-index:100;box-sizing:border-box;width:max-content;max-width:220px;padding:3px 7px;border-radius:8px;background:var(--dsw-alias-tooltip-bg);color:var(--dsw-static-neutral-bluish-00);font-size:13px;font-weight:400;line-height:20px;white-space:pre-line;overflow-wrap:break-word;text-align:left;pointer-events:none;opacity:0;visibility:hidden;transition:opacity 120ms ease;}",
			".ct-seed-dot:hover::after,.ct-seed-dot:focus-visible::after{opacity:1;visibility:visible;}",
			".ct-list-btn:hover::after,.ct-list-btn:focus-visible::after{opacity:1;visibility:visible;}",
			"@media (prefers-reduced-motion: reduce){.ct-tip::after{transition:none;}}",
			".ct-list{margin-top:4px;display:flex;flex-direction:column;gap:8px;}",
			".ct-list-row{display:flex;align-items:center;gap:10px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;background:transparent;cursor:pointer;transition:border-color .16s ease,background .16s ease;}",
			".ct-list-row:hover{background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-list-identity{display:inline-flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;}",
			".ct-list-name{min-width:0;text-align:left;border:none;background:transparent;cursor:pointer;font:inherit;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0;}",
			".ct-list-name:disabled{cursor:default;}",
			".ct-list-actions{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto;}",
			".ct-list-badge{display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:14px;background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-secondary,var(--dsw-alias-label-tertiary));font-size:12px;line-height:18px;white-space:nowrap;}",
			".ct-list-badge + .ct-list-btn{margin-left:8px;}",
			".ct-list-btn{position:relative;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:28px;width:28px;padding:0;border:none;border-radius:14px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;line-height:0;}",
			".ct-list-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-list-btn:active{background:var(--dsw-alias-interactive-bg-active);}",
			".ct-list-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-list-btn:disabled{opacity:.4;cursor:not-allowed;}",
			".ct-list-btn:disabled:hover{background:transparent;}",
			".ct-list-btn-danger{color:var(--dsw-alias-state-error-primary);}",
			".ct-list-btn-danger:hover{background:var(--dsw-alias-interactive-bg-hover-danger);}",
			".ct-list-btn-danger:active{background:var(--dsw-alias-interactive-bg-hover-danger);}",
			".ct-editor{padding:16px;border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;background:transparent;display:flex;flex-direction:column;gap:0;}",
			".ct-editor-head{display:flex;align-items:center;gap:10px;padding-bottom:12px;}",
			".ct-editor-name{flex:1 1 auto;min-width:0;box-sizing:border-box;height:36px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;}",
			".ct-editor-name::placeholder{color:var(--dsw-alias-label-tertiary);}",
			".ct-editor-name:hover{border-color:var(--dsw-alias-border-l3);}",
			".ct-editor-name:focus{outline:none;border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);}",
			".ct-mode{box-sizing:border-box;display:inline-flex;flex:none;height:36px;padding:2px;border-radius:10px;background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-2));}",
			".ct-mode-btn{box-sizing:border-box;height:32px;padding:0 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:inherit;font-size:12px;line-height:18px;}",
			".ct-mode-btn:hover{color:var(--dsw-alias-label-primary);}",
			".ct-mode-btn-on{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}",
			".ct-mode-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-editor-actions{display:flex;justify-content:flex-end;gap:12px;padding-top:12px;}",
			".ct-add-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;height:44px;margin-top:8px;padding:0 14px;border:1px dashed var(--dsw-alias-border-l3);border-radius:16px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;}",
			".ct-add-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-add-btn:disabled{opacity:.4;cursor:default;}",
			".ct-add-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-add-row{display:flex;align-items:stretch;gap:8px;margin-top:8px;}",
			".ct-add-row .ct-add-btn{flex:1 1 0;width:auto;margin-top:0;min-width:0;}",
			".ct-modal-root{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;}",
			".ct-modal-mask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,.24));backdrop-filter:var(--dsw-mask-blur,blur(2px));}",
			".ct-modal-card{position:relative;z-index:1;display:flex;flex-direction:column;gap:12px;width:min(380px,100%);padding:24px;border-radius:24px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);}",
			".ct-modal-title{font-size:16px;line-height:24px;font-weight:600;color:var(--dsw-alias-label-primary);}",
			".ct-modal-desc{font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary);}",
			".ct-modal-footer{display:flex;justify-content:flex-end;gap:12px;margin-top:12px;}",
			".ct-switch{position:relative;flex:none;width:40px;height:24px;padding:0;border:none;border-radius:12px;background:var(--dsw-alias-border-l2);cursor:pointer;transition:background 150ms ease;}",
			".ct-switch-on{background:var(--dsw-static-deepseek-500,rgb(65,118,230));}",
			".ct-switch-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 150ms ease;}",
			".ct-switch-on .ct-switch-knob{transform:translateX(16px);}",
			".ct-switch:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-btn{box-sizing:border-box;display:inline-flex;align-items:center;height:34px;padding:0 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:17px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px;line-height:20px;}",
			".ct-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-btn-primary{background:var(--dsw-static-deepseek-500,rgb(65,118,230));border-color:transparent;color:#fff;}",
			".ct-btn-primary:hover{background:var(--dsw-static-deepseek-450,var(--dsw-static-deepseek-500,rgb(86,134,254)));}",
			".ct-btn-danger{background:var(--dsw-static-red-500,rgb(239,68,68));border-color:transparent;color:#fff;}",
			".ct-btn-danger:hover{background:var(--dsw-static-red-600,var(--dsw-static-red-500,rgb(236,19,19)));}",
			".ct-toast{position:fixed;top:40px;left:50%;z-index:1100;pointer-events:none;display:flex;align-items:center;gap:10px;width:max-content;max-width:min(640px,calc(100vw - 48px));padding:12px 16px;border-radius:14px;background:var(--dsw-alias-button-contrast-fill);color:var(--dsw-alias-label-primary-inverted);font-size:14px;line-height:22px;box-shadow:var(--dsw-shadow-lv3);transform:translateX(-50%);animation:ct-toast-in 160ms ease-out,ct-toast-fade 1s ease 3s forwards;}",
			".ct-toast-icon{display:grid;place-items:center;flex:none;width:18px;height:18px;border:1.5px solid var(--dsw-alias-state-success-primary);border-radius:50%;corner-shape:round;color:var(--dsw-alias-state-success-primary);}",
			".ct-toast-text{min-width:0;}",
			"@keyframes ct-toast-in{from{opacity:0;transform:translate(-50%,-6px);}to{opacity:1;transform:translate(-50%,0);}}",
			"@keyframes ct-toast-fade{to{opacity:0;}}",
			"@media (prefers-reduced-motion: reduce){.ct-toast{animation:ct-toast-fade 1s ease 3s forwards;}}"
		].join("\n");
		function isValidSelection(v) {
			return !!v && (v === CUSTOM_SELECTION || NOOP_PRESET_IDS.has(v) || v in PRESETS);
		}
		function isPresetId(v) {
			return typeof v === "string" && v in PRESETS;
		}
		function presetDef(id) {
			return PRESETS[id] ?? PRESETS.dsh;
		}
		function registerTheme(ctx) {
			const slots = ctx.get("slots");
			const theme = ctx.get("theme");
			if (!slots) return;
			const NS = "cool-theme";
			const locale = ctx.get("locale");
			let t = (key) => zh[key];
			if (locale) {
				ctx.effect(() => locale.register(NS, {
					zh,
					en
				}), "dsh-cool-theme: theme dictionaries");
				t = locale.bind(NS);
			}
			const injector = createStyleInjector();
			const pluginCssDisposer = injector.insert(BASE_CSS);
			let baselineDisposer = null;
			let overrideDispose = null;
			let fallbackDispose = null;
			const release = (fn) => {
				if (!fn) return null;
				try {
					fn();
				} catch {}
				return null;
			};
			function ensureBaseline(active) {
				if (active) {
					if (!baselineDisposer) baselineDisposer = injector.insert(buildBaseCss());
				} else if (baselineDisposer) baselineDisposer = release(baselineDisposer);
			}
			/** Raw localStorage access; an absent or blocked store reads as empty, writes are dropped. */
			function readRaw(key) {
				try {
					return localStorage.getItem(key);
				} catch {
					return null;
				}
			}
			function writeRaw(key, value) {
				try {
					if (value === null) localStorage.removeItem(key);
					else localStorage.setItem(key, value);
				} catch {}
			}
			function getSelection() {
				for (const key of [THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY]) {
					const cur = readRaw(key);
					if (!isValidSelection(cur)) continue;
					const normalized = cur === "native" ? "dsh" : cur;
					if (cur !== normalized || key === "cooltea-theme-preset") writeRaw(THEME_STORAGE_KEY, normalized);
					return normalized;
				}
				return "dsh";
			}
			/** The preset the custom seeds derive from, restored from the stored blob. */
			function customBase() {
				const env = parseEnvelope(readRaw(CUSTOM_THEME_STORAGE_KEY));
				if (env && isPresetId(env.base)) return env.base;
				return lastPreset;
			}
			function loadCustom() {
				const base = customBase();
				const fallback = extractSeeds(presetDef(base));
				return {
					base,
					theme: normalizeCustom(parseEnvelope(readRaw(CUSTOM_THEME_STORAGE_KEY))?.theme, fallback)
				};
			}
			function persistCustom(theme) {
				writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(customBase(), theme));
			}
			/**
			* Choose the preset a future custom theme seeds from, without touching the
			* colours currently on screen. The custom editor stays the live theme; the
			* preset is only the template the next "add" inherits.
			*/
			function setCustomBase(base) {
				lastPreset = base;
				writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(base, loadCustom().theme));
			}
			/**
			* Install a palette. The override layer for our source is replaced in place
			* rather than torn down first: `theme.overrideTokens` restacks the same source
			* atomically, while disposing the old layer emits an extra `theme/change` with
			* our variables missing. The shell's presenter answers that by removing every
			* token from `body`, so the whole page falls back to the base palette and
			* repaints before the new layer lands — twice the DOM work and a visible
			* flash per change, which is exactly what a dragged colour slider produces.
			*/
			function apply(src) {
				const target = src === CUSTOM_SELECTION ? buildCustomPreset(loadCustom().theme) : src;
				if (typeof target === "string" && NOOP_PRESET_IDS.has(target)) {
					overrideDispose = release(overrideDispose);
					fallbackDispose = release(fallbackDispose);
					ensureBaseline(false);
					return;
				}
				ensureBaseline(true);
				const overrides = buildOverrides(target);
				if (theme?.overrideTokens) try {
					overrideDispose = theme.overrideTokens("dsh-cool-theme", overrides);
					fallbackDispose = release(fallbackDispose);
					return;
				} catch {}
				overrideDispose = release(overrideDispose);
				fallbackDispose = release(fallbackDispose);
				fallbackDispose = injector.insert(buildFullCssFallback(target));
			}
			/**
			* Coalesce a burst of palette applications into one.
			*
			* A colour picker fires continuously while its slider is dragged. Each
			* application rebuilds both ramps, rewrites every token on
			* `body` and forces a style flush in the shell's presenter, so applying once
			* per event is what makes the colour editor stutter. The first change lands
			* immediately and the rest are throttled to one per interval, newest request
			* winning: the palette the pointer is released on is always the one applied.
			*/
			const APPLY_INTERVAL_MS = 80;
			let pendingApply = null;
			let applyTimer = null;
			let lastApplyAt = 0;
			let disposed = false;
			/** Run the newest pending application now, if any. */
			function flushApply() {
				if (applyTimer !== null) {
					clearTimeout(applyTimer);
					applyTimer = null;
				}
				const run = pendingApply;
				pendingApply = null;
				if (!run) return;
				lastApplyAt = Date.now();
				run();
			}
			/** Drop a coalesced application, for a fiber that is going away. */
			function cancelApply() {
				if (applyTimer !== null) {
					clearTimeout(applyTimer);
					applyTimer = null;
				}
				pendingApply = null;
			}
			/**
			* Apply a palette, at most once per interval while a burst of edits is
			* running. The callback is deferred whole, so a dropped intermediate edit
			* never even rebuilds its ramps; only the newest one is executed.
			*/
			function scheduleApply(run) {
				if (disposed) return;
				pendingApply = run;
				const elapsed = Date.now() - lastApplyAt;
				if (elapsed >= APPLY_INTERVAL_MS) {
					flushApply();
					return;
				}
				if (applyTimer === null) applyTimer = setTimeout(flushApply, APPLY_INTERVAL_MS - elapsed);
			}
			function setSelection(id) {
				writeRaw(THEME_STORAGE_KEY, id);
				if (id !== CUSTOM_SELECTION) lastPreset = id;
				scheduleApply(() => apply(id));
			}
			function setCustom(next) {
				persistCustom(next);
				scheduleApply(() => apply(buildCustomPreset(next)));
			}
			function resetCustom() {
				const theme = extractSeeds(presetDef(customBase()));
				persistCustom(theme);
				scheduleApply(() => apply(buildCustomPreset(theme)));
				return theme;
			}
			const fallbackForBase = (base) => extractSeeds(presetDef(isPresetId(base) ? base : lastPreset));
			/**
			* The roster as the Host last reported it; `null` means it has not answered
			* yet. Files are the source of truth, so this is a read-through cache the
			* panel renders from, and every mutation is a round trip plus a refresh.
			*/
			let themeCache = null;
			/** The legacy browser list, read only until the Host has answered. */
			const legacyList = () => decodeList(readRaw(CUSTOM_LIST_STORAGE_KEY), fallbackForBase);
			/** The roster to render and resolve ids against. */
			const readList = () => themeCache ?? legacyList();
			function readActiveId() {
				const id = readRaw(CUSTOM_ACTIVE_STORAGE_KEY);
				return id && readList().some((e) => e.id === id) ? id : null;
			}
			/**
			* Adopt the themes this browser saved before they lived in files. Runs once:
			* the marker keeps a stale browser copy from being migrated twice, and is only
			* set after a confirmed write, so a failed migration retries next load.
			*/
			async function migrateLegacyThemes(hostThemes) {
				if (readRaw("cool-theme-custom-migrated") !== null) return hostThemes;
				const adopt = legacyThemesToAdopt(legacyList(), hostThemes);
				if (adopt.length > 0) await pushThemes(adopt, fallbackForBase);
				writeRaw(CUSTOM_MIGRATED_STORAGE_KEY, (/* @__PURE__ */ new Date()).toISOString());
				writeRaw(CUSTOM_LIST_STORAGE_KEY, null);
				return adopt.length > 0 ? fetchThemes(fallbackForBase) : hostThemes;
			}
			/** Re-read the roster from the Host, migrating the legacy list on first load. */
			async function refreshSaved() {
				themeCache = await migrateLegacyThemes(await fetchThemes(fallbackForBase));
				return themeCache;
			}
			/** Load a saved entry into the draft and make it the active theme. */
			function loadSaved(id) {
				const entry = readList().find((e) => e.id === id);
				if (!entry) return null;
				if (isPresetId(entry.base)) lastPreset = entry.base;
				writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id);
				writeRaw(CUSTOM_THEME_STORAGE_KEY, encodeCustom(entry.base, entry.theme));
				scheduleApply(() => apply(buildCustomPreset(entry.theme)));
				return entry.theme;
			}
			const saved = {
				/** The cached roster, or the legacy browser list until the Host answers. */
				list: readList,
				activeId: readActiveId,
				load: loadSaved,
				/** Point the "in use" badge at an entry, or clear it entirely. */
				setActive(id) {
					writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, id);
				},
				refresh: refreshSaved,
				/** Persist the current draft as a new named entry and make it active. */
				async create(name) {
					const draft = loadCustom();
					const entry = {
						id: newThemeId(),
						name,
						base: draft.base,
						theme: draft.theme,
						assets: []
					};
					await pushThemes([entry], fallbackForBase);
					writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, entry.id);
					return refreshSaved();
				},
				/** Write the current draft (and a new name) back to an existing entry. */
				async update(id, name) {
					const entry = readList().find((e) => e.id === id);
					if (!entry) return readList();
					const draft = loadCustom();
					await pushThemes([{
						...entry,
						name,
						theme: draft.theme
					}], fallbackForBase);
					return refreshSaved();
				},
				async remove(id) {
					if (readRaw("cool-theme-custom-active") === id) writeRaw(CUSTOM_ACTIVE_STORAGE_KEY, null);
					await removeTheme(id);
					const next = await refreshSaved();
					if (readActiveId() === null && next[0]) loadSaved(next[0].id);
					return next;
				}
			};
			const initialSelection = getSelection();
			let lastPreset = initialSelection === CUSTOM_SELECTION ? "dsh" : initialSelection;
			if (initialSelection === CUSTOM_SELECTION) {
				const env = parseEnvelope(readRaw(CUSTOM_THEME_STORAGE_KEY));
				if (env && isPresetId(env.base)) lastPreset = env.base;
			}
			apply(initialSelection);
			let sharedToast = null;
			const modules = ctx.get("modules");
			try {
				modules?.import?.("@deepseek-ai/dsh-client-ui-primitives").then((mod) => {
					if (typeof mod?.Toast === "function") sharedToast = mod.Toast;
				}).catch(() => {});
			} catch {}
			ctx.effect(() => () => {
				disposed = true;
				cancelApply();
				release(pluginCssDisposer);
				baselineDisposer = release(baselineDisposer);
				overrideDispose = release(overrideDispose);
				fallbackDispose = release(fallbackDispose);
				injector.disposeAll();
			});
			slots.inject("settings.section", () => {
				const options = {
					name: "settings.section",
					id: "cool-theme",
					order: 5,
					label: () => t("nav")
				};
				if (locale) options.locale = NS;
				return slots.register(options, (props) => react.createElement(ThemePanel, {
					t: props?.t ?? ((key) => zh[key]),
					theme,
					getSelection,
					setSelection,
					getCustom: loadCustom,
					setCustom,
					setCustomBase,
					resetCustom,
					saved,
					getHostToast: () => sharedToast,
					onRequestClose: typeof props?.close === "function" ? props.close : null
				}));
			});
			const PALETTE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z\"/><circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/></g></svg>";
			let paletteObs = null;
			function patchThemeNavIcon() {
				if (typeof document === "undefined") return;
				let currentLabel = "";
				try {
					currentLabel = t("nav");
				} catch {}
				const candidates = [
					currentLabel,
					zh.nav,
					en.nav
				].filter(Boolean);
				const cells = document.querySelectorAll("[class*=\"navCell\"], button[class*=\"navCell\"]");
				const toPatch = cells.length > 0 ? Array.from(cells) : Array.from(document.querySelectorAll("[class*=\"nav\"] button"));
				for (const cell of toPatch) {
					const text = ((cell.querySelector("[class*=\"navLabel\"]") || cell)?.textContent || cell.textContent || "").trim();
					if (!candidates.some((lbl) => text === lbl || text.includes(lbl))) continue;
					if (cell.querySelector("[data-palette-icon]")) continue;
					const svg = cell.querySelector("svg");
					if (!svg) continue;
					svg.style.display = "none";
					svg.setAttribute("data-palette-hidden", "1");
					const holder = document.createElement("span");
					holder.setAttribute("data-palette-icon", "1");
					holder.style.display = "inline-flex";
					holder.style.flex = "none";
					holder.setAttribute("aria-hidden", "true");
					holder.innerHTML = PALETTE_SVG;
					svg.parentNode?.insertBefore(holder, svg.nextSibling);
				}
			}
			if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
				try {
					patchThemeNavIcon();
				} catch {}
				try {
					paletteObs = new MutationObserver(() => {
						try {
							patchThemeNavIcon();
						} catch {}
					});
					paletteObs.observe(document.body, {
						childList: true,
						subtree: true,
						characterData: true
					});
				} catch {}
				ctx.effect(() => () => {
					if (paletteObs) {
						try {
							paletteObs.disconnect();
						} catch {}
						paletteObs = null;
					}
					if (typeof document !== "undefined") {
						document.querySelectorAll("svg[data-palette-hidden=\"1\"]").forEach((el) => {
							el.style.display = "";
							el.removeAttribute("data-palette-hidden");
						});
						document.querySelectorAll("[data-palette-icon]").forEach((el) => el.remove());
					}
				});
			}
			const HIDE_APPEARANCE_CSS = ".OVFIkW_section [data-slot=\"settings.general.item\"] .D7wrZG_group{display:none !important;}";
			let hideCssDisposer = null;
			let apObs = null;
			function isAppearanceNode(el) {
				const text = el.textContent || "";
				const hasTitle = text.includes("外观") || text.includes("Appearance");
				const hasCubes = el.querySelector("[class*=\"themeCube\"]") !== null || el.querySelector("[class*=\"D7wrZG\"]") !== null;
				return hasTitle && hasCubes;
			}
			function hideAppearanceInGeneral() {
				if (typeof document === "undefined") return;
				const container = document.querySelector(".OVFIkW_section [data-slot=\"settings.general.item\"]");
				if (!container) return;
				for (const child of Array.from(container.children)) if (isAppearanceNode(child)) child.style.display = "none";
			}
			slots.inject("settings.general.item", () => {
				try {
					hideCssDisposer = injector.insert(HIDE_APPEARANCE_CSS);
				} catch {}
				let disposeShadow = null;
				try {
					disposeShadow = slots.register({
						name: "settings.general.item",
						id: "appearance",
						priority: -1
					}, () => null);
				} catch {}
				if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
					hideAppearanceInGeneral();
					try {
						apObs = new MutationObserver(hideAppearanceInGeneral);
						const target = document.body;
						apObs.observe(target, {
							childList: true,
							subtree: true
						});
					} catch {}
				}
				return () => {
					if (disposeShadow) {
						try {
							disposeShadow();
						} catch {}
						disposeShadow = null;
					}
					if (hideCssDisposer) {
						try {
							hideCssDisposer();
						} catch {}
						hideCssDisposer = null;
					}
					if (apObs) {
						try {
							apObs.disconnect();
						} catch {}
						apObs = null;
					}
					if (typeof document !== "undefined") {
						const container = document.querySelector(".OVFIkW_section [data-slot=\"settings.general.item\"]");
						if (container) for (const child of Array.from(container.children)) {
							const el = child;
							if (el.style.display === "none") el.style.display = "";
						}
					}
				};
			});
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* Client entry for dsh-cool-theme.
		*/
		const name = "dsh-cool-theme/client";
		const inject = [
			"slots",
			"theme",
			"locale"
		];
		function apply(ctx) {
			registerTheme(ctx);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
