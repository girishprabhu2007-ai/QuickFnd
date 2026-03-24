/**
 * POST /api/admin/run-intelligence
 * Admin-authenticated trigger for the intelligence cron job.
 * Called by the "Run Now" button in the admin UI.
 */
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { collectTrendSignals, analyzeGaps } from "@/lib/trend-intelligence";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export const maxDuration = 300;

export async function POST() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const startTime = Date.now();

    // Log run start
    const { data: runRecord } = await supabase
      .from("cron_runs")
      .insert({ job_name: "intelligence-pipeline-manual", status: "running" })
      .select("id")
      .single();

    const runId = runRecord?.id;

    // Step 1: Collect signals
    const { collected, errors } = await collectTrendSignals({
      serperApiKey: process.env.SERPER_API_KEY,
    });

    // Step 2: Analyse gaps
    const { queued, skipped } = await analyzeGaps({ minScore: 25, limit: 30 });

    const duration = Date.now() - startTime;

    // Update run log
    await supabase.from("cron_runs").update({
      status: errors.length > 0 ? "partial" : "success",
      signals_collected: collected,
      gaps_identified: queued,
      error_message: errors.length > 0 ? errors.slice(0, 3).join("; ") : null,
      completed_at: new Date().toISOString(),
      duration_ms: duration,
    }).eq("id", runId);

    return NextResponse.json({
      success: true,
      signals_collected: collected,
      gaps_queued: queued,
      gaps_skipped: skipped,
      errors,
      duration_ms: duration,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}