"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "bkd_sid";
const START_KEY   = "bkd_start";

function getOrCreateSession(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
      sessionStorage.setItem(START_KEY, Date.now().toString());
    }
    return sid;
  } catch { return ""; }
}

async function trackPageView(sessionKey: string, path: string, prevPath?: string, prevStart?: number) {
  if (!sessionKey) return;
  const timeOnPrev = prevPath && prevStart ? Math.round((Date.now() - prevStart) / 1000) : undefined;
  await fetch("/api/track/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionKey,
      path,
      title: document.title,
      language: navigator.language,
      screenRes: `${screen.width}x${screen.height}`,
      prevPath,
      timeOnPrev,
    }),
  }).catch(() => {});
}

export function VisitorTracker() {
  const pathname = usePathname();
  const prevPathRef  = useRef<string | undefined>(undefined);
  const pageStartRef = useRef<number>(Date.now());
  const sessionRef   = useRef<string>("");

  // Init session
  useEffect(() => {
    sessionRef.current = getOrCreateSession();
  }, []);

  // Track page views
  useEffect(() => {
    const sid = sessionRef.current || getOrCreateSession();
    if (!sid) return;

    const prev      = prevPathRef.current;
    const prevStart = pageStartRef.current;

    trackPageView(sid, pathname, prev, prev ? prevStart : undefined);

    prevPathRef.current  = pathname;
    pageStartRef.current = Date.now();
  }, [pathname]);

  // Track session exit / duration
  useEffect(() => {
    const sendExit = () => {
      const sid   = sessionRef.current;
      const start = parseInt(sessionStorage.getItem(START_KEY) || "0", 10);
      if (!sid || !start) return;
      const duration = Math.round((Date.now() - start) / 1000);
      const timeOnPage = Math.round((Date.now() - pageStartRef.current) / 1000);

      navigator.sendBeacon(
        "/api/track/exit",
        JSON.stringify({ sessionKey: sid, duration, path: pathname, timeOnPage })
      );
    };

    window.addEventListener("beforeunload", sendExit);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendExit();
    });

    return () => {
      window.removeEventListener("beforeunload", sendExit);
    };
  }, [pathname]);

  return null; // invisible component
}
