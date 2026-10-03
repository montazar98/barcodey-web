"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { QrCode, Barcode, ScanLine, Layers, DollarSign, Menu, X, Zap, LogIn, LogOut, User, ChevronDown, Smartphone } from "lucide-react";
import { clsx } from "clsx";

const navLinks = [
  { href: "/dynamic-qr", label: "QR ديناميكي", icon: Zap },
  { href: "/app-links", label: "روابط التطبيقات", icon: Smartphone },
  { href: "/qr", label: "مولد QR", icon: QrCode },
  { href: "/barcode", label: "مولد الباركود", icon: Barcode },
  { href: "/scanner", label: "القارئ", icon: ScanLine },
  { href: "/bulk", label: "بالجملة", icon: Layers },
  { href: "/pricing", label: "الأسعار", icon: DollarSign },
];

interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Hide navbar on admin pages
  if (pathname.startsWith("/admin-bkd9x")) return null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUser(data?.user ?? null))
      .finally(() => setAuthLoading(false));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const PLAN_BADGE: Record<string, string> = {
    free: "bg-gray-700 text-gray-400",
    pro: "bg-blue-500/20 text-blue-400",
    business: "bg-purple-500/20 text-purple-400",
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-400/50 transition-all duration-300">
              <QrCode className="w-5 h-5 text-gray-950" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">باركودي</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === href
                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
            ) : user ? (
              /* User menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                    {user.name[0]}
                  </div>
                  <span className="hidden sm:block text-gray-200 text-sm font-medium">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${PLAN_BADGE[user.plan] || PLAN_BADGE.free}`}>
                        {{ free: "مجاني", pro: "احترافي", business: "أعمال" }[user.plan] || user.plan}
                      </span>
                    </div>
                    <div className="p-2">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
                        <User className="w-4 h-4" /> لوحة التحكم
                      </Link>
                      <Link href="/dynamic-qr/manage" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
                        <QrCode className="w-4 h-4" /> رموزي
                      </Link>
                      <button onClick={logout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm w-full transition-colors mt-1 border-t border-gray-800 pt-3">
                        <LogOut className="w-4 h-4" /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest actions */
              <>
                <Link href="/auth/login" className="hidden md:flex btn-secondary py-2 px-4 text-sm">
                  <LogIn className="w-4 h-4" />
                  دخول
                </Link>
                <Link href="/auth/register" className="hidden md:flex btn-primary py-2 px-4 text-sm">
                  <Zap className="w-4 h-4" />
                  ابدأ مجاناً
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === href
                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                )}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="pt-2 mt-1 border-t border-gray-800 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-secondary justify-center">
                    <User className="w-4 h-4" /> لوحة التحكم
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 bg-red-500/5 text-sm font-medium">
                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary justify-center">
                    <LogIn className="w-4 h-4" /> تسجيل الدخول
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary justify-center">
                    <Zap className="w-4 h-4" /> ابدأ مجاناً
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
