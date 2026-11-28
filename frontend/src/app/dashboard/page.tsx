"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function DashboardRedirect() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(user ? `/dashboard/${user.role}` : "/login");
  }, [ready, user, router]);

  return <p className="t-desc p-10 text-center text-muted-foreground">Loading...</p>;
}