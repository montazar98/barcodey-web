import type { Metadata } from "next";
import { BarcodeGenerator } from "@/components/barcode/BarcodeGenerator";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params: { lang } }: { params: { lang: string } }): Promise<Metadata> {
  const t = await getDictionary(lang as any);
  return {
    title: t.barcode.title,
    description: t.barcode.desc,
  };
}

export default async function BarcodePage({ params: { lang } }: { params: { lang: string } }) {
  const t = await getDictionary(lang as any);
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            {t.barcode.page_title} <span className="gradient-text">{t.barcode.gradient_title}</span>
          </h1>
          <p className="text-gray-400 text-lg">{t.barcode.desc}</p>
        </div>
        <BarcodeGenerator />
      </div>
    </div>
  );
}
