import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-primary p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-8 pb-8">
          <div className="space-y-2 text-center">
            <Link href="/" className="t-brand text-3xl text-primary">
              PaddlerGo
            </Link>
            <h1 className="t-hero text-2xl">Welcome back</h1>
            <p className="t-promo text-primary/80">Sign in to continue</p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}