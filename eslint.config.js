import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default tseslint.config(
	js.configs.recommended,
	eslintConfigPrettier,
	{
		ignores: [
			'**/.svelte-kit/**',
			'**/build/**',
			'**/node_modules/**',
			'**/dist/**',
			'**/coverage/**',
			'**/.vercel/**',
			'**/.output/**',
			'**/.agents/**'
		]
	},
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		ignores: ['**/*.svelte'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
		languageOptions: {
			globals: {
				...globals.browser
			},
			parserOptions: {
				parser: tsParser,
				svelteConfig,
				extraFileExtensions: ['.svelte']
			}
		}
	}
);
