import type { App } from 'obsidian';

/**
 * Returns every Obsidian document currently reachable by the plugin.
 *
 * Obsidian 1.13 can render Settings in a detached window. In that case
 * activeDocument points at the Settings window, while the editor remains in
 * the main document. Publishing appearance state to every reachable document
 * keeps detached Settings and workspace popouts synchronized.
 */
export function getAppDocuments(app?: App): Document[] {
	const documents = new Set<Document>();
	const add = (candidate: Document | null | undefined): void => {
		if (candidate?.documentElement && candidate.body) {
			documents.add(candidate);
		}
	};

	add(window.document);
	if (typeof activeDocument !== 'undefined') {
		add(activeDocument);
	}

	const workspace = app?.workspace;
	add(workspace?.containerEl?.ownerDocument);
	workspace?.iterateAllLeaves?.((leaf) => {
		add(leaf.view?.containerEl?.ownerDocument);
	});

	return Array.from(documents);
}
