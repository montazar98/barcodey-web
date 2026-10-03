import { NextRequest, NextResponse } from "next/server";
import { verifyToken, ADMIN_COOKIE, ADMIN_EMAIL, ADMIN_PASSWORD, createToken, COOKIE_OPTS, hashPassword } from "@/lib/auth";
import db from "@/lib/db";
import { seedFeatureFlags, seedSiteConfig } from "@/lib/services";

function adminPayload(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

// POST = admin login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (
    email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
    hashPassword(password) !== hashPassword(ADMIN_PASSWORD)
  ) return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });

  const token = createToken({ sub: "admin", email: ADMIN_EMAIL, role: "admin" });
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, { ...COOKIE_OPTS, path: "/" });
  return res;
}

// GET = full admin stats
export async function GET(req: NextRequest) {
  const payload = adminPayload(req);
  if (!payload || payload.role !== "admin")
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await seedFeatureFlags();
  await seedSiteConfig();

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, activeUsers, newToday, newWeek,
    planBreakdown,
    totalQRs, activeQRs,
    totalSessions, todaySessions, bouncedSessions,
    totalPageViews, todayPageViews,
    avgDurationRaw,
    topPages, topCountries, topBrowsers, topDevices, topReferers,
    recentSessions,
    totalQRScans, todayQRScans,
    featureFlags, siteConfig,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { createdAt: { gte: todayStart } } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.user.groupBy({ by: ["plan"], _count: true }),

    db.qRCode.count(),
    db.qRCode.count({ where: { isActive: true } }),

    db.visitorSession.count(),
    db.visitorSession.count({ where: { startTime: { gte: todayStart } } }),
    db.visitorSession.count({ where: { bounced: true } }),

    db.pageView.count(),
    db.pageView.count({ where: { timestamp: { gte: todayStart } } }),

    db.visitorSession.aggregate({ _avg: { duration: true }, where: { duration: { not: null } } }),

    db.pageView.groupBy({ by: ["path"], _count: true, orderBy: { _count: { path: "desc" } }, take: 10 }),
    db.visitorSession.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } }, take: 10, where: { country: { not: null } } }),
    db.visitorSession.groupBy({ by: ["browser"], _count: true, orderBy: { _count: { browser: "desc" } }, take: 8, where: { browser: { not: null } } }),
    db.visitorSession.groupBy({ by: ["device"], _count: true, orderBy: { _count: { device: "desc" } }, take: 5 }),
    db.visitorSession.groupBy({ by: ["refererDomain"], _count: true, orderBy: { _count: { refererDomain: "desc" } }, take: 10, where: { refererDomain: { not: null }, AND: { refererDomain: { not: "direct" } } } }),

    db.visitorSession.findMany({
      take: 20,
      orderBy: { startTime: "desc" },
      select: {
        sessionKey: true, country: true, city: true, browser: true, os: true,
        device: true, startTime: true, duration: true, pageViewCount: true,
        bounced: true, refererDomain: true, landingPage: true, userId: true,
      },
    }),

    db.qRScan.count(),
    db.qRScan.count({ where: { timestamp: { gte: todayStart } } }),

    db.featureFlag.findMany({ orderBy: { key: "asc" } }),
    db.siteConfig.findMany({ orderBy: { group: "asc" } }),
  ]);

  // Daily sessions for chart (last 30 days)
  const dailySessions = await db.$queryRaw<{ day: string; count: number }[]>`
    SELECT date(startTime) as day, count(*) as count
    FROM VisitorSession
    WHERE startTime >= ${monthAgo.toISOString()}
    GROUP BY date(startTime)
    ORDER BY day ASC
  `;

  const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;
  const avgDuration = Math.round(avgDurationRaw._avg.duration || 0);

  return NextResponse.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      newToday,
      newWeek,
      byPlan: Object.fromEntries(planBreakdown.map((p) => [p.plan, p._count])),
    },
    qr: {
      total: totalQRs,
      active: activeQRs,
      totalScans: totalQRScans,
      scansToday: todayQRScans,
    },
    visitors: {
      totalSessions,
      todaySessions,
      totalPageViews,
      todayPageViews,
      bounceRate,
      avgDuration,
      topPages: topPages.map((p) => ({ path: p.path, count: p._count })),
      topCountries: topCountries.map((c) => ({ country: c.country, count: c._count })),
      topBrowsers: topBrowsers.map((b) => ({ browser: b.browser, count: b._count })),
      topDevices: topDevices.map((d) => ({ device: d.device, count: d._count })),
      topReferers: topReferers.map((r) => ({ source: r.refererDomain, count: r._count })),
      dailySessions: dailySessions.map((d) => ({ day: d.day, count: Number(d.count) })),
      recentSessions,
    },
    featureFlags,
    siteConfig: Object.fromEntries(siteConfig.map((c) => [c.key, c.value])),
    siteConfigFull: siteConfig,
  });
}
