import Link from "next/link";
import type { PublicContentItem, PublicTable } from "@/lib/content-pages";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { getDisplayDescription } from "@/lib/display-content";

type Props = {
  table: PublicTable;
  page: ProgrammaticPage;
  item: PublicContentItem;
  relatedItems: PublicContentItem[];
};

export default function ProgrammaticLandingPage({
  table,
  page,
  item,
  relatedItems,
}: Props) {
  const mainItemHref =
    table === "tools"
      ? `/tools/${item.slug}`
      : table === "calculators"
      ? `/calculators/${item.slug}`
      : `/ai-tools/${item.slug}`;

  const openLabel =
    table === "tools"
      ? "Open tool"
      : table === "calculators"
      ? "Open calculator"
      : "Open AI tool";

  const relatedBasePath =
    table === "tools"
      ? "/tools"
      : table === "calculators"
      ? "/calculators"
      : "/ai-tools";

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-q-muted">
          {page.breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.href}-${crumb.name}`} className="flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              {index === page.breadcrumbs.length - 1 ? (
                <span className="text-q-text">{crumb.name}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-q-text">
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Topic Page
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">{page.heading}</h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            {page.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={mainItemHref}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              {openLabel}
            </Link>
            <Link
              href={relatedBasePath}
              className="rounded-xl border border-q-border bg-q-bg px-5 py-3 text-sm font-semibold text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
            >
              Browse more
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-q-text">
                Why people search for {page.keyword}
              </h2>
              <p className="mt-4 text-base leading-7 text-q-muted">
                This page exists to match a more specific search intent around{" "}
                {item.name}. Instead of sending users straight into a generic listing,
                QuickFnd gives them a focused landing page with context, FAQs, and a
                direct route into the main page.
              </p>
            </section>

            <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-q-text">
                Benefits of this page
              </h2>
              <div className="mt-4 grid gap-4">
                {page.benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-xl border border-q-border bg-q-bg p-4"
                  >
                    <p className="text-sm leading-7 text-q-muted md:text-base">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-q-text">
                Frequently asked questions
              </h2>
              <div className="mt-4 space-y-4">
                {page.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="rounded-xl border border-q-border bg-q-bg p-4"
                  >
                    <summary className="cursor-pointer list-none text-base font-semibold text-q-text">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">Main page</h2>
              <p className="mt-3 text-sm leading-7 text-q-muted">
                This topic page is built around <strong>{item.name}</strong>.
              </p>
              <p className="mt-3 text-sm leading-7 text-q-muted">
                {getDisplayDescription(table, item, "detail")}
              </p>
              <Link
                href={mainItemHref}
                className="mt-4 inline-flex text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                Go to {item.name} →
              </Link>
            </section>

            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">Related pages</h2>

              {relatedItems.length === 0 ? (
                <p className="mt-3 text-sm leading-7 text-q-muted">
                  No related items available yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {relatedItems.slice(0, 4).map((related) => {
                    const href = `${relatedBasePath}/${related.slug}`;

                    return (
                      <Link
                        key={related.slug}
                        href={href}
                        className="block rounded-xl border border-q-border bg-q-bg p-4 transition hover:border-blue-400/50 hover:bg-q-card-hover"
                      >
                        <h3 className="text-base font-semibold text-q-text">
                          {related.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-q-muted">
                          {getDisplayDescription(table, related, "card")}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}