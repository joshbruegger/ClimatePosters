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

export const PATCH: RequestHandler = async ({ request, params }) => {
	if (!isAuthorized(request)) {
		error(401, 'Unauthorized.');
	}

	let body: { action?: string; reason?: string };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON.');
	}

	const action = body.action;
	if (action !== 'approve' && action !== 'remove') {
		error(400, 'action must be "approve" or "remove".');
	}

	const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
	const pb = await ensureAdminAuth();
	const adminEmail = pb.authStore.record?.email ?? 'admin';

	let nextStatus: 'approved' | 'removed';
	if (action === 'approve') nextStatus = 'approved';
	else nextStatus = 'removed';

	let existing: { status?: string };
	try {
		existing = await pb.collection('posters').getOne(params.id);
	} catch {
		error(404, 'Poster not found.');
	}

	const current = existing.status;

	if (action === 'approve' && current !== 'pending') {
		error(400, 'Only pending posters can be approved.');
	}
	if (action === 'remove' && current !== 'approved') {
		error(400, 'Only approved posters can be removed.');
	}

	try {
		await pb.collection('posters').update(params.id, {
			status: nextStatus,
			moderated_by: String(adminEmail),
			moderated_at: new Date().toISOString(),
			moderation_reason: reason || undefined
		});
	} catch (e) {
		console.error(e);
		error(500, 'Failed to moderate poster.');
	}

	return json({ ok: true });
};
