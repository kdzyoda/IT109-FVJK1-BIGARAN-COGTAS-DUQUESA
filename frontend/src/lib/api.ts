export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

// TEMP: true = fake API so the UI works without Laravel.
// Set to false when the Laravel API is ready.
export const USE_MOCK = false;

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type Options = { method?: string; body?: unknown; token?: string | null };

export async function apiRequest<T>(path: string, options: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running.", 0);
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    throw new ApiError("Too many attempts. Please wait a minute and try again.", 429);
  }
  if (!res.ok) {
    throw new ApiError(data.message ?? "Something went wrong.", res.status, data.errors ?? {});
  }
  return data as T;
}