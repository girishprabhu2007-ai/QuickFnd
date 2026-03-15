import Link from "next/link";
import type { PublicContentItem, PublicTable } from "@/lib/content-pages";
import { getProgrammaticLinksForItem } from "@/lib/programmatic-pages";
import { buildSEOSectionData } from "@/lib/seo-content";

type Props = {
  table: PublicTable;
  item: PublicContentItem;
};

export default function PageSEOSections({ table, item }: Props) {
  const seo = buildSEOSectionData(table, item);
  const topicPages = getProgrammaticLinksForItem(table, item, 3);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">
          About {item.name}
        </h2>
        <p className="mt-4 text-base leading-7 text-q-muted">{seo.intro}</p>
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">
          Why use {item.name}?
        </h2>
        <ul className="mt-4 grid gap-3 text-sm leading-7 text-q-muted md:text-base">
          {seo.benefits.map((benefit) => (
            <li
              key={benefit}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-3"
            >
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">How to use it</h2>
        <div className="mt-4 grid gap-4">
          {seo.steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-xl border border-q-border bg-q-bg p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-q-muted md:text-base">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">Best use cases</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {seo.useCases.map((useCase) => (
            <div
              key={useCase}
              className="rounded-xl border border-q-border bg-q-bg p-4"
            >
              <p className="text-sm leading-7 text-q-muted md:text-base">
                {useCase}
              </p>
            </div>
          ))}
        </div>
      </section>

      {topicPages.length > 0 ? (
        <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-q-text">
            Popular search variations
          </h2>
          <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
            QuickFnd also organizes more specific landing pages related to{" "}
            {item.name} for different search intents.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topicPages.map((page) => (
              <Link
                key={page.slug}
                href={page.href}
                className="group rounded-xl border border-q-border bg-q-bg p-4 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.10)]"
              >
                <h3 className="text-base font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                  {page.heading}
                </h3>
                <p className="mt-2 text-sm leading-6 text-q-muted">
                  {page.description}
                </p>
                <div className="mt-3 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                  Open topic page →
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-4">
          {seo.faqs.map((faq) => (
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

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">
          Explore more {seo.categoryTitle.toLowerCase()}
        </h2>
        <p className="mt-4 text-sm leading-7 text-q-muted md:text-base">
          Continue browsing the QuickFnd{" "}
          <Link
            href={seo.categoryPath}
            className="font-medium text-blue-600 hover:underline"
          >
            {seo.categoryTitle.toLowerCase()}
          </Link>{" "}
          section for more pages related to {item.name}.
        </p>
      </section>
    </div>
  );
}