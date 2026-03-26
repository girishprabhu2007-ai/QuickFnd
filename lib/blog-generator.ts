/**
 * lib/blog-generator.ts
 * GPT-powered blog article generator for QuickFnd.
 * Generates SEO-optimised long-form articles targeting high-traffic keywords.
 */

import { createClient } from "@supabase/supabase-js";
import { getOpenAIClient } from "@/lib/openai-server";
import { estimateReadingTime, type BlogCategory } from "@/lib/blog";
import { indexNewPage } from "@/lib/index-now";

export type BlogGenerationInput = {
  keyword: string;         // primary target keyword e.g. "how to minify html"
  tool_slug?: string;      // related QuickFnd tool, e.g. "html-minifier"
  tool_name?: string;      // e.g. "HTML Minifier"
  category?: BlogCategory;
  source?: "auto-pipeline" | "gsc-opportunity" | "manual";
};

export type BlogGenerationResult = {
  success: boolean;
  slug?: string;
  title?: string;
  error?: string;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

function inferCategory(keyword: string, toolSlug?: string): BlogCategory {
  const kw = keyword.toLowerCase();
  if (kw.startsWith("how to") || kw.startsWith("how do")) return "how-to";
  if (kw.includes(" vs ") || kw.includes(" vs.") || kw.includes("alternative") || kw.includes("comparison")) return "comparison";
  if (kw.includes("best ") || kw.includes("top ") || kw.includes("guide to") || kw.includes("complete guide")) return "pillar";
  if (kw.includes("seo") || kw.includes("rank") || kw.includes("keyword")) return "seo-guide";
  if (toolSlug?.includes("calculator") || kw.includes("calculator")) return "calculator-guide";
  if (kw.includes("developer") || kw.includes("json") || kw.includes("regex") || kw.includes("api")) return "developer-guide";
  if (kw.includes("ai ") || kw.includes(" ai") || kw.includes("chatgpt")) return "ai-guide";
  if (kw.includes("finance") || kw.includes("loan") || kw.includes("tax") || kw.includes("invest")) return "finance-guide";
  return "tools-guide";
}

function keywordToSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function slugToTitle(keyword: string): string {
  return keyword
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/^How To /, "How to ")
    .replace(/^What Is /, "What Is ");
}

export async function generateBlogPost(input: BlogGenerationInput): Promise<BlogGenerationResult> {
  const openai = getOpenAIClient();
  const supabase = getSupabaseAdmin();

  const slug = keywordToSlug(input.keyword);
  const category = input.category ?? inferCategory(input.keyword, input.tool_slug);
  const suggestedTitle = slugToTitle(input.keyword);

  // Check duplicate
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { success: false, error: "Slug already exists: " + slug };

  const toolContext = input.tool_slug && input.tool_name
    ? `\n\nRELATED QUICKFND TOOL: "${input.tool_name}" at https://quickfnd.com/tools/${input.tool_slug}\nIncorporate this tool naturally into the article. Link to it 2-3 times using anchor text variations like "use our ${input.tool_name}", "try the free ${input.tool_name}", or "${input.tool_name} tool". Always link as: [anchor text](https://quickfnd.com/tools/${input.tool_slug})`
    : "\n\nLink naturally to relevant free tools at https://quickfnd.com where appropriate.";

  const prompt = `You are a senior SEO content writer for QuickFnd.com, a free browser-based tools platform.

Write a complete, high-quality SEO blog article targeting this keyword: "${input.keyword}"
Article type: ${category}
Suggested title: "${suggestedTitle}"
${toolContext}

REQUIREMENTS:
1. Title: Compelling, SEO-optimised, contains the exact keyword. 60-70 chars ideal.
2. Excerpt: 2 sentences, 150-160 chars, includes keyword, compelling for CTR.
3. Content: 800-1200 words minimum. Use proper Markdown:
   - ## for H2 subheadings (4-6 subheadings total)
   - ### for H3 where needed
   - **bold** for emphasis on key terms
   - Bullet lists with - for scannable sections
   - Include a practical step-by-step section
   - Include a "Why it matters" or "Key benefits" section
   - End with a clear conclusion + CTA linking to the QuickFnd tool or homepage
   - Write in a helpful, clear, expert tone — like a senior developer explaining to a colleague
   - No fluff, no padding, every paragraph earns its place
4. og_title: 50-60 chars, click-worthy
5. og_description: 150-160 chars, includes keyword + value prop
6. target_keyword: The exact primary keyword
7. secondary_keywords: 5-8 related long-tail keywords naturally included in content
8. tags: 5-8 descriptive tags (lowercase, hyphenated)

Return ONLY valid JSON, no markdown fences:
{
  "title": "...",
  "excerpt": "...",
  "content": "full markdown article here...",
  "og_title": "...",
  "og_description": "...",
  "target_keyword": "${input.keyword}",
  "secondary_keywords": ["...", "..."],
  "tags": ["...", "..."]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0]?.message?.content || "";
    const generated = JSON.parse(raw) as {
      title: string;
      excerpt: string;
      content: string;
      og_title: string;
      og_description: string;
      target_keyword: string;
      secondary_keywords: string[];
      tags: string[];
    };

    if (!generated.title || !generated.content || generated.content.length < 400) {
      return { success: false, error: "Generated content too short or missing title" };
    }

    const readingTime = estimateReadingTime(generated.content);
    const now = new Date().toISOString();

    const { data: inserted, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title: generated.title,
        excerpt: generated.excerpt || "",
        content: generated.content,
        category,
        status: "published",
        tags: generated.tags || [],
        tool_slug: input.tool_slug || null,
        reading_time_minutes: readingTime,
        og_title: generated.og_title || generated.title,
        og_description: generated.og_description || generated.excerpt,
        target_keyword: input.keyword,
        secondary_keywords: generated.secondary_keywords || [],
        published_at: now,
        created_at: now,
        updated_at: now,
        source: input.source || "auto-pipeline",
      })
      .select("id")
      .single();

    if (insertError) return { success: false, error: insertError.message };

    // Ping IndexNow + Google sitemap
    await indexNewPage(slug, "tools").catch(() => null);

    return { success: true, slug, title: generated.title };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Generation failed" };
  }
}

// Batch generate blog topics from GSC or Serper signals
export type BlogTopic = {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  priority: "high" | "medium" | "low";
  reason: string;
};

// Blog seed topics — long-tail how-to articles that rank fast
export const BLOG_SEED_TOPICS: BlogTopic[] = [
  // How-to articles linked to tools
  { keyword: "how to minify html online", tool_slug: "html-minifier", tool_name: "HTML Minifier", priority: "high", reason: "high search volume, tool exists" },
  { keyword: "how to validate email addresses in bulk", tool_slug: "email-validator", tool_name: "Email Validator", priority: "high", reason: "developer need" },
  { keyword: "how to generate css box shadow", tool_slug: "box-shadow-generator", tool_name: "Box Shadow Generator", priority: "high", reason: "design tool" },
  { keyword: "how to calculate emi for home loan india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", priority: "high", reason: "high India traffic" },
  { keyword: "how to calculate gst india 2025", tool_slug: "gst-calculator", tool_name: "GST Calculator", priority: "high", reason: "India finance" },
  { keyword: "how to format json online", tool_slug: "json-formatter", tool_name: "JSON Formatter", priority: "high", reason: "developer daily need" },
  { keyword: "how to encode decode base64 online", tool_slug: "base64-encoder", tool_name: "Base64 Encoder", priority: "high", reason: "developer tool" },
  { keyword: "how to generate qr code for free", tool_slug: "qr-generator", tool_name: "QR Generator", priority: "high", reason: "universal demand" },
  { keyword: "how to calculate bmi online", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", priority: "high", reason: "health query" },
  { keyword: "how to calculate sip returns india", tool_slug: "sip-calculator", tool_name: "SIP Calculator", priority: "high", reason: "investment India" },
  // Guides
  { keyword: "best free json formatter tools 2025", tool_slug: "json-formatter", tool_name: "JSON Formatter", priority: "medium", reason: "comparison" },
  { keyword: "complete guide to income tax calculation india fy 2025-26", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", priority: "high", reason: "annual India SEO" },
  { keyword: "best free password generators online", tool_slug: "password-generator", tool_name: "Password Generator", priority: "medium", reason: "security" },
  { keyword: "how to use regex tester online", tool_slug: "regex-tester", tool_name: "Regex Tester", priority: "medium", reason: "developer" },
  { keyword: "what is compound interest and how to calculate it", tool_slug: "compound-interest-calculator", tool_name: "Compound Interest Calculator", priority: "medium", reason: "finance education" },
];

// Derive blog topics from GSC queries that have position 4-20 (opportunity zone)
export async function deriveBlogTopicsFromGSC(
  siteUrl: string,
  accessToken: string
): Promise<BlogTopic[]> {
  const { fetchSearchConsoleQueries } = await import("@/lib/trend-intelligence");
  const queries = await fetchSearchConsoleQueries(siteUrl, accessToken, 28);

  return queries
    .filter(q => q.position >= 4 && q.position <= 20 && q.impressions > 50)
    .slice(0, 20)
    .map(q => ({
      keyword: q.query,
      priority: q.position <= 10 ? "high" : "medium" as "high" | "medium",
      reason: `GSC: pos ${q.position.toFixed(1)}, ${q.impressions} imps`,
    }));
}