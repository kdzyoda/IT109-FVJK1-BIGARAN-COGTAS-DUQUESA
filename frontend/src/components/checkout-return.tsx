"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderCard } from "@/components/order-card";
import { useOrders } from "@/components/orders-provider";

export function CheckoutReturn() {
  const params = useSearchParams();
  const status = params.get("status");
  const id = params.get("order");
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === id);

  if (status === "cancelled") {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="t-hero text-2xl">Payment cancelled</h1>
          <p className="t-desc text-muted-foreground">Your cart is still saved. You can try again.</p>
          <Link href="/menu" className={buttonVariants({ variant: "secondary" })}>
            Back to menu
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="t-hero text-2xl">Confirming your payment...</h1>
          <p className="t-desc text-muted-foreground">
            We are waiting for the payment confirmation. This page updates once your order is marked as paid.
          </p>
          <Link href="/dashboard/customer" className={buttonVariants({ variant: "outline" })}>
            Go to my orders
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-2 pt-6 text-center">
          <h1 className="t-hero text-2xl text-primary">Payment received!</h1>
          <p className="t-desc text-muted-foreground">
            The canteen will start preparing your food. A runner will deliver it to your drop-off point.
          </p>
        </CardContent>
      </Card>
      <OrderCard order={order} />
      <Link href="/dashboard/customer" className={buttonVariants({ variant: "secondary", size: "lg" }) + " w-full"}>
        Track my order
      </Link>
    </div>
  );
}