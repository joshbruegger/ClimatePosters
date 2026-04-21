import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAdminApiBearerToken } from '$lib/server/env.js';
import { ensureAdminAuth } from '$lib/server/pocketbase.js';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionCookieValue } from '$lib/server/admin-session.js';

function isAuthorized(request: Request): boolean {
	const bearer = getAdminApiBearerToken();
	const auth = request.headers.get('authorization');
	if (bearer && auth === `Bearer ${bearer}`) return true;

	const cookie = request.headers.get('cookie');
	if (!cookie) return false;
	const m = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE_NAME}=([^;]+)`));
	const raw = m?.[1] ? decodeURIComponent(m[1]) : undefined;
	return verifyAdminSessionCookieValue(raw);
}

const DEFAULT_LIMIT = 20;

export const GET: RequestHandler = async ({ request, url }) => {
	if (!isAuthorized(request)) {
		error(401, 'Unauthorized.');
	}

	const status = url.searchParams.get('status') ?? 'pending';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const limit = Math.min(Math.max(1, Number(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT), 50);

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
