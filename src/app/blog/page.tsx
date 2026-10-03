import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowLeft } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";


export const metadata: Metadata = {
  title: "مدونة باركودي - دليلك لعالم الرموز والباركود",
  description:
    "مقالات وشروح احترافية حول رموز QR والباركود - كيفية الإنشاء، الاستخدام، وأفضل الممارسات",
  keywords: ["رمز QR", "باركود", "QR code", "barcode", "دليل"],
};

const posts = [
  {
    slug: "what-is-qr-code",
    title: "ما هو رمز QR وكيف يعمل؟ دليل شامل",
    excerpt:
      "تعرّف على رموز QR، تاريخها، كيفية عملها، ولماذا أصبحت الأكثر استخداماً في عالم التسويق والتجارة الإلكترونية.",
    category: "تعليمي",
    readTime: "5 دقائق",
    date: "2024-01-15",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    slug: "barcode-types-guide",
    title: "دليل أنواع الباركود: EAN-13، UPC، Code128 وغيرها",
    excerpt:
      "دليل شامل لأكثر من 20 نوعاً من الباركود، ومتى تستخدم كل نوع، والفرق بينها بالتفصيل.",
    category: "تقني",
    readTime: "8 دقائق",
    date: "2024-01-20",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    slug: "qr-code-with-logo",
    title: "كيف تضيف شعارك على رمز QR بخطوات بسيطة",
    excerpt:
      "دليل خطوة بخطوة لإضافة شعارك التجاري على رمز QR مع الحفاظ على إمكانية المسح.",
    category: "دروس",
    readTime: "4 دقائق",
    date: "2024-01-25",
    color: "bg-brand-500/10 text-brand-400",
  },
  {
    slug: "bulk-qr-generation",
    title: "إنشاء 100 رمز QR في دقيقة واحدة - دليل عملي",
    excerpt:
      "تعلّم كيفية إنشاء كميات كبيرة من رموز QR دفعةً واحدة للمنتجات، الفعاليات، أو بطاقات العمل.",
    category: "إنتاجية",
    readTime: "6 دقائق",
    date: "2024-02-01",
    color: "bg-orange-500/10 text-orange-400",
  },
  {
    slug: "qr-vs-barcode",
    title: "رمز QR مقابل الباركود التقليدي: ماذا تختار لمشروعك؟",
    excerpt:
      "مقارنة شاملة بين رموز QR والباركود التقليدي من حيث سعة البيانات، سرعة القراءة، والاستخدامات.",
    category: "مقارنة",
    readTime: "7 دقائق",
    date: "2024-02-05",
    color: "bg-yellow-500/10 text-yellow-400",
  },
  {
    slug: "barcode-print-best-practices",
    title: "أفضل ممارسات طباعة الباركود: الحجم، الدقة، والألوان",
    excerpt:
      "دليل عملي لطباعة باركودات ورموز QR بجودة عالية تضمن سهولة القراءة.",
    category: "دليل عملي",
    readTime: "5 دقائق",
    date: "2024-02-10",
    color: "bg-green-500/10 text-green-400",
  },
];

export default function BlogPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            مدونة باركودي
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            دليلك لعالم <span className="gradient-text">الرموز</span>
          </h1>
          <p className="text-gray-400 text-lg">
            مقالات وشروح احترافية حول رموز QR والباركود
          </p>
        </div>

        <AdBanner slotKey="adsense_slot_top" className="mb-8" />


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-hover group flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${post.color}`}>
                  {post.category}
                </span>
                <span className="text-gray-600 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-3 group-hover:text-brand-400 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{post.excerpt}</p>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
                <span className="text-gray-600 text-xs">{post.date}</span>
                <span className="text-brand-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  اقرأ المزيد <ArrowLeft className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
