import { json, error } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';
import { uploadPublicBlob } from '$lib/server/blob.js';
import { ensureAdminAuth } from '$lib/server/pocketbase.js';
import {
	buildSearchFilter,
	buildTagsFilter,
	combineAnd,
	normalizeSort
} from '$lib/server/poster-query.js';
import {
	parseTagsJson,
	validateAuthorName,
	validateImageFile,
	validatePosterTitle
} from '$lib/utils/validators.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export const GET: RequestHandler = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const limitRaw = Number(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT;
	const limit = Math.min(Math.max(1, limitRaw), MAX_LIMIT);
	const search = url.searchParams.get('search');
	const sort = normalizeSort(url.searchParams.get('sort'));
	const tagsParam = url.searchParams.get('tags');
	const tagList =
		tagsParam
			?.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean) ?? [];

	const pb = await ensureAdminAuth();

	const statusFilter = `status = 'approved'`;
	const searchF = buildSearchFilter(search);
	const tagsF = buildTagsFilter(tagList);
	const filter = combineAnd([statusFilter, searchF, tagsF]);

	try {
		const result = await pb.collection('posters').getList(page, limit, {
			filter: filter || undefined,
			sort
		});
		const hasMore = page * limit < result.totalItems;
		return json({
			posters: result.items,
			total: result.totalItems,
			page,
			hasMore
		});
	} catch (e) {
		console.error(e);
		error(500, 'Failed to load posters.');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const ct = request.headers.get('content-type') ?? '';
	if (!ct.includes('multipart/form-data')) {
		error(400, 'Expected multipart/form-data.');
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		error(400, 'Invalid form data.');
	}

	const file = form.get('image');
	if (!(file instanceof File)) {
		error(400, 'Image file is required.');
	}

	const title = String(form.get('title') ?? '');
	const description = String(form.get('description') ?? '').trim() || undefined;
	const authorName = String(form.get('author_name') ?? '').trim() || undefined;
	const tagsRaw = String(form.get('tags') ?? '[]');

	const titleErr = validatePosterTitle(title);
	if (titleErr) error(400, titleErr);

	const authorErr = validateAuthorName(authorName);
	if (authorErr) error(400, authorErr);

	const tagsParsed = parseTagsJson(tagsRaw);
	if (typeof tagsParsed === 'string') error(400, tagsParsed);

	const imgErr = validateImageFile(file);
	if (imgErr) error(400, imgErr);

	const buf = Buffer.from(await file.arrayBuffer());
	let width: number | undefined;
	let height: number | undefined;
	let thumbBuf: Buffer | undefined;

	try {
		const meta = await sharp(buf).metadata();
		width = meta.width;
		height = meta.height;
		thumbBuf = await sharp(buf)
			.resize(480, 480, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 82 })
			.toBuffer();
	} catch {
		error(400, 'Could not process image.');
	}

	const ext =
		file.type === 'image/png'
			? 'png'
			: file.type === 'image/webp'
				? 'webp'
				: 'jpg';
	const idPart = crypto.randomUUID();
	const mainName = `posters/${idPart}.${ext}`;
	const thumbName = `posters/${idPart}-thumb.webp`;

	const pb = await ensureAdminAuth();

	try {
		const mainBlob = await uploadPublicBlob(buf, {
			filename: mainName,
			contentType: file.type
		});
		const thumbBlob = thumbBuf
			? await uploadPublicBlob(thumbBuf, {
					filename: thumbName,
					contentType: 'image/webp'
				})
			: null;

		const payload: Record<string, unknown> = {
			title: title.trim(),
			description,
			author_name: authorName,
			tags: tagsParsed,
			blob_url: mainBlob.url,
			width,
			height,
			file_size: file.size,
			download_count: 0,
			status: 'pending'
		};
		if (thumbBlob?.url) payload.thumbnail_url = thumbBlob.url;

		const record = await pb.collection('posters').create(payload);

		return json({ ok: true, id: record.id });
	} catch (e) {
		console.error(e);
		error(500, 'Failed to save poster.');
	}
};
