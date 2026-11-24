"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";

export function Navbar() {
  const { count } = useCart();

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="t-brand text-2xl text-secondary">
          PaddlerGo
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/menu" className="t-nav">
            Menu
            {count > 0 && (
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}