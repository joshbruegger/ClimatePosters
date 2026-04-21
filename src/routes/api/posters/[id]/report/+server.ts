import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ensureAdminAuth } from '$lib/server/pocketbase.js';
import { validateReportReason } from '$lib/utils/validators.js';

function fingerprintFromRequest(request: Request): string {
	const ua = request.headers.get('user-agent') ?? '';
	const lang = request.headers.get('accept-language') ?? '';
	const ip =
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		request.headers.get('x-real-ip') ??
		'';
	const raw = `${ip}|${ua}|${lang}`;
	let h = 0;
	for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
	return `fp_${(h >>> 0).toString(16)}`;
}

export const POST: RequestHandler = async ({ request, params }) => {
	let body: { reason?: string; details?: string };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON.');
	}

	const reasonErr = validateReportReason(String(body.reason ?? ''));
	if (reasonErr) error(400, reasonErr);

	const details =
		typeof body.details === 'string' && body.details.trim() !== ''
			? body.details.trim().slice(0, 2000)
			: undefined;

	const pb = await ensureAdminAuth();

	try {
		const poster = await pb.collection('posters').getOne(params.id);
		const status = (poster as { status?: string }).status;
		if (status !== 'approved') {
			error(400, 'This poster cannot be reported.');
		}

		await pb.collection('poster_reports').create({
			poster: params.id,
			reason: String(body.reason).trim(),
			details,
			reporter_fingerprint: fingerprintFromRequest(request),
			status: 'open'
		});

		return json({ ok: true });
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 400) {
			throw e;
		}
		console.error(e);
		error(500, 'Failed to submit report.');
	}
};
