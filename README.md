# Colorful Highlights

[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=Downloads&query=%24%5B%22colorful-highlights%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=colorful-highlights) [![Release](https://img.shields.io/github/v/release/Moyf/colorful-highlights?label=Release)](https://github.com/Moyf/colorful-highlights/releases) [![Issues](https://img.shields.io/github/issues/Moyf/colorful-highlights?label=Issues)](https://github.com/Moyf/colorful-highlights/issues) [![Stars](https://img.shields.io/github/stars/Moyf/colorful-highlights?logo=github&label=Stars)](https://github.com/Moyf/colorful-highlights/stargazers)

[简体中文](README-zh.md)

Want colored highlights in Obsidian? Colorize `==highlights==` with emoji prefixes. Text like `==🔴important content==` is rendered as a red highlight — the emoji is hidden by default and shown while editing.

![](assets/preview.webp)

## Features

- **Custom emoji prefixes** — map any emoji to 5 color slots (yellow / green / red / purple / blue), expandable to 10 (orange / cyan / magenta / gray / Black (Spoiler)) via the extended-colors toggle in settings. Each color can be shown or hidden independently. For example, `🍎` can represent red and `🍌` can represent yellow. The first emoji in each slot is used when writing highlights.
- **Live Preview & Source mode** — Live Preview shows only the colored highlight style; the emoji appears when the cursor enters the highlight. Source mode can optionally keep the emoji visible.
- **Highlight styles** — default, half-strike, double-strike, underline, wavy line, underline only, wavy line only, rounded, outline, gradient, text color, and text color + background.
- **Default highlight color** — plain `==text==` without an emoji can map to a color slot; switching to that color does not add an emoji prefix.
- **Commands & context menu** — toggle highlights, highlight with a specific color, or remove highlights. Select text (or an existing highlight) and right-click to access the color actions.

![Menu](assets/menu.webp)

## Usage

1. Select text and run **Highlight with red** (or any color) from the command palette — the selection becomes `==🔴text==`.
2. Run another color command to switch colors; run **Toggle highlight** to remove the highlight.
3. Right-click selected text to find the same color actions in the editor menu.
4. Or type the syntax manually: `==🔵any emoji prefix works==`.

Example:

```md
This is some ==🔴important text==.
This is a ==🔵theoretical description==, and ==🟢the correct way to handle it==.
```

## Styles

Choose a highlight style in Settings:

![Style settings](assets/style-setting.webp)

Example results:

![Highlight styles](assets/styles.webp)

## Settings

![](assets/emoji-mapping.webp)

| Setting | Description |
| ------- | ----------- |
| Enable colorful highlights | Master switch for parsing and decoration. |
| Highlight style | Default / half-strike / double-strike / underline / wavy line / underline only / wavy line only / rounded / outline / gradient / text color / text color + background. |
| Default highlight color | Color for plain `==text==`; switching to it removes the emoji prefix. |
| Color intensity | Background color mix percentage (10–100%). |
| Secondary color intensity | Second layer of double-strike, line colors, and the gradient bottom (10–100%). |
| Color rendering | Plugin styles paint the background directly; theme native only overrides `--text-highlight-bg` and lets your theme paint highlights. |
| Decorate in editor / Reading view | Toggle each surface independently. |
| Extended colors | Reveal five extra color slots (orange / cyan / magenta / gray / Black (Spoiler)) in commands, menus, and settings. Use the toggle beside each color to keep only the colors you prefer. Off by default. |
| Colors | Choose a hex color for each regular slot; Black (Spoiler) uses a fixed text-colored cover. The toggle beside each color controls whether it appears in mappings, commands, menus, and rendering. |
| Emoji mappings | Map multiple different emojis to a specific color. You do not need to use every emoji; all of them can represent the corresponding color, but usually only the first one is needed for write-back. |
| Custom color names | Custom display names for the colors. Give them meaning for a color-coding system that fits your workflow. This affects the editor menu and commands; leave blank to use the color name. Off by default. |

## Compatibility

- Works on desktop and mobile (`isDesktopOnly: false`).
- Requires Obsidian 1.13.0+.
- Uses only local parsing and rendering — no network requests, no data leaves your vault.
- Theme compatibility: the plugin deliberately avoids `!important` so it cooperates with theme styles. A theme that styles highlights with `!important` rules will override the plugin's highlight styling.

## Credits

The emoji-highlight mechanism was originally built as [PR #114](https://github.com/trevware/obsidian-sidebar-highlights/pull/114) for [Sidebar Highlights](https://github.com/trevware/obsidian-sidebar-highlights). This plugin extracts that feature into a standalone package. If you also use Sidebar Highlights, the two plugins coexist: this one renders colors in the editor and Reading view, while the sidebar plugin manages highlights and comments.

The `==🔴red==` syntax was inspired by the [Octarine](https://octarine.app/) project.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Moyf/colorful-highlights&type=Date)](https://www.star-history.com/#Moyf/colorful-highlights&Date)

## More from Moy

If you appreciate my plugin design and quality, check out my other Obsidian plugins:

| Plugin | Description | Stats |
| --- | --- | --- |
| [Yearly Glance](https://github.com/Moyf/yearly-glance) | See your whole year's key events at a glance. | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22yearly-glance%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=yearly-glance) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/yearly-glance?logo=github&label=Stars)](https://github.com/Moyf/yearly-glance/stargazers) |
| [Easy Copy](https://github.com/Moyf/easy-copy) | Easily copy formatted text, or copy elegant links. | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22easy-copy%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=easy-copy) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/easy-copy?logo=github&label=Stars)](https://github.com/Moyf/easy-copy/stargazers) |
| [Better Links](https://github.com/Moyf/better-links) | The link popover editor you absolutely need. | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22better-links%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=better-links) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/better-links?logo=github&label=Stars)](https://github.com/Moyf/better-links/stargazers) |
| [Style Context](https://github.com/Moyf/style-context) | Set your Obsidian background to any image in your vault. | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22style-context%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=style-context) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/style-context?logo=github&label=Stars)](https://github.com/Moyf/style-context/stargazers) |
| [Harbor Tab](https://github.com/Moyf/harbor-tab) | A beautiful new tab page with quick file search and creation. | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22harbor-tab%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=harbor-tab) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/harbor-tab?logo=github&label=Stars)](https://github.com/Moyf/harbor-tab/stargazers) |
| [Single Choice Property](https://github.com/Moyf/single-choice-property) | Keep selected list properties to only one value. | [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&logoColor=white&color=%23483699&label=downloads&query=%24%5B%22single-choice-property%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=single-choice-property) [![GitHub Stars](https://img.shields.io/github/stars/Moyf/single-choice-property?logo=github&label=Stars)](https://github.com/Moyf/single-choice-property/stargazers) |

> See all my plugins on my [Obsidian Community page](https://community.obsidian.md/users/moyf).

Friend plugins I contributed to: [Note Toolbar](https://github.com/chrisgurney/obsidian-note-toolbar) & [Typify](https://github.com/leike-dev/Obsidian-Typify) ❤️

## Support

If you like Colorful Highlights, consider [buying me a coffee on Ko-fi](https://ko-fi.com/moy) ☕

## License

MIT
