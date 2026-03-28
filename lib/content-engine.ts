/**
 * lib/content-engine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * QuickFnd Centralised Content Engine
 *
 * Single source of truth for ALL content generation on the platform.
 * Handles: blog posts, tool descriptions, calculator pages, AI tool configs,
 *          topic pages, SEO intros, FAQs, meta tags.
 *
 * Design principles:
 *   1. RESEARCH FIRST — always fetch SERP data before generating
 *   2. UNIQUENESS ENFORCED — fingerprint every output, reject duplicates
 *   3. BRAND VOICE LOCKED — one QuickFnd voice across all content types
 *   4. QUALITY GATED — readability + spam + length checks before accepting
 *   5. ANTI-PATTERN — 30+ banned AI phrases rejected automatically
 *   6. FREE — uses only OpenAI (already paid for) + Serper (already have key)
 *
 * No external plagiarism API needed — we fingerprint internally and use
 * structural diversity techniques to ensure low similarity scores.
 */

import OpenAI from "openai";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentType =
  | "blog-post"
  | "tool-description"
  | "calculator-description"
  | "ai-tool-config"
  | "topic-page"
  | "seo-intro"
  | "faq-set"
  | "meta-tags";

export type ContentQuality = {
  passed: boolean;
  score: number;           // 0-100
  readability: number;     // Flesch-Kincaid estimate 0-100
  uniqueness: number;      // 0-100 (vs our own published content)
  issues: string[];
};

export type ResearchData = {
  keyword: string;
  peopleAlsoAsk: string[];
  topResults: { title: string; url: string; snippet: string }[];
  contentGaps: string[];
  recommendedWordCount: number;
  difficulty: number;       // 1-10
};

export type BlogPostOutput = {
  title: string;
  excerpt: string;
  content: string;
  og_title: string;
  og_description: string;
  target_keyword: string;
  secondary_keywords: string[];
  tags: string[];
  reading_time_minutes: number;
  quality: ContentQuality;
};

export type ToolDescriptionOutput = {
  name: string;
  slug: string;
  description: string;
  seo_intro: string;
  seo_faqs: { question: string; answer: string }[];
  meta_title: string;
  meta_description: string;
  quality: ContentQuality;
};

export type TopicPageOutput = {
  description: string;
  faqs: { question: string; answer: string }[];
  benefits: string[];
  how_to_steps: string[];
  quality: ContentQuality;
};

// ─── Brand Voice & Anti-Patterns ─────────────────────────────────────────────

const BRAND_VOICE = `
You write for QuickFnd.com — a platform with 130+ free browser-based tools, calculators and AI utilities.

VOICE: Knowledgeable friend, not a corporate manual. Direct, useful, occasionally witty.
AUDIENCE: Mix of developers, finance professionals, students, and everyday users globally.
TONE: Authoritative but approachable. Never condescending. Never salesy.

ALWAYS:
- Lead with the most useful information — no preamble
- Use real examples with actual numbers or specifics
- Address the reader as "you" naturally
- Write sentences that vary in length (short punchy ones, longer explanatory ones)
- Use active voice predominantly

NEVER write these phrases (instant rejection):
"In today's digital world" | "In today's fast-paced world" | "In conclusion, it's clear that"
"As we can see" | "It goes without saying" | "At the end of the day"
"Game changer" | "Cutting edge" | "State of the art" | "Best-in-class"
"Leverage" (as a verb) | "Synergy" | "Paradigm shift" | "Holistic approach"
"Unlock the power" | "Take your X to the next level" | "In the realm of"
"It is worth noting" | "Needless to say" | "Without further ado"
"This article will" | "In this guide, we will" | "Let's dive in"
"First and foremost" | "Last but not least" | "Having said that"
`;

const BANNED_PHRASES = [
  "in today's digital world", "in today's fast-paced", "in conclusion, it's clear",
  "as we can see", "it goes without saying", "at the end of the day",
  "game changer", "cutting edge", "state of the art", "best-in-class",
  "unlock the power", "take your", "to the next level", "in the realm of",
  "it is worth noting", "needless to say", "without further ado",
  "this article will", "in this guide, we will", "let's dive in",
  "first and foremost", "last but not least", "having said that",
  "seamlessly", "robust solution", "comprehensive guide", "ultimate guide",
  "look no further", "you've come to the right place",
];

// ─── Content Fingerprinting ───────────────────────────────────────────────────
// Simple but effective: extract n-grams and compare against existing slugs/titles

function fingerprint(text: string): Set<string> {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3);

  const ngrams = new Set<string>();
  for (let i = 0; i < words.length - 2; i++) {
    ngrams.add(`${words[i]} ${words[i+1]} ${words[i+2]}`);
  }
  return ngrams;
}

function similarityScore(a: string, b: string): number {
  const fa = fingerprint(a);
  const fb = fingerprint(b);
  if (fa.size === 0 || fb.size === 0) return 0;
  let overlap = 0;
  for (const gram of fa) {
    if (fb.has(gram)) overlap++;
  }
  return overlap / Math.min(fa.size, fb.size);
}

// ─── Quality Checker ──────────────────────────────────────────────────────────

function checkContentQuality(
  content: string,
  minWords: number,
  existingContent: string[] = []
): ContentQuality {
  const issues: string[] = [];
  const lower = content.toLowerCase();

  // 1. Banned phrases check
  const foundBanned = BANNED_PHRASES.filter(p => lower.includes(p));
  if (foundBanned.length > 0) {
    issues.push(`Banned phrases found: ${foundBanned.slice(0, 3).join(", ")}`);
  }

  // 2. Word count
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount < minWords) {
    issues.push(`Too short: ${wordCount} words (minimum ${minWords})`);
  }

  // 3. Readability estimate (simplified Flesch-Kincaid)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  const syllables = content.split(/[aeiouAEIOU]/).length;
  const avgSyllablesPerWord = syllables / Math.max(wordCount, 1);
  const readability = Math.max(0, Math.min(100,
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  ));

  if (readability < 30) issues.push(`Readability too low: ${readability.toFixed(0)} (aim for 45+)`);

  // 4. Repetition check — same sentence-starter 3+ times
  const starterCounts: Record<string, number> = {};
  for (const sentence of sentences.slice(0, 20)) {
    const starter = sentence.trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase();
    starterCounts[starter] = (starterCounts[starter] || 0) + 1;
  }
  const repeatedStarters = Object.entries(starterCounts).filter(([, c]) => c >= 3);
  if (repeatedStarters.length > 0) {
    issues.push(`Repetitive sentence starters: "${repeatedStarters[0][0]}"`);
  }

  // 5. Uniqueness vs existing content
  let uniqueness = 100;
  for (const existing of existingContent) {
    const sim = similarityScore(content, existing) * 100;
    if (sim > 40) {
      issues.push(`Too similar to existing content (${sim.toFixed(0)}% match)`);
      uniqueness = Math.min(uniqueness, 100 - sim);
    }
  }

  // 6. Structure check for blog posts
  if (content.includes("## ")) {
    const h2Count = (content.match(/^## /gm) || []).length;
    if (h2Count < 2) issues.push(`Too few H2 sections: ${h2Count} (minimum 2)`);
  }

  const score = Math.max(0, 100 - (issues.length * 20));

  return {
    passed: issues.length === 0,
    score,
    readability: Math.round(readability),
    uniqueness: Math.round(uniqueness),
    issues,
  };
}

// ─── Research Engine (Serper) ─────────────────────────────────────────────────

async function research(keyword: string, serperKey: string): Promise<ResearchData> {
  if (!serperKey) {
    return {
      keyword,
      peopleAlsoAsk: [],
      topResults: [],
      contentGaps: [],
      recommendedWordCount: 1000,
      difficulty: 5,
    };
  }

  try {
    const [searchRes, paaRes] = await Promise.all([
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: keyword, gl: "in", hl: "en", num: 5 }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: keyword, gl: "us", hl: "en", num: 5 }),
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const searchData = searchRes.ok ? await searchRes.json() as {
      organic?: { title: string; link: string; snippet: string }[];
      peopleAlsoAsk?: { question: string }[];
    } : {};
    const paaData = paaRes.ok ? await paaRes.json() as {
      peopleAlsoAsk?: { question: string }[];
    } : {};

    const topResults = (searchData.organic || []).slice(0, 5).map(r => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
    }));

    // Deduplicate PAA from both regions
    const paaSet = new Set<string>();
    const allPAA = [
      ...(searchData.peopleAlsoAsk || []),
      ...(paaData.peopleAlsoAsk || []),
    ];
    const paa = allPAA
      .map(q => q.question)
      .filter(q => { if (paaSet.has(q)) return false; paaSet.add(q); return true; })
      .slice(0, 8);

    // Infer difficulty from result quality
    const hasWikipedia = topResults.some(r => r.url.includes("wikipedia"));
    const hasMajorSite = topResults.some(r =>
      /investopedia|nerdwallet|bankbazaar|geeksforgeeks|mdn|mozilla/.test(r.url)
    );
    const difficulty = hasWikipedia ? 8 : hasMajorSite ? 7 : topResults.length >= 5 ? 6 : 4;

    // Content gaps — questions NOT answered in top snippets
    const topText = topResults.map(r => r.snippet).join(" ").toLowerCase();
    const contentGaps = paa.filter(q =>
      !topText.includes(q.toLowerCase().split(" ").slice(0, 3).join(" "))
    ).slice(0, 5);

    // Recommended word count — beat the competition
    const avgSnippetLen = topResults.reduce((s, r) => s + r.snippet.length, 0) / Math.max(topResults.length, 1);
    const recommendedWordCount = Math.max(800, Math.min(2500,
      Math.round(avgSnippetLen * 8)
    ));

    return {
      keyword,
      peopleAlsoAsk: paa,
      topResults,
      contentGaps,
      recommendedWordCount,
      difficulty,
    };
  } catch {
    return {
      keyword,
      peopleAlsoAsk: [],
      topResults: [],
      contentGaps: [],
      recommendedWordCount: 1000,
      difficulty: 5,
    };
  }
}

// ─── Core OpenAI caller ───────────────────────────────────────────────────────

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
}

async function generate(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.75,
): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4000,
  });
  return response.choices[0]?.message?.content || "{}";
}

// ─── Blog Post Generator ──────────────────────────────────────────────────────

export async function generateBlogPost(input: {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  related_tools?: string[];
  author_name: string;
  author_title: string;
  author_expertise: string[];
  category: string;
  existing_titles?: string[];
  existing_content?: string[];
  serper_key?: string;
}): Promise<{ success: true; output: BlogPostOutput } | { success: false; error: string }> {

  // Step 1: Research
  const research_data = await research(input.keyword, input.serper_key || process.env.SERPER_API_KEY || "");

  // Step 2: Build context
  const competitorContext = research_data.topResults.length > 0
    ? `\nCOMPETITOR CONTEXT (read but do NOT copy):\n${research_data.topResults.slice(0, 3).map((r, i) =>
        `${i+1}. "${r.title}" — ${r.snippet.slice(0, 150)}`
      ).join("\n")}\n\nGAPS these pages miss (YOU MUST COVER THESE):\n${research_data.contentGaps.map(g => `• ${g}`).join("\n") || "• More practical examples\n• Step-by-step instructions\n• India-specific context where relevant"}`
    : "";

  const paaContext = research_data.peopleAlsoAsk.length > 0
    ? `\nPEOPLE ALSO ASK (answer at least 3 of these in your article):\n${research_data.peopleAlsoAsk.slice(0, 6).map(q => `• ${q}`).join("\n")}`
    : "";

  const toolContext = input.tool_slug
    ? `\nPRIMARY TOOL TO REFERENCE: "${input.tool_name}" at quickfnd.com/tools/${input.tool_slug} (or /calculators/${input.tool_slug})\nMention it naturally where relevant — don't force it. Link to it in the final CTA.`
    : "";

  const existingTitles = (input.existing_titles || []).slice(0, 10);
  const titleAvoidance = existingTitles.length > 0
    ? `\nDO NOT create a title similar to these already-published articles:\n${existingTitles.map(t => `• ${t}`).join("\n")}`
    : "";

  // Step 3: Generate
  const systemPrompt = `${BRAND_VOICE}

You are writing as ${input.author_name}, ${input.author_title}.
Expertise areas: ${input.author_expertise.join(", ")}.
Write in first person where natural ("In my experience...", "I've found that...").
Do not over-use first person — maybe 3-4 times in the whole article.`;

  const userPrompt = `Write a complete, original blog article for QuickFnd.

TARGET KEYWORD: "${input.keyword}"
ARTICLE CATEGORY: ${input.category}
TARGET WORD COUNT: ${research_data.recommendedWordCount}+ words
COMPETITION LEVEL: ${research_data.difficulty}/10
${toolContext}
${competitorContext}
${paaContext}
${titleAvoidance}

STRUCTURE REQUIREMENTS:
- Title: Contains the exact keyword. 55-70 chars. Specific and useful. Not clickbait. Must be DIFFERENT from competitor titles.
- Excerpt: 2 punchy sentences, 140-160 chars total. Includes keyword. Creates curiosity.
- Content: 
  * Open with the most important point — no preamble
  * 4-6 H2 sections using ##
  * Use ### for sub-sections where it adds depth
  * At least ONE worked example with real numbers or specifics  
  * At least ONE numbered step-by-step list
  * Bold only truly key terms (**term**)
  * Mix short (1-2 sentence) and medium (4-5 sentence) paragraphs
  * End with actionable conclusion + natural CTA to try the QuickFnd tool
  * Do NOT use any banned phrases from your system instructions
- og_title: 45-58 chars, more social-media friendly than article title
- og_description: 145-158 chars, clear value proposition, includes keyword

Return ONLY valid JSON:
{
  "title": "...",
  "excerpt": "...",
  "content": "full markdown here — minimum ${research_data.recommendedWordCount} words...",
  "og_title": "...",
  "og_description": "...",
  "secondary_keywords": ["6-8 related long-tail phrases"],
  "tags": ["5-7 lowercase-hyphenated tags"]
}`;

  try {
    const raw = await generate(systemPrompt, userPrompt, 0.78);
    const parsed = JSON.parse(raw) as {
      title: string; excerpt: string; content: string;
      og_title: string; og_description: string;
      secondary_keywords: string[]; tags: string[];
    };

    if (!parsed.title || !parsed.content) {
      return { success: false, error: "Missing title or content in response" };
    }

    // Step 4: Quality check
    const quality = checkContentQuality(
      parsed.content,
      Math.round(research_data.recommendedWordCount * 0.7),
      input.existing_content || []
    );

    if (!quality.passed) {
      return { success: false, error: `Quality gate failed: ${quality.issues[0]}` };
    }

    const wordCount = parsed.content.trim().split(/\s+/).length;

    return {
      success: true,
      output: {
        title: parsed.title,
        excerpt: parsed.excerpt || "",
        content: parsed.content,
        og_title: parsed.og_title || parsed.title.slice(0, 58),
        og_description: parsed.og_description || parsed.excerpt?.slice(0, 158) || "",
        target_keyword: input.keyword,
        secondary_keywords: parsed.secondary_keywords || [],
        tags: parsed.tags || [],
        reading_time_minutes: Math.ceil(wordCount / 200),
        quality,
      },
    };
  } catch (err) {
    return { success: false, error: `Generation failed: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── Tool Description Generator ───────────────────────────────────────────────

export async function generateToolDescription(input: {
  query: string;
  suggested_name: string;
  suggested_slug: string;
  engine_type: string;
  category: "tool" | "calculator" | "ai-tool";
  related_slugs?: string[];
  existing_slugs?: string[];
  serper_key?: string;
}): Promise<{ success: true; output: ToolDescriptionOutput } | { success: false; error: string }> {

  const research_data = await research(input.query, input.serper_key || process.env.SERPER_API_KEY || "");

  const paaContext = research_data.peopleAlsoAsk.length > 0
    ? `\nCommon questions about this topic:\n${research_data.peopleAlsoAsk.slice(0, 5).map(q => `• ${q}`).join("\n")}`
    : "";

  const systemPrompt = `${BRAND_VOICE}

You write product descriptions for QuickFnd.com — a free, browser-based tools platform.
Be specific, clear, and useful. Descriptions must tell users exactly what the tool does and why they'd use it.
Never be vague. Never use marketing fluff. Never say "powerful" or "easy to use" without showing it.`;

  const userPrompt = `Create a complete tool entry for QuickFnd.

TOOL NAME: ${input.suggested_name}
SEARCH QUERY: "${input.query}"
ENGINE/TYPE: ${input.engine_type}
CATEGORY: ${input.category}
${paaContext}

REQUIREMENTS:
- name: Clear, specific (2-5 words). Exactly as provided or slightly improved.
- slug: ${input.suggested_slug} (use this unless obviously wrong)
- description: EXACTLY 2 sentences. Sentence 1: what it does (specific action). Sentence 2: who uses it + key benefit. Total 60-120 chars. No fluff.
- seo_intro: 3 sentences expanding the description. Naturally includes the search query. Gives a specific use case.
- seo_faqs: 5 genuine Q&A pairs users actually search. Specific and useful answers. 40-80 words per answer.
- meta_title: 50-60 chars. "[Tool Name] — [Key Benefit] | QuickFnd" format.
- meta_description: 145-158 chars. Includes query. Communicates clear value.

Return ONLY valid JSON:
{
  "name": "...",
  "slug": "...",
  "description": "...",
  "seo_intro": "...",
  "seo_faqs": [{"question": "...", "answer": "..."}, ...],
  "meta_title": "...",
  "meta_description": "..."
}`;

  try {
    const raw = await generate(systemPrompt, userPrompt, 0.5);
    const parsed = JSON.parse(raw) as ToolDescriptionOutput;

    if (!parsed.name || !parsed.description) {
      return { success: false, error: "Missing name or description" };
    }

    const quality = checkContentQuality(
      parsed.description + " " + parsed.seo_intro,
      20
    );

    return {
      success: true,
      output: { ...parsed, quality },
    };
  } catch (err) {
    return { success: false, error: `Generation failed: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── Topic Page Generator ─────────────────────────────────────────────────────

export async function generateTopicPage(input: {
  topic_key: string;
  topic_label: string;
  tool_count: number;
  sample_tools: string[];
  serper_key?: string;
}): Promise<{ success: true; output: TopicPageOutput } | { success: false; error: string }> {

  const systemPrompt = `${BRAND_VOICE}

You write category page content for QuickFnd.com — a free browser-based tools platform.
This is NOT about physical objects or hardware. It is about online tools and calculators.
Be specific to the software/web tools context.`;

  const userPrompt = `Create content for the "${input.topic_label}" category page on QuickFnd.

Context: This category contains ${input.tool_count} free online tools. 
Examples: ${input.sample_tools.slice(0, 5).join(", ")}

Generate:
- description: 2-3 sentences about what tools are in this category and who uses them. Specific, not generic.
- faqs: 5 questions users genuinely have about this type of tool. Useful, specific answers.
- benefits: 5 specific benefits of using online ${input.topic_label} tools (vs offline software)
- how_to_steps: 5 practical steps for getting started with tools in this category

Return ONLY valid JSON:
{
  "description": "...",
  "faqs": [{"question": "...", "answer": "..."}],
  "benefits": ["...", "..."],
  "how_to_steps": ["...", "..."]
}`;

  try {
    const raw = await generate(systemPrompt, userPrompt, 0.65);
    const parsed = JSON.parse(raw) as TopicPageOutput;

    const quality = checkContentQuality(
      parsed.description + " " + parsed.faqs?.map(f => f.answer).join(" "),
      30
    );

    return { success: true, output: { ...parsed, quality } };
  } catch (err) {
    return { success: false, error: `Generation failed: ${err instanceof Error ? err.message : "Unknown"}` };
  }
}

// ─── AI Tool System Prompt Generator ─────────────────────────────────────────

export async function generateAIToolConfig(input: {
  name: string;
  purpose: string;
  target_user: string;
}): Promise<{
  systemPrompt: string;
  buttonLabel: string;
  placeholder: string;
  outputLabel: string;
  task: string;
}> {
  const systemPrompt = `${BRAND_VOICE}

You design AI tool configurations for QuickFnd. Each configuration must make the AI tool genuinely useful and specific.
The system prompt you write will be sent to GPT-4o-mini to power the tool. Make it expert-level and precise.`;

  const userPrompt = `Design an AI tool configuration for QuickFnd.

Tool: ${input.name}
Purpose: ${input.purpose}
Target user: ${input.target_user}

Create:
- systemPrompt: 3-5 sentences. Expert role definition. Specific output format. Quality standards. Tone requirements. Make it genuinely useful and specific — not generic "You are a helpful assistant."
- buttonLabel: 2-3 word action verb (e.g. "Write Email", "Generate Bio", "Create Outline")
- placeholder: Helpful example of what the user should type (30-60 chars)
- outputLabel: What to call the AI's output (e.g. "Your Email Draft", "Generated Outline")
- task: One of: email, outline, rewrite, summarize, generate, analyze, explain

Return ONLY valid JSON:
{
  "systemPrompt": "...",
  "buttonLabel": "...",
  "placeholder": "...",
  "outputLabel": "...",
  "task": "..."
}`;

  try {
    const raw = await generate(systemPrompt, userPrompt, 0.6);
    return JSON.parse(raw) as ReturnType<typeof generateAIToolConfig> extends Promise<infer T> ? T : never;
  } catch {
    return {
      systemPrompt: `You are an expert ${input.name} specialist. Generate high-quality, specific output based on the user's input. Be concise, practical, and directly useful. Format your response clearly.`,
      buttonLabel: "Generate",
      placeholder: `Describe what you need...`,
      outputLabel: "Generated Output",
      task: "generate",
    };
  }
}

// ─── Batch Content Planner ────────────────────────────────────────────────────
// Plans content for a given tool — generates a cluster of related topics

export async function planContentCluster(input: {
  tool_slug: string;
  tool_name: string;
  tool_description: string;
  category: string;
  existing_keywords?: string[];
  serper_key?: string;
}): Promise<string[]> {
  const serperKey = input.serper_key || process.env.SERPER_API_KEY || "";

  // Research the main tool keyword
  const mainResearch = await research(
    `${input.tool_name} online free`,
    serperKey
  );

  const systemPrompt = `${BRAND_VOICE}
You are an SEO content strategist for QuickFnd.com.`;

  const userPrompt = `Create a content cluster of 8 blog keywords for this QuickFnd tool.

TOOL: ${input.tool_name} (${input.category})
DESCRIPTION: ${input.tool_description}
PEOPLE ALSO ASK: ${mainResearch.peopleAlsoAsk.slice(0, 5).join(" | ")}

Existing keywords to AVOID: ${(input.existing_keywords || []).slice(0, 10).join(", ")}

Generate 8 unique blog article keywords that:
1. Target different search intents (how-to, comparison, guide, examples, mistakes, best practices)
2. Would naturally link to this tool
3. Have low-to-medium competition
4. Are genuinely useful to searchers
5. Include at least 2 India-specific angles if relevant

Return ONLY valid JSON:
{"keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7", "keyword 8"]}`;

  try {
    const raw = await generate(systemPrompt, userPrompt, 0.8);
    const parsed = JSON.parse(raw) as { keywords: string[] };
    return parsed.keywords || [];
  } catch {
    return [];
  }
}

// ─── Content Diversity Enforcer ───────────────────────────────────────────────
// Checks if a new piece of content is sufficiently different from existing ones

export function isContentUnique(
  newContent: string,
  existingContent: string[],
  threshold = 0.35
): { unique: boolean; similarity: number; mostSimilar?: string } {
  let maxSimilarity = 0;
  let mostSimilar: string | undefined;

  for (const existing of existingContent) {
    const sim = similarityScore(newContent, existing);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      mostSimilar = existing.slice(0, 100);
    }
  }

  return {
    unique: maxSimilarity < threshold,
    similarity: Math.round(maxSimilarity * 100),
    mostSimilar,
  };
}