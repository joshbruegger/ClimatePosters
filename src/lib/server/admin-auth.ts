import { getAdminApiBearerToken } from './env.js';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionCookieValue } from './admin-session.js';

/** Admin UI session cookie or optional Bearer token for API tools. */
export function isAdminAuthorized(request: Request): boolean {
	const bearer = getAdminApiBearerToken();
	const auth = request.headers.get('authorization');
	if (bearer && auth === `Bearer ${bearer}`) return true;

	const cookie = request.headers.get('cookie');
	if (!cookie) return false;
	const m = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE_NAME}=([^;]+)`));
	const raw = m?.[1] ? decodeURIComponent(m[1]) : undefined;
	return verifyAdminSessionCookieValue(raw);
}
