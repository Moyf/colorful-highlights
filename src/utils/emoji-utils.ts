/**
 * Shared emoji-to-color mapping utilities.
 *
 * Used by the CM6 editor extension, the Reading view renderer, and the
 * editor highlight actions so emoji → color slot resolution never
 * duplicates parsing code.
 */

import { COLOR_SLOTS, type ColorSlotKey } from '../settings';

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

/**
 * Given the inner text of a `==...==` highlight, detect and strip any
 * leading emoji that maps to a known color slot.
 *
 * Returns the stripped text, the matched color slot (if any), and the
 * character length of the matched emoji (useful for decoration range
 * calculations).
 */
export function detectEmojiPrefix(
	innerText: string,
	emojiMap: Map<string, ColorSlotKey>
): { strippedText: string; slot?: ColorSlotKey; emojiLength: number } {
	// Preserve leading whitespace
	const wsMatch = innerText.match(/^\s*/u);
	const leadingWs = wsMatch ? wsMatch[0] : '';
	const remaining = innerText.slice(leadingWs.length);

	if (!remaining) {
		return { strippedText: innerText, emojiLength: 0 };
	}

	for (const [emoji, slot] of emojiMap.entries()) {
		if (remaining.startsWith(emoji)) {
			return {
				strippedText: `${leadingWs}${remaining.slice(emoji.length)}`,
				slot,
				emojiLength: leadingWs.length + emoji.length,
			};
		}
	}

	return { strippedText: innerText, emojiLength: 0 };
}
