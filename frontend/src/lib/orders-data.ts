import { canteens } from "@/lib/menu-data";

export const ORDER_STATUSES = [
  "Paid",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  customer: string;
  canteenId: number;
  items: string;
  subtotal: number;
  runnerFee: number;
  dropOff: string;
  status: OrderStatus;
  runner?: string;
};

export const canteenName = (id: number) =>
  canteens.find((c) => c.id === id)?.name ?? "Canteen";

// TEMP MOCK DATA: replaced by the Laravel API later.
export const sampleOrders: Order[] = [
  { id: "PG-1001", customer: "Juan Dela Cruz", canteenId: 1, items: "1× Chicken Adobo Rice", subtotal: 85, runnerFee: 10, dropOff: "CCIS Building, Room 204", status: "Paid" },
  { id: "PG-1002", customer: "Ana Reyes", canteenId: 1, items: "2× Pork Sisig", subtotal: 240, runnerFee: 10, dropOff: "Main Library, 2nd Floor", status: "Preparing" },
  { id: "PG-1003", customer: "Juan Dela Cruz", canteenId: 2, items: "1× Pancit Canton, 1× Iced Calamansi Juice", subtotal: 110, runnerFee: 10, dropOff: "Dorm A, Room 12", status: "Ready for Pickup" },
  { id: "PG-1004", customer: "Ana Reyes", canteenId: 1, items: "1× Chicken Adobo Rice", subtotal: 85, runnerFee: 10, dropOff: "CEIT Building, Room 101", status: "Ready for Pickup" },
  { id: "PG-1005", customer: "Ana Reyes", canteenId: 3, items: "1× Iced Latte, 1× Ensaymada", subtotal: 135, runnerFee: 10, dropOff: "Main Library, Lobby", status: "Out for Delivery", runner: "Maria Santos" },
  { id: "PG-1006", customer: "Juan Dela Cruz", canteenId: 1, items: "1× Pork Sisig", subtotal: 120, runnerFee: 10, dropOff: "CCIS Building, Room 204", status: "Delivered", runner: "Maria Santos" },
];