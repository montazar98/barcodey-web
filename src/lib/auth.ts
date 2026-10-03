import crypto from "crypto";

// ─── Config ───────────────────────────────────────────────────────────────
export const SECRET     = process.env.AUTH_SECRET     || "barcodey-secret-jwt-2024-Xp9k!";
export const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@barcodey.online";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@Bkd2024!";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Password hashing ─────────────────────────────────────────────────────
export function hashPassword(plain: string): string {
  return crypto.createHmac("sha256", SECRET).update(plain).digest("hex");
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}

// ─── Token (signed base64 JWT-like) ──────────────────────────────────────
export interface TokenPayload {
  sub: string;          // user id  (or "admin")
  email: string;
  role: "user" | "admin";
  iat: number;
}

export function createToken(payload: Omit<TokenPayload, "iat">): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, iat: Date.now() })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as TokenPayload;
    if (Date.now() - payload.iat > TOKEN_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Cookie names ─────────────────────────────────────────────────────────
export const USER_COOKIE  = "bkd_user";
export const ADMIN_COOKIE = "bkd_admin";

export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days (seconds)
};
