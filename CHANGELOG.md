# Changelog

## 1.0.0 - 2026-08-04

Initial release.

### 🚀 Added

- **Emoji-prefixed highlights**: write `==🟥text==` to color highlights in live preview, source mode, and reading view; the emoji picks the color and stays hidden until you edit the text.
- **Five color slots**: yellow, green, red, purple, and blue, each with a customizable hex color and comma-separated emoji aliases (first alias is used when writing color into the note).
- **Nine highlight styles**: default, half-strike, double-strike, underline only, underline with background, rounded, outline, wavy underline, and gradient — with a live preview in settings.
- **Dual intensity sliders**: primary color intensity (10–100%), plus a secondary slider shown for two-layer styles (double-strike, underline with background).
- **Theme-native render mode**: optionally paint highlights by overriding `--text-highlight-bg` per element so theme-derived styles follow the slot color.
- **Default color slot**: plain `==text==` can map to a slot; switching a highlight to that color strips its emoji prefix.
- **Editor commands and context menu**: toggle highlight, highlight with each color, and remove highlight; right-click color actions with per-color circle icons and an optional submenu. Coloring a selection that overlaps existing highlights absorbs them (union expand, single undo step).
- **Code-aware editor decorations**: fenced and inline code content follows the "show emoji in source mode" setting.
- **i18n**: English and Simplified Chinese UI.

<details>
<summary>中文说明（点击展开）</summary>

### 🚀 新增

- **Emoji 前缀高亮**：写 `==🟥文本==` 即可在实时预览、源码模式和阅读视图中着色；emoji 决定颜色，编辑时才显示。
- **五个颜色槽位**：黄、绿、红、紫、蓝，每个槽位支持自定义十六进制颜色和逗号分隔的 emoji 别名（第一个别名用于回写）。
- **九种高亮样式**：默认、半填充、加深填充、仅下划线、下划线加背景、圆角填充、描边、波浪下划线、渐变填充——设置页内有实时预览。
- **双强度滑块**：主颜色强度（10–100%），以及仅在双层样式（加深填充、下划线加背景）下显示的第二层强度滑块。
- **主题原生渲染模式**：可选仅通过覆盖 `--text-highlight-bg` 变量上色，让主题派生样式跟随槽位颜色。
- **默认颜色槽位**：普通 `==文本==` 可映射到某个槽位；切换为该颜色时移除 emoji 前缀。
- **编辑器命令与右键菜单**：切换高亮、按颜色高亮、移除高亮；右键颜色操作带彩色圆点图标，可选收纳为二级菜单。对包含已有高亮的选区着色时会吸收合并（并集拓展，单次撤销）。
- **代码感知的编辑器装饰**：围栏代码块和行内代码遵循「源码模式显示 emoji」设置。
- **国际化**：英文与简体中文界面。

</details>

---
