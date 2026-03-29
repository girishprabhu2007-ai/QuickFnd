/**
 * app/api/admin/ping-sitemap/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pings Google and Bing sitemap endpoints server-side.
 * Called from the admin Ping Dashboard to avoid CORS issues.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";

export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const results: { engine: string; ok: boolean; status: number }[] = [];

  // Ping Google
  try {
    const res = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    results.push({ engine: "Google", ok: res.ok, status: res.status });
  } catch {
    results.push({ engine: "Google", ok: false, status: 0 });
  }

  // Ping Bing sitemap
  try {
    const res = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    results.push({ engine: "Bing", ok: res.ok, status: res.status });
  } catch {
    results.push({ engine: "Bing", ok: false, status: 0 });
  }

  return NextResponse.json({ results, sitemapUrl });
}
