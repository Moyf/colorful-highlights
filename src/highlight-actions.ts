/**
 * Editor text actions for colorful highlights.
 *
 * Used by commands and the editor context menu:
 *
 * - toggle: wrap the selection (or word) in ==...==; when the selection
 *   overlaps existing highlights, unwrap them instead
 * - remove: unwrap every highlight overlapping the selection, dropping any
 *   emoji prefixes
 * - color:  write the slot's first emoji alias into the highlight
 *   (==🟥text==), or strip the prefix when targeting the default slot
 *
 * Markdown highlights cannot nest, so coloring a selection that overlaps
 * existing highlights ABSORBS them: the affected range expands to the union
 * of the selection and every overlapping ==...== span, inner markers and
 * emoji prefixes are stripped, and the merged text is re-wrapped with the
 * new color.
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

/** Every ==...== span intersecting [from, to), in document order. */
function collectOverlappingHighlights(doc: string, from: number, to: number): HighlightMatch[] {
	const matches: HighlightMatch[] = [];
	HIGHLIGHT_RE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = HIGHLIGHT_RE.exec(doc)) !== null) {
		const matchFrom = match.index;
		const matchTo = matchFrom + match[0].length;
		if (matchFrom >= to) {
			break;
		}
		if (matchTo > from) {
			matches.push({ from: matchFrom, to: matchTo, inner: match[1] });
		}
	}
	return matches;
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
	const selFrom = editor.posToOffset(editor.getCursor('from'));
	const selTo = editor.posToOffset(editor.getCursor('to'));
	const doc = editor.getValue();
	const overlapping = collectOverlappingHighlights(doc, selFrom, selTo);

	// Unwrap paths: remove always unwraps; toggle unwraps when highlights exist
	if (action.type === 'remove' || (action.type === 'toggle' && overlapping.length > 0)) {
		if (overlapping.length === 0) {
			return;
		}
		// Replace from last to first so earlier offsets stay valid
		for (let i = overlapping.length - 1; i >= 0; i--) {
			const match = overlapping[i];
			editor.replaceRange(
				stripInner(match.inner, ctx),
				editor.offsetToPos(match.from),
				editor.offsetToPos(match.to)
			);
		}
		editor.setCursor(editor.offsetToPos(Math.min(selFrom, overlapping[0].from)));
		return;
	}

	const emoji = action.type === 'color' ? (emojiForSlot(action.slot, ctx) ?? '') : '';

	if (overlapping.length === 0) {
		// Plain wrap — no highlights involved
		const replacement = `==${emoji}${doc.slice(selFrom, selTo)}==`;
		editor.replaceRange(replacement, editor.offsetToPos(selFrom), editor.offsetToPos(selTo));
		editor.setSelection(
			editor.offsetToPos(selFrom),
			editor.offsetToPos(selFrom + replacement.length)
		);
		return;
	}

	// Absorb: expand to the union of the selection and every overlapping
	// highlight, strip inner == markers and emoji prefixes, re-wrap once.
	let unionFrom = selFrom;
	let unionTo = selTo;
	for (const match of overlapping) {
		unionFrom = Math.min(unionFrom, match.from);
		unionTo = Math.max(unionTo, match.to);
	}

	const mergedText = doc.slice(unionFrom, unionTo);
	const stripped = mergedText.replace(HIGHLIGHT_RE, (_whole, inner: string) =>
		stripInner(inner, ctx)
	);
	const wsParts = stripped.match(/^(\s*)([\s\S]*?)(\s*)$/);
	const core = wsParts ? wsParts[2] : stripped;
	if (!core) {
		return;
	}

	const replacement = `${wsParts?.[1] ?? ''}==${emoji}${core}==${wsParts?.[3] ?? ''}`;
	editor.replaceRange(replacement, editor.offsetToPos(unionFrom), editor.offsetToPos(unionTo));
	// Keep the replaced text selected so colors can be switched repeatedly
	editor.setSelection(
		editor.offsetToPos(unionFrom),
		editor.offsetToPos(unionFrom + replacement.length)
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
