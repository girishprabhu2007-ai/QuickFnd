import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import DetailSidebar from "@/components/layout/DetailSidebar";
import PageSEOSections from "@/components/seo/PageSEOSections";
import ShareMenu from "@/components/seo/ShareMenu";
import type { ReactNode } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import { getDisplayDescription } from "@/lib/display-content";
import { getSiteUrl } from "@/lib/site-url";

type TableName = "tools" | "calculators" | "ai_tools";

type Props = {
  table: TableName;
  item: PublicContentItem;
  relatedItems: PublicContentItem[];
  primaryContent?: ReactNode;
  secondaryContent?: ReactNode;
  showRelatedItemsSection?: boolean;
};

type FaqItem = {
  question: string;
  answer: string;
};

function tableLabel(table: TableName) {
  if (table === "tools") return "Tools";
  if (table === "calculators") return "Calculators";
  return "AI Tools";
}

function singularLabel(table: TableName) {
  if (table === "tools") return "tool";
  if (table === "calculators") return "calculator";
  return "AI tool";
}

function tableSection(table: TableName): "tools" | "calculators" | "ai-tools" {
  if (table === "tools") return "tools";
  if (table === "calculators") return "calculators";
  return "ai-tools";
}

function detailHref(table: TableName, slug: string) {
  if (table === "tools") return `/tools/${slug}`;
  if (table === "calculators") return `/calculators/${slug}`;
  return `/ai-tools/${slug}`;
}

function listingHref(table: TableName) {
  if (table === "tools") return "/tools";
  if (table === "calculators") return "/calculators";
  return "/ai-tools";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function asFaqArray(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const question = String(record.question || "").trim();
      const answer = String(record.answer || "").trim();

      if (!question || !answer) return null;

      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
}

function getItemFaqs(item: PublicContentItem): FaqItem[] {
  const source = (item as Record<string, unknown>).faqs;
  return asFaqArray(source);
}

function getItemHowToSteps(item: PublicContentItem): string[] {
  const source =
    (item as Record<string, unknown>).how_to_steps ??
    (item as Record<string, unknown>).steps;
  return asStringArray(source);
}

function getItemBenefits(item: PublicContentItem): string[] {
  const source = (item as Record<string, unknown>).benefits;
  return asStringArray(source);
}

export default function PublicDetailPage({
  table,
  item,
  relatedItems,
  primaryContent,
  secondaryContent,
  showRelatedItemsSection = true,
}: Props) {
  const pageDescription = getDisplayDescription(table, item);
  const faqs = getItemFaqs(item);
  const steps = getItemHowToSteps(item);
  const benefits = getItemBenefits(item);
  const hasCustomContentSections =
    steps.length > 0 || benefits.length > 0 || faqs.length > 0;
  const label = tableLabel(table);
  const single = singularLabel(table);
  const section = tableSection(table);
  const siteUrl = getSiteUrl();
  const canonicalUrl =
    table === "tools"
      ? `${siteUrl}/tools/${item.slug}`
      : table === "calculators"
        ? `${siteUrl}/calculators/${item.slug}`
        : `${siteUrl}/ai-tools/${item.slug}`;

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <div className="max-w-4xl space-y-8">
                <nav className="text-sm text-q-muted">
                  <Link href="/" className="hover:text-q-text">
                    Home
                  </Link>
                  <span className="mx-2">/</span>
                  <Link href={listingHref(table)} className="hover:text-q-text">
                    {label}
                  </Link>
                  <span className="mx-2">/</span>
                  <span className="text-q-text">{item.name}</span>
                </nav>

                <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
                    QuickFnd {label.slice(0, -1)}
                  </p>

                  <h1 className="mt-4 text-3xl font-bold md:text-5xl">{item.name}</h1>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                    {pageDescription}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
                      Slug: {item.slug}
                    </div>
                    {item.engine_type ? (
                      <div className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
                        Engine: {item.engine_type}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={listingHref(table)}
                      className="rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-q-primary-hover"
                    >
                      Browse more {label.toLowerCase()}
                    </Link>
                    <Link
                      href={`/request-tool?category=${encodeURIComponent(
                        section === "ai-tools" ? "ai-tool" : section.slice(0, -1)
                      )}&ref=${encodeURIComponent(item.slug)}`}
                      className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
                    >
                      Request a tool
                    </Link>
                  </div>

                  <ShareMenu title={item.name} url={canonicalUrl} />
                </section>

                {primaryContent ? <div className="max-w-4xl">{primaryContent}</div> : null}

                {steps.length > 0 ? (
                  <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-q-text">How to use</h2>
                    <ol className="mt-5 space-y-3">
                      {steps.map((step, index) => (
                        <li
                          key={`${item.slug}-step-${index}`}
                          className="rounded-xl border border-q-border bg-q-bg p-4 text-sm leading-7 text-q-muted"
                        >
                          <span className="font-semibold text-q-text">
                            Step {index + 1}:
                          </span>{" "}
                          {step}
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {benefits.length > 0 ? (
                  <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-q-text">
                      Why use this {single}?
                    </h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {benefits.map((benefit, index) => (
                        <div
                          key={`${item.slug}-benefit-${index}`}
                          className="rounded-xl border border-q-border bg-q-bg p-4 text-sm leading-7 text-q-muted"
                        >
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {faqs.length > 0 ? (
                  <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-q-text">
                      Frequently asked questions
                    </h2>
                    <div className="mt-5 space-y-4">
                      {faqs.map((faq, index) => (
                        <div
                          key={`${item.slug}-faq-${index}`}
                          className="rounded-xl border border-q-border bg-q-bg p-5"
                        >
                          <h3 className="text-lg font-semibold text-q-text">
                            {faq.question}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-q-muted">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {!hasCustomContentSections ? (
                  <PageSEOSections table={table} item={item} />
                ) : null}

                {showRelatedItemsSection && relatedItems.length > 0 ? (
                  <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-q-text">
                      Related {label}
                    </h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {relatedItems.map((related) => (
                        <Link
                          key={related.slug}
                          href={detailHref(table, related.slug)}
                          className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                        >
                          <div className="text-lg font-semibold text-q-text">
                            {related.name}
                          </div>
                          <p className="mt-3 text-sm leading-6 text-q-muted">
                            {getDisplayDescription(table, related, "card")}
                          </p>
                          <div className="mt-4 text-sm font-medium text-blue-500">
                            Open →
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}

                {secondaryContent ? secondaryContent : null}
              </div>
            </div>

            <div className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              <DetailSidebar section={section} item={item} />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}