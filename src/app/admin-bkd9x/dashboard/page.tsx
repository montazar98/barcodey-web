"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, QrCode, BarChart3, Activity, Shield, LogOut, Search, Ban, CheckCircle,
  Trash2, Crown, RefreshCw, TrendingUp, Smartphone, Monitor, Globe, Settings,
  Tablet, Clock, Eye, Power, Edit3, Save, X, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, DollarSign, Zap, Map, MousePointer, Timer,
  ArrowUpRight, ArrowDownRight, Layers, BookOpen, Tag, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { formatDuration } from "@/lib/analytics";

type Tab = "overview" | "visitors" | "users" | "qrcodes" | "features" | "settings" | "subscriptions" | "pricing";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminData {
  users: {
    total: number; active: number; inactive: number;
    newToday: number; newWeek: number;
    byPlan: Record<string, number>;
  };
  qr: { total: number; active: number; totalScans: number; scansToday: number };
  visitors: {
    totalSessions: number; todaySessions: number;
    totalPageViews: number; todayPageViews: number;
    bounceRate: number; avgDuration: number;
    topPages: Array<{ path: string; count: number }>;
    topCountries: Array<{ country: string; count: number }>;
    topBrowsers: Array<{ browser: string; count: number }>;
    topDevices: Array<{ device: string; count: number }>;
    topReferers: Array<{ source: string; count: number }>;
    dailySessions: Array<{ day: string; count: number }>;
    recentSessions: Array<{
      sessionKey: string; country: string; city: string; browser: string;
      os: string; device: string; startTime: string; duration: number;
      pageViewCount: number; bounced: boolean; refererDomain: string; landingPage: string;
    }>;
  };
  featureFlags: Array<{
    id: string; key: string; name: string; description: string;
    isEnabled: boolean; minPlan: string | null; requiresAuth: boolean; updatedAt: string;
  }>;
  siteConfig: Record<string, string>;
  siteConfigFull: Array<{ key: string; value: string; label: string; type: string; group: string }>;
}

interface User {
  id: string; name: string; email: string; plan: string; role: string;
  isActive: boolean; createdAt: string; lastLoginAt: string | null; loginCount: number;
}

interface QRItem {
  id: string; code: string; title: string; destinationUrl: string;
  isActive: boolean; totalScans: number; createdAt: string;
}

interface Subscription {
  id: string;
  user: { name: string; email: string };
  plan: string;
  status: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string | null;
}

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  FREE:     { label: "مجاني",  color: "text-gray-400",   bg: "bg-gray-700/30" },
  PRO:      { label: "Pro",    color: "text-blue-400",   bg: "bg-blue-500/10" },
  BUSINESS: { label: "أعمال", color: "text-purple-400", bg: "bg-purple-500/10" },
};

const DEVICE_ICON: Record<string, any> = { MOBILE: Smartphone, DESKTOP: Monitor, TABLET: Tablet };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<AdminData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [qrs, setQrs] = useState<QRItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editConfig, setEditConfig] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [isSettingUpBot, setIsSettingUpBot] = useState(false);

  const handleSetupBot = async () => {
    setIsSettingUpBot(true);
    try {
      const res = await fetch("/api/admin/setup-bot", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(d.message);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSettingUpBot(false);
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, qrsRes, subsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/qr"),
        fetch("/api/admin/subscriptions"),
      ]);

      if (statsRes.status === 401) { router.push("/admin-bkd9x"); return; }

      const [statsData, usersData, qrsData, subsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        qrsRes.json(),
        subsRes.json(),
      ]);

      setData(statsData);
      setUsers(usersData.users || []);
      setQrs(qrsData.qrs || []);
      setSubscriptions(subsData.subscriptions || []);
      setEditConfig(statsData.siteConfig || {});
    } catch {
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const toggleUser = async (user: User) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    setUsers((p) => p.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    toast.success(user.isActive ? "تم تعليق الحساب" : "تم تفعيل الحساب");
  };

  const changeUserPlan = async (user: User, plan: string) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setUsers((p) => p.map((u) => u.id === user.id ? { ...u, plan } : u));
    toast.success(`تم تغيير خطة ${user.name} إلى ${PLAN_META[plan]?.label}`);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("حذف المستخدم نهائياً؟")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((p) => p.filter((u) => u.id !== id));
    toast.success("تم الحذف");
  };

  const toggleFlag = async (key: string, current: boolean) => {
    const res = await fetch("/api/features", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, isEnabled: !current }),
    });
    if (res.ok) {
      setData((d) => d ? {
        ...d,
        featureFlags: d.featureFlags.map((f) => f.key === key ? { ...f, isEnabled: !current } : f),
      } : d);
      toast.success(!current ? "تم التفعيل" : "تم التعطيل");
    }
  };

  const updateFlagPlan = async (key: string, minPlan: string) => {
    await fetch("/api/features", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, minPlan: minPlan || null }),
    });
    setData((d) => d ? {
      ...d,
      featureFlags: d.featureFlags.map((f) => f.key === key ? { ...f, minPlan: minPlan || null } : f),
    } : d);
    toast.success("تم التحديث");
  };

  const updateFlagAuth = async (key: string, requiresAuth: boolean) => {
    await fetch("/api/features", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, requiresAuth }),
    });
    setData((d) => d ? {
      ...d,
      featureFlags: d.featureFlags.map((f) => f.key === key ? { ...f, requiresAuth } : f),
    } : d);
    toast.success("تم التحديث");
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: editConfig }),
    });
    toast.success("تم حفظ الإعدادات");
    setSavingConfig(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-bkd9x");
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQRs = qrs.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.code.includes(search)
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">تحميل لوحة الإدارة...</p>
      </div>
    </div>
  );

  const v = data?.visitors;

  const TABS: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "overview",  label: "نظرة عامة",  icon: BarChart3 },
    { id: "visitors",  label: "الزوار",      icon: Globe },
    { id: "users",     label: `المستخدمون (${users.length})`, icon: Users },
    { id: "subscriptions", label: `الاشتراكات (${subscriptions.length})`, icon: DollarSign },
    { id: "pricing",   label: "خطط الأسعار", icon: Tag },
    { id: "qrcodes",   label: `الرموز (${qrs.length})`, icon: QrCode },
    { id: "features",  label: "الميزات",     icon: ToggleRight },
    { id: "settings",  label: "الإعدادات",   icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 border-b border-red-500/20 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">باركودي — لوحة الإدارة</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} title="تحديث" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/" target="_blank" className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-1">
              <Globe className="w-4 h-4" /> الموقع
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-2xl overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSearch(""); }}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                tab === id ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {tab === "overview" && data && (
          <div className="space-y-6">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "إجمالي المستخدمين", value: data.users.total, sub: `+${data.users.newToday} اليوم`, icon: Users, color: "blue", trend: "up" },
                { label: "زيارات اليوم", value: v?.todaySessions ?? 0, sub: `${v?.todayPageViews ?? 0} صفحة`, icon: Activity, color: "brand", trend: "up" },
                { label: "مسح QR اليوم", value: data.qr.scansToday, sub: `${data.qr.totalScans} إجمالي`, icon: QrCode, color: "green", trend: "up" },
                { label: "متوسط وقت الزيارة", value: formatDuration(v?.avgDuration ?? 0), sub: `${v?.bounceRate ?? 0}% ارتداد`, icon: Timer, color: "purple", trend: "down" },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-xs">{label}</p>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      color === "blue" ? "bg-blue-500/10 text-blue-400" :
                      color === "brand" ? "bg-brand-500/10 text-brand-400" :
                      color === "green" ? "bg-green-500/10 text-green-400" :
                      "bg-purple-500/10 text-purple-400"
                    }`}><Icon className="w-4 h-4" /></div>
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-gray-600 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Daily sessions chart */}
            {v?.dailySessions && v.dailySessions.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  الزيارات - آخر 30 يوماً
                </h3>
                <div className="flex items-end gap-1 h-24">
                  {(() => {
                    const max = Math.max(...v.dailySessions.map((d) => d.count), 1);
                    return v.dailySessions.map(({ day, count }) => (
                      <div key={day} className="flex-1 flex flex-col items-center group relative">
                        <div
                          className="w-full rounded-t bg-brand-500/30 hover:bg-brand-500/60 transition-colors cursor-pointer"
                          style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? "4px" : "1px" }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                          {day.slice(5)}: {count}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-between text-gray-600 text-xs mt-1">
                  <span>{v.dailySessions[0]?.day.slice(5)}</span>
                  <span>{v.dailySessions[v.dailySessions.length - 1]?.day.slice(5)}</span>
                </div>
              </div>
            )}

            {/* Plans + Top pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-bold text-white mb-4">توزيع الاشتراكات</h3>
                <div className="space-y-3">
                  {Object.entries(data.users.byPlan).map(([plan, count]) => {
                    const pct = data.users.total ? Math.round((count / data.users.total) * 100) : 0;
                    const meta = PLAN_META[plan];
                    return (
                      <div key={plan} className="flex items-center gap-3">
                        <span className={`text-sm font-medium w-20 ${meta?.color}`}>{meta?.label || plan}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-white font-bold text-sm w-8">{count}</span>
                        <span className="text-gray-600 text-xs w-10">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-white mb-4">الصفحات الأكثر زيارة</h3>
                <div className="space-y-2">
                  {v?.topPages.slice(0, 6).map(({ path, count }) => (
                    <div key={path} className="flex items-center gap-2">
                      <MousePointer className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm flex-1 truncate font-mono">{path}</span>
                      <span className="text-brand-400 font-bold text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VISITORS ──────────────────────────────────────────────────────── */}
        {tab === "visitors" && v && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "إجمالي الجلسات", value: v.totalSessions },
                { label: "صفحات مُشاهَدة", value: v.totalPageViews },
                { label: "اليوم", value: v.todaySessions },
                { label: "معدل الارتداد", value: `${v.bounceRate}%` },
                { label: "متوسط الوقت", value: formatDuration(v.avgDuration) },
              ].map(({ label, value }) => (
                <div key={label} className="card text-center">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Countries + Devices + Browsers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Countries */}
              <div className="card">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Map className="w-4 h-4 text-brand-400" /> الدول</h3>
                <div className="space-y-2">
                  {v.topCountries.map(({ country, count }) => {
                    const pct = v.totalSessions ? Math.round((count / v.totalSessions) * 100) : 0;
                    return (
                      <div key={country} className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm flex-1 truncate">{country || "غير معروف"}</span>
                        <div className="w-20 bg-gray-800 rounded-full h-1.5"><div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} /></div>
                        <span className="text-gray-400 text-xs w-10 text-left">{count}</span>
                      </div>
                    );
                  })}
                  {v.topCountries.length === 0 && <p className="text-gray-600 text-sm">لا بيانات بعد</p>}
                </div>
              </div>

              {/* Browsers */}
              <div className="card">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-brand-400" /> المتصفحات</h3>
                <div className="space-y-2">
                  {v.topBrowsers.map(({ browser, count }) => {
                    const pct = v.totalSessions ? Math.round((count / v.totalSessions) * 100) : 0;
                    return (
                      <div key={browser} className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm flex-1">{browser}</span>
                        <div className="w-20 bg-gray-800 rounded-full h-1.5"><div className="h-full rounded-full bg-purple-500" style={{ width: `${pct}%` }} /></div>
                        <span className="text-gray-400 text-xs w-10 text-left">{pct}%</span>
                      </div>
                    );
                  })}
                  {v.topBrowsers.length === 0 && <p className="text-gray-600 text-sm">لا بيانات بعد</p>}
                </div>
              </div>

              {/* Devices + Referers */}
              <div className="space-y-4">
                <div className="card">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Smartphone className="w-4 h-4 text-brand-400" /> الأجهزة</h3>
                  <div className="space-y-2">
                    {v.topDevices.map(({ device, count }) => {
                      const Icon = DEVICE_ICON[device] || Monitor;
                      const pct = v.totalSessions ? Math.round((count / v.totalSessions) * 100) : 0;
                      return (
                        <div key={device} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm flex-1">{device === "MOBILE" ? "جوال" : device === "DESKTOP" ? "كمبيوتر" : device === "TABLET" ? "تابلت" : "غير معروف"}</span>
                          <span className="text-brand-400 font-bold text-sm">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2"><ExternalLink className="w-4 h-4 text-brand-400" /> مصادر الزيارات</h3>
                  <div className="space-y-2">
                    {v.topReferers.slice(0, 5).map(({ source, count }) => (
                      <div key={source} className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm flex-1">{source}</span>
                        <span className="text-gray-400 text-sm">{count}</span>
                      </div>
                    ))}
                    {v.topReferers.length === 0 && <p className="text-gray-600 text-sm">معظم الزوار مباشرون</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="card">
              <h3 className="font-bold text-white mb-4">آخر الزيارات</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b border-gray-800">
                      <th className="pb-2 text-right">الدولة</th>
                      <th className="pb-2 text-right">المتصفح / النظام</th>
                      <th className="pb-2 text-right">الجهاز</th>
                      <th className="pb-2 text-right">الصفحة الأولى</th>
                      <th className="pb-2 text-right">المصدر</th>
                      <th className="pb-2 text-right">المدة</th>
                      <th className="pb-2 text-right">الصفحات</th>
                      <th className="pb-2 text-right">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {v.recentSessions.map((s) => {
                      const DevIcon = DEVICE_ICON[s.device] || Monitor;
                      return (
                        <tr key={s.sessionKey} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                          <td className="py-2 pr-2">{s.country || "—"} {s.city ? `· ${s.city}` : ""}</td>
                          <td className="py-2">{s.browser} / {s.os}</td>
                          <td className="py-2"><DevIcon className="w-4 h-4 text-gray-400" /></td>
                          <td className="py-2 font-mono text-xs text-gray-400">{s.landingPage || "/"}</td>
                          <td className="py-2 text-xs">{s.refererDomain || "مباشر"}</td>
                          <td className="py-2">{s.duration ? formatDuration(s.duration) : "—"}</td>
                          <td className="py-2 text-center">{s.pageViewCount}</td>
                          <td className="py-2 text-xs text-gray-500">{new Date(s.startTime).toLocaleTimeString("ar-SA")}</td>
                        </tr>
                      );
                    })}
                    {v.recentSessions.length === 0 && (
                      <tr><td colSpan={8} className="py-10 text-center text-gray-600">لا توجد زيارات بعد</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ──────────────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input className="input pr-10" placeholder="اسم أو بريد..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={fetchAll} className="btn-secondary px-4"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="card text-center py-20"><p className="text-gray-500">لا يوجد مستخدمون</p></div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className={clsx("card flex flex-col md:flex-row gap-4 items-start md:items-center", !user.isActive && "opacity-60")}>
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-lg flex-shrink-0">
                      {user.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold text-sm">{user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_META[user.plan]?.bg} ${PLAN_META[user.plan]?.color}`}>
                          {PLAN_META[user.plan]?.label || user.plan}
                        </span>
                        {user.role === "ADMIN" && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                        {!user.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">موقوف</span>}
                      </div>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                      <p className="text-gray-700 text-xs">
                        انضم: {new Date(user.createdAt).toLocaleDateString("ar-SA")} ·
                        دخولات: {user.loginCount} ·
                        {user.lastLoginAt && ` آخر دخول: ${new Date(user.lastLoginAt).toLocaleDateString("ar-SA")}`}
                      </p>
                    </div>

                    {/* Plan selector */}
                    <select value={user.plan} onChange={(e) => changeUserPlan(user, e.target.value)}
                      className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-300 cursor-pointer">
                      <option value="FREE">مجاني</option>
                      <option value="PRO">Pro</option>
                      <option value="BUSINESS">أعمال</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleUser(user)}
                        className={clsx("p-2 rounded-lg transition-colors",
                          user.isActive ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"
                        )}>
                        {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteUser(user.id)}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIPTIONS ──────────────────────────────────────────────────── */}
        {tab === "subscriptions" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input className="input pr-10" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={fetchAll} className="btn-secondary px-4"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="card text-center py-20"><p className="text-gray-500">لا يوجد اشتراكات حالياً</p></div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="card flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-lg flex-shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold text-sm">{sub.user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_META[sub.plan]?.bg} ${PLAN_META[sub.plan]?.color}`}>
                          {PLAN_META[sub.plan]?.label || sub.plan}
                        </span>
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-full",
                          sub.status === "ACTIVE" ? "bg-green-500/10 text-green-400" :
                          sub.status === "CANCELLED" ? "bg-red-500/10 text-red-400" :
                          "bg-yellow-500/10 text-yellow-400"
                        )}>
                          {sub.status === "ACTIVE" ? "نشط" : sub.status === "CANCELLED" ? "ملغي" : "منتهي"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">{sub.user.email}</p>
                      <p className="text-gray-700 text-xs">
                        القيمة: {sub.amount} {sub.currency} ·
                        البداية: {new Date(sub.startDate).toLocaleDateString("ar-SA")}
                        {sub.endDate && ` · النهاية: ${new Date(sub.endDate).toLocaleDateString("ar-SA")}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select value={sub.status} onChange={async (e) => {
                        await fetch(`/api/admin/subscriptions?id=${sub.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        toast.success("تم تحديث حالة الاشتراك");
                        fetchAll();
                      }}
                        className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-300 cursor-pointer">
                        <option value="ACTIVE">نشط</option>
                        <option value="CANCELLED">ملغي</option>
                        <option value="EXPIRED">منتهي</option>
                      </select>

                      <button onClick={async () => {
                        if (!confirm("هل أنت متأكد من حذف الاشتراك؟")) return;
                        await fetch(`/api/admin/subscriptions?id=${sub.id}`, { method: "DELETE" });
                        toast.success("تم الحذف");
                        fetchAll();
                      }}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── QR CODES ──────────────────────────────────────────────────────── */}
        {tab === "qrcodes" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input className="input pr-10" placeholder="عنوان أو كود..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              {filteredQRs.map((qr) => (
                <div key={qr.code} className={clsx("card flex items-center gap-4", !qr.isActive && "opacity-60")}>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-bold text-sm truncate">{qr.title}</p>
                      <span className="font-mono text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">/{qr.code}</span>
                      {!qr.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">معطّل</span>}
                    </div>
                    <p className="text-gray-500 text-xs truncate">{qr.destinationUrl}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1 text-brand-400 font-bold">
                      <BarChart3 className="w-3.5 h-3.5" />{qr.totalScans}
                    </span>
                    <span>{new Date(qr.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <Link href={`/dynamic-qr/analytics/${qr.code}`} target="_blank"
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-brand-400 transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              {filteredQRs.length === 0 && (
                <div className="card text-center py-16"><p className="text-gray-500">لا توجد رموز</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        {tab === "features" && data && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">تحكم في تفعيل/تعطيل كل ميزة، وتحديد الخطة المطلوبة وإلزامية تسجيل الدخول.</p>
            <div className="space-y-3">
              {data.featureFlags.map((flag) => (
                <div key={flag.key} className="card">
                  <div className="flex items-center gap-4">
                    {/* Toggle */}
                    <button onClick={() => toggleFlag(flag.key, flag.isEnabled)}
                      className={clsx("relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
                        flag.isEnabled ? "bg-brand-500" : "bg-gray-700"
                      )}>
                      <span className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                        flag.isEnabled ? "right-1" : "left-1"
                      )} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{flag.name}</p>
                        <span className="font-mono text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">{flag.key}</span>
                        {!flag.isEnabled && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">معطّل</span>}
                      </div>
                      {flag.description && <p className="text-gray-500 text-xs mt-0.5">{flag.description}</p>}
                    </div>

                    {/* Min plan */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-500 text-xs">أدنى خطة:</span>
                      <select value={flag.minPlan || ""} onChange={(e) => updateFlagPlan(flag.key, e.target.value)}
                        className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 cursor-pointer">
                        <option value="">الكل</option>
                        <option value="FREE">مجاني</option>
                        <option value="PRO">Pro</option>
                        <option value="BUSINESS">أعمال</option>
                      </select>
                    </div>

                    {/* Auth required */}
                    <button onClick={() => updateFlagAuth(flag.key, !flag.requiresAuth)}
                      className={clsx("flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors",
                        flag.requiresAuth ? "bg-yellow-500/10 text-yellow-400" : "bg-gray-800 text-gray-500"
                      )}>
                      {flag.requiresAuth ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      تسجيل دخول إلزامي
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        {tab === "pricing" && data && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">خطط الأسعار والاشتراكات</h2>
              <button onClick={saveConfig} disabled={savingConfig} className="btn-primary">
                {savingConfig ? "جاري الحفظ..." : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">قم بتعديل الأسعار والميزات التي تظهر للمستخدمين في صفحة الأسعار. سيتم تحديثها فوراً.</p>

            {["free", "pro"].map((planPrefix) => {
              const planItems = data.siteConfigFull.filter((c) => c.key.startsWith(`${planPrefix}_plan_`) || c.key.startsWith(`${planPrefix}_feat_`));
              if (planItems.length === 0) return null;
              const LABELS: Record<string, string> = { free: "الخطة المجانية", pro: "الاشتراك المدفوع" };
              
              return (
                <div key={planPrefix} className="card">
                  <h3 className="font-bold text-white mb-4 text-lg border-b border-gray-800 pb-2">{LABELS[planPrefix]}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planItems.map((item) => (
                      <div key={item.key} className={item.type === "text" ? "md:col-span-2" : ""}>
                        <label className="label">{item.label || item.key}</label>
                        {item.type === "boolean" ? (
                          <button
                            onClick={() => setEditConfig((p) => ({ ...p, [item.key]: p[item.key] === "true" ? "false" : "true" }))}
                            className={clsx("relative w-12 h-6 rounded-full transition-colors",
                              editConfig[item.key] === "true" ? "bg-brand-500" : "bg-gray-700"
                            )}>
                            <span className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                              editConfig[item.key] === "true" ? "right-1" : "left-1"
                            )} />
                          </button>
                        ) : item.type === "text" ? (
                          <textarea
                            className="input min-h-[120px] leading-relaxed"
                            value={editConfig[item.key] || ""}
                            onChange={(e) => setEditConfig((p) => ({ ...p, [item.key]: e.target.value }))}
                            placeholder={item.key}
                          />
                        ) : (
                          <input
                            className="input"
                            value={editConfig[item.key] || ""}
                            onChange={(e) => setEditConfig((p) => ({ ...p, [item.key]: e.target.value }))}
                            placeholder={item.key}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Payment Settings */}
            <div className="card mt-8">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4">
                <h3 className="font-bold text-white text-lg">بوابات الدفع (API) والخصومات</h3>
                <button onClick={handleSetupBot} disabled={isSettingUpBot} className="btn-secondary text-sm py-1.5">
                  {isSettingUpBot ? "جاري الربط..." : "ربط بوت تليغرام تلقائياً"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.siteConfigFull.filter(c => c.group === "payments").map(item => (
                  <div key={item.key}>
                    <label className="label">{item.label || item.key}</label>
                    {item.type === "boolean" ? (
                      <button
                        onClick={() => setEditConfig((p) => ({ ...p, [item.key]: p[item.key] === "true" ? "false" : "true" }))}
                        className={clsx("relative w-12 h-6 rounded-full transition-colors",
                          editConfig[item.key] === "true" ? "bg-brand-500" : "bg-gray-700"
                        )}>
                        <span className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          editConfig[item.key] === "true" ? "right-1" : "left-1"
                        )} />
                      </button>
                    ) : (
                      <input
                        className="input"
                        value={editConfig[item.key] || ""}
                        onChange={(e) => setEditConfig((p) => ({ ...p, [item.key]: e.target.value }))}
                        placeholder={item.key}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────────────── */}
        {tab === "settings" && data && (
          <div className="space-y-6">
            {/* Group configs */}
            {["general", "limits", "ads"].map((group) => {
              const items = data.siteConfigFull.filter((c) => c.group === group);
              if (items.length === 0) return null;
              const LABELS: Record<string, string> = {
                general: "إعدادات عامة", limits: "حدود الاستخدام",
                ads: "الإعلانات (AdSense)",
              };
              return (
                <div key={group} className="card">
                  <h3 className="font-bold text-white mb-4">{LABELS[group]}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div key={item.key}>
                        <label className="label">{item.label || item.key}</label>
                        {item.type === "boolean" ? (
                          <button
                            onClick={() => setEditConfig((p) => ({ ...p, [item.key]: p[item.key] === "true" ? "false" : "true" }))}
                            className={clsx("relative w-12 h-6 rounded-full transition-colors",
                              editConfig[item.key] === "true" ? "bg-brand-500" : "bg-gray-700"
                            )}>
                            <span className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                              editConfig[item.key] === "true" ? "right-1" : "left-1"
                            )} />
                          </button>
                        ) : item.type === "text" ? (
                          <textarea
                            className="input min-h-[100px]"
                            value={editConfig[item.key] || ""}
                            onChange={(e) => setEditConfig((p) => ({ ...p, [item.key]: e.target.value }))}
                            placeholder={item.key}
                          />
                        ) : (
                          <input
                            className="input"
                            value={editConfig[item.key] || ""}
                            onChange={(e) => setEditConfig((p) => ({ ...p, [item.key]: e.target.value }))}
                            placeholder={item.key}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button onClick={saveConfig} disabled={savingConfig}
              className="btn-primary px-8 py-3 disabled:opacity-50">
              {savingConfig ? "جاري الحفظ..." : <><Save className="w-4 h-4" /> حفظ الإعدادات</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
