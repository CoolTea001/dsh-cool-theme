![dsh-cool-theme cover](https://cdn.cooltea.top/dsh-cool-theme/readme-cover-v0.4.0.png)

# dsh-cool-theme

[English](./README.md) · 中文

![license: MIT](https://img.shields.io/badge/license-MIT-green) ![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-blue)

## 描述

DeepSeek Harness 主题插件 — 支持 浅色 / 深色 / 跟随系统 外观切换，并提供 34 款预设主题。

## 功能介绍

主题管理（侧边栏底部齿轮 → 设置 → 主题），支持 `浅色` / `深色` / `跟随系统` 外观切换，并提供 34 款预设：Aura、Ayu、Catppuccin、Catppuccin Frappe、Catppuccin Macchiato、Cobalt2、Cursor、DSH、Dracula、Everforest、Flexoki、GitHub、Gruvbox、Kanagawa、Lucent Orng、Material、Matrix、Mercury、Monokai、Night Owl、Nord、One Dark、OpenCode、Orng、Osaka Jade、Palenight、Rosé Pine、Solarized、Synthwave 84、System、Tokyo Night、Vercel、Vesper、Zenburn，所有主题均已适配浅色模式和深色模式。

自定义配色：用 30 个种子色搭建自己的方案 —— 每种外观一条中性色阶、主色、成功、警告、错误，以及 9 个代码高亮标记，每项均可分别设置浅色和深色。色阶完全采用与预设主题相同的算法生成，自定义主题等同于运行时计算出来的预设；编辑器会实时预览两种外观真正渲染出的效果。

预设主题两种外观共用一条中性色阶，自定义主题则为每种外观各生成一条。DSH 的别名层在两种外观下读取不同的档位（浅色：底色取 00 档、正文取 1000 档；深色：底色取 950 档、正文取 50 档），因此共用一条色阶会把浅色正文和深色底色绑在一起，两者都无法单独调整；拆成每外观一条即可解除这种绑定。

自定义主题默认关闭。开启后会显示已保存的主题卡片和「添加自定义主题」按钮：点击该按钮会在按钮上方弹出可编辑卡片，包含主题名称输入框和配色行，点「保存」提交，点「取消」放弃。每张已保存的卡片都可以通过「编辑」按钮重新打开。编辑中尚未保存时关闭设置弹窗（关闭按钮、遮罩或 Esc）会先询问，确认放弃后恢复编辑前的主题。

自定义主题开启后，预设主题下拉框会被锁定。预设与自定义是彼此独立的选择：新建自定义主题时以当前选中的预设作为初始配色，除此之外两者没有关联。每个配色分组一行，每个种子一个圆形色块 —— 中性色为两个，顺序固定为背景色、前景色；上方的浅色/深色切换决定色块正在编辑哪套外观的值。由于同一个色阶端点在两种外观下的角色正好相反，中性色色块会按当前外观解析自己的角色，而不是绑定固定的色阶位置。

## 自定义主题的存放位置

每个已保存的自定义主题是 `$DSH_HOME/cool-theme/themes/<id>/` 下的一个独立目录（`$DSH_HOME` 默认是 `~/.dsh`）：

```
~/.dsh/cool-theme/themes/ct_xxxxxxxx/
  theme.json      # 名称、来源预设，以及 30 个种子色
  assets/         # 主题携带的图片/视频（预留）
```

`theme.json` 就是完整记录，所以把一个主题目录拷到另一台机器即可迁移。写入采用临时文件 + 重命名，读到的要么是旧文件、要么是新文件，不会是写了一半的内容。

在这个布局之前保存在浏览器里的主题，会在首次加载时接管成文件 —— 只接管宿主还没有的 id，因此已被某个浏览器迁移过的主题不会重复写入；浏览器里的副本在写入确认成功之后才会删除。

## 安装教程

一种最简单的方式是让你的 DSH 帮你安装，如果你想手动安装，请参考：

```
# 安装
dsh plugin --profile <your-profile> add dsh-cool-theme

# 卸载
dsh plugin --profile <your-profile> remove dsh-cool-theme
```

> <your-profile> 替换成你的 DSH 使用的 profile，例如 web 端通常替换成 `web`，dsh-desktop 端通常替换成 `desktop`。

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