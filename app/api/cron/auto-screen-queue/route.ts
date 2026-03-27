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

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Engines that render real working UIs (from our LIVE sets) ─────────────────
const WORKING_ENGINES = new Set([
  // Tools
  "password-generator", "password-strength-checker", "json-formatter",
  "word-counter", "uuid-generator", "slug-generator", "random-string-generator",
  "base64-encoder", "base64-decoder", "url-encoder", "url-decoder",
  "text-case-converter", "text-transformer", "code-formatter", "number-generator",
  "unit-converter", "currency-converter", "regex-tester", "regex-extractor",
  "sha256-generator", "md5-generator", "timestamp-converter", "hex-to-rgb",
  "rgb-to-hex", "text-to-binary", "binary-to-text", "json-escape", "json-unescape",
  "qr-generator", "barcode-generator", "color-picker", "markdown-editor",
  "csv-to-json", "ip-lookup", "diff-checker", "jwt-decoder", "lorem-ipsum-generator",
  "number-base-converter", "html-entity-encoder", "string-escape-tool",
  "yaml-json-converter", "json-to-csv", "color-contrast-checker",
  "robots-txt-generator", "html-minifier", "css-minifier", "js-minifier",
  "email-validator", "line-sorter", "box-shadow-generator", "css-gradient-generator",
  "open-graph-tester",
  // Calculators
  "age-calculator", "bmi-calculator", "loan-calculator", "emi-calculator",
  "percentage-calculator", "simple-interest-calculator", "compound-interest-calculator",
  "gst-calculator", "sip-calculator", "fd-calculator", "ppf-calculator",
  "hra-calculator", "income-tax-calculator", "formula-calculator",
  "discount-calculator", "tip-calculator", "roi-calculator", "savings-calculator",
  "retirement-calculator", "salary-calculator", "calorie-calculator",
  "fuel-cost-calculator", "cagr-calculator", "gratuity-calculator", "rd-calculator",
  "mortgage-calculator", "sales-tax-calculator", "vat-calculator",
  // AI Tools
  "openai-text-tool", "ai-prompt-generator", "ai-email-writer", "ai-blog-outline-generator",
]);

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
  // Tax (India) → income-tax-calculator
  "tax-calculator": "income-tax-calculator",
  "income-tax": "income-tax-calculator",
  // Mortgage (India) → emi-calculator
  "mortgage": "emi-calculator",
  "home-loan": "emi-calculator",
  // Encoder/decoder → base64-encoder
  "encoder-decoder": "base64-encoder",
  "encode-decode": "base64-encoder",
  // Format → json-formatter or text-transformer
  "formatter": "json-formatter",
  "format": "text-transformer",
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

  if (item.demand_score >= threshold) {
    return { approve: true, reason: `Score ${item.demand_score} >= threshold ${threshold}` };
  }

  return { approve: false, reason: `Score ${item.demand_score} below threshold ${threshold}` };
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
  const { data: pending } = await supabase
    .from("demand_queue")
    .select("id, query, suggested_name, suggested_slug, suggested_engine, suggested_category, demand_score")
    .eq("status", "pending")
    .order("demand_score", { ascending: false })
    .limit(200);

  if (!pending?.length) {
    return NextResponse.json({ success: true, message: "No pending items", ...results });
  }

  for (const item of pending as QueueItem[]) {
    try {
      // Step 1: Should we reject?
      const { reject, reason: rejectReason } = shouldReject(item);
      if (reject) {
        await supabase.from("demand_queue")
          .update({ status: "rejected", rejection_reason: rejectReason, updated_at: new Date().toISOString() })
          .eq("id", item.id);
        results.rejected++;
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
        await supabase.from("demand_queue").update(update).eq("id", item.id);
        results.approved++;
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