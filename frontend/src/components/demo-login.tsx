"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Role, useAuth } from "@/components/auth-provider";

const demoRoles: { role: Role; label: string }[] = [
  { role: "customer", label: "Customer" },
  { role: "vendor", label: "Vendor" },
  { role: "runner", label: "Runner" },
  { role: "admin", label: "Admin" },
];

export function DemoLogin() {
  const { signInAs } = useAuth();
  const router = useRouter();

  function demoSignIn(role: Role) {
    signInAs(role);
    toast.success(`Signed in as ${role} (demo)`);
    router.push(`/dashboard/${role}`);
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <p className="t-nav text-center text-sm text-muted-foreground">
        Demo mode (temporary, remove when Google sign-in is connected)
      </p>
      <div className="grid grid-cols-2 gap-2">
        {demoRoles.map((d) => (
          <Button key={d.role} variant="outline" onClick={() => demoSignIn(d.role)}>
            {d.label}
          </Button>
        ))}
      </div>
    </div>
  );
}