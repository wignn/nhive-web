import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentUser, logout as logoutFn } from "@/server-fns/auth.functions";

type User = { id: string; username: string; email: string; role: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const fetchMe = useServerFn(getCurrentUser);
  const doLogout = useServerFn(logoutFn);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchMe();
      setUser(r.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);

  const logout = useCallback(async () => {
    await doLogout();
    setUser(null);
  }, [doLogout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <Ctx.Provider value={{ user, loading, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
