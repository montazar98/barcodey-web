"use client";
import Link from "next/link";
import { QrCode, Github, Twitter, Mail } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function Footer() {
  const dict = useI18n();

  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-gray-950" />
              </div>
              <span className="text-xl font-bold gradient-text">باركودي</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {dict.footer?.desc || "أداة احترافية ومتكاملة لإنشاء وتخصيص رموز QR والباركود بمختلف الأنواع، مع إمكانية التصدير بجودة عالية."}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-brand-400 hover:bg-gray-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-brand-400 hover:bg-gray-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:info@barcodey.online" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-brand-400 hover:bg-gray-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{dict.footer?.tools || "الأدوات"}</h3>
            <ul className="space-y-2">
              {[
                { href: "/qr", label: dict.nav?.qr || "مولد رمز QR" },
                { href: "/barcode", label: dict.nav?.barcode || "مولد الباركود" },
                { href: "/scanner", label: dict.nav?.scanner || "قارئ QR/باركود" },
                { href: "/bulk", label: dict.nav?.bulk || "إنشاء بالجملة" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{dict.footer?.company || "الشركة"}</h3>
            <ul className="space-y-2">
              {[
                { href: "/pricing", label: dict.nav?.pricing || "الأسعار" },
                { href: "/dashboard", label: dict.nav?.dashboard || "لوحة التحكم" },
                { href: "/about", label: dict.footer?.about || "عن الموقع" },
                { href: "/privacy", label: dict.footer?.privacy || "سياسة الخصوصية" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 باركودي. {dict.footer?.rights || "جميع الحقوق محفوظة."}
          </p>
          <p className="text-gray-600 text-xs">
            {dict.footer?.made_with || "صُنع بـ ❤️ للمستخدمين العرب"}
          </p>
        </div>
      </div>
    </footer>
  );
}
