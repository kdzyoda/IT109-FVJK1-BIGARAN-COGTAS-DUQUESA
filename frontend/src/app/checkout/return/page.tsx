import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { CheckoutReturn } from "@/components/checkout-return";

export default function CheckoutReturnPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 py-10">
        <Suspense fallback={<p className="t-desc text-center text-muted-foreground">Loading...</p>}>
          <CheckoutReturn />
        </Suspense>
      </main>
    </div>
  );
}