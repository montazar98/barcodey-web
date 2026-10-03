"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode, BarChart3, Plus, Settings, Crown, Zap,
  ArrowLeft, Star, TrendingUp, Clock, User
} from "lucide-react";
import type { PublicUser } from "@/lib/user-store";
import type { DynamicQR } from "@/lib/qr-store";

const PLAN_META = {
  free:     { label: "مجاني",     color: "text-gray-400",   bg: "bg-gray-700/30",      icon: Star,  limit: "10 رموز" },
  pro:      { label: "احترافي",   color: "text-blue-400",   bg: "bg-blue-500/10",      icon: Zap,   limit: "100 رمز" },
  business: { label: "أعمال",     color: "text-purple-400", bg: "bg-purple-500/10",    icon: Crown, limit: "غير محدود" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [qrs, setQrs] = useState<DynamicQR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
      fetch("/api/qr").then((r) => r.ok ? r.json() : null),
    ]).then(([authData, qrData]) => {
      if (!authData?.user) { router.push("/auth/login"); return; }
      setUser(authData.user);
      setQrs(qrData?.qrs || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const plan = PLAN_META[user.plan as keyof typeof PLAN_META] || PLAN_META.free;
  const PlanIcon = plan.icon;
  const totalScans = qrs.reduce((s, q) => s + q.totalScans, 0);
  const activeQRs = qrs.filter((q) => q.isActive).length;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              مرحباً، <span className="gradient-text">{user.name.split(" ")[0]}</span> 👋
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${plan.bg} border border-current/10`}>
            <PlanIcon className={`w-4 h-4 ${plan.color}`} />
            <span className={`font-bold text-sm ${plan.color}`}>خطة {plan.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "رموز ديناميكية", value: qrs.length, icon: QrCode, color: "brand" },
            { label: "نشط", value: activeQRs, icon: Zap, color: "green" },
            { label: "إجمالي المسح", value: totalScans.toLocaleString("ar"), icon: BarChart3, color: "blue" },
            { label: "تاريخ الانضمام", value: new Date(user.createdAt).toLocaleDateString("ar-SA", { month: "short", year: "numeric" }), icon: Clock, color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  color === "brand" ? "bg-brand-500/10 text-brand-400" :
                  color === "green" ? "bg-green-500/10 text-green-400" :
                  color === "blue" ? "bg-blue-500/10 text-blue-400" :
                  "bg-purple-500/10 text-purple-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-bold text-white text-lg">إجراءات سريعة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { href: "/dynamic-qr", icon: Zap, label: "إنشاء QR ديناميكي", desc: "رمز قابل للتعديل مع تتبع", color: "brand" },
                { href: "/qr", icon: QrCode, label: "مولد QR", desc: "إنشاء رمز ثابت سريع", color: "blue" },
                { href: "/dynamic-qr/manage", icon: BarChart3, label: "إدارة رموزي", desc: `${qrs.length} رمز لديك`, color: "purple" },
                { href: "/barcode", icon: TrendingUp, label: "مولد الباركود", desc: "EAN, UPC, Code128", color: "green" },
              ].map(({ href, icon: Icon, label, desc, color }) => (
                <Link key={href} href={href} className="card-hover flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    color === "brand" ? "bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20" :
                    color === "blue" ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20" :
                    color === "purple" ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20" :
                    "bg-green-500/10 text-green-400 group-hover:bg-green-500/20"
                  } transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors">{label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent QRs */}
            {qrs.length > 0 && (
              <div className="card mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">آخر رموزي</h3>
                  <Link href="/dynamic-qr/manage" className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
                    عرض الكل <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {qrs.slice(0, 4).map((qr) => (
                    <div key={qr.code} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <QrCode className="w-4 h-4 text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{qr.title}</p>
                        <p className="text-gray-600 text-xs font-mono">/{qr.code}</p>
                      </div>
                      <div className="text-gray-400 text-xs flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-brand-400" />
                        {qr.totalScans}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 text-xl font-black">
                  {user.name[0]}
                </div>
                <div>
                  <p className="text-white font-bold">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>
              <Link href="/auth/login" className="btn-secondary w-full justify-center text-sm py-2">
                <Settings className="w-4 h-4" /> إعدادات الحساب
              </Link>
            </div>

            {/* Upgrade */}
            {user.plan === "free" && (
              <div className="card border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <p className="font-bold text-white text-sm">ارقَ إلى Pro</p>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {["100 رمز ديناميكي", "تحليلات متقدمة", "تصدير PDF", "إزالة العلامة المائية"].map((f) => (
                    <li key={f} className="text-gray-400 text-xs flex items-center gap-2">
                      <span className="text-brand-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="btn-primary w-full justify-center text-sm py-2">
                  <Zap className="w-4 h-4" /> ترقية الخطة
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
