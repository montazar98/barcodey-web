"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowRight, BarChart3, Smartphone, Monitor, Tablet, Clock, Globe,
  TrendingUp, Activity, Copy, Download, Edit3, Power, Calendar
} from "lucide-react";
import type { DynamicQR } from "@/lib/qr-store";
import toast from "react-hot-toast";

interface Analytics {
  total: number;
  devices: { mobile: number; desktop: number; tablet: number; unknown: number };
  scansByDay: Record<string, number>;
  scansByHour: number[];
  recent: Array<{ id: string; timestamp: string; device: string; userAgent: string }>;
}

export default function AnalyticsPage() {
  const { code } = useParams<{ code: string }>();
  const [qr, setQr] = useState<DynamicQR | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/qr/${code}`)
      .then((r) => r.json())
      .then(({ qr, analytics }) => { setQr(qr); setAnalytics(analytics); })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!qr || !analytics) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-400">الرمز غير موجود</p>
    </div>
  );

  const BASE = typeof window !== "undefined" ? window.location.origin : "https://barcodey.online";
  const redirectUrl = `${BASE}/r/${qr.code}`;

  const deviceTotal = analytics.devices.mobile + analytics.devices.desktop +
    analytics.devices.tablet + analytics.devices.unknown || 1;

  const dayEntries = Object.entries(analytics.scansByDay);
  const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);
  const maxHour = Math.max(...analytics.scansByHour, 1);

  const todayScans = analytics.scansByDay[new Date().toISOString().split("T")[0]] || 0;
  const yesterdayScans = analytics.scansByDay[
    new Date(Date.now() - 86400000).toISOString().split("T")[0]
  ] || 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dynamic-qr/manage" className="text-gray-400 hover:text-brand-400 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{qr.title}</h1>
            <p className="text-gray-500 text-sm font-mono">{redirectUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(redirectUrl); toast.success("تم النسخ!"); }}
              className="btn-secondary py-2 px-3 text-sm"
            >
              <Copy className="w-4 h-4" />
            </button>
            <Link href="/dynamic-qr/manage" className="btn-secondary py-2 px-3 text-sm">
              <Edit3 className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left: Charts */}
          <div className="lg:col-span-3 space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "إجمالي المسح", value: analytics.total.toLocaleString("ar"), icon: BarChart3, color: "brand", sub: "منذ الإنشاء" },
                { label: "اليوم", value: todayScans, icon: Activity, color: "green", sub: `أمس: ${yesterdayScans}` },
                { label: "جوال", value: analytics.devices.mobile, icon: Smartphone, color: "blue", sub: `${Math.round(analytics.devices.mobile / deviceTotal * 100)}%` },
                { label: "كمبيوتر", value: analytics.devices.desktop, icon: Monitor, color: "purple", sub: `${Math.round(analytics.devices.desktop / deviceTotal * 100)}%` },
              ].map(({ label, value, icon: Icon, color, sub }) => (
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
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-gray-600 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Scans by Day (last 30 days) */}
            <div className="card">
              <h2 className="font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                المسح خلال آخر 30 يوماً
              </h2>
              <div className="flex items-end gap-1 h-32">
                {dayEntries.slice(-30).map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full rounded-t-sm bg-brand-500/20 hover:bg-brand-500/40 transition-colors cursor-pointer"
                      style={{ height: `${(count / maxDay) * 100}%`, minHeight: count > 0 ? "4px" : "1px" }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                      {day.slice(5)}: {count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-gray-600 text-xs mt-2">
                <span>{dayEntries[0]?.[0].slice(5)}</span>
                <span>{dayEntries[dayEntries.length - 1]?.[0].slice(5)}</span>
              </div>
            </div>

            {/* Scans by Hour */}
            <div className="card">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-400" />
                توزيع المسح حسب الساعة (اليوم)
              </h2>
              <div className="flex items-end gap-0.5 h-20">
                {analytics.scansByHour.map((count, hour) => (
                  <div key={hour} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full rounded-t-sm bg-purple-500/20 hover:bg-purple-500/50 transition-colors"
                      style={{ height: `${(count / maxHour) * 100}%`, minHeight: count > 0 ? "4px" : "1px" }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                      {hour}:00 — {count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-gray-600 text-xs mt-1">
                <span>12 ص</span>
                <span>12 م</span>
                <span>11 م</span>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="card">
              <h2 className="font-bold text-white mb-4">توزيع الأجهزة</h2>
              <div className="space-y-3">
                {[
                  { label: "جوال", icon: Smartphone, count: analytics.devices.mobile, color: "bg-blue-500" },
                  { label: "كمبيوتر", icon: Monitor, count: analytics.devices.desktop, color: "bg-purple-500" },
                  { label: "تابلت", icon: Tablet, count: analytics.devices.tablet, color: "bg-green-500" },
                ].map(({ label, icon: Icon, count, color }) => {
                  const pct = deviceTotal === 0 ? 0 : Math.round((count / deviceTotal) * 100);
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm w-16">{label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-20 text-left">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Scans */}
            <div className="card">
              <h2 className="font-bold text-white mb-4">آخر عمليات المسح</h2>
              {analytics.recent.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد بيانات مسح بعد</p>
              ) : (
                <div className="space-y-2">
                  {analytics.recent.map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                        {scan.device === "mobile" ? <Smartphone className="w-4 h-4 text-blue-400" /> :
                         scan.device === "desktop" ? <Monitor className="w-4 h-4 text-purple-400" /> :
                         <Tablet className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-sm capitalize">{scan.device}</p>
                        <p className="text-gray-600 text-xs truncate">{scan.userAgent.slice(0, 60)}...</p>
                      </div>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {new Date(scan.timestamp).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: QR + Info */}
          <div className="lg:col-span-1 space-y-5">
            {/* QR Preview */}
            <div className="card flex flex-col items-center">
              <div
                className="rounded-2xl overflow-hidden p-3 mb-4 shadow-xl"
                style={{ backgroundColor: qr.bgColor }}
              >
                <QRCodeCanvas
                  value={redirectUrl}
                  size={150}
                  fgColor={qr.fgColor}
                  bgColor={qr.bgColor}
                  level="H"
                  marginSize={1}
                />
              </div>
              <button
                onClick={() => {
                  const c = document.querySelector(`#analytics-qr canvas`) as HTMLCanvasElement;
                  if (c) {
                    const a = document.createElement("a");
                    a.download = `barcodey-${qr.code}.png`;
                    a.href = c.toDataURL();
                    a.click();
                  }
                }}
                className="btn-secondary w-full justify-center text-sm py-2"
              >
                <Download className="w-4 h-4" />
                تنزيل PNG
              </button>
            </div>

            {/* QR Info */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-white">معلومات الرمز</h3>
              {[
                { label: "الكود", value: qr.code },
                { label: "الحالة", value: qr.isActive ? "✅ نشط" : "❌ معطّل" },
                { label: "أُنشئ في", value: new Date(qr.createdAt).toLocaleDateString("ar-SA") },
                { label: "آخر تحديث", value: new Date(qr.updatedAt).toLocaleDateString("ar-SA") },
                ...(qr.expiresAt ? [{ label: "ينتهي في", value: new Date(qr.expiresAt).toLocaleDateString("ar-SA") }] : []),
                ...(qr.maxScans ? [{ label: "الحد الأقصى", value: `${qr.totalScans}/${qr.maxScans}` }] : []),
                ...(qr.password ? [{ label: "كلمة مرور", value: "✅ مفعّلة" }] : []),
                ...(qr.mobileUrl || qr.desktopUrl ? [{ label: "توجيه الجهاز", value: "✅ مفعّل" }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>

            {/* Destination */}
            <div className="card">
              <h3 className="font-semibold text-white mb-2 text-sm">الوجهة الحالية</h3>
              <a
                href={qr.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 text-xs break-all font-mono flex items-start gap-1"
              >
                <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {qr.destinationUrl}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
