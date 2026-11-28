import { API_BASE_URL, USE_MOCK } from "@/lib/api";

// Sends the image to Laravel, which stores it in object storage (Cloudinary or
// Supabase Storage) and returns only the file URL. The database saves the URL, never the file.
export async function uploadImage(file: File): Promise<string> {
  if (USE_MOCK) return URL.createObjectURL(file); // TEMP MOCK preview

  const body = new FormData();
  body.append("image", file);
  const res = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
    body,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}