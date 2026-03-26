/**
 * lib/seo-intelligence.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Real SEO intelligence for blog topic selection and content strategy.
 *
 * Three data sources:
 *   1. Google Search Console — real queries from YOUR site (positions 4-25)
 *   2. Serper SERP analysis — what top-ranking pages cover, their gaps
 *   3. Serper People Also Ask — real user questions for natural FAQ content
 *
 * Output: scored, ranked topic list where every article is written to beat
 * a specific currently-ranking page.
 */

import { getGoogleAccessToken } from "@/lib/gsc-auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GSCQuery = {
  keyword: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
};

export type CompetitorPage = {
  title: string;
  url: string;
  snippet: string;
  position: number;
};

export type SERPAnalysis = {
  keyword: string;
  top_results: CompetitorPage[];
  people_also_ask: string[];
  related_searches: string[];
  top_word_counts: number[];   // estimated word counts of top pages
  content_gaps: string[];      // topics top pages DON'T cover well
  recommended_word_count: number;
  difficulty_score: number;    // 1-10, lower = easier to rank
};

export type ScoredTopic = {
  keyword: string;
  source: "gsc" | "serper_paa" | "serper_related" | "seed";
  gsc_impressions: number;
  gsc_position: number | null;
  opportunity_score: number;   // 0-100, higher = better to write about
  serp_analysis: SERPAnalysis | null;
  tool_slug?: string;
  tool_name?: string;
};

// ─── Google Search Console ────────────────────────────────────────────────────

export async function fetchGSCData(
  siteUrl = "https://quickfnd.com",
  daysBack = 28
): Promise<GSCQuery[]> {
  const token = await getGoogleAccessToken();
  if (!token) {
    console.log("[seo-intelligence] No GSC token — skipping GSC data");
    return [];
  }

  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];

    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 500,
          dimensionFilterGroups: [{
            filters: [{
              dimension: "country",
              operator: "equals",
              expression: "ind",  // India — primary audience
            }],
          }],
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[seo-intelligence] GSC API error:", res.status, err.slice(0, 200));
      return [];
    }

    const data = await res.json() as {
      rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
    };

    return (data.rows || []).map(row => ({
      keyword: row.keys[0].toLowerCase().trim(),
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
      ctr: Math.round(row.ctr * 10000) / 100,
    }));
  } catch (err) {
    console.error("[seo-intelligence] GSC fetch error:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── Serper SERP analysis ─────────────────────────────────────────────────────

export async function analyseSERP(
  keyword: string,
  apiKey: string
): Promise<SERPAnalysis> {
  const empty: SERPAnalysis = {
    keyword,
    top_results: [],
    people_also_ask: [],
    related_searches: [],
    top_word_counts: [],
    content_gaps: [],
    recommended_word_count: 1000,
    difficulty_score: 5,
  };

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        q: keyword,
        gl: "in",
        hl: "en",
        num: 10,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return empty;

    const data = await res.json() as {
      organic?: { title: string; link: string; snippet: string; position: number }[];
      peopleAlsoAsk?: { question: string }[];
      relatedSearches?: { query: string }[];
    };

    const topResults: CompetitorPage[] = (data.organic || []).slice(0, 5).map(r => ({
      title: r.title || "",
      url: r.link || "",
      snippet: r.snippet || "",
      position: r.position || 0,
    }));

    const paa = (data.peopleAlsoAsk || []).map(q => q.question).slice(0, 6);
    const related = (data.relatedSearches || []).map(r => r.query).slice(0, 6);

    // Estimate competitor word counts from snippet length
    // Snippets are ~160 chars = ~30 words, full article typically 30-50x longer
    const estimatedCounts = topResults.map(r =>
      Math.round((r.snippet.split(" ").length * 40) / 100) * 100
    );

    // Analyse content gaps from snippets — what angles are missing?
    const allSnippets = topResults.map(r => `${r.title} ${r.snippet}`).join(" ").toLowerCase();
    const gaps: string[] = [];
    
    // Check for common content angles that might be missing
    const angles = [
      { check: "example", label: "real-world examples with numbers" },
      { check: "india", label: "India-specific context and regulations" },
      { check: "2025", label: "2025/2026 updated information" },
      { check: "mistake", label: "common mistakes to avoid" },
      { check: "compare", label: "comparison with alternatives" },
      { check: "calculator", label: "free calculator or tool to use" },
      { check: "step", label: "step-by-step walkthrough" },
    ];
    
    for (const angle of angles) {
      if (!allSnippets.includes(angle.check)) {
        gaps.push(angle.label);
      }
    }

    // Difficulty: based on domain authority signals in URLs
    const hasHighAuthority = topResults.some(r =>
      r.url.includes("wikipedia") || r.url.includes("investopedia") ||
      r.url.includes("clearingtax") || r.url.includes("bankbazaar") ||
      r.url.includes("nerdwallet") || r.url.includes("forbes")
    );

    // Recommended word count: beat the longest competitor by ~20%
    const maxEstimated = Math.max(...estimatedCounts, 800);
    const recommendedCount = Math.min(2000, Math.round(maxEstimated * 1.2 / 100) * 100);

    return {
      keyword,
      top_results: topResults,
      people_also_ask: paa,
      related_searches: related,
      top_word_counts: estimatedCounts,
      content_gaps: gaps.slice(0, 4),
      recommended_word_count: recommendedCount,
      difficulty_score: hasHighAuthority ? 7 : 4,
    };
  } catch {
    return empty;
  }
}

// ─── Topic opportunity scorer ─────────────────────────────────────────────────

export function scoreOpportunity(
  keyword: string,
  gscData: GSCQuery | null,
  serpAnalysis: SERPAnalysis | null
): number {
  let score = 30; // base

  // GSC signals — real data from YOUR site
  if (gscData) {
    // Position 4-10 = high opportunity (almost on page 1)
    if (gscData.position >= 4 && gscData.position <= 10) score += 35;
    else if (gscData.position > 10 && gscData.position <= 20) score += 20;
    else if (gscData.position > 20 && gscData.position <= 30) score += 10;

    // High impressions = real search demand
    if (gscData.impressions >= 500) score += 20;
    else if (gscData.impressions >= 100) score += 12;
    else if (gscData.impressions >= 30) score += 6;

    // Low CTR at good position = title/content mismatch = opportunity
    if (gscData.position <= 10 && gscData.ctr < 3) score += 10;
  }

  // Keyword intent signals
  const kw = keyword.toLowerCase();
  if (kw.startsWith("how to")) score += 15;
  if (kw.startsWith("what is")) score += 10;
  if (kw.includes("india") || kw.includes("indian")) score += 8;
  if (kw.includes("2025") || kw.includes("2026")) score += 6;
  if (kw.includes("calculator") || kw.includes("tool")) score += 5;
  if (kw.includes("free")) score += 4;
  if (kw.includes(" vs ")) score += 8; // comparison intent
  if (kw.split(" ").length >= 5) score += 8; // long-tail = easier

  // SERP signals
  if (serpAnalysis) {
    // Low difficulty = easier to rank
    if (serpAnalysis.difficulty_score <= 4) score += 10;
    // Many content gaps = we can write something better
    if (serpAnalysis.content_gaps.length >= 3) score += 8;
    // PAA questions = content to answer = better article
    if (serpAnalysis.people_also_ask.length >= 4) score += 5;
  }

  return Math.min(100, score);
}

// ─── Main: get today's best topics ───────────────────────────────────────────

export async function getTopTopicsForToday(
  count: number,
  seedKeywords: string[],
  publishedKeywords: Set<string>
): Promise<ScoredTopic[]> {
  const serperKey = process.env.SERPER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";

  // Step 1: Fetch GSC data
  const gscRows = await fetchGSCData(siteUrl);
  const gscMap = new Map<string, GSCQuery>(gscRows.map(r => [r.keyword, r]));

  console.log(`[seo-intelligence] GSC: ${gscRows.length} queries fetched`);

  // Step 2: Build candidate pool
  // Priority 1: GSC queries at position 4-25 with 30+ impressions (almost ranking)
  const gscCandidates: ScoredTopic[] = gscRows
    .filter(r =>
      r.position >= 4 && r.position <= 25 &&
      r.impressions >= 30 &&
      !publishedKeywords.has(r.keyword)
    )
    .sort((a, b) => {
      // Sort by position ascending (closest to page 1 first), then impressions
      const posScore = (30 - a.position) * 3 - (30 - b.position) * 3;
      const impScore = b.impressions - a.impressions;
      return posScore + impScore;
    })
    .slice(0, 20)
    .map(r => ({
      keyword: r.keyword,
      source: "gsc" as const,
      gsc_impressions: r.impressions,
      gsc_position: r.position,
      opportunity_score: 0,
      serp_analysis: null,
    }));

  // Priority 2: Seed keywords not yet published
  const seedCandidates: ScoredTopic[] = seedKeywords
    .filter(kw => !publishedKeywords.has(kw.toLowerCase()))
    .slice(0, 20)
    .map(kw => ({
      keyword: kw,
      source: "seed" as const,
      gsc_impressions: gscMap.get(kw)?.impressions || 0,
      gsc_position: gscMap.get(kw)?.position || null,
      opportunity_score: 0,
      serp_analysis: null,
    }));

  // Combine: GSC first, then seeds
  const allCandidates = [...gscCandidates, ...seedCandidates];

  // Step 3: Score all candidates
  for (const candidate of allCandidates) {
    const gscData = gscMap.get(candidate.keyword) || null;
    candidate.opportunity_score = scoreOpportunity(candidate.keyword, gscData, null);
  }

  // Step 4: Sort by score, pick top N * 2 for SERP analysis
  allCandidates.sort((a, b) => b.opportunity_score - a.opportunity_score);
  const toAnalyse = allCandidates.slice(0, count * 2);

  // Step 5: Run SERP analysis on top candidates (uses Serper)
  if (serperKey) {
    for (const candidate of toAnalyse) {
      try {
        candidate.serp_analysis = await analyseSERP(candidate.keyword, serperKey);
        // Re-score with SERP data
        const gscData = gscMap.get(candidate.keyword) || null;
        candidate.opportunity_score = scoreOpportunity(candidate.keyword, gscData, candidate.serp_analysis);
        await new Promise(r => setTimeout(r, 600)); // rate limit
      } catch { /* continue */ }
    }
  }

  // Final sort and return top N
  toAnalyse.sort((a, b) => b.opportunity_score - a.opportunity_score);

  console.log(`[seo-intelligence] Top topics:`);
  toAnalyse.slice(0, count).forEach(t =>
    console.log(`  ${t.opportunity_score}/100 — "${t.keyword}" (${t.source}, pos: ${t.gsc_position || "unknown"})`)
  );

  return toAnalyse.slice(0, count);
}