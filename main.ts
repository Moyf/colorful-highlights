import { Editor, Menu, Plugin } from 'obsidian';
import type { Extension } from '@codemirror/state';
import {
	COLOR_SLOTS,
	DEFAULT_SETTINGS,
	type ColorSlotKey,
	type ColorfulHighlightsSettings,
} from './src/settings';
import { buildEmojiToColorSlotMap, parseEmojiAliases } from './src/utils/emoji-utils';
import { createColorHighlightExtension } from './src/extensions/color-highlight-extension';
import { ReadingHighlightRenderer } from './src/reading-renderer';
import {
	applyHighlightAction,
	findHighlightAtCursor,
	type HighlightActionContext,
} from './src/highlight-actions';
import { ColorfulHighlightsSettingTab } from './src/settings-tab';
import { initI18n, t } from './src/i18n';

const STYLE_ATTR = 'data-ch-highlight-style';
const OPACITY_VAR = '--ch-highlight-opacity';
const SLOT_VAR_PREFIX = '--ch-highlight-';

export default class ColorfulHighlightsPlugin extends Plugin {
	settings: ColorfulHighlightsSettings = DEFAULT_SETTINGS;
	private editorExtensions: Extension[] = [];
	private renderer!: ReadingHighlightRenderer;

	async onload() {
		initI18n();
		await this.loadSettings();
		this.renderer = new ReadingHighlightRenderer(() => this.settings);

		this.rebuildEditorExtensions();
		this.registerEditorExtension(this.editorExtensions);

		this.registerMarkdownPostProcessor((el) => {
			this.renderer.apply(el);
		});

		this.applyAppearance();
		this.registerCommands();

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				this.buildEditorMenu(menu, editor);
			})
		);

		this.addSettingTab(new ColorfulHighlightsSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.renderer.refreshAll();
		});
	}

	onunload() {
		this.renderer.clearAll();
		const body = activeDocument.body;
		body.removeAttribute(STYLE_ATTR);
		body.style.removeProperty(OPACITY_VAR);
		for (const slot of COLOR_SLOTS) {
			body.style.removeProperty(`${SLOT_VAR_PREFIX}${slot}`);
		}
	}

	async loadSettings() {
		const loaded = (await this.loadData()) as Partial<ColorfulHighlightsSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...(loaded ?? {}),
			emojiMappings: { ...DEFAULT_SETTINGS.emojiMappings, ...(loaded?.emojiMappings ?? {}) },
			customColors: { ...DEFAULT_SETTINGS.customColors, ...(loaded?.customColors ?? {}) },
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/** Re-apply every surface after a settings change. */
	refresh() {
		this.rebuildEditorExtensions();
		this.applyAppearance();
		this.renderer.refreshAll();
	}

	/**
	 * Rebuild the CM6 extension array for editor highlight decorations.
	 * Mutates the registered Extension[] in place and triggers a workspace refresh.
	 */
	rebuildEditorExtensions() {
		this.editorExtensions.length = 0;
		if (this.settings.enabled && this.settings.editorDecorator) {
			this.editorExtensions.push(
				createColorHighlightExtension({
					emojiMappings: { ...this.settings.emojiMappings },
					defaultColorSlot: this.settings.defaultColorSlot,
					showPrefixInSourceMode: this.settings.showPrefixInSourceMode,
				})
			);
		}
		this.app.workspace.updateOptions();
	}

	/** Push colors, opacity, and the style variant onto CSS (body-scoped). */
	private applyAppearance() {
		const body = activeDocument.body;
		for (const slot of COLOR_SLOTS) {
			body.style.setProperty(`${SLOT_VAR_PREFIX}${slot}`, this.settings.customColors[slot]);
		}
		body.style.setProperty(OPACITY_VAR, `${this.settings.colorOpacity}%`);
		if (this.settings.highlightStyle === 'default') {
			body.removeAttribute(STYLE_ATTR);
		} else {
			body.setAttribute(STYLE_ATTR, this.settings.highlightStyle);
		}
	}

	private registerCommands() {
		this.addCommand({
			id: 'toggle-highlight',
			name: t('commands.toggle'),
			editorCallback: (editor) => {
				applyHighlightAction(editor, { type: 'toggle' }, this.getActionContext());
			},
		});

		for (const slot of COLOR_SLOTS) {
			this.addCommand({
				id: `highlight-${slot}`,
				name: t('commands.setColor', { color: t(`colors.${slot}`) }),
				editorCallback: (editor) => {
					applyHighlightAction(editor, { type: 'color', slot }, this.getActionContext());
				},
			});
		}

		this.addCommand({
			id: 'remove-highlight',
			name: t('commands.remove'),
			editorCallback: (editor) => {
				applyHighlightAction(editor, { type: 'remove' }, this.getActionContext());
			},
		});
	}

	private buildEditorMenu(menu: Menu, editor: Editor) {
		if (!this.settings.enabled || !this.settings.showColorMenuInEditorMenu) {
			return;
		}
		if (!editor.somethingSelected() && !findHighlightAtCursor(editor)) {
			return;
		}

		for (const slot of COLOR_SLOTS) {
			menu.addItem((item) => {
				item
					.setTitle(this.buildColorMenuTitle(slot))
					.setSection('colorful-highlights')
					.onClick(() => {
						applyHighlightAction(editor, { type: 'color', slot }, this.getActionContext());
					});
			});
		}

		menu.addItem((item) => {
			item
				.setTitle(t('menu.removeHighlight'))
				.setIcon('eraser')
				.setSection('colorful-highlights')
				.onClick(() => {
					applyHighlightAction(editor, { type: 'remove' }, this.getActionContext());
				});
		});
	}

	/** Menu label with a colored dot swatch and the slot's default emoji. */
	private buildColorMenuTitle(slot: ColorSlotKey): DocumentFragment {
		const frag = activeDocument.createDocumentFragment();
		frag
			.createSpan({ cls: 'ch-menu-dot' })
			.setCssProps({ '--ch-dot-color': this.settings.customColors[slot] });
		const alias = parseEmojiAliases(this.settings.emojiMappings[slot])[0];
		frag.createSpan({ text: alias ? `${t(`colors.${slot}`)} ${alias}` : t(`colors.${slot}`) });
		return frag;
	}

	private getActionContext(): HighlightActionContext {
		return {
			emojiMap: buildEmojiToColorSlotMap(this.settings.emojiMappings),
			defaultColorSlot: this.settings.defaultColorSlot,
			firstAliasForSlot: (slot: ColorSlotKey) =>
				parseEmojiAliases(this.settings.emojiMappings[slot])[0],
		};
	}
}
