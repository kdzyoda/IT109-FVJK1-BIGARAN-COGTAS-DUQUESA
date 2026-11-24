import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-primary p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-8 pb-8">
          <div className="space-y-2 text-center">
            <Link href="/" className="t-brand text-3xl text-primary">
              PaddlerGo
            </Link>
            <h1 className="t-hero text-2xl">Create your account</h1>
            <p className="t-promo text-primary/80">Order, relax, we&apos;ll deliver.</p>
          </div>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}