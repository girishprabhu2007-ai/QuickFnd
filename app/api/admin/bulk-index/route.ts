/**
 * app/api/admin/bulk-index/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time or periodic bulk IndexNow submission for ALL live pages.
 * Submits to Bing + Yandex via IndexNow, pings Google sitemap.
 *
 * Usage: GET /api/admin/bulk-index?secret=YOUR_CRON_SECRET
 *
 * IndexNow accepts max 10,000 URLs per submission.
 * We batch in groups of 100 to avoid timeouts.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { indexMultiplePages } from "@/lib/index-now";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const startTime = Date.now();

  try {
    // Fetch all live content from DB
    const [toolsRes, calcsRes, aiRes, blogRes] = await Promise.all([
      supabase.from("tools").select("slug, status").eq("status", "live"),
      supabase.from("calculators").select("slug, status").eq("status", "live"),
      supabase.from("ai_tools").select("slug, status").eq("status", "live"),
      supabase.from("blog_posts").select("slug, status").eq("status", "published"),
    ]);

    const items: { slug: string; type: "tools" | "calculators" | "ai-tools" }[] = [];

    // Tools
    for (const t of toolsRes.data || []) {
      items.push({ slug: t.slug, type: "tools" });
    }
    // Calculators
    for (const c of calcsRes.data || []) {
      items.push({ slug: c.slug, type: "calculators" });
    }
    // AI Tools
    for (const a of aiRes.data || []) {
      items.push({ slug: a.slug, type: "ai-tools" });
    }

    // Blog posts need special handling — path is /blog/slug
    const blogSlugs = (blogRes.data || []).map(b => b.slug);

    // Submit tools/calculators/ai-tools in batches of 100
    const allErrors: string[] = [];
    let totalSubmitted = 0;

    for (let i = 0; i < items.length; i += 100) {
      const batch = items.slice(i, i + 100);
      const result = await indexMultiplePages(batch);
      totalSubmitted += result.submitted;
      allErrors.push(...result.errors);

      // Small delay between batches to be polite
      if (i + 100 < items.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Submit blog URLs directly via IndexNow (they use /blog/ path)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
    const indexNowKey = process.env.INDEXNOW_KEY || "";

    if (blogSlugs.length > 0 && indexNowKey) {
      const blogUrls = blogSlugs.map(s => `${siteUrl}/blog/${s}`);

      // Also add static pages
      const staticUrls = [
        `${siteUrl}/`,
        `${siteUrl}/tools`,
        `${siteUrl}/calculators`,
        `${siteUrl}/ai-tools`,
        `${siteUrl}/blog`,
        `${siteUrl}/topics`,
      ];

      const allExtraUrls = [...blogUrls, ...staticUrls];

      const payload = {
        host: siteUrl.replace("https://", "").replace("http://", ""),
        key: indexNowKey,
        keyLocation: `${siteUrl}/${indexNowKey}.txt`,
        urlList: allExtraUrls,
      };

      try {
        const bingRes = await fetch("https://www.bing.com/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
        if (bingRes.ok || bingRes.status === 202) {
          totalSubmitted += allExtraUrls.length;
        } else {
          allErrors.push(`Blog Bing IndexNow: ${bingRes.status}`);
        }
      } catch (e) {
        allErrors.push(`Blog Bing error: ${e instanceof Error ? e.message : "unknown"}`);
      }

      try {
        await fetch("https://yandex.com/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
      } catch { /* silent */ }
    }

    // Ping Google sitemap
    let googlePinged = false;
    try {
      const sitemapUrl = encodeURIComponent(`${siteUrl}/sitemap.xml`);
      const gRes = await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`, {
        signal: AbortSignal.timeout(8000),
      });
      googlePinged = gRes.ok;
    } catch { /* silent */ }

    return NextResponse.json({
      success: true,
      summary: {
        tools: (toolsRes.data || []).length,
        calculators: (calcsRes.data || []).length,
        ai_tools: (aiRes.data || []).length,
        blog_posts: blogSlugs.length,
        static_pages: 6,
        total_urls_submitted: totalSubmitted,
        google_sitemap_pinged: googlePinged,
        errors: allErrors,
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration_ms: Date.now() - startTime,
    }, { status: 500 });
  }
}
