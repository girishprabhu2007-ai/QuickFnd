import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from "@/lib/admin-auth";

const PUBLIC_ADMIN_PAGES = new Set([
  "/admin/login",
  "/admin/reset-password",
]);

const PUBLIC_ADMIN_APIS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/request-password-reset",
  "/api/admin/update-password",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  const hasSession = Boolean(accessToken || refreshToken);

  if (isAdminPage && PUBLIC_ADMIN_PAGES.has(pathname)) {
    if (hasSession && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminApi && PUBLIC_ADMIN_APIS.has(pathname)) {
    return NextResponse.next();
  }

  if (hasSession) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};