"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";

const MAX_MB = 2;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
};

export function ImageUpload({ label, value, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be ${MAX_MB} MB or smaller.`);
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="t-nav text-sm">{label}</p>
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-lg bg-muted text-xs text-muted-foreground">
          {value ? <img src={value} alt={label} className="h-full w-full object-cover" /> : "No image"}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading..." : value ? "Change image" : "Upload image"}
          </Button>
          {value && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}