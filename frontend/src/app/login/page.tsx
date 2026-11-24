"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  function signInWithGoogle() {
    setLoading(true);
    toast.info("Redirecting you to Google...");
    // Laravel handles the Google OAuth flow (route agreed with Duquesa).
    window.location.href = `${API_BASE_URL}/api/auth/google/redirect`;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-primary p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-8 pb-8">
          <div className="space-y-2 text-center">
            <Link href="/" className="t-brand text-3xl text-primary">
              PaddlerGo
            </Link>
            <h1 className="t-hero text-2xl">Welcome back</h1>
            <p className="t-promo text-primary/80">Order, relax, we&apos;ll deliver.</p>
          </div>

          <Button
            size="lg"
            className="w-full"
            variant="secondary"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Continue with Google"}
          </Button>

          <p className="t-desc text-center text-sm text-muted-foreground">
            New here? Signing in with Google creates your account automatically.
          </p>

          <Link href="/" className="t-nav block text-center text-sm text-primary underline">
            Back to home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}