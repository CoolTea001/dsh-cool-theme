![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.4.0.png)

# dsh-cool-theme

English · [中文](./README.zh.md)

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## Description

DeepSeek Harness theme plugin — supports light / dark / system appearance switching with 34 preset themes.

## Features

Theme management (sidebar gear → Settings → Theme), supports `light` / `dark` / `system` appearance switching and provides 34 presets: Aura, Ayu, Catppuccin, Catppuccin Frappe, Catppuccin Macchiato, Cobalt2, Cursor, DSH, Dracula, Everforest, Flexoki, GitHub, Gruvbox, Kanagawa, Lucent Orng, Material, Matrix, Mercury, Monokai, Night Owl, Nord, One Dark, OpenCode, Orng, Osaka Jade, Palenight, Rosé Pine, Solarized, Synthwave 84, System, Tokyo Night, Vercel, Vesper, Zenburn. All presets support both light and dark modes.

Custom colors: build your own scheme from 28 seeds — neutral, accent, success, warning, error, and the 9 syntax-highlighting tokens — each with separate light and dark values. The scales use exactly the same maths as the presets, so a custom theme is simply a preset computed at runtime. The editor previews what each appearance actually renders.

Custom themes are off by default. Turning the switch on reveals the saved-theme cards plus an **Add custom theme** button: clicking it opens an editable card above the button with a name field and the colour rows, and the card is committed with **Save** or discarded with **Cancel**. Every saved card can be reopened with its **Edit** button.

The preset picker stays usable while the custom theme is on. It no longer applies a preset then — it chooses the template that new custom themes start from: with an editor open the draft re-seeds to that preset, and otherwise the live colours stay as they are. Each colour row shows one round swatch per seed, and the light/dark toggle above them switches which appearance's values the swatches edit.

## Where custom themes live

Each saved custom theme is one directory under `$DSH_HOME/cool-theme/themes/<id>/` (`$DSH_HOME` defaults to `~/.dsh`):

```
~/.dsh/cool-theme/themes/ct_xxxxxxxx/
  theme.json      # name, source preset, and the 28 seeds
  assets/         # media carried with the theme (reserved)
```

`theme.json` is the whole record, so a theme can be copied to another machine by copying its directory. Writing is atomic: a reader sees either the previous file or the next one.

Themes a browser saved before this layout existed are adopted into files on first load — each browser-side theme whose id the Host does not already have, so a theme migrated by one browser is not written twice. The browser copy is removed only after the write is confirmed.

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
