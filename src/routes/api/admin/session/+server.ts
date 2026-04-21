import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	adminSessionClearCookieHeader,
	adminSessionCookieHeader,
	createAdminSessionCookieValue,
	timingSafeComparePassword
} from '$lib/server/admin-session.js';

export const POST: RequestHandler = async ({ request }) => {
	let body: { password?: string };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON.');
	}

	const ok = timingSafeComparePassword(String(body.password ?? ''));
	if (!ok) {
		error(401, 'Invalid password.');
	}

	const value = createAdminSessionCookieValue();
	return json({ ok: true }, { headers: { 'Set-Cookie': adminSessionCookieHeader(value) } });
};

export const DELETE: RequestHandler = async () => {
	return json({ ok: true }, { headers: { 'Set-Cookie': adminSessionClearCookieHeader() } });
};
