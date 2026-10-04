import type { Metadata } from "next";
import { BulkGenerator } from "@/components/qr/BulkGenerator";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params: { lang } }: { params: { lang: string } }): Promise<Metadata> {
  const t = await getDictionary(lang as any);
  return {
    title: t.bulk.title,
    description: t.bulk.desc,
  };
}

export default async function BulkPage({ params: { lang } }: { params: { lang: string } }) {
  const t = await getDictionary(lang as any);
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            {t.bulk.page_title} <span className="gradient-text">{t.bulk.gradient_title}</span>
          </h1>
          <p className="text-gray-400 text-lg">{t.bulk.desc}</p>
        </div>
        <BulkGenerator />
      </div>
    </div>
  );
}
