import { useSession } from "@tanstack/react-start/server";

export type SessionData = {
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

export function getSessionConfig() {
  const password = process.env.NOVELHIVE_SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "NOVELHIVE_SESSION_SECRET must be set and at least 32 characters",
    );
  }
  return {
    password,
    name: "novelhive_session",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function getSession() {
  return useSession<SessionData>(getSessionConfig());
}
