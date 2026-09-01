![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.4.0.png)

# dsh-cool-theme

English · [中文](./README.zh.md)

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## Description

DeepSeek Harness theme plugin — supports light / dark / system appearance switching with 34 preset themes.

## Features

Theme management (sidebar gear → Settings → Theme), supports `light` / `dark` / `system` appearance switching and provides 34 presets: Aura, Ayu, Catppuccin, Catppuccin Frappe, Catppuccin Macchiato, Cobalt2, Cursor, DSH, Dracula, Everforest, Flexoki, GitHub, Gruvbox, Kanagawa, Lucent Orng, Material, Matrix, Mercury, Monokai, Night Owl, Nord, One Dark, OpenCode, Orng, Osaka Jade, Palenight, Rosé Pine, Solarized, Synthwave 84, System, Tokyo Night, Vercel, Vesper, Zenburn. All presets support both light and dark modes.

## Installation

The easiest way is to let DSH install it for you. For manual installation, see:

```
# Install
dsh plugin --profile <your-profile> add dsh-cool-theme

# Uninstall
dsh plugin --profile <your-profile> remove dsh-cool-theme
```

> Replace `<your-profile>` with your DSH profile, e.g. `web` for DSH Web and `desktop` for DSH Desktop.

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
