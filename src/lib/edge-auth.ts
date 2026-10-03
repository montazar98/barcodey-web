/**
 * Edge-compatible token verification using native Web Crypto API
 * Works inside Next.js Middleware and Edge Runtime without Node.js 'crypto' module
 */

export const SECRET = process.env.AUTH_SECRET || "barcodey-secret-jwt-2024-Xp9k!";
export const USER_COOKIE = "bkd_user";
export const ADMIN_COOKIE = "bkd_admin";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface EdgeTokenPayload {
  sub: string;
  email: string;
  role: "user" | "admin" | "USER" | "ADMIN";
  iat: number;
}

export async function verifyTokenEdge(token?: string | null): Promise<EdgeTokenPayload | null> {
  if (!token) return null;
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const base64Sig = sig.replace(/-/g, "+").replace(/_/g, "/");
    const sigPad = base64Sig.length % 4 ? "=".repeat(4 - (base64Sig.length % 4)) : "";
    const binarySig = Uint8Array.from(atob(base64Sig + sigPad), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      binarySig,
      encoder.encode(data)
    );

    if (!isValid) return null;

    const base64Data = data.replace(/-/g, "+").replace(/_/g, "/");
    const dataPad = base64Data.length % 4 ? "=".repeat(4 - (base64Data.length % 4)) : "";
    const payload = JSON.parse(atob(base64Data + dataPad)) as EdgeTokenPayload;

    if (Date.now() - payload.iat > TOKEN_TTL_MS) return null;

    return payload;
  } catch {
    return null;
  }
}
