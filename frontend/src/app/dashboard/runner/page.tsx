"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useOrders } from "@/components/orders-provider";

function RunnerContent() {
  const { user } = useAuth();
  const { orders, setStatus } = useOrders();
  const name = user?.name ?? "";

  const board = orders.filter((o) => o.status === "Ready for Pickup" && !o.runner);
  const active = orders.filter((o) => o.runner === name && o.status === "Out for Delivery");
  const done = orders.filter((o) => o.runner === name && o.status === "Delivered");

  return (
    <>
      <section className="space-y-4">
        <h2 className="t-section text-2xl">Job board</h2>
        {board.length === 0 ? (
          <p className="t-desc text-muted-foreground">No orders are ready for pickup right now.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {board.map((o) => (
              <OrderCard key={o.id} order={o}>
                <Button size="sm" variant="secondary" onClick={() => setStatus(o.id, "Out for Delivery", name)}>
                  Claim order
                </Button>
              </OrderCard>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="t-section text-2xl">My deliveries</h2>
        {active.length === 0 ? (
          <p className="t-desc text-muted-foreground">You have no active deliveries.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {active.map((o) => (
              <OrderCard key={o.id} order={o}>
                <Button size="sm" onClick={() => setStatus(o.id, "Delivered")}>
                  Mark delivered
                </Button>
              </OrderCard>
            ))}
          </div>
        )}
        <p className="t-desc text-sm text-muted-foreground">Completed deliveries: {done.length}</p>
      </section>
    </>
  );
}

export default function RunnerDashboard() {
  return (
    <DashboardShell role="runner" title="Runner dashboard" subtitle="Claim an order and deliver it to the drop-off point">
      <RunnerContent />
    </DashboardShell>
  );
}