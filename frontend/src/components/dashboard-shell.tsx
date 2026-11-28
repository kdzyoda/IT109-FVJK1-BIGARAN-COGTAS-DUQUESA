"use client";

import { Navbar } from "@/components/navbar";
import { RoleGuard } from "@/components/role-guard";
import { RoleApiTester } from "@/components/role-api-tester";
import { Role, useAuth } from "@/components/auth-provider";

const ROLE_STYLE: Record<Role, { icon: string; label: string }> = {
  customer: { icon: "🛍️", label: "Customer" },
  vendor: { icon: "🏪", label: "Vendor" },
  runner: { icon: "🛵", label: "Runner" },
  admin: { icon: "🛡️", label: "Admin" },
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
  const style = ROLE_STYLE[role];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Banner */}
      <section
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "linear-gradient(135deg, #5a0d0d 0%, #7a1414 100%)" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-secondary/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-8 sm:px-6 sm:py-10">
          <div className="min-w-0">
            <span className="t-nav inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <span>{style.icon}</span>
              {style.label} area
            </span>
            <h1 className="t-hero mt-3 text-3xl sm:text-4xl">{title}</h1>
            <p className="t-promo mt-1 text-secondary">{subtitle}</p>
            {user && (
              <p className="t-desc mt-3 text-sm text-primary-foreground/70">
                Signed in as <span className="t-nav text-primary-foreground">{user.name}</span>
              </p>
            )}
          </div>
          <span className="hidden text-7xl opacity-90 sm:block" aria-hidden>
            {style.icon}
          </span>
        </div>
      </section>

      <RoleGuard role={role}>
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-8 sm:px-6">
          {children}
          <RoleApiTester />
        </main>
      </RoleGuard>

      <footer className="bg-primary px-6 py-5 text-center text-sm text-primary-foreground/70">
        <span className="t-brand text-secondary">PaddlerGo</span> · Food ordering for the campus
      </footer>
    </div>
  );
}