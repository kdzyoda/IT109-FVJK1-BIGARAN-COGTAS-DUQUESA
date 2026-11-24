"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type CartLine = {
  id: number;
  canteenId: number;
  name: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartLine, "qty">) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "paddlergo-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {
      // ignore broken or blocked storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore blocked storage
    }
  }, [lines, loaded]);

  const add = useCallback(
    (item: Omit<CartLine, "qty">) => {
      if (lines.length > 0 && lines[0].canteenId !== item.canteenId) {
        toast.error("Your cart has items from another canteen. Clear it first to order here.");
        return;
      }
      setLines((prev) => {
        const found = prev.find((l) => l.id === item.id);
        if (found) {
          return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
        }
        return [...prev, { ...item, qty: 1 }];
      });
      toast.success(`${item.name} added to your order`);
    },
    [lines]
  );

  const increase = useCallback((id: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)));
  }, []);

  const decrease = useCallback((id: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  return (
    <CartContext.Provider value={{ lines, count, subtotal, add, increase, decrease, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}