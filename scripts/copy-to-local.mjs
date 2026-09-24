import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

/**
 * Locate the Obsidian vault path (in priority order):
 *  1. VAULT_PATH / OBSIDIAN_VAULT_PATH from the process environment
 *  2. VAULT_PATH / OBSIDIAN_VAULT_PATH from the first .env found walking
 *     up from this repo (a shared ~/Codes/.env gives every plugin the
 *     same vault path without per-repo config)
 * The vault must exist and contain an `.obsidian` directory.
 */
function resolveVaultPath() {
	const keys = ['VAULT_PATH', 'OBSIDIAN_VAULT_PATH'];
	for (const key of keys) {
		const value = process.env[key];
		if (value) return resolve(value.trim());
	}
	let dir = repoRoot;
	while (true) {
		const envFile = join(dir, '.env');
		if (existsSync(envFile)) {
			for (const line of readFileSync(envFile, 'utf-8').split(/\r?\n/)) {
				const match = line.match(/^\s*(?:export\s+)?(VAULT_PATH|OBSIDIAN_VAULT_PATH)\s*=\s*(.+?)\s*$/);
				if (match) {
					// strip surrounding quotes if present
					const value = match[2].replace(/^["']|["']$/g, '');
					if (value) return resolve(value);
				}
			}
		}
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	throw new Error(
		'Vault path not found. Set VAULT_PATH in the environment or in a .env file (repo root or any parent directory, e.g. ~/Codes/.env).'
	);
}

const vaultPath = resolveVaultPath();
if (!existsSync(vaultPath) || !existsSync(join(vaultPath, '.obsidian'))) {
	throw new Error(`VAULT_PATH is not an Obsidian vault: ${vaultPath}`);
}

// 从仓库根目录的 manifest 读取插件 ID
const pluginId = JSON.parse(readFileSync(join(repoRoot, 'manifest.json'), 'utf-8')).id;
const localPluginPath = join(vaultPath, '.obsidian', 'plugins', pluginId);

mkdirSync(localPluginPath, { recursive: true });

// 拷贝必要文件（从 dist/）
const filesToCopy = ['main.js', 'manifest.json', 'styles.css'];
for (const file of filesToCopy) {
	const src = join(repoRoot, 'dist', file);
	if (existsSync(src)) {
		copyFileSync(src, join(localPluginPath, file));
		console.log(`✓ Copied ${file}`);
	} else if (file !== 'styles.css') {
		console.warn(`⚠ Warning: ${file} not found in dist/`);
	}
}

// 创建 .hotreload 文件（如果不存在），触发 Hot Reload 插件自动重载
const hotreloadPath = join(localPluginPath, '.hotreload');
if (!existsSync(hotreloadPath)) {
	writeFileSync(hotreloadPath, '');
	console.log('✓ Created .hotreload file');
}

console.log(`\n✅ Build and copy completed for plugin: ${pluginId}`);
console.log(`📁 Target: ${localPluginPath}`);
