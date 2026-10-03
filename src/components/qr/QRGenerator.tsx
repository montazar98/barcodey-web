"use client";
import { useState, useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import {
  Download, Copy, Share2, RefreshCw, Link, FileText, Wifi, Phone, Mail, MapPin, Type,
} from "lucide-react";
import { clsx } from "clsx";

type QRType = "url" | "text" | "wifi" | "phone" | "email" | "location";

const qrTypes = [
  { id: "url" as QRType, label: "رابط", icon: Link },
  { id: "text" as QRType, label: "نص", icon: Type },
  { id: "wifi" as QRType, label: "واي فاي", icon: Wifi },
  { id: "phone" as QRType, label: "هاتف", icon: Phone },
  { id: "email" as QRType, label: "بريد", icon: Mail },
  { id: "location" as QRType, label: "موقع", icon: MapPin },
];

const errorLevels = ["L", "M", "Q", "H"] as const;

function buildQRValue(type: QRType, data: Record<string, string>): string {
  switch (type) {
    case "url": return data.url || "https://barcodey.online";
    case "text": return data.text || "";
    case "wifi": return `WIFI:T:${data.encryption};S:${data.ssid};P:${data.password};;`;
    case "phone": return `tel:${data.phone}`;
    case "email": return `mailto:${data.email}?subject=${data.subject}&body=${data.body}`;
    case "location": return `geo:${data.lat},${data.lng}`;
    default: return "";
  }
}

export function QRGenerator() {
  const [qrType, setQrType] = useState<QRType>("url");
  const [formData, setFormData] = useState<Record<string, string>>({
    url: "https://barcodey.online",
    text: "",
    ssid: "",
    password: "",
    encryption: "WPA",
    phone: "",
    email: "",
    subject: "",
    body: "",
    lat: "",
    lng: "",
  });
  const [fgColor, setFgColor] = useState("#00d9a3");
  const [bgColor, setBgColor] = useState("#0a0f0d");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [style, setStyle] = useState<"squares" | "dots">("squares");
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = buildQRValue(qrType, formData);

  const downloadPNG = useCallback(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "barcodey-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("تم تنزيل الرمز بصيغة PNG");
  }, []);

  const downloadSVG = useCallback(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <image href="${dataURL}" width="${size}" height="${size}"/>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "barcodey-qr.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success("تم تنزيل الرمز بصيغة SVG");
  }, [size]);

  const copyToClipboard = useCallback(async () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("تم نسخ الرمز إلى الحافظة");
      } catch {
        toast.error("تعذّر النسخ، جرّب التنزيل");
      }
    });
  }, []);

  const setField = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Controls */}
      <div className="space-y-6">
        {/* Type selector */}
        <div className="card">
          <h2 className="font-bold text-white mb-4">نوع المحتوى</h2>
          <div className="grid grid-cols-3 gap-2">
            {qrTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setQrType(id)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 border",
                  qrType === id
                    ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-200"
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Form */}
        <div className="card space-y-4">
          <h2 className="font-bold text-white mb-2">المحتوى</h2>
          {qrType === "url" && (
            <div>
              <label className="label">الرابط</label>
              <input
                type="url"
                className="input"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setField("url", e.target.value)}
              />
            </div>
          )}
          {qrType === "text" && (
            <div>
              <label className="label">النص</label>
              <textarea
                className="input min-h-[120px] resize-none"
                placeholder="أكتب النص هنا..."
                value={formData.text}
                onChange={(e) => setField("text", e.target.value)}
              />
            </div>
          )}
          {qrType === "wifi" && (
            <>
              <div>
                <label className="label">اسم الشبكة (SSID)</label>
                <input className="input" placeholder="MyNetwork" value={formData.ssid} onChange={(e) => setField("ssid", e.target.value)} />
              </div>
              <div>
                <label className="label">كلمة المرور</label>
                <input type="password" className="input" placeholder="••••••••" value={formData.password} onChange={(e) => setField("password", e.target.value)} />
              </div>
              <div>
                <label className="label">التشفير</label>
                <select className="input" value={formData.encryption} onChange={(e) => setField("encryption", e.target.value)}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">بدون كلمة مرور</option>
                </select>
              </div>
            </>
          )}
          {qrType === "phone" && (
            <div>
              <label className="label">رقم الهاتف</label>
              <input className="input" placeholder="+966XXXXXXXX" value={formData.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
          )}
          {qrType === "email" && (
            <>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input type="email" className="input" placeholder="example@domain.com" value={formData.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
              <div>
                <label className="label">الموضوع</label>
                <input className="input" placeholder="موضوع الرسالة" value={formData.subject} onChange={(e) => setField("subject", e.target.value)} />
              </div>
            </>
          )}
          {qrType === "location" && (
            <>
              <div>
                <label className="label">خط العرض (Latitude)</label>
                <input className="input" placeholder="24.7136" value={formData.lat} onChange={(e) => setField("lat", e.target.value)} />
              </div>
              <div>
                <label className="label">خط الطول (Longitude)</label>
                <input className="input" placeholder="46.6753" value={formData.lng} onChange={(e) => setField("lng", e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Style Controls */}
        <div className="card space-y-5">
          <h2 className="font-bold text-white">التخصيص</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">لون الرمز</label>
              <div className="flex items-center gap-3">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-transparent" />
                <span className="text-gray-400 text-sm font-mono">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="label">لون الخلفية</label>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-transparent" />
                <span className="text-gray-400 text-sm font-mono">{bgColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="label">الحجم: {size}px</label>
            <input type="range" min="128" max="512" step="8" value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-brand-500" />
          </div>

          <div>
            <label className="label">مستوى تصحيح الأخطاء</label>
            <div className="flex gap-2">
              {errorLevels.map((level) => (
                <button key={level} onClick={() => setErrorLevel(level)}
                  className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    errorLevel === level
                      ? "bg-brand-500 text-gray-950"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  )}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Preview + Actions */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="card flex flex-col items-center">
          <h2 className="font-bold text-white mb-6 self-start">معاينة الرمز</h2>
          <div
            ref={qrRef}
            className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/10 p-4"
            style={{ backgroundColor: bgColor }}
          >
            {qrValue ? (
              <QRCodeCanvas
                value={qrValue}
                size={Math.min(size, 280)}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorLevel}
                marginSize={1}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-gray-500 text-sm">
                أدخل المحتوى لرؤية الرمز
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 w-full">
            <button onClick={downloadPNG} className="btn-primary justify-center flex-col py-3 text-xs gap-1">
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button onClick={downloadSVG} className="btn-secondary justify-center flex-col py-3 text-xs gap-1">
              <FileText className="w-4 h-4" />
              SVG
            </button>
            <button onClick={copyToClipboard} className="btn-secondary justify-center flex-col py-3 text-xs gap-1">
              <Copy className="w-4 h-4" />
              نسخ
            </button>
          </div>
        </div>

        {/* QR Value Preview */}
        {qrValue && (
          <div className="card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">بيانات الرمز</h3>
            <p className="text-xs text-gray-500 font-mono break-all bg-gray-800 rounded-lg p-3">
              {qrValue}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
