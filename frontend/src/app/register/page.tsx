import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account and start ordering." subtitle="Order, relax, we'll deliver.">
      <div className="mb-6 space-y-1">
        <h2 className="t-section text-2xl text-primary sm:text-3xl">Create account</h2>
        <p className="t-desc text-sm text-muted-foreground">It only takes a minute.</p>
      </div>
      <RegisterForm />
    </AuthShell>
  );
}