import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { gatewayFetch } from '$lib/server/gateway';
import { dev } from '$app/environment';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password || !username) {
			return fail(400, { error: 'Username, email, and password are required' });
		}

		try {
			await gatewayFetch(`/api/v1/auth/register`, {
				method: 'POST',
				body: JSON.stringify({ username, email, password })
			});

			const resp = await gatewayFetch(`/api/v1/auth/login`, {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});

			const accessToken = resp?.access_token;
			const refreshToken = resp?.refresh_token;
			if (!accessToken) throw new Error('No token returned');

			let user = resp?.user;
			if (!user) {
				try {
					user = await gatewayFetch(`/api/v1/auth/me`, { token: accessToken });
				} catch {}
			}

			const sessionData = {
				accessToken,
				refreshToken,
				user: user
					? {
							id: user.id,
							username: user.username,
							email: user.email,
							role: user.role || 'reader',
							avatar_url: user.avatar_url || ''
						}
					: undefined
			};

			const sessionStr = Buffer.from(JSON.stringify(sessionData)).toString('base64');
			cookies.set('novelhive_session', sessionStr, {
				path: '/',
				httpOnly: true,
				secure: !dev,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days (match refresh token lifetime)
			});

		} catch (err: any) {
			return fail(400, { error: err?.message || 'Registration failed' });
		}

		throw redirect(303, '/');
	}
} satisfies Actions;
