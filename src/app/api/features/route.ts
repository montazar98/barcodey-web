import { NextRequest, NextResponse } from "next/server";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import db from "@/lib/db";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const p = token ? verifyToken(token) : null;
  return p?.role === "admin" ? p : null;
}

// GET = list all feature flags
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ flags });
}

// PATCH = update a feature flag
export async function PATCH(req: NextRequest) {
  const admin = isAdmin(req);
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { key, isEnabled, minPlan, requiresAuth } = await req.json();
  if (!key) return NextResponse.json({ error: "key مطلوب" }, { status: 400 });

  const updated = await db.featureFlag.update({
    where: { key },
    data: {
      ...(isEnabled !== undefined && { isEnabled }),
      ...(minPlan !== undefined && { minPlan: minPlan || null }),
      ...(requiresAuth !== undefined && { requiresAuth }),
      updatedBy: admin.email,
    },
  });
  return NextResponse.json({ flag: updated });
}
