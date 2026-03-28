/**
 * app/api/admin/seo-dashboard/route.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 * Admin SEO Intelligence Dashboard API
 *
 * Returns:
 *  - GSC keyword data (queries, impressions, clicks, positions, CTR)
 *  - Inventory counts (tools, calcs, AI, comparisons, blog)
 *  - Content gaps (impressions but low CTR or position 4-20)
 *  - Cron run history
 *  - IndexNow last ping status
 *  - Action recommendations
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { fetchGSCData, type GSCQuery } from "@/lib/seo-intelligence";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Action = {
  type: "blog" | "faq" | "comparison" | "fix" | "index";
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  keyword?: string;
};

function generateActions(
  gscRows: GSCQuery[],
  blogCount: number,
  comparisonCount: number
): Action[] {
  const actions: Action[] = [];

  // Keywords at position 4-10 with high impressions — almost page 1
  const almostPage1 = gscRows
    .filter(r => r.position >= 4 && r.position <= 10 && r.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions);

  for (const kw of almostPage1.slice(0, 5)) {
    actions.push({
      type: "blog",
      priority: "high",
      title: `Write article for "${kw.keyword}"`,
      detail: `Position ${kw.position}, ${kw.impressions} impressions. A targeted blog post could push this to page 1.`,
      keyword: kw.keyword,
    });
  }

  // Keywords with high impressions but very low CTR — title/description mismatch
  const lowCTR = gscRows
    .filter(r => r.impressions >= 100 && r.ctr < 2 && r.position <= 15)
    .sort((a, b) => b.impressions - a.impressions);

  for (const kw of lowCTR.slice(0, 3)) {
    actions.push({
      type: "fix",
      priority: "high",
      title: `Fix meta for "${kw.keyword}"`,
      detail: `${kw.impressions} impressions but only ${kw.ctr}% CTR at position ${kw.position}. Update title/description to be more compelling.`,
      keyword: kw.keyword,
    });
  }

  // Keywords with "vs" — comparison page opportunities
  const vsKeywords = gscRows
    .filter(r => r.keyword.includes(" vs ") && r.impressions >= 20)
    .sort((a, b) => b.impressions - a.impressions);

  for (const kw of vsKeywords.slice(0, 3)) {
    actions.push({
      type: "comparison",
      priority: "medium",
      title: `Create comparison: "${kw.keyword}"`,
      detail: `${kw.impressions} impressions for this "X vs Y" query. Create a /compare/ page.`,
      keyword: kw.keyword,
    });
  }

  // Keywords with questions — FAQ opportunities
  const questionKeywords = gscRows
    .filter(r =>
      (r.keyword.startsWith("how to") || r.keyword.startsWith("what is") || r.keyword.includes("?")) &&
      r.impressions >= 30
    )
    .sort((a, b) => b.impressions - a.impressions);

  for (const kw of questionKeywords.slice(0, 3)) {
    actions.push({
      type: "faq",
      priority: "medium",
      title: `Add FAQ for "${kw.keyword}"`,
      detail: `${kw.impressions} impressions. Add this as a FAQ on the relevant tool page or write a short guide.`,
      keyword: kw.keyword,
    });
  }

  // General growth actions
  if (blogCount < 30) {
    actions.push({
      type: "blog",
      priority: "medium",
      title: "Increase blog output",
      detail: `Only ${blogCount} blog posts live. Aim for 50+ for strong topical authority.`,
    });
  }

  if (comparisonCount < 20) {
    actions.push({
      type: "comparison",
      priority: "low",
      title: "Expand comparison pages",
      detail: `Only ${comparisonCount} comparison pages. These rank fast for "X vs Y" buyer-intent keywords.`,
    });
  }

  return actions.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

export async function GET() {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Parallel fetches
    const [
      gscRows,
      toolsRes,
      calcsRes,
      aiToolsRes,
      blogRes,
      comparisonsRes,
      cronRes,
      subscribersRes,
    ] = await Promise.all([
      fetchGSCData("https://quickfnd.com", 28),
      supabase.from("tools").select("id", { count: "exact", head: true }),
      supabase.from("calculators").select("id", { count: "exact", head: true }),
      supabase.from("ai_tools").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("comparison_pages").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("cron_runs").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("email_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

    // Inventory
    const inventory = {
      tools: toolsRes.count || 0,
      calculators: calcsRes.count || 0,
      aiTools: aiToolsRes.count || 0,
      blog: blogRes.count || 0,
      comparisons: comparisonsRes.count || 0,
      subscribers: subscribersRes.count || 0,
      total: (toolsRes.count || 0) + (calcsRes.count || 0) + (aiToolsRes.count || 0),
    };

    // GSC summary stats
    const totalImpressions = gscRows.reduce((s, r) => s + r.impressions, 0);
    const totalClicks = gscRows.reduce((s, r) => s + r.clicks, 0);
    const avgPosition = gscRows.length > 0
      ? Math.round(gscRows.reduce((s, r) => s + r.position, 0) / gscRows.length * 10) / 10
      : 0;
    const avgCTR = totalImpressions > 0
      ? Math.round(totalClicks / totalImpressions * 10000) / 100
      : 0;

    // Top keywords by impressions
    const topKeywords = [...gscRows]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 50);

    // Content gaps: position 4-20, impressions > 30
    const contentGaps = gscRows
      .filter(r => r.position >= 4 && r.position <= 20 && r.impressions >= 30)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 30);

    // Rising keywords: position improving (clicks > 0)
    const risers = gscRows
      .filter(r => r.clicks > 0 && r.position <= 20)
      .sort((a, b) => a.position - b.position)
      .slice(0, 20);

    // Cron logs
    const cronLogs = (cronRes.data || []).map((r: Record<string, unknown>) => ({
      job_name: r.job_name,
      status: r.status,
      signals_collected: r.signals_collected || 0,
      gaps_identified: r.gaps_identified || 0,
      items_published: r.items_published || 0,
      error_message: r.error_message || null,
      started_at: r.started_at,
      duration_ms: r.duration_ms || 0,
    }));

    // Generate action items
    const actions = generateActions(gscRows, inventory.blog, inventory.comparisons);

    return NextResponse.json({
      gsc: {
        totalQueries: gscRows.length,
        totalImpressions,
        totalClicks,
        avgPosition,
        avgCTR,
        topKeywords,
        contentGaps,
        risers,
      },
      inventory,
      cronLogs,
      actions,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[seo-dashboard] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load SEO dashboard." },
      { status: 500 }
    );
  }
}
