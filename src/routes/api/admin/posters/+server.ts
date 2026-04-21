import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAdminAuthorized } from '$lib/server/admin-auth.js';
import { ensureAdminAuth } from '$lib/server/pocketbase.js';

const DEFAULT_LIMIT = 20;

export const GET: RequestHandler = async ({ request, url }) => {
	if (!isAdminAuthorized(request)) {
		error(401, 'Unauthorized.');
	}

	const status = url.searchParams.get('status') ?? 'approved';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const limit = Math.min(
		Math.max(1, Number(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT),
		50
	);

	let filter: string;
	if (status === 'all') {
		filter = '';
	} else if (status === 'pending' || status === 'approved' || status === 'removed') {
		filter = `status = '${status}'`;
	} else {
		error(400, 'Invalid status filter.');
	}

	const pb = await ensureAdminAuth();

	try {
		const result = await pb.collection('posters').getList(page, limit, {
			filter: filter || undefined,
			sort: '-created'
		});
		return json({
			posters: result.items,
			total: result.totalItems,
			page,
			hasMore: page * limit < result.totalItems
		});
	} catch (e) {
		console.error(e);
		error(500, 'Failed to load posters.');
	}
};

export const DELETE: RequestHandler = async ({ request, url }) => {
	if (!isAdminAuthorized(request)) {
		error(401, 'Unauthorized.');
	}

	const id = url.searchParams.get('id');
	if (!id?.trim()) {
		error(400, 'Query parameter id is required.');
	}

	const pb = await ensureAdminAuth();
	const adminEmail = pb.authStore.record?.email ?? 'admin';

	try {
		await pb.collection('posters').delete(id);
	} catch (e) {
		console.error(e);
		error(500, 'Failed to delete poster.');
	}

	return json({ ok: true, deleted: id, deleted_by: String(adminEmail) });
};
