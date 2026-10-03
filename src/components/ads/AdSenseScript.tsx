"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export function AdSenseScript() {
  const [adsenseId, setAdsenseId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config/public")
      .then((r) => r.json())
      .then((data) => {
        if (data.features?.adsense && data.config?.adsense_id) {
          setAdsenseId(data.config.adsense_id);
        }
      })
      .catch(() => {});
  }, []);

  if (!adsenseId) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
