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

const ADMIN_REVIEW_COOKIE = "quickfnd_admin_review";

function getReviewKeyFromRequest(request: NextRequest) {
  const fromQuery = request.nextUrl.searchParams.get("review_key");
  const fromHeader = request.headers.get("x-admin-review-key");
  return fromQuery || fromHeader || "";
}

function isReviewBypassAllowed(request: NextRequest) {
  const bypassEnabled = process.env.ADMIN_REVIEW_BYPASS === "true";
  const expectedKey = process.env.ADMIN_REVIEW_KEY || "";

  if (!bypassEnabled || !expectedKey) {
    return false;
  }

  const requestKey = getReviewKeyFromRequest(request);
  const cookieKey = request.cookies.get(ADMIN_REVIEW_COOKIE)?.value || "";

  return requestKey === expectedKey || cookieKey === expectedKey;
}

function withReviewCookieIfNeeded(request: NextRequest, response: NextResponse) {
  const expectedKey = process.env.ADMIN_REVIEW_KEY || "";
  const requestKey = getReviewKeyFromRequest(request);

  if (expectedKey && requestKey === expectedKey) {
    response.cookies.set(ADMIN_REVIEW_COOKIE, expectedKey, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });
  }

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (isReviewBypassAllowed(request)) {
    return withReviewCookieIfNeeded(request, NextResponse.next());
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