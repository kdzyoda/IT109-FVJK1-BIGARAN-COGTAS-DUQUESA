"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { USE_MOCK, apiRequest } from "@/lib/api";
import { mockLogin, mockRegister } from "@/lib/mock-auth";

export type Role = "customer" | "vendor" | "runner" | "admin";
export type User = {
  id?: number;
  name: string;
  username: string;
  role: Role;
  canteenId?: number;
};

type ApiUser = {
  id?: number;
  name?: string;
  username: string;
  role: Role;
  canteen_id?: number;
};
type LoginResponse = { message?: string; user: ApiUser; token?: string };
type RegisterInput = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};
type Session = { user: User; token: string | null };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "paddlergo-auth";

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    username: u.username,
    name: u.name ?? u.username,
    role: u.role,
    canteenId: u.canteen_id,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore blocked storage
    }
  }, []);

  const saveSession = useCallback((u: User, t: string | null) => {
    setUser(u);
    setToken(t);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
    } catch {
      // ignore blocked storage
    }
  }, []);

  // Restore the session after a page refresh. The real API confirms the token is still valid.
  useEffect(() => {
    let alive = true;
    async function restore() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const s = JSON.parse(saved) as Session;
        if (USE_MOCK) {
          if (alive) {
            setUser(s.user);
            setToken(s.token);
          }
        } else if (s.token) {
          const data = await apiRequest<{ user?: ApiUser } & Partial<ApiUser>>("/api/user", {
            token: s.token,
          });
          if (alive) {
            setUser(toUser((data.user ?? data) as ApiUser));
            setToken(s.token);
          }
        }
      } catch {
        if (alive) clearSession();
      } finally {
        if (alive) setReady(true);
      }
    }
    restore();
    return () => {
      alive = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = USE_MOCK
        ? await mockLogin(username, password)
        : await apiRequest<LoginResponse>("/api/login", {
            method: "POST",
            body: { username, password },
          });
      const u = toUser(data.user);
      saveSession(u, data.token ?? null);
      return u;
    },
    [saveSession]
  );

  const register = useCallback(async (input: RegisterInput) => {
    if (USE_MOCK) await mockRegister(input);
    else await apiRequest("/api/register", { method: "POST", body: input });
  }, []);

  const signOut = useCallback(async () => {
    const t = token;
    clearSession();
    if (!USE_MOCK && t) {
      try {
        await apiRequest("/api/logout", { method: "POST", token: t });
      } catch {
        // already signed out locally
      }
    }
  }, [token, clearSession]);

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}