"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CaptchaValue, MathCaptcha } from "@/components/math-captcha";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { useOrders } from "@/components/orders-provider";
import { DELIVERY_FEE } from "@/lib/menu-data";

// Building / room: 3-60 letters, numbers, spaces and . , # ' -
const DROP_OFF_RE = /^[A-Za-z0-9 .,#'-]{3,60}$/;

const newOrderId = () => `PG-${Date.now().toString().slice(-6)}`;

export function CartPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, count, subtotal, increase, decrease, clear } = useCart();
  const { addOrder } = useOrders();
  const [dropOff, setDropOff] = useState("");
  const [dropOffError, setDropOffError] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: "", answer: "", ok: false });
  const [resetKey, setResetKey] = useState(0);
  const [placing, setPlacing] = useState(false);

  const total = subtotal + (count > 0 ? DELIVERY_FEE : 0);

  function placeOrder() {
    if (!user) return;
    if (!DROP_OFF_RE.test(dropOff.trim())) {
      setDropOffError("Enter your building and room (3-60 letters, numbers or . , # ' -).");
      return;
    }
    setDropOffError("");
    if (!captcha.ok) {
      toast.error("Please answer the CAPTCHA correctly.");
      return;
    }

    setPlacing(true);
    const id = newOrderId();
    // Orders are still kept in the app for now. No payment step in this activity.
    addOrder({
      id,
      customer: user.name,
      canteenId: lines[0].canteenId,
      items: lines.map((l) => `${l.qty}× ${l.name}`).join(", "),
      subtotal,
      runnerFee: DELIVERY_FEE,
      dropOff: dropOff.trim(),
      status: "Paid",
    });
    clear();
    setDropOff("");
    setResetKey((k) => k + 1);
    setPlacing(false);
    toast.success(`Order ${id} placed!`);
    router.push("/dashboard/customer");
  }

  return (
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

          {!user ? (
            <Link href="/login" className={buttonVariants({ variant: "secondary" }) + " mt-5 w-full"}>
              Sign in to order
            </Link>
          ) : user.role !== "customer" ? (
            <p className="t-desc mt-5 text-sm text-secondary">Only customers can place orders.</p>
          ) : (
            <>
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

              <div className="mt-4">
                <MathCaptcha resetKey={resetKey} onChange={setCaptcha} />
              </div>

              <Button className="mt-4 w-full" variant="secondary" disabled={placing} onClick={placeOrder}>
                {placing ? "Placing order..." : "Place order"}
              </Button>
            </>
          )}

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
  );
}