import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = JSON.parse(await req.text());
    const { sessionKey, duration, path, timeOnPage } = body;
    if (!sessionKey) return NextResponse.json({ ok: true });

    const session = await db.visitorSession.findUnique({ where: { sessionKey } });
    if (!session) return NextResponse.json({ ok: true });

    await db.visitorSession.update({
      where: { sessionKey },
      data: {
        endTime: new Date(),
        duration: typeof duration === "number" ? Math.min(duration, 86400) : undefined,
      },
    });

    // Update last page view time
    if (path && typeof timeOnPage === "number") {
      const lastView = await db.pageView.findFirst({
        where: { sessionId: session.id, path },
        orderBy: { timestamp: "desc" },
      });
      if (lastView) {
        await db.pageView.update({
          where: { id: lastView.id },
          data: { timeOnPage: Math.min(timeOnPage, 3600), exitPage: true },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
