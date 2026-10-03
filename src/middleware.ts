import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge, USER_COOKIE, ADMIN_COOKIE } from "@/lib/edge-auth";

// Pages that require user login ("الباركود والرابط الديناميكي يعمل فقط عند تسجيل الدخول")
const AUTH_REQUIRED = ["/barcode", "/dynamic-qr", "/bulk", "/dashboard"];
// Pages that require admin login
const ADMIN_REQUIRED = ["/admin-bkd9x/dashboard", "/admin-bkd9x/users", "/admin-bkd9x/qrcodes"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────────────────
  if (ADMIN_REQUIRED.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const payload = await verifyTokenEdge(token);

    if (!payload || payload.role?.toLowerCase() !== "admin") {
      return NextResponse.redirect(new URL("/admin-bkd9x", request.url));
    }
  }

  // ── User auth protection ───────────────────────────────────────────────
  if (AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(USER_COOKIE)?.value;
    const payload = await verifyTokenEdge(token);

    if (!payload) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/barcode/:path*",
    "/bulk/:path*",
    "/dynamic-qr/:path*",
    "/dashboard/:path*",
    "/admin-bkd9x/dashboard/:path*",
    "/admin-bkd9x/users/:path*",
    "/admin-bkd9x/qrcodes/:path*",
  ],
};
