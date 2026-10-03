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

    const sendMessage = async (chatId: number, text: string, replyMarkup?: any) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chat_id: chatId, 
          text, 
          parse_mode: "Markdown",
          reply_markup: replyMarkup 
        }),
      });
    };

    const sendInvoice = async (chatId: number, stars: number) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendInvoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          title: `اشتراك ${config.pro_plan_name || "الاحترافي"}`,
          description: "احصل على جميع الميزات الاحترافية لإنشاء وإدارة الباركود",
          payload: "buy_pro",
          currency: "XTR", // Telegram Stars
          prices: [{ label: "الاشتراك", amount: stars }],
        }),
      });
    };

    const checkChannelMembership = async (userId: number, channel: string) => {
      try {
        if (!channel.startsWith("@")) channel = "@" + channel;
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channel}&user_id=${userId}`);
        const data = await res.json();
        if (data.ok && ["member", "administrator", "creator"].includes(data.result.status)) {
          return true;
        }
      } catch (e) {
        console.error("Error checking channel membership:", e);
      }
      return false;
    };

    const getBasePrice = () => {
      const basePrice = Number(config.pro_plan_price || 2500);
      const discountActive = config.discount_active === "true";
      const discountPercent = Number(config.discount_percent || 0);
      return discountActive ? (basePrice - (basePrice * discountPercent) / 100) : basePrice;
    };

    const handleBuyRequest = async (chatId: number, userId: number) => {
      const baseFinal = getBasePrice();
      const channel = config.telegram_channel_username;
      const channelDiscount = Number(config.telegram_channel_discount || 0);

      if (channel && channelDiscount > 0) {
        const isMember = await checkChannelMembership(userId, channel);
        if (isMember) {
          const discountedPrice = Math.max(1, Math.round(baseFinal - channelDiscount));
          await sendMessage(chatId, "🎉 تم تطبيق خصم اشتراك القناة بنجاح!");
          await sendInvoice(chatId, discountedPrice);
        } else {
          // Ask them to join
          const cleanChannel = channel.startsWith("@") ? channel.substring(1) : channel;
          await sendMessage(
            chatId,
            `🎁 *احصل على خصم خاص!*\n\nاشترك في قناتنا (${channel}) واحصل على خصم **${channelDiscount} نجمة** على قيمة اشتراكك!\n\nالسعر بدون خصم: ${Math.max(1, Math.round(baseFinal))} ⭐\nالسعر بعد الخصم: ${Math.max(1, Math.round(baseFinal - channelDiscount))} ⭐`,
            {
              inline_keyboard: [
                [{ text: "📣 اشترك في القناة الآن", url: `https://t.me/${cleanChannel}` }],
                [{ text: "✅ تحقق من الاشتراك (للحصول على الخصم)", callback_data: "verify_sub" }],
                [{ text: `شراء بدون خصم (${Math.max(1, Math.round(baseFinal))} ⭐)`, callback_data: "buy_no_discount" }]
              ]
            }
          );
        }
      } else {
        // No channel configured, send regular invoice
        await sendInvoice(chatId, Math.max(1, Math.round(baseFinal)));
      }
    };

    // 1. Handle incoming text commands
    if (body.message && body.message.text) {
      const text = body.message.text.trim();
      const chatId = body.message.chat.id;
      const userId = body.message.from.id;
      if (text.startsWith("/start")) {
        await handleBuyRequest(chatId, userId);
        return NextResponse.json({ ok: true });
      }
    }

    // 2. Handle callback queries (Inline buttons)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const userId = callbackQuery.from.id;
      const data = callbackQuery.data;
      const queryId = callbackQuery.id;

      const answerCb = async (text: string, showAlert = false) => {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: queryId, text, show_alert: showAlert }),
        });
      };

      if (data === "verify_sub") {
        const channel = config.telegram_channel_username;
        if (!channel) {
          await answerCb("القناة غير متوفرة حالياً.", true);
          return NextResponse.json({ ok: true });
        }
        
        const isMember = await checkChannelMembership(userId, channel);
        if (isMember) {
          await answerCb("تم التحقق بنجاح! جاري إرسال الفاتورة...", false);
          const baseFinal = getBasePrice();
          const channelDiscount = Number(config.telegram_channel_discount || 0);
          const discountedPrice = Math.max(1, Math.round(baseFinal - channelDiscount));
          await sendMessage(chatId, "🎉 تم التحقق من اشتراكك في القناة وتم تطبيق الخصم!");
          await sendInvoice(chatId, discountedPrice);
        } else {
          await answerCb("❌ لم نجدك في القناة! يرجى الاشتراك أولاً ثم المحاولة.", true);
        }
      } else if (data === "buy_no_discount") {
        await answerCb("جاري إرسال الفاتورة بدون خصم...", false);
        const baseFinal = getBasePrice();
        await sendInvoice(chatId, Math.max(1, Math.round(baseFinal)));
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Answer PreCheckoutQuery (Required by Telegram to confirm payment can proceed)
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

    // 4. Handle Successful Payment
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
