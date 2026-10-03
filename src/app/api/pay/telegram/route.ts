import { NextRequest, NextResponse } from "next/server";
import { verifyToken, USER_COOKIE } from "@/lib/auth";
import { getSiteConfig } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const userToken = req.cookies.get(USER_COOKIE)?.value;
    const userPayload = userToken ? verifyToken(userToken) : null;
    if (!userPayload) {
      return NextResponse.json({ error: "يجب تسجيل الدخول للاشتراك" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!["PRO", "BUSINESS"].includes(plan)) {
      return NextResponse.json({ error: "خطة غير صالحة" }, { status: 400 });
    }

    const config = await getSiteConfig();
    
    if (config.payment_enabled !== "true" || config.payment_gateway !== "telegram") {
      return NextResponse.json({ error: "بوابة الدفع غير مفعلة حالياً" }, { status: 400 });
    }

    const botToken = config.telegram_bot_token;
    if (!botToken) {
      return NextResponse.json({ error: "لم يتم إعداد بوت تليغرام" }, { status: 500 });
    }

    const basePrice = plan === "PRO" ? Number(config.pro_plan_price || 29) : Number(config.biz_plan_price || 99);
    
    // Apply discount
    const discountActive = config.discount_active === "true";
    const discountPercent = Number(config.discount_percent || 0);
    const usdPrice = discountActive ? (basePrice - (basePrice * discountPercent) / 100) : basePrice;

    const rate = Number(config.telegram_stars_usd || 50);
    const starsAmount = usdPrice * rate;

    // Create Invoice Link
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `اشتراك ${plan === "PRO" ? config.pro_plan_name : config.biz_plan_name}`,
        description: `ترقية حسابك في باركودي إلى خطة ${plan}`,
        payload: `${userPayload.sub}|${plan}`, // Include user ID and Plan in payload
        currency: "XTR",
        prices: [{ label: "الاشتراك", amount: starsAmount }],
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error("Telegram Invoice Error:", data);
      return NextResponse.json({ error: "فشل في توليد رابط الدفع من تليغرام" }, { status: 500 });
    }

    return NextResponse.json({ url: data.result });
  } catch (e: any) {
    console.error("Payment API Error:", e);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
