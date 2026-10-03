/**
 * Visitor/Browser analytics utilities
 * Parses User-Agent strings without external packages
 * Detects country from IP headers (Cloudflare / Vercel / X-Forwarded-For)
 */

// ─── UA Parsing ───────────────────────────────────────────────────────────────

export interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: "MOBILE" | "TABLET" | "DESKTOP" | "UNKNOWN";
  isBot: boolean;
}

const BOT_PATTERNS = /bot|crawler|spider|scraper|curl|wget|python|java|go-http|axios|fetch|node|http-client|libwww|postman/i;

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\/(\S+)/,            "Edge"],
  [/OPR\/(\S+)/,            "Opera"],
  [/SamsungBrowser\/(\S+)/, "Samsung"],
  [/Chrome\/(\S+)/,         "Chrome"],
  [/Firefox\/(\S+)/,        "Firefox"],
  [/Safari\/(\S+)/,         "Safari"],
  [/MSIE\s(\S+)/,           "IE"],
  [/Trident.*rv:(\S+)/,     "IE"],
];

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows NT 10/,                "Windows 10"],
  [/Windows NT 11/,                "Windows 11"],
  [/Windows NT 6\.3/,              "Windows 8.1"],
  [/Windows NT 6\.2/,              "Windows 8"],
  [/Windows NT 6\.1/,              "Windows 7"],
  [/Windows/,                      "Windows"],
  [/iPhone OS ([\d_]+)/,           "iOS"],
  [/iPad.*OS ([\d_]+)/,            "iPadOS"],
  [/Android ([\d.]+)/,             "Android"],
  [/Mac OS X ([\d_]+)/,            "macOS"],
  [/Linux/,                        "Linux"],
  [/CrOS/,                         "ChromeOS"],
];

export function parseUserAgent(ua: string): ParsedUA {
  if (!ua) return { browser: "Unknown", browserVersion: "", os: "Unknown", osVersion: "", device: "UNKNOWN", isBot: false };

  const isBot = BOT_PATTERNS.test(ua);

  // Device detection
  const isTablet = /iPad|tablet|Kindle|PlayBook|Silk|GT-P|SM-T|Tab|GT-N/i.test(ua);
  const isMobile = !isTablet && /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const device: ParsedUA["device"] = isTablet ? "TABLET" : isMobile ? "MOBILE" : ua.length > 5 ? "DESKTOP" : "UNKNOWN";

  // Browser
  let browser = "Other";
  let browserVersion = "";
  for (const [pattern, name] of BROWSER_PATTERNS) {
    const m = ua.match(pattern);
    if (m) { browser = name; browserVersion = m[1]?.split(".")[0] || ""; break; }
  }

  // OS
  let os = "Other";
  let osVersion = "";
  for (const [pattern, name] of OS_PATTERNS) {
    const m = ua.match(pattern);
    if (m) {
      os = name;
      osVersion = (m[1] || "").replace(/_/g, ".");
      break;
    }
  }

  return { browser, browserVersion, os, osVersion, device, isBot };
}

// ─── IP & Geo helpers ────────────────────────────────────────────────────────

export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function getCountryFromHeaders(headers: Headers): { country: string; countryCode: string; city: string } {
  // Cloudflare headers (available on Vercel + Cloudflare)
  const cfCountry = headers.get("cf-ipcountry") || "";
  const cfCity    = headers.get("cf-ipcity")    || "";
  // Vercel edge headers
  const vCountry  = headers.get("x-vercel-ip-country") || cfCountry;
  const vCity     = headers.get("x-vercel-ip-city")    || cfCity;

  const countryNames: Record<string, string> = {
    SA: "السعودية", AE: "الإمارات", KW: "الكويت", QA: "قطر",
    BH: "البحرين", OM: "عُمان", EG: "مصر", JO: "الأردن",
    LB: "لبنان", IQ: "العراق", MA: "المغرب", DZ: "الجزائر",
    TN: "تونس", LY: "ليبيا", SD: "السودان", YE: "اليمن",
    SY: "سوريا", PS: "فلسطين", US: "الولايات المتحدة",
    GB: "المملكة المتحدة", DE: "ألمانيا", FR: "فرنسا",
    IN: "الهند", PK: "باكستان", TR: "تركيا",
  };

  return {
    countryCode: vCountry,
    country: countryNames[vCountry] || vCountry || "غير معروف",
    city: decodeURIComponent(vCity || ""),
  };
}

// ─── Session key generator ────────────────────────────────────────────────────

export function generateSessionKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

// ─── Referer parsing ─────────────────────────────────────────────────────────

export function parseReferer(referer: string | null): { referer: string; refererDomain: string } {
  if (!referer) return { referer: "", refererDomain: "direct" };
  try {
    const url = new URL(referer);
    const host = url.hostname.replace(/^www\./, "");
    const SEARCH_ENGINES: Record<string, string> = {
      "google.com": "Google", "bing.com": "Bing", "yahoo.com": "Yahoo",
      "duckduckgo.com": "DuckDuckGo", "yandex.com": "Yandex",
      "t.co": "Twitter/X", "facebook.com": "Facebook", "instagram.com": "Instagram",
      "tiktok.com": "TikTok", "youtube.com": "YouTube", "linkedin.com": "LinkedIn",
      "reddit.com": "Reddit", "snapchat.com": "Snapchat",
    };
    return {
      referer,
      refererDomain: SEARCH_ENGINES[host] || host,
    };
  } catch {
    return { referer, refererDomain: "other" };
  }
}

// ─── UTM extraction ──────────────────────────────────────────────────────────

export function extractUTM(url: string): Record<string, string> {
  try {
    const u = new URL(url);
    return {
      utmSource:   u.searchParams.get("utm_source")   || "",
      utmMedium:   u.searchParams.get("utm_medium")   || "",
      utmCampaign: u.searchParams.get("utm_campaign") || "",
    };
  } catch {
    return {};
  }
}

// ─── Time formatting ─────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}ث`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}د ${seconds % 60}ث`;
  return `${Math.floor(seconds / 3600)}س ${Math.floor((seconds % 3600) / 60)}د`;
}
