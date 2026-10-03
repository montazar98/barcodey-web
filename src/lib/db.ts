import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Serverless-safe connection URL.
 * - Supabase pooler on 5432 = "session mode" (max 15 clients) → exhausted quickly on Vercel.
 *   Force 6543 ("transaction mode") + pgbouncer=true.
 * - Limit each serverless instance to 1 connection so instances don't flood the pool.
 */
function buildDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw || !raw.startsWith("postgres")) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("pooler.supabase.com")) {
      if (url.port === "5432" || url.port === "") url.port = "6543";
      url.searchParams.set("pgbouncer", "true");
    }
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "1");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "30");
    return url.toString();
  } catch {
    return raw;
  }
}

const databaseUrl = buildDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  });

// Reuse one client per instance (dev hot-reload AND warm serverless invocations)
globalForPrisma.prisma = db;

export default db;
