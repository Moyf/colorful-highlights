/**
 * Shared settings model for Colorful Highlights.
 */

export type ColorSlotKey = 'yellow' | 'green' | 'red' | 'purple' | 'blue';

export type DefaultColorSlot = 'none' | ColorSlotKey;

export type HighlightStyle =
	| 'default'
	| 'half-strike'
	| 'double-strike'
	| 'underline-only'
	| 'underline-with-bg'
	| 'rounded'
	| 'outline'
	| 'wavy-underline'
	| 'gradient';



export const COLOR_SLOTS: ColorSlotKey[] = ['yellow', 'green', 'red', 'purple', 'blue'];

export const HIGHLIGHT_STYLES: HighlightStyle[] = [
	'default',
	'half-strike',
	'double-strike',
	'underline-only',
	'underline-with-bg',
	'rounded',
	'outline',
	'wavy-underline',
	'gradient',
];

export interface ColorfulHighlightsSettings {
	/** Master switch for emoji-prefixed highlight parsing. */
	enabled: boolean;
	/** Decorate highlights in the editor (Live Preview + Source mode). */
	editorDecorator: boolean;
	/** Keep emoji prefixes visible in Source mode while decorating. */
	showPrefixInSourceMode: boolean;
	/** Decorate <mark> highlights in Reading view and hide the emoji prefix. */
	readingRenderer: boolean;
	/** Show the color submenu in the editor right-click menu. */
	showColorMenuInEditorMenu: boolean;
	/** Group the color actions under a single submenu item in the editor menu. */
	useSubmenu: boolean;
	/** Background color mix percentage (10–100). */
	colorOpacity: number;
	/** Visual style applied to all highlights. */
	highlightStyle: HighlightStyle;
	/** Slot used for plain ==text== without emoji; switching to it strips the prefix. */
	defaultColorSlot: DefaultColorSlot;
	/** Comma-separated emoji aliases per color slot (first alias is used for write-back). */
	emojiMappings: Record<ColorSlotKey, string>;
	/** Hex color per slot. */
	customColors: Record<ColorSlotKey, string>;
}

export const DEFAULT_SETTINGS: ColorfulHighlightsSettings = {
	enabled: true,
	editorDecorator: true,
	showPrefixInSourceMode: true,
	readingRenderer: true,
	showColorMenuInEditorMenu: true,
	useSubmenu: false,
	colorOpacity: 60,
	highlightStyle: 'default',
	defaultColorSlot: 'yellow',
	emojiMappings: {
		yellow: '🟨,🟡,💛,⭐,🍌',
		green: '🟩,🟢,💚,🍀,🍏',
		red: '🟥,🔴,❤️,🍓,🍎',
		purple: '🟪,🟣,💜,🍇,😈',
		blue: '🟦,🔵,💙,💧,📘',
	},
	customColors: {
		yellow: '#ffd700',
		green: '#96ceb4',
		red: '#ff6b6b',
		purple: '#a78bfa',
		blue: '#45b7d1',
	},
};
