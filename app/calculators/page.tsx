import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import ToolIcon from "@/components/ui/ToolIcon";
import ListingSidebar from "@/components/layout/ListingSidebar";
import { getCalculators } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import {
  buildHomepageTaxonomy,
  filterItemsByGroup,
} from "@/lib/admin-taxonomy";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Calculators | QuickFnd",
  description:
    "Explore online calculators on QuickFnd for finance, math, health, percentages, GST, EMI, and more.",
};

const PAGE_SIZE = 18;

type CalculatorItem = Awaited<ReturnType<typeof getCalculators>>[number];

type Props = {
  searchParams?: Promise<{ group?: string; page?: string }>;
};

export default async function CalculatorsPage({ searchParams }: Props) {
  const allCalculators = await getCalculators();

  const params = (await searchParams) || {};
  const activeGroup = params.group || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const taxonomy = buildHomepageTaxonomy({
    tools: [],
    calculators: allCalculators,
    aiTools: [],
  });

  const activeLabel =
    taxonomy.calculators.find((group) => group.key === activeGroup)?.label || "";

  const filteredCalculators: CalculatorItem[] = activeGroup
    ? filterItemsByGroup("calculators", allCalculators, activeGroup)
    : allCalculators;

  const totalPages = Math.max(1, Math.ceil(filteredCalculators.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleCalculators = filteredCalculators.slice(start, start + PAGE_SIZE);

  function buildPageHref(page: number) {
    const query = new URLSearchParams();
    if (activeGroup) query.set("group", activeGroup);
    if (page > 1) query.set("page", String(page));
    const queryString = query.toString();
    return queryString ? `/calculators?${queryString}` : "/calculators";
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

              <h1 className="mt-4 text-3xl font-bold md:text-5xl">Calculators</h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                Explore QuickFnd calculators for finance, math, percentages,
                health, tax, and everyday planning.
              </p>

              {activeLabel ? (
                <div className="mt-6 flex items-center gap-3">
                  <span className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
                    Filter: {activeLabel}
                  </span>

                  <Link
                    href="/calculators"
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Clear filter
                  </Link>
                </div>
              ) : null}
            </div>

            {visibleCalculators.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
                No calculators found for this category yet.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleCalculators.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/calculators/${tool.slug}`}
                      className="group rounded-2xl border border-q-border bg-q-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <ToolIcon type="calculator" />

                        <div className="min-w-0">
                          <div className="text-base font-semibold text-q-text group-hover:text-blue-500">
                            {tool.name}
                          </div>

                          <div className="mt-1 text-sm text-q-muted">
                            /{tool.slug}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-q-muted">
                            {getDisplayDescription("calculators", tool, "card")}
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
            <ListingSidebar activeSection="calculators" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}