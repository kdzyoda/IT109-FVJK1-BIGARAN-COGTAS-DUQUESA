"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role, useAuth } from "@/components/auth-provider";

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(`/dashboard/${user.role}`);
  }, [ready, user, role, router]);

  if (!ready || !user || user.role !== role) {
    return <p className="t-desc p-10 text-center text-muted-foreground">Loading...</p>;
  }
  return <>{children}</>;
}