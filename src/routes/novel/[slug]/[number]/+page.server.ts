import type { PageServerLoad, Actions } from './$types';
import { gatewayFetch } from '$lib/server/gateway';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	const number = params.number;

	let chapter;
	try {
		chapter = await gatewayFetch(`/api/v1/novels/${slug}/chapters/${number}`);
	} catch (e) {
		throw error(404, 'Chapter not found');
	}

	let comments = [];
	if (chapter && chapter.id) {
		try {
			const c = await gatewayFetch(`/api/v1/chapters/${chapter.id}/comments`);
			comments = c.comments || [];
		} catch (e) {
			// ignore comment fetch error
		}
	}

	const content = String(chapter?.content || '');
	const paragraphs = content ? content.split(/\n\n+/) : [];
	
	return {
		chapter,
		comments,
		paragraphs
	};
};

export const actions: Actions = {
	postComment: async ({ request, locals }) => {
		if (!locals.token) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const chapterId = data.get('chapterId')?.toString();
		const content = data.get('content')?.toString();

		if (!chapterId || !content?.trim()) {
			return fail(400, { error: 'Missing content or chapter ID' });
		}

		try {
			await gatewayFetch(`/api/v1/chapters/${chapterId}/comments`, {
				method: 'POST',
				body: JSON.stringify({ content: content.trim() }),
				token: locals.token
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Failed to post comment' });
		}
	},
	saveProgress: async ({ request, locals, params }) => {
		if (!locals.token) return fail(401, { error: 'Unauthorized' });

		const data = await request.formData();
		const novelId = data.get('novelId')?.toString();
		const scrollPosition = parseInt(data.get('scrollPosition')?.toString() || '0');
		const chapterNumber = parseInt(params.number);

		if (!novelId || isNaN(scrollPosition) || isNaN(chapterNumber)) {
			return fail(400, { error: 'Missing parameters' });
		}

		try {
			await gatewayFetch(`/api/v1/progress/${novelId}`, {
				method: 'PUT',
				body: JSON.stringify({
					chapter_number: chapterNumber,
					scroll_position: scrollPosition
				}),
				token: locals.token
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message || 'Failed to save progress' });
		}
	}
};
