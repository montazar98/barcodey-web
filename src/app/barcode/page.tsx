import type { Metadata } from "next";
import { BarcodeGenerator } from "@/components/barcode/BarcodeGenerator";

export const metadata: Metadata = {
  title: "مولد الباركود",
  description: "أنشئ باركود احترافي بأكثر من 20 نوعاً مختلفاً",
};

export default function BarcodePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            مولد <span className="gradient-text">الباركود</span>
          </h1>
          <p className="text-gray-400 text-lg">أنشئ باركود احترافي بأكثر من 20 نوعاً مختلفاً</p>
        </div>
        <BarcodeGenerator />
      </div>
    </div>
  );
}
