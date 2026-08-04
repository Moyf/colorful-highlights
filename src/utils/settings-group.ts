/**
 * SettingGroup compatibility helper.
 *
 * `SettingGroup` requires Obsidian 1.11.0+. On older versions this falls
 * back to a manual heading + plain Setting rows, so the settings tab keeps
 * working down to the plugin's minAppVersion.
 */

import { requireApiVersion, Setting } from 'obsidian';
import * as ObsidianModule from 'obsidian';

export interface SettingsContainer {
	addSetting(cb: (setting: Setting) => void): void;
}

interface SettingGroupInstance {
	setHeading(heading: string): SettingGroupInstance;
	addSetting(cb: (setting: Setting) => void): void;
}

export function createSettingsGroup(
	containerEl: HTMLElement,
	heading?: string
): SettingsContainer {
	if (requireApiVersion('1.11.0')) {
		const SettingGroupClass = (
			ObsidianModule as unknown as {
				SettingGroup?: new (containerEl: HTMLElement) => SettingGroupInstance;
			}
		).SettingGroup;

		if (SettingGroupClass) {
			let group = new SettingGroupClass(containerEl);
			if (heading) {
				group = group.setHeading(heading);
			}
			return {
				addSetting(cb: (setting: Setting) => void) {
					group.addSetting(cb);
				},
			};
		}
	}

	// Fallback: API < 1.11.0
	if (heading) {
		const headingEl = containerEl.createDiv('setting-group-heading');
		headingEl.createEl('h3', { text: heading });
	}
	return {
		addSetting(cb: (setting: Setting) => void) {
			cb(new Setting(containerEl));
		},
	};
}
