import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, ArrowRight, Share2, Calendar, CheckCircle } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";

const POSTS_DATA: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string[];
}> = {
  "what-is-qr-code": {
    title: "ما هو رمز QR وكيف يعمل؟ دليل شامل",
    excerpt: "تعرّف على رموز QR، تاريخها، كيفية عملها، ولماذا أصبحت الأكثر استخداماً في عالم التسويق والتجارة الإلكترونية.",
    category: "تعليمي",
    date: "2024-01-15",
    readTime: "5 دقائق",
    content: [
      "رموز الاستجابة السريعة (Quick Response Code أو QR Code) هي نوع من الباركود ثنائي الأبعاد تم ابتكاره في عام 1994 بواسطة شركة Denso Wave التابعة لتويوتا.",
      "على عكس الباركود التقليدي الذي يخزن البيانات في اتجاه أفقي فقط، يخزن رمز QR المعلومات في كلا الاتجاهين الأفقي والعمودي، مما يتيح له تخزين كميات هائلة من البيانات تصل إلى آلاف الأحرف.",
      "تعتمد رموز QR على نمط من المربعات البيضاء والسوداء مرتبة في شبكة مربعة، مع علامات تحديد موضع فريدة في ثلاث زوايا تساعد الكاميرا على قراءة الرمز من أي زاوية أو اتجاه.",
      "أهم ميزات رموز QR تشمل تصحيح الخطأ التلقائي (Reed-Solomon Error Correction)، والذي يسمح بقراءة الرمز حتى لو تعرض للتلف أو التشويه بنسبة تصل إلى 30%."
    ]
  },
  "barcode-types-guide": {
    title: "دليل أنواع الباركود: EAN-13، UPC، Code128 وغيرها",
    excerpt: "دليل شامل لأكثر من 20 نوعاً من الباركود، ومتى تستخدم كل نوع، والفرق بينها بالتفصيل.",
    category: "تقني",
    date: "2024-01-20",
    readTime: "8 دقائق",
    content: [
      "الباركود هو تمثيل بصري للبيانات يمكن قراءته آلياً بواسطة الماسحات الضوئية أو الكاميرات.",
      "رمز EAN-13: هو المعيار العالمي الأكثر استخداماً لمنتجات التجزئة خارج أمريكا الشمالية. يتكون من 13 رقماً، منها رمز الدولة والشركة والمنتج ورقم التحقق.",
      "رمز UPC-A: المعيار القياسي لمنتجات التجزئة في الولايات المتحدة وكندا، ويتكون من 12 رقماً.",
      "رمز Code 128: باركود عالي الكثافة يدعم جميع الأحرف الإنجليزية والأرقام والرموز، ويستخدم بكثرة في الشحن واللوجستيات والتخزين.",
      "رمز Code 39: أقدم أنواع الباركود الأبجدية الرقمية، وما زال مستخدماً في التطبيقات العسكرية وقطاع السيارات."
    ]
  },
  "qr-code-with-logo": {
    title: "كيف تضيف شعارك على رمز QR بخطوات بسيطة",
    excerpt: "دليل خطوة بخطوة لإضافة شعارك التجاري على رمز QR مع الحفاظ على إمكانية المسح.",
    category: "دروس",
    date: "2024-01-25",
    readTime: "4 دقائق",
    content: [
      "إضافة شعار لرمز QR يمنح علامتك التجارية مظهراً احترافياً ومميزاً ويزيد من ثقة المستخدمين بنقر ومسح الرمز.",
      "لإضافة شعار بنجاح دون التأثير على قابلية المسح، يجب ضبط مستوى تصحيح الخطأ (Error Correction) على المستوى H (High) والذي يتحمل حتى 30% من التغطية.",
      "احرص على ألا يتجاوز حجم الشعار 20% إلى 25% من المساحة الكلية لرمز QR حتى تتمكن كاميرات الهواتف من قراءته بسرعة.",
      "جرّب دائماً فحص الرمز بكاميرات هواتف مختلفة وتطبيقات مسح متعددة قبل طباعته على المواد الدعائية."
    ]
  },
  "bulk-qr-generation": {
    title: "إنشاء 100 رمز QR في دقيقة واحدة - دليل عملي",
    excerpt: "كيفية توليد كميات كبيرة من رموز QR بنقرة زر واحدة وتصديرها للأعمال والفعاليات.",
    category: "دليل عملي",
    date: "2024-02-01",
    readTime: "6 دقائق",
    content: [
      "عند تنظيم فعاليات ضخمة، أو إدارة مستودعات، أو إطلاق حملات تسويقية موسعة، قد تحتاج إلى إنشاء مئات أو آلاف الرموز دفعة واحدة.",
      "تتيح ميزة الإنشاء بالجملة (Bulk Generator) في باركودي إدخال قائمة من الروابط أو النصوص، وتوليد الرموز تلقائياً مع خيارات تحميل فردية أو تنزيل ملف مضغوط كامل.",
      "يمكنك تخصيص ألوان وتصميم الرموز بالكامل مرة واحدة لتنطبق على كافة الرموز المولدة في الحملة."
    ]
  },
  "qr-vs-barcode": {
    title: "الفرق بين QR والباركود العادي: أيهما تختار لمشروعك؟",
    excerpt: "مقارنة تفصيلية بين الرموز التقليدية والحديثة من حيث السعة، السرعة، وسهولة الاستخدام.",
    category: "مقارنة",
    date: "2024-02-05",
    readTime: "5 دقائق",
    content: [
      "الباركود الخطي (1D) مناسب للمنتجات في نقاط البيع (POS) وإدارة المخزون الداخلي حيث تكون التكلفة والسرعة أولوية.",
      "رمز QR ثنائي الأبعاد (2D) يتفوق عندما تحتاج إلى ربط العالم الحقيقي بالإنترنت (روابط، مواقع تواصل، شبكات واي فاي، مدفوعات إلكترونية).",
      "يمتاز QR بإمكانية قراءته بواسطة أي هاتف ذكي حديث دون الحاجة لجهاز قارئ ليزري مخصص."
    ]
  },
  "barcode-print-best-practices": {
    title: "أفضل ممارسات طباعة الباركود: الحجم، الدقة، والألوان",
    excerpt: "دليل عملي لطباعة باركودات ورموز QR بجودة عالية تضمن سهولة القراءة.",
    category: "دليل عملي",
    date: "2024-02-10",
    readTime: "5 دقائق",
    content: [
      "التباين اللوني: احرص دائماً على وجود تباين قوي بين لون الرمز ولون الخلفية. الرمز الداكن على خلفية فاتحة هو الأفضل دائماً.",
      "الدقة وصيغة الملف: استخدم دائماً ملفات المتجهات (SVG) أو ملفات PNG عالية الدقة (300 DPI على الأقل) للطباعة التجارية.",
      "منطقة الهدوء (Quiet Zone): اترك مسافة فارغة كافية حول حواف الباركود ليتمكن القارئ من تمييز بداية ونهاية الرمز بسهولة."
    ]
  }
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = POSTS_DATA[params.slug];
  if (!post) return { title: "المقال غير موجود" };

  return {
    title: `${post.title} | مدونة باركودي`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const post = POSTS_DATA[params.slug];
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "باركودي",
    },
  };

  return (
    <article className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-400 mb-8 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        العودة إلى المدونة
      </Link>

      {/* Meta tags */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 font-medium">
          {post.category}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {post.readTime}
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
        {post.title}
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8 border-r-4 border-brand-500 pr-4 bg-gray-900/40 p-4 rounded-l-xl">
        {post.excerpt}
      </p>

      {/* Top Ad banner */}
      <AdBanner slotKey="adsense_slot_top" className="my-8" />

      {/* Content */}
      <div className="card space-y-6 text-gray-300 leading-relaxed text-base md:text-lg">
        {post.content.map((paragraph, index) => (
          <p key={index} className="leading-8">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Bottom Ad banner */}
      <AdBanner slotKey="adsense_slot_bottom" className="my-10" />

      {/* CTA Box */}
      <div className="mt-12 card border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-transparent p-8 text-center rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-2">جرب مولد باركودي الآن مجاناً</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
          أنشئ رموز QR مخصصة وباركود احترافي لجميع الاستخدامات بدقة عالية وسرعة فائقة.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/qr" className="btn-primary">
            مولد رمز QR
          </Link>
          <Link href="/barcode" className="btn-secondary">
            مولد الباركود
          </Link>
        </div>
      </div>
    </article>
  );
}
