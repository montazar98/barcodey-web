"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("مرحباً بك في لوحة الإدارة");
      window.location.href = "/admin-bkd9x/dashboard";
    } catch (e: any) {
      toast.error(e.message || "بيانات غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">لوحة الإدارة</h1>
          <p className="text-gray-500 text-sm">منطقة مقيّدة — للمسؤولين فقط</p>
        </div>

        <div className="card border-red-500/10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  className="input pr-10"
                  placeholder="admin@barcodey.online"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? "text" : "password"}
                  className="input pr-10 pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري التحقق...</>
                : <><LogIn className="w-5 h-5" /> دخول الإدارة</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          يتم تسجيل جميع محاولات الدخول
        </p>
      </div>
    </div>
  );
}
