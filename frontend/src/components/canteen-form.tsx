"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AddressFields } from "@/components/address-fields";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CanteenInput } from "@/components/menu-provider";
import { Canteen } from "@/lib/menu-data";
import { Address, emptyAddress } from "@/lib/psgc";

const NAME_RE = /^[A-Za-z0-9 .,'&()-]{2,60}$/;
const NOTE_RE = /^[A-Za-z0-9 .,'&()!?-]{0,80}$/;

type Errors = { name?: string; note?: string; address?: string };
type Props = {
  canteen?: Canteen;
  onSave: (v: CanteenInput) => void;
  onCancel: () => void;
};

export function CanteenForm({ canteen, onSave, onCancel }: Props) {
  const [name, setName] = useState(canteen?.name ?? "");
  const [note, setNote] = useState(canteen?.note ?? "");
  const [logo, setLogo] = useState<string | undefined>(canteen?.logo);
  const [address, setAddress] = useState<Address>(canteen?.location ?? emptyAddress);
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!NAME_RE.test(name.trim())) next.name = "Name: 2-60 letters, numbers or . , ' & ( ) -";
    if (!NOTE_RE.test(note.trim())) next.note = "Short description: up to 80 characters.";
    if (!address.region || !address.city || !address.barangay) {
      next.address = "Please complete the location: region, city / municipality and barangay.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    onSave({ id: canteen?.id, name: name.trim(), note: note.trim(), logo, location: address });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-4">
          <h3 className="t-section text-xl">{canteen ? "Edit canteen" : "Onboard a canteen"}</h3>

          <div className="space-y-2">
            <Label htmlFor="canteen-name">Canteen name</Label>
            <Input id="canteen-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="canteen-note">Short description</Label>
            <Input id="canteen-note" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} />
            {errors.note && <p className="text-sm text-destructive">{errors.note}</p>}
          </div>

          <ImageUpload label="Logo" value={logo} onChange={setLogo} />

          <p className="t-nav text-sm">Physical location</p>
          <AddressFields value={address} onChange={setAddress} error={errors.address} />

          <div className="flex gap-2">
            <Button type="submit" variant="secondary">
              {canteen ? "Save changes" : "Onboard canteen"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}