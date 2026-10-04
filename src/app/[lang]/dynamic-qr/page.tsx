"use client";
import { useState, useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Link, Type, Wifi, Phone, Mail, MapPin, Smartphone, Monitor, Tablet,
  Lock, Calendar, Hash, Tag, BarChart3, Download, Zap, ChevronDown, ChevronUp,
  Globe, RefreshCw
} from "lucide-react";
import { clsx } from "clsx";

const BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : "https://barcodey.online";

type Step = "content" | "customize" | "preview";

const STEPS: { id: Step; label: string }[] = [
  { id: "content", label: "المحتوى" },
  { id: "customize", label: "التخصيص" },
  { id: "preview", label: "النتيجة" },
];

export default function DynamicQRPage() {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("content");
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Content
  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [customCode, setCustomCode] = useState("");

  // App Links
  const [useDeviceRedirects, setUseDeviceRedirects] = useState(false);
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");

  // Customization
  const [fgColor, setFgColor] = useState("#00d9a3");
  const [bgColor, setBgColor] = useState("#0a0f0d");
  const [size, setSize] = useState(256);

  // Preview QR value (shows redirect URL)
  const shortCode = customCode || "preview";
  const qrValue = createdCode
    ? `${BASE_URL}/r/${createdCode}`
    : `${BASE_URL}/r/${shortCode}`;

  const isStepValid = (s: Step) => {
    if (s === "content") return title.trim() && destinationUrl.trim();
    return true;
  };

  const handleCreate = async () => {
    if (!title || !destinationUrl) {
      toast.error("أدخل العنوان والرابط أولاً");
      return;
    }
    try {
      new URL(destinationUrl);
    } catch {
      toast.error("الرابط غير صحيح");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          destinationUrl,
          fgColor,
          bgColor,
          code: customCode || undefined,
          deviceRedirects: useDeviceRedirects
            ? {
                ios: iosUrl || undefined,
                android: androidUrl || undefined,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل الإنشاء");
      }

      const { qr } = await res.json();
      setCreatedCode(qr.code);
      toast.success(`✅ تم إنشاء الرمز: ${qr.code}`);
      setStep("preview");
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `barcodey-${createdCode || "qr"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("تم تنزيل الرمز!");
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            QR الذكي الديناميكي
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            رمز واحد{" "}
            <span className="gradient-text">يتغير بذكاء</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            غيّر الوجهة في أي وقت، تتبّع كل مسح، وحلّل سلوك المستخدمين
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => isStepValid("content") && setStep(s.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  step === s.id
                    ? "bg-brand-500 text-gray-950"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                <span className={clsx(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                  step === s.id ? "bg-gray-950/20" : "bg-gray-700"
                )}>
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className="w-6 h-px bg-gray-700" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-5">

            {/* ── STEP 1: Content ── */}
            {step === "content" && (
              <>
                <div className="card space-y-4">
                  <h2 className="font-bold text-white text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-400" />
                    بيانات الرمز
                  </h2>
                  <div>
                    <label className="label">عنوان الرمز *</label>
                    <input
                      className="input"
                      placeholder="مثال: رمز QR المنتج الجديد"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">الرابط الافتراضي *</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://example.com"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                    />
                    <p className="text-gray-600 text-xs mt-1">يمكن تغييره لاحقاً دون إعادة طباعة الرمز</p>
                  </div>
                  <div>
                    <label className="label">رمز مخصص (اختياري)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm bg-gray-800 px-3 py-3 rounded-r-xl border border-gray-700 border-l-0 whitespace-nowrap">
                        barcodey.online/r/
                      </span>
                      <input
                        className="input rounded-r-none border-r-0 flex-1"
                        placeholder="my-brand"
                        value={customCode}
                        onChange={(e) =>
                          setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">أحرف إنجليزية وأرقام وشرطات فقط. إذا تُرك فارغاً يتم توليده تلقائياً.</p>
                  </div>
                </div>

                {/* Device Redirects */}
                <div className="card">
                  <button
                    onClick={() => setUseDeviceRedirects(!useDeviceRedirects)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-sm">توجيه ذكي لتطبيقات الجوال</p>
                        <p className="text-gray-500 text-xs">وجّه أجهزة iOS لمتجر App Store وأجهزة Android لمتجر Google Play</p>
                      </div>
                    </div>
                    <div className={clsx(
                      "relative w-11 h-6 rounded-full transition-colors",
                      useDeviceRedirects ? "bg-brand-500" : "bg-gray-700"
                    )}>
                      <span className={clsx(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        useDeviceRedirects ? "right-1" : "left-1"
                      )} />
                    </div>
                  </button>

                  {useDeviceRedirects && (
                    <div className="mt-5 space-y-3 pt-4 border-t border-gray-800">
                      {[
                        { icon: Smartphone, label: "رابط App Store (لأجهزة iOS)", key: "ios", value: iosUrl, set: setIosUrl, color: "text-blue-400", placeholder: "https://apps.apple.com/..." },
                        { icon: Smartphone, label: "رابط Google Play (لأجهزة Android)", key: "android", value: androidUrl, set: setAndroidUrl, color: "text-green-400", placeholder: "https://play.google.com/..." },
                      ].map(({ icon: Icon, label, value, set, color, placeholder }) => (
                        <div key={label} className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                            <input
                              type="url"
                              className="input py-2 text-sm"
                              placeholder={placeholder}
                              value={value}
                              onChange={(e) => set(e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <p className="text-gray-600 text-xs">
                        أي جهاز آخر غير الهواتف سيتم توجيهه إلى "الرابط الافتراضي" الأساسي.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 2: Customize ── */}
            {step === "customize" && (
              <div className="card space-y-5">
                <h2 className="font-bold text-white text-lg">تخصيص المظهر</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">لون الرمز</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer border border-gray-700 bg-transparent"
                      />
                      <span className="text-gray-400 text-sm font-mono">{fgColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">لون الخلفية</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer border border-gray-700 bg-transparent"
                      />
                      <span className="text-gray-400 text-sm font-mono">{bgColor}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label">الحجم: {size}px</label>
                  <input
                    type="range" min="128" max="512" step="8" value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                {/* Color presets */}
                <div>
                  <label className="label">ألوان جاهزة</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { fg: "#00d9a3", bg: "#0a0f0d", name: "برّاق" },
                      { fg: "#ffffff", bg: "#000000", name: "كلاسيك" },
                      { fg: "#3b82f6", bg: "#eff6ff", name: "أزرق" },
                      { fg: "#8b5cf6", bg: "#faf5ff", name: "بنفسجي" },
                      { fg: "#ef4444", bg: "#fff5f5", name: "أحمر" },
                      { fg: "#f59e0b", bg: "#fffbeb", name: "ذهبي" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-xs text-gray-400"
                      >
                        <div className="flex gap-1">
                          <span className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: preset.bg }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.fg }} />
                        </div>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Preview / Created ── */}
            {step === "preview" && createdCode && (
              <div className="card space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">تم إنشاء الرمز بنجاح! 🎉</h2>
                    <p className="text-gray-400 text-sm">رابط المسح: barcodey.online/r/{createdCode}</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 font-mono text-sm">
                  <p className="text-gray-400 text-xs mb-1">رابط الرمز</p>
                  <p className="text-brand-400 break-all">{BASE_URL}/r/{createdCode}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={downloadQR} className="btn-primary justify-center">
                    <Download className="w-4 h-4" />
                    تنزيل PNG
                  </button>
                  <button
                    onClick={() => router.push(`/dynamic-qr/analytics/${createdCode}`)}
                    className="btn-secondary justify-center text-brand-400 border-brand-500/30 hover:bg-brand-500/10"
                  >
                    <BarChart3 className="w-4 h-4" />
                    عرض إحصائيات الرمز
                  </button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step !== "content" && step !== "preview" && (
                <button
                  onClick={() => {
                    const idx = STEPS.findIndex((s) => s.id === step);
                    setStep(STEPS[idx - 1].id);
                  }}
                  className="btn-secondary flex-1 justify-center"
                >
                  السابق
                </button>
              )}
              {step !== "preview" && (
                step === "customize" ? (
                  <button
                    onClick={handleCreate}
                    disabled={loading || !title || !destinationUrl}
                    className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" /> جاري الإنشاء...</>
                    ) : (
                      <><Zap className="w-4 h-4" /> إنشاء الرمز</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isStepValid("content")) { toast.error("أكمل البيانات المطلوبة"); return; }
                      const idx = STEPS.findIndex((s) => s.id === step);
                      setStep(STEPS[idx + 1].id);
                    }}
                    className="btn-primary flex-1 justify-center"
                  >
                    التالي
                  </button>
                )
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="card flex flex-col items-center text-center">
              <h3 className="font-bold text-white mb-4 self-start">معاينة مباشرة</h3>
              <div
                ref={qrRef}
                className="rounded-2xl overflow-hidden p-4 shadow-2xl shadow-brand-500/5 mb-4"
                style={{ backgroundColor: bgColor }}
              >
                <QRCodeCanvas
                  value={qrValue}
                  size={200}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  marginSize={1}
                />
              </div>

              <div className="w-full bg-gray-800 rounded-xl p-3 text-left">
                <p className="text-gray-500 text-xs mb-1">الرابط الذي يحمله الرمز</p>
                <p className="text-brand-400 text-xs font-mono break-all">{qrValue}</p>
              </div>

              {destinationUrl && (
                <div className="w-full bg-gray-800 rounded-xl p-3 text-left mt-2">
                  <p className="text-gray-500 text-xs mb-1">الوجهة الفعلية</p>
                  <p className="text-gray-300 text-xs font-mono break-all truncate">{destinationUrl}</p>
                </div>
              )}

              {/* Features Summary */}
              <div className="w-full mt-4 space-y-2">
                {useDeviceRedirects && (
                  <div className="flex items-center gap-2 text-purple-400 text-xs bg-purple-500/5 rounded-lg px-3 py-2">
                    <Smartphone className="w-3.5 h-3.5" /> توجيه ذكي حسب الجهاز مفعّل
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
