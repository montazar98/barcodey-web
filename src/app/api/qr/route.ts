import { NextRequest, NextResponse } from "next/server";
import { getAllQRs, createQR } from "@/lib/qr-store";
import { verifyToken, USER_COOKIE, ADMIN_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const adminPayload = adminToken ? verifyToken(adminToken) : null;
    const isAdmin = adminPayload?.role === "admin";

    const userToken = req.cookies.get(USER_COOKIE)?.value;
    const userPayload = userToken ? verifyToken(userToken) : null;

    // Admin sees all, user sees their own, guest sees none or empty
    const userId = isAdmin ? undefined : (userPayload?.sub || undefined);
    const qrs = await getAllQRs(userId);
    return NextResponse.json({ qrs });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load QRs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userToken = req.cookies.get(USER_COOKIE)?.value;
    const userPayload = userToken ? verifyToken(userToken) : null;

    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
    const adminPayload = adminToken ? verifyToken(adminToken) : null;
    const isAdmin = adminPayload?.role === "admin";

    // Strict requirement: "الرابط الديناميكي يعمل فقط عند تسجيل الدخول"
    if (!userPayload && !isAdmin) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لإنشاء رمز QR ديناميكي ذكي" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.title || !body.destinationUrl) {
      return NextResponse.json(
        { error: "العنوان والرابط مطلوبان" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(body.destinationUrl);
    } catch {
      return NextResponse.json({ error: "رابط الوجهة غير صالح" }, { status: 400 });
    }

    const qr = await createQR({
      title: body.title,
      destinationUrl: body.destinationUrl,
      fgColor: body.fgColor || "#00d9a3",
      bgColor: body.bgColor || "#0a0f0d",
      code: body.code,
      password: body.password,
      expiresAt: body.expiresAt,
      maxScans: body.maxScans ? Number(body.maxScans) : undefined,
      deviceRedirects: body.deviceRedirects,
      tags: body.tags,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      userId: userPayload?.sub,
    });

    return NextResponse.json({ qr }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create QR" }, { status: 500 });
  }
}
