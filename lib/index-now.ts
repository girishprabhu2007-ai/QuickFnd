/**
 * lib/index-now.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 4: Ping Bing and Yandex via IndexNow protocol when new pages publish.
 * IndexNow is free and gets pages indexed within hours (vs days for sitemap).
 * 
 * Setup: Add INDEXNOW_KEY to Vercel env vars (any random string, 8-128 chars)
 * Then create a file at /public/<your-key>.txt containing just the key.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";

// ─── IndexNow submission ──────────────────────────────────────────────────────

async function submitToIndexNow(urls: string[]): Promise<{
  bing: boolean;
  yandex: boolean;
  errors: string[];
}> {
  if (!INDEXNOW_KEY) {
    return { bing: false, yandex: false, errors: ["INDEXNOW_KEY not set"] };
  }

  const errors: string[] = [];
  const payload = {
    host: SITE_URL.replace("https://", "").replace("http://", ""),
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  // Submit to Bing (also covers DuckDuckGo, Yahoo, Ecosia)
  let bing = false;
  try {
    const res = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    bing = res.ok || res.status === 202;
    if (!bing) {
      const body = await res.text().catch(() => "");
      errors.push(`Bing IndexNow: ${res.status} — ${body.slice(0, 200)}`);
    }
  } catch (e) {
    errors.push(`Bing IndexNow error: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // Submit to Yandex
  let yandex = false;
  try {
    const res = await fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    yandex = res.ok || res.status === 202;
    if (!yandex) errors.push(`Yandex IndexNow: ${res.status}`);
  } catch (e) {
    errors.push(`Yandex IndexNow error: ${e instanceof Error ? e.message : "unknown"}`);
  }

  return { bing, yandex, errors };
}

// ─── Ping Google Search Console (sitemap refresh) ────────────────────────────
// Google doesn't support IndexNow — best approach is to ping sitemap

async function pingGoogleSitemap(): Promise<boolean> {
  try {
    const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const res = await fetch(
      `https://www.google.com/ping?sitemap=${sitemapUrl}`,
      { signal: AbortSignal.timeout(8000) }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Main function: index a new tool page ─────────────────────────────────────

export async function indexNewPage(
  slug: string,
  type: "tools" | "calculators" | "ai-tools"
): Promise<{
  url: string;
  bing: boolean;
  yandex: boolean;
  google_sitemap: boolean;
  errors: string[];
}> {
  const url = `${SITE_URL}/${type}/${slug}`;
  const urls = [url];

  const [indexNowResult, googleResult] = await Promise.all([
    submitToIndexNow(urls),
    pingGoogleSitemap(),
  ]);

  return {
    url,
    bing: indexNowResult.bing,
    yandex: indexNowResult.yandex,
    google_sitemap: googleResult,
    errors: indexNowResult.errors,
  };
}

// ─── Batch index multiple new pages ──────────────────────────────────────────

export async function indexMultiplePages(
  items: { slug: string; type: "tools" | "calculators" | "ai-tools" }[]
): Promise<{ submitted: number; errors: string[] }> {
  if (!items.length) return { submitted: 0, errors: [] };

  const urls = items.map(i => `${SITE_URL}/${i.type}/${i.slug}`);
  const result = await submitToIndexNow(urls);

  // One sitemap ping covers all
  await pingGoogleSitemap();

  return {
    submitted: result.bing || result.yandex ? urls.length : 0,
    errors: result.errors,
  };
}