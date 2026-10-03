import { NextResponse } from "next/server";
import { USER_COOKIE, ADMIN_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(USER_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
