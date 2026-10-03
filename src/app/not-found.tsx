import Link from "next/link";
import { QrCode, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="text-8xl font-black text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">الصفحة غير موجودة</h2>
        <p className="text-gray-400 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/" className="btn-primary">
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
