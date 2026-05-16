import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { gatewayFetch } from '$lib/server/gateway';
import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

function googleClientId() {
	return (
		publicEnv.PUBLIC_GOOGLE_CLIENT_ID ||
		privateEnv.GOOGLE_CLIENT_ID ||
		privateEnv.GOOGLE_CLIENT_IDS?.split(',').map((id) => id.trim()).find(Boolean) ||
		''
	);
}

export const load: PageServerLoad = async () => {
	return {
		googleClientId: googleClientId()
	};
};

function buildSessionUser(user: any) {
	return user
		? {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role || 'reader',
				avatar_url: user.avatar_url || ''
			}
		: undefined;
}

function setSession(cookies: any, accessToken: string, refreshToken: string | undefined, user: any) {
	const sessionData = {
		accessToken,
		refreshToken,
		user: buildSessionUser(user)
	};

	const sessionStr = Buffer.from(JSON.stringify(sessionData)).toString('base64');
	cookies.set('novelhive_session', sessionStr, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7
	});
}

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		try {
			const resp = await gatewayFetch(`/api/v1/auth/login`, {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});
			console.log(resp);

			const accessToken = resp?.access_token;
			const refreshToken = resp?.refresh_token;
			if (!accessToken) throw new Error('No token returned');

			let user = resp?.user;
			if (!user) {
				try {
					user = await gatewayFetch(`/api/v1/auth/me`, { token: accessToken });
				} catch {}
			}
			setSession(cookies, accessToken, refreshToken, user);

		} catch (err: any) {
			return fail(401, { error: err?.message || 'Invalid email or password' });
		}

		throw redirect(303, '/');
	},
	google: async ({ request, cookies }) => {
		try {
			const data = await request.formData();
			const idToken = data.get('credential') || data.get('id_token');

			if (!idToken || typeof idToken !== 'string') {
				return fail(400, { error: 'Google credential is required' });
			}

			const resp = await gatewayFetch('/api/v1/auth/google', {
				method: 'POST',
				body: JSON.stringify({ id_token: idToken })
			});

			const accessToken = resp?.access_token;
			const refreshToken = resp?.refresh_token;
			if (!accessToken) throw new Error('No token returned');

			setSession(cookies, accessToken, refreshToken, resp?.user);
		} catch (err: any) {
			console.error('[auth/google/login] failed', err);
			return fail(401, { error: err?.message || 'Google sign in failed' });
		}

		throw redirect(303, '/');
	}
} satisfies Actions;
