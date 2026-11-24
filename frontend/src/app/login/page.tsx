import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell title="Hungry? Sign in and order." subtitle="Freshly made, just for you">
      <div className="mb-6 space-y-1">
        <h2 className="t-section text-2xl text-primary sm:text-3xl">Welcome back</h2>
        <p className="t-desc text-sm text-muted-foreground">Sign in to place and track your orders.</p>
      </div>
      <LoginForm />
    </AuthShell>
  );
}