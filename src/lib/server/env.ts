import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

function required(name: keyof typeof privateEnv): string {
	const v = privateEnv[name];
	if (!v || typeof v !== 'string') {
		throw new Error(`Missing required env: ${String(name)}`);
	}
	return v;
}

export function getPocketBaseUrl(): string {
	return required('POCKETBASE_URL').replace(/\/$/, '');
}

export function getPocketBaseAdminEmail(): string {
	return required('POCKETBASE_ADMIN_EMAIL');
}

export function getPocketBaseAdminPassword(): string {
	return required('POCKETBASE_ADMIN_PASSWORD');
}

export function getBlobReadWriteToken(): string {
	return required('BLOB_READ_WRITE_TOKEN');
}

export function getAdminModerationPassword(): string {
	return required('ADMIN_MODERATION_PASSWORD');
}

/** Optional long token for Authorization: Bearer (e.g. CI / API clients). */
export function getAdminApiBearerToken(): string | undefined {
	const t = privateEnv.ADMIN_API_BEARER_TOKEN;
	return typeof t === 'string' && t.length > 0 ? t : undefined;
}

export function getPublicSiteUrl(): string {
	const u = publicEnv.PUBLIC_SITE_URL;
	if (u && typeof u === 'string') return u.replace(/\/$/, '');
	return '';
}
