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
const REVIEW_QUERY_KEY = "review_key";

function getExpectedReviewKey() {
  return process.env.ADMIN_REVIEW_KEY || "";
}

function isReviewBypassEnabled() {
  return process.env.ADMIN_REVIEW_BYPASS === "true";
}

function getRequestReviewKey(request: NextRequest) {
  return request.nextUrl.searchParams.get(REVIEW_QUERY_KEY) || "";
}

function hasValidReviewBypass(request: NextRequest) {
  if (!isReviewBypassEnabled()) {
    return false;
  }

  const expectedKey = getExpectedReviewKey();
  if (!expectedKey) {
    return false;
  }

  const queryKey = getRequestReviewKey(request);
  const cookieKey = request.cookies.get(ADMIN_REVIEW_COOKIE)?.value || "";

  return queryKey === expectedKey || cookieKey === expectedKey;
}

function attachReviewCookieIfNeeded(request: NextRequest, response: NextResponse) {
  const expectedKey = getExpectedReviewKey();
  const queryKey = getRequestReviewKey(request);

  if (queryKey && expectedKey && queryKey === expectedKey) {
    response.cookies.set(ADMIN_REVIEW_COOKIE, expectedKey, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4,
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

  if (hasValidReviewBypass(request)) {
    return attachReviewCookieIfNeeded(request, NextResponse.next());
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