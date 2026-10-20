![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.9.0.png)

# dsh-cool-theme

English · [中文](./README.zh.md)

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## Description

DeepSeek Harness theme plugin — supports dark/light appearance switching, ships 34 preset themes, and supports creating, sharing, and importing custom themes, each with its own background image.

## Features

1. **Appearance switching:** The appearance switch from General settings is now managed in Theme settings. You can set the appearance (dark, light, or system) in the Settings dialog → Theme tab
2. **34 preset themes:** 34 built-in presets, each adapted to both dark and light appearance: Aura, Ayu, Catppuccin, Catppuccin Frappe, Catppuccin Macchiato, Cobalt2, Cursor, DSH, Dracula, Everforest, Flexoki, GitHub, Gruvbox, Kanagawa, Lucent Orng, Material, Matrix, Mercury, Monokai, Night Owl, Nord, One Dark, OpenCode, Orng, Osaka Jade, Palenight, Rosé Pine, Solarized, Synthwave 84, System, Tokyo Night, Vercel, Vesper, Zenburn
3. **Sidebar transparency:** A switch controls the sidebar panel transparency on macOS
4. **Custom themes:** Turn on custom themes to create your own (colors inherit from the currently selected preset)
5. **Per-theme background image:** Each custom theme can set its own background image, with adjustable transparency and Blur effect — and a switch that turns the image off without deleting it
6. **Sharing themes:** Share custom themes you have created, or import custom themes shared by others — a theme's background image travels with it

## Installation

Use DSH's add-plugin feature and enter the package name: dsh-cool-theme.

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

// Local install: use DSH's add-plugin feature and enter the local project path

// Restart DSH service
dsh web
```

## License

MIT © CoolTea
