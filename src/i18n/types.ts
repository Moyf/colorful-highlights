/**
 * Message type contract. Every locale must implement this interface —
 * missing keys fail at compile time.
 */

export interface BaseMessage {
	settings: {
		groups: {
			general: string;
			decoration: string;
			menu: string;
			colors: string;
			emojiMappings: string;
		};
		enabled: { name: string; desc: string };
		highlightStyle: {
			name: string;
			desc: string;
			preview: string;
			options: {
				default: string;
				halfStrike: string;
				doubleStrike: string;
				underlineOnly: string;
				underlineWithBg: string;
				rounded: string;
				outline: string;
				wavyUnderline: string;
				gradient: string;
			};
		};
		defaultColor: { name: string; desc: string; none: string };
		opacity: { name: string; desc: string };
		secondaryOpacity: { name: string; desc: string };
		renderMode: {
			name: string;
			desc: string;
			options: { plugin: string; native: string };
		};
		editorMenu: { name: string; desc: string };
		submenu: { name: string; desc: string };
		editorDecorator: { name: string; desc: string };
		showPrefixInSource: { name: string; desc: string };
		readingRenderer: { name: string; desc: string };
		/** Per-slot custom color description shown under each color picker. */
		colorSetting: {
			yellow: string;
			green: string;
			red: string;
			purple: string;
			blue: string;
		};
		emojiMappingIntro: string;
		/** "Write-back emoji: {{emoji}} (first alias)" */
		emojiMapping: { desc: string; placeholder: string };
	};
	colors: {
		yellow: string;
		green: string;
		red: string;
		purple: string;
		blue: string;
	};
	commands: {
		toggle: string;
		remove: string;
		/** "Highlight with {{color}}" */
		setColor: string;
	};
	menu: {
		highlightColor: string;
		removeHighlight: string;
	};
}
