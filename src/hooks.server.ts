import type { Handle } from '@sveltejs/kit';
import { gatewayFetch } from '$lib/server/gateway';

function applyCacheHeaders(response: Response, pathname: string): Response {

	if (pathname.startsWith('/_app/immutable/')) {
		response.headers.set('cache-control', 'public, max-age=31536000, immutable');
		return response;
	}

	if (/\.(?:css|js|mjs|map|svg|png|jpe?g|webp|avif|ico|woff2?)$/i.test(pathname) && response.headers.get('cache-control') == null) {
		response.headers.set('cache-control', 'public, max-age=86400');
	}

	return response;
}

function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
		return payload.exp * 1000 < Date.now() + 60_000;
	} catch {
		return true;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionStr = event.cookies.get('novelhive_session');
	
	if (sessionStr) {
		try {
			const sessionData = JSON.parse(Buffer.from(sessionStr, 'base64').toString('utf-8'));
			
			if (sessionData.user && (sessionData.accessToken || sessionData.token)) {
				let accessToken = sessionData.accessToken || sessionData.token;
				let refreshToken = sessionData.refreshToken;
				let needsCookieUpdate = false;

				if (isTokenExpired(accessToken)) {
					if (refreshToken && !isTokenExpired(refreshToken)) {
						try {
							// Refresh the tokens
							const refreshResp = await gatewayFetch('/api/v1/auth/refresh', {
								method: 'POST',
								body: JSON.stringify({ refresh_token: refreshToken })
							});

							if (refreshResp?.access_token && refreshResp?.refresh_token) {
								accessToken = refreshResp.access_token;
								refreshToken = refreshResp.refresh_token;
								needsCookieUpdate = true;
							}
						} catch {
							// Refresh failed — clear session, user must re-login
							event.cookies.delete('novelhive_session', { path: '/' });
							return applyCacheHeaders(await resolve(event), event.url.pathname);
						}
					} else {
						// Refresh token also expired — clear session
						event.cookies.delete('novelhive_session', { path: '/' });
						return applyCacheHeaders(await resolve(event), event.url.pathname);
					}
				}

				event.locals.user = sessionData.user;
				event.locals.token = accessToken;

				// Update cookie with refreshed tokens
				if (needsCookieUpdate) {
					const { dev } = await import('$app/environment');
					const updatedSession = {
						accessToken,
						refreshToken,
						user: sessionData.user
					};
					const updatedStr = Buffer.from(JSON.stringify(updatedSession)).toString('base64');
					event.cookies.set('novelhive_session', updatedStr, {
						path: '/',
						httpOnly: true,
						secure: !dev,
						sameSite: 'lax',
						maxAge: 60 * 60 * 24 * 7 // 7 days (match refresh token)
					});
				}
			}
		} catch (e) {
			// invalid session
			event.cookies.delete('novelhive_session', { path: '/' });
		}
	}

	return applyCacheHeaders(await resolve(event), event.url.pathname);
};
