"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { OrderCard } from "@/components/order-card";
import { VendorMenu } from "@/components/vendor-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useOrders } from "@/components/orders-provider";

function VendorContent() {
  const { user } = useAuth();
  const { orders, setStatus } = useOrders();
  const canteenId = user?.canteenId ?? 1;
  const myOrders = orders.filter((o) => o.canteenId === canteenId);

  const stats = [
    { label: "New orders", value: myOrders.filter((o) => o.status === "Paid").length, icon: "🔔" },
    { label: "Preparing", value: myOrders.filter((o) => o.status === "Preparing").length, icon: "🍳" },
    { label: "Ready for pickup", value: myOrders.filter((o) => o.status === "Ready for Pickup").length, icon: "📦" },
    { label: "Delivered", value: myOrders.filter((o) => o.status === "Delivered").length, icon: "✅" },
  ];

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

      <section className="space-y-4">
        <h2 className="t-section flex items-center gap-2 text-2xl">
          <span className="h-6 w-1.5 rounded-full bg-secondary" />
          Incoming orders
        </h2>
        {myOrders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-4xl">🍽️</p>
              <p className="t-desc mt-2 text-muted-foreground">No orders for your canteen yet.</p>
            </CardContent>
          </Card>
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

      <VendorMenu canteenId={canteenId} />
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