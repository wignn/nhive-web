import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.token || locals.user?.role !== 'admin') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const fd = await request.formData();
		const image = fd.get('image') as File;
		if (!image) return json({ error: 'No image provided' }, { status: 400 });

		const gatewayUrl = env.NOVELHIVE_GATEWAY_URL || 'http://localhost:8080';
		const gatewayApiKey = env.NOVELHIVE_GATEWAY_API_KEY || env.NOVELHIVE_INTERNAL_API_KEY;
		if (!gatewayApiKey) return json({ error: 'NOVELHIVE_GATEWAY_API_KEY is not set' }, { status: 500 });

		const body = new FormData();
		body.append('image', image);

		const res = await fetch(`${gatewayUrl}/api/v1/admin/upload`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${locals.token}`,
				'X-API-Key': gatewayApiKey
			},
			body: body
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(text || 'Upload failed');
		}

		const data = await res.json();
		const baseUrl = (data.base_url || '').replace(/\/$/, '');
		const path = (data.path || '').replace(/^\//, '');
		const url = baseUrl && path ? `${baseUrl}/${path}` : path;
		return json({ path: data.path, url });
	} catch (e: any) {
		return json({ error: e.message || 'Upload failed' }, { status: 500 });
	}
};
