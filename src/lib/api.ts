const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://novels.wign.cloud';

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const body = await res.json().catch(() => null);
    console.log(body);
    clearTimeout(timeout);
    if (!res.ok) {
      const err = body || { error: `HTTP ${res.status}` };
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return body;
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw e;
  }
}

export const api = {
  // Auth
  register: (data: { username: string; email: string; password: string }) =>
    apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: (token: string) => apiFetch('/api/v1/auth/me', {}, token),

  // Novels
  listNovels: (params?: string) => apiFetch(`/api/v1/novels${params ? `?${params}` : ''}`),
  getNovel: (slug: string) => apiFetch(`/api/v1/novels/${slug}`),
  listChapters: (slug: string) => apiFetch(`/api/v1/novels/${slug}/chapters`),
  readChapter: (slug: string, num: number) => apiFetch(`/api/v1/novels/${slug}/chapters/${num}`),

  // Search
  search: (q: string) => apiFetch(`/api/v1/search?q=${encodeURIComponent(q)}`),
  autocomplete: (q: string) => apiFetch(`/api/v1/search/autocomplete?q=${encodeURIComponent(q)}`),

  // Comments
  listComments: (chapterId: string) => apiFetch(`/api/v1/chapters/${chapterId}/comments`),
  createComment: (chapterId: string, content: string, token: string) =>
    apiFetch(`/api/v1/chapters/${chapterId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }, token),

  // Library
  getLibrary: (token: string) => apiFetch('/api/v1/library', {}, token),
  addToLibrary: (novelId: string, token: string) =>
    apiFetch(`/api/v1/library/${novelId}`, { method: 'POST' }, token),
  removeFromLibrary: (novelId: string, token: string) =>
    apiFetch(`/api/v1/library/${novelId}`, { method: 'DELETE' }, token),

  saveProgress: (novelId: string, data: { chapter_number: number; scroll_position: number }, token: string) =>
    apiFetch(`/api/v1/progress/${novelId}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  // Genres
  listGenres: () => apiFetch('/api/v1/genres'),

  // Admin
  admin: {
    uploadImage: (formData: FormData, token: string) => {
      return fetch(`${API_URL}/api/v1/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    },
    listNovels: (token: string) => apiFetch('/api/v1/admin/novels', {}, token),
    createNovel: (data: Record<string, unknown>, token: string) =>
      apiFetch('/api/v1/admin/novels', { method: 'POST', body: JSON.stringify(data) }, token),
    updateNovel: (id: string, data: Record<string, unknown>, token: string) =>
      apiFetch(`/api/v1/admin/novels/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    deleteNovel: (id: string, token: string) =>
      apiFetch(`/api/v1/admin/novels/${id}`, { method: 'DELETE' }, token),
    listChapters: (token: string) => apiFetch('/api/v1/admin/chapters', {}, token),
    createChapter: (data: Record<string, unknown>, token: string) =>
      apiFetch('/api/v1/admin/chapters', { method: 'POST', body: JSON.stringify(data) }, token),
    updateChapter: (id: string, data: Record<string, unknown>, token: string) =>
      apiFetch(`/api/v1/admin/chapters/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    deleteChapter: (id: string, token: string) =>
      apiFetch(`/api/v1/admin/chapters/${id}`, { method: 'DELETE' }, token),
    listUsers: (token: string) => apiFetch('/api/v1/admin/users', {}, token),
    updateUserRole: (id: string, role: string, token: string) =>
      apiFetch(`/api/v1/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }, token),
  },
};