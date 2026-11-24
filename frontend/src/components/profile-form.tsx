"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AddressFields } from "@/components/address-fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { Address, emptyAddress } from "@/lib/psgc";

const NAME_RE = /^[\p{L} .'-]{2,60}$/u;
const MOBILE_RE = /^(09|\+639)\d{9}$/;
const STREET_RE = /^[A-Za-z0-9 .,#'-]{3,80}$/;
const STORAGE_KEY = "paddlergo-profile";

type Errors = { name?: string; mobile?: string; street?: string; address?: string };

export function ProfileForm() {
  const { user, ready } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [street, setStreet] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setName(p.name ?? "");
        setMobile(p.mobile ?? "");
        setStreet(p.street ?? "");
        setAddress(p.address ?? emptyAddress);
      } else if (user) {
        setName(user.name);
      }
    } catch {
      // ignore broken or blocked storage
    }
    setLoaded(true);
  }, [ready, user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!NAME_RE.test(name.trim())) next.name = "Enter your full name (2-60 letters).";
    if (!MOBILE_RE.test(mobile.trim())) next.mobile = "Use 09XXXXXXXXX or +639XXXXXXXXX.";
    if (!STREET_RE.test(street.trim())) next.street = "Enter house no. and street (3-80 characters).";
    if (!address.region || !address.city || !address.barangay) {
      next.address = "Please complete the address: region, city / municipality and barangay.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    // TEMP MOCK: saved in this browser only. The Laravel profile endpoint replaces this later.
    // The PSGC codes are saved together with their place names.
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: name.trim(), mobile: mobile.trim(), street: street.trim(), address })
      );
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save your profile.");
    }
    setSaving(false);
  }

  if (!ready) return <p className="t-desc text-muted-foreground">Loading...</p>;

  if (!user) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <p className="t-desc">Please sign in to edit your profile.</p>
          <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!loaded) return <p className="t-desc text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={save} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input id="mobile" value={mobile} maxLength={13} placeholder="09123456789" onChange={(e) => setMobile(e.target.value)} />
            {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
          </div>

          <AddressFields value={address} onChange={setAddress} error={errors.address} />

          <div className="space-y-2">
            <Label htmlFor="street">House no. and street</Label>
            <Input id="street" value={street} maxLength={80} onChange={(e) => setStreet(e.target.value)} />
            {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
          </div>

          <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}