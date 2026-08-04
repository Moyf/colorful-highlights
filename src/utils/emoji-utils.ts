/**
 * Shared emoji-to-color mapping utilities.
 *
 * Used by the CM6 editor extension, the Reading view renderer, and the
 * editor highlight actions so emoji → color slot resolution never
 * duplicates parsing code.
 */

import { COLOR_SLOTS, type ColorSlotKey } from '../settings';

/**
 * Matches ==...== highlights. Single `=` characters are allowed inside as
 * long as they are not followed by another `=` (e.g. `==a=b==`).
 *
 * Newlines are deliberately excluded: without that, `a == b` prose on one
 * line would pair with a `==` on a later line, corrupting unrelated text
 * when unwrapping and letting CM6 replace-decorations span a line break
 * (a hard RangeError). Line-scoped matching mirrors how Obsidian renders
 * highlights in practice.
 *
 * Always create a fresh instance via this factory — a shared /g regex
 * carries mutable `lastIndex` state across call sites.
 */
export function createHighlightRegex(): RegExp {
	return /==((?:[^=\n]|=[^=\n])+?)==/g;
}

/**
 * Parse a comma-separated emoji alias string into a deduplicated array.
 * e.g. '🟥,🔴,🟥' → ['🟥', '🔴']
 */
export function parseEmojiAliases(value: string): string[] {
	const items = value
		.split(',')
		.map(v => v.trim())
		.filter(v => v.length > 0);
	return Array.from(new Set(items));
}

/**
 * Build a mapping from each emoji alias to its color slot.
 * Entries are sorted longest-emoji-first to support multi-codepoint aliases (e.g. ❤️).
 */
export function buildEmojiToColorSlotMap(
	mappings: Record<ColorSlotKey, string>
): Map<string, ColorSlotKey> {
	const entries: Array<[string, ColorSlotKey]> = [];

	for (const slot of COLOR_SLOTS) {
		const aliases = parseEmojiAliases(mappings[slot]);
		for (const emoji of aliases) {
			entries.push([emoji, slot]);
		}
	}

	// Longest first so multi-codepoint emoji match before single codepoints
	entries.sort((a, b) => b[0].length - a[0].length);
	return new Map(entries);
}

export interface EmojiPrefixMatch {
	/** Inner text with the emoji removed (leading whitespace preserved). */
	strippedText: string;
	/** Matched color slot, if any. */
	slot?: ColorSlotKey;
	/** Offset of the emoji within the inner text (i.e. leading whitespace length). */
	emojiOffset: number;
	/** Length of the emoji itself, in UTF-16 code units. 0 when no match. */
	emojiLength: number;
}

/**
 * Given the inner text of a `==...==` highlight, detect and strip any
 * leading emoji that maps to a known color slot.
 */
export function detectEmojiPrefix(
	innerText: string,
	emojiMap: Map<string, ColorSlotKey>
): EmojiPrefixMatch {
	// Preserve leading whitespace
	const wsMatch = innerText.match(/^\s*/u);
	const leadingWs = wsMatch ? wsMatch[0] : '';
	const remaining = innerText.slice(leadingWs.length);

	if (!remaining) {
		return { strippedText: innerText, emojiOffset: 0, emojiLength: 0 };
	}

	for (const [emoji, slot] of emojiMap.entries()) {
		if (remaining.startsWith(emoji)) {
			return {
				strippedText: `${leadingWs}${remaining.slice(emoji.length)}`,
				slot,
				emojiOffset: leadingWs.length,
				emojiLength: emoji.length,
			};
		}
	}

	return { strippedText: innerText, emojiOffset: 0, emojiLength: 0 };
}
