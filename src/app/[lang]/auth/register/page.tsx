"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, Mail, Lock, Eye, EyeOff, User, CheckCircle, UserPlus, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { useI18n } from "@/i18n/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = useI18n();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const REQUIREMENTS = [
    { label: dict.auth?.req_length || "8 characters minimum", test: (p: string) => p.length >= 8 },
    { label: dict.auth?.req_uppercase || "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: dict.auth?.req_number || "Number", test: (p: string) => /\d/.test(p) },
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const strength = REQUIREMENTS.filter((r) => r.test(password)).length;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error(dict.auth?.must_agree_terms || "You must agree to the terms"); return; }
    if (strength < 2) { toast.error(dict.auth?.password_strength_too_weak || "Password is too weak"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(dict.auth?.account_created || "Account created successfully! 🎉");
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
          <span className="text-2xl font-black gradient-text">{dict.nav?.brand}</span>
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">{dict.auth?.create_free_account}</h1>
        <p className="text-gray-400">{dict.auth?.create_account_desc}</p>
      </div>

      <div className="card">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">{dict.auth?.full_name}</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="input pr-10"
                placeholder={dict.auth?.name_placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">{dict.auth?.email}</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                className="input pr-10"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">{dict.auth?.password}</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPass ? "text" : "password"}
                className="input pr-10 pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={clsx("h-1.5 flex-1 rounded-full transition-all",
                      strength >= i
                        ? i === 1 ? "bg-red-500" : i === 2 ? "bg-yellow-500" : "bg-brand-500"
                        : "bg-gray-700"
                    )} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {REQUIREMENTS.map((r) => (
                    <span key={r.label} className={clsx(
                      "text-xs flex items-center gap-1 transition-colors",
                      r.test(password) ? "text-brand-400" : "text-gray-600"
                    )}>
                      <CheckCircle className="w-3 h-3" /> {r.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setAgreed(!agreed)}
              className={clsx(
                "w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer",
                agreed ? "bg-brand-500 border-brand-500" : "border-gray-600 bg-gray-800"
              )}
            >
              {agreed && <CheckCircle className="w-3.5 h-3.5 text-gray-950" />}
            </div>
            <span className="text-gray-400 text-sm">
              {dict.auth?.agree_terms}{" "}
              <Link href="/privacy" className="text-brand-400 hover:underline">{dict.footer?.privacy}</Link>
              {" "}{dict.auth?.terms_of_use}
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agreed || strength < 2}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" /> {dict.auth?.registering}</>
            ) : (
              <><UserPlus className="w-5 h-5" /> {dict.auth?.register_btn}</>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            {dict.auth?.has_account}{" "}
            <Link
              href={redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : "/auth/login"}
              className="text-brand-400 hover:text-brand-300 font-semibold"
            >
              {dict.auth?.login_now}
            </Link>
          </p>
        </div>
      </div>

      {/* Free plan perks */}
      <div className="mt-6 card border-brand-500/20 bg-brand-500/5">
        <p className="text-brand-400 font-semibold text-sm mb-3">{dict.auth?.free_plan_perks_title}</p>
        <div className="grid grid-cols-2 gap-2">
          {[dict.auth?.free_plan_perk_1, dict.auth?.free_plan_perk_2, dict.auth?.free_plan_perk_3, dict.auth?.free_plan_perk_4].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-400 text-xs">
              <CheckCircle className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
