/**
 * app/api/cron/intelligence/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Vercel Cron job — runs daily at 2am UTC
 * 
 * Add to vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/intelligence", "schedule": "0 2 * * *" }
 *   ]
 * }
 * 
 * Environment variables needed:
 *   CRON_SECRET          — a random secret string to secure the endpoint
 *   SERPER_API_KEY       — from serper.dev (optional but recommended)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { collectTrendSignals, analyzeGaps } from "@/lib/trend-intelligence";

export const maxDuration = 300; // 5 minutes max (Vercel Pro allows 300s)
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const startTime = Date.now();
  const supabase = getSupabase();

  // ── Security: verify cron secret ──
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Vercel cron jobs send the CRON_SECRET automatically
  // Manual triggers need: Authorization: Bearer <secret>
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isAuthorized = isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Log run start ──
  const { data: runRecord } = await supabase
    .from("cron_runs")
    .insert({
      job_name: "intelligence-pipeline",
      status: "running",
    })
    .select("id")
    .single();

  const runId = runRecord?.id;

  try {
    console.log("[cron/intelligence] Starting intelligence pipeline...");

    // ── Step 1: Collect trend signals ──
    const { collected, errors: collectErrors } = await collectTrendSignals({
      serperApiKey: process.env.SERPER_API_KEY,
      searchConsoleToken: process.env.SEARCH_CONSOLE_ACCESS_TOKEN,
      searchConsoleSite: process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com",
    });

    console.log(`[cron/intelligence] Collected ${collected} signals`);

    // ── Step 2: Analyze gaps and queue top opportunities ──
    const { queued, skipped } = await analyzeGaps({
      minScore: 25,
      limit: 30,
    });

    console.log(`[cron/intelligence] Queued ${queued} new gaps, skipped ${skipped}`);

    // ── Step 3: Auto-approve high-confidence items ──
    // Items with demand_score >= 70 are high-confidence opportunities.
    // Auto-approving them ensures the 3am auto-publish cron has work to do
    // without requiring manual admin intervention every day.
    const AUTO_APPROVE_THRESHOLD = 70;
    const { data: autoApproved, error: approveError } = await supabase
      .from("demand_queue")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("status", "pending")
      .gte("demand_score", AUTO_APPROVE_THRESHOLD)
      .select("id, suggested_name, demand_score");

    const autoApprovedCount = autoApproved?.length ?? 0;
    console.log(`[cron/intelligence] Auto-approved ${autoApprovedCount} high-score items (score >= ${AUTO_APPROVE_THRESHOLD})`);
    if (approveError) {
      console.error("[cron/intelligence] Auto-approve error:", approveError.message);
    }

    // ── Update run log ──
    const duration = Date.now() - startTime;
    await supabase
      .from("cron_runs")
      .update({
        status: collectErrors.length > 0 ? "partial" : "success",
        signals_collected: collected,
        gaps_identified: queued,
        items_published: autoApprovedCount,
        error_message: collectErrors.length > 0 ? collectErrors.join("; ") : null,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
      })
      .eq("id", runId);

    return NextResponse.json({
      success: true,
      signals_collected: collected,
      gaps_queued: queued,
      gaps_skipped: skipped,
      auto_approved: autoApprovedCount,
      errors: collectErrors,
      duration_ms: duration,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[cron/intelligence] Fatal error:", message);

    await supabase
      .from("cron_runs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      })
      .eq("id", runId);

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}