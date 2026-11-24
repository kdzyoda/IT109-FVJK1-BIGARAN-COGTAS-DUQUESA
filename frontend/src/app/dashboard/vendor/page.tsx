"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { OrderCard } from "@/components/order-card";
import { VendorMenu } from "@/components/vendor-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useOrders } from "@/components/orders-provider";

function VendorContent() {
  const { user } = useAuth();
  const { orders, setStatus } = useOrders();
  const canteenId = user?.canteenId ?? 1;
  const myOrders = orders.filter((o) => o.canteenId === canteenId);

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