import { NextRequest, NextResponse } from "next/server";
import { parseUserAgent, getClientIp, getCountryFromHeaders, parseReferer } from "@/lib/analytics";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionKey, path, title, language, screenRes, prevPath, timeOnPrev } = body;
    if (!sessionKey || !path) return NextResponse.json({ ok: false });

    const ua         = req.headers.get("user-agent") || "";
    const ip         = getClientIp(req.headers);
    const geo        = getCountryFromHeaders(req.headers);
    const parsed     = parseUserAgent(ua);
    const refererStr = req.headers.get("referer") || null;
    const ref        = parseReferer(refererStr);

    // Get user from cookie if available
    let userId: string | undefined;
    try {
      const { verifyToken, USER_COOKIE } = await import("@/lib/auth");
      const token = req.cookies.get(USER_COOKIE)?.value;
      if (token) { const p = verifyToken(token); if (p) userId = p.sub; }
    } catch {}

    // Check analytics enabled
    const isEnabled = await db.siteConfig.findUnique({ where: { key: "analytics_enabled" } });
    if (isEnabled?.value === "false") return NextResponse.json({ ok: true });

    // Skip bots
    if (parsed.isBot) return NextResponse.json({ ok: true });

    // Upsert visitor session
    const session = await db.visitorSession.upsert({
      where: { sessionKey },
      update: {
        pageViewCount: { increment: 1 },
        bounced: false,  // visited more than one page
        endTime: new Date(),
        ...(userId && { userId }),
      },
      create: {
        sessionKey,
        ip,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        browser: parsed.browser,
        browserVersion: parsed.browserVersion,
        os: parsed.os,
        osVersion: parsed.osVersion,
        device: parsed.device,
        language,
        screenRes,
        referer: ref.referer || undefined,
        refererDomain: ref.refererDomain || undefined,
        landingPage: path,
        userAgent: ua.slice(0, 500),
        isBot: parsed.isBot,
        ...(userId && { userId }),
      },
    });

    // Update time on previous page
    if (prevPath && timeOnPrev !== undefined) {
      const lastView = await db.pageView.findFirst({
        where: { sessionId: session.id, path: prevPath },
        orderBy: { timestamp: "desc" },
      });
      if (lastView) {
        await db.pageView.update({
          where: { id: lastView.id },
          data: { timeOnPage: timeOnPrev },
        });
      }
    }

    // Record new page view
    await db.pageView.create({
      data: {
        sessionId: session.id,
        path,
        title: title?.slice(0, 200),
        ...(userId && { userId }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Never block the user for analytics errors
    return NextResponse.json({ ok: false });
  }
}
