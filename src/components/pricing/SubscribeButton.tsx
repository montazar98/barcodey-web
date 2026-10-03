"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  plan: string;
  cta: string;
  href: string;
  gateway?: string;
  botUsername?: string;
}

export function SubscribeButton({ plan, cta, href, gateway, botUsername }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (plan === "FREE") {
      router.push(href);
      return;
    }

    // Direct Telegram Redirection
    if (gateway === "telegram") {
      if (!botUsername) {
        toast.error("يرجى إعداد يوزر بوت تليغرام من لوحة التحكم أولاً");
        return;
      }
      window.location.href = `https://t.me/${botUsername}?start=buy_pro`;
      return;
    }

    // Stripe/PayPal Flow (Future)
    setLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login");
          toast.error("يرجى تسجيل الدخول أولاً");
        } else {
          toast.error(data.error || "عذراً، حدث خطأ ما");
        }
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      toast.error("فشل الاتصال بخادم الدفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="btn-primary w-full justify-center py-3 text-lg mt-auto disabled:opacity-50"
    >
      {loading ? "جاري التحويل..." : cta}
    </button>
  );
}
