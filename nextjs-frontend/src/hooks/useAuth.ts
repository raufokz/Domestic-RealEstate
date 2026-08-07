"use client";

import { createContext, useContext, useState, useEffect, useCallback, createElement, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiGet, apiPost, setToken, clearToken, isAuthenticated } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<{ user: User }>("/auth/me");
      setUser(res.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: User }>("/auth/login", { email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; role?: string }) => {
    const res = await apiPost<{ token: string; user: User }>("/auth/register", data);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try { await apiPost("/auth/logout"); } catch { /* ok */ }
    clearToken();
    setUser(null);
  };

  return createElement(AuthCtx.Provider, { value: { user, loading, login, register, logout } }, children);
}

export function useAuth(): AuthContextType {
  return useContext(AuthCtx);
}

/**
 * Guard for authenticated-only layouts (admin/portal). Redirects to /login
 * with a returnTo once loading settles and no user is present — covers both
 * "never logged in" and "token expired mid-session" (AuthProvider clears the
 * token and sets user:null on any /auth/me failure, but never redirects on
 * its own).
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    }
  }, [auth.loading, auth.user, pathname, router]);

  return auth;
}
