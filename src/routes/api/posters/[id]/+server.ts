import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ensureAdminAuth } from '$lib/server/pocketbase.js';

export const GET: RequestHandler = async ({ params }) => {
	const pb = await ensureAdminAuth();
	try {
		const record = await pb.collection('posters').getOne(params.id);
		if ((record as { status?: string }).status !== 'approved') {
			error(404, 'Poster not found.');
		}
		return json({ poster: record });
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		error(404, 'Poster not found.');
	}
};
