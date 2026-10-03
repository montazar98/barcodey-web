import db from "@/lib/db";
import { parseUserAgent } from "@/lib/analytics";
import { nanoid } from "nanoid";

// Keep original types for compatibility with existing UI
export interface DynamicQR {
  id: string;
  code: string;
  title: string;
  destinationUrl: string;
  isDynamic: boolean;
  isActive: boolean;
  password?: string | null;
  expiresAt?: string | null;
  maxScans?: number | null;
  fgColor: string;
  bgColor: string;
  mobileUrl?: string | null;
  tabletUrl?: string | null;
  desktopUrl?: string | null;
  iosUrl?: string | null;
  androidUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  tags?: string[] | null;
  totalScans: number;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  scans: QRScan[];
}

export interface QRScan {
  id: string;
  timestamp: string;
  device: string;
  browser?: string | null;
  os?: string | null;
  country?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface DeviceRedirect {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  ios?: string;
  android?: string;
}

function mapQR(qr: any, scans: any[] = []): DynamicQR {
  return {
    ...qr,
    tags: qr.tags ? JSON.parse(qr.tags) : null,
    expiresAt: qr.expiresAt?.toISOString() ?? null,
    createdAt: qr.createdAt.toISOString(),
    updatedAt: qr.updatedAt.toISOString(),
    scans: scans.map((s) => ({
      ...s,
      timestamp: s.timestamp.toISOString(),
    })),
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getAllQRs(userId?: string): Promise<DynamicQR[]> {
  const qrs = await db.qRCode.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { scans: { take: 0 } }, // don't load scans for list view
  });
  return qrs.map((q) => mapQR(q, []));
}

export async function getQRByCode(code: string): Promise<DynamicQR | null> {
  const qr = await db.qRCode.findUnique({
    where: { code },
    include: { scans: { orderBy: { timestamp: "desc" } } },
  });
  if (!qr) return null;
  return mapQR(qr, qr.scans);
}

export async function createQR(input: {
  title: string;
  destinationUrl: string;
  fgColor?: string;
  bgColor?: string;
  code?: string;
  password?: string;
  expiresAt?: string;
  maxScans?: number;
  deviceRedirects?: DeviceRedirect;
  tags?: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userId?: string;
}): Promise<DynamicQR> {
  const code = input.code || nanoid(6).toLowerCase();

  const qr = await db.qRCode.create({
    data: {
      code,
      title: input.title,
      destinationUrl: input.destinationUrl,
      fgColor: input.fgColor || "#00d9a3",
      bgColor: input.bgColor || "#0a0f0d",
      password: input.password || null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      maxScans: input.maxScans || null,
      mobileUrl: input.deviceRedirects?.mobile || null,
      tabletUrl: input.deviceRedirects?.tablet || null,
      desktopUrl: input.deviceRedirects?.desktop || null,
      iosUrl: input.deviceRedirects?.ios || null,
      androidUrl: input.deviceRedirects?.android || null,
      tags: input.tags ? JSON.stringify(input.tags) : null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      userId: input.userId || null,
    },
    include: { scans: true },
  });

  return mapQR(qr, qr.scans);
}

export async function updateQR(code: string, updates: Partial<{
  title: string;
  destinationUrl: string;
  isActive: boolean;
  password: string | null;
  expiresAt: string | null;
  maxScans: number | null;
  fgColor: string;
  bgColor: string;
  mobileUrl: string | null;
  tabletUrl: string | null;
  desktopUrl: string | null;
  iosUrl: string | null;
  androidUrl: string | null;
  tags: string[];
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}>): Promise<DynamicQR | null> {
  const qr = await db.qRCode.update({
    where: { code },
    data: {
      ...updates,
      tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
      expiresAt: updates.expiresAt !== undefined
        ? (updates.expiresAt ? new Date(updates.expiresAt) : null)
        : undefined,
    },
    include: { scans: { orderBy: { timestamp: "desc" } } },
  }).catch(() => null);

  return qr ? mapQR(qr, qr.scans) : null;
}

export async function deleteQR(code: string): Promise<boolean> {
  const result = await db.qRCode.delete({ where: { code } }).catch(() => null);
  return !!result;
}

// ─── Scan recording ───────────────────────────────────────────────────────────

export async function recordScan(
  code: string,
  userAgent: string,
  ip: string,
  referer?: string,
  password?: string
): Promise<{ blocked: boolean; reason?: string; redirectUrl?: string; qr?: DynamicQR }> {
  const qr = await db.qRCode.findUnique({
    where: { code },
    include: { scans: false },
  });

  if (!qr) return { blocked: true, reason: "not_found" };
  if (!qr.isActive) return { blocked: true, reason: "inactive" };
  if (qr.expiresAt && new Date() > qr.expiresAt) return { blocked: true, reason: "expired" };
  if (qr.maxScans && qr.totalScans >= qr.maxScans) return { blocked: true, reason: "max_scans_reached" };

  if (qr.password) {
    if (!password) return { blocked: true, reason: "password_required" };
    if (password !== qr.password) return { blocked: true, reason: "wrong_password" };
  }

  const parsed = parseUserAgent(userAgent);
  const device = parsed.device;
  const os = parsed.os.toLowerCase();

  // Build redirect URL
  let redirectUrl = qr.destinationUrl;
  if (os === "ios" || os === "ipados") {
    if (qr.iosUrl) redirectUrl = qr.iosUrl;
  } else if (os === "android") {
    if (qr.androidUrl) redirectUrl = qr.androidUrl;
  } else {
    if (device === "MOBILE" && qr.mobileUrl) redirectUrl = qr.mobileUrl;
    else if (device === "TABLET" && qr.tabletUrl) redirectUrl = qr.tabletUrl;
    else if (device === "DESKTOP" && qr.desktopUrl) redirectUrl = qr.desktopUrl;
  }

  // Append UTM params
  if (qr.utmSource || qr.utmMedium || qr.utmCampaign) {
    try {
      const url = new URL(redirectUrl);
      if (qr.utmSource)   url.searchParams.set("utm_source",   qr.utmSource);
      if (qr.utmMedium)   url.searchParams.set("utm_medium",   qr.utmMedium);
      if (qr.utmCampaign) url.searchParams.set("utm_campaign", qr.utmCampaign);
      redirectUrl = url.toString();
    } catch {}
  }

  // Record scan
  await db.$transaction([
    db.qRScan.create({
      data: {
        qrCodeId: qr.id,
        device,
        browser: parsed.browser,
        os: parsed.os,
        ip: ip.slice(0, 45),
        referer: referer?.slice(0, 500),
        userAgent: userAgent.slice(0, 500),
      },
    }),
    db.qRCode.update({
      where: { id: qr.id },
      data: { totalScans: { increment: 1 } },
    }),
  ]);

  const updated = await getQRByCode(code);
  return { blocked: false, redirectUrl, qr: updated! };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function getQRAnalytics(qr: DynamicQR) {
  const scans = qr.scans || [];
  const devices = { mobile: 0, desktop: 0, tablet: 0 };
  const scansByDay: Record<string, number> = {};
  const scansByHour = Array(24).fill(0);
  const todayStr = new Date().toISOString().split("T")[0];

  scans.forEach((s) => {
    const d = s.device?.toLowerCase() as keyof typeof devices;
    if (d in devices) devices[d]++;
    const day = s.timestamp.split("T")[0];
    scansByDay[day] = (scansByDay[day] || 0) + 1;
    if (day === todayStr) {
      const h = new Date(s.timestamp).getHours();
      scansByHour[h]++;
    }
  });

  return {
    total: qr.totalScans,
    devices,
    scansByDay,
    scansByHour,
    recent: scans.slice(0, 10).map((s) => ({
      id: s.id,
      timestamp: s.timestamp,
      device: s.device,
      userAgent: s.userAgent || "",
    })),
  };
}
