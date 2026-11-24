"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { useOrders } from "@/components/orders-provider";
import { PendingOrder, clearPending, loadPending, toCentavos } from "@/lib/checkout";

export function MockPay() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { clear } = useCart();
  const { addOrder } = useOrders();
  const [pending, setPending] = useState<PendingOrder | null>(null);
  const [checked, setChecked] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    setPending(loadPending());
    setChecked(true);
  }, []);

  function pay() {
    if (!pending || !user) return;
    setPaying(true);
    setTimeout(() => {
      // TEMP MOCK: this simulates the PayMongo webhook marking the order as Paid.
      // In the real app Laravel sets the status, never the frontend.
      addOrder({
        id: pending.id,
        customer: user.name,
        canteenId: pending.canteenId,
        items: pending.items,
        subtotal: pending.subtotal,
        runnerFee: pending.runnerFee,
        dropOff: pending.dropOff,
        status: "Paid",
      });
      clear();
      clearPending();
      router.push(`/checkout/return?order=${pending.id}&status=success`);
    }, 1200);
  }

  function cancel() {
    router.push("/checkout/return?status=cancelled");
  }

  if (!ready || !checked) {
    return <p className="t-desc text-center text-muted-foreground">Loading...</p>;
  }

  if (!user || !pending) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <p className="t-desc">There is no order waiting for payment.</p>
          <Link href="/menu" className={buttonVariants({ variant: "secondary" })}>
            Back to menu
          </Link>
        </CardContent>
      </Card>
    );
  }

  const total = pending.subtotal + pending.runnerFee;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <p className="t-promo text-primary/80">Test mode, no real money is used</p>
        <h1 className="t-hero text-2xl">PayMongo checkout (demo)</h1>

        <div className="space-y-1 rounded-lg bg-muted p-4 text-sm">
          <p className="t-nav">Order {pending.id}</p>
          <p className="t-desc">{pending.items}</p>
          <p className="t-desc text-muted-foreground">Drop-off: {pending.dropOff}</p>
          <p className="t-price pt-2 text-xl text-primary">₱{total}</p>
          <p className="t-desc text-xs text-muted-foreground">
            Sent to PayMongo as {toCentavos(total)} centavos
          </p>
        </div>

        <Button size="lg" variant="secondary" className="w-full" disabled={paying} onClick={pay}>
          {paying ? "Processing payment..." : "Pay with GCash (test)"}
        </Button>
        <Button variant="ghost" className="w-full" disabled={paying} onClick={cancel}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}