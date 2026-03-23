import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import ListingSidebar from "@/components/layout/ListingSidebar";
import AdSlot from "@/components/ads/AdSlot";
import { getCalculators } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { filterVisibleCalculators } from "@/lib/visibility";
import { buildHomepageTaxonomy, filterItemsByGroup } from "@/lib/admin-taxonomy";
import type { PublicContentItem } from "@/lib/content-pages";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Free Online Calculators",
  description:
    "Free online calculators for finance, math, health, GST, EMI, loan, BMI, age, and more. Instant browser-based results — no install needed.",
};

const PAGE_SIZE = 18;

const CALC_ICONS: Record<string, string> = {
  "bmi-calculator": "❤️",
  "age-calculator": "🎂",
  "loan-calculator": "🏦",
  "emi-calculator": "💳",
  "percentage-calculator": "📊",
  "simple-interest-calculator": "💰",
  "gst-calculator": "🧾",
};

function getCalcIcon(slug: string): string {
  return CALC_ICONS[slug] ?? "🧮";
}

type Props = {
  searchParams?: Promise<{ group?: string; page?: string }>;
};

export default async function CalculatorsPage({ searchParams }: Props) {
  const rawCalcs = await getCalculators();
  const allCalculators: PublicContentItem[] = filterVisibleCalculators(rawCalcs);

  const params = (await searchParams) || {};
  const activeGroup = params.group || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const taxonomy = buildHomepageTaxonomy({ tools: [], calculators: allCalculators, aiTools: [] });
  const activeLabel = taxonomy.calculators.find((g) => g.key === activeGroup)?.label || "";

  const filteredCalcs: PublicContentItem[] = activeGroup
    ? filterItemsByGroup("calculators", allCalculators, activeGroup)
    : allCalculators;

  const totalPages = Math.max(1, Math.ceil(filteredCalcs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleCalcs = filteredCalcs.slice(start, start + PAGE_SIZE);

  function buildPageHref(page: number) {
    const query = new URLSearchParams();
    if (activeGroup) query.set("group", activeGroup);
    if (page > 1) query.set("page", String(page));
    const qs = query.toString();
    return qs ? `/calculators?${qs}` : "/calculators";
  }

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">

          <div>
            <div className="mb-8 rounded-3xl border border-q-border bg-q-card p-6 md:p-8"
              style={{ boxShadow: "var(--q-shadow-md)" }}>
              <div className="badge badge-purple mb-3">🧮 QuickFnd Directory</div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Calculators</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-q-muted">
                Free online calculators for finance, math, health, tax, and everyday planning.
                Instant results in your browser.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium text-q-muted">
                  {allCalculators.length} calculators available
                </span>
                {activeLabel && (
                  <>
                    <span className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ borderColor: "rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)", color: "var(--q-accent2)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      {activeLabel}
                    </span>
                    <Link href="/calculators" className="text-xs text-q-muted underline underline-offset-2 hover:text-q-text">
                      Clear filter
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <AdSlot type="leaderboard" />
            </div>

            {visibleCalcs.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">
                No calculators found for this category yet.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleCalcs.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/calculators/${item.slug}`}
                      className="card-glow card-shine group rounded-2xl border border-q-border bg-q-card p-5"
                      style={{ boxShadow: "var(--q-shadow-sm)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                          style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.12)" }}>
                          {getCalcIcon(item.slug)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-q-text group-hover:text-q-primary transition-colors leading-snug">
                            {item.name}
                          </div>
                          <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                            {getDisplayDescription("calculators", item, "card")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <span className="text-xs font-medium text-q-primary opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
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
              <ListingSidebar activeSection="calculators" />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}