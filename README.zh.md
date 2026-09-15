![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.5.0.png)

# dsh-cool-theme

[English](./README.md) · 中文

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## 描述

DeepSeek Harness 主题插件 —— 支持「深色」「浅色」「跟随系统」外观切换，提供 34 款预设主题，支持自定义主题配色。

## 功能介绍

1. **外观切换：** 将通用设置中的外观切换功能移至主题设置中管理，你可以在设置弹窗/主题标签中设置外观：深色、浅色、跟随系统
2. **34款预设主题：** 内置 34 款预设主题，每一款主题都适配了深色/浅色外观：Aura、Ayu、Catppuccin、Catppuccin Frappe、Catppuccin Macchiato、Cobalt2、Cursor、DSH、Dracula、Everforest、Flexoki、GitHub、Gruvbox、Kanagawa、Lucent Orng、Material、Matrix、Mercury、Monokai、Night Owl、Nord、One Dark、OpenCode、Orng、Osaka Jade、Palenight、Rosé Pine、Solarized、Synthwave 84、System、Tokyo Night、Vercel、Vesper、Zenburn。
3. **自定义主题：** 开启自定义主题后，可以创建自定义主题（配色继承当前预设主题），用户可以自由更改主题配色。

## 安装教程

```bash
# 安装：dsh plugin --profile <your-profile> add dsh-cool-theme
dsh plugin --profile web add dsh-cool-theme # web 端
dsh plugin --profile desktop add dsh-cool-theme # 桌面端

# 卸载
dsh plugin --profile <your-profile> remove dsh-cool-theme
```

## 参与贡献

欢迎提交 Issue 和 PR。

```
// 克隆项目
git clone https://github.com/CoolTea001/dsh-cool-theme.git

// 安装依赖
cd dsh-cool-theme
pnpm install

// 启动本地开发
pnpm run dev

// 本地安装
dsh plugin --profile <your-profile> add /absolute/path/to/dsh-cool-theme

// 重启 DSH 服务
dsh web
```

## 开源协议

MIT © CoolTea