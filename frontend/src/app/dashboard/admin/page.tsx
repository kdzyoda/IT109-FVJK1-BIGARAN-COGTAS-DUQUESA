"use client";

import { AdminCanteens } from "@/components/admin-canteens";
import { DashboardShell } from "@/components/dashboard-shell";
import { useMenu } from "@/components/menu-provider";
import { useOrders } from "@/components/orders-provider";
import { Card, CardContent } from "@/components/ui/card";

function AdminContent() {
  const { orders } = useOrders();
  const { canteens } = useMenu();

  const delivered = orders.filter((o) => o.status === "Delivered");
  const claimed = orders.filter((o) => o.runner);
  const doneClaimed = claimed.filter((o) => o.status === "Delivered").length;
  const rate = claimed.length ? Math.round((doneClaimed / claimed.length) * 100) : 0;

  const stats = [
    { label: "Total orders", value: orders.length, icon: "🧾" },
    { label: "Delivered", value: delivered.length, icon: "✅" },
    { label: "In progress", value: orders.length - delivered.length, icon: "⏳" },
    { label: "Runner completion rate", value: `${rate}%`, icon: "🛵" },
  ];

  const runners = Array.from(new Set(claimed.map((o) => o.runner as string))).map((name) => {
    const mine = claimed.filter((o) => o.runner === name);
    const done = mine.filter((o) => o.status === "Delivered").length;
    return { name, claimed: mine.length, done, rate: Math.round((done / mine.length) * 100) };
  });

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden border-l-4 border-l-secondary">
            <CardContent className="flex items-center justify-between gap-2 pt-6">
              <div className="min-w-0">
                <p className="t-desc text-xs text-muted-foreground sm:text-sm">{s.label}</p>
                <p className="t-price text-2xl text-primary sm:text-3xl">{s.value}</p>
              </div>
              <span className="text-2xl sm:text-3xl">{s.icon}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <AdminCanteens />

      <section className="space-y-4">
        <h2 className="t-section text-2xl">Vendor payouts (delivered orders)</h2>
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="t-nav border-b-2 border-secondary/60 text-primary">
                  <th className="py-2">Canteen</th>
                  <th className="py-2">Delivered orders</th>
                  <th className="py-2">Amount due</th>
                </tr>
              </thead>
              <tbody className="t-desc">
                {canteens.map((c) => {
                  const mine = delivered.filter((o) => o.canteenId === c.id);
                  const total = mine.reduce((sum, o) => sum + o.subtotal, 0);
                  return (
                    <tr key={c.id} className="border-b border-border/60 even:bg-muted/40">
                      <td className="py-2.5">{c.name}</td>
                      <td className="py-2.5">{mine.length}</td>
                      <td className="t-price py-2.5 text-primary">₱{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="t-section text-2xl">Runner performance</h2>
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="t-nav border-b-2 border-secondary/60 text-primary">
                  <th className="py-2">Runner</th>
                  <th className="py-2">Claimed</th>
                  <th className="py-2">Delivered</th>
                  <th className="py-2">Completion</th>
                </tr>
              </thead>
              <tbody className="t-desc">
                {runners.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No runner activity yet.
                    </td>
                  </tr>
                )}
                {runners.map((r) => (
                  <tr key={r.name} className="border-b border-border/60 even:bg-muted/40">
                    <td className="py-2.5">{r.name}</td>
                    <td className="py-2.5">{r.claimed}</td>
                    <td className="py-2.5">{r.done}</td>
                    <td className="py-2.5">{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardShell role="admin" title="Admin dashboard" subtitle="Onboard canteens, monitor deliveries and vendor payouts">
      <AdminContent />
    </DashboardShell>
  );
}