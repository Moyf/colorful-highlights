# Colorful Highlights（多彩高亮）

[![Obsidian 下载量](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=%E4%B8%8B%E8%BD%BD%E9%87%8F&query=%24%5B%22colorful-highlights%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=colorful-highlights) [![版本发布](https://img.shields.io/github/v/release/Moyf/colorful-highlights?label=Release)](https://github.com/Moyf/colorful-highlights/releases) [![议题](https://img.shields.io/github/issues/Moyf/colorful-highlights?label=%E8%AE%AE%E9%A2%98)](https://github.com/Moyf/colorful-highlights/issues) [![星标](https://img.shields.io/github/stars/Moyf/colorful-highlights?logo=github&label=%E6%98%9F%E6%A0%87)](https://github.com/Moyf/colorful-highlights/stargazers)

[English README](README.md)

想要在 Obsidian 内实现带有颜色的高亮划线吗？现在就能实现！
用 emoji 前缀即可为 Obsidian 的 `==高亮==` 着色。
像这样的文本： `==🔴重要内容==`，会自动渲染为红色高亮——emoji 默认隐藏，编辑时显现。

![](assets/preview-zh.webp)


## 功能

- **Emoji 前缀自定义** —— 除了默认的 emoji 之外，你还可以将任意 emoji 映射到 5 个颜色槽位（黄 / 绿 / 红 / 紫 / 蓝），并可在设置中通过「拓展颜色」开关扩展到 10 个（橙 / 青 / 紫红 / 灰 / 黑色（剧透））。每个颜色都可以单独控制是否显示。例如用 `🍎` 表示红色、`🍌` 表示黄色，均可读取显示。每个槽位的第一个 Emoji 是插件默认写入的 emoji。
- **实时预览与源码模式** —— 实时编辑模式只显示彩色高亮样式，光标进入高亮时才显示 emoji 字符（源码模式可选择保持可见）。
- **高亮样式** —— 提供多种高亮样式：默认、半填充、加深填充、下划线、波浪线、仅下划线、仅波浪线、圆角填充、描边、渐变填充、文字着色。
- **默认高亮颜色** —— 无 emoji 的普通 `==文本==` 可映射到某个颜色槽位；切换为该颜色时不自动添加 emoji 前缀。
- **命令与右键菜单** —— 切换高亮、按颜色高亮、移除高亮。选中文字（或已有高亮）后右键即可看到颜色操作。

![menu](assets/menu.webp)

## 使用方法

1. 选中文字，在命令面板执行 **高亮为红色**（或任意颜色）—— 选中文本变为 `==🔴文本==`。
2. 再次执行其他颜色命令即可切换颜色；执行 **切换高亮** 取消高亮。
3. 也可以在选中文字后右键，在编辑器菜单的颜色操作中切换。
4. 或者直接手动输入语法：`==🔵任意 emoji 前缀都可以==`。

测试文本：
```md
这是一些 ==🔴重要的文字==。
这是一个 ==🔵理论描述==，以及 ==🟢正确的处理方式==。
```

## 样式
在设置中，可以选择不同的高亮样式
![style-setting](assets/style-setting.webp)

效果如图：
![styles](assets/styles.webp)


## 设置

![](assets/emoji-mapping.webp)

| 设置项 | 说明 |
| ------ | ---- |
| 启用多彩高亮 | 解析与着色的总开关。 |
| 高亮样式 | 默认 / 半填充 / 加深填充 / 下划线 / 波浪线 / 仅下划线 / 仅波浪线 / 圆角填充 / 描边 / 渐变填充 / 文字着色。 |
| 默认高亮颜色 | 普通 `==文本==` 的颜色；切换到此颜色会移除 emoji 前缀。 |
| 颜色强度 | 背景色混合百分比（10–100%）。 |
| 第二层颜色强度 | 「加深填充」的第二层、各种线条的颜色，以及「渐变填充」底部的强度（10–100%）。 |
| 着色方式 | 「插件样式」由插件直接绘制背景；「主题原生」仅覆盖 `--text-highlight-bg` 变量，由主题绘制高亮。 |
| 编辑器 / 阅读视图着色 | 两个界面可独立开关。 |
| 拓展颜色 | 在命令、菜单和设置中显示额外的 5 个颜色槽位（橙 / 青 / 紫红 / 灰 / 黑色（剧透）），可通过每个颜色旁边的开关只保留偏好的颜色，默认关闭。 |
| 颜色 | 普通颜色可选择十六进制颜色；黑色（剧透）使用固定的文字色遮挡条。每个颜色右侧的开关控制它是否出现在映射、命令、菜单和渲染中。 |
| Emoji 映射 | 可以将多种不同的 emoji 映射到特定颜色，不需要使用其中所有 emoji；它们都可以代表对应颜色，但通常只需要第一项用于回写。 |
| 自定义颜色名称 | 为颜色自定义显示名称，赋予它们含义，用来建立适合自己的颜色编码体系，会影响右键菜单和命令。默认关闭，留空时使用颜色名称。 |


## 兼容性

- 支持桌面端和移动端。
- 需要 Obsidian 1.13.0 及以上版本。
- 仅本地解析与渲染 —— 不发起任何网络请求，数据不离开你的仓库。
- 主题兼容：本插件刻意不使用 `!important`，以便与主题样式协作。如果主题本身用 `!important` 编写高亮样式，那些规则会覆盖插件的高亮样式。

## 致谢

emoji 高亮机制最初作为给 [Sidebar Highlights](https://github.com/trevware/obsidian-sidebar-highlights) 的 [PR #114](https://github.com/trevware/obsidian-sidebar-highlights/pull/114) 开发。现在将该功能抽取为独立插件。
两款插件可以共存：本插件负责编辑器与阅读视图的颜色渲染，Sidebar Highlights 负责高亮与评论的管理。

另外，`==🔴红色==` 的语法灵感来自 [Octarine](https://octarine.app/) 项目，非常感谢！

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Moyf/colorful-highlights&type=Date)](https://www.star-history.com/#Moyf/colorful-highlights&Date)

## 来自 Moy 的更多插件

如果你欣赏我的插件设计和质量，可以看看我的其他 Obsidian 插件：

| 插件 | 简介 | 数据 |
| --- | --- | --- |
| [Yearly Glance](https://github.com/Moyf/yearly-glance) | 年度一览，一眼纵览你全年的关键事件。 | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22yearly-glance%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=yearly-glance) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/yearly-glance?logo=github&label=Stars)](https://github.com/Moyf/yearly-glance/stargazers) |
| [Easy Copy](https://github.com/Moyf/easy-copy) | 轻松复制格式文本，或快速生成优雅的链接。 | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22easy-copy%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=easy-copy) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/easy-copy?logo=github&label=Stars)](https://github.com/Moyf/easy-copy/stargazers) |
| [Better Links](https://github.com/Moyf/better-links) | 悬浮式弹窗，提升你的链接编辑体验。 | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22better-links%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=better-links) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/better-links?logo=github&label=Stars)](https://github.com/Moyf/better-links/stargazers) |
| [Style Context](https://github.com/Moyf/style-context) | 将你的 Obsidian 背景设成任意库内图片。 | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22style-context%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=style-context) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/style-context?logo=github&label=Stars)](https://github.com/Moyf/style-context/stargazers) |
| [Harbor Tab](https://github.com/Moyf/harbor-tab) | 非常好看的新标签页，快速搜索和创建文件。 | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22harbor-tab%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=harbor-tab) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/harbor-tab?logo=github&label=Stars)](https://github.com/Moyf/harbor-tab/stargazers) |
| [Single Choice Property](https://github.com/Moyf/single-choice-property) | 让选定的列表属性始终只保留一个值。 | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22single-choice-property%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=single-choice-property) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/single-choice-property?logo=github&label=Stars)](https://github.com/Moyf/single-choice-property/stargazers) |

> 全部插件见 [Moy 的 Obsidian Community 页面](https://community.obsidian.md/users/moyf)。

参与开发的友情插件：[Note Toolbar](https://github.com/chrisgurney/obsidian-note-toolbar) & [Typify](https://github.com/leike-dev/Obsidian-Typify) ❤️

## 支持作者

如果 Colorful Highlights 对你有帮助，欢迎[请我喝杯咖啡（Ko-fi）](https://ko-fi.com/moy) ☕

## 许可证

MIT
