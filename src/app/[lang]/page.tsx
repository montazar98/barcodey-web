import Link from "next/link";
import { QrCode, Barcode, ScanLine, Layers, ArrowLeft, Zap, Shield, Download, Palette, Share2, Clock, ChevronRight } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";
import { getDictionary } from "@/i18n/dictionaries";
import { QRGenerator } from "@/components/qr/QRGenerator";

export default async function HomePage({ params }: { params: { lang: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const dict = await getDictionary(resolvedParams.lang as any);

  const features = [
    {
      icon: QrCode,
      title: dict.home?.feature_1_title || "مولد رمز QR متقدم",
      description: dict.home?.feature_1_desc || "أنشئ رموز QR احترافية مع تخصيص كامل للألوان والشعارات والأشكال",
      href: "/qr",
      color: "brand",
    },
    {
      icon: Barcode,
      title: dict.home?.feature_2_title || "مولد الباركود",
      description: dict.home?.feature_2_desc || "ادعم أكثر من 20 نوعاً من الباركود مثل EAN-13, UPC, Code128 وغيرها",
      href: "/barcode",
      color: "purple",
    },
    {
      icon: ScanLine,
      title: dict.home?.feature_3_title || "قارئ ذكي",
      description: dict.home?.feature_3_desc || "امسح أي رمز QR أو باركود باستخدام كاميرا جهازك أو رفع صورة",
      href: "/scanner",
      color: "blue",
    },
    {
      icon: Layers,
      title: dict.home?.feature_4_title || "الإنشاء بالجملة",
      description: dict.home?.feature_4_desc || "أنشئ مئات الرموز دفعةً واحدة وصدّرها بصيغة ZIP",
      href: "/bulk",
      color: "orange",
    },
  ];

  const benefits = [
    { icon: Palette, title: dict.home?.benefit_1_title || "تخصيص كامل", desc: dict.home?.benefit_1_desc || "ألوان، شعارات، أشكال، وأنماط لا محدودة" },
    { icon: Download, title: dict.home?.benefit_2_title || "تصدير عالي الجودة", desc: dict.home?.benefit_2_desc || "PNG, SVG, PDF بأي دقة تريدها" },
    { icon: Share2, title: dict.home?.benefit_3_title || "مشاركة فورية", desc: dict.home?.benefit_3_desc || "روابط مختصرة قابلة للمشاركة في ثوانٍ" },
    { icon: Zap, title: dict.home?.benefit_4_title || "فوري 100%", desc: dict.home?.benefit_4_desc || "يعمل في المتصفح دون رفع بيانات لأي خادم" },
    { icon: Shield, title: dict.home?.benefit_5_title || "خصوصية تامة", desc: dict.home?.benefit_5_desc || "بياناتك تبقى على جهازك فقط" },
    { icon: Clock, title: dict.home?.benefit_6_title || "تاريخ الرموز", desc: dict.home?.benefit_6_desc || "احفظ واسترجع رموزك في أي وقت" },
  ];

  const stats = [
    { value: "+50K", label: dict.home?.stats?.users || "مستخدم نشط" },
    { value: "+1M", label: dict.home?.stats?.generated || "رمز تم إنشاؤه" },
    { value: "20+", label: dict.home?.stats?.types || "نوع باركود" },
    { value: "100%", label: dict.home?.stats?.free || "مجاني للبداية" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            {dict.home?.badge || "أسرع وأقوى أداة للرموز"}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {dict.home?.title_1 || "أنشئ"}{" "}
            <span className="gradient-text">{dict.home?.title_2 || "رموزك"}</span>
            <br />
            {dict.home?.title_3 || "باحترافية تامة"}
          </h1>

          <p className="text-gray-400 text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            {dict.home?.desc || "من رموز QR المخصصة إلى الباركود بجميع أنواعه — أنشئ، اقرأ، وصدّر بجودة احترافية في ثوانٍ."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#generator" className="btn-primary text-lg px-8 py-4">
              <QrCode className="w-5 h-5" />
              {dict.home?.create_qr || "أنشئ رمز QR الآن"}
            </a>
            <Link href="/barcode" className="btn-secondary text-lg px-8 py-4">
              {dict.home?.create_barcode || "مولد الباركود"}
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl md:text-4xl font-black gradient-text mb-1">{value}</div>
                <div className="text-gray-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct QR Generator Section */}
      <section id="generator" className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 -mt-16 mb-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <QRGenerator />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">{dict.home?.features_title || "كل ما تحتاجه في مكان واحد"}</h2>
            <p className="section-subtitle">
              {dict.home?.features_subtitle || "مجموعة متكاملة من الأدوات الاحترافية لإنشاء وإدارة وقراءة الرموز"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description, href, color }) => (
              <Link key={href} href={href} className="group card-hover flex items-start gap-5 cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  color === 'brand' ? 'bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20' :
                  color === 'purple' ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20' :
                  color === 'blue' ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20' :
                  'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20'
                } transition-colors`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors flex items-center gap-2">
                    {title}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">{dict.home?.benefits_title || "لماذا باركودي؟"}</h2>
            <p className="section-subtitle">{dict.home?.benefits_subtitle || "ميزات تجعلنا الخيار الأول للمستخدمين العرب"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center group hover:border-brand-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Optional Ad Banner */}
      <div className="max-w-5xl mx-auto px-4">
        <AdBanner slotKey="adsense_slot_top" />
      </div>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card glow-border bg-gradient-to-br from-gray-900 to-gray-950 py-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              {dict.home?.cta_title || "جاهز للبدء؟"}
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {dict.home?.cta_desc || "ابدأ مجاناً الآن وأنشئ رمزك الأول في أقل من دقيقة"}
            </p>
            <a href="#generator" className="btn-primary text-lg px-10 py-4">
              <Zap className="w-5 h-5" />
              {dict.nav?.start_free || "ابدأ مجاناً"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
