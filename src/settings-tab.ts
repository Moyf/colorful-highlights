import { App, PluginSettingTab, Setting } from 'obsidian';
import type { SettingDefinitionItem, SettingGroupItem } from 'obsidian';
import type ColorfulHighlightsPlugin from '../main';
import {
	COLOR_SLOTS,
	HIGHLIGHT_STYLES,
	getAvailableColorSlots,
	getActiveColorSlots,
	type ColorSlotKey,
	type DefaultColorSlot,
	type HighlightStyle,
	type RenderMode,
} from './settings';
import { parseEmojiAliases } from './utils/emoji-utils';
import { t } from './i18n';

const STYLE_OPTION_KEYS: Record<HighlightStyle, string> = {
	'default': 'settings.highlightStyle.options.default',
	'half-strike': 'settings.highlightStyle.options.halfStrike',
	'double-strike': 'settings.highlightStyle.options.doubleStrike',
	'underline-only': 'settings.highlightStyle.options.underlineOnly',
	'underline-with-bg': 'settings.highlightStyle.options.underlineWithBg',
	'rounded': 'settings.highlightStyle.options.rounded',
	'outline': 'settings.highlightStyle.options.outline',
	'wavy-underline': 'settings.highlightStyle.options.wavyUnderline',
	'wavy-underline-only': 'settings.highlightStyle.options.wavyUnderlineOnly',
	'gradient': 'settings.highlightStyle.options.gradient',
};

// Styles whose second layer or line/stroke is driven by the secondary slider.
const STYLES_WITH_SECONDARY: HighlightStyle[] = [
	'double-strike',
	'underline-with-bg',
	'wavy-underline',
	'underline-only',
	'wavy-underline-only',
	'outline',
];

const STYLES_WITHOUT_BACKGROUND: HighlightStyle[] = [
	'underline-only',
	'wavy-underline-only',
];

const ENABLED_COLOR_KEY_PREFIX = 'enabledColors.';

function isHighlightStyle(value: unknown): value is HighlightStyle {
	return HIGHLIGHT_STYLES.some((style) => style === value);
}

function isDefaultColorSlot(value: unknown): value is DefaultColorSlot {
	return value === 'none' || COLOR_SLOTS.some((slot) => slot === value);
}

function isColorSlotKey(value: string): value is ColorSlotKey {
	return COLOR_SLOTS.some((slot) => slot === value);
}

function isRenderMode(value: unknown): value is RenderMode {
	return value === 'plugin' || value === 'native';
}

export class ColorfulHighlightsSettingTab extends PluginSettingTab {
	plugin: ColorfulHighlightsPlugin;
	icon = 'highlighter';

	private mappingPersistTimer: number | null = null;
	private appearancePersistTimer: number | null = null;
	private stylePreviewEls = new Set<HTMLElement>();

	constructor(app: App, plugin: ColorfulHighlightsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	hide(): void {
		if (this.mappingPersistTimer !== null) {
			window.clearTimeout(this.mappingPersistTimer);
			this.mappingPersistTimer = null;
		}
		if (this.appearancePersistTimer !== null) {
			window.clearTimeout(this.appearancePersistTimer);
			this.appearancePersistTimer = null;
		}
		super.hide();
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const styleOptions: Record<string, string> = {};
		for (const style of HIGHLIGHT_STYLES) {
			styleOptions[style] = t(STYLE_OPTION_KEYS[style]);
		}

		// Definitions are cached by the settings framework — rebuild via
		// update() when the extended-colors or per-color toggle changes this set.
		const availableSlots = getAvailableColorSlots(this.plugin.settings.extendedColors);
		const activeSlots = getActiveColorSlots(
			this.plugin.settings.extendedColors,
			this.plugin.settings.enabledColors
		);

		const defaultColorOptions: Record<string, string> = {
			none: t('settings.defaultColor.none'),
		};
		for (const slot of activeSlots) {
			defaultColorOptions[slot] = t(`colors.${slot}`);
		}

		const colorItems: SettingGroupItem[] = [];
		for (const slot of availableSlots) {
			colorItems.push({
				name: t(`colors.${slot}`),
				desc: t(`settings.colorSetting.${slot}`),
				searchable: true,
				render: (setting) => {
					setting
						.setName(t(`colors.${slot}`))
						.setDesc(t(`settings.colorSetting.${slot}`));
					if (slot !== 'black') {
						setting.addColorPicker((picker) =>
							picker.setValue(this.plugin.settings.customColors[slot]).onChange((value) => {
								this.plugin.settings.customColors[slot] = value;
								// Cheap visual update on every tick; disk write is debounced.
								this.plugin.refreshAppearance();
								this.debouncedPersistAppearance();
							})
						);
					}
					const colorEnabled = this.plugin.settings.enabledColors[slot] !== false;
					setting.addToggle((toggle) =>
						toggle
							.setValue(colorEnabled)
							.setTooltip(
								colorEnabled
									? t('settings.colorSetting.toggle.disable')
									: t('settings.colorSetting.toggle.enable')
							)
							.onChange((value) => {
								toggle.setTooltip(
									value
										? t('settings.colorSetting.toggle.disable')
										: t('settings.colorSetting.toggle.enable')
								);
								void this.setControlValue(`${ENABLED_COLOR_KEY_PREFIX}${slot}`, value);
							})
					);
				},
			});
		}

		const emojiMappingItems: SettingGroupItem[] = [
			{
				name: '',
				desc: t('settings.emojiMappingIntro'),
				searchable: false,
			},
		];
		for (const slot of activeSlots) {
			emojiMappingItems.push({
				name: t(`colors.${slot}`),
				searchable: true,
				render: (setting) => {
					setting.setName(t(`colors.${slot}`));
					this.updateMappingDesc(setting, slot);
					setting.addText((text) =>
						text
							.setPlaceholder(t('settings.emojiMapping.placeholder'))
							.setValue(this.plugin.settings.emojiMappings[slot])
							.onChange((value) => {
								this.plugin.settings.emojiMappings[slot] = value;
								this.updateMappingDesc(setting, slot);
								this.debouncedPersistMappings();
							})
					);
				},
			});
		}

		return [
			{
				type: 'group',
				heading: t('settings.groups.general'),
				items: [
					{
						name: t('settings.enabled.name'),
						desc: t('settings.enabled.desc'),
						control: { type: 'toggle', key: 'enabled' },
					},
					{
						name: t('settings.highlightStyle.name'),
						desc: t('settings.highlightStyle.desc'),
						render: (setting) => {
							setting
								.setName(t('settings.highlightStyle.name'))
								.setDesc(t('settings.highlightStyle.desc'));

							const previewEl = setting.controlEl.createSpan({
								cls: 'ch-style-preview-sample',
								text: t('settings.highlightStyle.preview'),
							});
							this.stylePreviewEls.add(previewEl);
							this.syncStylePreview();

							setting.addDropdown((dropdown) => {
								for (const style of HIGHLIGHT_STYLES) {
									dropdown.addOption(style, styleOptions[style]);
								}
								dropdown.setValue(this.plugin.settings.highlightStyle).onChange((value) => {
									void this.setControlValue('highlightStyle', value);
								});
							});

							return () => {
								this.stylePreviewEls.delete(previewEl);
							};
						},
					},
					{
						name: t('settings.opacity.name'),
						desc: t('settings.opacity.desc'),
						visible: () => !STYLES_WITHOUT_BACKGROUND.includes(this.plugin.settings.highlightStyle),
						control: {
							type: 'slider',
							key: 'colorOpacity',
							min: 10,
							max: 100,
							step: 5,
						},
					},
					{
						name: t('settings.secondaryOpacity.name'),
						desc: t('settings.secondaryOpacity.desc'),
						visible: () => STYLES_WITH_SECONDARY.includes(this.plugin.settings.highlightStyle),
						control: {
							type: 'slider',
							key: 'secondaryColorOpacity',
							min: 10,
							max: 100,
							step: 5,
						},
					},
					{
						name: t('settings.defaultColor.name'),
						desc: t('settings.defaultColor.desc'),
						control: { type: 'dropdown', key: 'defaultColorSlot', options: defaultColorOptions },
					},
				],
			},
			{
				type: 'group',
				heading: t('settings.groups.decoration'),
				items: [
					{
						name: t('settings.editorDecorator.name'),
						desc: t('settings.editorDecorator.desc'),
						control: { type: 'toggle', key: 'editorDecorator' },
					},
					{
						name: t('settings.showPrefixInSource.name'),
						desc: t('settings.showPrefixInSource.desc'),
						control: { type: 'toggle', key: 'showPrefixInSourceMode' },
					},
					{
						name: t('settings.readingRenderer.name'),
						desc: t('settings.readingRenderer.desc'),
						control: { type: 'toggle', key: 'readingRenderer' },
					},
					{
						name: t('settings.renderMode.name'),
						desc: t('settings.renderMode.desc'),
						control: {
							type: 'dropdown',
							key: 'renderMode',
							options: {
								plugin: t('settings.renderMode.options.plugin'),
								native: t('settings.renderMode.options.native'),
							},
						},
					},
				],
			},
			{
				type: 'group',
				heading: t('settings.groups.menu'),
				items: [
					{
						name: t('settings.editorMenu.name'),
						desc: t('settings.editorMenu.desc'),
						control: { type: 'toggle', key: 'showColorMenuInEditorMenu' },
					},
					{
						name: t('settings.submenu.name'),
						desc: t('settings.submenu.desc'),
						control: { type: 'toggle', key: 'useSubmenu' },
					},
				],
			},
			{
				type: 'group',
				heading: t('settings.groups.colors'),
				items: [
					{
						name: t('settings.extendedColors.name'),
						desc: t('settings.extendedColors.desc'),
						control: { type: 'toggle', key: 'extendedColors' },
					},
					...colorItems,
				],
			},
			{
				type: 'group',
				heading: t('settings.groups.emojiMappings'),
				items: emojiMappingItems,
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		const settings = this.plugin.settings;

		if (key.startsWith(ENABLED_COLOR_KEY_PREFIX)) {
			const slot = key.slice(ENABLED_COLOR_KEY_PREFIX.length);
			if (!isColorSlotKey(slot)) {
				throw new Error(`Unknown color slot: ${slot}`);
			}
			settings.enabledColors[slot] = Boolean(value);
			if (!settings.enabledColors[slot] && settings.defaultColorSlot === slot) {
				settings.defaultColorSlot = 'none';
			}
			this.plugin.syncColorCommands();
			// Re-create mappings and the default-color dropdown so disabled colors
			// disappear from every settings surface immediately.
			await this.persistAndRefresh();
			this.update();
			return;
		}

		switch (key) {
			case 'enabled':
				settings.enabled = Boolean(value);
				await this.persistAndRefresh();
				return;
			case 'editorDecorator':
				settings.editorDecorator = Boolean(value);
				await this.persistAndRefresh();
				return;
			case 'showPrefixInSourceMode':
				settings.showPrefixInSourceMode = Boolean(value);
				await this.persistAndRefresh();
				return;
			case 'readingRenderer':
				settings.readingRenderer = Boolean(value);
				await this.persistAndRefresh();
				return;
			case 'showColorMenuInEditorMenu':
				settings.showColorMenuInEditorMenu = Boolean(value);
				await this.persist();
				return;
			case 'useSubmenu':
				settings.useSubmenu = Boolean(value);
				await this.persist();
				return;
			case 'colorOpacity':
				settings.colorOpacity = this.readNumber(value);
				this.syncStylePreview();
				this.plugin.refreshAppearance();
				this.debouncedPersistAppearance();
				return;
			case 'secondaryColorOpacity':
				settings.secondaryColorOpacity = this.readNumber(value);
				this.syncStylePreview();
				this.plugin.refreshAppearance();
				this.debouncedPersistAppearance();
				return;
			case 'highlightStyle':
				if (!isHighlightStyle(value)) {
					throw new Error(`Unknown highlight style: ${String(value)}`);
				}
				settings.highlightStyle = value;
				this.syncStylePreview();
				this.refreshDomState();
				await this.persistAndRefresh();
				return;
			case 'defaultColorSlot':
				if (!isDefaultColorSlot(value)) {
					throw new Error(`Unknown default color slot: ${String(value)}`);
				}
				settings.defaultColorSlot = value;
				await this.persistAndRefresh();
				return;
			case 'extendedColors':
				settings.extendedColors = Boolean(value);
				if (
					settings.defaultColorSlot !== 'none' &&
					!getActiveColorSlots(settings.extendedColors, settings.enabledColors).includes(settings.defaultColorSlot)
				) {
					settings.defaultColorSlot = 'none';
				}
			// Palette commands + reading view + editor decorations follow
			// the new slot set.
			this.plugin.syncColorCommands();
			// Re-creates the definitions: color pickers, emoji mappings,
			// and the default-color dropdown gain/lose the extended slots.
			await this.persistAndRefresh();
			this.update();
			return;
			case 'renderMode':
				if (!isRenderMode(value)) {
					throw new Error(`Unknown render mode: ${String(value)}`);
				}
				settings.renderMode = value;
				await this.persistAndRefreshAppearance();
				return;
			default:
				throw new Error(`Unknown setting key: ${key}`);
		}
	}

	private readNumber(value: unknown): number {
		const number = typeof value === 'number' ? value : Number(value);
		if (!Number.isFinite(number)) {
			throw new TypeError(`Expected a finite number, got ${String(value)}`);
		}
		return number;
	}

	private syncStylePreview(): void {
		const settings = this.plugin.settings;
		for (const previewEl of this.stylePreviewEls) {
			if (!previewEl.isConnected) {
				this.stylePreviewEls.delete(previewEl);
				continue;
			}
			previewEl.setAttribute('data-ch-preview-style', settings.highlightStyle);
			// Keep the sample in sync even when the settings view is rendered in a
			// container that does not inherit the plugin's body-level variables.
			previewEl.style.setProperty('--ch-highlight-opacity', `${settings.colorOpacity}%`);
			previewEl.style.setProperty('--ch-underline-opacity', `${settings.secondaryColorOpacity}%`);
		}
	}

	private updateMappingDesc(setting: Setting, slot: ColorSlotKey): void {
		setting.setDesc(
			t('settings.emojiMapping.desc', {
				emoji: parseEmojiAliases(this.plugin.settings.emojiMappings[slot])[0] ?? '∅',
			})
		);
	}

	/** Text inputs fire onChange per keystroke — persist once typing settles. */
	private debouncedPersistMappings(): void {
		if (this.mappingPersistTimer !== null) {
			window.clearTimeout(this.mappingPersistTimer);
		}
		this.mappingPersistTimer = window.setTimeout(() => {
			this.mappingPersistTimer = null;
			void this.persistAndRefresh();
		}, 500);
	}

	/** Sliders and color pickers fire per drag tick — persist once it settles. */
	private debouncedPersistAppearance(): void {
		if (this.appearancePersistTimer !== null) {
			window.clearTimeout(this.appearancePersistTimer);
		}
		this.appearancePersistTimer = window.setTimeout(() => {
			this.appearancePersistTimer = null;
			void this.persist();
		}, 500);
	}

	private async persist(): Promise<void> {
		await this.plugin.saveSettings();
	}

	private async persistAndRefresh(): Promise<void> {
		await this.plugin.saveSettings();
		this.plugin.refresh();
	}

	private async persistAndRefreshAppearance(): Promise<void> {
		await this.plugin.saveSettings();
		this.plugin.refreshAppearance();
	}
}
