"use client";
import { useState } from "react";
import { Smartphone, Monitor, Link2, Copy, BarChart3, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export function AppLinksGenerator() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://barcodey.online";

  const handleCreate = async () => {
    if (!title || (!iosUrl && !androidUrl)) {
      toast.error("يرجى إدخال عنوان الرابط ورابط تطبيق واحد على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          destinationUrl: fallbackUrl || iosUrl || androidUrl, // Default fallback
          deviceRedirects: {
            ios: iosUrl || undefined,
            android: androidUrl || undefined,
          },
          // Invisible QR settings
          fgColor: "#000000",
          bgColor: "#ffffff",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الرابط");

      setCreatedCode(data.qr.code);
      toast.success("تم إنشاء الرابط بنجاح!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(`${BASE_URL}/r/${createdCode}`);
    toast.success("تم نسخ الرابط");
  };

  if (createdCode) {
    return (
      <div className="card max-w-xl mx-auto space-y-6 text-center">
        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">الرابط الموحد جاهز!</h2>
        <p className="text-gray-400 text-sm">شارك هذا الرابط، وسيقوم النظام بتوجيه المستخدمين حسب أجهزتهم.</p>

        <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-brand-400 font-mono text-lg truncate flex-1 text-left" dir="ltr">
            {BASE_URL}/r/{createdCode}
          </p>
          <button onClick={copyLink} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
            <Copy className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
          <Link href={`/dynamic-qr/analytics/${createdCode}`} className="btn-primary flex-1 justify-center">
            <BarChart3 className="w-4 h-4" /> عرض إحصائيات الرابط
          </Link>
          <button onClick={() => {
            setTitle(""); setIosUrl(""); setAndroidUrl(""); setFallbackUrl(""); setCreatedCode(null);
          }} className="btn-secondary flex-1 justify-center">
            إنشاء رابط آخر
          </button>
        </div>
        
        {/* Hidden QR Canvas for downloading if needed later */}
        <div className="hidden">
           <QRCodeCanvas id="hidden-qr" value={`${BASE_URL}/r/${createdCode}`} size={1024} />
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-xl mx-auto space-y-6">
      <div>
        <label className="label">عنوان الرابط (للتعرف عليه لاحقاً)</label>
        <input
          className="input"
          placeholder="مثال: رابط تحميل التطبيق"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div>
          <label className="label flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" /> رابط App Store (أجهزة iOS)
          </label>
          <input
            type="url"
            className="input"
            placeholder="https://apps.apple.com/..."
            value={iosUrl}
            onChange={(e) => setIosUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-green-400" /> رابط Google Play (أجهزة Android)
          </label>
          <input
            type="url"
            className="input"
            placeholder="https://play.google.com/..."
            value={androidUrl}
            onChange={(e) => setAndroidUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div>
          <label className="label flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-400" /> الرابط الافتراضي للكمبيوتر (اختياري)
          </label>
          <input
            type="url"
            className="input"
            placeholder="https://yourwebsite.com"
            value={fallbackUrl}
            onChange={(e) => setFallbackUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            سيتم توجيه مستخدمي الكمبيوتر (أو الأجهزة غير المدعومة) إلى هذا الرابط.
          </p>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading || !title || (!iosUrl && !androidUrl)}
        className="btn-primary w-full justify-center py-3 text-lg disabled:opacity-50"
      >
        {loading ? (
          <><div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" /> جاري الإنشاء...</>
        ) : (
          <><Link2 className="w-5 h-5" /> إنشاء الرابط الموحد</>
        )}
      </button>
    </div>
  );
}
