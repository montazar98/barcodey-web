import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSiteConfig } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const config = await getSiteConfig();
    const botToken = config.telegram_bot_token;
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const body = await req.json();

    // Helper to send messages
    const sendMessage = async (chatId: number, text: string) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      });
    };

    // 1. Handle incoming text commands (like /start)
    if (body.message && body.message.text) {
      const text = body.message.text.trim();
      if (text.startsWith("/start")) {
        const chatId = body.message.chat.id;

        const basePrice = Number(config.pro_plan_price || 2500);
        const discountActive = config.discount_active === "true";
        const discountPercent = Number(config.discount_percent || 0);
        const finalPrice = discountActive ? (basePrice - (basePrice * discountPercent) / 100) : basePrice;
        
        // If the admin entered a small number (e.g., 29), treat it as USD and multiply by rate.
        // If they entered a large number (e.g., 2500), treat it directly as Stars.
        const rate = Number(config.telegram_stars_usd || 50);
        const starsAmount = finalPrice < 1000 ? Math.round(finalPrice * rate) : Math.round(finalPrice);

        // Send Invoice directly in chat
        await fetch(`https://api.telegram.org/bot${botToken}/sendInvoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            title: `اشتراك ${config.pro_plan_name || "الاحترافي"}`,
            description: "احصل على جميع الميزات الاحترافية لإنشاء وإدارة الباركود",
            payload: "buy_pro",
            currency: "XTR", // Telegram Stars
            prices: [{ label: "الاشتراك", amount: starsAmount }],
          }),
        });
        return NextResponse.json({ ok: true });
      }
    }

    // 2. Answer PreCheckoutQuery (Required by Telegram to confirm payment can proceed)
    if (body.pre_checkout_query) {
      const queryId = body.pre_checkout_query.id;
      await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_checkout_query_id: queryId,
          ok: true,
        }),
      });
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Successful Payment
    if (body.message && body.message.successful_payment) {
      const payment = body.message.successful_payment;
      const chatId = body.message.chat.id;
      
      if (payment.invoice_payload === "buy_pro") {
        // Generate an activation code
        const code = "PRO-" + Math.random().toString(36).substring(2, 10).toUpperCase();

        // Save it in the database with discount = 999 (Special Flag for PRO Activation)
        await db.coupon.create({
          data: {
            code: code,
            discount: 999,
            isActive: true,
          }
        });

        // Send the code to the user
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barcodey.online";
        const activationLink = `${siteUrl}/activate?code=${code}`;

        const successText = `شكراً لشرائك! 🎉\n\nتم تأكيد الدفع بنجاح. هذا هو كود التفعيل الخاص بك:\n\`${code}\`\n\nلتفعيل حسابك مباشرة، اضغط على الرابط التالي (إذا كنت مسجلاً الدخول، سيتم التفعيل فوراً):\n[تفعيل الحساب الآن](${activationLink})`;

        await sendMessage(chatId, successText);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram Webhook Error:", e);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
