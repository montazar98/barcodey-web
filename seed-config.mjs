import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const DEFAULT_CONFIG = [
  { key: "free_plan_name",    value: "مجاني", type: "string", group: "pricing", label: "اسم الخطة المجانية" },
  { key: "free_plan_desc",    value: "مثالي للاستخدام الشخصي والتجربة", type: "string", group: "pricing", label: "وصف الخطة المجانية" },
  { key: "free_plan_price",   value: "0", type: "number", group: "pricing", label: "سعر المجانية ($)" },
  { key: "free_plan_features",value: "10 رموز QR يومياً\n8 أنواع باركود\nقارئ QR والباركود\nتصدير PNG فقط\nإنشاء بالجملة (10 رموز)", type: "text", group: "pricing", label: "ميزات المجانية (كل ميزة في سطر)" },
  
  { key: "pro_plan_name",     value: "احترافي", type: "string", group: "pricing", label: "اسم خطة Pro" },
  { key: "pro_plan_desc",     value: "للمحترفين وأصحاب الأعمال", type: "string", group: "pricing", label: "وصف خطة Pro" },
  { key: "pro_plan_price",    value: "29", type: "number", group: "pricing", label: "سعر Pro ($)" },
  { key: "pro_plan_features", value: "100 رمز QR\nجميع أنواع الباركود (20+)\nقارئ متقدم بالكاميرا\nتصدير PNG + SVG + PDF\nإنشاء بالجملة (1000 رمز)\nشعار مخصص\nروابط مختصرة\nتاريخ الرموز (90 يوم)", type: "text", group: "pricing", label: "ميزات Pro (كل ميزة في سطر)" },
  
  { key: "biz_plan_name",     value: "أعمال", type: "string", group: "pricing", label: "اسم خطة أعمال" },
  { key: "biz_plan_desc",     value: "للشركات والفرق الكبيرة", type: "string", group: "pricing", label: "وصف خطة أعمال" },
  { key: "biz_plan_price",    value: "99", type: "number", group: "pricing", label: "سعر أعمال ($)" },
  { key: "biz_plan_features", value: "كل ميزات الاحترافي\nإنشاء بالجملة (غير محدود)\nAPI Access كامل\nلوحة تحكم للفريق\nتحليلات متقدمة\nدعم مخصص 24/7\nتخصيص العلامة التجارية\nتاريخ الرموز (غير محدود)", type: "text", group: "pricing", label: "ميزات أعمال (كل ميزة في سطر)" },
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
