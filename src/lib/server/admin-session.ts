import { createHmac, timingSafeEqual } from 'node:crypto';
import { getAdminModerationPassword } from './env.js';

const COOKIE = 'cp_admin_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
	return getAdminModerationPassword();
}

function sign(payload: string): string {
	return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createAdminSessionCookieValue(): string {
	const exp = Date.now() + MAX_AGE_SEC * 1000;
	const body = `${exp}`;
	const sig = sign(body);
	return `${body}.${sig}`;
}

export function verifyAdminSessionCookieValue(value: string | undefined): boolean {
	if (!value || typeof value !== 'string') return false;
	const parts = value.split('.');
	if (parts.length !== 2) return false;
	const [body, sig] = parts;
	const exp = Number(body);
	if (!Number.isFinite(exp) || exp < Date.now()) return false;
	const expected = sign(body);
	try {
		const a = Buffer.from(sig);
		const b = Buffer.from(expected);
		return a.length === b.length && timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

export function adminSessionCookieHeader(value: string): string {
	return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${import.meta.env.PROD ? '; Secure' : ''}`;
}

export function adminSessionClearCookieHeader(): string {
	return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${import.meta.env.PROD ? '; Secure' : ''}`;
}

export { COOKIE as ADMIN_SESSION_COOKIE_NAME };

export function timingSafeComparePassword(input: string): boolean {
	try {
		const expected = Buffer.from(secret(), 'utf8');
		const actual = Buffer.from(input, 'utf8');
		if (expected.length !== actual.length) return false;
		return timingSafeEqual(expected, actual);
	} catch {
		return false;
	}
}
