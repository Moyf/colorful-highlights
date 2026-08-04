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
			options: {
				default: 'Default',
				halfStrike: 'Half-strike',
				doubleStrike: 'Double-strike',
				underlineOnly: 'Underline only',
				underlineWithBg: 'Underline with background',
			},
		},
		defaultColor: {
			name: 'Default highlight color',
			desc: 'Color used for plain ==highlights== without an emoji prefix. Switching a highlight to this color removes its emoji prefix.',
			none: 'None (theme default)',
		},
		opacity: {
			name: 'Color intensity',
			desc: 'Background color mix percentage for colored highlights (30–100%).',
		},
		editorMenu: {
			name: 'Color actions in editor menu',
			desc: 'Show highlight color actions when right-clicking a selection or an existing highlight.',
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
		red: 'Red',
		teal: 'Teal',
		blue: 'Blue',
		green: 'Green',
	},
	commands: {
		toggle: 'Toggle highlight',
		remove: 'Remove highlight',
		setColor: 'Highlight with {{color}}',
	},
	menu: {
		removeHighlight: 'Remove highlight',
	},
};

export default en;
