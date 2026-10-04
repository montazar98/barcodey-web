"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, Mail, Lock, Eye, EyeOff, Zap, LogIn, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFeatureNotice = () => {
    if (!redirectUrl || redirectUrl === "/dashboard") return null;
    if (redirectUrl.includes("barcode")) return "مولد الباركود متاح حصرياً للأعضاء المسجلين";
    if (redirectUrl.includes("dynamic-qr")) return "إنشاء وإدارة رموز QR الديناميكية تتطلب تسجيل الدخول";
    if (redirectUrl.includes("bulk")) return "الإنشاء بالجملة يتطلب تسجيل الدخول";
    return "يرجى تسجيل الدخول للوصول إلى هذه الصفحة";
  };

  const notice = getFeatureNotice();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`مرحباً، ${data.user.name}! 👋`);
      router.push(redirectUrl);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <QrCode className="w-6 h-6 text-gray-950" />
          </div>
          <span className="text-2xl font-black gradient-text">باركودي</span>
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">أهلاً بعودتك!</h1>
        <p className="text-gray-400">سجّل دخولك للوصول إلى كافة الميزات</p>
      </div>

      {/* Feature notice banner if redirected */}
      {notice && (
        <div className="mb-6 p-4 rounded-xl border border-brand-500/30 bg-brand-500/10 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-brand-400 flex-shrink-0" />
          <p className="text-sm text-brand-300 font-medium">{notice}</p>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                className="input pr-10"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">كلمة المرور</label>
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPass ? "text" : "password"}
                className="input pr-10 pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" /> جاري الدخول...</>
            ) : (
              <><LogIn className="w-5 h-5" /> تسجيل الدخول</>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            ليس لديك حساب؟{" "}
            <Link
              href={redirectUrl ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}` : "/auth/register"}
              className="text-brand-400 hover:text-brand-300 font-semibold"
            >
              إنشاء حساب مجاني
            </Link>
          </p>
        </div>
      </div>

      {/* Features reminder */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {["رموز ديناميكية", "مولد باركود كامل", "تحليلات دقيقة"].map((f) => (
          <div key={f} className="text-center bg-gray-900/50 rounded-xl py-3 px-2 border border-gray-800">
            <Zap className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-gray-400">جاري التحميل...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
