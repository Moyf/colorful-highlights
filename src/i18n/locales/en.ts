import type { BaseMessage } from '../types';

const en: BaseMessage = {
	settings: {
		groups: {
			general: 'General',
			decoration: 'Decoration',
			colors: 'Colors',
			emojiMappings: 'Emoji mappings',
		},
		enabled: {
			name: 'Enable colorful highlights',
			desc: 'Parse highlights with an emoji prefix like ==🟥text==. The emoji picks the color and stays hidden while reading.',
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
				underlineWithBg: 'Underline with background',
				rounded: 'Rounded',
				outline: 'Outline',
				wavyUnderline: 'Wavy underline',
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
			desc: 'Background color mix percentage for colored highlights (10–100%).',
		},
		secondaryOpacity: {
			name: 'Secondary color intensity',
			desc: 'Intensity of the second layer in the double-strike and underline-with-background styles (10–100%).',
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
			name: 'Decorate in editor',
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
		colorSetting: {
			desc: 'Used for highlights marked with {{emoji}}.',
		},
		emojiMappingIntro:
			'Comma-separated emoji aliases per color. The first emoji is the one written into the note when applying a color.',
		emojiMapping: {
			desc: 'Write-back emoji: {{emoji}} (first alias)',
			placeholder: '🟥,🔴',
		},
	},
	colors: {
		yellow: 'Yellow',
		green: 'Green',
		red: 'Red',
		purple: 'Purple',
		blue: 'Blue',
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
