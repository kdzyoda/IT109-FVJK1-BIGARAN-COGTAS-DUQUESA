import { ApiError } from "@/lib/api";

type MockRole = "customer" | "vendor" | "runner" | "admin";
type MockUser = {
  id: number;
  username: string;
  email?: string;
  role: MockRole;
  canteen_id?: number;
};

// TEMP MOCK: seeded accounts. Mock login accepts any non-empty password and
// never stores passwords. The real API checks hashed passwords in Laravel.
const SEEDED: MockUser[] = [
  { id: 1, username: "admin01", role: "admin" },
  { id: 2, username: "vendor01", role: "vendor", canteen_id: 1 },
  { id: 3, username: "runner01", role: "runner" },
  { id: 4, username: "customer01", role: "customer" },
];

const KEY = "paddlergo-mock-users";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function registered(): MockUser[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export async function mockLogin(username: string, password: string) {
  await wait(500);
  const found = [...SEEDED, ...registered()].find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!found || password === "") {
    throw new ApiError("Invalid username or password.", 401);
  }
  return { message: "Login successful", user: found, token: "mock-token" };
}

export async function mockRegister(input: { username: string; email: string }) {
  await wait(500);
  const all = [...SEEDED, ...registered()];
  const errors: Record<string, string[]> = {};
  if (all.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
    errors.username = ["That username is already taken."];
  }
  if (all.some((u) => u.email && u.email.toLowerCase() === input.email.toLowerCase())) {
    errors.email = ["That email is already registered."];
  }
  if (Object.keys(errors).length > 0) {
    throw new ApiError("The given data was invalid.", 422, errors);
  }
  const user: MockUser = {
    id: Date.now(),
    username: input.username,
    email: input.email,
    role: "customer",
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([...registered(), user]));
  } catch {
    // ignore blocked storage
  }
}