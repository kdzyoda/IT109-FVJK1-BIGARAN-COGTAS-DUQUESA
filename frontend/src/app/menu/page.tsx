"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { CartPanel } from "@/components/cart-panel";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canteens, menuItems } from "@/lib/menu-data";

export default function MenuPage() {
  const { add } = useCart();
  const [canteenId, setCanteenId] = useState(canteens[0].id);
  const items = menuItems.filter((m) => m.canteenId === canteenId);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="t-hero text-4xl text-primary">Menu</h1>
        <p className="t-promo mt-1 text-primary/80">Pick a canteen, then pick your food</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {canteens.map((c) => (
            <Button
              key={c.id}
              variant={canteenId === c.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCanteenId(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="grid gap-5 sm:grid-cols-2">
            {items.map((m) => (
              <Card key={m.id}>
                <CardContent className="space-y-1 pt-6">
                  <div className="grid h-32 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
                    Food photo
                  </div>
                  <h3 className="t-food pt-3 text-lg">{m.name}</h3>
                  <p className="t-desc text-sm text-muted-foreground">{m.desc}</p>
                  <div className="flex items-center justify-between pt-3">
                    <span className="t-price text-xl text-primary">₱{m.price}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!m.available}
                      onClick={() =>
                        add({ id: m.id, canteenId: m.canteenId, name: m.name, price: m.price })
                      }
                    >
                      {m.available ? "Add to order" : "Sold out"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <CartPanel />
        </div>
      </main>
    </div>
  );
}