"use client";
import { useEffect, useState, useRef } from "react";

interface AdBannerProps {
  slotKey?: "adsense_slot_top" | "adsense_slot_bottom" | string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

export function AdBanner({ slotKey = "adsense_slot_top", format = "auto", className = "" }: AdBannerProps) {
  const [adConfig, setAdConfig] = useState<{ client: string; slot: string } | null>(null);
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    fetch("/api/config/public")
      .then((r) => r.json())
      .then((data) => {
        if (data.features?.adsense && data.config?.adsense_id) {
          const slot = data.config[slotKey] || "";
          if (slot) {
            setAdConfig({ client: data.config.adsense_id, slot });
          }
        }
      })
      .catch(() => {});
  }, [slotKey]);

  useEffect(() => {
    if (adConfig && !pushedRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (err) {
        // Adsbygoogle error suppression
      }
    }
  }, [adConfig]);

  if (!adConfig) return null;

  return (
    <div className={`w-full overflow-hidden my-6 text-center ${className}`}>
      <span className="text-[10px] text-gray-600 uppercase tracking-widest block mb-1">إعلان</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adConfig.client}
        data-ad-slot={adConfig.slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
