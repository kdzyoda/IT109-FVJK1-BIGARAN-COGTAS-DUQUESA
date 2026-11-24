"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CanteenForm } from "@/components/canteen-form";
import { useMenu } from "@/components/menu-provider";
import { Canteen } from "@/lib/menu-data";

export function AdminCanteens() {
  const { canteens, saveCanteen, setCanteenActive } = useMenu();
  const [editing, setEditing] = useState<Canteen | "new" | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="t-section text-2xl">Canteens</h2>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing("new")}>
            Onboard canteen
          </Button>
        )}
      </div>

      {editing && (
        <CanteenForm
          key={editing === "new" ? "new" : editing.id}
          canteen={editing === "new" ? undefined : editing}
          onSave={(v) => {
            saveCanteen(v);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {canteens.map((c) => {
          const place = [c.location?.barangay?.name, c.location?.city?.name].filter(Boolean).join(", ");
          return (
            <Card key={c.id}>
              <CardContent className="flex gap-4 pt-6">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-xs text-muted-foreground">
                  {c.logo ? <img src={c.logo} alt={c.name} className="h-full w-full object-cover" /> : "Logo"}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="t-food">{c.name}</p>
                  <p className="t-desc text-sm text-muted-foreground">{c.note}</p>
                  {place && <p className="t-desc text-xs text-muted-foreground">{place}</p>}
                  <p className="t-nav text-xs">{c.active ? "Active" : "Deactivated"}</p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setCanteenActive(c.id, !c.active)}>
                      {c.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}