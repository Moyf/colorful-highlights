/**
 * Editor text actions for colorful highlights.
 *
 * Used by commands and the editor context menu:
 *
 * - toggle: wrap the selection (or word) in ==...==, or unwrap an existing highlight
 * - remove: unwrap an existing highlight, dropping any emoji prefix
 * - color:  write the slot's first emoji alias into the highlight
 *           (==🟥text==), or strip the prefix when targeting the default slot
 *
 * Behavior with no selection: the ==...== span around the cursor is used;
 * otherwise the word under the cursor is wrapped.
 */

import { Editor } from 'obsidian';
import { type ColorSlotKey, type DefaultColorSlot } from './settings';
import { detectEmojiPrefix } from './utils/emoji-utils';

export interface HighlightActionContext {
	emojiMap: Map<string, ColorSlotKey>;
	defaultColorSlot: DefaultColorSlot;
	firstAliasForSlot: (slot: ColorSlotKey) => string | undefined;
}

export type HighlightAction =
	| { type: 'toggle' }
	| { type: 'remove' }
	| { type: 'color'; slot: ColorSlotKey };

/** Same expression as the CM6 extension — keep both in sync. */
const HIGHLIGHT_RE = /==((?:[^=]|=[^=])+?)==/g;

interface HighlightMatch {
	from: number;
	to: number;
	inner: string;
}

export function findHighlightAtOffset(doc: string, offset: number): HighlightMatch | null {
	HIGHLIGHT_RE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = HIGHLIGHT_RE.exec(doc)) !== null) {
		const from = match.index;
		const to = from + match[0].length;
		if (from > offset) {
			break;
		}
		if (offset >= from && offset <= to) {
			return { from, to, inner: match[1] };
		}
	}
	return null;
}

export function findHighlightAtCursor(editor: Editor): HighlightMatch | null {
	return findHighlightAtOffset(
		editor.getValue(),
		editor.posToOffset(editor.getCursor())
	);
}

/** The emoji written for a slot — undefined for the default slot (plain ==text==). */
function emojiForSlot(slot: ColorSlotKey, ctx: HighlightActionContext): string | undefined {
	if (ctx.defaultColorSlot !== 'none' && slot === ctx.defaultColorSlot) {
		return undefined;
	}
	return ctx.firstAliasForSlot(slot);
}

/** Replace any existing emoji prefix with the one for `slot`. */
function recolorInner(inner: string, slot: ColorSlotKey, ctx: HighlightActionContext): string {
	const { strippedText } = detectEmojiPrefix(inner, ctx.emojiMap);
	const emoji = emojiForSlot(slot, ctx);
	return emoji ? `${emoji}${strippedText}` : strippedText;
}

/** Remove the emoji prefix, keeping the plain text. */
function stripInner(inner: string, ctx: HighlightActionContext): string {
	return detectEmojiPrefix(inner, ctx.emojiMap).strippedText;
}

export function applyHighlightAction(
	editor: Editor,
	action: HighlightAction,
	ctx: HighlightActionContext
): void {
	if (editor.somethingSelected()) {
		handleSelection(editor, action, ctx);
		return;
	}

	const cursorOffset = editor.posToOffset(editor.getCursor());
	const match = findHighlightAtOffset(editor.getValue(), cursorOffset);
	if (match) {
		handleExisting(editor, match, action, ctx, cursorOffset);
		return;
	}

	// No selection and not inside a highlight — wrap the word under the cursor
	if (action.type !== 'remove') {
		wrapWordAtCursor(editor, action, ctx);
	}
}

function handleSelection(editor: Editor, action: HighlightAction, ctx: HighlightActionContext): void {
	const selection = editor.getSelection();
	const fromOffset = editor.posToOffset(editor.getCursor('from'));

	// Preserve whitespace outside the == markers when the selection wraps a highlight
	const wrapped = selection.match(/^(\s*)==([\s\S]*?)==(\s*)$/);

	let replacement: string | null = null;
	if (action.type === 'toggle') {
		replacement = wrapped
			? `${wrapped[1]}${stripInner(wrapped[2], ctx)}${wrapped[3]}`
			: `==${selection}==`;
	} else if (action.type === 'remove') {
		if (wrapped) {
			replacement = `${wrapped[1]}${stripInner(wrapped[2], ctx)}${wrapped[3]}`;
		}
	} else {
		replacement = wrapped
			? `${wrapped[1]}==${recolorInner(wrapped[2], action.slot, ctx)}==${wrapped[3]}`
			: `==${emojiForSlot(action.slot, ctx) ?? ''}${selection}==`;
	}

	if (replacement === null) {
		return;
	}

	editor.replaceSelection(replacement);
	// Keep the replaced text selected so colors can be switched repeatedly
	editor.setSelection(
		editor.offsetToPos(fromOffset),
		editor.offsetToPos(fromOffset + replacement.length)
	);
}

function handleExisting(
	editor: Editor,
	match: HighlightMatch,
	action: HighlightAction,
	ctx: HighlightActionContext,
	cursorOffset: number
): void {
	let replacement: string;
	if (action.type === 'color') {
		replacement = `==${recolorInner(match.inner, action.slot, ctx)}==`;
	} else {
		// toggle and remove both unwrap an existing highlight
		replacement = stripInner(match.inner, ctx);
	}

	editor.replaceRange(
		replacement,
		editor.offsetToPos(match.from),
		editor.offsetToPos(match.to)
	);

	// Keep the cursor at the same relative position where possible
	const relative = Math.max(0, cursorOffset - match.from);
	const clamped = Math.min(relative, replacement.length);
	editor.setCursor(editor.offsetToPos(match.from + clamped));
}

const WORD_CHAR_RE = /[\p{L}\p{N}_-]/u;

function wrapWordAtCursor(editor: Editor, action: HighlightAction, ctx: HighlightActionContext): void {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	const emoji = action.type === 'color' ? emojiForSlot(action.slot, ctx) : undefined;

	let start = cursor.ch;
	let end = cursor.ch;
	while (start > 0 && WORD_CHAR_RE.test(line.charAt(start - 1))) {
		start--;
	}
	while (end < line.length && WORD_CHAR_RE.test(line.charAt(end))) {
		end++;
	}

	if (start === end) {
		// No word under cursor — insert empty markers and place the cursor inside
		const markers = `==${emoji ?? ''}==`;
		editor.replaceRange(markers, cursor);
		editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 + (emoji?.length ?? 0) });
		return;
	}

	const word = line.slice(start, end);
	const wrappedText = `==${emoji ?? ''}${word}==`;
	editor.replaceRange(
		wrappedText,
		{ line: cursor.line, ch: start },
		{ line: cursor.line, ch: end }
	);
	editor.setCursor({ line: cursor.line, ch: start + wrappedText.length });
}
