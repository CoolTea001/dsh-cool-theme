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
		//#region src/client/presets/ayu.ts
		const bluish$12 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#0D1017", BLUISH_STEPS);
		const neutral$12 = buildScale("--dsw-static-neutral", "#FAFAFA", "#0F1419", NEUTRAL_STEPS);
		const lightSemantic$12 = buildSemanticScales({
			deepseek: "#4AA8C8",
			blue: "#4AA8C8",
			green: "#5FB978",
			amber: "#EA9F41",
			red: "#E6656A"
		});
		const darkSemantic$12 = buildSemanticScales({
			deepseek: "#3FB7E3",
			blue: "#3FB7E3",
			green: "#78D05C",
			amber: "#E4A75C",
			red: "#F58572"
		});
		const ayu = {
			label: "Ayu",
			light: {
				...bluish$12,
				...neutral$12,
				...lightSemantic$12,
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
				...bluish$12,
				...neutral$12,
				...darkSemantic$12,
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
		const bluish$11 = buildScale("--dsw-static-neutral-bluish", "#eff1f5", "#1e1e2e", BLUISH_STEPS);
		const neutral$11 = buildScale("--dsw-static-neutral", "#eff1f5", "#1e1e2e", NEUTRAL_STEPS);
		const lightSemantic$11 = buildSemanticScales({
			deepseek: "#7287FD",
			blue: "#7287FD",
			green: "#40A02B",
			amber: "#DF8E1D",
			red: "#D20F39"
		});
		const darkSemantic$11 = buildSemanticScales({
			deepseek: "#B4BEFE",
			blue: "#B4BEFE",
			green: "#A6D189",
			amber: "#F4B8E4",
			red: "#F38BA8"
		});
		const catppuccin = {
			label: "Catppuccin",
			light: {
				...bluish$11,
				...neutral$11,
				...lightSemantic$11,
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
				...bluish$11,
				...neutral$11,
				...darkSemantic$11,
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
		//#region src/client/presets/dracula.ts
		const bluish$10 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#282a36", BLUISH_STEPS);
		const neutral$10 = buildScale("--dsw-static-neutral", "#FAFAFA", "#282a36", NEUTRAL_STEPS);
		const lightSemantic$10 = buildSemanticScales({
			deepseek: "#7C3AED",
			blue: "#7C3AED",
			green: "#2A9D4A",
			amber: "#B78100",
			red: "#E63C3C"
		});
		const darkSemantic$10 = buildSemanticScales({
			deepseek: "#BD93F9",
			blue: "#BD93F9",
			green: "#50FA7B",
			amber: "#F1FA8C",
			red: "#FF5555"
		});
		const dracula = {
			label: "Dracula",
			light: {
				...bluish$10,
				...neutral$10,
				...lightSemantic$10,
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
				...bluish$10,
				...neutral$10,
				...darkSemantic$10,
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
		const bluish$9 = buildScale("--dsw-static-neutral-bluish", "#FFFFFF", "#0F1115", BLUISH_STEPS);
		const neutral$9 = buildScale("--dsw-static-neutral", "#FFFFFF", "#000000", NEUTRAL_STEPS);
		const lightSemantic$9 = buildSemanticScales({
			deepseek: "#4176E6",
			blue: "#3B82F6",
			green: "#22C55E",
			amber: "#F59E0B",
			red: "#EF4444"
		});
		const darkSemantic$9 = buildSemanticScales({
			deepseek: "#4176E6",
			blue: "#3B82F6",
			green: "#22C55E",
			amber: "#F59E0B",
			red: "#EF4444"
		});
		const dsh = {
			label: "DSH",
			light: {
				...bluish$9,
				...neutral$9,
				...lightSemantic$9
			},
			dark: {
				...bluish$9,
				...neutral$9,
				...darkSemantic$9
			}
		};
		//#endregion
		//#region src/client/presets/github.ts
		const bluish$8 = buildScale("--dsw-static-neutral-bluish", "#ffffff", "#0d1117", BLUISH_STEPS);
		const neutral$8 = buildScale("--dsw-static-neutral", "#ffffff", "#0d1117", NEUTRAL_STEPS);
		const lightSemantic$8 = buildSemanticScales({
			deepseek: "#0969da",
			blue: "#0969da",
			green: "#1A7F37",
			amber: "#9A6700",
			red: "#CF222E"
		});
		const darkSemantic$8 = buildSemanticScales({
			deepseek: "#58A6FF",
			blue: "#58A6FF",
			green: "#3FB950",
			amber: "#D29922",
			red: "#F85149"
		});
		const github = {
			label: "GitHub",
			light: {
				...bluish$8,
				...neutral$8,
				...lightSemantic$8,
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
				...bluish$8,
				...neutral$8,
				...darkSemantic$8,
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
		const bluish$7 = buildScale("--dsw-static-neutral-bluish", "#fbf1c7", "#282828", BLUISH_STEPS);
		const neutral$7 = buildScale("--dsw-static-neutral", "#fbf1c7", "#282828", NEUTRAL_STEPS);
		const lightSemantic$7 = buildSemanticScales({
			deepseek: "#076678",
			blue: "#076678",
			green: "#98971A",
			amber: "#D79921",
			red: "#CC241D"
		});
		const darkSemantic$7 = buildSemanticScales({
			deepseek: "#83A598",
			blue: "#83A598",
			green: "#B8BB26",
			amber: "#FABD2F",
			red: "#FB4934"
		});
		const gruvbox = {
			label: "Gruvbox",
			light: {
				...bluish$7,
				...neutral$7,
				...lightSemantic$7,
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
				...bluish$7,
				...neutral$7,
				...darkSemantic$7,
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
		//#region src/client/presets/monokai.ts
		const bluish$6 = buildScale("--dsw-static-neutral-bluish", "#fcfcfa", "#2d2a2e", BLUISH_STEPS);
		const neutral$6 = buildScale("--dsw-static-neutral", "#fcfcfa", "#2d2a2e", NEUTRAL_STEPS);
		const lightSemantic$6 = buildSemanticScales({
			deepseek: "#6B42A0",
			blue: "#6B42A0",
			green: "#5A8A2A",
			amber: "#B87A00",
			red: "#FF6188"
		});
		const darkSemantic$6 = buildSemanticScales({
			deepseek: "#AB9DF2",
			blue: "#AB9DF2",
			green: "#A9DC76",
			amber: "#FFD866",
			red: "#FF9DB5"
		});
		const monokai = {
			label: "Monokai",
			light: {
				...bluish$6,
				...neutral$6,
				...lightSemantic$6,
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
				...bluish$6,
				...neutral$6,
				...darkSemantic$6,
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
		//#region src/client/presets/nord.ts
		const bluish$5 = buildScale("--dsw-static-neutral-bluish", "#D8DEE9", "#2E3440", BLUISH_STEPS);
		const neutral$5 = buildScale("--dsw-static-neutral", "#D8DEE9", "#2E3440", NEUTRAL_STEPS);
		const lightSemantic$5 = buildSemanticScales({
			deepseek: "#5E81AC",
			blue: "#5E81AC",
			green: "#A3BE8C",
			amber: "#EBCB8B",
			red: "#BF616A"
		});
		const darkSemantic$5 = buildSemanticScales({
			deepseek: "#88C0D0",
			blue: "#88C0D0",
			green: "#C6D7B8",
			amber: "#F3DFB7",
			red: "#D79DA3"
		});
		const nord = {
			label: "Nord",
			light: {
				...bluish$5,
				...neutral$5,
				...lightSemantic$5,
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
				...bluish$5,
				...neutral$5,
				...darkSemantic$5,
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
		const bluish$4 = buildScale("--dsw-static-neutral-bluish", "#FAFAFA", "#383A42", BLUISH_STEPS);
		const neutral$4 = buildScale("--dsw-static-neutral", "#FAFAFA", "#383A42", NEUTRAL_STEPS);
		const lightSemantic$4 = buildSemanticScales({
			deepseek: "#4078F2",
			blue: "#4078F2",
			green: "#50A14F",
			amber: "#C18401",
			red: "#E45649"
		});
		const darkSemantic$4 = buildSemanticScales({
			deepseek: "#61AFEF",
			blue: "#61AFEF",
			green: "#98C379",
			amber: "#E5C07B",
			red: "#E06C75"
		});
		const onedark = {
			label: "One Dark",
			light: {
				...bluish$4,
				...neutral$4,
				...lightSemantic$4,
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
				...bluish$4,
				...neutral$4,
				...darkSemantic$4,
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
		//#region src/client/presets/rosepine.ts
		const bluish$3 = buildScale("--dsw-static-neutral-bluish", "#faf4ed", "#191724", BLUISH_STEPS);
		const neutral$3 = buildScale("--dsw-static-neutral", "#faf4ed", "#191724", NEUTRAL_STEPS);
		const lightSemantic$3 = buildSemanticScales({
			deepseek: "#907AA9",
			blue: "#907AA9",
			green: "#286983",
			amber: "#EA9D34",
			red: "#B4637A"
		});
		const darkSemantic$3 = buildSemanticScales({
			deepseek: "#C4A7E7",
			blue: "#C4A7E7",
			green: "#9CCFD8",
			amber: "#F6C177",
			red: "#EB6F92"
		});
		const rosepine = {
			label: "Rosé Pine",
			light: {
				...bluish$3,
				...neutral$3,
				...lightSemantic$3,
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
				...bluish$3,
				...neutral$3,
				...darkSemantic$3,
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
		const bluish$2 = buildScale("--dsw-static-neutral-bluish", "#fdf6e3", "#002b36", BLUISH_STEPS);
		const neutral$2 = buildScale("--dsw-static-neutral", "#fdf6e3", "#002b36", NEUTRAL_STEPS);
		const lightSemantic$2 = buildSemanticScales({
			deepseek: "#268BD2",
			blue: "#268BD2",
			green: "#859900",
			amber: "#B58900",
			red: "#DC322F"
		});
		const darkSemantic$2 = buildSemanticScales({
			deepseek: "#78B7E3",
			blue: "#78B7E3",
			green: "#B3C061",
			amber: "#D1B661",
			red: "#E9807E"
		});
		const solarized = {
			label: "Solarized",
			light: {
				...bluish$2,
				...neutral$2,
				...lightSemantic$2,
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
				...bluish$2,
				...neutral$2,
				...darkSemantic$2,
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
		//#region src/client/presets/tokyonight.ts
		const bluish$1 = buildScale("--dsw-static-neutral-bluish", "#e6e7ed", "#1a1b26", BLUISH_STEPS);
		const neutral$1 = buildScale("--dsw-static-neutral", "#e6e7ed", "#1a1b26", NEUTRAL_STEPS);
		const lightSemantic$1 = buildSemanticScales({
			deepseek: "#34548A",
			blue: "#34548A",
			green: "#33635C",
			amber: "#8F5E15",
			red: "#C53B53"
		});
		const darkSemantic$1 = buildSemanticScales({
			deepseek: "#7AA2F7",
			blue: "#7AA2F7",
			green: "#9ECE6A",
			amber: "#E0AF68",
			red: "#F7768E"
		});
		const tokyonight = {
			label: "Tokyo Night",
			light: {
				...bluish$1,
				...neutral$1,
				...lightSemantic$1,
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
				...bluish$1,
				...neutral$1,
				...darkSemantic$1,
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
		const PRESETS = {
			ayu,
			catppuccin,
			dracula,
			dsh,
			github,
			gruvbox,
			monokai,
			nord,
			onedark,
			rosepine,
			solarized,
			tokyonight,
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
		const presetOptions = [{
			value: "dsh",
			label: PRESETS.dsh.label
		}, ...Object.keys(PRESETS).filter((id) => id !== "dsh").map((id) => ({
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
		const NOOP_PRESETS = /* @__PURE__ */ new Set(["native", "dsh"]);
		function resolvePreset(id) {
			if (NOOP_PRESETS.has(id)) return null;
			const preset = PRESETS[id];
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
		function buildOverrides(id) {
			const resolved = resolvePreset(id);
			if (!resolved) return {};
			return primitiveOverrides(resolved.light, resolved.dark);
		}
		function buildFullCssFallback(id) {
			const resolved = resolvePreset(id);
			if (!resolved) return "";
			const toBlock = (m) => Object.entries(m).map(([k, v]) => `  ${k}: ${v};`).join("\n");
			return `:root{\n${toBlock(resolved.light)}\n}\nhtml[data-ds-dark-theme], body[data-ds-dark-theme]{\n${toBlock(resolved.dark)}\n}`;
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
		//#region src/client/components.tsx
		/**
		* Theme settings UI: scheme selector + preset picker.
		*/
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
		function IconCheck() {
			return react.createElement("svg", {
				width: 16,
				height: 16,
				viewBox: "0 0 16 16",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				style: {
					marginLeft: "auto",
					color: "var(--dsw-alias-label-primary)",
					display: "inline-flex"
				}
			}, react.createElement("path", {
				d: "M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z",
				fill: "currentColor"
			}));
		}
		function SchemeMenu(props) {
			const { value, options, onSelect } = props;
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
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => setOpen(!open)
			}, react.createElement("span", { className: "ct-select-label" }, selected?.label ?? ""), react.createElement("span", { className: "ct-select-chevron" }, react.createElement(IconChevron, null))), open ? react.createElement("div", {
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
				}, react.createElement("span", { className: "ct-menu-item-label" }, o.label), sel ? react.createElement(IconCheck, null) : null);
			})) : null);
		}
		function ThemePanel(props) {
			const { theme, getPreset, setPreset, t } = props;
			let initScheme = "system";
			try {
				const snap = theme?.getTheme();
				if (snap?.preference) initScheme = snap.preference;
			} catch {}
			const [scheme, setScheme] = react.useState(initScheme);
			const [active, setActive] = react.useState(() => getPreset());
			function pickScheme(id) {
				setScheme(id);
				try {
					theme?.setTheme(id);
				} catch {}
			}
			function pickPreset(id) {
				setActive(id);
				setPreset(id);
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
			return react.createElement("div", { style: {
				display: "flex",
				flexDirection: "column",
				maxWidth: 760,
				paddingBottom: 8
			} }, react.createElement("div", { className: "ct-row" }, react.createElement("div", { className: "ct-row-main" }, react.createElement("div", { className: "ct-row-title" }, t("appearance.title")), react.createElement("div", { className: "ct-row-desc" }, t("appearance.desc"))), react.createElement(SchemeMenu, {
				value: scheme,
				options: schemeOptions,
				onSelect: pickScheme
			})), react.createElement("div", { className: "ct-row" }, react.createElement("div", { className: "ct-row-main" }, react.createElement("div", { className: "ct-row-title" }, t("presets.title")), react.createElement("div", { className: "ct-row-desc" }, t("presets.desc"))), react.createElement(SchemeMenu, {
				value: active,
				options: presetOptions,
				onSelect: (v) => pickPreset(v)
			})));
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
			"scheme.light": "浅色",
			"scheme.dark": "深色",
			"scheme.system": "跟随系统"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			nav: "Theme",
			"appearance.title": "Appearance",
			"appearance.desc": "Dark / Light / System",
			"presets.title": "Preset themes",
			"presets.desc": "Apply popular color schemes in one click",
			"scheme.light": "Light",
			"scheme.dark": "Dark",
			"scheme.system": "System"
		};
		//#endregion
		//#region src/client/theme.tsx
		const BASE_CSS = [
			".ct-select{box-sizing:border-box;display:inline-flex;align-items:center;gap:12px;height:36px;padding:0 14px;border:none;border-radius:18px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;white-space:nowrap;width:auto;min-width:0;max-width:100%;}",
			".ct-select:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-select:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".ct-select-label{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}",
			".ct-select-chevron{flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform 120ms ease;}",
			".ct-select[aria-expanded=\"true\"] .ct-select-chevron{transform:rotate(180deg);}",
			".ct-menu-list{box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:0;border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);min-width:218px;max-width:360px;}",
			".ct-menu-item{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:8px 10px;border:none;border-radius:10px;background:transparent;cursor:pointer;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);text-align:left;font-family:inherit;}",
			".ct-menu-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}",
			".ct-menu-check{flex:none;color:var(--dsw-alias-label-primary);display:inline-flex;margin-left:auto;}",
			".ct-menu-item-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
			".ct-row{border-bottom:1px solid var(--dsw-alias-border-l2);padding:16px 2px;display:flex;align-items:center;gap:16px;}",
			".ct-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-right:48px;}",
			".ct-row-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;}",
			".ct-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;}"
		].join("\n");
		const NOOP = /* @__PURE__ */ new Set(["native", "dsh"]);
		function isValidPreset(v) {
			return !!v && (NOOP.has(v) || v in PRESETS);
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
			function getPreset() {
				for (const key of [THEME_STORAGE_KEY, THEME_STORAGE_KEY_LEGACY]) try {
					const cur = localStorage.getItem(key);
					if (!isValidPreset(cur)) continue;
					const normalized = cur === "native" ? "dsh" : cur;
					if (cur !== normalized) try {
						localStorage.setItem(THEME_STORAGE_KEY, normalized);
					} catch {}
					else if (key === "cooltea-theme-preset") try {
						localStorage.setItem(THEME_STORAGE_KEY, cur);
					} catch {}
					return normalized;
				} catch {}
				return "dsh";
			}
			function applyPreset(id) {
				overrideDispose = release(overrideDispose);
				fallbackDispose = release(fallbackDispose);
				if (NOOP.has(id)) {
					ensureBaseline(false);
					return;
				}
				ensureBaseline(true);
				const overrides = buildOverrides(id);
				if (theme?.overrideTokens) try {
					overrideDispose = theme.overrideTokens("dsh-cool-theme", overrides);
					return;
				} catch {}
				fallbackDispose = injector.insert(buildFullCssFallback(id));
			}
			function setPreset(id) {
				try {
					localStorage.setItem(THEME_STORAGE_KEY, id);
				} catch {}
				applyPreset(id);
			}
			applyPreset(getPreset());
			ctx.effect(() => () => {
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
					getPreset,
					setPreset
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
				const candidates = new Set([
					currentLabel,
					zh.nav,
					en.nav
				].filter(Boolean));
				const cells = document.querySelectorAll("[class*=\"navCell\"], button[class*=\"navCell\"]");
				const toPatch = [];
				if (cells.length > 0) cells.forEach((c) => toPatch.push(c));
				else document.querySelectorAll("[class*=\"nav\"] button").forEach((b) => toPatch.push(b));
				for (const cell of toPatch) {
					const text = ((cell.querySelector("[class*=\"navLabel\"]") || cell)?.textContent || cell.textContent || "").trim();
					if (!Array.from(candidates).some((lbl) => text === lbl || text.includes(lbl))) continue;
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
