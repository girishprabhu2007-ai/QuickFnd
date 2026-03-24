/**
 * app/api/cron/auto-publish/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Vercel Cron — runs daily at 3am UTC (1 hour after intelligence collection)
 * Takes top approved items from demand_queue and publishes them automatically.
 *
 * Add to vercel.json:
 * { "path": "/api/cron/auto-publish", "schedule": "0 3 * * *" }
 *
 * Flow:
 * 1. Check demand_queue for approved items
 * 2. Call auto-generate pipeline for top 3 items
 * 3. Log results to cron_runs
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  // Auth check
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Log run start
  const { data: runRecord } = await supabase
    .from("cron_runs")
    .insert({ job_name: "auto-publish", status: "running" })
    .select("id")
    .single();

  const runId = runRecord?.id;

  try {
    // Check how many approved items are in queue
    const { data: approved, count } = await supabase
      .from("demand_queue")
      .select("id", { count: "exact" })
      .eq("status", "approved")
      .limit(1);

    const approvedCount = count || 0;

    if (approvedCount === 0) {
      await supabase.from("cron_runs").update({
        status: "success",
        items_published: 0,
        error_message: "No approved items in queue",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      }).eq("id", runId);

      return NextResponse.json({
        success: true,
        message: "No approved items to publish",
        published: 0,
      });
    }

    // Call the auto-generate pipeline for next batch
    // We POST to our own API endpoint (works within Vercel)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
    const res = await fetch(`${baseUrl}/api/admin/auto-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass service role key for internal auth
        "x-internal-cron": process.env.CRON_SECRET || "",
      },
      body: JSON.stringify({}), // Empty body = process next approved batch
    });

    let published = 0;
    let errors: string[] = [];

    if (res.ok) {
      const data = await res.json() as { published?: number; results?: { status: string; reason?: string }[] };
      published = data.published || 0;
      errors = (data.results || [])
        .filter(r => r.status !== "published")
        .map(r => r.reason || r.status)
        .slice(0, 3);
    } else {
      errors = [`auto-generate API returned ${res.status}`];
    }

    const duration = Date.now() - startTime;

    await supabase.from("cron_runs").update({
      status: errors.length > 0 && published === 0 ? "failed" : "success",
      items_published: published,
      error_message: errors.length > 0 ? errors.join("; ") : null,
      completed_at: new Date().toISOString(),
      duration_ms: duration,
    }).eq("id", runId);

    return NextResponse.json({
      success: true,
      published,
      approved_remaining: approvedCount - published,
      errors,
      duration_ms: duration,
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