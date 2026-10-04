import type { Metadata } from "next";
import { QRScanner } from "@/components/qr/QRScanner";

export const metadata: Metadata = {
  title: "قارئ QR والباركود",
  description: "امسح أي رمز QR أو باركود باستخدام الكاميرا أو رفع صورة",
};

export default function ScannerPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            قارئ <span className="gradient-text">QR والباركود</span>
          </h1>
          <p className="text-gray-400 text-lg">امسح أي رمز باستخدام الكاميرا أو ارفع صورة</p>
        </div>
        <QRScanner />
      </div>
    </div>
  );
}
