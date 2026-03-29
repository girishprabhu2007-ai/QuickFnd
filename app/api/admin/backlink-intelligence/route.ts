/**
 * app/api/admin/backlink-intelligence/route.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 * Backlink Intelligence API
 *
 * POST ?action=suggest     — AI generates backlink opportunities for QuickFnd
 * POST ?action=bulk-import — bulk import URLs, auto-detect source, estimate DA, classify quality
 * POST ?action=analyze     — analyze all backlinks for quality, flag toxic ones
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ── DA Estimation from domain patterns ───────────────────────────────────────
// Real DA requires Moz/Ahrefs API ($$$). We use a heuristic based on known domains.

const KNOWN_DA: Record<string, number> = {
  "github.com": 96, "youtube.com": 100, "twitter.com": 94, "x.com": 94,
  "linkedin.com": 98, "reddit.com": 91, "facebook.com": 96, "medium.com": 95,
  "dev.to": 86, "producthunt.com": 90, "news.ycombinator.com": 90,
  "stackoverflow.com": 94, "quora.com": 93, "pinterest.com": 94,
  "wordpress.org": 95, "wordpress.com": 93, "blogger.com": 89,
  "tumblr.com": 86, "wikipedia.org": 100, "bbc.com": 95,
  "nytimes.com": 95, "forbes.com": 94, "techcrunch.com": 93,
  "wired.com": 93, "theverge.com": 92, "mashable.com": 92,
  "alternativeto.net": 85, "saashub.com": 68, "betalist.com": 72,
  "indiehackers.com": 78, "hackernoon.com": 82, "freecodecamp.org": 86,
  "hashnode.dev": 72, "toolify.ai": 58, "theresanaiforthat.com": 72,
  "futurepedia.io": 65, "free-for.dev": 72, "npmjs.com": 88,
  "pypi.org": 82, "crunchbase.com": 91, "g2.com": 87,
  "capterra.com": 86, "trustpilot.com": 93, "sitejabber.com": 78,
};

function estimateDA(url: string): number {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    // Check exact match
    if (KNOWN_DA[hostname]) return KNOWN_DA[hostname];
    // Check parent domain
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const parent = parts.slice(-2).join(".");
      if (KNOWN_DA[parent]) return KNOWN_DA[parent];
    }
    // Heuristic based on TLD and patterns
    if (hostname.endsWith(".edu")) return 70;
    if (hostname.endsWith(".gov")) return 75;
    if (hostname.endsWith(".org")) return 45;
    if (hostname.includes("blog")) return 30;
    if (hostname.includes("forum")) return 25;
    return 20; // unknown domains default low
  } catch { return 0; }
}

// ── Quality scoring ──────────────────────────────────────────────────────────

type QualityResult = {
  score: number;        // 0-100
  grade: "excellent" | "good" | "fair" | "poor" | "toxic";
  reasons: string[];
  action: "keep" | "monitor" | "consider-removing" | "remove";
};

function assessQuality(backlink: {
  url: string;
  da: number;
  source_type: string;
  link_status: string;
  http_status: number | null;
  anchor_text: string;
}): QualityResult {
  let score = 50; // base
  const reasons: string[] = [];

  // DA scoring
  if (backlink.da >= 80) { score += 25; reasons.push("High authority domain (DA 80+)"); }
  else if (backlink.da >= 60) { score += 15; reasons.push("Good authority domain (DA 60+)"); }
  else if (backlink.da >= 40) { score += 5; reasons.push("Moderate authority domain"); }
  else if (backlink.da >= 20) { score -= 5; reasons.push("Low authority domain (DA < 40)"); }
  else { score -= 15; reasons.push("Very low authority domain (DA < 20)"); }

  // Link status
  if (backlink.link_status === "dead") { score -= 30; reasons.push("Link is dead (not accessible)"); }
  else if (backlink.link_status === "alive") { score += 10; reasons.push("Link is live and accessible"); }

  // Source type quality
  const goodTypes = new Set(["resource-page", "guest-post", "directory"]);
  const badTypes = new Set(["blog-comment", "forum"]);
  if (goodTypes.has(backlink.source_type)) { score += 10; reasons.push(`Good link type: ${backlink.source_type}`); }
  if (badTypes.has(backlink.source_type)) { score -= 10; reasons.push(`Lower quality link type: ${backlink.source_type}`); }

  // Spam signals
  const urlLower = backlink.url.toLowerCase();
  const spamSignals = [
    { check: urlLower.includes("free-backlink"), label: "URL contains 'free-backlink' — likely spam" },
    { check: urlLower.includes("link-exchange"), label: "URL contains 'link-exchange'" },
    { check: urlLower.includes("buy-links"), label: "URL contains 'buy-links'" },
    { check: urlLower.match(/\d{8,}/), label: "URL has long number sequences — likely auto-generated" },
    { check: urlLower.includes("casino") || urlLower.includes("poker") || urlLower.includes("viagra"), label: "URL matches spam keyword patterns" },
  ];

  for (const signal of spamSignals) {
    if (signal.check) { score -= 20; reasons.push(signal.label); }
  }

  // Anchor text diversity
  if (backlink.anchor_text === "click here" || backlink.anchor_text === "here") {
    score -= 5; reasons.push("Generic anchor text");
  }

  // HTTP status signals
  if (backlink.http_status && backlink.http_status >= 400) {
    score -= 15; reasons.push(`HTTP ${backlink.http_status} error`);
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Grade
  let grade: QualityResult["grade"];
  let action: QualityResult["action"];
  if (score >= 80) { grade = "excellent"; action = "keep"; }
  else if (score >= 60) { grade = "good"; action = "keep"; }
  else if (score >= 40) { grade = "fair"; action = "monitor"; }
  else if (score >= 20) { grade = "poor"; action = "consider-removing"; }
  else { grade = "toxic"; action = "remove"; }

  return { score, grade, reasons, action };
}

// ── Source name detection from URL ───────────────────────────────────────────

function detectSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const parts = hostname.split(".");
    const name = parts[0];
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch { return "Unknown"; }
}

function detectSourceType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("reddit.com") || lower.includes("forum") || lower.includes("community")) return "forum";
  if (lower.includes("twitter.com") || lower.includes("x.com") || lower.includes("linkedin.com") || lower.includes("facebook.com") || lower.includes("pinterest.com") || lower.includes("youtube.com")) return "social";
  if (lower.includes("blog") || lower.includes("article") || lower.includes("post")) return "guest-post";
  if (lower.includes("github.com")) return "resource-page";
  if (lower.includes("comment")) return "blog-comment";
  return "directory";
}

// ── Handlers ─────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const supabase = getSupabaseAdmin();

  // ── AI Suggestions ─────────────────────────────────────────────────────────
  if (action === "suggest") {
    try {
      const openai = getOpenAIClient();

      // Get current inventory for context
      const [toolsRes, calcsRes, blogRes] = await Promise.all([
        supabase.from("tools").select("id", { count: "exact", head: true }),
        supabase.from("calculators").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      ]);

      const context = `QuickFnd (quickfnd.com) is a free browser-based tools platform with ${toolsRes.count || 0} tools (JSON formatter, image compressor, PDF merger, video-to-gif, etc.), ${calcsRes.count || 0} calculators (EMI, SIP, GST, salary, etc.), and ${blogRes.count || 0} blog posts. Target audience: developers, content creators, Indian finance users. All tools run client-side, no signup needed.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.8,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: `You are an SEO backlink strategist. Generate specific, actionable backlink opportunities. For each opportunity, provide the EXACT URL to submit/post, what to write/post, and why it will work. Focus on realistic, free opportunities. Return ONLY a JSON array with no markdown or preamble.`,
          },
          {
            role: "user",
            content: `${context}

Generate 10 specific backlink opportunities for QuickFnd. For each, return a JSON object with:
- "url": the exact page/submission URL to visit
- "source_name": the platform name
- "strategy": what specifically to post/submit (2-3 sentences)
- "expected_da": estimated domain authority (number)
- "type": "directory" | "guest-post" | "social" | "forum" | "resource-page"
- "effort": "low" | "medium" | "high"
- "impact": "low" | "medium" | "high"

Focus on opportunities NOT in this list: Product Hunt, AlternativeTo, Hacker News, Reddit, Dev.to, Indie Hackers, BetaList, SaaSHub. Find NEW opportunities.

Return ONLY the JSON array, no other text.`,
          },
        ],
      });

      const text = completion.choices[0]?.message?.content || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();

      let suggestions;
      try { suggestions = JSON.parse(cleaned); }
      catch { suggestions = []; }

      return NextResponse.json({ suggestions });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "AI suggestion failed" }, { status: 500 });
    }
  }

  // ── Bulk Import ────────────────────────────────────────────────────────────
  if (action === "bulk-import") {
    const body = await req.json().catch(() => ({})) as { urls?: string[] };
    const urls = (body.urls || []).map(u => String(u).trim()).filter(Boolean);

    if (urls.length === 0) return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    if (urls.length > 100) return NextResponse.json({ error: "Max 100 URLs at a time" }, { status: 400 });

    const results: { url: string; status: "imported" | "duplicate" | "error"; da?: number; source_name?: string; source_type?: string; quality?: QualityResult }[] = [];

    for (const url of urls) {
      // Skip invalid URLs
      try { new URL(url); } catch {
        results.push({ url, status: "error" });
        continue;
      }

      // Check duplicate
      const { data: existing } = await supabase.from("backlinks").select("id").eq("url", url).maybeSingle();
      if (existing) { results.push({ url, status: "duplicate" }); continue; }

      const da = estimateDA(url);
      const sourceName = detectSourceName(url);
      const sourceType = detectSourceType(url);

      // Check if URL is alive
      let linkStatus = "unchecked";
      let httpStatus: number | null = null;
      try {
        const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "QuickFnd-Backlink-Checker/1.0" } });
        linkStatus = res.ok ? "alive" : "dead";
        httpStatus = res.status;
      } catch {
        try {
          const res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "QuickFnd-Backlink-Checker/1.0" } });
          linkStatus = res.ok ? "alive" : "dead";
          httpStatus = res.status;
        } catch { linkStatus = "dead"; httpStatus = 0; }
      }

      const quality = assessQuality({ url, da, source_type: sourceType, link_status: linkStatus, http_status: httpStatus, anchor_text: "QuickFnd" });

      const { error } = await supabase.from("backlinks").insert({
        url,
        source_name: sourceName,
        source_type: sourceType,
        anchor_text: "QuickFnd",
        target_url: "https://quickfnd.com",
        da,
        notes: `Auto-imported · Quality: ${quality.grade} (${quality.score}/100)`,
        link_status: linkStatus,
        http_status: httpStatus,
        last_checked: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      if (error) { results.push({ url, status: "error" }); }
      else { results.push({ url, status: "imported", da, source_name: sourceName, source_type: sourceType, quality }); }

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    }

    const imported = results.filter(r => r.status === "imported").length;
    const duplicates = results.filter(r => r.status === "duplicate").length;
    const errors = results.filter(r => r.status === "error").length;

    return NextResponse.json({ imported, duplicates, errors, total: urls.length, results });
  }

  // ── Analyze All Backlinks ──────────────────────────────────────────────────
  if (action === "analyze") {
    const { data: backlinks } = await supabase.from("backlinks").select("*").order("created_at", { ascending: false });

    if (!backlinks || backlinks.length === 0) {
      return NextResponse.json({ analysis: [], summary: { total: 0, excellent: 0, good: 0, fair: 0, poor: 0, toxic: 0 } });
    }

    const analysis = backlinks.map(link => ({
      id: link.id,
      url: link.url,
      source_name: link.source_name,
      da: link.da,
      link_status: link.link_status,
      quality: assessQuality({
        url: link.url,
        da: link.da || 0,
        source_type: link.source_type || "directory",
        link_status: link.link_status || "unchecked",
        http_status: link.http_status,
        anchor_text: link.anchor_text || "QuickFnd",
      }),
    }));

    const summary = {
      total: analysis.length,
      excellent: analysis.filter(a => a.quality.grade === "excellent").length,
      good: analysis.filter(a => a.quality.grade === "good").length,
      fair: analysis.filter(a => a.quality.grade === "fair").length,
      poor: analysis.filter(a => a.quality.grade === "poor").length,
      toxic: analysis.filter(a => a.quality.grade === "toxic").length,
      avgScore: Math.round(analysis.reduce((s, a) => s + a.quality.score, 0) / analysis.length),
      avgDA: Math.round(analysis.reduce((s, a) => s + (a.da || 0), 0) / analysis.length),
      removeCount: analysis.filter(a => a.quality.action === "remove" || a.quality.action === "consider-removing").length,
    };

    return NextResponse.json({ analysis, summary });
  }

  return NextResponse.json({ error: "Unknown action. Use ?action=suggest|bulk-import|analyze" }, { status: 400 });
}
