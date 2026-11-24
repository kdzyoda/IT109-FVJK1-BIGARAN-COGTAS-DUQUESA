"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api";
import { USERNAME_HINT, USERNAME_RE } from "@/lib/validation";

type Errors = { username?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {};
    if (!USERNAME_RE.test(username)) found.username = USERNAME_HINT;
    if (password === "") found.password = "Password is required.";
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const user = await login(username, password);
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
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          maxLength={20}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          maxLength={64}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
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