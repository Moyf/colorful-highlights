/**
 * Shared settings model for Colorful Highlights.
 */

export type ColorSlotKey =
	| 'yellow'
	| 'green'
	| 'red'
	| 'purple'
	| 'blue'
	| 'gray'
	| 'orange'
	| 'cyan'
	| 'magenta'
	| 'white';

export type DefaultColorSlot = 'none' | ColorSlotKey;

export type HighlightStyle =
	| 'default'
	| 'rounded'
	| 'half-strike'
	| 'double-strike'
	| 'gradient'
	| 'underline-only'
	| 'wavy-underline'
	| 'underline-with-bg'
	| 'wavy-underline-only'
	| 'outline';



/**
 * How colored highlights are painted:
 * - 'plugin': our CSS rules paint the background (guaranteed look).
 * - 'native': only --text-highlight-bg is overridden per highlight, letting
 *   the theme's own .cm-highlight / mark rules do the painting.
 */
export type RenderMode = 'plugin' | 'native';

/** The five base slots, always available. */
export const BASE_COLOR_SLOTS: ColorSlotKey[] = ['yellow', 'green', 'red', 'purple', 'blue'];

/** Five extra slots revealed by the extended-colors toggle. */
export const EXTENDED_COLOR_SLOTS: ColorSlotKey[] = ['gray', 'orange', 'cyan', 'magenta', 'white'];

/**
 * Every slot. Iterated for CSS variables, menu icons, and DOM class cleanup —
 * these must cover all slots regardless of the extended-colors toggle.
 */
export const COLOR_SLOTS: ColorSlotKey[] = [...BASE_COLOR_SLOTS, ...EXTENDED_COLOR_SLOTS];

/** Slots exposed to the user (commands, menus, settings) for the given toggle state. */
export function getActiveColorSlots(extendedColors: boolean): ColorSlotKey[] {
	return extendedColors ? COLOR_SLOTS : BASE_COLOR_SLOTS;
}

export const HIGHLIGHT_STYLES: HighlightStyle[] = [
	'default',
	'rounded',
	'half-strike',
	'double-strike',
	'gradient',
	'underline-with-bg',
	'wavy-underline',
	'underline-only',
	'wavy-underline-only',
	'outline',
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
	/** Secondary mix percentage (10–100) for double-strike and line colors. */
	secondaryColorOpacity: number;
	/** Who paints the colored background: plugin CSS or the theme via --text-highlight-bg. */
	renderMode: RenderMode;
	/** Visual style applied to all highlights. */
	highlightStyle: HighlightStyle;
	/** Slot used for plain ==text== without emoji; switching to it strips the prefix. */
	defaultColorSlot: DefaultColorSlot;
	/** Reveal the five extended color slots (gray/orange/cyan/magenta/white). */
	extendedColors: boolean;
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
	secondaryColorOpacity: 60,
	renderMode: 'plugin',
	highlightStyle: 'default',
	defaultColorSlot: 'yellow',
	extendedColors: false,
	emojiMappings: {
		yellow: '🟡,🟨,💛,⭐,🍌',
		green: '🟢,🟩,💚,🍀,🍏',
		red: '🔴,🟥,❤️,🍓,🍎',
		purple: '🟣,🟪,💜,🍇,😈',
		blue: '🔵,🟦,💙,💧,📘',
		gray: '🩶,🪨,🌫️,🗿',
		orange: '🟠,🟧,🧡,🍊',
		cyan: '🩵,🧊,🐬,🫧',
		magenta: '🩷,🌸,🌺,🎀',
		white: '⚪,🤍,⬜,☁️',
	},
	customColors: {
		yellow: '#ffd700',
		green: '#96ceb4',
		red: '#ff6b6b',
		purple: '#a78bfa',
		blue: '#45b7d1',
		gray: '#adb5bd',
		orange: '#ffa94d',
		cyan: '#2dd4bf',
		magenta: '#f472b6',
		white: '#f8f9fa',
	},
};
