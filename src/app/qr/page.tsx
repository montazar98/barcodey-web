import type { Metadata } from "next";
import { QRGenerator } from "@/components/qr/QRGenerator";

export const metadata: Metadata = {
  title: "مولد رمز QR",
  description: "أنشئ رموز QR احترافية مع تخصيص كامل للألوان والشعارات",
};

export default function QRPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            مولد رمز <span className="gradient-text">QR</span>
          </h1>
          <p className="text-gray-400 text-lg">
            أنشئ رموز QR احترافية مع تخصيص كامل
          </p>
        </div>
        <QRGenerator />
      </div>
    </div>
  );
}
