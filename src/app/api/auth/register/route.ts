import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/services";
import { createToken, USER_COOKIE, COOKIE_OPTS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة" }, { status: 400 });

    const user = await createUser({ name, email, password });
    const token = createToken({ sub: user.id, email: user.email, role: user.role as any });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(USER_COOKIE, token, COOKIE_OPTS);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في الخادم" }, { status: 500 });
  }
}
