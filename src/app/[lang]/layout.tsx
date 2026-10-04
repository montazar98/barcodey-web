import type { Metadata } from "next";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { VisitorTracker } from "@/components/VisitorTracker";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { I18nProvider } from "@/i18n/client";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: {
    default: "باركودي - مولد وقارئ الباركود ورموز QR الاحترافي",
    template: "%s | باركودي",
  },
  description:
    "أداة احترافية ومتكاملة لإنشاء وتخصيص رموز QR والباركود بمختلف الأنواع، مع إمكانية إضافة شعار، وتغيير الألوان، والطباعة، والتصدير بصيغ عالية الجودة.",
  keywords: ["QR code", "barcode", "باركود", "رمز QR", "مولد باركود", "barcode generator"],
  authors: [{ name: "Barcodey" }],
  openGraph: {
    title: "باركودي - مولد وقارئ الباركود ورموز QR",
    description: "أداة احترافية لإنشاء رموز QR والباركود",
    url: "https://barcodey.online",
    siteName: "Barcodey",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "باركودي - مولد وقارئ الباركود ورموز QR",
    description: "أداة احترافية لإنشاء رموز QR والباركود",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://barcodey.online/#webapp",
      name: "باركودي - مولد وقارئ الباركود ورموز QR",
      url: "https://barcodey.online",
      description:
        "أداة احترافية ومجانية لإنشاء وتخصيص رموز QR والباركود بمختلف الأنواع مع تصدير بصيغ عالية الجودة",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "SAR",
      },
      featureList: [
        "QR Code Generator",
        "Barcode Generator",
        "QR Code Scanner",
        "Bulk QR Generation",
        "Custom Colors and Logos",
        "PNG SVG PDF Export",
      ],
      inLanguage: ["ar", "en", "ru"],
    },
    {
      "@type": "Organization",
      "@id": "https://barcodey.online/#org",
      name: "باركودي",
      url: "https://barcodey.online",
      logo: "https://barcodey.online/logo.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://barcodey.online/#website",
      url: "https://barcodey.online",
      name: "باركودي",
      inLanguage: "ar",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://barcodey.online/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  // Await params per Next.js 15+ or dynamically, but assuming it's available
  // To avoid Next.js issues with dynamic params, we can await params directly if needed
  // For Next.js 14- this is synchronous, but we can make the component async to await getDictionary
  const resolvedParams = await Promise.resolve(params);
  const dict = await getDictionary(resolvedParams.lang as any);

  return (
    <html lang={resolvedParams.lang} dir={resolvedParams.lang === "ar" ? "rtl" : "ltr"} className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <I18nProvider dict={dict}>
          <AdSenseScript />
          <VisitorTracker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f3f4f6",
                border: "1px solid #374151",
                borderRadius: "12px",
              },
              success: {
                iconTheme: {
                  primary: "#00d9a3",
                  secondary: "#111827",
                },
              },
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
