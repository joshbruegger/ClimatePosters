/**
 * PocketBase filter helpers for `posters` collection.
 */

export function escapeFilterValue(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Escape for PocketBase `~` (regex) substring search. */
export function escapeRegexFragment(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Build filter for title/description search (substring). */
export function buildSearchFilter(search: string | null): string | null {
	const q = search?.trim();
	if (!q) return null;
	const e = escapeFilterValue(escapeRegexFragment(q));
	return `(title ~ '${e}' || description ~ '${e}')`;
}

/** Tags stored as JSON array; substring match on quoted tag in serialized JSON. */
export function buildTagsFilter(tags: string[]): string | null {
	if (!tags.length) return null;
	const parts = tags.map((t) => {
		const needle = `"${t}"`;
		return `tags ~ '${escapeFilterValue(needle)}'`;
	});
	return `(${parts.join(' || ')})`;
}

export function combineAnd(parts: (string | null | undefined)[]): string {
	const flat = parts.filter((p): p is string => !!p && p.length > 0);
	if (!flat.length) return '';
	return flat.join(' && ');
}

const SORT_MAP = {
	'-created': '-created',
	created: 'created',
	'-download_count': '-download_count'
} as const;

export type SortKey = keyof typeof SORT_MAP;

export function normalizeSort(sort: string | null): string {
	if (!sort || !(sort in SORT_MAP)) return '-created';
	return SORT_MAP[sort as SortKey];
}
