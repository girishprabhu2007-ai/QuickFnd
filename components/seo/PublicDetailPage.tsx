import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicContentItem, PublicTable } from "@/lib/content-pages";
import { getCategoryPath } from "@/lib/content-pages";
import { getDisplayDescription } from "@/lib/display-content";
import { getSiteUrl } from "@/lib/site-url";
import PageSEOSections from "@/components/seo/PageSEOSections";

type Props = {
  table: PublicTable;
  item: PublicContentItem;
  relatedItems: PublicContentItem[];
  primaryContent: ReactNode;
};

function getCategoryTitle(table: PublicTable) {
  if (table === "tools") return "Tools";
  if (table === "calculators") return "Calculators";
  return "AI Tools";
}

function getEntityLabel(table: PublicTable) {
  if (table === "tools") return "Tool";
  if (table === "calculators") return "Calculator";
  return "AI Tool";
}

function getBackHref(table: PublicTable) {
  return getCategoryPath(table);
}

function getRelatedHref(table: PublicTable, slug: string) {
  return `${getCategoryPath(table)}/${slug}`;
}

function getAboutText(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return `${item.name} is available on QuickFnd as a live public page with its own slug, metadata, internal links, and engine-based rendering.`;
  }

  if (table === "calculators") {
    return `${item.name} is published as a live QuickFnd calculator page with metadata, internal links, and engine-based rendering.`;
  }

  return `${item.name} is published as a dedicated QuickFnd AI tool page. Some AI pages include an interactive engine, while others serve as structured discovery pages with related links and supporting content.`;
}

export default function PublicDetailPage({
  table,
  item,
  relatedItems,
  primaryContent,
}: Props) {
  const categoryTitle = getCategoryTitle(table);
  const entityLabel = getEntityLabel(table);
  const backHref = getBackHref(table);
  const pageUrl = `${getSiteUrl()}${getCategoryPath(table)}/${item.slug}`;
  const description = getDisplayDescription(table, item, "detail");

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-q-muted">
          <Link href="/" className="hover:text-q-text">
            Home
          </Link>
          <span>/</span>
          <Link href={backHref} className="hover:text-q-text">
            {categoryTitle}
          </Link>
          <span>/</span>
          <span className="text-q-text">{item.name}</span>
        </nav>

        <div className="mb-10">
          <Link
            href={backHref}
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            ← Back to {categoryTitle.toLowerCase()}
          </Link>

          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd {entityLabel}
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl">
            {item.name}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            {description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {primaryContent}

          <aside className="space-y-6">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">
                About this {entityLabel.toLowerCase()}
              </h2>
              <p className="mt-4 text-sm leading-7 text-q-muted">
                {getAboutText(table, item)}
              </p>
            </section>

            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">
                {entityLabel} details
              </h2>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="text-q-muted">Slug</dt>
                  <dd className="mt-1 text-q-text">{item.slug}</dd>
                </div>
                <div>
                  <dt className="text-q-muted">Category</dt>
                  <dd className="mt-1 text-q-text">{entityLabel}</dd>
                </div>
                <div>
                  <dt className="text-q-muted">Engine</dt>
                  <dd className="mt-1 text-q-text">
                    {item.engine_type || "auto"}
                  </dd>
                </div>
                <div>
                  <dt className="text-q-muted">URL</dt>
                  <dd className="mt-1 break-all text-q-text">{pageUrl}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <section className="mt-10">
          <PageSEOSections table={table} item={item} />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-q-text">
            Related {categoryTitle.toLowerCase()}
          </h2>

          {relatedItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
              No related {categoryTitle.toLowerCase()} available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedItems.map((related) => (
                <Link
                  key={related.slug}
                  href={getRelatedHref(table, related.slug)}
                  className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                >
                  <h3 className="text-lg font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                    {related.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-q-muted">
                    {getDisplayDescription(table, related, "card")}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                    Open {entityLabel.toLowerCase()} →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}