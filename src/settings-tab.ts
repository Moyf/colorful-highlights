import { App, PluginSettingTab, Setting } from 'obsidian';
import type ColorfulHighlightsPlugin from '../main';
import {
	COLOR_SLOTS,
	HIGHLIGHT_STYLES,
	type ColorSlotKey,
	type DefaultColorSlot,
	type HighlightStyle,
	type RenderMode,
} from './settings';
import { parseEmojiAliases } from './utils/emoji-utils';
import { createSettingsGroup } from './utils/settings-group';
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
	'gradient': 'settings.highlightStyle.options.gradient',
};

export class ColorfulHighlightsSettingTab extends PluginSettingTab {
	plugin: ColorfulHighlightsPlugin;
	icon = 'highlighter';

	private mappingPersistTimer: number | null = null;

	constructor(app: App, plugin: ColorfulHighlightsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.renderGeneralSection(containerEl);
		this.renderDecorationSection(containerEl);
		this.renderColorsSection(containerEl);
		this.renderEmojiMappingsSection(containerEl);
	}

	private renderGeneralSection(containerEl: HTMLElement): void {
		const group = createSettingsGroup(containerEl, t('settings.groups.general'));
		const settings = this.plugin.settings;

		group.addSetting((setting) => {
			setting
				.setName(t('settings.enabled.name'))
				.setDesc(t('settings.enabled.desc'))
				.addToggle((toggle) =>
					toggle.setValue(settings.enabled).onChange(async (value) => {
						settings.enabled = value;
						await this.persistAndRefresh();
					})
				);
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.highlightStyle.name'))
				.setDesc(t('settings.highlightStyle.desc'));

			// Live sample to the left of the dropdown; it reads the global
			// --ch-highlight-opacity var, so the intensity slider affects it.
			const previewEl = setting.controlEl.createSpan({
				cls: 'ch-style-preview-sample',
				text: t('settings.highlightStyle.preview'),
			});
			previewEl.setAttribute('data-ch-preview-style', settings.highlightStyle);

			setting.addDropdown((dropdown) => {
				for (const style of HIGHLIGHT_STYLES) {
					dropdown.addOption(style, t(STYLE_OPTION_KEYS[style]));
				}
				dropdown.setValue(settings.highlightStyle).onChange(async (value) => {
					settings.highlightStyle = value as HighlightStyle;
					previewEl.setAttribute('data-ch-preview-style', settings.highlightStyle);
					await this.persistAndRefresh();
				});
			});
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.renderMode.name'))
				.setDesc(t('settings.renderMode.desc'))
				.addDropdown((dropdown) => {
					dropdown
						.addOption('plugin', t('settings.renderMode.options.plugin'))
						.addOption('native', t('settings.renderMode.options.native'))
						.setValue(settings.renderMode)
						.onChange(async (value) => {
							settings.renderMode = value as RenderMode;
							await this.persistAndRefreshAppearance();
						});
				});
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.opacity.name'))
				.setDesc(t('settings.opacity.desc'))
				.addSlider((slider) =>
					slider
						.setLimits(10, 100, 5)
						.setValue(settings.colorOpacity)
						.setDynamicTooltip()
						.onChange(async (value) => {
							settings.colorOpacity = value;
							await this.persistAndRefresh();
						})
				);
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.defaultColor.name'))
				.setDesc(t('settings.defaultColor.desc'))
				.addDropdown((dropdown) => {
					dropdown.addOption('none', t('settings.defaultColor.none'));
					for (const slot of COLOR_SLOTS) {
						dropdown.addOption(slot, t(`colors.${slot}`));
					}
					dropdown.setValue(settings.defaultColorSlot).onChange(async (value) => {
						settings.defaultColorSlot = value as DefaultColorSlot;
						await this.persistAndRefresh();
					});
				});
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.editorMenu.name'))
				.setDesc(t('settings.editorMenu.desc'))
				.addToggle((toggle) =>
					toggle.setValue(settings.showColorMenuInEditorMenu).onChange(async (value) => {
						settings.showColorMenuInEditorMenu = value;
						await this.persist();
					})
				);
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.submenu.name'))
				.setDesc(t('settings.submenu.desc'))
				.addToggle((toggle) =>
					toggle.setValue(settings.useSubmenu).onChange(async (value) => {
						settings.useSubmenu = value;
						await this.persist();
					})
				);
		});
	}

	private renderDecorationSection(containerEl: HTMLElement): void {
		const group = createSettingsGroup(containerEl, t('settings.groups.decoration'));
		const settings = this.plugin.settings;

		group.addSetting((setting) => {
			setting
				.setName(t('settings.editorDecorator.name'))
				.setDesc(t('settings.editorDecorator.desc'))
				.addToggle((toggle) =>
					toggle.setValue(settings.editorDecorator).onChange(async (value) => {
						settings.editorDecorator = value;
						await this.persistAndRefresh();
					})
				);
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.showPrefixInSource.name'))
				.setDesc(t('settings.showPrefixInSource.desc'))
				.addToggle((toggle) =>
					toggle.setValue(settings.showPrefixInSourceMode).onChange(async (value) => {
						settings.showPrefixInSourceMode = value;
						await this.persistAndRefresh();
					})
				);
		});

		group.addSetting((setting) => {
			setting
				.setName(t('settings.readingRenderer.name'))
				.setDesc(t('settings.readingRenderer.desc'))
				.addToggle((toggle) =>
					toggle.setValue(settings.readingRenderer).onChange(async (value) => {
						settings.readingRenderer = value;
						await this.persistAndRefresh();
					})
				);
		});
	}

	private renderColorsSection(containerEl: HTMLElement): void {
		const group = createSettingsGroup(containerEl, t('settings.groups.colors'));
		const settings = this.plugin.settings;

		for (const slot of COLOR_SLOTS) {
			group.addSetting((setting) => {
				setting
					.setName(t(`colors.${slot}`))
					.setDesc(
						t('settings.colorSetting.desc', {
							emoji: parseEmojiAliases(settings.emojiMappings[slot])[0] ?? '∅',
						})
					)
					.addColorPicker((picker) =>
						picker.setValue(settings.customColors[slot]).onChange(async (value) => {
							settings.customColors[slot] = value;
							await this.persistAndRefresh();
						})
					);
			});
		}
	}

	private renderEmojiMappingsSection(containerEl: HTMLElement): void {
		const group = createSettingsGroup(containerEl, t('settings.groups.emojiMappings'));
		const settings = this.plugin.settings;

		group.addSetting((setting) => {
			setting.setDesc(t('settings.emojiMappingIntro'));
		});

		for (const slot of COLOR_SLOTS) {
			group.addSetting((setting) => {
				setting.setName(t(`colors.${slot}`));
				this.updateMappingDesc(setting, slot);
				setting.addText((text) =>
					text
						.setPlaceholder(t('settings.emojiMapping.placeholder'))
						.setValue(settings.emojiMappings[slot])
						.onChange((value) => {
							settings.emojiMappings[slot] = value;
							this.updateMappingDesc(setting, slot);
							this.debouncedPersistMappings();
						})
				);
			});
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
