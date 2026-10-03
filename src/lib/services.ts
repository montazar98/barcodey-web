import db from "@/lib/db";
import { hashPassword, verifyPassword, createToken, SECRET } from "@/lib/auth";

// ─── Auth (Prisma-backed) ─────────────────────────────────────────────────────

export async function createUser(input: { name: string; email: string; password: string }) {
  const existing = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw new Error("البريد الإلكتروني مسجّل مسبقاً");

  return db.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: hashPassword(input.password),
      role: "USER",
      plan: "FREE",
    },
    select: {
      id: true, name: true, email: true, role: true, plan: true,
      isActive: true, isEmailVerified: true, createdAt: true, lastLoginAt: true,
    },
  });
}

export async function loginUser(email: string, password: string, ip?: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error("البريد أو كلمة المرور غير صحيحة");
  if (!verifyPassword(password, user.passwordHash)) throw new Error("البريد أو كلمة المرور غير صحيحة");
  if (!user.isActive) throw new Error("حسابك موقوف. تواصل مع الدعم.");

  await db.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      loginCount: { increment: 1 },
    },
  });

  const token = createToken({ sub: user.id, email: user.email, role: user.role as any });
  const { passwordHash, ...pub } = user;
  return { user: pub, token };
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, plan: true,
      isActive: true, isEmailVerified: true, avatar: true, company: true,
      website: true, createdAt: true, lastLoginAt: true, loginCount: true,
    },
  });
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

export const DEFAULT_FLAGS = [
  { key: "qr_generator",      name: "مولد رمز QR",             requiresAuth: true,  isEnabled: true, minPlan: null },
  { key: "barcode_generator", name: "مولد الباركود",            requiresAuth: true,  isEnabled: true, minPlan: null },
  { key: "qr_scanner",        name: "قارئ QR والباركود",        requiresAuth: false, isEnabled: true, minPlan: null },
  { key: "bulk_generator",    name: "الإنشاء بالجملة",          requiresAuth: true,  isEnabled: true, minPlan: "PRO" },
  { key: "dynamic_qr",        name: "QR الديناميكي",            requiresAuth: true,  isEnabled: true, minPlan: null },
  { key: "analytics",         name: "التحليلات",                requiresAuth: true,  isEnabled: true, minPlan: null },
  { key: "pdf_export",        name: "تصدير PDF",                requiresAuth: true,  isEnabled: true, minPlan: "PRO" },
  { key: "custom_logo",       name: "شعار مخصص على QR",         requiresAuth: true,  isEnabled: true, minPlan: "PRO" },
  { key: "app_links",         name: "روابط التطبيقات الموحدة",  requiresAuth: true,  isEnabled: true, minPlan: null },
  { key: "blog",              name: "المدونة",                  requiresAuth: false, isEnabled: true, minPlan: null },
  { key: "pricing",           name: "صفحة الأسعار",             requiresAuth: false, isEnabled: true, minPlan: null },
  { key: "registration",      name: "التسجيل الجديد",           requiresAuth: false, isEnabled: true, minPlan: null },
  { key: "adsense",           name: "إعلانات AdSense",          requiresAuth: false, isEnabled: false, minPlan: null },
];

export async function seedFeatureFlags() {
  for (const flag of DEFAULT_FLAGS) {
    await db.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: {
        key: flag.key,
        name: flag.name,
        isEnabled: flag.isEnabled,
        requiresAuth: flag.requiresAuth,
        minPlan: flag.minPlan,
      },
    });
  }
}

export async function getFeatureFlags() {
  noStore();
  const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
  if (flags.length === 0) {
    await seedFeatureFlags();
    return db.featureFlag.findMany({ orderBy: { key: "asc" } });
  }
  return flags;
}

export async function getFlag(key: string) {
  noStore();
  return db.featureFlag.findUnique({ where: { key } });
}

export async function checkFeatureAccess(
  key: string,
  user: { plan: string; role: string } | null
): Promise<{ allowed: boolean; reason?: string }> {
  const flag = await getFlag(key);
  if (!flag) return { allowed: true };
  if (!flag.isEnabled) return { allowed: false, reason: "feature_disabled" };
  if (flag.requiresAuth && !user) return { allowed: false, reason: "auth_required" };
  if (flag.minPlan && user) {
    const ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 };
    const userLevel  = ORDER[user.plan as keyof typeof ORDER] ?? 0;
    const minLevel   = ORDER[flag.minPlan as keyof typeof ORDER] ?? 0;
    if (userLevel < minLevel) return { allowed: false, reason: "upgrade_required", };
  }
  return { allowed: true };
}

// ─── Site Config ─────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG = [
  { key: "site_name",         value: "باركودي",                          type: "string",  group: "general", label: "اسم الموقع" },
  { key: "site_description",  value: "مولد وقارئ باركود ورموز QR",      type: "string",  group: "general", label: "وصف الموقع" },
  { key: "adsense_id",        value: "",                                  type: "string",  group: "ads",     label: "معرّف AdSense" },
  { key: "adsense_slot_top",  value: "",                                  type: "string",  group: "ads",     label: "كود وحدة الإعلان العلوي" },
  { key: "maintenance_mode",  value: "false",                             type: "boolean", group: "general", label: "وضع الصيانة" },
  { key: "max_free_qr",       value: "10",                               type: "number",  group: "limits",  label: "حد الرموز المجانية" },
  { key: "max_pro_qr",        value: "100",                              type: "number",  group: "limits",  label: "حد الرموز Pro" },
  { key: "analytics_enabled", value: "true",                             type: "boolean", group: "general", label: "تتبع الزوار" },
  
  { key: "payment_enabled",   value: "false",                            type: "boolean", group: "payments", label: "تفعيل بوابات الدفع للمستخدمين" },
  { key: "payment_gateway",   value: "telegram",                         type: "string",  group: "payments", label: "بوابة الدفع (stripe/paypal/telegram)" },
  { key: "telegram_bot_username", value: "",                             type: "string",  group: "payments", label: "يوزر البوت (بدون @)" },
  { key: "telegram_bot_token",value: "",                                 type: "string",  group: "payments", label: "توكن بوت تليغرام (Bot Token)" },
  { key: "telegram_channel_username", value: "",                         type: "string",  group: "payments", label: "يوزر القناة للخصم (مع @)" },
  { key: "telegram_channel_discount", value: "0",                        type: "number",  group: "payments", label: "خصم نجوم عند الاشتراك بالقناة" },
  { key: "stripe_public_key", value: "",                                 type: "string",  group: "payments", label: "Stripe Public Key" },
  { key: "stripe_secret_key", value: "",                                 type: "string",  group: "payments", label: "Stripe Secret Key" },
  { key: "paypal_client_id",  value: "",                                 type: "string",  group: "payments", label: "PayPal Client ID" },
  { key: "paypal_secret",     value: "",                                 type: "string",  group: "payments", label: "PayPal Secret" },
  
  { key: "free_plan_name",    value: "مجاني", type: "string", group: "pricing", label: "اسم الخطة المجانية" },
  { key: "free_plan_price",   value: "0", type: "number", group: "pricing", label: "سعر المجانية (نجوم أو $)" },
  
  { key: "pro_plan_name",     value: "احترافي", type: "string", group: "pricing", label: "اسم الاشتراك المدفوع" },
  { key: "pro_plan_price",    value: "2500", type: "number", group: "pricing", label: "سعر الاشتراك المدفوع (نجوم أو $)" },

  { key: "discount_active",   value: "false", type: "boolean", group: "pricing", label: "تفعيل الخصم العالمي للمستخدمين" },
  { key: "discount_percent",  value: "20", type: "number", group: "pricing", label: "نسبة الخصم (%)" },

  { key: "free_feat_barcode",    value: "true", type: "boolean", group: "pricing", label: "[مجاني] دعم جميع أنواع الباركود" },
  { key: "free_feat_scanner",    value: "true", type: "boolean", group: "pricing", label: "[مجاني] قارئ متقدم بالكاميرا" },
  { key: "free_feat_export_svg", value: "false", type: "boolean", group: "pricing", label: "[مجاني] تصدير بصيغة SVG و PDF" },
  { key: "free_feat_bulk",       value: "false", type: "boolean", group: "pricing", label: "[مجاني] أداة الإنشاء بالجملة" },
  { key: "free_feat_logo",       value: "false", type: "boolean", group: "pricing", label: "[مجاني] إضافة شعار مخصص للرموز" },
  { key: "free_feat_links",      value: "false", type: "boolean", group: "pricing", label: "[مجاني] روابط التطبيقات الموحدة" },
  { key: "free_feat_analytics",  value: "false", type: "boolean", group: "pricing", label: "[مجاني] إحصائيات متقدمة للرموز" },
  
  { key: "pro_feat_barcode",    value: "true", type: "boolean", group: "pricing", label: "[المدفوع] دعم جميع أنواع الباركود" },
  { key: "pro_feat_scanner",    value: "true", type: "boolean", group: "pricing", label: "[المدفوع] قارئ متقدم بالكاميرا" },
  { key: "pro_feat_export_svg", value: "true", type: "boolean", group: "pricing", label: "[المدفوع] تصدير بصيغة SVG و PDF" },
  { key: "pro_feat_bulk",       value: "true", type: "boolean", group: "pricing", label: "[المدفوع] أداة الإنشاء بالجملة" },
  { key: "pro_feat_logo",       value: "true", type: "boolean", group: "pricing", label: "[المدفوع] إضافة شعار مخصص للرموز" },
  { key: "pro_feat_links",      value: "true", type: "boolean", group: "pricing", label: "[المدفوع] روابط التطبيقات الموحدة" },
  { key: "pro_feat_analytics",  value: "true", type: "boolean", group: "pricing", label: "[المدفوع] إحصائيات متقدمة للرموز" },
];

export async function seedSiteConfig() {
  for (const cfg of DEFAULT_CONFIG) {
    await db.siteConfig.upsert({
      where: { key: cfg.key },
      update: { label: cfg.label, group: cfg.group, type: cfg.type },
      create: cfg,
    });
  }
}

import { unstable_noStore as noStore } from "next/cache";

export async function getSiteConfig(): Promise<Record<string, string>> {
  noStore();
  
  // Cleanup old unneeded keys
  await db.siteConfig.deleteMany({ where: { key: "telegram_stars_usd" } }).catch(() => {});

  let configs = await db.siteConfig.findMany();
  
  // If there are fewer configs than DEFAULT_CONFIG, we are missing some
  if (configs.length < DEFAULT_CONFIG.length) {
    await seedSiteConfig();
    configs = await db.siteConfig.findMany();
  }
  
  return Object.fromEntries(configs.map((c) => [c.key, c.value]));
}

export async function setSiteConfig(key: string, value: string, adminId?: string) {
  return db.siteConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
