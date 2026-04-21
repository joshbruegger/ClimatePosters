import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ensureAdminAuth } from '$lib/server/pocketbase.js';

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id;
	const variant = url.searchParams.get('variant') === 'print' ? 'print' : 'web';

	const pb = await ensureAdminAuth();

	let record: {
		blob_url: string;
		blob_url_print?: string;
		download_count?: number;
		status?: string;
	};
	try {
		record = await pb.collection('posters').getOne(id);
	} catch {
		error(404, 'Poster not found.');
	}

	if (record.status !== 'approved') {
		error(404, 'Poster not found.');
	}

	const target =
		variant === 'print' && record.blob_url_print ? record.blob_url_print : record.blob_url;

	if (!target) {
		error(404, 'Asset not available.');
	}

	const current = typeof record.download_count === 'number' ? record.download_count : 0;
	try {
		await pb.collection('posters').update(id, { download_count: current + 1 });
	} catch (e) {
		console.error(e);
		// still redirect; counter is best-effort
	}

	redirect(302, target);
};
