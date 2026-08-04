/**
 * CodeMirror 6 editor extension that decorates emoji-prefixed highlights
 * (e.g. ==🟥Important text==) with:
 *
 * 1. A background-color mark matching the configured color slot.
 * 2. An optional Decoration.replace that hides the emoji character — unless
 *    the cursor is currently inside that highlight range, mirroring how
 *    Obsidian's Live Preview hides `==` markers until focused.
 * 3. Plain ==highlights== without emoji get the default color slot's
 *    background when a default color is configured.
 *
 * Registration:  plugin.registerEditorExtension(extensionArray)
 * Reactivity:    mutate the array contents + app.workspace.updateOptions()
 */

import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
} from '@codemirror/view';
import { Extension, Range } from '@codemirror/state';
import {
	type ColorSlotKey,
	type DefaultColorSlot,
} from '../settings';
import {
	buildEmojiToColorSlotMap,
	createHighlightRegex,
	detectEmojiPrefix,
} from '../utils/emoji-utils';

// ── Public config type ──────────────────────────────────────────────

export interface ColorHighlightConfig {
	emojiMappings: Record<ColorSlotKey, string>;
	/** slot whose color is "default" — plain ==text== without emoji gets this color */
	defaultColorSlot: DefaultColorSlot;
	/** when true, source-mode editor text keeps the emoji prefix visible */
	showPrefixInSourceMode: boolean;
}

// ── Pre-built decoration marks (one per color slot) ─────────────────

const colorMarkDecos: Record<ColorSlotKey, Decoration> = {
	yellow: Decoration.mark({ class: 'ch-editor-highlight-yellow' }),
	green: Decoration.mark({ class: 'ch-editor-highlight-green' }),
	red: Decoration.mark({ class: 'ch-editor-highlight-red' }),
	purple: Decoration.mark({ class: 'ch-editor-highlight-purple' }),
	blue: Decoration.mark({ class: 'ch-editor-highlight-blue' }),
};

/** Replaces a range with nothing — used to visually hide the emoji character. */
const hideEmoji = Decoration.replace({});

function isSourceMode(view: EditorView): boolean {
	return view.dom.closest('.markdown-source-view')?.classList.contains('is-live-preview') === false;
}

// ── Code-region detection ───────────────────────────────────────────
// Obsidian's markdown mode is a stream parser — syntaxTree() has no
// structural nodes — so code regions are computed from the raw text.
// Code content is literal source: emoji visibility there follows the
// source-mode setting.

/** Per-line flags for fenced code blocks (``` or ~~~), fence lines included. */
function computeFencedCodeLines(docText: string): boolean[] {
	const lines = docText.split('\n');
	const inCode = new Array<boolean>(lines.length).fill(false);
	let open = false;
	let fenceChar = '';
	let fenceLen = 0;

	for (let i = 0; i < lines.length; i++) {
		const fence = lines[i].match(/^\s{0,3}(`{3,}|~{3,})/);
		if (!open) {
			if (fence) {
				open = true;
				fenceChar = fence[1][0];
				fenceLen = fence[1].length;
				inCode[i] = true;
			}
		} else {
			inCode[i] = true;
			if (fence && fence[1][0] === fenceChar && fence[1].length >= fenceLen) {
				open = false;
			}
		}
	}
	return inCode;
}

/** Whether `ch` sits inside an inline `code` span on the given line. */
function isInsideInlineCode(lineText: string, ch: number): boolean {
	const runs: Array<{ start: number; end: number; len: number }> = [];
	const backtickRe = /`+/g;
	let run: RegExpExecArray | null;
	while ((run = backtickRe.exec(lineText)) !== null) {
		runs.push({ start: run.index, end: run.index + run[0].length, len: run[0].length });
	}
	// A run of N backticks opens an inline code span closed by the next run of N
	for (let i = 0; i < runs.length; i++) {
		for (let j = i + 1; j < runs.length; j++) {
			if (runs[j].len === runs[i].len) {
				if (ch >= runs[i].end && ch < runs[j].start) {
					return true;
				}
				i = j;
				break;
			}
		}
	}
	return false;
}

function isInsideCode(view: EditorView, fencedLines: boolean[], pos: number): boolean {
	const line = view.state.doc.lineAt(pos);
	if (fencedLines[line.number - 1]) {
		return true;
	}
	return isInsideInlineCode(line.text, pos - line.from);
}

// ── Build decorations ───────────────────────────────────────────────

function buildDecorations(
	view: EditorView,
	config: ColorHighlightConfig,
	emojiMap: Map<string, ColorSlotKey>
): DecorationSet {
	const showEmojiPrefix = config.showPrefixInSourceMode && isSourceMode(view);

	const ranges: Range<Decoration>[] = [];
	const highlightRe = createHighlightRegex();
	const fencedLines = computeFencedCodeLines(view.state.doc.toString());

	// Collect all selection ranges for cursor-intersection checks
	const selRanges = view.state.selection.ranges;

	// Resolve the default-slot decoration (for plain ==text== without emoji)
	const defaultDeco = config.defaultColorSlot !== 'none'
		? colorMarkDecos[config.defaultColorSlot]
		: null;

	for (const { from, to } of view.visibleRanges) {
		const text = view.state.doc.sliceString(from, to);
		highlightRe.lastIndex = 0;

		let match: RegExpExecArray | null;
		while ((match = highlightRe.exec(text)) !== null) {
			const innerText = match[1];                       // text between == markers
			const matchStart = from + match.index;          // absolute offset of first =
			const matchEnd = matchStart + match[0].length;  // absolute offset past last =
			const innerStart = matchStart + 2;              // past opening ==
			const innerEnd = matchEnd - 2;                  // before closing ==

			if (innerStart >= innerEnd) continue;

			const { slot, emojiOffset, emojiLength } = emojiMap.size > 0
				? detectEmojiPrefix(innerText, emojiMap)
				: { slot: undefined, emojiOffset: 0, emojiLength: 0 };

			if (slot) {
				// ── Emoji-prefixed highlight: use the emoji's color ──
				// Cover the full ==...== range including markers
				ranges.push(colorMarkDecos[slot].range(matchStart, matchEnd));

				// Hide emoji when configured and cursor is NOT inside this highlight.
				// Boundaries are inclusive: the emoji stays visible while the cursor
				// touches either edge of the ==...== span (e.g. right after the
				// closing ==), so it only disappears once the cursor has clearly
				// left — avoiding a pop-in/out flicker at the boundary.
				// Code content (fenced block / inline code) is literal source:
				// it follows the source-mode setting instead of hiding.
				const keepVisibleInCode =
					config.showPrefixInSourceMode &&
					isInsideCode(view, fencedLines, innerStart + emojiOffset);
				if (!showEmojiPrefix && !keepVisibleInCode && emojiLength > 0) {
					const emojiFrom = innerStart + emojiOffset;
					const emojiTo = emojiFrom + emojiLength;
					const cursorInside = selRanges.some(
						r => r.from <= matchEnd && r.to >= matchStart
					);
					if (!cursorInside && emojiFrom < emojiTo) {
						ranges.push(hideEmoji.range(emojiFrom, emojiTo));
					}
				}
			} else if (defaultDeco) {
				// ── Plain ==text== without emoji: apply default color ──
				// Cover the full ==...== range including markers
				ranges.push(defaultDeco.range(matchStart, matchEnd));
			}
		}
	}

	// Decoration.set() handles sorting by from/startSide automatically
	return Decoration.set(ranges, true);
}

// ── ViewPlugin ──────────────────────────────────────────────────────

function createViewPlugin(config: ColorHighlightConfig) {
	// The config is immutable for this extension's lifetime — build once.
	const emojiMap = buildEmojiToColorSlotMap(config.emojiMappings);

	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, config, emojiMap);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet
				) {
					this.decorations = buildDecorations(update.view, config, emojiMap);
				}
			}
		},
		{
			decorations: v => v.decorations,
		}
	);
}

// ── Factory ─────────────────────────────────────────────────────────

/**
 * Create the CM6 Extension for colorful highlight decorations.
 *
 * Typical usage in plugin.onload():
 *
 *     private editorExtensions: Extension[] = [];
 *
 *     this.registerEditorExtension(this.editorExtensions);
 *
 *     // Whenever settings change:
 *     this.editorExtensions.length = 0;
 *     this.editorExtensions.push(createColorHighlightExtension({ ... }));
 *     this.app.workspace.updateOptions();
 */
export function createColorHighlightExtension(config: ColorHighlightConfig): Extension {
	return createViewPlugin(config);
}
