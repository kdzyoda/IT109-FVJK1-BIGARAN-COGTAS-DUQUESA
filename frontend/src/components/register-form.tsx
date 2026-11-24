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
import {
  EMAIL_RE,
  PASSWORD_HINT,
  PASSWORD_RE,
  USERNAME_HINT,
  USERNAME_RE,
} from "@/lib/validation";

type Form = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};
type Errors = Partial<Record<keyof Form, string>>;

const fields: { key: keyof Form; label: string; type: string; max: number; auto: string }[] = [
  { key: "username", label: "Username", type: "text", max: 20, auto: "username" },
  { key: "email", label: "Email", type: "email", max: 100, auto: "email" },
  { key: "password", label: "Password", type: "password", max: 64, auto: "new-password" },
  { key: "password_confirmation", label: "Confirm password", type: "password", max: 64, auto: "new-password" },
];

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<Form>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!USERNAME_RE.test(form.username)) e.username = USERNAME_HINT;
    if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email address.";
    if (!PASSWORD_RE.test(form.password)) e.password = PASSWORD_HINT;
    if (form.password !== form.password_confirmation) {
      e.password_confirmation = "Passwords do not match.";
    }
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        // Laravel sends 422 errors as { errors: { field: ["message"] } }
        const server: Errors = {};
        for (const [key, msgs] of Object.entries(err.fieldErrors)) {
          if (key in form) server[key as keyof Form] = msgs[0];
        }
        setErrors(server);
        toast.error(Object.keys(server).length > 0 ? "Please fix the highlighted fields." : err.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={f.key}>{f.label}</Label>
          <Input
            id={f.key}
            type={f.type}
            value={form[f.key]}
            maxLength={f.max}
            autoComplete={f.auto}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
          {errors[f.key] && <p className="text-sm text-destructive">{errors[f.key]}</p>}
        </div>
      ))}

      <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <p className="t-desc text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="t-nav text-primary underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}