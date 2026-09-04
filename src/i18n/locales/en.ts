import type { BaseMessage } from '../types';

const en: BaseMessage = {
	settings: {
		groups: {
			general: 'General',
			decoration: 'Decoration',
			menu: 'Menu',
			colors: 'Colors',
			emojiMappings: 'Emoji mappings',
			customColorNames: 'Custom color names',
			colorCustomization: 'Color customization',
		},
		enabled: {
			name: 'Enable colorful highlights',
			desc: 'Parse highlights with an emoji prefix like ==🔴text==. The emoji picks the color and stays hidden while reading.',
		},
		highlightStyle: {
			name: 'Highlight style',
			desc: 'Visual style applied to all highlights in the editor and reading view.',
			preview: 'Sample text',
			options: {
				default: 'Default',
				halfStrike: 'Half-strike',
				doubleStrike: 'Double-strike',
				underlineOnly: 'Underline only',
				underlineWithBg: 'Underline',
				rounded: 'Rounded',
				outline: 'Outline',
				wavyUnderline: 'Wavy line',
				wavyUnderlineOnly: 'Wavy line only',
				gradient: 'Gradient',
			},
		},
		defaultColor: {
			name: 'Default highlight color',
			desc: 'Color used for plain ==highlights== without an emoji prefix. Switching a highlight to this color removes its emoji prefix.',
			none: 'None (theme default)',
		},
		opacity: {
			name: 'Color intensity',
			desc: 'Background color intensity for colored highlights (10–100%).',
		},
		secondaryOpacity: {
			name: 'Secondary color intensity',
			desc: 'Secondary intensity for the double-strike second layer and line colors (10–100%).',
		},
		renderMode: {
			name: 'Color rendering',
			desc: 'Plugin styles paint the configured background directly. Theme native only overrides the --text-highlight-bg variable per highlight and lets the theme paint it.',
			options: {
				plugin: 'Plugin styles',
				native: 'Theme native',
			},
		},

		editorMenu: {
			name: 'Color actions in editor menu',
			desc: 'Show highlight color actions when right-clicking a selection or an existing highlight.',
		},
		submenu: {
			name: 'Group into a submenu',
			desc: 'Nest the color actions under a single menu item in the editor right-click menu.',
		},
		editorDecorator: {
			name: 'Decorate in editing view',
			desc: 'Color emoji-prefixed highlights in live preview and source mode. The emoji stays hidden until you edit the text.',
		},
		showPrefixInSource: {
			name: 'Show emoji in source mode',
			desc: 'Keep emoji prefixes visible in source mode while editor decoration is on.',
		},
		readingRenderer: {
			name: 'Decorate in reading view',
			desc: 'Color highlights in reading view and hide the matched emoji prefix from the rendered text.',
		},
		extendedColors: {
			name: 'Extended colors',
			desc: 'Enable five extra color slots — orange, cyan, magenta, gray, and black (spoiler). There are ten colors in total. Use the toggle beside each color to keep only the colors you prefer.',
		},
		customColorNames: {
			name: 'Use custom color names',
			desc: 'Custom display names for the colors. Give them meaning for a color-coding system that fits your workflow. This affects the editor menu and commands.',
			enabledDesc: 'Only enabled colors will be shown.',
		},
		customColorName: {
			desc: 'Leave blank to use the color name.',
			placeholder: 'Display name (optional)',
		},
		decorationPage: {
			// Keep the requested title case for this subpage label.
			// eslint-disable-next-line obsidianmd/ui/sentence-case-locale-module
			name: 'View Mode Rendering',
			desc: 'Configure how color highlights are decorated while editing and reading.',
		},
		colorSetting: {
			yellow: 'Choose a custom color for yellow highlights.',
			green: 'Choose a custom color for green highlights.',
			red: 'Choose a custom color for red highlights.',
			purple: 'Choose a custom color for purple highlights.',
			blue: 'Choose a custom color for blue highlights.',
			gray: 'Choose a custom color for gray highlights.',
			orange: 'Choose a custom color for orange highlights.',
			cyan: 'Choose a custom color for cyan highlights.',
			magenta: 'Choose a custom color for magenta highlights.',
			black: 'Special highlight style for obscuring specific text; hover to reveal it.',
			toggle: {
				enable: 'Enable highlights for this color.',
				disable: 'Disable highlights for this color.',
			},
		},
		colorMappingIntro:
			'Map multiple different emojis to a specific color; all of them work. You do not need to use every emoji here: they can all represent the corresponding color, but usually you only need the first one, which is used as the symbol when writing.',
		colorMappingDescription:
			'Use a comma (,) to separate multiple emojis. Any emoji you enter can map to the corresponding color. For example, you can use 🍌 as the symbol for yellow. When writing a highlight with a plugin command, the first emoji is used as the write-back symbol.',
		colorMapping: {
			desc: 'Write-back emoji: {{emoji}}',
			emojiPlaceholder: '🔴,🟥',
		},
	},
	colors: {
		yellow: 'Yellow',
		green: 'Green',
		red: 'Red',
		purple: 'Purple',
		blue: 'Blue',
		gray: 'Gray',
		orange: 'Orange',
		cyan: 'Cyan',
		magenta: 'Magenta',
		black: 'Black (spoiler)',
	},
	commands: {
		toggle: 'Toggle highlight',
		remove: 'Remove highlight',
		setColor: 'Highlight with {{color}}',
	},
	menu: {
		highlightColor: 'Highlight color',
		removeHighlight: 'Remove highlight',
	},
};

export default en;
