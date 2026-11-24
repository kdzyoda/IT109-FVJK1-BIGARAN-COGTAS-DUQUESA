"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Address,
  Place,
  emptyAddress,
  getBarangays,
  getCitiesByProvince,
  getCitiesByRegion,
  getProvinces,
  getRegions,
} from "@/lib/psgc";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

type Props = { value: Address; onChange: (a: Address) => void; error?: string };

export function AddressFields({ value, onChange, error }: Props) {
  const [regions, setRegions] = useState<Place[]>([]);
  const [provinces, setProvinces] = useState<Place[]>([]);
  const [cities, setCities] = useState<Place[]>([]);
  const [barangays, setBarangays] = useState<Place[]>([]);
  const [noProvinces, setNoProvinces] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load regions, and restore the lists for an address that was saved earlier.
  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        const r = await getRegions();
        if (!alive) return;
        setRegions(r);
        if (!value.region) return;
        const p = await getProvinces(value.region.code);
        if (!alive) return;
        setProvinces(p);
        setNoProvinces(p.length === 0);
        const c = value.province
          ? await getCitiesByProvince(value.province.code)
          : await getCitiesByRegion(value.region.code);
        if (!alive) return;
        setCities(c);
        if (value.city) {
          const b = await getBarangays(value.city.code);
          if (alive) setBarangays(b);
        }
      } catch {
        toast.error("Could not load address data. Check your internet and refresh.");
      }
    }
    init();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pickRegion(code: string) {
    const region = regions.find((r) => r.code === code) ?? null;
    onChange({ ...emptyAddress, region });
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setNoProvinces(false);
    if (!region) return;
    setBusy(true);
    try {
      const p = await getProvinces(region.code);
      setProvinces(p);
      if (p.length === 0) {
        setNoProvinces(true);
        setCities(await getCitiesByRegion(region.code));
      }
    } catch {
      toast.error("Could not load provinces. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pickProvince(code: string) {
    const province = provinces.find((p) => p.code === code) ?? null;
    onChange({ ...value, province, city: null, barangay: null });
    setCities([]);
    setBarangays([]);
    if (!province) return;
    setBusy(true);
    try {
      setCities(await getCitiesByProvince(province.code));
    } catch {
      toast.error("Could not load cities. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pickCity(code: string) {
    const city = cities.find((c) => c.code === code) ?? null;
    onChange({ ...value, city, barangay: null });
    setBarangays([]);
    if (!city) return;
    setBusy(true);
    try {
      setBarangays(await getBarangays(city.code));
    } catch {
      toast.error("Could not load barangays. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function pickBarangay(code: string) {
    onChange({ ...value, barangay: barangays.find((b) => b.code === code) ?? null });
  }

  const provinceOff = !value.region || noProvinces || busy;
  const cityOff = !value.region || (!noProvinces && !value.province) || busy;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <select id="region" className={selectClass} value={value.region?.code ?? ""} onChange={(e) => pickRegion(e.target.value)}>
          <option value="">Select region</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="province">Province</Label>
        <select id="province" className={selectClass} disabled={provinceOff} value={value.province?.code ?? ""} onChange={(e) => pickProvince(e.target.value)}>
          <option value="">{noProvinces ? "Not applicable" : "Select province"}</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City / Municipality</Label>
        <select id="city" className={selectClass} disabled={cityOff} value={value.city?.code ?? ""} onChange={(e) => pickCity(e.target.value)}>
          <option value="">Select city / municipality</option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="barangay">Barangay</Label>
        <select id="barangay" className={selectClass} disabled={!value.city || busy} value={value.barangay?.code ?? ""} onChange={(e) => pickBarangay(e.target.value)}>
          <option value="">Select barangay</option>
          {barangays.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
      </div>

      {busy && <p className="t-desc text-sm text-muted-foreground sm:col-span-2">Loading...</p>}
      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
    </div>
  );
}