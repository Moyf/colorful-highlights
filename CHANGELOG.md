# Changelog

## [1.2.1](https://github.com/Moyf/colorful-highlights/compare/1.2.0...1.2.1) - 2026-09-04

### 🐛 Fixed

- **Reading mode compatibility**: support Obsidian 1.14+'s native `data-highlight` markers so emoji-prefixed colors keep their configured Colorful Highlights styling after Obsidian consumes the emoji prefix; add a safe fallback for themes without `--text-highlight-bg`.

<details>
<summary>中文说明（点击展开）</summary>

### 🐛 修复

- **阅读模式兼容性**：兼容 Obsidian 1.14+ 原生的 `data-highlight` 标记，使红、绿等原生颜色在 Obsidian 消费 emoji 前缀后仍能正确使用插件配置的颜色和装饰样式；同时为未定义 `--text-highlight-bg` 的主题增加安全 fallback。

</details>

---

## [1.2.0](https://github.com/Moyf/colorful-highlights/compare/1.1.1...1.2.0) - 2026-09-04

### 🚀 Added

- **Extended color slots**: add orange, cyan, magenta, gray, and Black (Spoiler), bringing the total to ten colors; each slot can be enabled or disabled independently.
- **Black (Spoiler) highlights**: add an opaque, theme-text-colored cover that reveals the text on hover, including nested styled text.
- **Custom color names**: optionally assign display names for each enabled color; names are reflected in commands, editor menus, and settings.
- **Emoji mappings**: allow multiple emoji aliases per color, with the first alias used when a plugin command writes a highlight.

### ⚡ Changed

- **Settings organization**: add Color customization and View Mode Rendering subpages, and hide Group into a submenu when editor color actions are disabled.
- **Line-only styles**: remove background color and Color intensity for Underline only and Wavy line only.
- **Color selection**: disabled colors are removed from mappings, commands, menus, and rendering.

<details>
<summary>中文说明（点击展开）</summary>

### 🚀 新增

- **拓展颜色槽位**：新增橙色、青色、紫红色、灰色和黑色（剧透），共十种颜色；每个颜色都可以单独启用或禁用。
- **黑色（剧透）高亮**：使用不透明的主题文字色遮挡条，鼠标悬浮后显示文本，包括嵌套的加粗等样式文本。
- **自定义颜色名称**：可为每个已启用颜色设置显示名称，并同步应用到命令、编辑器右键菜单和设置页。
- **Emoji 映射**：允许为每种颜色设置多个 emoji 别名；插件命令写入高亮时使用第一个别名。

### ⚡ 变更

- **设置页结构**：新增「颜色自定义」和「视图模式渲染选项」子页面；关闭编辑器菜单颜色操作时隐藏「收纳为二级菜单」。
- **仅线条样式**：「仅下划线」和「仅波浪线」不再显示背景色和颜色强度。
- **颜色选择**：禁用的颜色不再出现在映射、命令、菜单和渲染中。

</details>

---

## [1.1.1](https://github.com/Moyf/colorful-highlights/compare/1.1.0...1.1.1) - 2026-08-25

### 🚀 Added

- **Declarative settings search**: migrate the settings tab to Obsidian 1.13's declarative API so every setting can appear in Settings search.
- **Release artifact attestations**: generate GitHub artifact attestations for the packaged plugin assets.

### ⚡ Changed

- **Minimum Obsidian version**: raise the requirement from 1.8.7 to 1.13.0.

### 🐛 Fixed

- **Obsidian API warnings**: remove redundant DOM assertions and deprecated slider tooltip calls.

<details>
<summary>中文说明（点击展开）</summary>

### 🚀 新增

- **声明式设置搜索**：迁移到 Obsidian 1.13 的声明式设置 API，让所有设置都能出现在设置搜索中。
- **发布资产证明**：为打包后的插件资产生成 GitHub artifact attestation。

### ⚡ 变更

- **最低 Obsidian 版本**：从 1.8.7 提升到 1.13.0。

### 🐛 修复

- **Obsidian API 警告**：移除多余的 DOM 类型断言和已弃用的滑块提示调用。

</details>

---

## [1.1.0](https://github.com/Moyf/colorful-highlights/compare/1.0.0...1.1.0) - 2026-08-25

### 🚀 Added

- **Wavy line styles**: add Wavy line and Wavy line only, with a transparent background for the only-line variant.
- **Circle emoji defaults**: use circular emojis as the default write-back emoji for all five color slots while preserving square aliases.
- **Style preview controls**: show the secondary intensity control for double-strike, line-with-background, line-only, and outline styles.

### ⚡ Changed

- **Intensity semantics**: primary intensity controls highlight backgrounds; secondary intensity controls the second double-strike layer and line colors.
- **Style naming**: rename Wavy underline to Wavy line across the settings UI and documentation.

### 🐛 Fixed

- **Multi-window refresh**: synchronize CSS variables and Reading view decorations across the main window, detached Settings window, and workspace popouts so style and intensity changes apply without restarting Obsidian.

<details>
<summary>中文说明（点击展开）</summary>

### 🚀 新增

- **波浪线样式**：新增「波浪线」和「仅波浪线」样式，其中仅线条样式使用透明背景。
- **圆形默认 Emoji**：五个颜色槽位默认写入圆形 Emoji，同时保留方形 Emoji 别名。
- **样式预览控制**：为加深填充、带背景的线条、仅线条和描边样式显示第二层强度控制。

### ⚡ 变更

- **强度语义**：主强度控制高亮背景；第二层强度控制加深填充的第二层和各种线条的颜色。
- **样式命名**：设置界面和文档统一将「波浪下划线」改名为「波浪线」。

### 🐛 修复

- **多窗口刷新**：同步主窗口、独立 Settings 窗口和工作区弹出窗口中的 CSS 变量及阅读视图装饰，切换样式和强度时无需重启 Obsidian。

</details>

---

## [1.0.0] - 2026-08-04

Initial release.

### 🚀 Added

- **Emoji-prefixed highlights**: write `==🔴text==` to color highlights in live preview, source mode, and reading view; the emoji picks the color and stays hidden until you edit the text.
- **Five color slots**: yellow, green, red, purple, and blue, each with a customizable hex color and comma-separated emoji aliases (first alias is used when writing color into the note).
- **Ten highlight styles**: default, half-strike, double-strike, underline, wavy line, underline only, wavy line only, rounded, outline, and gradient — with a live preview in settings.
- **Dual intensity sliders**: primary intensity controls backgrounds (10–100%); the secondary slider controls double-strike's second layer and line colors.
- **Theme-native render mode**: optionally paint highlights by overriding `--text-highlight-bg` per element so theme-derived styles follow the slot color.
- **Default color slot**: plain `==text==` can map to a slot; switching a highlight to that color strips its emoji prefix.
- **Editor commands and context menu**: toggle highlight, highlight with each color, and remove highlight; right-click color actions with per-color circle icons and an optional submenu. Coloring a selection that overlaps existing highlights absorbs them (union expand, single undo step).
- **Code-aware editor decorations**: fenced and inline code content follows the "show emoji in source mode" setting.
- **i18n**: English and Simplified Chinese UI.

<details>
<summary>中文说明（点击展开）</summary>

### 🚀 新增

- **Emoji 前缀高亮**：写 `==🔴文本==` 即可在实时预览、源码模式和阅读视图中着色；emoji 决定颜色，编辑时才显示。
- **五个颜色槽位**：黄、绿、红、紫、蓝，每个槽位支持自定义十六进制颜色和逗号分隔的 emoji 别名（第一个别名用于回写）。
- **十种高亮样式**：默认、半填充、加深填充、下划线、波浪线、仅下划线、仅波浪线、圆角填充、描边、渐变填充——设置页内有实时预览。
- **双强度滑块**：主强度控制背景（10–100%）；第二层强度控制「加深填充」的第二层，以及各种线条的颜色。
- **主题原生渲染模式**：可选仅通过覆盖 `--text-highlight-bg` 变量上色，让主题派生样式跟随槽位颜色。
- **默认颜色槽位**：普通 `==文本==` 可映射到某个槽位；切换为该颜色时移除 emoji 前缀。
- **编辑器命令与右键菜单**：切换高亮、按颜色高亮、移除高亮；右键颜色操作带彩色圆点图标，可选收纳为二级菜单。对包含已有高亮的选区着色时会吸收合并（并集拓展，单次撤销）。
- **代码感知的编辑器装饰**：围栏代码块和行内代码遵循「源码模式显示 emoji」设置。
- **国际化**：英文与简体中文界面。

</details>

---
