/**
 * app/api/cron/auto-screen-queue/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automatically screens the demand queue — runs at 3:30am UTC (30min after intelligence)
 *
 * What it does:
 *   1. AUTO-REJECTS items that can't work on QuickFnd (file converters, wrong geo, etc.)
 *   2. AUTO-APPROVES items that match a working engine type with sufficient score
 *   3. Leaves genuine edge cases for manual review
 *
 * After this runs, auto-publish at 4am picks up the newly-approved items.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ALL_VALID_ENGINES } from "@/lib/engine-registry";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Engines that render real working UIs — imported from centralised registry ─
const WORKING_ENGINES = ALL_VALID_ENGINES;

// ── Patterns that cannot work on a browser-based platform ─────────────────────
const REJECT_PATTERNS = [
  // File conversion — requires server-side processing
  /mp4|mp3|wav|avi|mkv|flac|ogg|webm/i,
  /pdf.to|to.pdf|doc.to|to.doc|docx|xlsx|pptx/i,
  /jpg.to|png.to|gif.to|webp.to|svg.to|to.jpg|to.png/i,
  /youtube|vimeo|dailymotion|tiktok.*download|instagram.*download/i,
  /file.convert|video.convert|audio.convert|image.convert/i,
  /combine.pdf|merge.pdf|split.pdf|compress.pdf/i,
  // Wrong geography for QuickFnd's India audience
  /virginia|maryland|dc\b|california|texas|florida|new.york/i,
  /401k|roth.ira|401\(k\)|social.security|medicare|medicaid/i,
  /\bdave.ramsey\b|\badp\b|\btalent\.com\b/i,
  /uae.tax|bd.tax|saudi|pakistan.tax/i,
  // Server-side tools
  /passport.photo|design.a.room|resize.image|upscale.image/i,
  /flow.diagram|org.chart|gantt.chart/i,
  // Purely informational — not tool intent
  /tool.meaning|tool.examples|tool.companies|what.is.a.tool/i,
  /web.based.tool.icon|browser.based.tooltip/i,
  // Legal/IP risk
  /youtube.to.mp3|spotify.downloader|netflix/i,
];

// ── Patterns that signal good India-focused calculator intent ─────────────────
const INDIA_GOOD_PATTERNS = [
  /india|indian|\binr\b|rupee|₹/i,
  /gst|hra|ppf|epf|nps|elss|itr|tds/i,
  /sip|mutual.fund|zerodha|groww/i,
  /emi|home.loan|car.loan/i,
  /income.tax|new.regime|old.regime/i,
  /salary.after.tax|ctc|in.hand|take.home/i,
];

// ── Engine type overrides — fix bad suggestions from intelligence pipeline ─────
const ENGINE_OVERRIDES: Record<string, string> = {
  // Code comparison → diff-checker
  "code-compare": "diff-checker",
  "code-comparison": "diff-checker",
  "code-merge": "diff-checker",
  "file-compare": "diff-checker",
  // Barcode
  "barcode": "barcode-generator",
  // Salary / payroll → salary-calculator
  "salary": "salary-calculator",
  "payroll": "salary-calculator",
  "take-home": "salary-calculator",
  "ctc": "salary-calculator",
  // Retirement → retirement-calculator
  "retirement": "retirement-calculator",
  "pension": "retirement-calculator",
  // Investment → compound-interest-calculator
  "investment": "compound-interest-calculator",
  "portfolio": "compound-interest-calculator",
  "cagr": "cagr-calculator",
  "sip": "sip-calculator",
  "fd-calculator": "fd-calculator",
  "ppf": "ppf-calculator",
  "rd-calculator": "rd-calculator",
  "roi": "roi-calculator",
  "savings": "savings-calculator",
  // Tax → income-tax-calculator
  "tax-calculator": "income-tax-calculator",
  "income-tax": "income-tax-calculator",
  "gst": "gst-calculator",
  "vat": "vat-calculator",
  "sales-tax": "sales-tax-calculator",
  "gratuity": "gratuity-calculator",
  // Mortgage / loan → emi-calculator or loan-calculator
  "mortgage": "mortgage-calculator",
  "home-loan": "emi-calculator",
  "emi": "emi-calculator",
  "loan": "loan-calculator",
  // Health
  "bmi": "bmi-calculator",
  "calorie": "calorie-calculator",
  "fuel": "fuel-cost-calculator",
  "tip-calculator": "tip-calculator",
  "discount": "discount-calculator",
  // Encoder/decoder → base64-encoder
  "encoder-decoder": "base64-encoder",
  "encode-decode": "base64-encoder",
  // Format → json-formatter or text-transformer
  "formatter": "json-formatter",
  "format": "text-transformer",
  // Percentage / math
  "percentage": "percentage-calculator",
  "compound-interest": "compound-interest-calculator",
  "simple-interest": "simple-interest-calculator",
};

type QueueItem = {
  id: string;
  query: string;
  suggested_name: string;
  suggested_slug: string;
  suggested_engine: string;
  suggested_category: string;
  demand_score: number;
};

function shouldReject(item: QueueItem): { reject: boolean; reason: string } {
  const text = `${item.query} ${item.suggested_name} ${item.suggested_slug}`.toLowerCase();

  for (const pattern of REJECT_PATTERNS) {
    if (pattern.test(text)) {
      return { reject: true, reason: `Matches reject pattern: ${pattern.source.slice(0, 40)}` };
    }
  }

  // Reject if engine is text-transformer and not a genuine text tool
  if (item.suggested_engine === "text-transformer") {
    const isGenuineTextTool = /text|word|case|transform|replace|format|encode|sort|trim|count/.test(text);
    if (!isGenuineTextTool) {
      return { reject: true, reason: "text-transformer engine assigned to non-text tool" };
    }
  }

  // Reject if name is too generic (single word)
  const name = item.suggested_name?.trim() || "";
  if (name.split(/\s+/).length < 2) {
    return { reject: true, reason: "Name too generic (single word)" };
  }

  return { reject: false, reason: "" };
}

function resolveEngine(item: QueueItem): string {
  const slug = item.suggested_slug?.toLowerCase() || "";
  const name = item.suggested_name?.toLowerCase() || "";
  const query = item.query?.toLowerCase() || "";

  // Check overrides first
  for (const [keyword, engine] of Object.entries(ENGINE_OVERRIDES)) {
    if (slug.includes(keyword) || name.includes(keyword) || query.includes(keyword)) {
      return engine;
    }
  }

  return item.suggested_engine;
}

function shouldApprove(item: QueueItem, resolvedEngine: string): { approve: boolean; reason: string } {
  // Must have a working engine
  if (!WORKING_ENGINES.has(resolvedEngine)) {
    return { approve: false, reason: `Engine '${resolvedEngine}' not in working set` };
  }

  const text = `${item.query} ${item.suggested_name} ${item.suggested_slug}`.toLowerCase();

  // India-focused content gets approved at lower threshold
  const isIndiaFocused = INDIA_GOOD_PATTERNS.some(p => p.test(text));
  const threshold = isIndiaFocused ? 30 : 40;

  // Treat null/undefined score as 45 (the default autocomplete score)
  const score = item.demand_score ?? 45;

  if (score >= threshold) {
    return { approve: true, reason: `Score ${score} >= threshold ${threshold}` };
  }

  return { approve: false, reason: `Score ${score} below threshold ${threshold}` };
}

export async function GET(req: Request) {
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const results = { approved: 0, rejected: 0, skipped: 0, errors: 0 };
  const log: string[] = [];

  // Fetch all pending items
  const { data: pending, error: fetchErr } = await supabase
    .from("demand_queue")
    .select("id, query, suggested_name, suggested_slug, suggested_engine, suggested_category, demand_score")
    .eq("status", "pending")
    .order("demand_score", { ascending: false })
    .limit(200);

  if (fetchErr) {
    return NextResponse.json({ success: false, error: `Fetch failed: ${fetchErr.message}`, ...results });
  }

  if (!pending?.length) {
    return NextResponse.json({ success: true, message: "No pending items", ...results });
  }

  // Debug: test a single update immediately to verify DB write access
  const testItem = pending[0];
  const { error: testErr } = await supabase
    .from("demand_queue")
    .update({ status: "pending" })
    .eq("id", testItem.id);
  if (testErr) {
    return NextResponse.json({
      success: false,
      error: `DB write test failed: ${testErr.message} (code: ${testErr.code})`,
      hint: "Check RLS policies on demand_queue table",
      ...results
    });
  }

  for (const item of pending as QueueItem[]) {
    try {
      // Step 1: Should we reject?
      const { reject, reason: rejectReason } = shouldReject(item);
      if (reject) {
        const { error: rejectErr } = await supabase.from("demand_queue")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", item.id);
        if (rejectErr) { results.errors++; }
        else { results.rejected++; }
        log.push(`REJECT: ${item.suggested_name} — ${rejectReason}`);
        continue;
      }

      // Step 2: Resolve best engine
      const resolvedEngine = resolveEngine(item);
      const engineChanged = resolvedEngine !== item.suggested_engine;

      // Step 3: Should we approve?
      const { approve, reason: approveReason } = shouldApprove(item, resolvedEngine);
      if (approve) {
        const update: Record<string, unknown> = {
          status: "approved",
          updated_at: new Date().toISOString(),
        };
        if (engineChanged) {
          update.suggested_engine = resolvedEngine;
        }
        const { error: approveErr } = await supabase.from("demand_queue").update(update).eq("id", item.id);
        if (approveErr) { results.errors++; console.error("approve failed:", approveErr.message); }
        else { results.approved++; }
        log.push(`APPROVE: ${item.suggested_name} (engine: ${resolvedEngine}${engineChanged ? ` fixed from ${item.suggested_engine}` : ""}) — ${approveReason}`);
        continue;
      }

      // Step 4: Leave for manual review
      results.skipped++;

    } catch { results.errors++; }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  // Log to cron_runs
  await supabase.from("cron_runs").insert({
    job_name: "auto-screen-queue",
    status: "success",
    items_published: results.approved,
    error_message: `approved:${results.approved} rejected:${results.rejected} skipped:${results.skipped}`,
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    ...results,
    total_processed: pending.length,
    log: log.slice(0, 50), // first 50 for debugging
  });
}