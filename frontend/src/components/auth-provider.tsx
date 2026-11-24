"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Role = "customer" | "vendor" | "runner" | "admin";
export type User = { name: string; role: Role; canteenId?: number };

// TEMP MOCK USERS for testing the dashboards.
const DEMO_USERS: Record<Role, User> = {
  customer: { name: "Juan Dela Cruz", role: "customer" },
  vendor: { name: "Main Canteen Grill", role: "vendor", canteenId: 1 },
  runner: { name: "Maria Santos", role: "runner" },
  admin: { name: "Campus Admin", role: "admin" },
};

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signInAs: (role: Role) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "paddlergo-demo-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // ignore blocked or broken storage
    }
    setReady(true);
  }, []);

  const signInAs = useCallback((role: Role) => {
    const next = DEMO_USERS[role];
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signInAs, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}