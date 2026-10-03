import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenEdge, ADMIN_COOKIE } from "@/lib/edge-auth";
import db from "@/lib/db";

async function requireAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyTokenEdge(token);
  if (!payload || String(payload.role).toLowerCase() !== "admin") return null;
  return payload;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const subscriptions = await db.subscription.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const sub = await db.subscription.create({
      data: {
        userId: data.userId,
        plan: data.plan,
        status: data.status || "ACTIVE",
        amount: data.amount || 0,
        currency: "USD",
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes || "",
        createdBy: admin.sub,
      }
    });

    // Update user plan to match if ACTIVE
    if (sub.status === "ACTIVE") {
      await db.user.update({
        where: { id: sub.userId },
        data: { plan: sub.plan },
      });
    }

    return NextResponse.json({ success: true, subscription: sub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const data = await req.json();
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.plan) updateData.plan = data.plan;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    
    const sub = await db.subscription.update({
      where: { id },
      data: updateData,
    });

    if (data.status === "ACTIVE" && data.plan) {
      await db.user.update({
        where: { id: sub.userId },
        data: { plan: sub.plan },
      });
    } else if (data.status && data.status !== "ACTIVE") {
       // if we cancel it, maybe downgrade user? We'll leave that manual or assume downgrade to FREE
       await db.user.update({
        where: { id: sub.userId },
        data: { plan: "FREE" },
      });
    }

    return NextResponse.json({ success: true, subscription: sub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.subscription.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
