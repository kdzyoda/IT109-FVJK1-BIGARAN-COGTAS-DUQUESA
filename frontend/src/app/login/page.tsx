import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AuthBackground } from "@/components/auth-background";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthBackground>
      <Card className="border-t-4 border-t-secondary bg-white/95 shadow-2xl backdrop-blur">
        <CardContent className="space-y-6 pt-6 pb-8">
          <Link
            href="/menu"
            className="t-nav inline-block text-sm text-primary/80 transition hover:text-primary hover:underline"
          >
            ← Back to menu
          </Link>

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
    </AuthBackground>
  );
}