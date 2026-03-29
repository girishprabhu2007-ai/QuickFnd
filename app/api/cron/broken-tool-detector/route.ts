/**
 * app/api/cron/broken-tool-detector/route.ts
 * Weekly cron that checks every visible tool/calculator/AI tool page for:
 *  - HTTP errors (non-200 status)
 *  - Missing renderer (placeholder text still showing)
 *  - Empty pages
 *
 * Results logged to cron_runs table. Broken items flagged in admin dashboard.
 * Schedule: Sunday 6 AM UTC (add to vercel.json)
 *
 * Session 9: Initial build.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — scanning 200+ pages

const SITE_URL = "https://quickfnd.com";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

type BrokenItem = {
  slug: string;
  table: string;
  url: string;
  issue: string;
  http_status: number | null;
};

async function checkPage(url: string): Promise<{ status: number; hasRenderer: boolean; isEmpty: boolean }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "QuickFnd-BrokenToolDetector/1.0" },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    const status = res.status;
    if (status !== 200) return { status, hasRenderer: false, isEmpty: true };

    const html = await res.text();
    const isEmpty = html.length < 500;

    // Check for real renderer presence — these are component markers in SSR output
    const rendererMarkers = [
      "Tool Workspace",
      "CALCULATOR WORKSPACE",
      "data-tool-workspace",
      "VideoToolRenderer",
      "FileToolRenderer",
      "PDFToolRenderer",
      "WHAT THIS TOOL DOES",
      "INPUTS",
      "Generate",
      "Calculate",
    ];
    const hasRenderer = rendererMarkers.some((m) => html.includes(m));

    // Check for placeholder-only pages
    const placeholderMarkers = [
      "Adjust the inputs and run the tool",
      "This tool is coming soon",
    ];
    const isPlaceholder = placeholderMarkers.some((m) => html.includes(m)) && !hasRenderer;

    return { status, hasRenderer: hasRenderer && !isPlaceholder, isEmpty };
  } catch {
    return { status: 0, hasRenderer: false, isEmpty: true };
  }
}

export async function GET(req: Request) {
  const startedAt = new Date();
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const broken: BrokenItem[] = [];
  let checked = 0;

  try {
    // Fetch all visible items
    const [{ data: tools }, { data: calcs }, { data: aiTools }] = await Promise.all([
      supabase.from("tools").select("slug, name, engine_type"),
      supabase.from("calculators").select("slug, name, engine_type"),
      supabase.from("ai_tools").select("slug, name, engine_type"),
    ]);

    // Build check list — skip hidden/placeholder engines
    const skipEngines = new Set(["hidden", "generic-directory", "", "auto"]);
    const pages: { slug: string; table: string; path: string }[] = [];

    for (const t of tools || []) {
      if (!t.engine_type || skipEngines.has(t.engine_type)) continue;
      pages.push({ slug: t.slug, table: "tools", path: `/tools/${t.slug}` });
    }
    for (const c of calcs || []) {
      if (!c.engine_type || skipEngines.has(c.engine_type)) continue;
      pages.push({ slug: c.slug, table: "calculators", path: `/calculators/${c.slug}` });
    }
    for (const a of aiTools || []) {
      if (!a.engine_type || skipEngines.has(a.engine_type)) continue;
      pages.push({ slug: a.slug, table: "ai_tools", path: `/ai-tools/${a.slug}` });
    }

    // Check each page (with concurrency limit)
    const BATCH_SIZE = 5;
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
      const batch = pages.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (page) => {
          const url = `${SITE_URL}${page.path}`;
          const result = await checkPage(url);
          checked++;

          const issues: string[] = [];
          if (result.status !== 200) issues.push(`HTTP ${result.status}`);
          if (result.isEmpty) issues.push("empty page");
          if (!result.hasRenderer && result.status === 200) issues.push("no renderer detected");

          if (issues.length > 0) {
            broken.push({
              slug: page.slug,
              table: page.table,
              url,
              issue: issues.join(", "),
              http_status: result.status || null,
            });
          }
        })
      );

      // Small delay between batches to avoid overwhelming the server
      if (i + BATCH_SIZE < pages.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Log results to cron_runs
    const durationMs = Date.now() - startedAt.getTime();
    await supabase.from("cron_runs").insert({
      job_name: "broken-tool-detector",
      status: broken.length > 0 ? "warning" : "success",
      items_published: checked,
      error_message: broken.length > 0
        ? `${broken.length} broken: ${broken.slice(0, 5).map((b) => `${b.slug}(${b.issue})`).join(", ")}${broken.length > 5 ? "..." : ""}`
        : null,
      started_at: startedAt.toISOString(),
      duration_ms: durationMs,
    });

    return NextResponse.json({
      success: true,
      checked,
      broken_count: broken.length,
      broken: broken.slice(0, 20), // limit response size
      duration_ms: durationMs,
    });
  } catch (err: unknown) {
    const durationMs = Date.now() - startedAt.getTime();
    const errorMsg = err instanceof Error ? err.message : String(err);
    await supabase.from("cron_runs").insert({
      job_name: "broken-tool-detector",
      status: "error",
      items_published: checked,
      error_message: errorMsg.slice(0, 500),
      started_at: startedAt.toISOString(),
      duration_ms: durationMs,
    }).then(() => {});

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
