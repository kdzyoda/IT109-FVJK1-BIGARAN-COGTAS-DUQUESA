import { Navbar } from "@/components/navbar";
import { MockPay } from "@/components/mock-pay";

export default function MockPayPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 py-10">
        <MockPay />
      </main>
    </div>
  );
}