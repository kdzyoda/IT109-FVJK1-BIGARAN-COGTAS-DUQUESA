"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import type { MenuItemInput } from "@/components/menu-provider";
import { MenuItem } from "@/lib/menu-data";

const NAME_RE = /^[A-Za-z0-9 .,'&()-]{2,60}$/;
const DESC_RE = /^[A-Za-z0-9 .,'&()!?-]{0,120}$/;
const PRICE_RE = /^\d+(\.\d{1,2})?$/;

type Errors = { name?: string; desc?: string; price?: string };
type Props = {
  canteenId: number;
  item?: MenuItem;
  onSave: (v: MenuItemInput) => void;
  onCancel: () => void;
};

export function MenuItemForm({ canteenId, item, onSave, onCancel }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [desc, setDesc] = useState(item?.desc ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [image, setImage] = useState<string | undefined>(item?.image);
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!NAME_RE.test(name.trim())) next.name = "Name: 2-60 letters, numbers or . , ' & ( ) -";
    if (!DESC_RE.test(desc.trim())) next.desc = "Description: up to 120 characters, no special symbols.";
    const p = Number(price);
    if (!PRICE_RE.test(price.trim()) || p < 1 || p > 9999) {
      next.price = "Price: 1 to 9999, up to 2 decimals (e.g. 85 or 85.50).";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    onSave({
      id: item?.id,
      canteenId,
      name: name.trim(),
      desc: desc.trim(),
      price: p,
      available,
      image,
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-4">
          <h3 className="t-section text-xl">{item ? "Edit menu item" : "Add menu item"}</h3>

          <div className="space-y-2">
            <Label htmlFor="item-name">Name</Label>
            <Input id="item-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-desc">Description</Label>
            <Input id="item-desc" value={desc} maxLength={120} onChange={(e) => setDesc(e.target.value)} />
            {errors.desc && <p className="text-sm text-destructive">{errors.desc}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-price">Price (₱)</Label>
            <Input id="item-price" inputMode="decimal" value={price} maxLength={7} onChange={(e) => setPrice(e.target.value)} />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>

          <ImageUpload label="Photo" value={image} onChange={setImage} />

          <label className="t-nav flex items-center gap-2 text-sm">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            Available for ordering
          </label>

          <div className="flex gap-2">
            <Button type="submit" variant="secondary">
              {item ? "Save changes" : "Add item"}
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