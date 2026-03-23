import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import ToolIcon from "@/components/ui/ToolIcon";
import ListingSidebar from "@/components/layout/ListingSidebar";
import AdSlot from "@/components/ads/AdSlot";
import { getAITools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { filterVisibleAITools } from "@/lib/visibility";
import {
  buildHomepageTaxonomy,
  filterItemsByGroup,
} from "@/lib/admin-taxonomy";
import type { PublicContentItem } from "@/lib/content-pages";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "AI Tools Directory | QuickFnd",
  description:
    "Explore AI-powered tools on QuickFnd for writing, email, blog outlines, prompts, and content productivity. Free browser-based AI utilities.",
};

const PAGE_SIZE = 18;

type Props = {
  searchParams?: Promise<{ group?: string; page?: string }>;
};

export default async function AIToolsPage({ searchParams }: Props) {
  const rawAITools = await getAITools();
  // Apply visibility filter — counts now match sidebar
  const allAITools: PublicContentItem[] = filterVisibleAITools(rawAITools);

  const params = (await searchParams) || {};
  const activeGroup = params.group || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const taxonomy = buildHomepageTaxonomy({
    tools: [],
    calculators: [],
    aiTools: allAITools,
  });

  const activeLabel =
    taxonomy.aiTools.find((group) => group.key === activeGroup)?.label || "";

  const filteredAITools: PublicContentItem[] = activeGroup
    ? filterItemsByGroup("aiTools", allAITools, activeGroup)
    : allAITools;

  const totalPages = Math.max(1, Math.ceil(filteredAITools.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleAITools = filteredAITools.slice(start, start + PAGE_SIZE);

  function buildPageHref(page: number) {
    const query = new URLSearchParams();
    if (activeGroup) query.set("group", activeGroup);
    if (page > 1) query.set("page", String(page));
    const queryString = query.toString();
    return queryString ? `/ai-tools?${queryString}` : "/ai-tools";
  }

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
                QuickFnd Directory
              </p>

              <h1 className="mt-4 text-3xl font-bold md:text-5xl">AI Tools</h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                Free AI-powered tools for writing, email drafting, blog outlines,
                prompt generation, and content productivity workflows.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-muted">
                  {allAITools.length} AI tools
                </span>
              </div>

              {activeLabel ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
                    Filter: {activeLabel}
                  </span>
                  <Link
                    href="/ai-tools"
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Clear filter
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Ad slot — top of listing */}
            <div className="mb-6 flex justify-center">
              <AdSlot type="leaderboard" />
            </div>

            {visibleAITools.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
                No AI tools found for this category yet.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleAITools.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/ai-tools/${item.slug}`}
                      className="group rounded-2xl border border-q-border bg-q-card p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <ToolIcon type="ai" />
                        <div className="min-w-0">
                          <div className="text-lg font-semibold text-q-text group-hover:text-blue-500">
                            {item.name}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-q-muted">
                            {getDisplayDescription("ai_tools", item, "card")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 flex justify-center gap-2">
                  {safePage > 1 ? (
                    <Link
                      href={buildPageHref(safePage - 1)}
                      className="rounded-lg border border-q-border bg-q-card px-3 py-1 text-sm transition hover:bg-q-card-hover"
                    >
                      ←
                    </Link>
                  ) : null}
                  <span className="rounded-lg border border-q-border bg-q-card px-3 py-1 text-sm">
                    {safePage} / {totalPages}
                  </span>
                  {safePage < totalPages ? (
                    <Link
                      href={buildPageHref(safePage + 1)}
                      className="rounded-lg border border-q-border bg-q-card px-3 py-1 text-sm transition hover:bg-q-card-hover"
                    >
                      →
                    </Link>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <div className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <div className="space-y-6">
              {/* Sidebar ad */}
              <div className="flex justify-center">
                <AdSlot type="rectangle" />
              </div>
              <ListingSidebar activeSection="ai-tools" />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}