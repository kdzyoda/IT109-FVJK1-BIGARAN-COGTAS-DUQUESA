"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import {
  Canteen,
  MenuItem,
  canteens as initialCanteens,
  menuItems as initialItems,
} from "@/lib/menu-data";

export type MenuItemInput = Omit<MenuItem, "id"> & { id?: number };
export type CanteenInput = Omit<Canteen, "id" | "active"> & { id?: number };

type MenuContextValue = {
  canteens: Canteen[];
  items: MenuItem[];
  saveItem: (input: MenuItemInput) => void;
  deleteItem: (id: number) => void;
  toggleAvailable: (id: number) => void;
  saveCanteen: (input: CanteenInput) => void;
  setCanteenActive: (id: number, active: boolean) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

// TEMP MOCK: everything lives in memory. The Laravel API replaces this later,
// and Laravel must clear the menu cache on every create, update and delete.
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [canteens, setCanteens] = useState<Canteen[]>(initialCanteens);
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  const saveItem = useCallback((input: MenuItemInput) => {
    const { id, ...rest } = input;
    if (id) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...rest } : m)));
      toast.success("Menu item updated");
    } else {
      setItems((prev) => [...prev, { ...rest, id: Date.now() }]);
      toast.success("Menu item added");
    }
  }, []);

  const deleteItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    toast.success("Menu item deleted");
  }, []);

  const toggleAvailable = useCallback((id: number) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m)));
    toast.success("Availability updated");
  }, []);

  const saveCanteen = useCallback((input: CanteenInput) => {
    const { id, ...rest } = input;
    if (id) {
      setCanteens((prev) => prev.map((c) => (c.id === id ? { ...c, ...rest } : c)));
      toast.success("Canteen updated");
    } else {
      setCanteens((prev) => [...prev, { ...rest, id: Date.now(), active: true }]);
      toast.success("Canteen onboarded");
    }
  }, []);

  const setCanteenActive = useCallback((id: number, active: boolean) => {
    setCanteens((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    toast.success(active ? "Canteen activated" : "Canteen deactivated");
  }, []);

  return (
    <MenuContext.Provider
      value={{ canteens, items, saveItem, deleteItem, toggleAvailable, saveCanteen, setCanteenActive }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}