import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { gatewayFetch } from '$lib/server/gateway';
import type { Actions, PageServerLoad } from './$types';

function parseSession(raw: string | undefined) {
	if (!raw) return null;
	try {
		return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	return {
		user: locals.user
	};
};

export const actions = {
	default: async ({ request, cookies, locals }) => {
		if (!locals.token || !locals.user) {
			throw redirect(303, '/login');
		}

		const data = await request.formData();
		const image = data.get('image');
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { error: 'Choose an image first' });
		}

		try {
			const resp = await gatewayFetch('/api/v1/auth/avatar', {
				method: 'POST',
				token: locals.token,
				body: data
			});

			const sessionData = parseSession(cookies.get('novelhive_session')) ?? {};
			const updatedUser = {
				...(sessionData.user ?? locals.user),
				...(resp.user ?? {}),
				avatar_url: resp.avatar_url || resp.user?.avatar_url || ''
			};

			const updatedSession = {
				...sessionData,
				accessToken: sessionData.accessToken || locals.token,
				user: updatedUser
			};

			cookies.set('novelhive_session', Buffer.from(JSON.stringify(updatedSession)).toString('base64'), {
				path: '/',
				httpOnly: true,
				secure: !dev,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});

			return { success: true, user: updatedUser };
		} catch (err: any) {
			return fail(400, { error: err?.message || 'Upload failed' });
		}
	}
} satisfies Actions;
