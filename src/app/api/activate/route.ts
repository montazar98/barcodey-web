import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken, USER_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userToken = req.cookies.get(USER_COOKIE)?.value;
    const userPayload = userToken ? verifyToken(userToken) : null;
    if (!userPayload) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لتفعيل الاشتراك" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "الرجاء إدخال كود التفعيل" }, { status: 400 });
    }

    // Find Coupon
    const coupon = await db.coupon.findUnique({ where: { code } });
    if (!coupon) {
      return NextResponse.json({ error: "الكود غير صحيح" }, { status: 404 });
    }
    if (!coupon.isActive) {
      return NextResponse.json({ error: "هذا الكود مستخدم مسبقاً أو غير صالح" }, { status: 400 });
    }

    // Special flag 999 means it's a PRO activation code
    if (coupon.discount !== 999) {
      return NextResponse.json({ error: "هذا الكود ليس كود تفعيل اشتراك" }, { status: 400 });
    }

    // Mark code as used
    await db.coupon.update({
      where: { id: coupon.id },
      data: { isActive: false },
    });

    // Upgrade user
    await db.user.update({
      where: { id: userPayload.sub },
      data: { plan: "PRO" },
    });

    // Create Subscription record
    await db.subscription.create({
      data: {
        userId: userPayload.sub,
        plan: "PRO",
        status: "ACTIVE",
        amount: 0, // Since it was paid in telegram, or we can store Stars here if we passed it.
        currency: "XTR",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Activation Error:", e);
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
