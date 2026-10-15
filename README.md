![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.6.0.png)

# dsh-cool-theme

English · [中文](./README.zh.md)

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## Description

DeepSeek Harness theme plugin — supports Dark / Light / System appearance switching, ships 34 preset themes, and supports creating, sharing, and importing custom themes.

## Features

1. **Appearance switching:** The appearance switch from General settings is now managed in Theme settings. You can set the appearance (dark, light, or system) in the Settings dialog → Theme tab.
2. **34 preset themes:** 34 built-in presets, each adapted to both dark and light appearance: Aura, Ayu, Catppuccin, Catppuccin Frappe, Catppuccin Macchiato, Cobalt2, Cursor, DSH, Dracula, Everforest, Flexoki, GitHub, Gruvbox, Kanagawa, Lucent Orng, Material, Matrix, Mercury, Monokai, Night Owl, Nord, One Dark, OpenCode, Orng, Osaka Jade, Palenight, Rosé Pine, Solarized, Synthwave 84, System, Tokyo Night, Vercel, Vesper, Zenburn.
3. **Sidebar transparency:** A switch between Preset themes and Custom theme controls the sidebar panel transparency on macOS; it is off (opaque sidebar) by default.
4. **Custom themes:** Turn on custom themes to create your own (colors inherit from the currently selected preset). The editor covers the palette and the nine syntax tokens, plus a border swatch between Foreground and Success: pick the border color and its opacity, and every border level the shell paints — sidebars, tab bars, cards, buttons — is derived from it automatically.
5. **Accent-tinted controls:** Under any preset or custom theme, DSH's filled buttons, switches, checkboxes and tooltips take the theme's accent instead of the monochrome foreground DSH paints by default. The accent is the palette's own accent scale — the color DSH already spends on focus rings and links — and the text printed on it, plus the tooltip surface, are derived from it and checked for contrast. The **DSH** preset keeps the original monochrome controls.
6. **Sharing themes:** Share custom themes you have created, or import custom themes shared by others.

## Installation

```bash
# Install: dsh plugin --profile <your-profile> add dsh-cool-theme
dsh plugin --profile web add dsh-cool-theme # Web
dsh plugin --profile desktop add dsh-cool-theme # Desktop

# Uninstall
dsh plugin --profile <your-profile> remove dsh-cool-theme
```

## Contributing

Contributions via Issues and PRs are welcome.

```
// Clone project
git clone https://github.com/CoolTea001/dsh-cool-theme.git

// Install dependencies
cd dsh-cool-theme
pnpm install

// Start local development
pnpm run dev

// Local install
dsh plugin --profile <your-profile> add /absolute/path/to/dsh-cool-theme

// Restart DSH service
dsh web
```

## License

MIT © CoolTea
