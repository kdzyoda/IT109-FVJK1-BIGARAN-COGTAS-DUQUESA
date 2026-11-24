"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useOrders } from "@/components/orders-provider";
import { canteens } from "@/lib/menu-data";

function AdminContent() {
  const { orders } = useOrders();

  const delivered = orders.filter((o) => o.status === "Delivered");
  const claimed = orders.filter((o) => o.runner);
  const rate = claimed.length ? Math.round((delivered.filter((o) => o.runner).length / claimed.length) * 100) : 0;

  const stats = [
    { label: "Total orders", value: orders.length },
    { label: "Delivered", value: delivered.length },
    { label: "In progress", value: orders.length - delivered.length },
    { label: "Runner completion rate", value: `${rate}%` },
  ];

  const runners = Array.from(new Set(claimed.map((o) => o.runner as string))).map((name) => {
    const mine = claimed.filter((o) => o.runner === name);
    const done = mine.filter((o) => o.status === "Delivered").length;
    return { name, claimed: mine.length, done, rate: Math.round((done / mine.length) * 100) };
  });

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="space-y-1 pt-6">
              <p className="t-desc text-sm text-muted-foreground">{s.label}</p>
              <p className="t-price text-3xl text-primary">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="t-section text-2xl">Vendor payouts (delivered orders)</h2>
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="t-nav border-b border-border">
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
                    <tr key={c.id} className="border-b border-border/60">
                      <td className="py-2">{c.name}</td>
                      <td className="py-2">{mine.length}</td>
                      <td className="t-price py-2 text-primary">₱{total}</td>
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
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="t-nav border-b border-border">
                  <th className="py-2">Runner</th>
                  <th className="py-2">Claimed</th>
                  <th className="py-2">Delivered</th>
                  <th className="py-2">Completion</th>
                </tr>
              </thead>
              <tbody className="t-desc">
                {runners.map((r) => (
                  <tr key={r.name} className="border-b border-border/60">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.claimed}</td>
                    <td className="py-2">{r.done}</td>
                    <td className="py-2">{r.rate}%</td>
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
    <DashboardShell role="admin" title="Admin dashboard" subtitle="Monitor deliveries and vendor payouts">
      <AdminContent />
    </DashboardShell>
  );
}