import { addIcon, Editor, Menu, MenuItem, Plugin } from 'obsidian';
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
const COLOR_MODE_ATTR = 'data-ch-color-mode';
const OPACITY_VAR = '--ch-highlight-opacity';
const SECONDARY_OPACITY_VAR = '--ch-underline-opacity';
const SLOT_VAR_PREFIX = '--ch-highlight-';

/**
 * `MenuItem.setSubmenu()` ships in Obsidian 1.6+ but is missing from the
 * public type definitions. Guard it at runtime and fall back to flat menu
 * items when unavailable.
 */
type SubmenuCapableMenuItem = MenuItem & { setSubmenu?: () => Menu };

const SUBMENU_SUPPORTED =
	typeof (MenuItem.prototype as SubmenuCapableMenuItem).setSubmenu === 'function';

export default class ColorfulHighlightsPlugin extends Plugin {
	settings: ColorfulHighlightsSettings = DEFAULT_SETTINGS;
	private editorExtensions: Extension[] = [];
	private renderer!: ReadingHighlightRenderer;

	async onload() {
		initI18n();
		await this.loadSettings();
		this.renderer = new ReadingHighlightRenderer(() => this.settings);
		this.registerColorIcons();

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
		body.removeAttribute(COLOR_MODE_ATTR);
		body.style.removeProperty(OPACITY_VAR);
		body.style.removeProperty(SECONDARY_OPACITY_VAR);
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
	 * Lighter refresh for appearance-only changes (colors, opacity, render
	 * mode, highlight style) — no CM6 reconfiguration needed since those
	 * values flow through CSS variables and body attributes.
	 */
	refreshAppearance() {
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

	/** Push colors, opacity, render mode, and the style variant onto CSS (body-scoped). */
	private applyAppearance() {
		const body = activeDocument.body;
		for (const slot of COLOR_SLOTS) {
			body.style.setProperty(`${SLOT_VAR_PREFIX}${slot}`, this.settings.customColors[slot]);
		}
		body.style.setProperty(OPACITY_VAR, `${this.settings.colorOpacity}%`);
		body.style.setProperty(SECONDARY_OPACITY_VAR, `${this.settings.secondaryColorOpacity}%`);
		if (this.settings.highlightStyle === 'default') {
			body.removeAttribute(STYLE_ATTR);
		} else {
			body.setAttribute(STYLE_ATTR, this.settings.highlightStyle);
		}
		if (this.settings.renderMode === 'native') {
			body.setAttribute(COLOR_MODE_ATTR, 'native');
		} else {
			body.removeAttribute(COLOR_MODE_ATTR);
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

		let populated = false;
		if (this.settings.useSubmenu && SUBMENU_SUPPORTED) {
			menu.addItem((item) => {
				item
					.setTitle(t('menu.highlightColor'))
					.setIcon('highlighter')
					.setSection('colorful-highlights');
				const submenu = (item as SubmenuCapableMenuItem).setSubmenu?.();
				if (submenu) {
					this.populateColorMenu(submenu, editor);
					populated = true;
				}
			});
		}
		if (!populated) {
			this.populateColorMenu(menu, editor);
		}
	}

	private populateColorMenu(menu: Menu, editor: Editor) {
		for (const slot of COLOR_SLOTS) {
			menu.addItem((item) => {
				item
					.setTitle(t(`colors.${slot}`))
					.setIcon(`ch-dot-${slot}`)
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

	/**
	 * Per-slot circle icons for menu items. The fill reads the live
	 * --ch-highlight-{slot} CSS variable, so menu swatches always match the
	 * configured colors. The hex attribute is the pre-override fallback.
	 */
	private registerColorIcons() {
		for (const slot of COLOR_SLOTS) {
			// addIcon normalizes custom icons into a 100×100 viewBox wrapper —
			// author the SVG at that size or it renders scaled down.
			addIcon(
				`ch-dot-${slot}`,
				`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="33" fill="${DEFAULT_SETTINGS.customColors[slot]}" style="fill: var(--ch-highlight-${slot}, ${DEFAULT_SETTINGS.customColors[slot]})" stroke="var(--background-modifier-border)" stroke-width="4"/></svg>`
			);
		}
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
