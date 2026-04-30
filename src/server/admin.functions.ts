import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gatewayFetch } from "./gateway.server";
import { getSession } from "./session";

async function requireAdmin() {
  const s = await getSession();
  if (!s.data.token) throw new Error("Not authenticated");
  if (s.data.user?.role !== "admin") throw new Error("Admin access required");
  return s.data.token;
}

export const adminListNovels = createServerFn({ method: "GET" }).handler(async () => {
  const token = await requireAdmin();
  return gatewayFetch(`/api/v1/admin/novels`, { token });
});

export const adminListChapters = createServerFn({ method: "GET" }).handler(async () => {
  const token = await requireAdmin();
  return gatewayFetch(`/api/v1/admin/chapters`, { token });
});

export const adminListUsers = createServerFn({ method: "GET" }).handler(async () => {
  const token = await requireAdmin();
  return gatewayFetch(`/api/v1/admin/users`, { token });
});

const novelSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  synopsis: z.string().max(5000).optional().default(""),
  status: z.enum(["ongoing", "completed", "hiatus"]),
  cover_url: z.string().max(500).optional().default(""),
  genres: z.array(z.string().min(1).max(60)).max(30).default([]),
});

export const adminCreateNovel = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => novelSchema.parse(i))
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/novels`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  });

export const adminUpdateNovel = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().min(1), data: novelSchema }).parse(i),
  )
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/novels/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data.data),
      token,
    });
  });

export const adminDeleteNovel = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/novels/${data.id}`, {
      method: "DELETE",
      token,
    });
  });

const chapterSchema = z.object({
  novel_id: z.string().min(1),
  number: z.number().int().min(1),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(200000),
});

export const adminCreateChapter = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => chapterSchema.parse(i))
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/chapters`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  });

export const adminUpdateChapter = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().min(1),
        title: z.string().min(1).max(300),
        content: z.string().min(1).max(200000),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/chapters/${data.id}`, {
      method: "PUT",
      body: JSON.stringify({ title: data.title, content: data.content }),
      token,
    });
  });

export const adminDeleteChapter = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string().min(1) }).parse(i))
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/chapters/${data.id}`, {
      method: "DELETE",
      token,
    });
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().min(1),
        role: z.enum(["admin", "reader"]),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const token = await requireAdmin();
    return gatewayFetch(`/api/v1/admin/users/${data.id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: data.role }),
      token,
    });
  });
