import { NextRequest, NextResponse } from "next/server";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import db from "@/lib/db";

type Params = { params: { id: string } };

function isAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return (token ? verifyToken(token) : null)?.role === "admin";
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const user = await db.user.update({
    where: { id: params.id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.plan && { plan: body.plan }),
      ...(body.role && { role: body.role }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    select: { id: true, name: true, email: true, plan: true, isActive: true },
  }).catch(() => null);
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await db.user.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ success: true });
}
