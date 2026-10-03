import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const DEFAULT_CONFIG = [
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

async function run() {
  for (const cfg of DEFAULT_CONFIG) {
    await db.siteConfig.upsert({
      where: { key: cfg.key },
      update: { label: cfg.label, group: cfg.group, type: cfg.type },
      create: cfg,
    });
  }
  console.log("Done!");
}

run();
