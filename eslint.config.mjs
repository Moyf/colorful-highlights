import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";

const obsidianRules = Object.keys(obsidianmd.rules).reduce((acc, key) => {
	acc[`obsidianmd/${key}`] = "warn";
	return acc;
}, {});

export default [
	js.configs.recommended,
	{
		ignores: ["node_modules/**", "dist/**", "scripts/**", "*.js", "*.mjs"],
	},
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
				project: "./tsconfig.json",
			},
			globals: {
				navigator: "readonly",
				window: "readonly",
				document: "readonly",
				activeDocument: "readonly",
				activeWindow: "readonly",
				console: "readonly",
				process: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			obsidianmd,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...obsidianRules,
			"no-undef": "off",
			"no-unused-vars": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/no-explicit-any": "warn",
			"no-useless-escape": "error",
			"no-case-declarations": "error",
			"prefer-const": "error",
			"obsidianmd/ui/sentence-case": ["warn", { allowAutoFix: true }],
		},
	},
];
