import { NextRequest, NextResponse } from "next/server";
import { recordScan } from "@/lib/qr-store";

type Params = { params: { code: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const userAgent = req.headers.get("user-agent") || "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const referer = req.headers.get("referer") || undefined;

  const result = await recordScan(params.code, userAgent, ip, referer);

  if (result.blocked) {
    return NextResponse.json(
      { blocked: true, reason: result.reason },
      { status: result.reason === "not_found" ? 404 : 403 }
    );
  }

  return NextResponse.json({
    blocked: false,
    redirectUrl: result.redirectUrl,
    totalScans: result.qr?.totalScans || 0,
  });
}
