import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import ListingSidebar from "@/components/layout/ListingSidebar";
import AdSlot from "@/components/ads/AdSlot";
import { getAITools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { filterVisibleAITools } from "@/lib/visibility";
import { buildHomepageTaxonomy, filterItemsByGroup } from "@/lib/admin-taxonomy";
import type { PublicContentItem } from "@/lib/content-pages";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free AI Tools",
  description:
    "Free AI-powered tools for writing, email drafting, blog outlines, and content productivity. No account needed — run directly in your browser.",
};

const PAGE_SIZE = 18;

const AI_ICONS: Record<string, string> = {
  "ai-email-writer": "📧",
  "ai-prompt-generator": "💡",
  "ai-blog-outline-generator": "📝",
  "blog-outline-generator": "📝",
  "content-idea-generator": "🎯",
  "seo-content-optimizer": "📈",
};

function getAIIcon(slug: string): string {
  return AI_ICONS[slug] ?? "✨";
}

type Props = {
  searchParams?: Promise<{ group?: string; page?: string }>;
};

export default async function AIToolsPage({ searchParams }: Props) {
  const rawAITools = await getAITools();
  const allAITools: PublicContentItem[] = filterVisibleAITools(rawAITools);

  const params = (await searchParams) || {};
  const activeGroup = params.group || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const taxonomy = buildHomepageTaxonomy({ tools: [], calculators: [], aiTools: allAITools });
  const activeLabel = taxonomy.aiTools.find((g) => g.key === activeGroup)?.label || "";

  const filteredAI: PublicContentItem[] = activeGroup
    ? filterItemsByGroup("aiTools", allAITools, activeGroup)
    : allAITools;

  // Sort: active featured tools float to top
  const now = new Date().toISOString();
  filteredAI.sort((a, b) => {
    const aFeatured = a.is_featured && (!a.featured_until || a.featured_until > now);
    const bFeatured = b.is_featured && (!b.featured_until || b.featured_until > now);
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAI.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleAI = filteredAI.slice(start, start + PAGE_SIZE);

  function buildPageHref(page: number) {
    const query = new URLSearchParams();
    if (activeGroup) query.set("group", activeGroup);
    if (page > 1) query.set("page", String(page));
    const qs = query.toString();
    return qs ? `/ai-tools?${qs}` : "/ai-tools";
  }

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">

          <div>
            {/* Hero banner for AI tools */}
            <div className="mb-8 overflow-hidden rounded-3xl border border-q-border"
              style={{ background: "var(--q-gradient-hero)", boxShadow: "var(--q-shadow-lg)" }}>
              <div className="p-6 md:p-8">
                <div className="badge badge-green mb-3">✨ AI-Powered</div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">AI Tools</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
                  Free AI-powered tools for writing, email, outlines, and content workflows.
                  No account needed.
                </p>
                <div className="mt-4">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                    {allAITools.length} AI tools available
                  </span>
                  {activeLabel && (
                    <span className="ml-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                      {activeLabel} ·{" "}
                      <Link href="/ai-tools" className="underline underline-offset-2">Clear</Link>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <AdSlot type="leaderboard" />
            </div>

            {visibleAI.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">
                No AI tools found for this category yet.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleAI.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/ai-tools/${item.slug}`}
                      className="card-glow card-shine group rounded-2xl border border-q-border bg-q-card p-5"
                      style={{ boxShadow: "var(--q-shadow-sm)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                          {getAIIcon(item.slug)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-q-text group-hover:text-q-primary transition-colors leading-snug">
                            {item.name}
                          </div>
                          <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                            {getDisplayDescription("ai_tools", item, "card")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full border border-q-border bg-q-bg px-2 py-0.5 text-[10px] text-q-muted">AI</span>
                          {item.is_featured && (!item.featured_until || item.featured_until > new Date().toISOString()) && (
                            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-q-primary opacity-0 group-hover:opacity-100 transition-opacity">Try it →</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {safePage > 1 && (
                      <Link href={buildPageHref(safePage - 1)}
                        className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover">
                        ← Prev
                      </Link>
                    )}
                    <span className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm text-q-muted">
                      Page {safePage} of {totalPages}
                    </span>
                    {safePage < totalPages && (
                      <Link href={buildPageHref(safePage + 1)}
                        className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover">
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
            <div className="space-y-5">
              <div className="flex justify-center">
                <AdSlot type="rectangle" label={false} />
              </div>
              <ListingSidebar activeSection="ai-tools" />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}