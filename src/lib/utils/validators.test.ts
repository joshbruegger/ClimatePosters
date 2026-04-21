import { describe, expect, it } from 'vitest';
import {
	parseTagsJson,
	validateAuthorName,
	validateImageFile,
	validatePosterTitle,
	validateReportReason
} from './validators.js';

describe('validators', () => {
	it('validatePosterTitle', () => {
		expect(validatePosterTitle('')).toBeTruthy();
		expect(validatePosterTitle('  ')).toBeTruthy();
		expect(validatePosterTitle('Ok')).toBeNull();
	});

	it('validateAuthorName', () => {
		expect(validateAuthorName(undefined)).toBeNull();
		expect(validateAuthorName('')).toBeNull();
		expect(validateAuthorName('a'.repeat(101))).toBeTruthy();
	});

	it('parseTagsJson', () => {
		expect(parseTagsJson(undefined)).toEqual([]);
		expect(parseTagsJson('[]')).toEqual([]);
		expect(parseTagsJson('["A","b"]')).toEqual(['a', 'b']);
		expect(typeof parseTagsJson('{}')).toBe('string');
	});

	it('validateReportReason', () => {
		expect(validateReportReason('')).toBeTruthy();
		expect(validateReportReason('spam')).toBeNull();
	});

	it('validateImageFile', () => {
		const ok = new File([], 'x.png', { type: 'image/png' });
		Object.defineProperty(ok, 'size', { value: 1000 });
		expect(validateImageFile(ok)).toBeNull();

		const badType = new File([], 'x.gif', { type: 'image/gif' });
		expect(validateImageFile(badType)).toBeTruthy();
	});
});
