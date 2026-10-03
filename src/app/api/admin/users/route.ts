import { NextRequest, NextResponse } from "next/server";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import db from "@/lib/db";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return (token ? verifyToken(token) : null)?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, plan: true, role: true,
      isActive: true, createdAt: true, lastLoginAt: true, loginCount: true,
    },
  });
  return NextResponse.json({ users });
}
