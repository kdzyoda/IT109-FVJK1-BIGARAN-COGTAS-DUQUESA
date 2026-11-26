"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api";
import { EMAIL_RE, USERNAME_RE } from "@/lib/validation";

type Errors = { login?: string; password?: string };

const LOGIN_HINT = "Enter a valid username (5-30 letters, numbers or underscores) or email address.";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = loginValue.trim();
    const found: Errors = {};
    if (!USERNAME_RE.test(value) && !EMAIL_RE.test(value)) found.login = LOGIN_HINT;
    if (password === "") found.password = "Password is required.";
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const user = await login(value, password);
      toast.success(`Welcome, ${user.name}!`);
      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="login">Username or email</Label>
        <Input
          id="login"
          value={loginValue}
          maxLength={100}
          autoComplete="username"
          onChange={(e) => setLoginValue(e.target.value)}
        />
        {errors.login && <p className="text-sm text-destructive">{errors.login}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          value={password}
          maxLength={64}
          autoComplete="current-password"
          onChange={setPassword}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="t-desc text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="t-nav text-primary underline">
          Register
        </Link>
      </p>
    </form>
  );
}