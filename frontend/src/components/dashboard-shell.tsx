"use client";

import { Navbar } from "@/components/navbar";
import { RoleGuard } from "@/components/role-guard";
import { RoleApiTester } from "@/components/role-api-tester";
import { Role, useAuth } from "@/components/auth-provider";

const roleInfo: Record<Role, { label: string; icon: string }> = {
  customer: { label: "Customer", icon: "🍽️" },
  vendor: { label: "Vendor", icon: "🏪" },
  runner: { label: "Runner", icon: "🛵" },
  admin: { label: "Admin", icon: "🛠️" },
};

export function DashboardShell({
  role,
  title,
  subtitle,
  children,
}: {
  role: Role;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const info = roleInfo[role];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <RoleGuard role={role}>
        {/* Banner */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-8 sm:px-6 sm:py-10">
            <div className="min-w-0 space-y-2">
              <span className="t-nav inline-block rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {info.label}
              </span>
              <h1 className="t-hero wrap-break-word text-2xl sm:text-4xl">{title}</h1>
              <p className="t-promo text-secondary">{subtitle}</p>
              {user && (
                <p className="t-desc text-sm text-primary-foreground/70">Signed in as {user.username}</p>
              )}
            </div>
            <div className="hidden h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-secondary/70 bg-white/10 text-5xl sm:grid">
              {info.icon}
            </div>
          </div>
        </section>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-10">
          {children}
          <RoleApiTester />
        </main>

        <footer className="bg-primary px-6 py-5 text-center text-sm text-primary-foreground/70">
          <span className="t-brand text-secondary">PaddlerGo</span> · Food ordering for the campus
        </footer>
      </RoleGuard>
    </div>
  );
}