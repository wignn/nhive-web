import type { PageServerLoad } from './$types';
import { gatewayFetch } from '$lib/server/gateway';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.token) throw redirect(303, '/login');

	try {
		const d = await gatewayFetch(`/api/v1/library`, { token: locals.token });
		const raw: any[] = Array.isArray(d) ? d : d?.entries ?? [];
		const normalized = raw.map((e) => ({ ...e, status: e.status ?? 'reading' }));
		let enriched = normalized;
		let coverBase: string = d?.cover_base_url ?? '';

		const needs = normalized.some((e) => !e.novel_title || !e.novel_slug);
		if (needs) {
			try {
				const r: any = await gatewayFetch(`/api/v1/novels?page=1&page_size=200&sort=updated`);
				if (!coverBase && r?.cover_base_url) {
					coverBase = r.cover_base_url;
				}
				const map = new Map<string, any>();
				(r.novels || []).forEach((n: any) => map.set(n.id, n));
				enriched = normalized.map((e) => {
					const n = map.get(e.novel_id);
					return n
						? {
								...e,
								novel_title: n.title,
								novel_slug: n.slug,
								total: n.total_chapters,
								cover_url: n.cover_url,
								author: n.author
							}
						: e;
				});
			} catch {}
		}

		const resolvecover = (path: string | undefined): string => {
			if (!path) return '';
			if (path.startsWith('http://') || path.startsWith('https://')) return path;
			const base = coverBase.replace(/\/$/, '');
			const rel = path.replace(/^\//, '');
			return base ? `${base}/${rel}` : path;
		};

		enriched = enriched.map((e) => ({
			...e,
			cover_url: resolvecover(e.cover_url)
		}));

		try {
			const progressPromises = enriched.map((e) =>
				gatewayFetch(`/api/v1/progress/${e.novel_id}`, { token: locals.token })
					.then((p) => ({ novel_id: e.novel_id, progress: p?.chapter_number || 0 }))
					.catch(() => ({ novel_id: e.novel_id, progress: 0 }))
			);

			const progressResults = await Promise.all(progressPromises);
			const progressMap = new Map(progressResults.map((p) => [p.novel_id, p.progress]));

			enriched = enriched.map((e) => ({
				...e,
				progress: progressMap.get(e.novel_id) || 0
			}));
		} catch {}

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