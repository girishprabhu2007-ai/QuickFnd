/**
 * app/api/cron/blog-publish/route.ts
 * Vercel Cron — daily at 4am UTC
 * Generates 2-3 SEO blog articles from seed topics + GSC opportunities.
 * Add to vercel.json: { "path": "/api/cron/blog-publish", "schedule": "0 4 * * *" }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBlogPost, BLOG_SEED_TOPICS, deriveBlogTopicsFromGSC } from "@/lib/blog-generator";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const startTime = Date.now();
  const supabase = getSupabase();

  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: run } = await supabase
    .from("cron_runs")
    .insert({ job_name: "blog-publish", status: "running" })
    .select("id").single();
  const runId = run?.id;

  try {
    // Get already-published slugs to avoid duplicates
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("slug,target_keyword")
      .eq("status", "published");

    const publishedSlugs = new Set((existing || []).map(p => p.slug));
    const publishedKeywords = new Set((existing || []).map(p => p.target_keyword?.toLowerCase() || ""));

    // Build topic list: GSC opportunities first, then seed topics
    const allTopics = [...BLOG_SEED_TOPICS];

    // Add GSC-derived topics if configured
    const gscToken = process.env.SEARCH_CONSOLE_ACCESS_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
    if (gscToken) {
      try {
        const gscTopics = await deriveBlogTopicsFromGSC(siteUrl, gscToken);
        allTopics.unshift(...gscTopics); // GSC topics take priority
      } catch { /* GSC optional */ }
    }

    // Filter out already published topics
    const unpublished = allTopics.filter(t => {
      const slug = t.keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
      return !publishedSlugs.has(slug) && !publishedKeywords.has(t.keyword.toLowerCase());
    });

    if (!unpublished.length) {
      await supabase.from("cron_runs").update({
        status: "success",
        items_published: 0,
        error_message: "All seed topics already published",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      }).eq("id", runId);
      return NextResponse.json({ success: true, published: 0, message: "All topics published" });
    }

    // Publish top 2 unpublished topics (high priority first)
    const toPublish = unpublished
      .sort((a, b) => (a.priority === "high" ? -1 : 1))
      .slice(0, 2);

    const results: { keyword: string; success: boolean; slug?: string; error?: string }[] = [];

    for (const topic of toPublish) {
      const result = await generateBlogPost({
        keyword: topic.keyword,
        tool_slug: topic.tool_slug,
        tool_name: topic.tool_name,
        source: "auto-pipeline",
      });
      results.push({ keyword: topic.keyword, ...result });
      await new Promise(r => setTimeout(r, 2000)); // rate limit
    }

    const published = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success).map(r => `${r.keyword}: ${r.error}`);

    await supabase.from("cron_runs").update({
      status: errors.length > 0 && published === 0 ? "failed" : "success",
      items_published: published,
      error_message: errors.length ? errors.join("; ") : null,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    }).eq("id", runId);

    return NextResponse.json({
      success: true,
      published,
      results,
      duration_ms: Date.now() - startTime,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("cron_runs").update({
      status: "failed",
      error_message: message,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    }).eq("id", runId);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}