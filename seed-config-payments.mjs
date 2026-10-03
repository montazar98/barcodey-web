import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const DEFAULT_CONFIG = [
  { key: "payment_enabled",   value: "false",                            type: "boolean", group: "payments", label: "تفعيل بوابات الدفع للمستخدمين" },
  { key: "payment_gateway",   value: "telegram",                         type: "string",  group: "payments", label: "بوابة الدفع (stripe/paypal/telegram)" },
  { key: "telegram_bot_token",value: "",                                 type: "string",  group: "payments", label: "توكن بوت تليغرام (Bot Token)" },
  { key: "telegram_stars_usd",value: "50",                               type: "number",  group: "payments", label: "سعر الدولار مقابل النجوم (مثال: 50)" },
  { key: "stripe_public_key", value: "",                                 type: "string",  group: "payments", label: "Stripe Public Key" },
  { key: "stripe_secret_key", value: "",                                 type: "string",  group: "payments", label: "Stripe Secret Key" },
  { key: "paypal_client_id",  value: "",                                 type: "string",  group: "payments", label: "PayPal Client ID" },
  { key: "paypal_secret",     value: "",                                 type: "string",  group: "payments", label: "PayPal Secret" },
];

async function run() {
  for (const cfg of DEFAULT_CONFIG) {
    await db.siteConfig.upsert({
      where: { key: cfg.key },
      update: { label: cfg.label, group: cfg.group, type: cfg.type, value: cfg.value },
      create: cfg,
    });
  }
  console.log("Done!");
}

run();
