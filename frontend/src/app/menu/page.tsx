"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DELIVERY_FEE, canteens, menuItems } from "@/lib/menu-data";

// Building / room: 3-60 letters, numbers, spaces and . , # ' -
const DROP_OFF_RE = /^[A-Za-z0-9 .,#'-]{3,60}$/;

export default function MenuPage() {
  const { lines, count, subtotal, add, increase, decrease, clear } = useCart();
  const [canteenId, setCanteenId] = useState(canteens[0].id);
  const [dropOff, setDropOff] = useState("");
  const [dropOffError, setDropOffError] = useState("");
  const [placing, setPlacing] = useState(false);

  const items = menuItems.filter((m) => m.canteenId === canteenId);
  const total = subtotal + (count > 0 ? DELIVERY_FEE : 0);

  function placeOrder() {
    if (!DROP_OFF_RE.test(dropOff.trim())) {
      setDropOffError("Enter your building and room (3-60 letters, numbers or . , # ' -).");
      return;
    }
    setDropOffError("");
    setPlacing(true);
    // TEMP MOCK: the real order + PayMongo checkout comes from the Laravel API later.
    setTimeout(() => {
      toast.success("Order placed (demo). Payment with PayMongo will be connected next.");
      clear();
      setDropOff("");
      setPlacing(false);
    }, 800);
  }

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
          {/* Food cards */}
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

          {/* Cart */}
          <aside className="h-fit rounded-2xl bg-primary p-6 text-primary-foreground lg:sticky lg:top-6">
            <h2 className="t-section text-xl text-secondary">Your order ({count})</h2>

            {lines.length === 0 ? (
              <p className="t-desc mt-4 text-sm text-primary-foreground/70">
                Your cart is empty. Add something tasty!
              </p>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {lines.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="t-nav text-sm">{l.name}</p>
                        <p className="t-desc text-xs text-primary-foreground/70">₱{l.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon-sm" variant="secondary" onClick={() => decrease(l.id)}>
                          −
                        </Button>
                        <span className="w-5 text-center">{l.qty}</span>
                        <Button size="icon-sm" variant="secondary" onClick={() => increase(l.id)}>
                          +
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-1 border-t border-primary-foreground/20 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="t-desc">Food subtotal</span>
                    <span className="t-nav">₱{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="t-desc">Runner fee</span>
                    <span className="t-nav">₱{DELIVERY_FEE}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="t-nav">Total</span>
                    <span className="t-price text-2xl text-secondary">₱{total}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Label htmlFor="dropoff" className="t-nav">
                    Drop-off (building / room)
                  </Label>
                  <Input
                    id="dropoff"
                    value={dropOff}
                    onChange={(e) => setDropOff(e.target.value)}
                    placeholder="e.g. CCIS Building, Room 204"
                    className="bg-card text-card-foreground"
                    maxLength={60}
                  />
                  {dropOffError && <p className="text-sm text-secondary">{dropOffError}</p>}
                </div>

                <Button className="mt-4 w-full" variant="secondary" disabled={placing} onClick={placeOrder}>
                  {placing ? "Placing order..." : "Place order"}
                </Button>
                <Button
                  className="mt-2 w-full"
                  variant="ghost"
                  onClick={() => {
                    clear();
                    toast.info("Cart cleared");
                  }}
                >
                  Clear cart
                </Button>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}