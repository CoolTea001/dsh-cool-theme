![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.5.0.png)

# dsh-cool-theme

English · [中文](./README.zh.md)

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## Description

DeepSeek Harness theme plugin — supports Dark / Light / System appearance switching, ships 34 preset themes, and supports custom theme colors.

## Features

1. **Appearance switching:** The appearance switch from General settings is now managed in Theme settings. You can set the appearance (dark, light, or system) in the Settings dialog → Theme tab.
2. **34 preset themes:** 34 built-in presets, each adapted to both dark and light appearance: Aura, Ayu, Catppuccin, Catppuccin Frappe, Catppuccin Macchiato, Cobalt2, Cursor, DSH, Dracula, Everforest, Flexoki, GitHub, Gruvbox, Kanagawa, Lucent Orng, Material, Matrix, Mercury, Monokai, Night Owl, Nord, One Dark, OpenCode, Orng, Osaka Jade, Palenight, Rosé Pine, Solarized, Synthwave 84, System, Tokyo Night, Vercel, Vesper, Zenburn.
3. **Custom themes:** Turn on custom themes to create your own (colors inherit from the currently selected preset), and freely change the theme colors.
4. **Sharing themes:** Every saved custom theme exports as a `.zip` archive, and an archive imports back into the same list. The Host validates an imported archive before storing it — a file that is not one of ours, or one whose theme payload or format version does not check out, is refused with a reason instead of being written. Imported themes always arrive as a new card with their own id, so importing never overwrites an existing theme; a name already in use is numbered instead.

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
