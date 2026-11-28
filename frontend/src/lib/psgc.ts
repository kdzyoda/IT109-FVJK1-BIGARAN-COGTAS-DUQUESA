const BASE = "https://psgc.gitlab.io/api";

export type Place = { code: string; name: string };

export type Address = {
  region: Place | null;
  province: Place | null;
  city: Place | null;
  barangay: Place | null;
};

export const emptyAddress: Address = {
  region: null,
  province: null,
  city: null,
  barangay: null,
};

async function get(path: string): Promise<Place[]> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error("Could not load address data");
  const data = (await res.json()) as Place[];
  return data
    .map((p) => ({ code: p.code, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const getRegions = () => get("/regions/");
export const getProvinces = (regionCode: string) => get(`/regions/${regionCode}/provinces/`);
export const getCitiesByRegion = (regionCode: string) =>
  get(`/regions/${regionCode}/cities-municipalities/`);
export const getCitiesByProvince = (provinceCode: string) =>
  get(`/provinces/${provinceCode}/cities-municipalities/`);
export const getBarangays = (cityCode: string) =>
  get(`/cities-municipalities/${cityCode}/barangays/`);