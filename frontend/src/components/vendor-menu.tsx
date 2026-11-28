"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MenuItemForm } from "@/components/menu-item-form";
import { useMenu } from "@/components/menu-provider";
import { MenuItem } from "@/lib/menu-data";

export function VendorMenu({ canteenId }: { canteenId: number }) {
  const { items, saveItem, deleteItem, toggleAvailable } = useMenu();
  const [editing, setEditing] = useState<MenuItem | "new" | null>(null);
  const mine = items.filter((m) => m.canteenId === canteenId);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="t-section text-2xl">My menu</h2>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing("new")}>
            Add menu item
          </Button>
        )}
      </div>

      {editing && (
        <MenuItemForm
          key={editing === "new" ? "new" : editing.id}
          canteenId={canteenId}
          item={editing === "new" ? undefined : editing}
          onSave={(v) => {
            saveItem(v);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {mine.length === 0 ? (
        <p className="t-desc text-muted-foreground">No menu items yet. Add your first one.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((m) => (
            <Card key={m.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="grid h-28 place-items-center overflow-hidden rounded-lg bg-muted text-sm text-muted-foreground">
                  {m.image ? <img src={m.image} alt={m.name} className="h-full w-full object-cover" /> : "No photo"}
                </div>
                <p className="t-food">{m.name}</p>
                <p className="t-price text-primary">₱{m.price}</p>
                <p className="t-desc text-xs text-muted-foreground">
                  {m.available ? "Available" : "Sold out"}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => toggleAvailable(m.id)}>
                    {m.available ? "Mark sold out" : "Mark available"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(`Delete ${m.name}?`)) deleteItem(m.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}