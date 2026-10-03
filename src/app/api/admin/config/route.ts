import { NextRequest, NextResponse } from "next/server";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import db from "@/lib/db";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const p = token ? verifyToken(token) : null;
  return p?.role === "admin";
}

// GET all config
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const config = await db.siteConfig.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  return NextResponse.json({ config });
}

// PATCH update config values
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { updates } = await req.json(); // { key: value, ... }
  if (!updates || typeof updates !== "object")
    return NextResponse.json({ error: "updates مطلوب" }, { status: 400 });

  const results = await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      db.siteConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
  return NextResponse.json({ updated: results.length });
}
