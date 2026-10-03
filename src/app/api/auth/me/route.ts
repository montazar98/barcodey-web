import { NextRequest, NextResponse } from "next/server";
import { verifyToken, USER_COOKIE } from "@/lib/auth";
import { getUserById } from "@/lib/services";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(USER_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const user = await getUserById(payload.sub);
  if (!user || !user.isActive) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user });
}
