import { describe, expect, it } from 'vitest';
import {
	buildSearchFilter,
	buildTagsFilter,
	combineAnd,
	escapeFilterValue,
	escapeRegexFragment,
	normalizeSort
} from './poster-query.js';

describe('poster-query', () => {
	it('escapeFilterValue escapes quotes and backslashes', () => {
		expect(escapeFilterValue("a'b")).toBe("a\\'b");
		expect(escapeFilterValue('x\\y')).toBe('x\\\\y');
	});

	it('escapeRegexFragment escapes regex metacharacters', () => {
		expect(escapeRegexFragment('a+b')).toBe('a\\+b');
	});

	it('buildSearchFilter returns null for empty search', () => {
		expect(buildSearchFilter(null)).toBeNull();
		expect(buildSearchFilter('   ')).toBeNull();
	});

	it('buildSearchFilter wraps title and description', () => {
		expect(buildSearchFilter('fire')).toBe("(title ~ 'fire' || description ~ 'fire')");
	});

	it('buildTagsFilter returns null for empty tags', () => {
		expect(buildTagsFilter([])).toBeNull();
	});

	it('buildTagsFilter ORs tag clauses', () => {
		expect(buildTagsFilter(['ocean'])).toBe(`(tags ~ '"ocean"')`);
	});

	it('combineAnd joins non-empty parts', () => {
		expect(combineAnd(["a = '1'", null, 'b = 2'])).toBe("a = '1' && b = 2");
	});

	it('normalizeSort defaults and maps', () => {
		expect(normalizeSort(null)).toBe('-created');
		expect(normalizeSort('created')).toBe('created');
		expect(normalizeSort('-download_count')).toBe('-download_count');
		expect(normalizeSort('invalid')).toBe('-created');
	});
});
