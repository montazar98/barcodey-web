import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "./auth";

const FILE = path.join(process.cwd(), "data", "users.json");

export type Plan = "free" | "pro" | "business";
export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  plan: Plan;
  isActive: boolean;
  isEmailVerified: boolean;
  qrCount: number;
  totalScans: number;
  createdAt: string;
  lastLoginAt: string | null;
  avatar?: string;
}

export type PublicUser = Omit<User, "passwordHash">;

// ─── IO ───────────────────────────────────────────────────────────────────
async function read(): Promise<User[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

async function write(data: User[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

// ─── CRUD ─────────────────────────────────────────────────────────────────
export async function getAllUsers(): Promise<PublicUser[]> {
  const users = await read();
  return users.map(({ passwordHash, ...u }) => u);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const users = await read();
  const u = users.find((u) => u.id === id);
  if (!u) return null;
  const { passwordHash, ...pub } = u;
  return pub;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await read();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const users = await read();

  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("البريد الإلكتروني مسجّل مسبقاً");
  }

  const now = new Date().toISOString();
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: "user",
    plan: "free",
    isActive: true,
    isEmailVerified: false,
    qrCount: 0,
    totalScans: 0,
    createdAt: now,
    lastLoginAt: null,
  };

  users.push(newUser);
  await write(users);

  const { passwordHash, ...pub } = newUser;
  return pub;
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, "id" | "email" | "passwordHash" | "createdAt">>
): Promise<PublicUser | null> {
  const users = await read();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  await write(users);

  const { passwordHash, ...pub } = users[idx];
  return pub;
}

export async function recordLogin(id: string): Promise<void> {
  const users = await read();
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    users[idx].lastLoginAt = new Date().toISOString();
    await write(users);
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await read();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  await write(users);
  return true;
}

export async function getUserStats() {
  const users = await read();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    newToday: users.filter((u) => u.createdAt.startsWith(todayStr)).length,
    newThisWeek: users.filter((u) => new Date(u.createdAt) >= weekAgo).length,
    byPlan: {
      free: users.filter((u) => u.plan === "free").length,
      pro: users.filter((u) => u.plan === "pro").length,
      business: users.filter((u) => u.plan === "business").length,
    },
  };
}
