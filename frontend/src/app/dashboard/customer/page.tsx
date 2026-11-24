"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { OrderCard } from "@/components/order-card";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useOrders } from "@/components/orders-provider";

function CustomerContent() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const mine = orders.filter((o) => o.customer === user?.name);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="t-section text-2xl">My orders</h2>
        <Link href="/menu" className={buttonVariants({ variant: "secondary" })}>
          Order food
        </Link>
      </div>

      {mine.length === 0 ? (
        <p className="t-desc text-muted-foreground">No orders yet. Visit the menu to place one.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {mine.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </>
  );
}

export default function CustomerDashboard() {
  return (
    <DashboardShell role="customer" title="Customer dashboard" subtitle="Track your food from stall to door">
      <CustomerContent />
    </DashboardShell>
  );
}