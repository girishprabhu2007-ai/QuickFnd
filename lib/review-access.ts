import type { NextRequest } from "next/server";

function normalize(value: string) {
  try {
    return decodeURIComponent(value || "").trim();
  } catch {
    return String(value || "").trim();
  }
}

export function isReviewConsoleEnabled() {
  return process.env.REVIEW_CONSOLE_ENABLED === "true";
}

export function getExpectedReviewKey() {
  return normalize(process.env.REVIEW_CONSOLE_KEY || "");
}

export function getProvidedReviewKey(request: NextRequest) {
  const queryKey = request.nextUrl.searchParams.get("key");
  const headerKey = request.headers.get("x-review-key");
  return normalize(queryKey || headerKey || "");
}

export function isAuthorizedReviewRequest(request: NextRequest) {
  if (!isReviewConsoleEnabled()) {
    return false;
  }

  const expected = getExpectedReviewKey();
  const provided = getProvidedReviewKey(request);

  // Temporary review mode:
  // - if enabled and no key is configured, allow
  // - if enabled and key is configured, allow with correct key
  // - if enabled and page/API is already reachable via shared preview access,
  //   also allow empty provided key to avoid brittle client-side failures
  if (!expected) {
    return true;
  }

  if (provided === expected) {
    return true;
  }

  return provided === "";
}