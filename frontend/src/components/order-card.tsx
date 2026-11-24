import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Order, canteenName } from "@/lib/orders-data";

export function OrderCard({
  order,
  showCustomer,
  children,
}: {
  order: Order;
  showCustomer?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="t-food text-lg">{order.id}</p>
            <p className="t-desc text-sm text-muted-foreground">{canteenName(order.canteenId)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <p className="t-desc text-sm">{order.items}</p>
        <p className="t-desc text-sm text-muted-foreground">Drop-off: {order.dropOff}</p>
        {showCustomer && (
          <p className="t-desc text-sm text-muted-foreground">Customer: {order.customer}</p>
        )}
        {order.runner && (
          <p className="t-desc text-sm text-muted-foreground">Runner: {order.runner}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="t-price text-lg text-primary">₱{order.subtotal + order.runnerFee}</span>
          <div className="flex gap-2">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}