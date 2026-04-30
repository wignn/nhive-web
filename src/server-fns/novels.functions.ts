import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gatewayFetch } from "./gateway.server";
import { getSession } from "./session";

export const listNovels = createServerFn({ method: "GET" })
  .inputValidator((input: { query?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const qs = data.query ? `?${data.query}` : "";
    return gatewayFetch(`/api/v1/novels${qs}`);
  });

export const getNovel = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => gatewayFetch(`/api/v1/novels/${data.slug}`));

export const listChapters = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) =>
    gatewayFetch(`/api/v1/novels/${data.slug}/chapters`),
  );

export const readChapter = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string; number: number }) =>
    z
      .object({ slug: z.string().min(1).max(200), number: z.number().int().min(1) })
      .parse(input),
  )
  .handler(async ({ data }) =>
    gatewayFetch(`/api/v1/novels/${data.slug}/chapters/${data.number}`),
  );

export const searchNovels = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) =>
    z.object({ q: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) =>
    gatewayFetch(`/api/v1/search?q=${encodeURIComponent(data.q)}`),
  );

export const autocompleteNovels = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) =>
    z.object({ q: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) =>
    gatewayFetch(`/api/v1/search/autocomplete?q=${encodeURIComponent(data.q)}`),
  );

export const listChapterComments = createServerFn({ method: "GET" })
  .inputValidator((input: { chapterId: string }) =>
    z.object({ chapterId: z.string().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data }) =>
    gatewayFetch(`/api/v1/chapters/${data.chapterId}/comments`),
  );

// ---------- Authenticated endpoints ----------

async function requireToken() {
  const s = await getSession();
  if (!s.data.token) throw new Error("Not authenticated");
  return s.data.token;
}

export const postComment = createServerFn({ method: "POST" })
  .inputValidator((input: { chapterId: string; content: string }) =>
    z
      .object({
        chapterId: z.string().min(1).max(100),
        content: z.string().min(1).max(5000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const token = await requireToken();
    return gatewayFetch(`/api/v1/chapters/${data.chapterId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: data.content }),
      token,
    });
  });

export const getLibrary = createServerFn({ method: "GET" }).handler(async () => {
  const token = await requireToken();
  return gatewayFetch(`/api/v1/library`, { token });
});

export const addToLibrary = createServerFn({ method: "POST" })
  .inputValidator((input: { novelId: string }) =>
    z.object({ novelId: z.string().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data }) => {
    const token = await requireToken();
    return gatewayFetch(`/api/v1/library/${data.novelId}`, {
      method: "POST",
      token,
    });
  });

export const removeFromLibrary = createServerFn({ method: "POST" })
  .inputValidator((input: { novelId: string }) =>
    z.object({ novelId: z.string().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data }) => {
    const token = await requireToken();
    return gatewayFetch(`/api/v1/library/${data.novelId}`, {
      method: "DELETE",
      token,
    });
  });

export const saveProgress = createServerFn({ method: "POST" })
  .inputValidator((input: { novelId: string; chapterNumber: number; scrollPosition: number }) =>
    z
      .object({
        novelId: z.string().min(1).max(100),
        chapterNumber: z.number().int().min(1),
        scrollPosition: z.number().min(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const token = await requireToken();
    return gatewayFetch(`/api/v1/progress/${data.novelId}`, {
      method: "PUT",
      body: JSON.stringify({
        chapter_number: data.chapterNumber,
        scroll_position: data.scrollPosition,
      }),
      token,
    });
  });

export const listGenres = createServerFn({ method: "GET" }).handler(async () =>
  gatewayFetch(`/api/v1/genres`),
);
