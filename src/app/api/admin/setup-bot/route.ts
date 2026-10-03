import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const config = await getSiteConfig();
    const token = config.telegram_bot_token;

    if (!token) {
      return NextResponse.json({ error: "لم يتم إدخال توكن البوت في الإعدادات" }, { status: 400 });
    }

    // Get current host from request headers
    const host = req.headers.get("host") || "";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const domain = `${protocol}://${host}`;

    if (domain.includes("localhost") || domain.includes("127.0.0.1")) {
      return NextResponse.json({ error: "لا يمكن ربط البوت أثناء العمل على جهازك المحلي (localhost). يجب رفع الموقع أولاً للحصول على رابط حقيقي (https)." }, { status: 400 });
    }

    const webhookUrl = `${domain}/api/webhooks/telegram`;
    const tgUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`;

    const tgRes = await fetch(tgUrl);
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return NextResponse.json({ error: tgData.description || "فشل الربط مع تليغرام" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "تم ربط البوت بالموقع بنجاح!" });
  } catch (e: any) {
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
