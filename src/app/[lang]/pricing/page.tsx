import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { clsx } from "clsx";
import { getSiteConfig } from "@/lib/services";
import { SubscribeButton } from "@/components/pricing/SubscribeButton";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params: { lang } }: { params: { lang: string } }): Promise<Metadata> {
  const t = await getDictionary(lang as any);
  return {
    title: t.pricing.title,
    description: t.pricing.desc,
  };
}

export default async function PricingPage({ params: { lang } }: { params: { lang: string } }) {
  const config = await getSiteConfig();
  const t = await getDictionary(lang as any);

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
      name: config.free_plan_name || t.pricing.free_plan,
      nameEn: "Free",
      price: freePrice.current,
      originalPrice: freePrice.original,
      period: t.pricing.monthly,
      icon: Zap,
      color: "gray",
      description: t.pricing.free_desc,
      features: [
        config.free_feat_barcode === "true" ? t.pricing.features.barcode : null,
        config.free_feat_scanner === "true" ? t.pricing.features.scanner : null,
        config.free_feat_export_svg === "true" ? t.pricing.features.export : null,
        config.free_feat_bulk === "true" ? t.pricing.features.bulk : null,
        config.free_feat_logo === "true" ? t.pricing.features.logo : null,
        config.free_feat_links === "true" ? t.pricing.features.links : null,
        config.free_feat_analytics === "true" ? t.pricing.features.analytics : null,
      ].filter(Boolean) as string[],
      cta: t.pricing.start_free,
      href: `/${lang}/qr`,
      popular: false,
    },
    {
      id: "PRO",
      name: config.pro_plan_name || t.pricing.pro_plan,
      nameEn: "Pro",
      price: proPrice.current,
      originalPrice: proPrice.original,
      period: t.pricing.monthly,
      icon: Crown,
      color: "brand",
      description: t.pricing.pro_desc,
      features: [
        config.pro_feat_barcode === "true" ? t.pricing.features.barcode : null,
        config.pro_feat_scanner === "true" ? t.pricing.features.scanner : null,
        config.pro_feat_export_svg === "true" ? t.pricing.features.export : null,
        config.pro_feat_bulk === "true" ? t.pricing.features.bulk : null,
        config.pro_feat_logo === "true" ? t.pricing.features.logo : null,
        config.pro_feat_links === "true" ? t.pricing.features.links : null,
        config.pro_feat_analytics === "true" ? t.pricing.features.analytics : null,
      ].filter(Boolean) as string[],
      cta: t.pricing.subscribe,
      href: `/${lang}/dashboard`,
      popular: true,
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t.pricing.choose_plan} <span className="gradient-text">{t.pricing.gradient_title}</span>
          </h1>
          <p className="text-gray-400 text-xl">{t.pricing.subtitle}</p>
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
                      {t.pricing.most_popular}
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
                      {plan.originalPrice} ⭐
                    </span>
                  )}
                  <span className="text-4xl font-black text-white">
                    {plan.price} ⭐
                  </span>
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
          <h2 className="text-2xl font-bold text-white text-center mb-8">{t.pricing.faq}</h2>
          <div className="space-y-4">
            {t.pricing.faqs.map(({ q, a }) => (
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
