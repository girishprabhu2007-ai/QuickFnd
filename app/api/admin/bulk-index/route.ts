import { NextResponse } from "next/server";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { filterVisibleTools, filterVisibleCalculators, filterVisibleAITools } from "@/lib/visibility";
import { getAllPublishedSlugs } from "@/lib/blog";
import { getPublishedComparisonSlugs } from "@/lib/comparisons";
import { indexMultiplePages } from "@/lib/index-now";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const [rawTools, rawCalcs, rawAI, blogSlugs] = await Promise.all([
      getTools(),
      getCalculators(),
      getAITools(),
      getAllPublishedSlugs().catch(() => []),
    ]);

    const comparisonSlugs = await getPublishedComparisonSlugs().catch(() => []);

    const tools = filterVisibleTools(rawTools);
    const calculators = filterVisibleCalculators(rawCalcs);
    const aiTools = filterVisibleAITools(rawAI);

    const items: { slug: string; type: "tools" | "calculators" | "ai-tools" }[] = [];

    for (const t of tools) items.push({ slug: t.slug, type: "tools" });
    for (const c of calculators) items.push({ slug: c.slug, type: "calculators" });
    for (const a of aiTools) items.push({ slug: a.slug, type: "ai-tools" });

    const allErrors: string[] = [];
    let totalSubmitted = 0;

    for (let i = 0; i < items.length; i += 100) {
      const batch = items.slice(i, i + 100);
      const result = await indexMultiplePages(batch);
      totalSubmitted += result.submitted;
      allErrors.push(...result.errors);
      if (i + 100 < items.length) await new Promise(r => setTimeout(r, 1000));
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
    const indexNowKey = process.env.INDEXNOW_KEY || "";

    if (indexNowKey) {
      const extraUrls = [
        ...blogSlugs.map(b => `${siteUrl}/blog/${b.slug}`),
        ...comparisonSlugs.map(s => `${siteUrl}/compare/${s}`),
        `${siteUrl}/`,
        `${siteUrl}/tools`,
        `${siteUrl}/calculators`,
        `${siteUrl}/ai-tools`,
        `${siteUrl}/blog`,
        `${siteUrl}/topics`,
        `${siteUrl}/compare`,
      ];

      const payload = {
        host: siteUrl.replace("https://", "").replace("http://", ""),
        key: indexNowKey,
        keyLocation: `${siteUrl}/${indexNowKey}.txt`,
        urlList: extraUrls,
      };

      for (const engine of ["https://www.bing.com/indexnow", "https://yandex.com/indexnow"]) {
        try {
          const res = await fetch(engine, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000),
          });
          if (res.ok || res.status === 202) totalSubmitted += extraUrls.length;
          else allErrors.push(`${engine}: ${res.status}`);
        } catch (e) {
          allErrors.push(`${engine}: ${e instanceof Error ? e.message : "error"}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        tools: tools.length,
        calculators: calculators.length,
        ai_tools: aiTools.length,
        blog_posts: blogSlugs.length,
        total_urls_submitted: totalSubmitted,
        errors: allErrors,
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}