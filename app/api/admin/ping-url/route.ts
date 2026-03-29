/**
 * app/api/admin/ping-url/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pings a single URL to Bing + Yandex via IndexNow, server-side.
 * Called from the admin Ping Dashboard manual URL input.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";

export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { url?: string };
  let url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  // Normalize: if it starts with /, prepend site URL
  if (url.startsWith("/")) url = `${SITE_URL}${url}`;

  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: "INDEXNOW_KEY not set" }, { status: 500 });
  }

  const results: { engine: string; ok: boolean; status: number; body?: string }[] = [];

  for (const engine of [
    { name: "Bing", endpoint: "https://www.bing.com/indexnow" },
    { name: "Yandex", endpoint: "https://yandex.com/indexnow" },
  ]) {
    try {
      const res = await fetch(
        `${engine.endpoint}?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`,
        { signal: AbortSignal.timeout(10000) }
      );
      const ok = res.ok || res.status === 202;
      const resBody = ok ? "" : await res.text().catch(() => "");
      results.push({ engine: engine.name, ok, status: res.status, body: resBody.slice(0, 200) });
    } catch (e) {
      results.push({ engine: engine.name, ok: false, status: 0, body: e instanceof Error ? e.message : "Error" });
    }
  }

  return NextResponse.json({ url, results });
}
