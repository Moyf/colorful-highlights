/**
 * Reading view renderer for emoji-prefixed highlights.
 *
 * Reading view renders markdown highlights as <mark> elements. The markdown
 * post-processor calls apply() for every rendered block:
 *
 * 1. Emoji-prefixed highlights get a `ch-reading-highlight-{slot}` class and
 *    the emoji prefix is stripped from the visible text.
 * 2. Plain highlights get the default color slot's class when configured.
 *
 * Other plugins (e.g. bionic-reading tools) may wrap the mark's contents in
 * inline elements, so the emoji is located by walking to the first text node
 * descendant instead of assuming a flat text child.
 *
 * The original text is stashed in dataset attributes so re-renders stay
 * idempotent and onunload can restore the DOM exactly.
 */

import { COLOR_SLOTS, type ColorfulHighlightsSettings } from './settings';
import { buildEmojiToColorSlotMap, detectEmojiPrefix } from './utils/emoji-utils';

const SLOT_CLASS_PREFIX = 'ch-reading-highlight-';

/** First text node descendant of an element, in document order. */
function firstTextNode(el: HTMLElement): Text | null {
	const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	return walker.nextNode() as Text | null;
}

export class ReadingHighlightRenderer {
	constructor(private readonly getSettings: () => ColorfulHighlightsSettings) {}

	apply(rootEl: HTMLElement): void {
		if (!rootEl) {
			return;
		}

		const marks = rootEl.querySelectorAll('mark');
		if (marks.length === 0) {
			return;
		}

		const settings = this.getSettings();
		const shouldApply = settings.enabled && settings.readingRenderer;
		const emojiMap = shouldApply ? buildEmojiToColorSlotMap(settings.emojiMappings) : null;
		const defaultSlot = settings.defaultColorSlot !== 'none'
			? settings.defaultColorSlot
			: undefined;

		marks.forEach((mark) => {
			const markEl = mark as HTMLElement;

			for (const slot of COLOR_SLOTS) {
				markEl.classList.remove(`${SLOT_CLASS_PREFIX}${slot}`);
			}

			// Restore any previously stripped emoji before re-detecting
			if (markEl.dataset.chTextMutated === '1') {
				const storedNodeValue = markEl.dataset.chOriginalFirstNode;
				if (storedNodeValue !== undefined) {
					const textNode = firstTextNode(markEl);
					if (textNode) {
						textNode.nodeValue = storedNodeValue;
					}
				}
				delete markEl.dataset.chTextMutated;
			}

			if (!shouldApply || !emojiMap) {
				delete markEl.dataset.chOriginalText;
				delete markEl.dataset.chOriginalFirstNode;
				return;
			}

			// Snapshot the whole text once so color detection stays stable
			// across re-runs even after the emoji prefix was stripped.
			const originalText = markEl.dataset.chOriginalText ?? (markEl.textContent ?? '');
			if (markEl.dataset.chOriginalText === undefined) {
				markEl.dataset.chOriginalText = originalText;
			}

			const { slot, emojiLength } = detectEmojiPrefix(originalText, emojiMap);
			const effectiveSlot = slot ?? defaultSlot;
			if (effectiveSlot) {
				markEl.classList.add(`${SLOT_CLASS_PREFIX}${effectiveSlot}`);
			}

			if (slot && emojiLength > 0) {
				// Strip the emoji from the first text node descendant only,
				// leaving any inline child elements (e.g. <strong>) intact.
				const textNode = firstTextNode(markEl);
				if (textNode) {
					const nodeValue = textNode.nodeValue ?? '';
					const { emojiLength: nodeEmojiLen } = detectEmojiPrefix(nodeValue, emojiMap);
					if (nodeEmojiLen > 0) {
						if (markEl.dataset.chOriginalFirstNode === undefined) {
							markEl.dataset.chOriginalFirstNode = nodeValue;
						}
						textNode.nodeValue = nodeValue.slice(nodeEmojiLen);
						markEl.dataset.chTextMutated = '1';
					}
				}
			}
		});
	}

	/** Re-apply decorations to every open Reading view (e.g. after settings change). */
	refreshAll(): void {
		const previewRoots = activeDocument.querySelectorAll('.markdown-preview-view');
		previewRoots.forEach((root) => {
			this.apply(root as HTMLElement);
		});
	}

	/** Remove all classes and restore mutated text. Called from onunload. */
	clearAll(): void {
		const previewRoots = activeDocument.querySelectorAll('.markdown-preview-view');
		previewRoots.forEach((root) => {
			const marks = (root as HTMLElement).querySelectorAll('mark');
			marks.forEach((mark) => {
				const markEl = mark as HTMLElement;

				for (const slot of COLOR_SLOTS) {
					markEl.classList.remove(`${SLOT_CLASS_PREFIX}${slot}`);
				}

				if (markEl.dataset.chTextMutated === '1') {
					const storedNodeValue = markEl.dataset.chOriginalFirstNode;
					if (storedNodeValue !== undefined) {
						const textNode = firstTextNode(markEl);
						if (textNode) {
							textNode.nodeValue = storedNodeValue;
						}
					}
				}

				delete markEl.dataset.chOriginalText;
				delete markEl.dataset.chOriginalFirstNode;
				delete markEl.dataset.chTextMutated;
			});
		});
	}
}
