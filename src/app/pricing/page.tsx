import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { clsx } from "clsx";
import { getSiteConfig } from "@/lib/services";
import { SubscribeButton } from "@/components/pricing/SubscribeButton";

export const metadata: Metadata = {
  title: "الأسعار والاشتراكات",
  description: "اختر الخطة المناسبة لاحتياجاتك",
};

const faqs = [
  { q: "هل يمكنني الإلغاء في أي وقت؟", a: "نعم، يمكنك إلغاء الاشتراك في أي وقت دون أي رسوم إضافية." },
  { q: "هل تتوفر فترة تجربة مجانية؟", a: "نعم، يمكنك تجربة الخطة الاحترافية مجاناً لمدة 14 يوماً." },
  { q: "ما طرق الدفع المتاحة؟", a: "نقبل بطاقات الائتمان، وبطاقات مدى، وApple Pay، وGoogle Pay." },
  { q: "هل يمكن ترقية أو تخفيض الخطة؟", a: "بالطبع، يمكنك تغيير خطتك في أي وقت من لوحة التحكم." },
];

export default async function PricingPage() {
  const config = await getSiteConfig();

  const discountActive = config.discount_active === "true";
  const discountPercent = Number(config.discount_percent || 0);

  const calculateDiscount = (priceStr: string) => {
    const price = Number(priceStr);
    if (!discountActive || isNaN(price) || price === 0) return { current: priceStr, original: null };
    const discounted = price - (price * discountPercent) / 100;
    return { current: discounted.toString(), original: priceStr };
  };

  const freePrice = calculateDiscount(config.free_plan_price || "0");
  const proPrice = calculateDiscount(config.pro_plan_price || "29");

  const plans = [
    {
      id: "FREE",
      name: config.free_plan_name || "مجاني",
      nameEn: "Free",
      price: freePrice.current,
      originalPrice: freePrice.original,
      period: "/شهرياً",
      icon: Zap,
      color: "gray",
      description: "الخطة الأساسية للاستخدام المحدود",
      features: [
        config.free_feat_barcode === "true" ? "دعم جميع أنواع الباركود" : null,
        config.free_feat_scanner === "true" ? "قارئ متقدم بالكاميرا" : null,
        config.free_feat_export_svg === "true" ? "تصدير بصيغة SVG و PDF" : null,
        config.free_feat_bulk === "true" ? "أداة الإنشاء بالجملة" : null,
        config.free_feat_logo === "true" ? "إضافة شعار مخصص للرموز" : null,
        config.free_feat_links === "true" ? "روابط التطبيقات الموحدة" : null,
        config.free_feat_analytics === "true" ? "إحصائيات متقدمة للرموز" : null,
      ].filter(Boolean) as string[],
      cta: "ابدأ مجاناً",
      href: "/qr",
      popular: false,
    },
    {
      id: "PRO",
      name: config.pro_plan_name || "الاشتراك المدفوع",
      nameEn: "Pro",
      price: proPrice.current,
      originalPrice: proPrice.original,
      period: "/شهرياً",
      icon: Crown,
      color: "brand",
      description: "للمحترفين وأصحاب الأعمال",
      features: [
        config.pro_feat_barcode === "true" ? "دعم جميع أنواع الباركود" : null,
        config.pro_feat_scanner === "true" ? "قارئ متقدم بالكاميرا" : null,
        config.pro_feat_export_svg === "true" ? "تصدير بصيغة SVG و PDF" : null,
        config.pro_feat_bulk === "true" ? "أداة الإنشاء بالجملة" : null,
        config.pro_feat_logo === "true" ? "إضافة شعار مخصص للرموز" : null,
        config.pro_feat_links === "true" ? "روابط التطبيقات الموحدة" : null,
        config.pro_feat_analytics === "true" ? "إحصائيات متقدمة للرموز" : null,
      ].filter(Boolean) as string[],
      cta: "اشترك الآن",
      href: "/dashboard",
      popular: true,
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            اختر <span className="gradient-text">خطتك</span>
          </h1>
          <p className="text-gray-400 text-xl">أسعار شفافة بدون رسوم خفية</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={clsx(
                  "card relative flex flex-col",
                  plan.popular
                    ? "border-brand-500/50 bg-gradient-to-b from-brand-500/5 to-transparent"
                    : ""
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-gray-950 text-xs font-bold px-4 py-1.5 rounded-full">
                      الأكثر شيوعاً
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={clsx(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    plan.color === "brand" ? "bg-brand-500/10 text-brand-400" :
                    plan.color === "purple" ? "bg-purple-500/10 text-purple-400" :
                    "bg-gray-700 text-gray-400"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{plan.name}</h2>
                    <p className="text-gray-500 text-xs">{plan.nameEn}</p>
                  </div>
                </div>

                <div className="mb-4 flex items-baseline justify-center gap-2">
                  {plan.originalPrice && (
                    <span className="text-xl font-bold text-gray-500 line-through">
                      ${plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-gray-400 text-sm mr-1"> {plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <SubscribeButton
                  plan={plan.id}
                  cta={plan.cta}
                  href={plan.href}
                  gateway={config.payment_gateway}
                  botUsername={config.telegram_bot_username}
                />
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">أسئلة شائعة</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="card">
                <h3 className="font-semibold text-white mb-2">{q}</h3>
                <p className="text-gray-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
