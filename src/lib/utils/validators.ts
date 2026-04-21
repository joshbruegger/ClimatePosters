const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const MAX_BYTES = 20 * 1024 * 1024; // 20MB
const TITLE_MAX = 255;
const AUTHOR_MAX = 100;

export const POSTER_ALLOWED_TYPES = ALLOWED_MIME;
export const POSTER_MAX_BYTES = MAX_BYTES;

export function validateImageFile(file: File): string | null {
	if (!ALLOWED_MIME.has(file.type)) {
		return 'File must be PNG, JPG, JPEG, or WebP.';
	}
	if (file.size > MAX_BYTES) {
		return 'File must be 20MB or smaller.';
	}
	return null;
}

export function parseTagsJson(raw: string | undefined): string[] | string {
	if (!raw || raw.trim() === '') return [];
	try {
		const v = JSON.parse(raw) as unknown;
		if (!Array.isArray(v)) return 'Tags must be a JSON array.';
		const tags: string[] = [];
		for (const item of v) {
			if (typeof item !== 'string' || item.trim() === '') {
				return 'Each tag must be a non-empty string.';
			}
			if (item.length > 64) return 'Each tag must be 64 characters or fewer.';
			tags.push(item.trim().toLowerCase());
		}
		return [...new Set(tags)];
	} catch {
		return 'Invalid tags JSON.';
	}
}

export function validatePosterTitle(title: string): string | null {
	const t = title.trim();
	if (!t) return 'Title is required.';
	if (t.length > TITLE_MAX) return `Title must be at most ${TITLE_MAX} characters.`;
	return null;
}

export function validateAuthorName(name: string | undefined): string | null {
	if (!name || name.trim() === '') return null;
	if (name.length > AUTHOR_MAX) return `Author name must be at most ${AUTHOR_MAX} characters.`;
	return null;
}

export function validateReportReason(reason: string): string | null {
	const r = reason.trim();
	if (!r) return 'Reason is required.';
	if (r.length > 500) return 'Reason must be 500 characters or fewer.';
	return null;
}
