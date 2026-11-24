import { OrderStatus } from "@/lib/orders-data";

const styles: Record<OrderStatus, string> = {
  Paid: "bg-blue-100 text-blue-800",
  Preparing: "bg-amber-100 text-amber-800",
  "Ready for Pickup": "bg-purple-100 text-purple-800",
  "Out for Delivery": "bg-orange-100 text-orange-800",
  Delivered: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`t-nav rounded-full px-3 py-1 text-xs ${styles[status]}`}>{status}</span>
  );
}