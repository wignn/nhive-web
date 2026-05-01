import type { PageServerLoad } from './$types';
import { gatewayFetch } from '$lib/server/gateway';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.token) throw redirect(303, '/login');

	try {
		const d = await gatewayFetch(`/api/v1/library`, { token: locals.token });
		const raw: any[] = Array.isArray(d) ? d : d?.entries ?? [];
		let enriched = raw.map((e) => ({ ...e, status: e.status ?? 'reading' }));
		let coverBase: string = d?.cover_base_url ?? '';

		const resolvecover = (path: string | undefined): string => {
			if (!path) return '';
			if (path.startsWith('http://') || path.startsWith('https://')) return path;
			const base = coverBase.replace(/\/$/, '');
			const rel = path.replace(/^\//, '');
			return base ? `${base}/${rel}` : path;
		};

		enriched = enriched.map((e) => ({ ...e, cover_url: resolvecover(e.cover_url) }));

		return { entries: enriched, coverBase };
	} catch (e) {
		return { entries: [], coverBase: '' };
	}
};

export const actions = {
	removeBookmark: async ({ request, locals }) => {
		if (!locals.token) return { success: false, error: 'Unauthorized' };
		const formData = await request.formData();
		const novelId = formData.get('novelId') as string;
		if (!novelId) return { success: false, error: 'Missing novel ID' };

		try {
			await gatewayFetch(`/api/v1/library/${novelId}`, {
				method: 'DELETE',
				token: locals.token
			});
			return { success: true, removedId: novelId };
		} catch (e: any) {
			return { success: false, error: e.message || 'Failed to remove' };
		}
	}
};