import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import ListingSidebar from "@/components/layout/ListingSidebar";
import AdSlot from "@/components/ads/AdSlot";
import { getTools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { filterVisibleTools } from "@/lib/visibility";
import { buildHomepageTaxonomy, filterItemsByGroup } from "@/lib/admin-taxonomy";
import type { PublicContentItem } from "@/lib/content-pages";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Free Online Tools",
  description:
    "Free browser-based utility tools for developers, writers, marketers and students. JSON formatter, password generator, Base64 encoder, UUID generator and more. No install needed.",
};

const PAGE_SIZE = 24;

const ENGINE_ICONS: Record<string, string> = {
  "password-generator": "🔐",
  "json-formatter": "📋",
  "word-counter": "📝",
  "uuid-generator": "🆔",
  "slug-generator": "🔗",
  "base64-encoder": "🔄",
  "base64-decoder": "🔄",
  "url-encoder": "🌐",
  "text-case-converter": "🔠",
  "timestamp-converter": "⏱️",
  "regex-tester": "🔍",
  "hex-to-rgb": "🎨",
  "rgb-to-hex": "🎨",
  "sha256-generator": "🛡️",
  "md5-generator": "🛡️",
  "currency-converter": "💱",
  "password-strength-checker": "🔒",
  "random-string-generator": "⚡",
  "number-generator": "🎲",
  "unit-converter": "📐",
  "text-to-binary": "💾",
  "binary-to-text": "💾",
  "code-formatter": "💻",
};

function getToolIcon(engineType?: string | null): string {
  if (!engineType) return "⚙️";
  return ENGINE_ICONS[engineType] ?? "⚙️";
}

type Props = {
  searchParams?: Promise<{ group?: string; page?: string }>;
};

export default async function ToolsPage({ searchParams }: Props) {
  const rawTools = await getTools();
  const allTools: PublicContentItem[] = filterVisibleTools(rawTools);

  const params = (await searchParams) || {};
  const activeGroup = params.group || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const taxonomy = buildHomepageTaxonomy({ tools: allTools, calculators: [], aiTools: [] });
  const activeLabel = taxonomy.tools.find((g) => g.key === activeGroup)?.label || "";

  const filteredTools: PublicContentItem[] = activeGroup
    ? filterItemsByGroup("tools", allTools, activeGroup)
    : allTools;

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleTools = filteredTools.slice(start, start + PAGE_SIZE);

  function buildPageHref(page: number) {
    const query = new URLSearchParams();
    if (activeGroup) query.set("group", activeGroup);
    if (page > 1) query.set("page", String(page));
    const qs = query.toString();
    return qs ? `/tools?${qs}` : "/tools";
  }

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">

          {/* Main content */}
          <div>
            {/* Header */}
            <div className="mb-8 rounded-3xl border border-q-border bg-q-card p-6 md:p-8"
              style={{ boxShadow: "var(--q-shadow-md)" }}>
              <div className="badge badge-blue mb-3">⚙️ QuickFnd Directory</div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Tools</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-q-muted">
                Free browser-based utility tools for developers, writers, and everyday productivity.
                No install required.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium text-q-muted">
                  {allTools.length} tools available
                </span>
                {activeLabel && (
                  <>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      style={{ borderColor: "rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.06)", color: "var(--q-primary)" }}>
                      {activeLabel}
                    </span>
                    <Link href="/tools" className="text-xs text-q-muted underline underline-offset-2 hover:text-q-text">
                      Clear filter
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Ad */}
            <div className="mb-6 flex justify-center">
              <AdSlot type="leaderboard" />
            </div>

            {/* Grid */}
            {visibleTools.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">
                No tools found for this category yet.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="card-glow card-shine group rounded-2xl border border-q-border bg-q-card p-5"
                      style={{ boxShadow: "var(--q-shadow-sm)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                          style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.12)" }}>
                          {getToolIcon(tool.engine_type)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-q-text group-hover:text-q-primary transition-colors leading-snug">
                            {tool.name}
                          </div>
                          <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                            {getDisplayDescription("tools", tool, "card")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-q-muted opacity-50">/{tool.slug}</span>
                        <span className="text-xs font-medium text-q-primary opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
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

          {/* Sidebar */}
          <div className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
            <div className="space-y-5">
              <div className="flex justify-center">
                <AdSlot type="rectangle" label={false} />
              </div>
              <ListingSidebar activeSection="tools" />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}