import { getLanguage } from 'obsidian';
import type { BaseMessage } from './types';
import en from './locales/en';
import zhCn from './locales/zh-cn';

let current: BaseMessage = en;

/**
 * Select the active locale from Obsidian's language setting.
 * Must run before commands and the settings tab are registered.
 */
export function initI18n(): void {
	const lang = getLanguage();
	current = lang.startsWith('zh') ? zhCn : en;
}

function lookup(path: string, messages: BaseMessage): string | undefined {
	const parts = path.split('.');
	let node: unknown = messages;
	for (const part of parts) {
		if (node === null || typeof node !== 'object') {
			return undefined;
		}
		node = (node as Record<string, unknown>)[part];
	}
	return typeof node === 'string' ? node : undefined;
}

/**
 * Translate a dot-separated message key, with `{{var}}` interpolation.
 * Falls back to English, then to the raw key.
 */
export function t(path: string, vars?: Record<string, string>): string {
	let text = lookup(path, current) ?? lookup(path, en) ?? path;
	if (vars) {
		for (const [key, value] of Object.entries(vars)) {
			text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
		}
	}
	return text;
}
