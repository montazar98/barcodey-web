import type { Metadata } from "next";
import { AppLinksGenerator } from "@/components/app-links/AppLinksGenerator";

export const metadata: Metadata = {
  title: "روابط التطبيقات الموحدة",
  description: "أنشئ رابطاً ذكياً واحداً يوجه المستخدمين إلى متجر التطبيقات المناسب لجهازهم",
};

export default function AppLinksPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            روابط التطبيقات <span className="gradient-text">الموحدة</span>
          </h1>
          <p className="text-gray-400 text-lg">
            رابط ذكي واحد لتوجيه مستخدمي الايفون لـ App Store والاندرويد لـ Google Play
          </p>
        </div>
        <AppLinksGenerator />
      </div>
    </div>
  );
}
