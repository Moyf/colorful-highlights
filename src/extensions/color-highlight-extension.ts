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
 * 4. Continuation classes `ch-editor-cont-{left,right}` on the interior
 *    seams of a highlight run — nested formatting splits one ==...== into
 *    sibling mark segments (flush while the cursor is inside, separated
 *    by hidden zero-width `**` widgets otherwise), and the box style
 *    variants square those seams to paint one continuous shape.
 *
 * Why mirror classes instead of emitting mark decorations:
 * CM6 places our marks INSIDE Obsidian's native `.cm-highlight` (the
 * nesting order is decided by the editor's own decorations and cannot be
 * changed via precedence — verified empirically). Styling the highlight
 * therefore used to require `:has()` selectors in CSS, which Obsidian's
 * CSS scanner flags and which costs real invalidation work in CM6's
 * high-frequency DOM. Instead, this plugin resolves each highlight's DOM
 * element via `view.posAtDOM()` and adds `ch-editor-highlight-{slot}`
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
 * CM6 splits a highlight's marks around nested runs (e.g. a bold run
 * inside the highlight); each segment overlaps the range and gets the
 * class. Highlights are line-scoped — createHighlightRegex excludes
 * newlines — so cross-line ranges never occur, but the overlap check
 * would handle them if the regex were ever relaxed.
 *
 * Formatting markers (`==` spans, classed `cm-formatting-highlight`) sit
 * OUTSIDE the interior, so they are matched against the full slot range
 * instead of the interior — pre-mirroring, the plugin's own mark covered
 * the full ==...== span and the markers were painted with the slot
 * color; this keeps that look (and keeps the glyphs legible on the
 * black spoiler).
 *
 * Interior seams also get `ch-editor-cont-left` / `ch-editor-cont-right`
 * (see the module header). Runs are computed per slot range: consecutive
 * DOM segments of one range always join — whether they sit flush (editing
 * state, the inline `**` glyphs are mark elements themselves) or are
 * separated by HIDDEN formatting (unfocused Live Preview replaces `**`
 * with zero-width widgets whose characters still occupy doc positions,
 * so position equality alone would miss the join and leave notches).
 * CSS sibling selectors can't do this job either: they can't see text
 * nodes, so they would also square unrelated highlights elsewhere in the
 * line. `==` markers never join (they sit outside the pill's edges), and
 * pairing stops at rendered-line boundaries so soft-wrap fragments keep
 * the per-line pill look of box-decoration-break: clone.
 */

/** One enumerated `.cm-highlight` mark plus its resolved run metadata. */
interface MarkEntry {
	el: Element;
	elFrom: number;
	elTo: number;
	/** Rendered line number, so soft-wrap fragments never pair. */
	line: number;
	isMarker: boolean;
	wanted: string[];
	/** Slot range this mark paints for; null when unpainted. */
	range: SlotRange | null;
	contLeft: boolean;
	contRight: boolean;
}

function syncSlotClasses(
	view: EditorView,
	slotRanges: readonly SlotRange[],
	applied: Map<Element, string[]>
): { found: number; added: number } {
	const next = new Map<Element, string[]>();
	let added = 0;
	let found = 0;

	// Pass 1: resolve every mark's document range, line, and wanted slot
	// classes.
	const marks = Array.from(view.contentDOM.querySelectorAll('.cm-highlight'));
	const entries: MarkEntry[] = [];
	for (const el of marks) {
		let elFrom: number;
		let elTo: number;
		try {
			elFrom = view.posAtDOM(el, 0);
			elTo = view.posAtDOM(el, el.childNodes.length);
		} catch {
			continue;
		}
		const isMarker = el.classList.contains('cm-formatting-highlight');
		const wanted: string[] = [];
		let range: SlotRange | null = null;
		for (const candidate of slotRanges) {
			const lo = isMarker ? candidate.from : candidate.innerFrom;
			const hi = isMarker ? candidate.to : candidate.innerTo;
			if (elFrom < hi && lo < elTo) {
				const cls = `ch-editor-highlight-${candidate.slot}`;
				if (!wanted.includes(cls)) wanted.push(cls);
				if (!range) range = candidate;
			}
		}
		entries.push({
			el,
			elFrom,
			elTo,
			line: view.state.doc.lineAt(elFrom).number,
			isMarker,
			wanted,
			range,
			contLeft: false,
			contRight: false,
		});
	}

	// Pass 2: pair consecutive DOM segments within each slot range. The
	// interior renders as one continuous pill, so every edge between the
	// first and last segment is a seam to square — flush segments and
	// hidden-formatting gaps alike.
	const byRange = new Map<SlotRange, MarkEntry[]>();
	for (const entry of entries) {
		if (entry.isMarker || !entry.range || entry.wanted.length === 0) continue;
		const list = byRange.get(entry.range);
		if (list) list.push(entry);
		else byRange.set(entry.range, [entry]);
	}
	for (const list of byRange.values()) {
		if (list.length < 2) continue;
		list.sort((a, b) => a.elFrom - b.elFrom || a.elTo - b.elTo);
		for (let i = 1; i < list.length; i++) {
			const prev = list[i - 1];
			const seg = list[i];
			if (prev.line !== seg.line) continue;
			prev.contRight = true;
			seg.contLeft = true;
		}
	}

	// Pass 3: apply classes; tag run seams for the box style variants.
	for (const { el, isMarker, wanted, contLeft, contRight } of entries) {
		if (wanted.length === 0) continue;
		found++;
		if (!isMarker) {
			if (contLeft) wanted.push('ch-editor-cont-left');
			if (contRight) wanted.push('ch-editor-cont-right');
		}
		for (const cls of wanted) {
			if (!el.classList.contains(cls)) {
				el.classList.add(cls);
				added++;
			}
		}
		next.set(el, wanted);
	}
	// Remove previously-applied classes this sync no longer wants —
	// including on marks that are still matched, so a race with a CM6
	// rebuild can never leave a duplicate slot class behind.
	for (const [el, classes] of applied) {
		const wanted = next.get(el);
		for (const cls of classes) {
			if (!wanted?.includes(cls)) el.classList.remove(cls);
		}
	}
	applied.clear();
	for (const [el, classes] of next) applied.set(el, classes);
	return { found, added };
}

// ── ViewPlugin ──────────────────────────────────────────────────────

function createViewPlugin(config: ColorHighlightConfig) {
	// The config is immutable for this extension's lifetime — build once.
	// Only active slots are mapped, so a disabled color's emoji is treated as
	// ordinary text.
	const emojiMap = buildEmojiToColorSlotMap(config.emojiMappings, config.activeSlots);

	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet = Decoration.none;
			/** Slot classes this plugin last added to mark elements, for cleanup. */
			applied = new Map<Element, string[]>();
			/** Latest slot ranges; re-read by the deferred re-sync. */
			slotRanges: SlotRange[] = [];
			/** The single pending deferred re-sync, so stale syncs never run. */
			pendingSync: { win: Window; handle: number } | null = null;

			constructor(view: EditorView) {
				this.refresh(view);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet
				) {
					this.refresh(update.view);
				}
			}

			destroy() {
				this.cancelSync();
				// Drop mirrored classes so closing/unloading never leaves styling behind
				for (const [el, classes] of this.applied) {
					for (const cls of classes) el.classList.remove(cls);
				}
				this.applied.clear();
			}

			/**
			 * Runs synchronously right after CM6 rebuilds the line DOM within
			 * the same view update, so marks that were (re)built after our
			 * update() pass get their slot class before anything paints —
			 * no one-frame unstyled flash while typing or toggling the
			 * emoji replace widget.
			 */
			docViewUpdate(view: EditorView) {
				syncSlotClasses(view, this.slotRanges, this.applied);
			}

			/** Rebuild decorations and mirror slot classes onto native marks. */
			private refresh(view: EditorView): void {
				const built = buildDecorations(view, config, emojiMap);
				this.decorations = built.decorations;
				this.slotRanges = built.slotRanges;
				this.cancelSync();
				const sync = syncSlotClasses(view, built.slotRanges, this.applied);
				// Plugin update() runs BEFORE CM6 rebuilds the line DOM, and the
				// plugin constructor runs before the first DocView exists at all
				// — docViewUpdate covers the rebuild paths inside the update
				// flow, so this deferred re-sync only backstops paths that
				// never dispatch one (initial mount, setState()-style swaps).
				// It runs on the view's own window so a popout editor is not
				// throttled by the main one, and is skipped when no highlight
				// is in play, keeping cursor moves through highlight-free text
				// free of deferred work.
				if (sync.found > 0 || built.slotRanges.length > 0) {
					const win = view.dom.ownerDocument.defaultView ?? window;
					const pending = { win, handle: 0 };
					pending.handle = win.requestAnimationFrame(() => {
						this.pendingSync = null;
						syncSlotClasses(view, this.slotRanges, this.applied);
					});
					this.pendingSync = pending;
				}
			}

			private cancelSync(): void {
				if (this.pendingSync) {
					this.pendingSync.win.cancelAnimationFrame(this.pendingSync.handle);
					this.pendingSync = null;
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
