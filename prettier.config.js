/** @type {import('prettier').Config} */
export default {
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100
};
