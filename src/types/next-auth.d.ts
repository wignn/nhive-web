import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
    accessToken: string;
  }
  interface User extends DefaultUser {
    role: string;
    username: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    username: string;
    accessToken: string;
    id: string;
  }
}
