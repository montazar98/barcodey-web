import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/services";
import { USER_COOKIE, COOKIE_OPTS } from "@/lib/auth";

// Re-export getClientIp since we defined it in auth originally — but it's now in analytics
// Actually define the IP extraction inline:
function extractIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });

    const { user, token } = await loginUser(email, password, extractIp(req));

    const res = NextResponse.json({ user });
    res.cookies.set(USER_COOKIE, token, COOKIE_OPTS);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في الخادم" }, { status: 401 });
  }
}
