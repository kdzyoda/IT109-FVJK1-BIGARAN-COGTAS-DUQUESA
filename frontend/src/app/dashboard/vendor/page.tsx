"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useOrders } from "@/components/orders-provider";
import { menuItems } from "@/lib/menu-data";

function VendorContent() {
  const { user } = useAuth();
  const { orders, setStatus } = useOrders();
  const canteenId = user?.canteenId ?? 1;

  const myOrders = orders.filter((o) => o.canteenId === canteenId);
  const [items, setItems] = useState(() =>
    menuItems.filter((m) => m.canteenId === canteenId).map((m) => ({ ...m }))
  );

  function toggle(id: number) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m)));
    toast.success("Menu availability updated (demo)");
  }

  return (
    <>
      <section className="space-y-4">
        <h2 className="t-section text-2xl">Incoming orders</h2>
        {myOrders.length === 0 ? (
          <p className="t-desc text-muted-foreground">No orders for your canteen yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {myOrders.map((o) => (
              <OrderCard key={o.id} order={o} showCustomer>
                {o.status === "Paid" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(o.id, "Preparing")}>
                    Accept order
                  </Button>
                )}
                {o.status === "Preparing" && (
                  <Button size="sm" onClick={() => setStatus(o.id, "Ready for Pickup")}>
                    Mark ready for pickup
                  </Button>
                )}
              </OrderCard>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="t-section text-2xl">Menu availability</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <Card key={m.id}>
              <CardContent className="space-y-2 pt-6">
                <p className="t-food">{m.name}</p>
                <p className="t-price text-primary">₱{m.price}</p>
                <Button
                  size="sm"
                  variant={m.available ? "outline" : "secondary"}
                  onClick={() => toggle(m.id)}
                >
                  {m.available ? "Mark sold out" : "Mark available"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

export default function VendorDashboard() {
  return (
    <DashboardShell role="vendor" title="Vendor dashboard" subtitle="Accept orders and keep your menu up to date">
      <VendorContent />
    </DashboardShell>
  );
}