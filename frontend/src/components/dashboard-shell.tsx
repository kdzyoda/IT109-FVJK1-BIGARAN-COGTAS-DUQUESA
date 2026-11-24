import { Navbar } from "@/components/navbar";
import { RoleGuard } from "@/components/role-guard";
import { RoleApiTester } from "@/components/role-api-tester";
import { Role } from "@/components/auth-provider";

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
  return (
    <div className="min-h-screen">
      <Navbar />
      <RoleGuard role={role}>
        <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
          <div>
            <h1 className="t-hero text-4xl text-primary">{title}</h1>
            <p className="t-promo mt-1 text-primary/80">{subtitle}</p>
          </div>
          {children}
          <RoleApiTester />
        </main>
      </RoleGuard>
    </div>
  );
}