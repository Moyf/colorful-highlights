# Colorful Highlights

Colorize Obsidian `==highlights==` with emoji prefixes. Write `==🟥important==` and it renders as a red highlight — the emoji stays hidden while reading and reappears when you edit the text.

```md
This is some ==🟥important text==.
This is a ==🟦theoretical description==, and ==🟩the correct way to handle it==.
```

## Features

- **Emoji-prefixed colors** — any emoji can map to any of the 5 color slots (yellow / green / red / purple / blue), e.g. `==🍎text==` for red. The first alias per slot is the one written by color commands.
- **Live Preview & Source mode decoration** — colored backgrounds in the editor; the emoji hides until the cursor enters the highlight (Source mode can keep it visible).
- **Reading view rendering** — `<mark>` elements get colored and the emoji prefix is stripped from the rendered text.
- **Highlight styles** — default, half-strike, double-strike, underline only, underline with background, rounded, outline, wavy underline, and gradient, applied to all highlights.
- **Adjustable opacity** — background color intensity from 30–100%.
- **Default color** — plain `==text==` without an emoji can map to a color slot; switching a highlight to that color strips its prefix.
- **Commands & context menu** — toggle highlight, highlight with each color, and remove highlight. Right-click a selection (or an existing highlight) for the color actions.
- **Customizable colors** — each slot's hex color is configurable.
- **English & 简体中文 UI**.

## Usage

1. Select text and run **Highlight with red** (or any color) from the command palette — the selection becomes `==🟥text==`.
2. Run it again with another color to switch; run **Toggle highlight** to unwrap.
3. Right-click selected text to find the same color actions in the editor menu.
4. Or just type the syntax manually: `==🟦any emoji prefix works==`.

## Settings

| Setting | Description |
| ------- | ----------- |
| Enable colorful highlights | Master switch for parsing and decoration. |
| Highlight style | Default / half-strike / double-strike / underline only / underline with background / rounded / outline / wavy underline / gradient. |
| Default highlight color | Color for plain `==text==`; switching to it removes the emoji prefix. |
| Color intensity | Background mix percentage (30–100%). |
| Decorate in editor / Reading view | Toggle each surface independently. |
| Colors | Hex color per slot. |
| Emoji mappings | Comma-separated aliases per slot; first alias is used for write-back. |

## Compatibility

- Works on desktop and mobile (`isDesktopOnly: false`).
- Requires Obsidian 1.8.0+.
- Uses only local parsing and rendering — no network requests, no data leaves your vault.

## Credits

The emoji-highlight mechanism was originally built as [PR #114](https://github.com/trevware/obsidian-sidebar-highlights/pull/114) for [Sidebar Highlights](https://github.com/trevware/obsidian-sidebar-highlights). This plugin extracts that feature into a standalone package. If you also use Sidebar Highlights, the two plugins coexist: this one renders colors in the editor and Reading view, while the sidebar plugin manages highlights and comments.

## License

MIT
