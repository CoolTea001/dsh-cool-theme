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
		//#region src/client/presets.ts
		/**
		* Theme presets: 12 popular color schemes, each with a light and a dark palette.
		* Pure data + shared types only; token projection lives in tokens.ts.
		*/
		const PRESETS = {
			nord: {
				label: "Nord",
				light: {
					base: "#ffffff",
					l1: "#eceff4",
					l2: "#e5e9f0",
					l3: "#d8dee9",
					overlay: "#e5e9f0",
					b1: "#d8dee9",
					b2: "#b8c4d8",
					brand: "#5e81ac",
					lp: "#2e3440",
					ls: "#4c566a",
					err: "#bf616a",
					ok: "#a3be8c",
					warn: "#ebcb8b",
					side: "#eceff4"
				},
				dark: {
					base: "#242933",
					l1: "#2e3440",
					l2: "#3b4252",
					l3: "#434c5e",
					overlay: "#3b4252",
					b1: "#434c5e",
					b2: "#4c566a",
					brand: "#88c0d0",
					lp: "#eceff4",
					ls: "#d8dee9",
					err: "#bf616a",
					ok: "#a3be8c",
					warn: "#ebcb8b",
					side: "#242933"
				}
			},
			onedark: {
				label: "One Dark",
				light: {
					base: "#ffffff",
					l1: "#f8f9fb",
					l2: "#eef1f5",
					l3: "#e4e8ef",
					overlay: "#ffffff",
					b1: "#e4e8ef",
					b2: "#d1d7e0",
					brand: "#4078f2",
					lp: "#383a42",
					ls: "#6c7086",
					err: "#e45649",
					ok: "#50a14f",
					warn: "#c18401",
					side: "#f8f9fb"
				},
				dark: {
					base: "#1e2127",
					l1: "#282c34",
					l2: "#2c313a",
					l3: "#353b48",
					overlay: "#1d2026",
					b1: "#3e4451",
					b2: "#4b5263",
					brand: "#61afef",
					lp: "#abb2bf",
					ls: "#7f848e",
					err: "#e06c75",
					ok: "#98c379",
					warn: "#e5c07b",
					side: "#1e2127"
				}
			},
			github: {
				label: "GitHub",
				light: {
					base: "#ffffff",
					l1: "#f6f8fa",
					l2: "#eef1f4",
					l3: "#e6eaf0",
					overlay: "#ffffff",
					b1: "#d0d7de",
					b2: "#b7c0cc",
					brand: "#0969da",
					lp: "#24292f",
					ls: "#656d76",
					err: "#cf222e",
					ok: "#1a7f37",
					warn: "#9a6700",
					side: "#f6f8fa"
				},
				dark: {
					base: "#010409",
					l1: "#0d1117",
					l2: "#161b22",
					l3: "#21262d",
					overlay: "#161b22",
					b1: "#30363d",
					b2: "#3d444d",
					brand: "#58a6ff",
					lp: "#e6edf3",
					ls: "#9198a1",
					err: "#f85149",
					ok: "#3fb950",
					warn: "#d29922",
					side: "#010409"
				}
			},
			catppuccin: {
				label: "Catppuccin",
				light: {
					base: "#ffffff",
					l1: "#eff1f5",
					l2: "#e6e9ef",
					l3: "#dce0e8",
					overlay: "#eff1f5",
					b1: "#ccd0da",
					b2: "#bcc0cc",
					brand: "#1e66f5",
					lp: "#4c4f69",
					ls: "#5c5f77",
					err: "#d20f39",
					ok: "#40a02b",
					warn: "#df8e1d",
					side: "#eff1f5"
				},
				dark: {
					base: "#1e1e2e",
					l1: "#313244",
					l2: "#414558",
					l3: "#45475a",
					overlay: "#313244",
					b1: "#45475a",
					b2: "#585b70",
					brand: "#89b4fa",
					lp: "#cdd6f4",
					ls: "#a6adc8",
					err: "#f38ba8",
					ok: "#a6e3a1",
					warn: "#f9e2af",
					side: "#1e1e2e"
				}
			},
			dracula: {
				label: "Dracula",
				light: {
					base: "#ffffff",
					l1: "#f8f8f2",
					l2: "#f1f2f8",
					l3: "#e9eaf3",
					overlay: "#ffffff",
					b1: "#d0d3e6",
					b2: "#b8bccc",
					brand: "#7c3aed",
					lp: "#282a36",
					ls: "#6272a4",
					err: "#e63c3c",
					ok: "#2a9d4a",
					warn: "#b78100",
					side: "#f8f8f2"
				},
				dark: {
					base: "#282a36",
					l1: "#343746",
					l2: "#44475a",
					l3: "#52556c",
					overlay: "#343746",
					b1: "#6272a4",
					b2: "#7a86b8",
					brand: "#bd93f9",
					lp: "#f8f8f2",
					ls: "#bfc0d6",
					err: "#ff5555",
					ok: "#50fa7b",
					warn: "#f1fa8c",
					side: "#282a36"
				}
			},
			tokyonight: {
				label: "Tokyo Night",
				light: {
					base: "#ffffff",
					l1: "#f7f8fb",
					l2: "#e9eaf2",
					l3: "#dfe2f0",
					overlay: "#ffffff",
					b1: "#cbd0e3",
					b2: "#b4b9cc",
					brand: "#34548a",
					lp: "#1a1b26",
					ls: "#5a638c",
					err: "#c53b53",
					ok: "#33635c",
					warn: "#8f5e15",
					side: "#f7f8fb"
				},
				dark: {
					base: "#1a1b26",
					l1: "#24283b",
					l2: "#2f354e",
					l3: "#414868",
					overlay: "#24283b",
					b1: "#414868",
					b2: "#5a638c",
					brand: "#7aa2f7",
					lp: "#c0caf5",
					ls: "#9aa1bf",
					err: "#f7768e",
					ok: "#9ece6a",
					warn: "#e0af68",
					side: "#1a1b26"
				}
			},
			solarized: {
				label: "Solarized",
				light: {
					base: "#fdf6e3",
					l1: "#eee8d5",
					l2: "#e7dfc8",
					l3: "#d9d2b8",
					overlay: "#eee8d5",
					b1: "#93a1a1",
					b2: "#839496",
					brand: "#268bd2",
					lp: "#586e75",
					ls: "#657b83",
					err: "#dc322f",
					ok: "#859900",
					warn: "#b58900",
					side: "#fdf6e3"
				},
				dark: {
					base: "#002b36",
					l1: "#073642",
					l2: "#0e4654",
					l3: "#204e5b",
					overlay: "#073642",
					b1: "#586e75",
					b2: "#657b83",
					brand: "#268bd2",
					lp: "#fdf6e3",
					ls: "#93a1a1",
					err: "#dc322f",
					ok: "#859900",
					warn: "#b58900",
					side: "#002b36"
				}
			},
			gruvbox: {
				label: "Gruvbox",
				light: {
					base: "#fbf1c7",
					l1: "#ebdbb2",
					l2: "#d5c4a1",
					l3: "#bdae93",
					overlay: "#ebdbb2",
					b1: "#a89984",
					b2: "#928374",
					brand: "#076678",
					lp: "#3c3836",
					ls: "#504945",
					err: "#cc241d",
					ok: "#98971a",
					warn: "#d79921",
					side: "#fbf1c7"
				},
				dark: {
					base: "#282828",
					l1: "#3c3836",
					l2: "#504945",
					l3: "#665c54",
					overlay: "#3c3836",
					b1: "#7c6f64",
					b2: "#928374",
					brand: "#83a598",
					lp: "#ebdbb2",
					ls: "#d5c4a1",
					err: "#fb4934",
					ok: "#b8bb26",
					warn: "#fabd2f",
					side: "#282828"
				}
			},
			monokai: {
				label: "Monokai",
				light: {
					base: "#ffffff",
					l1: "#f9f8f5",
					l2: "#ebe8e3",
					l3: "#ddd8d0",
					overlay: "#f9f8f5",
					b1: "#c7c0b3",
					b2: "#a8a194",
					brand: "#6b42a0",
					lp: "#2d2a2e",
					ls: "#5b5956",
					err: "#ff6188",
					ok: "#5a8a2a",
					warn: "#b87a00",
					side: "#f9f8f5"
				},
				dark: {
					base: "#2d2a2e",
					l1: "#403e41",
					l2: "#5b5956",
					l3: "#69676c",
					overlay: "#403e41",
					b1: "#7a7978",
					b2: "#948d8a",
					brand: "#ab9df2",
					lp: "#fcfcfa",
					ls: "#c1c0c0",
					err: "#ff6188",
					ok: "#a9dc76",
					warn: "#ffd866",
					side: "#2d2a2e"
				}
			},
			rosepine: {
				label: "Rosé Pine",
				light: {
					base: "#faf4ed",
					l1: "#fffaf3",
					l2: "#f2e9e1",
					l3: "#e8ddd3",
					overlay: "#fffaf3",
					b1: "#cecacd",
					b2: "#9893a5",
					brand: "#907aa9",
					lp: "#575279",
					ls: "#6e6a86",
					err: "#b4637a",
					ok: "#286983",
					warn: "#ea9d34",
					side: "#faf4ed"
				},
				dark: {
					base: "#191724",
					l1: "#1f1d2e",
					l2: "#26233a",
					l3: "#353142",
					overlay: "#1f1d2e",
					b1: "#6e6a86",
					b2: "#908caa",
					brand: "#c4a7e7",
					lp: "#e0def4",
					ls: "#908caa",
					err: "#eb6f92",
					ok: "#9ccfd8",
					warn: "#f6c177",
					side: "#191724"
				}
			},
			ayu: {
				label: "Ayu",
				light: {
					base: "#fafafa",
					l1: "#f3f4f5",
					l2: "#eaecee",
					l3: "#e1e4e8",
					overlay: "#f3f4f5",
					b1: "#c4c9d0",
					b2: "#a8b0bb",
					brand: "#55b4d4",
					lp: "#5c6773",
					ls: "#5c6773",
					err: "#e65050",
					ok: "#86b300",
					warn: "#fa8d3e",
					side: "#fafafa"
				},
				dark: {
					base: "#0a0e14",
					l1: "#1f2430",
					l2: "#242a38",
					l3: "#3e4b5c",
					overlay: "#1f2430",
					b1: "#5c6773",
					b2: "#7a8a9b",
					brand: "#39bae6",
					lp: "#c5cddb",
					ls: "#95a0b0",
					err: "#ff3333",
					ok: "#7fd962",
					warn: "#ffb454",
					side: "#0a0e14"
				}
			},
			zenburn: {
				label: "Zenburn",
				light: {
					base: "#ffffef",
					l1: "#f6f1e1",
					l2: "#ebe3c8",
					l3: "#ddd6b8",
					overlay: "#f6f1e1",
					b1: "#c2b8a3",
					b2: "#a8a090",
					brand: "#2b6f6f",
					lp: "#3f3f3f",
					ls: "#5f6f5f",
					err: "#8c3333",
					ok: "#4a6f4a",
					warn: "#8f7a3a",
					side: "#ffffef"
				},
				dark: {
					base: "#3f3f3f",
					l1: "#4f4f4f",
					l2: "#5f5f5f",
					l3: "#6f6f6f",
					overlay: "#4f4f4f",
					b1: "#7f7f7f",
					b2: "#9a9a9a",
					brand: "#8cd0d3",
					lp: "#dcdccc",
					ls: "#9ab0a0",
					err: "#cc9393",
					ok: "#7f9f7f",
					warn: "#d0bf8f",
					side: "#3f3f3f"
				}
			}
		};
		const presetOptions = [
			{
				value: "native",
				label: "DeepSeek Harness"
			},
			{
				value: "ayu",
				label: "Ayu"
			},
			{
				value: "catppuccin",
				label: "Catppuccin"
			},
			{
				value: "dracula",
				label: "Dracula"
			},
			{
				value: "github",
				label: "GitHub"
			},
			{
				value: "gruvbox",
				label: "Gruvbox"
			},
			{
				value: "monokai",
				label: "Monokai"
			},
			{
				value: "nord",
				label: "Nord"
			},
			{
				value: "onedark",
				label: "One Dark"
			},
			{
				value: "rosepine",
				label: "Rosé Pine"
			},
			{
				value: "solarized",
				label: "Solarized"
			},
			{
				value: "tokyonight",
				label: "Tokyo Night"
			},
			{
				value: "zenburn",
				label: "Zenburn"
			}
		];
		//#endregion
		//#region src/client/colors.ts
		function hexLum(hex) {
			const h = hex.replace("#", "");
			const r = parseInt(h.slice(0, 2), 16);
			const g = parseInt(h.slice(2, 4), 16);
			const b = parseInt(h.slice(4, 6), 16);
			return r * .299 + g * .587 + b * .114;
		}
		function pickCodeBlockColors(p) {
			const page = p.base ?? p.l1;
			const isLight = hexLum(page) > 128;
			const brightest = (colors) => {
				let best = colors[0];
				let max = -1;
				for (const c of colors) {
					const l = hexLum(c);
					if (l > max) {
						max = l;
						best = c;
					}
				}
				return best;
			};
			if (isLight) {
				const banner = brightest([
					p.l1,
					p.l2,
					p.l3
				].filter((c) => c !== page));
				const bannerLum = hexLum(banner);
				let block;
				let bestL = -1;
				for (const c of [
					p.l2,
					p.l3,
					p.b1
				]) {
					if (c === page || c === banner) continue;
					const l = hexLum(c);
					if (l < bannerLum && l > bestL) {
						bestL = l;
						block = c;
					}
				}
				const resolved = block ?? [
					p.l2,
					p.l3,
					p.b1
				].find((c) => c !== page && c !== banner) ?? p.l2;
				if (hexLum(banner) < hexLum(resolved)) return {
					banner: resolved,
					block: banner
				};
				if (banner === resolved) return {
					banner,
					block: p.l3 !== banner ? p.l3 : p.b1
				};
				return {
					banner,
					block: resolved
				};
			}
			const banner = brightest([
				p.l3,
				p.b1,
				p.b2,
				p.l2
			].filter((c) => c !== page));
			let block = [
				p.l2,
				p.l3,
				p.b1,
				p.b2
			].find((c) => c !== page && c !== banner) ?? p.l2;
			{
				let min = Infinity;
				for (const c of [
					p.l2,
					p.b1,
					p.l3,
					p.b2
				]) {
					if (c === page || c === banner) continue;
					const l = hexLum(c);
					if (l < min) {
						min = l;
						block = c;
					}
				}
			}
			if (hexLum(banner) < hexLum(block)) return {
				banner: block,
				block: banner
			};
			if (block === page) block = p.l2 !== banner ? p.l2 : p.b1;
			if (banner === block) block = p.b2 !== banner ? p.b2 : p.b1;
			return {
				banner,
				block
			};
		}
		//#endregion
		//#region src/client/tokens.ts
		/**
		* Token projection: preset palette -> DSH theme-token overrides.
		*/
		function brightest(...colors) {
			let best = colors[0];
			let max = -1;
			for (const c of colors) {
				const l = hexLum(c);
				if (l > max) {
					max = l;
					best = c;
				}
			}
			return best;
		}
		function aliasCss(p) {
			const m = {};
			const base = p.base ?? p.l1;
			const isLight = hexLum(base) > 128;
			m["--dsw-alias-bg-base"] = base;
			m["--dsw-alias-bg-layer-1"] = p.l1;
			m["--dsw-alias-bg-layer-2"] = p.l2;
			m["--dsw-alias-bg-layer-3"] = p.l3;
			m["--dsw-alias-bg-mask-1"] = base + "3d";
			m["--dsw-alias-bg-mask-2"] = base + "1f";
			m["--dsw-alias-bg-mask-3"] = base + "7a";
			m["--dsw-alias-bg-mask-photo"] = "#000000e0";
			m["--dsw-alias-bg-mask-drop"] = base + "b3";
			m["--dsw-alias-bg-module-platform"] = isLight ? p.l1 : p.l3;
			m["--dsw-alias-bg-multi-select"] = isLight ? p.l1 : p.l3;
			m["--dsw-alias-bg-overlay"] = p.l2;
			m["--dsw-alias-bg-skeleton"] = p.b1 + "0a";
			m["--dsw-alias-border-inverted2"] = "#0000";
			m["--dsw-alias-border-inverted"] = "#0000";
			m["--dsw-alias-border-l1"] = p.b1;
			m["--dsw-alias-border-l2-darkmode-thin"] = p.b2;
			m["--dsw-alias-border-l2"] = p.b2;
			m["--dsw-alias-border-l3"] = p.b2;
			m["--dsw-alias-border-l4"] = p.b2;
			m["--dsw-alias-brand-primary-invert"] = p.lp;
			m["--dsw-alias-brand-primary-new-colorprimary-new-color"] = p.brand;
			m["--dsw-alias-brand-primary"] = p.brand;
			m["--dsw-alias-brand-text"] = p.brand;
			m["--dsw-alias-button-contrast-fill"] = p.lp;
			m["--dsw-alias-button-elevated-fill"] = isLight ? base : p.l2;
			m["--dsw-alias-button-floating-fill"] = isLight ? base : p.l2;
			m["--dsw-alias-button-floating-hover"] = isLight ? p.l2 : p.l3;
			m["--dsw-alias-button-ghost-active-border"] = p.b1;
			m["--dsw-alias-button-ghost-active-fill"] = p.l2;
			m["--dsw-alias-button-ghost-active-hover"] = p.l3;
			m["--dsw-alias-button-info-fill"] = p.brand;
			m["--dsw-alias-button-info-hover"] = p.brand;
			m["--dsw-alias-button-primary-dimmed"] = p.l2;
			m["--dsw-alias-button-primary-fill"] = p.brand;
			m["--dsw-alias-button-primary-hover"] = p.lp;
			m["--dsw-alias-button-tool-bar-fill-invisible"] = p.l2 + "5c";
			m["--dsw-alias-button-tool-bar-fill"] = p.b1 + "80";
			m["--dsw-alias-button-tool-bar-hover"] = p.b1 + "99";
			const interactiveHover = isLight ? p.l3 : p.b2;
			m["--dsw-alias-interactive-bg-active"] = isLight ? p.b2 : p.l3;
			m["--dsw-alias-interactive-bg-hover-accent"] = p.brand + "14";
			m["--dsw-alias-interactive-bg-hover-danger"] = p.err + "14";
			m["--dsw-alias-interactive-bg-hover-solid"] = interactiveHover;
			m["--dsw-alias-interactive-bg-hover"] = interactiveHover;
			m["--dsw-alias-label-caption"] = p.lp + "99";
			m["--dsw-alias-label-dimmed"] = p.b1;
			m["--dsw-alias-label-primary-bluish"] = p.brand;
			m["--dsw-alias-label-primary-dimmed"] = p.lp;
			m["--dsw-alias-label-primary-foreground"] = base;
			m["--dsw-alias-label-primary-inverted"] = base;
			m["--dsw-alias-label-primary"] = p.lp;
			m["--dsw-alias-label-secondary"] = p.ls;
			m["--dsw-alias-label-tertiary"] = p.ls;
			m["--dsw-alias-markdown-citation"] = p.l3;
			const code = pickCodeBlockColors(p);
			m["--dsw-alias-markdown-code-block-banner"] = code.banner;
			m["--dsw-alias-markdown-code-block"] = code.block;
			m["--dsw-alias-markdown-code-segment-selected"] = p.l2;
			m["--dsw-alias-markdown-code-segment-unselected"] = p.l3;
			m["--dsw-alias-markdown-inline-code"] = p.l3;
			m["--dsw-alias-markdown-placeholder"] = p.b1;
			m["--dsw-alias-markdown-tag"] = p.l3;
			m["--dsw-alias-scrollbar-bg-l1"] = p.b1;
			m["--dsw-alias-scrollbar-bg-l2"] = p.b2;
			m["--dsw-alias-scrollbar-hover-l1"] = p.b2;
			m["--dsw-alias-scrollbar-hover-l2"] = p.b2;
			m["--dsw-alias-state-business-primary"] = p.brand;
			m["--dsw-alias-state-business-tertiary"] = p.brand + "20";
			m["--dsw-alias-state-error-primary"] = p.err;
			m["--dsw-alias-state-error-secondary"] = p.err;
			m["--dsw-alias-state-success-primary"] = p.ok;
			m["--dsw-alias-state-success-secondary"] = p.ok;
			m["--dsw-alias-state-success-tertiary"] = p.ok + "20";
			m["--dsw-alias-state-warn-label"] = p.warn;
			m["--dsw-alias-state-warn-primary"] = p.warn;
			m["--dsw-alias-state-warn-secondary"] = p.warn;
			m["--dsw-alias-state-warn-tertiary"] = p.warn + "20";
			m["--dsw-alias-toast-bg"] = isLight ? base : p.l3;
			m["--dsw-cool-theme-toast-bg"] = isLight ? base : p.l3;
			m["--dsw-cool-theme-toast-fg"] = p.lp;
			m["--dsw-cool-theme-toast-border"] = p.b1;
			m["--dsw-alias-tooltip-bg"] = isLight ? p.l3 : brightest(p.l3, p.b2);
			m["--dsw-specific-bubble-highlight"] = p.brand + "30";
			m["--dsw-specific-bubble"] = p.brand + "15";
			m["--dsw-specific-input-major"] = isLight ? base : p.l1;
			m["--dsw-specific-login-input"] = p.l1;
			m["--dsw-specific-menu"] = p.l2;
			m["--dsw-specific-selector"] = isLight ? p.l1 : p.l3;
			m["--dsw-specific-sidebar-fill"] = p.l1;
			m["--dsw-specific-sidebar-nav-item-hover"] = p.l3;
			m["--dsw-specific-sidebar-nav-item-active"] = p.l3;
			m["--dsw-specific-sidebar-nav-item-active-accent"] = p.brand + "20";
			m["--dsw-specific-tip"] = p.l1;
			return m;
		}
		function staticCss(p) {
			const m = {};
			const base = p.base ?? p.l1;
			m["--dsw-static-neutral-bluish-00"] = p.lp;
			m["--dsw-static-neutral-bluish-50"] = p.lp;
			m["--dsw-static-neutral-bluish-60"] = p.l3;
			m["--dsw-static-neutral-bluish-75"] = p.l3;
			m["--dsw-static-neutral-bluish-100"] = p.ls;
			m["--dsw-static-neutral-bluish-150"] = p.ls;
			m["--dsw-static-neutral-bluish-200"] = p.b1;
			m["--dsw-static-neutral-bluish-300"] = p.b1;
			m["--dsw-static-neutral-bluish-400"] = p.b1;
			m["--dsw-static-neutral-bluish-500"] = p.b2;
			m["--dsw-static-neutral-bluish-600"] = p.b2;
			m["--dsw-static-neutral-bluish-700"] = p.l2;
			m["--dsw-static-neutral-bluish-750"] = p.l2;
			m["--dsw-static-neutral-bluish-800"] = p.l2;
			m["--dsw-static-neutral-bluish-850"] = p.l1;
			m["--dsw-static-neutral-bluish-875"] = p.l1;
			m["--dsw-static-neutral-bluish-900"] = p.l1;
			m["--dsw-static-neutral-bluish-950"] = base;
			m["--dsw-static-neutral-bluish-1000"] = base;
			for (const k of [
				"100",
				"200",
				"300",
				"400",
				"450",
				"500",
				"600",
				"800",
				"900"
			]) {
				m[`--dsw-static-deepseek-${k}`] = p.brand;
				m[`--dsw-static-blue-${k}`] = p.brand;
			}
			m["--dsw-static-deepseek-50"] = p.brand + "15";
			m["--dsw-static-blue-50"] = p.brand + "15";
			m["--dsw-static-blue-50p"] = p.brand + "15";
			m["--dsw-static-blue-75"] = p.brand + "20";
			m["--dsw-static-green-100"] = p.ok + "20";
			m["--dsw-static-green-400"] = p.ok;
			m["--dsw-static-green-500"] = p.ok;
			m["--dsw-static-green-900"] = p.ok + "30";
			m["--dsw-static-amber-100"] = p.warn + "20";
			m["--dsw-static-amber-400"] = p.warn;
			m["--dsw-static-amber-500"] = p.warn;
			m["--dsw-static-amber-600"] = p.warn;
			m["--dsw-static-amber-900"] = p.warn + "30";
			m["--dsw-static-red-50"] = p.err + "15";
			m["--dsw-static-red-100"] = p.err + "20";
			m["--dsw-static-red-400"] = p.err;
			m["--dsw-static-red-500"] = p.err;
			m["--dsw-static-red-600"] = p.err;
			m["--dsw-static-red-900"] = p.err + "30";
			m["--dsw-static-neutral-00"] = p.lp;
			m["--dsw-static-neutral-50"] = p.lp;
			m["--dsw-static-neutral-100"] = p.ls;
			m["--dsw-static-neutral-150"] = p.ls;
			m["--dsw-static-neutral-200"] = p.b1;
			m["--dsw-static-neutral-250"] = p.b1;
			m["--dsw-static-neutral-300"] = p.b1;
			m["--dsw-static-neutral-400"] = p.b1;
			m["--dsw-static-neutral-500"] = p.b2;
			m["--dsw-static-neutral-550"] = p.b2;
			m["--dsw-static-neutral-600"] = p.b2;
			m["--dsw-static-neutral-700"] = p.l2;
			m["--dsw-static-neutral-800"] = p.l2;
			m["--dsw-static-neutral-850"] = p.l1;
			m["--dsw-static-neutral-900"] = base;
			m["--dsw-static-neutral-1000"] = base;
			return m;
		}
		const SHIKI_TABLE = /* @__PURE__ */ new Map([
			[PRESETS.nord.light, {
				constant: "#2e6ea6",
				string: "#3d7a1f",
				comment: "#6c7a8e",
				keyword: "#8b4a9a",
				parameter: "#9a5d2e",
				function: "#2f6f8a",
				stringExpression: "#3d7a1f",
				punctuation: "#4c566a",
				link: "#5e81ac"
			}],
			[PRESETS.nord.dark, {
				constant: "#8be9fd",
				string: "#a3be8c",
				comment: "#6272a4",
				keyword: "#ff79c6",
				parameter: "#d08770",
				function: "#88c0d0",
				stringExpression: "#a3be8c",
				punctuation: "#8ca0b8",
				link: "#88c0d0"
			}],
			[PRESETS.onedark.light, {
				constant: "#0b7ea4",
				string: "#1f7a3a",
				comment: "#76808f",
				keyword: "#a626a4",
				parameter: "#986801",
				function: "#4078f2",
				stringExpression: "#1f7a3a",
				punctuation: "#5c6370",
				link: "#4078f2"
			}],
			[PRESETS.onedark.dark, {
				constant: "#56b6c2",
				string: "#98c379",
				comment: "#7f848e",
				keyword: "#c678dd",
				parameter: "#d19a66",
				function: "#61afef",
				stringExpression: "#98c379",
				punctuation: "#abb2bf",
				link: "#61afef"
			}],
			[PRESETS.github.light, {
				constant: "#0550ae",
				string: "#0a3069",
				comment: "#6e7781",
				keyword: "#cf222e",
				parameter: "#953800",
				function: "#8250df",
				stringExpression: "#1a7f37",
				punctuation: "#656d76",
				link: "#0969da"
			}],
			[PRESETS.github.dark, {
				constant: "#79c0ff",
				string: "#a5d6ff",
				comment: "#8b949e",
				keyword: "#ff7b72",
				parameter: "#ffa657",
				function: "#d2a8ff",
				stringExpression: "#7ee787",
				punctuation: "#8b949e",
				link: "#58a6ff"
			}],
			[PRESETS.catppuccin.light, {
				constant: "#0b7ec8",
				string: "#1a7a3a",
				comment: "#7a7f8e",
				keyword: "#8839ef",
				parameter: "#fe640b",
				function: "#1e66f5",
				stringExpression: "#1a7a3a",
				punctuation: "#5c5f77",
				link: "#1e66f5"
			}],
			[PRESETS.catppuccin.dark, {
				constant: "#89dceb",
				string: "#a6e3a1",
				comment: "#6c7086",
				keyword: "#cba6f7",
				parameter: "#fab387",
				function: "#89b4fa",
				stringExpression: "#a6e3a1",
				punctuation: "#bac2de",
				link: "#89b4fa"
			}],
			[PRESETS.dracula.light, {
				constant: "#6a3fb5",
				string: "#1a7a3a",
				comment: "#6d7a9e",
				keyword: "#a21caf",
				parameter: "#b45309",
				function: "#7c3aed",
				stringExpression: "#1a7a3a",
				punctuation: "#44475a",
				link: "#7c3aed"
			}],
			[PRESETS.dracula.dark, {
				constant: "#8be9fd",
				string: "#50fa7b",
				comment: "#6272a4",
				keyword: "#ff79c6",
				parameter: "#ffb86c",
				function: "#bd93f9",
				stringExpression: "#50fa7b",
				punctuation: "#f8f8f2",
				link: "#bd93f9"
			}],
			[PRESETS.tokyonight.light, {
				constant: "#0f4b6e",
				string: "#1a7a3a",
				comment: "#6e7a9e",
				keyword: "#8c4351",
				parameter: "#965027",
				function: "#34548a",
				stringExpression: "#1a7a3a",
				punctuation: "#5a638c",
				link: "#34548a"
			}],
			[PRESETS.tokyonight.dark, {
				constant: "#7dcfff",
				string: "#9ece6a",
				comment: "#565f89",
				keyword: "#bb9af7",
				parameter: "#ff9e64",
				function: "#7aa2f7",
				stringExpression: "#9ece6a",
				punctuation: "#c0caf5",
				link: "#7aa2f7"
			}],
			[PRESETS.solarized.light, {
				constant: "#2aa198",
				string: "#586e75",
				comment: "#93a1a1",
				keyword: "#859900",
				parameter: "#cb4b16",
				function: "#268bd2",
				stringExpression: "#2aa198",
				punctuation: "#657b83",
				link: "#268bd2"
			}],
			[PRESETS.solarized.dark, {
				constant: "#2aa198",
				string: "#859900",
				comment: "#586e75",
				keyword: "#268bd2",
				parameter: "#cb4b16",
				function: "#b58900",
				stringExpression: "#2aa198",
				punctuation: "#93a1a1",
				link: "#268bd2"
			}],
			[PRESETS.gruvbox.light, {
				constant: "#076678",
				string: "#79740e",
				comment: "#928374",
				keyword: "#9d0006",
				parameter: "#af3a03",
				function: "#076678",
				stringExpression: "#79740e",
				punctuation: "#504945",
				link: "#076678"
			}],
			[PRESETS.gruvbox.dark, {
				constant: "#83a598",
				string: "#b8bb26",
				comment: "#928374",
				keyword: "#fb4934",
				parameter: "#fe8019",
				function: "#fabd2f",
				stringExpression: "#b8bb26",
				punctuation: "#ebdbb2",
				link: "#83a598"
			}],
			[PRESETS.monokai.light, {
				constant: "#6b42a0",
				string: "#2a7a2a",
				comment: "#8a8a8a",
				keyword: "#c4265e",
				parameter: "#b45a00",
				function: "#6b42a0",
				stringExpression: "#2a7a2a",
				punctuation: "#5b5956",
				link: "#6b42a0"
			}],
			[PRESETS.monokai.dark, {
				constant: "#ab9df2",
				string: "#a9dc76",
				comment: "#7a7978",
				keyword: "#ff6188",
				parameter: "#fc9867",
				function: "#78dce8",
				stringExpression: "#a9dc76",
				punctuation: "#fcfcfa",
				link: "#ab9df2"
			}],
			[PRESETS.rosepine.light, {
				constant: "#56949f",
				string: "#286983",
				comment: "#9893a5",
				keyword: "#907aa9",
				parameter: "#b4637a",
				function: "#907aa9",
				stringExpression: "#286983",
				punctuation: "#575279",
				link: "#907aa9"
			}],
			[PRESETS.rosepine.dark, {
				constant: "#9ccfd8",
				string: "#ebbcba",
				comment: "#6e6a86",
				keyword: "#c4a7e7",
				parameter: "#eb6f92",
				function: "#e0def4",
				stringExpression: "#ebbcba",
				punctuation: "#e0def4",
				link: "#c4a7e7"
			}],
			[PRESETS.ayu.light, {
				constant: "#55b4d4",
				string: "#86b300",
				comment: "#a8b0bb",
				keyword: "#fa8d3e",
				parameter: "#f07171",
				function: "#55b4d4",
				stringExpression: "#86b300",
				punctuation: "#5c6773",
				link: "#55b4d4"
			}],
			[PRESETS.ayu.dark, {
				constant: "#39bae6",
				string: "#7fd962",
				comment: "#5c6773",
				keyword: "#ffb454",
				parameter: "#ff8f40",
				function: "#59e1ff",
				stringExpression: "#7fd962",
				punctuation: "#c5cddb",
				link: "#39bae6"
			}],
			[PRESETS.zenburn.light, {
				constant: "#2b6f6f",
				string: "#8c3333",
				comment: "#7a8a7a",
				keyword: "#705040",
				parameter: "#8f5a00",
				function: "#2b6f6f",
				stringExpression: "#8c3333",
				punctuation: "#5f6f5f",
				link: "#2b6f6f"
			}],
			[PRESETS.zenburn.dark, {
				constant: "#8cd0d3",
				string: "#cc9393",
				comment: "#7f9f7f",
				keyword: "#f0dfaf",
				parameter: "#d0bf8f",
				function: "#8cd0d3",
				stringExpression: "#cc9393",
				punctuation: "#dcdccc",
				link: "#8cd0d3"
			}]
		]);
		const SHIKI_FALLBACK = {
			constant: "#0550ae",
			string: "#1a7f37",
			comment: "#6e7781",
			keyword: "#cf222e",
			parameter: "#953800",
			function: "#8250df",
			stringExpression: "#1a7f37",
			punctuation: "#656d76",
			link: "#0969da"
		};
		function shikiCss(p) {
			const m = {};
			m["--shiki-foreground"] = p.lp;
			m["--shiki-background"] = pickCodeBlockColors(p).block;
			const t = SHIKI_TABLE.get(p) ?? SHIKI_FALLBACK;
			m["--shiki-token-constant"] = t.constant;
			m["--shiki-token-string"] = t.string;
			m["--shiki-token-comment"] = t.comment;
			m["--shiki-token-keyword"] = t.keyword;
			m["--shiki-token-parameter"] = t.parameter;
			m["--shiki-token-function"] = t.function;
			m["--shiki-token-string-expression"] = t.stringExpression;
			m["--shiki-token-punctuation"] = t.punctuation;
			m["--shiki-token-link"] = t.link;
			return m;
		}
		function getTokenMaps(id) {
			const preset = PRESETS[id];
			return {
				lightAlias: aliasCss(preset.light),
				darkAlias: aliasCss(preset.dark),
				lightStat: staticCss(preset.light),
				darkStat: staticCss(preset.dark),
				lightShiki: shikiCss(preset.light),
				darkShiki: shikiCss(preset.dark)
			};
		}
		function buildOverrides(id) {
			if (id === "native") return {};
			const { lightAlias, darkAlias, lightStat, darkStat, lightShiki, darkShiki } = getTokenMaps(id);
			const overrides = {};
			const add = (a, b) => {
				for (const k of /* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)])) overrides[k] = {
					light: a[k] ?? b[k],
					dark: b[k] ?? a[k]
				};
			};
			add(lightAlias, darkAlias);
			add(lightStat, darkStat);
			add(lightShiki, darkShiki);
			return overrides;
		}
		function buildFullCssFallback(id) {
			if (id === "native") return "";
			const { lightAlias, darkAlias, lightStat, darkStat, lightShiki, darkShiki } = getTokenMaps(id);
			const block = (map) => Object.entries(map).map(([k, v]) => `  ${k}: ${v};`).join("\n");
			return `:root{\n${block(lightStat)}\n${block(lightAlias)}\n${block(lightShiki)}\n}\nbody[data-ds-dark-theme]{\n${block(darkStat)}\n${block(darkAlias)}\n${block(darkShiki)}\n}`;
		}
		//#endregion
		//#region src/client/style-injector.ts
		function createStyleInjector() {
			const disposers = /* @__PURE__ */ new Set();
			function insert(css) {
				try {
					if (typeof styles !== "undefined" && typeof styles.insert === "function") {
						const dispose = styles.insert(css);
						const wrapped = () => {
							try {
								dispose?.();
							} catch {}
							disposers.delete(wrapped);
						};
						disposers.add(wrapped);
						return wrapped;
					}
				} catch {}
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-cool-theme";
				tag.textContent = css;
				document.head.appendChild(tag);
				const wrapped = () => {
					tag.remove();
					disposers.delete(wrapped);
				};
				disposers.add(wrapped);
				return wrapped;
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
		/**
		* Client theme module — registers settings.section id=cool-theme.
		*/
		const PALETTE_ICON_PATH = "M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z";
		const PALETTE_ICON_DOTS = [
			{
				cx: "13.5",
				cy: "6.5",
				r: "1.4"
			},
			{
				cx: "17.5",
				cy: "10.5",
				r: "1.4"
			},
			{
				cx: "6.5",
				cy: "12.5",
				r: "1.4"
			},
			{
				cx: "8.5",
				cy: "7.5",
				r: "1.4"
			}
		];
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
			const baseCss = [
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
				".ct-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;}",
				"[class*=\"navCell\"]:hover{background:var(--dsw-specific-sidebar-nav-item-hover) !important;}",
				"[class*=\"navCell\"].active,[class*=\"navCell\"][aria-current=\"true\"]{background:var(--dsw-specific-sidebar-nav-item-active) !important;font-weight:500;}",
				"[class*=\"navCell\"].active [class*=\"navIcon\"],[class*=\"navCell\"][aria-current=\"true\"] [class*=\"navIcon\"]{color:var(--dsw-alias-brand-primary) !important;}",
				".ct-select:hover,.ct-select[aria-expanded=\"true\"]{background:var(--dsw-alias-interactive-bg-hover) !important;}",
				".ct-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover) !important;}",
				".ct-menu-item:active{background:var(--dsw-alias-interactive-bg-active) !important;}",
				"[class*=\"AppearanceRow_group\"]{display:none !important;}",
				":root{--dsw-cool-theme-toast-bg:#ffffff;--dsw-cool-theme-toast-fg:#2e3440;--dsw-cool-theme-toast-border:#e5e9f0;}",
				"body[data-ds-dark-theme]{--dsw-cool-theme-toast-bg:#3b4252;--dsw-cool-theme-toast-fg:#eceff4;--dsw-cool-theme-toast-border:#4c566a;}",
				"[class*=\"Toast_toast\"],[class*=\"toast\"],[role=\"alert\"],[data-sonner-toast]{background:var(--dsw-cool-theme-toast-bg) !important;color:var(--dsw-cool-theme-toast-fg) !important;border:1px solid var(--dsw-cool-theme-toast-border, var(--dsw-alias-border-l1)) !important;box-shadow:var(--dsw-shadow-lv3, 0 8px 24px rgba(0,0,0,.12)) !important;}",
				"body:not([data-ds-dark-theme]) [class*=\"toast\"], body:not([data-ds-dark-theme]) [class*=\"Toast_toast\"], body:not([data-ds-dark-theme]) [data-sonner-toast]{background:#ffffff !important;color:#2e3440 !important;border-color:#e5e9f0 !important;}",
				"body[data-ds-dark-theme] [class*=\"toast\"], body[data-ds-dark-theme] [class*=\"Toast_toast\"], body[data-ds-dark-theme] [data-sonner-toast]{background:#3b4252 !important;color:#eceff4 !important;border-color:#4c566a !important;}",
				"[data-sonner-toast]{--normal-bg:var(--dsw-cool-theme-toast-bg) !important;--normal-border:var(--dsw-cool-theme-toast-border) !important;--normal-text:var(--dsw-cool-theme-toast-fg) !important;}",
				"button[class*=\"Button_primary\"]:hover,button[class*=\"primary\"]:hover{background:var(--dsw-alias-button-primary-hover) !important;color:var(--dsw-alias-label-primary-foreground) !important;}",
				"button[class*=\"Button_outline\"]:hover{color:var(--dsw-alias-label-primary) !important;}"
			].join("\n");
			const injector = createStyleInjector();
			const baseDisposer = injector.insert(baseCss);
			let overrideDispose = null;
			let fallbackDispose = null;
			function isValidPreset(v) {
				return !!v && (v === "native" || v in PRESETS);
			}
			function getPreset() {
				try {
					const cur = localStorage.getItem(THEME_STORAGE_KEY);
					if (isValidPreset(cur)) return cur;
					const legacy = localStorage.getItem(THEME_STORAGE_KEY_LEGACY);
					if (isValidPreset(legacy)) {
						try {
							localStorage.setItem(THEME_STORAGE_KEY, legacy);
						} catch {}
						return legacy;
					}
				} catch {}
				return "native";
			}
			function applyPreset(id) {
				try {
					overrideDispose?.();
				} catch {}
				overrideDispose = null;
				try {
					fallbackDispose?.();
				} catch {}
				fallbackDispose = null;
				if (id === "native") return;
				const overrides = buildOverrides(id);
				if (theme && typeof theme.overrideTokens === "function") try {
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
			try {
				const init = getPreset();
				if (init !== "native") applyPreset(init);
			} catch {}
			function hideGeneralAppearance() {
				try {
					const titles = document.querySelectorAll("[class*=\"AppearanceRow_title\"], [class*=\"title\"]");
					for (const el of Array.from(titles)) {
						const txt = (el.textContent || "").trim();
						if (txt === "外观" || txt === "Appearance" || txt.toLowerCase() === "appearance") {
							const group = el.closest("[class*=\"AppearanceRow_group\"]") || el.closest("[class*=\"group\"]") || el.parentElement;
							if (group && group.querySelector("[class*=\"themeCube\"]")) group.style.display = "none";
						}
					}
					const groups = document.querySelectorAll("[class*=\"AppearanceRow_group\"]");
					for (const g of Array.from(groups)) if (g.querySelector("[class*=\"themeCube\"]")) g.style.display = "none";
				} catch {}
			}
			function fixThemeNavIcon() {
				try {
					const cells = document.querySelectorAll("[class*=\"navCell\"]");
					for (const cell of Array.from(cells)) {
						const label = cell.querySelector("[class*=\"navLabel\"]");
						if (!label) continue;
						const txt = (label.textContent || "").trim();
						if (txt !== "主题" && txt !== "Theme") continue;
						const icon = cell.querySelector("svg");
						if (!icon || icon.dataset.ctPalette === "1") continue;
						const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						svg.setAttribute("class", icon.getAttribute("class") || "");
						svg.setAttribute("width", "16");
						svg.setAttribute("height", "16");
						svg.setAttribute("viewBox", "0 0 24 24");
						svg.setAttribute("fill", "none");
						svg.setAttribute("data-ct-palette", "1");
						const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
						body.setAttribute("fill", "none");
						body.setAttribute("stroke", "currentColor");
						body.setAttribute("stroke-width", "2");
						body.setAttribute("stroke-linecap", "round");
						body.setAttribute("stroke-linejoin", "round");
						body.setAttribute("d", PALETTE_ICON_PATH);
						svg.appendChild(body);
						for (const dot of PALETTE_ICON_DOTS) {
							const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
							circle.setAttribute("fill", "currentColor");
							circle.setAttribute("stroke", "none");
							circle.setAttribute("cx", dot.cx);
							circle.setAttribute("cy", dot.cy);
							circle.setAttribute("r", dot.r);
							svg.appendChild(circle);
						}
						icon.replaceWith(svg);
					}
				} catch {}
			}
			hideGeneralAppearance();
			fixThemeNavIcon();
			try {
				const obs = new MutationObserver(() => {
					hideGeneralAppearance();
					fixThemeNavIcon();
				});
				obs.observe(document.body, {
					childList: true,
					subtree: true
				});
				ctx.effect(() => () => obs.disconnect());
			} catch {}
			ctx.effect(() => () => {
				try {
					baseDisposer();
				} catch {}
				try {
					overrideDispose?.();
				} catch {}
				try {
					fallbackDispose?.();
				} catch {}
				try {
					injector.disposeAll();
				} catch {}
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
