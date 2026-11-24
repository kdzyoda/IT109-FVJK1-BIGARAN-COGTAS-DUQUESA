"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Role, useAuth } from "@/components/auth-provider";
import { ApiError, USE_MOCK, apiRequest } from "@/lib/api";

const roles: Role[] = ["customer", "vendor", "runner", "admin"];
type Result = { path: string; status: number; message: string } | null;

export function RoleApiTester() {
  const { user, token } = useAuth();
  const [result, setResult] = useState<Result>(null);
  const [busy, setBusy] = useState(false);

  async function call(role: Role) {
    const path = `/api/${role}/dashboard`;
    setBusy(true);
    try {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (user?.role === role) {
          setResult({ path, status: 200, message: `Welcome to the ${role} area (mock).` });
        } else {
          setResult({ path, status: 403, message: "Forbidden: your role cannot use this endpoint (mock)." });
        }
      } else {
        const data = await apiRequest<{ message?: string }>(path, { token });
        setResult({ path, status: 200, message: data.message ?? "OK" });
      }
    } catch (err) {
      if (err instanceof ApiError) setResult({ path, status: err.status, message: err.message });
      else setResult({ path, status: 0, message: "Request failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="t-section text-xl">Role access test</h2>
          <p className="t-desc text-sm text-muted-foreground">
            Calls each role-only endpoint with your token. The backend decides: 200 allowed, 403 forbidden.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
                       <Button key={r} variant="outline" size="sm" className="max-w-full truncate" disabled={busy} onClick={() => call(r)}>
              GET /api/{r}/dashboard
            </Button>
          ))}
        </div>

        {result && (
          <div
            className={`rounded-lg p-3 text-sm ${
              result.status === 200 ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
            }`}
          >
            <p className="t-nav">
              {result.path} returned {result.status === 0 ? "no response" : result.status}
            </p>
            <p className="t-desc">{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}