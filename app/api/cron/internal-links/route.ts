/**
 * app/api/cron/internal-links/route.ts
 * Runs daily after blog-publish — scans new articles and injects
 * links to related existing articles and QuickFnd tools.
 *
 * Strategy:
 * 1. Find posts published in last 48h with no internal links yet
 * 2. Find related posts by matching tags + target_keyword overlap
 * 3. Use GPT to identify the best 2-3 anchor text opportunities in the content
 * 4. Inject links and update the post
 *
 * Also updates OLD posts to link to NEW posts when relevant.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getOpenAIClient } from "@/lib/openai-server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const SITE_URL = "https://quickfnd.com";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// Find keyword overlap score between two posts
function keywordOverlap(
  post1: { target_keyword: string; tags: string[]; category: string },
  post2: { target_keyword: string; tags: string[]; category: string }
): number {
  let score = 0;
  const kw1 = post1.target_keyword.toLowerCase().split(" ");
  const kw2 = post2.target_keyword.toLowerCase().split(" ");
  // Shared keyword words
  const shared = kw1.filter(w => w.length > 3 && kw2.includes(w));
  score += shared.length * 15;
  // Same category
  if (post1.category === post2.category) score += 20;
  // Shared tags
  const sharedTags = post1.tags.filter(t => post2.tags.includes(t));
  score += sharedTags.length * 10;
  return score;
}

// Use GPT to find best anchor text opportunities
async function findLinkOpportunities(
  content: string,
  relatedPosts: { title: string; slug: string; target_keyword: string }[],
  existingLinks: string[]
): Promise<{ phrase: string; url: string; replacement: string }[]> {
  if (relatedPosts.length === 0) return [];

  const openai = getOpenAIClient();
  const alreadyLinked = new Set(existingLinks);
  const candidates = relatedPosts.filter(p => !alreadyLinked.has(p.slug)).slice(0, 4);
  if (candidates.length === 0) return [];

  const prompt = `You are an SEO internal linking specialist.

ARTICLE CONTENT (first 2000 chars):
${content.slice(0, 2000)}

RELATED ARTICLES TO LINK TO:
${candidates.map((p, i) => `${i + 1}. Title: "${p.title}" | Slug: ${p.slug} | Keyword: ${p.target_keyword}`).join("\n")}

Find 2-3 natural places in the article content where we can add internal links to these related articles.
Look for exact phrases already in the content that match the related article's topic.
Only suggest links where the anchor text reads naturally — never force a link.

Return ONLY valid JSON array:
[
  {
    "phrase": "exact phrase from content to become the anchor",
    "slug": "target-article-slug",
    "title": "related article title"
  }
]

Return empty array [] if no natural opportunities exist. Maximum 3 links.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });
    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as { links?: { phrase: string; slug: string; title: string }[] } | { phrase: string; slug: string; title: string }[];
    const links = Array.isArray(parsed) ? parsed : (parsed.links || []);

    return links
      .filter(l => l.phrase && l.slug && content.includes(l.phrase))
      .map(l => ({
        phrase: l.phrase,
        url: `${SITE_URL}/blog/${l.slug}`,
        replacement: `[${l.phrase}](${SITE_URL}/blog/${l.slug})`,
      }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

// Inject links into markdown content
function injectLinks(
  content: string,
  opportunities: { phrase: string; url: string; replacement: string }[]
): { content: string; count: number } {
  let updated = content;
  let count = 0;

  for (const opp of opportunities) {
    // Only replace the first occurrence, skip if already in a link
    const idx = updated.indexOf(opp.phrase);
    if (idx === -1) continue;
    // Check not already inside a markdown link
    const before = updated.slice(Math.max(0, idx - 3), idx);
    if (before.includes("[") || before.includes("](")) continue;

    updated = updated.slice(0, idx) + opp.replacement + updated.slice(idx + opp.phrase.length);
    count++;
  }

  return { content: updated, count };
}

export async function GET(req: Request) {
  const startTime = Date.now();
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();

  // Get all published posts
  const { data: allPosts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content, target_keyword, tags, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);

  if (!allPosts?.length) {
    return NextResponse.json({ success: true, message: "No posts to process", linked: 0 });
  }

  // Focus on posts from last 48h that don't have many internal links yet
  const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const recentPosts = allPosts.filter(p =>
    p.published_at >= cutoff &&
    (p.content.match(/\[.*?\]\(.*?quickfnd\.com\/blog/g) || []).length < 2
  );

  if (!recentPosts.length) {
    return NextResponse.json({ success: true, message: "No recent posts need internal links", linked: 0 });
  }

  let totalLinked = 0;
  const results: { slug: string; links_added: number }[] = [];

  for (const post of recentPosts.slice(0, 5)) {
    try {
      // Find related posts by keyword/tag overlap
      const related = allPosts
        .filter(p => p.slug !== post.slug)
        .map(p => ({ ...p, score: keywordOverlap(post, p) }))
        .filter(p => p.score > 10)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (!related.length) continue;

      // Find existing links in content
      const existingLinks = (post.content.match(/quickfnd\.com\/blog\/([a-z0-9-]+)/g) || [])
        .map((m: string) => m.replace("quickfnd.com/blog/", ""));

      // Ask GPT to find natural anchor text opportunities
      const opportunities = await findLinkOpportunities(
        post.content,
        related,
        existingLinks
      );

      if (!opportunities.length) continue;

      // Inject links into content
      const { content: updatedContent, count } = injectLinks(post.content, opportunities);

      if (count > 0) {
        await supabase
          .from("blog_posts")
          .update({ content: updatedContent, updated_at: new Date().toISOString() })
          .eq("id", post.id);

        totalLinked += count;
        results.push({ slug: post.slug, links_added: count });
      }

      await new Promise(r => setTimeout(r, 2000));
    } catch { /* continue to next post */ }
  }

  return NextResponse.json({
    success: true,
    posts_processed: recentPosts.slice(0, 5).length,
    total_links_added: totalLinked,
    results,
    duration_ms: Date.now() - startTime,
  });
}