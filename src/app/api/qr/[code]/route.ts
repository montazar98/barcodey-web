import { NextRequest, NextResponse } from "next/server";
import { getQRByCode, updateQR, deleteQR, getQRAnalytics } from "@/lib/qr-store";

type Params = { params: { code: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const qr = await getQRByCode(params.code);
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const analytics = getQRAnalytics(qr);
  return NextResponse.json({ qr, analytics });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();

    // Validate destination URL if provided
    if (body.destinationUrl) {
      try { new URL(body.destinationUrl); } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
    }

    const updated = await updateQR(params.code, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ qr: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ok = await deleteQR(params.code);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
