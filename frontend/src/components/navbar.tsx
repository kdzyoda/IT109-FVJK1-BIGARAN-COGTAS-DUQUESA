"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";

export function Navbar() {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="t-brand text-2xl text-secondary">
          PaddlerGo
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/menu" className="t-nav">
            Menu
            {count > 0 && (
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href={`/dashboard/${user.role}`} className="t-nav">
                Dashboard
              </Link>
              <Link href="/profile" className="t-nav">
                Profile
              </Link>
              <span className="t-desc hidden text-sm text-primary-foreground/70 sm:inline">
                {user.username} ({user.role})
              </span>
              <button
                className="t-nav text-secondary underline"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="t-nav">
                Register
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}