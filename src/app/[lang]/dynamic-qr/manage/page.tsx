"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import {
  Plus, Search, Trash2, Edit3, BarChart3, Copy, Power, ExternalLink,
  QrCode, Smartphone, Monitor, Clock, Zap, Tag, Calendar, Hash,
  Lock, Globe, RefreshCw, Download
} from "lucide-react";
import { clsx } from "clsx";
import type { DynamicQR } from "@/lib/qr-store";

type SortBy = "newest" | "most_scans" | "title";

export default function ManagePage() {
  const [qrs, setQrs] = useState<DynamicQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [editingUrl, setEditingUrl] = useState<{ code: string; url: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr");
      const { qrs } = await res.json();
      setQrs(qrs || []);
    } catch {
      toast.error("فشل تحميل الرموز");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQRs(); }, []);

  const toggleActive = async (qr: DynamicQR) => {
    try {
      await fetch(`/api/qr/${qr.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !qr.isActive }),
      });
      setQrs((prev) => prev.map((q) => q.code === qr.code ? { ...q, isActive: !q.isActive } : q));
      toast.success(qr.isActive ? "تم تعطيل الرمز" : "تم تفعيل الرمز");
    } catch { toast.error("فشلت العملية"); }
  };

  const deleteQR = async (code: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرمز؟")) return;
    try {
      await fetch(`/api/qr/${code}`, { method: "DELETE" });
      setQrs((prev) => prev.filter((q) => q.code !== code));
      toast.success("تم الحذف");
    } catch { toast.error("فشل الحذف"); }
  };

  const updateUrl = async () => {
    if (!editingUrl) return;
    try {
      new URL(editingUrl.url);
    } catch {
      toast.error("الرابط غير صحيح");
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/qr/${editingUrl.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationUrl: editingUrl.url }),
      });
      setQrs((prev) => prev.map((q) =>
        q.code === editingUrl.code ? { ...q, destinationUrl: editingUrl.url } : q
      ));
      toast.success("تم تحديث الرابط! 🎉");
      setEditingUrl(null);
    } catch { toast.error("فشل التحديث"); }
    finally { setSaving(false); }
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط!");
  };

  const downloadQR = (qr: DynamicQR) => {
    const canvas = document.getElementById(`qr-${qr.code}`) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `barcodey-${qr.code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Filter & sort
  const filtered = qrs
    .filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.code.includes(search) ||
      q.destinationUrl.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "most_scans") return b.totalScans - a.totalScans;
      if (sortBy === "title") return a.title.localeCompare(b.title, "ar");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const totalScans = qrs.reduce((s, q) => s + q.totalScans, 0);
  const activeCount = qrs.filter((q) => q.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">تحميل الرموز...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">إدارة الرموز الديناميكية</h1>
            <p className="text-gray-400">تحكم، تتبّع، وحلّل كل رموز QR من مكان واحد</p>
          </div>
          <Link href="/dynamic-qr" className="btn-primary flex-shrink-0">
            <Plus className="w-5 h-5" />
            رمز جديد
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي الرموز", value: qrs.length, icon: QrCode, color: "brand" },
            { label: "نشط", value: activeCount, icon: Zap, color: "green" },
            { label: "إجمالي المسح", value: totalScans.toLocaleString("ar"), icon: BarChart3, color: "blue" },
            { label: "معطّل", value: qrs.length - activeCount, icon: Power, color: "red" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  color === "brand" ? "bg-brand-500/10 text-brand-400" :
                  color === "green" ? "bg-green-500/10 text-green-400" :
                  color === "blue" ? "bg-blue-500/10 text-blue-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              className="input pr-10"
              placeholder="ابحث بالعنوان، الكود، أو الرابط..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="newest">الأحدث</option>
            <option value="most_scans">الأكثر مسحاً</option>
            <option value="title">الاسم</option>
          </select>
          <button onClick={fetchQRs} className="btn-secondary px-4">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* QR List */}
        {filtered.length === 0 ? (
          <div className="card text-center py-20">
            <QrCode className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              {search ? "لا نتائج مطابقة" : "لا توجد رموز ديناميكية بعد"}
            </p>
            {!search && (
              <Link href="/dynamic-qr" className="btn-primary">
                <Plus className="w-4 h-4" />
                أنشئ أول رمز
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((qr) => (
              <div
                key={qr.code}
                className={clsx(
                  "card transition-all duration-300",
                  !qr.isActive && "opacity-60"
                )}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* QR Thumbnail */}
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2"
                    style={{ backgroundColor: qr.bgColor }}
                  >
                    <QRCodeCanvas
                      id={`qr-${qr.code}`}
                      value={`${typeof window !== "undefined" ? window.location.origin : "https://barcodey.online"}/r/${qr.code}`}
                      size={70}
                      fgColor={qr.fgColor}
                      bgColor={qr.bgColor}
                      level="M"
                      marginSize={0}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white truncate">{qr.title}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-gray-800 text-gray-400">
                            {qr.code}
                          </span>
                          {!qr.isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">معطّل</span>
                          )}
                          {qr.password && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> محمي
                            </span>
                          )}
                          {qr.expiresAt && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(qr.expiresAt) < new Date() ? "منتهي" : "مؤقت"}
                            </span>
                          )}
                        </div>
                        {/* URL editor */}
                        {editingUrl?.code === qr.code ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="url"
                              className="input py-1.5 text-sm flex-1"
                              value={editingUrl.url}
                              onChange={(e) => setEditingUrl({ code: qr.code, url: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && updateUrl()}
                              autoFocus
                            />
                            <button onClick={updateUrl} disabled={saving} className="btn-primary py-1.5 px-3 text-xs">
                              {saving ? "..." : "حفظ"}
                            </button>
                            <button onClick={() => setEditingUrl(null)} className="btn-secondary py-1.5 px-3 text-xs">
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <p className="text-gray-400 text-sm truncate">{qr.destinationUrl}</p>
                            <button
                              onClick={() => setEditingUrl({ code: qr.code, url: qr.destinationUrl })}
                              className="text-brand-400 hover:text-brand-300 flex-shrink-0"
                              title="تعديل الرابط"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
                        <strong className="text-brand-400">{qr.totalScans.toLocaleString("ar")}</strong> مسحة
                      </span>
                      {qr.scans.length > 0 && (() => {
                        const devices = { mobile: 0, desktop: 0, tablet: 0 };
                        qr.scans.forEach((s) => { if (s.device !== "unknown") devices[s.device as keyof typeof devices]++; });
                        return (
                          <>
                            {devices.mobile > 0 && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {devices.mobile}</span>}
                            {devices.desktop > 0 && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {devices.desktop}</span>}
                          </>
                        );
                      })()}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(qr.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                      {qr.tags && qr.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {qr.tags.slice(0, 2).join("، ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    <button onClick={() => copyLink(qr.code)} title="نسخ الرابط" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-brand-400 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => downloadQR(qr)} title="تنزيل PNG" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-brand-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <a href={`/r/${qr.code}`} target="_blank" rel="noopener noreferrer" title="اختبار الرمز" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-brand-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link href={`/dynamic-qr/analytics/${qr.code}`} title="التحليلات" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-purple-400 transition-colors">
                      <BarChart3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleActive(qr)}
                      title={qr.isActive ? "تعطيل" : "تفعيل"}
                      className={clsx(
                        "p-2 rounded-lg transition-colors",
                        qr.isActive
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                      )}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteQR(qr.code)} title="حذف" className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
