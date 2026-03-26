/**
 * app/api/cron/blog-publish/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Vercel Cron — daily at 4am UTC
 *
 * Full pipeline:
 *   1. Calls selectTopicsForToday() — pulls GSC data, Serper PAA, rotates seed bank
 *   2. Enriches each topic with related tool links
 *   3. Generates 2 articles with GPT-4o-mini (varied temperature)
 *   4. Quality gate: min 600 words, min 2 H2s
 *   5. Publishes to blog_posts + pings IndexNow + Google sitemap
 *   6. Logs to cron_runs
 *
 * vercel.json: { "path": "/api/cron/blog-publish", "schedule": "0 4 * * *" }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBlogPost, selectTopicsForToday } from "@/lib/blog-generator";

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
    .select("id")
    .single();
  const runId = run?.id;

  try {
    // Step 1: Research + select best 2 topics for today
    const topics = await selectTopicsForToday(2);

    if (!topics.length) {
      await supabase.from("cron_runs").update({
        status: "success",
        items_published: 0,
        error_message: "No unpublished topics available",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      }).eq("id", runId);
      return NextResponse.json({ success: true, published: 0, message: "All topics published — seed bank exhausted" });
    }

    // Step 2: Generate articles
    const results: {
      keyword: string;
      success: boolean;
      slug?: string;
      title?: string;
      word_count?: number;
      error?: string;
    }[] = [];

    for (const topic of topics) {
      const result = await generateBlogPost({
        ...topic,
        source: "auto-pipeline",
      });
      results.push({ keyword: topic.keyword, ...result });
      // Rate limit between generations
      if (topics.indexOf(topic) < topics.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    const published = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success).map(r => `${r.keyword}: ${r.error}`);
    const totalWords = results.filter(r => r.success).reduce((sum, r) => sum + (r.word_count || 0), 0);

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
      total_words: totalWords,
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