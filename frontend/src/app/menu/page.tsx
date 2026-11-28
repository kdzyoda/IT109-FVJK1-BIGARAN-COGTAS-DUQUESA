"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { CartPanel } from "@/components/cart-panel";
import { useCart } from "@/components/cart-provider";
import { useMenu } from "@/components/menu-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MenuPage() {
  const { add } = useCart();
  const { canteens, items } = useMenu();
  const [picked, setPicked] = useState<number | null>(null);

  const active = canteens.filter((c) => c.active);
  const current = active.find((c) => c.id === picked)?.id ?? active[0]?.id;
  const currentCanteen = active.find((c) => c.id === current);
  const shown = items.filter((m) => m.canteenId === current);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Banner */}
      <section
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "linear-gradient(135deg, #5a0d0d 0%, #7a1414 100%)" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="t-hero text-3xl sm:text-4xl">Menu</h1>
          <p className="t-promo mt-1 text-secondary">Pick a canteen, then pick your food</p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Canteen tabs: scroll sideways on phones instead of wrapping */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {active.map((c) => (
            <Button
              key={c.id}
              variant={current === c.id ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setPicked(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>

        {currentCanteen && (
          <p className="t-desc mt-3 text-sm text-muted-foreground">{currentCanteen.note}</p>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="grid content-start gap-5 sm:grid-cols-2">
            {active.length === 0 && (
              <p className="t-desc text-muted-foreground">No canteens are open right now.</p>
            )}
            {active.length > 0 && shown.length === 0 && (
              <p className="t-desc text-muted-foreground">This canteen has no items yet.</p>
            )}

            {shown.map((m) => (
              <Card
                key={m.id}
                className="gap-0 overflow-hidden py-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  <div className="relative grid h-40 place-items-center bg-muted text-sm text-muted-foreground">
                    {m.image ? (
                      <img
                        src={m.image}
                        alt={m.name}
                        className={`h-full w-full object-cover ${m.available ? "" : "opacity-50"}`}
                      />
                    ) : (
                      <span className="text-4xl">🍽️</span>
                    )}
                    {!m.available && (
                      <span className="t-nav absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        Sold out
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 p-4">
                    <h3 className="t-food text-lg">{m.name}</h3>
                    <p className="t-desc line-clamp-2 text-sm text-muted-foreground">{m.desc}</p>
                    <div className="flex items-center justify-between gap-3 pt-3">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Cart sits under the food on phones and stays in view beside it on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartPanel />
          </div>
        </div>
      </main>

      <footer className="bg-primary px-6 py-5 text-center text-sm text-primary-foreground/70">
        <span className="t-brand text-secondary">PaddlerGo</span> · Food ordering for the campus
      </footer>
    </div>
  );
}