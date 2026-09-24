/**
 * CodeMirror 6 editor extension that decorates emoji-prefixed highlights
 * (e.g. ==🔴Important text==) with:
 *
 * 1. A color class mirrored onto Obsidian's native `.cm-highlight` mark.
 * 2. An optional Decoration.replace that hides the emoji character — unless
 *    the cursor is currently inside that highlight range, mirroring how
 *    Obsidian's Live Preview hides `==` markers until focused.
 * 3. Plain ==highlights== without emoji get the default color slot's
 *    class when a default color is configured.
 *
 * Why mirror classes instead of emitting mark decorations:
 * CM6 places our marks INSIDE Obsidian's native `.cm-highlight` (the
 * nesting order is decided by the editor's own decorations and cannot be
 * changed via precedence — verified empirically). Styling the highlight
 * therefore used to require `:has()` selectors in CSS, which Obsidian's
 * CSS scanner flags and which costs real invalidation work in CM6's
 * high-frequency DOM. Instead, this plugin resolves each highlight's DOM
 * element via `view.domAtPos()` and adds `ch-editor-highlight-{slot}`
 * directly to the native mark. styles.css then uses plain class
 * selectors — zero `:has()`, same cascade target, same visual result.
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
	/** slots currently exposed — disabled extended slots are not parsed */
	activeSlots: readonly ColorSlotKey[];
	/** slot whose color is "default" — plain ==text== without emoji gets this color */
	defaultColorSlot: DefaultColorSlot;
	/** when true, source-mode editor text keeps the emoji prefix visible */
	showPrefixInSourceMode: boolean;
}

/** Replaces a range with nothing — used to visually hide the emoji character. */
const hideEmoji = Decoration.replace({});

/** A highlight range resolved to a color slot, for class mirroring. */
interface SlotRange {
	/** Range edges including the == markers. */
	from: number;
	to: number;
	/** Interior text range (between the markers). */
	innerFrom: number;
	innerTo: number;
	slot: ColorSlotKey;
}

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
): { decorations: DecorationSet; slotRanges: SlotRange[] } {
	const showEmojiPrefix = config.showPrefixInSourceMode && isSourceMode(view);

	const ranges: Range<Decoration>[] = [];
	const slotRanges: SlotRange[] = [];
	const highlightRe = createHighlightRegex();
	const fencedLines = computeFencedCodeLines(view.state.doc.toString());

	// Collect all selection ranges for cursor-intersection checks
	const selRanges = view.state.selection.ranges;

	// Resolve the default-slot class (for plain ==text== without emoji)
	const defaultSlot: ColorSlotKey | null =
	config.defaultColorSlot !== 'none' && config.activeSlots.includes(config.defaultColorSlot)
		? config.defaultColorSlot
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
				slotRanges.push({ from: matchStart, to: matchEnd, innerFrom: innerStart, innerTo: innerEnd, slot });

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
			} else if (defaultSlot) {
				// ── Plain ==text== without emoji: apply default color ──
				slotRanges.push({ from: matchStart, to: matchEnd, innerFrom: innerStart, innerTo: innerEnd, slot: defaultSlot });
			}
		}
	}

	// Decoration.set() handles sorting by from/startSide automatically
	return { decorations: Decoration.set(ranges, true), slotRanges };
}

// ── Slot-class mirroring ────────────────────────────────────────────

/**
 * Sync mirrored `ch-editor-highlight-{slot}` classes with the DOM.
 *
 * Enumerates the native `.cm-highlight` marks currently rendered and
 * matches each against the slot ranges by DOCUMENT-POSITION OVERLAP.
 * This handles every shape CM6 produces: multi-line highlights (split
 * into one mark per line) and marks split by nested marks (e.g. a bold
 * run inside the highlight) — each segment overlaps the range and gets
 * the class.
 */
function syncSlotClasses(
	view: EditorView,
	slotRanges: SlotRange[],
	applied: Map<Element, string[]>
): { found: number; added: number } {
	const next = new Map<Element, string[]>();
	let added = 0;
	let found = 0;
	const marks = Array.from(view.contentDOM.querySelectorAll('.cm-highlight'));
	for (const el of marks) {
		let elFrom: number;
		let elTo: number;
		try {
			elFrom = view.posAtDOM(el, 0);
			elTo = view.posAtDOM(el, el.childNodes.length);
		} catch {
			continue;
		}
		for (const { innerFrom, innerTo, slot } of slotRanges) {
			if (elFrom < innerTo && innerFrom < elTo) {
				found++;
				const cls = `ch-editor-highlight-${slot}`;
				if (!el.classList.contains(cls)) {
					el.classList.add(cls);
					added++;
				}
				const existing = next.get(el);
				if (existing) existing.push(cls);
				else next.set(el, [cls]);
			}
		}
	}
	for (const [el, classes] of applied) {
		if (next.has(el)) continue;
		for (const cls of classes) el.classList.remove(cls);
	}
	applied.clear();
	for (const [el, classes] of next) applied.set(el, classes);
	return { found, added };
}

/**
 * Mirror `ch-editor-highlight-{slot}` onto the native mark element of
 * each slot range, removing classes from marks that no longer have one.
 * Re-applied after every plugin update, so CM6 rebuilds never leave
 * stale classes behind.
 */
function applySlotClasses(
	view: EditorView,
	slotRanges: SlotRange[],
	applied: Map<Element, string[]>
): void {
	const sync = syncSlotClasses(view, slotRanges, applied);

	// Re-sync on the next frame: CM6 can rebuild a line's DOM *after* our
	// update pass (e.g. its own decoration flush), dropping mirrored
	// classes from marks that still exist. Re-checking without DOM writes
	// when nothing is missing keeps the common case free.
	if (sync.found > 0) {
		const state = { view, slotRanges, applied };
		window.requestAnimationFrame(() => {
			syncSlotClasses(state.view, state.slotRanges, state.applied);
		});
	}
}

// ── ViewPlugin ──────────────────────────────────────────────────────

function createViewPlugin(config: ColorHighlightConfig) {
	// The config is immutable for this extension's lifetime — build once.
	// Only active slots are mapped, so a disabled color's emoji is treated as
	// ordinary text.
	const emojiMap = buildEmojiToColorSlotMap(config.emojiMappings, config.activeSlots);

	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			/** Slot classes this plugin last added to mark elements, for cleanup. */
			applied = new Map<Element, string[]>();

			constructor(view: EditorView) {
				const built = buildDecorations(view, config, emojiMap);
				this.decorations = built.decorations;
				applySlotClasses(view, built.slotRanges, this.applied);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet
				) {
					const built = buildDecorations(update.view, config, emojiMap);
					this.decorations = built.decorations;
					applySlotClasses(update.view, built.slotRanges, this.applied);
				}
			}

			destroy() {
				// Drop mirrored classes so closing/unloading never leaves styling behind
				for (const [el, classes] of this.applied) {
					for (const cls of classes) el.classList.remove(cls);
				}
				this.applied.clear();
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
