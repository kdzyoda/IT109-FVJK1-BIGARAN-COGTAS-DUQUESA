"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { Order, OrderStatus, sampleOrders } from "@/lib/orders-data";

type OrdersContextValue = {
  orders: Order[];
  addOrder: (order: Order) => void;
  setStatus: (id: string, status: OrderStatus, runner?: string) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const setStatus = useCallback((id: string, status: OrderStatus, runner?: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, runner: runner ?? o.runner } : o))
    );
    toast.success(`Order ${id} is now: ${status}`);
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, setStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
  return ctx;
}