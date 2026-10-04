"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/client";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dict = useI18n();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setErrorMsg(dict.activate?.no_code || "No activation code provided");
      setLoading(false);
      return;
    }

    const activate = async () => {
      try {
        const res = await fetch("/api/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 401) {
            toast.error(dict.activate?.login_first || "You must login first to activate your account!");
            router.push(`/auth/login?redirect=${encodeURIComponent(`/activate?code=${code}`)}`);
          } else {
            setErrorMsg(data.error || dict.activate?.failed || "Activation failed");
          }
        } else {
          setSuccess(true);
          toast.success(dict.activate?.success_msg || "Your subscription has been activated successfully!");
        }
      } catch (e) {
        setErrorMsg(dict.activate?.server_error || "Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [code, router, dict]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        <h2 className="text-xl font-bold text-white">{dict.activate?.loading}</h2>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-brand-500" />
        </div>
        <h2 className="text-3xl font-black text-white">{dict.activate?.congrats}</h2>
        <p className="text-gray-400 text-lg">{dict.activate?.pro_activated}</p>
        <Link href="/dashboard" className="btn-primary px-8 py-3 mt-4">
          {dict.activate?.go_dashboard}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white">{dict.activate?.activation_failed}</h2>
      <p className="text-gray-400">{errorMsg}</p>
      
      {/* Fallback form if they want to re-enter */}
      <form className="w-full max-w-sm mt-4 flex gap-2" onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        window.location.href = `/activate?code=${fd.get("code")}`;
      }}>
        <input name="code" className="input flex-1" placeholder={dict.activate?.enter_code_manually} defaultValue={code || ""} />
        <button type="submit" className="btn-primary">{dict.activate?.activate_btn}</button>
      </form>

      <Link href="/pricing" className="text-brand-400 hover:underline text-sm mt-4">
        {dict.activate?.back_to_pricing}
      </Link>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center">
      <div className="card max-w-lg w-full p-8 shadow-2xl">
        <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
          <ActivateContent />
        </Suspense>
      </div>
    </div>
  );
}
