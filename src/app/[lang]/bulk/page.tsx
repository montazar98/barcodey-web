import type { Metadata } from "next";
import { BulkGenerator } from "@/components/qr/BulkGenerator";

export const metadata: Metadata = {
  title: "الإنشاء بالجملة",
  description: "أنشئ مئات رموز QR والباركود دفعة واحدة",
};

export default function BulkPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            الإنشاء <span className="gradient-text">بالجملة</span>
          </h1>
          <p className="text-gray-400 text-lg">أنشئ مئات الرموز دفعة واحدة وصدّرها بصيغة ZIP</p>
        </div>
        <BulkGenerator />
      </div>
    </div>
  );
}
