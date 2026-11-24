export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

// TEMP: true = fake checkout so the UI works without Laravel.
// Set to false when the real API is ready.
export const USE_MOCK = true;