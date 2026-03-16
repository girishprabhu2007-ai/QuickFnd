import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import { getTools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import {
  buildHomepageTaxonomy,
  filterItemsByGroup,
} from "@/lib/admin-taxonomy";
import type { PublicContentItem } from "@/lib/content-pages";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tools | QuickFnd",
  description:
    "Explore browser-based utility tools on QuickFnd for text, code, formatting, generation, conversion, and productivity workflows.",
};

type Props = {
  searchParams?: Promise<{ group?: string }>;
};

export default async function ToolsPage({ searchParams }: Props) {
  const tools: PublicContentItem[] = await getTools();
  const params = (await searchParams) || {};
  const activeGroup = params.group || "";

  const filteredTools: PublicContentItem[] = activeGroup
    ? filterItemsByGroup("tools", tools, activeGroup)
    : tools;

  const taxonomy = buildHomepageTaxonomy({
    tools,
    calculators: [],
    aiTools: [],
  });

  const activeLabel =
    taxonomy.tools.find((group) => group.key === activeGroup)?.label || "";

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
                QuickFnd Directory
              </p>

              <h1 className="mt-4 text-3xl font-bold md:text-5xl">Tools</h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                Explore browser-based utility tools for developers, writers,
                marketers, students, and everyday productivity workflows.
              </p>

              {activeLabel ? (
                <div className="mt-6 flex items-center gap-3">
                  <span className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
                    Filter: {activeLabel}
                  </span>

                  <Link
                    href="/tools"
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Clear filter
                  </Link>
                </div>
              ) : null}
            </div>

            {filteredTools.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
                No tools found for this category yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                  >
                    <h2 className="text-xl font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                      {tool.name}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("tools", tool, "card")}
                    </p>

                    <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                      Open tool →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">Tool categories</h2>

              <div className="mt-4 space-y-2">
                {taxonomy.tools.map((group) => (
                  <Link
                    key={group.key}
                    href={`/tools?group=${group.key}`}
                    className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
                  >
                    <span>{group.label}</span>
                    <span className="text-q-muted">{group.count}</span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}