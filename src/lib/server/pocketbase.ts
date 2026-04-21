import PocketBase from 'pocketbase';
import { getPocketBaseAdminEmail, getPocketBaseAdminPassword, getPocketBaseUrl } from './env.js';

let client: PocketBase | null = null;

/**
 * Server-side PocketBase client authenticated as admin for API routes.
 */
export function getAdminPocketBase(): PocketBase {
	if (client) return client;
	const pb = new PocketBase(getPocketBaseUrl());
	client = pb;
	return pb;
}

export async function ensureAdminAuth(): Promise<PocketBase> {
	const pb = getAdminPocketBase();
	if (!pb.authStore.isValid) {
		await pb.admins.authWithPassword(getPocketBaseAdminEmail(), getPocketBaseAdminPassword());
	}
	return pb;
}

export type PosterRecord = {
	id: string;
	title: string;
	description?: string;
	author_name?: string;
	tags?: string[];
	blob_url: string;
	blob_url_print?: string;
	thumbnail_url?: string;
	width?: number;
	height?: number;
	file_size?: number;
	download_count?: number;
	status: 'pending' | 'approved' | 'removed';
	moderated_by?: string;
	moderated_at?: string;
	moderation_reason?: string;
	created: string;
	updated: string;
};

export type PosterReportRecord = {
	id: string;
	poster: string;
	reason: string;
	details?: string;
	reporter_fingerprint?: string;
	status: 'open' | 'reviewed' | 'dismissed';
	reviewed_by?: string;
	reviewed_at?: string;
	created: string;
	updated: string;
};
