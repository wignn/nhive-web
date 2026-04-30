import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gatewayFetch } from "./gateway.server";
import { getSession } from "./session";

const credSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
});

async function persistSessionFromAuthResponse(resp: any) {
  const token: string | undefined = resp?.token || resp?.access_token;
  if (!token) throw new Error("No token returned by backend");
  let user = resp?.user;
  if (!user) {
    try {
      user = await gatewayFetch(`/api/v1/auth/me`, { token });
    } catch {}
  }
  const session = await getSession();
  await session.update({
    token,
    user: user
      ? {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "reader",
        }
      : undefined,
  });
  return { user };
}

export const login = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credSchema.parse(input))
  .handler(async ({ data }) => {
    const resp = await gatewayFetch(`/api/v1/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const { user } = await persistSessionFromAuthResponse(resp);
    return { ok: true, user };
  });

export const register = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registerSchema.parse(input))
  .handler(async ({ data }) => {
    await gatewayFetch(`/api/v1/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const resp = await gatewayFetch(`/api/v1/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    const { user } = await persistSessionFromAuthResponse(resp);
    return { ok: true, user };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSession();
  await session.clear();
  return { ok: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  return { user: session.data.user ?? null };
});
