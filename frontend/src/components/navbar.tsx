"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";

export function Navbar() {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function leave() {
    setOpen(false);
    signOut();
    router.push("/");
  }

  const links = (
    <>
      <Link href="/menu" className="t-nav flex items-center gap-2" onClick={() => setOpen(false)}>
        Menu
        {count > 0 && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{count}</span>
        )}
      </Link>

      {user ? (
        <>
          <Link href={`/dashboard/${user.role}`} className="t-nav" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/profile" className="t-nav" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <span className="t-desc text-sm text-primary-foreground/70">
            {user.username} ({user.role})
          </span>
          <button
            className="t-nav w-fit rounded-lg border border-secondary/60 px-3 py-1.5 text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={leave}
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link href="/register" className="t-nav" onClick={() => setOpen(false)}>
            Register
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "secondary" })}
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="t-brand text-2xl text-secondary">
          PaddlerGo
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-5 md:flex">{links}</nav>

        {/* Phone menu button */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-white/10 bg-black/20 px-4 py-4 md:hidden">
          {links}
        </nav>
      )}
    </header>
  );
}