/**
 * Theme presets: 12 popular color schemes, each with a light and a dark palette.
 * Pure data + shared types only; token projection lives in tokens.ts.
 */
export declare const PRESETS: {
    readonly nord: {
        readonly label: "Nord";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#eceff4";
            readonly l2: "#e5e9f0";
            readonly l3: "#d8dee9";
            readonly overlay: "#e5e9f0";
            readonly b1: "#d8dee9";
            readonly b2: "#b8c4d8";
            readonly brand: "#5e81ac";
            readonly lp: "#2e3440";
            readonly ls: "#4c566a";
            readonly err: "#bf616a";
            readonly ok: "#a3be8c";
            readonly warn: "#ebcb8b";
            readonly side: "#eceff4";
        };
        readonly dark: {
            readonly base: "#242933";
            readonly l1: "#2e3440";
            readonly l2: "#3b4252";
            readonly l3: "#434c5e";
            readonly overlay: "#3b4252";
            readonly b1: "#434c5e";
            readonly b2: "#4c566a";
            readonly brand: "#88c0d0";
            readonly lp: "#eceff4";
            readonly ls: "#d8dee9";
            readonly err: "#bf616a";
            readonly ok: "#a3be8c";
            readonly warn: "#ebcb8b";
            readonly side: "#242933";
        };
    };
    readonly onedark: {
        readonly label: "One Dark";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#f8f9fb";
            readonly l2: "#eef1f5";
            readonly l3: "#e4e8ef";
            readonly overlay: "#ffffff";
            readonly b1: "#e4e8ef";
            readonly b2: "#d1d7e0";
            readonly brand: "#4078f2";
            readonly lp: "#383a42";
            readonly ls: "#6c7086";
            readonly err: "#e45649";
            readonly ok: "#50a14f";
            readonly warn: "#c18401";
            readonly side: "#f8f9fb";
        };
        readonly dark: {
            readonly base: "#1e2127";
            readonly l1: "#282c34";
            readonly l2: "#2c313a";
            readonly l3: "#353b48";
            readonly overlay: "#1d2026";
            readonly b1: "#3e4451";
            readonly b2: "#4b5263";
            readonly brand: "#61afef";
            readonly lp: "#abb2bf";
            readonly ls: "#7f848e";
            readonly err: "#e06c75";
            readonly ok: "#98c379";
            readonly warn: "#e5c07b";
            readonly side: "#1e2127";
        };
    };
    readonly github: {
        readonly label: "GitHub";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#f6f8fa";
            readonly l2: "#eef1f4";
            readonly l3: "#e6eaf0";
            readonly overlay: "#ffffff";
            readonly b1: "#d0d7de";
            readonly b2: "#b7c0cc";
            readonly brand: "#0969da";
            readonly lp: "#24292f";
            readonly ls: "#656d76";
            readonly err: "#cf222e";
            readonly ok: "#1a7f37";
            readonly warn: "#9a6700";
            readonly side: "#f6f8fa";
        };
        readonly dark: {
            readonly base: "#010409";
            readonly l1: "#0d1117";
            readonly l2: "#161b22";
            readonly l3: "#21262d";
            readonly overlay: "#161b22";
            readonly b1: "#30363d";
            readonly b2: "#3d444d";
            readonly brand: "#58a6ff";
            readonly lp: "#e6edf3";
            readonly ls: "#9198a1";
            readonly err: "#f85149";
            readonly ok: "#3fb950";
            readonly warn: "#d29922";
            readonly side: "#010409";
        };
    };
    readonly catppuccin: {
        readonly label: "Catppuccin";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#eff1f5";
            readonly l2: "#e6e9ef";
            readonly l3: "#dce0e8";
            readonly overlay: "#eff1f5";
            readonly b1: "#ccd0da";
            readonly b2: "#bcc0cc";
            readonly brand: "#1e66f5";
            readonly lp: "#4c4f69";
            readonly ls: "#5c5f77";
            readonly err: "#d20f39";
            readonly ok: "#40a02b";
            readonly warn: "#df8e1d";
            readonly side: "#eff1f5";
        };
        readonly dark: {
            readonly base: "#1e1e2e";
            readonly l1: "#313244";
            readonly l2: "#414558";
            readonly l3: "#45475a";
            readonly overlay: "#313244";
            readonly b1: "#45475a";
            readonly b2: "#585b70";
            readonly brand: "#89b4fa";
            readonly lp: "#cdd6f4";
            readonly ls: "#a6adc8";
            readonly err: "#f38ba8";
            readonly ok: "#a6e3a1";
            readonly warn: "#f9e2af";
            readonly side: "#1e1e2e";
        };
    };
    readonly dracula: {
        readonly label: "Dracula";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#f8f8f2";
            readonly l2: "#f1f2f8";
            readonly l3: "#e9eaf3";
            readonly overlay: "#ffffff";
            readonly b1: "#d0d3e6";
            readonly b2: "#b8bccc";
            readonly brand: "#7c3aed";
            readonly lp: "#282a36";
            readonly ls: "#6272a4";
            readonly err: "#e63c3c";
            readonly ok: "#2a9d4a";
            readonly warn: "#b78100";
            readonly side: "#f8f8f2";
        };
        readonly dark: {
            readonly base: "#282a36";
            readonly l1: "#343746";
            readonly l2: "#44475a";
            readonly l3: "#52556c";
            readonly overlay: "#343746";
            readonly b1: "#6272a4";
            readonly b2: "#7a86b8";
            readonly brand: "#bd93f9";
            readonly lp: "#f8f8f2";
            readonly ls: "#bfc0d6";
            readonly err: "#ff5555";
            readonly ok: "#50fa7b";
            readonly warn: "#f1fa8c";
            readonly side: "#282a36";
        };
    };
    readonly tokyonight: {
        readonly label: "Tokyo Night";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#f7f8fb";
            readonly l2: "#e9eaf2";
            readonly l3: "#dfe2f0";
            readonly overlay: "#ffffff";
            readonly b1: "#cbd0e3";
            readonly b2: "#b4b9cc";
            readonly brand: "#34548a";
            readonly lp: "#1a1b26";
            readonly ls: "#5a638c";
            readonly err: "#c53b53";
            readonly ok: "#33635c";
            readonly warn: "#8f5e15";
            readonly side: "#f7f8fb";
        };
        readonly dark: {
            readonly base: "#1a1b26";
            readonly l1: "#24283b";
            readonly l2: "#2f354e";
            readonly l3: "#414868";
            readonly overlay: "#24283b";
            readonly b1: "#414868";
            readonly b2: "#5a638c";
            readonly brand: "#7aa2f7";
            readonly lp: "#c0caf5";
            readonly ls: "#9aa1bf";
            readonly err: "#f7768e";
            readonly ok: "#9ece6a";
            readonly warn: "#e0af68";
            readonly side: "#1a1b26";
        };
    };
    readonly solarized: {
        readonly label: "Solarized";
        readonly light: {
            readonly base: "#fdf6e3";
            readonly l1: "#eee8d5";
            readonly l2: "#e7dfc8";
            readonly l3: "#d9d2b8";
            readonly overlay: "#eee8d5";
            readonly b1: "#93a1a1";
            readonly b2: "#839496";
            readonly brand: "#268bd2";
            readonly lp: "#586e75";
            readonly ls: "#657b83";
            readonly err: "#dc322f";
            readonly ok: "#859900";
            readonly warn: "#b58900";
            readonly side: "#fdf6e3";
        };
        readonly dark: {
            readonly base: "#002b36";
            readonly l1: "#073642";
            readonly l2: "#0e4654";
            readonly l3: "#204e5b";
            readonly overlay: "#073642";
            readonly b1: "#586e75";
            readonly b2: "#657b83";
            readonly brand: "#268bd2";
            readonly lp: "#fdf6e3";
            readonly ls: "#93a1a1";
            readonly err: "#dc322f";
            readonly ok: "#859900";
            readonly warn: "#b58900";
            readonly side: "#002b36";
        };
    };
    readonly gruvbox: {
        readonly label: "Gruvbox";
        readonly light: {
            readonly base: "#fbf1c7";
            readonly l1: "#ebdbb2";
            readonly l2: "#d5c4a1";
            readonly l3: "#bdae93";
            readonly overlay: "#ebdbb2";
            readonly b1: "#a89984";
            readonly b2: "#928374";
            readonly brand: "#076678";
            readonly lp: "#3c3836";
            readonly ls: "#504945";
            readonly err: "#cc241d";
            readonly ok: "#98971a";
            readonly warn: "#d79921";
            readonly side: "#fbf1c7";
        };
        readonly dark: {
            readonly base: "#282828";
            readonly l1: "#3c3836";
            readonly l2: "#504945";
            readonly l3: "#665c54";
            readonly overlay: "#3c3836";
            readonly b1: "#7c6f64";
            readonly b2: "#928374";
            readonly brand: "#83a598";
            readonly lp: "#ebdbb2";
            readonly ls: "#d5c4a1";
            readonly err: "#fb4934";
            readonly ok: "#b8bb26";
            readonly warn: "#fabd2f";
            readonly side: "#282828";
        };
    };
    readonly monokai: {
        readonly label: "Monokai";
        readonly light: {
            readonly base: "#ffffff";
            readonly l1: "#f9f8f5";
            readonly l2: "#ebe8e3";
            readonly l3: "#ddd8d0";
            readonly overlay: "#f9f8f5";
            readonly b1: "#c7c0b3";
            readonly b2: "#a8a194";
            readonly brand: "#6b42a0";
            readonly lp: "#2d2a2e";
            readonly ls: "#5b5956";
            readonly err: "#ff6188";
            readonly ok: "#5a8a2a";
            readonly warn: "#b87a00";
            readonly side: "#f9f8f5";
        };
        readonly dark: {
            readonly base: "#2d2a2e";
            readonly l1: "#403e41";
            readonly l2: "#5b5956";
            readonly l3: "#69676c";
            readonly overlay: "#403e41";
            readonly b1: "#7a7978";
            readonly b2: "#948d8a";
            readonly brand: "#ab9df2";
            readonly lp: "#fcfcfa";
            readonly ls: "#c1c0c0";
            readonly err: "#ff6188";
            readonly ok: "#a9dc76";
            readonly warn: "#ffd866";
            readonly side: "#2d2a2e";
        };
    };
    readonly rosepine: {
        readonly label: "Rosé Pine";
        readonly light: {
            readonly base: "#faf4ed";
            readonly l1: "#fffaf3";
            readonly l2: "#f2e9e1";
            readonly l3: "#e8ddd3";
            readonly overlay: "#fffaf3";
            readonly b1: "#cecacd";
            readonly b2: "#9893a5";
            readonly brand: "#907aa9";
            readonly lp: "#575279";
            readonly ls: "#6e6a86";
            readonly err: "#b4637a";
            readonly ok: "#286983";
            readonly warn: "#ea9d34";
            readonly side: "#faf4ed";
        };
        readonly dark: {
            readonly base: "#191724";
            readonly l1: "#1f1d2e";
            readonly l2: "#26233a";
            readonly l3: "#353142";
            readonly overlay: "#1f1d2e";
            readonly b1: "#6e6a86";
            readonly b2: "#908caa";
            readonly brand: "#c4a7e7";
            readonly lp: "#e0def4";
            readonly ls: "#908caa";
            readonly err: "#eb6f92";
            readonly ok: "#9ccfd8";
            readonly warn: "#f6c177";
            readonly side: "#191724";
        };
    };
    readonly ayu: {
        readonly label: "Ayu";
        readonly light: {
            readonly base: "#fafafa";
            readonly l1: "#f3f4f5";
            readonly l2: "#eaecee";
            readonly l3: "#e1e4e8";
            readonly overlay: "#f3f4f5";
            readonly b1: "#c4c9d0";
            readonly b2: "#a8b0bb";
            readonly brand: "#55b4d4";
            readonly lp: "#5c6773";
            readonly ls: "#5c6773";
            readonly err: "#e65050";
            readonly ok: "#86b300";
            readonly warn: "#fa8d3e";
            readonly side: "#fafafa";
        };
        readonly dark: {
            readonly base: "#0a0e14";
            readonly l1: "#1f2430";
            readonly l2: "#242a38";
            readonly l3: "#3e4b5c";
            readonly overlay: "#1f2430";
            readonly b1: "#5c6773";
            readonly b2: "#7a8a9b";
            readonly brand: "#39bae6";
            readonly lp: "#c5cddb";
            readonly ls: "#95a0b0";
            readonly err: "#ff3333";
            readonly ok: "#7fd962";
            readonly warn: "#ffb454";
            readonly side: "#0a0e14";
        };
    };
    readonly zenburn: {
        readonly label: "Zenburn";
        readonly light: {
            readonly base: "#ffffef";
            readonly l1: "#f6f1e1";
            readonly l2: "#ebe3c8";
            readonly l3: "#ddd6b8";
            readonly overlay: "#f6f1e1";
            readonly b1: "#c2b8a3";
            readonly b2: "#a8a090";
            readonly brand: "#2b6f6f";
            readonly lp: "#3f3f3f";
            readonly ls: "#5f6f5f";
            readonly err: "#8c3333";
            readonly ok: "#4a6f4a";
            readonly warn: "#8f7a3a";
            readonly side: "#ffffef";
        };
        readonly dark: {
            readonly base: "#3f3f3f";
            readonly l1: "#4f4f4f";
            readonly l2: "#5f5f5f";
            readonly l3: "#6f6f6f";
            readonly overlay: "#4f4f4f";
            readonly b1: "#7f7f7f";
            readonly b2: "#9a9a9a";
            readonly brand: "#8cd0d3";
            readonly lp: "#dcdccc";
            readonly ls: "#9ab0a0";
            readonly err: "#cc9393";
            readonly ok: "#7f9f7f";
            readonly warn: "#d0bf8f";
            readonly side: "#3f3f3f";
        };
    };
};
export type PresetId = keyof typeof PRESETS | 'native';
export declare const presetOptions: {
    value: PresetId;
    label: string;
}[];
//# sourceMappingURL=presets.d.ts.map