"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QrCode, AlertCircle, Lock, CheckCircle } from "lucide-react";

type ScanState = "loading" | "redirecting" | "blocked" | "password" | "error";

const REASONS: Record<string, string> = {
  not_found: "رمز QR غير موجود",
  inactive: "هذا الرمز معطّل حالياً",
  expired: "انتهت صلاحية هذا الرمز",
  max_scans_reached: "تجاوز الرمز الحد الأقصى من عمليات المسح",
};

export default function RedirectPage() {
  const { code } = useParams<{ code: string }>();
  const [state, setState] = useState<ScanState>("loading");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [countdown, setCountdown] = useState(3);

  const performScan = async (pw?: string) => {
    try {
      const res = await fetch(`/api/qr/${code}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();

      if (data.blocked) {
        if (data.reason === "password_required" || data.reason === "wrong_password") {
          setState("password");
          if (data.reason === "wrong_password") setPasswordError("كلمة المرور غير صحيحة");
        } else {
          setState("blocked");
          setReason(data.reason);
        }
        return;
      }

      setState("redirecting");
      // Countdown then redirect
      let count = 3;
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(timer);
          window.location.href = data.redirectUrl;
        }
      }, 1000);
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    performScan();
  }, [code]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-300 text-lg font-medium">جاري التحقق من الرمز...</p>
          <p className="text-gray-500 text-sm mt-2">barcodey.online</p>
        </div>
      </div>
    );
  }

  if (state === "redirecting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">جاري إعادة التوجيه...</h1>
          <p className="text-gray-400 mb-6">ستُنقل خلال {countdown} ثوانٍ</p>
          <div className="flex gap-2 justify-center">
            {[3, 2, 1].map((n) => (
              <div
                key={n}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  countdown < n ? "bg-brand-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-8">مُشغَّل بواسطة باركودي</p>
        </div>
      </div>
    );
  }

  if (state === "password") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">رمز محمي بكلمة مرور</h1>
          <p className="text-gray-400 text-sm mb-6">أدخل كلمة المرور للمتابعة</p>
          <input
            type="password"
            className="input mb-3"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
            onKeyDown={(e) => e.key === "Enter" && performScan(password)}
            autoFocus
          />
          {passwordError && (
            <p className="text-red-400 text-sm mb-3">{passwordError}</p>
          )}
          <button
            onClick={() => performScan(password)}
            className="btn-primary w-full justify-center"
          >
            <CheckCircle className="w-4 h-4" />
            متابعة
          </button>
        </div>
      </div>
    );
  }

  if (state === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {REASONS[reason] || "الرمز غير متاح"}
          </h1>
          <p className="text-gray-400 mb-8">
            إذا كنت تعتقد أن هذا خطأ، تواصل مع صاحب الرمز.
          </p>
          <a href="/" className="btn-secondary">
            <QrCode className="w-4 h-4" />
            إنشاء رمز جديد
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">حدث خطأ. يُرجى المحاولة مجدداً.</p>
        <button onClick={() => { setState("loading"); performScan(); }} className="btn-secondary">
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
