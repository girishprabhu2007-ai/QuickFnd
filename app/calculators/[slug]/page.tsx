import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuiltInCalculatorClient from "@/components/calculators/BuiltInCalculatorClient";
import JsonLd from "@/components/seo/JsonLd";
import PageSEOSections from "@/components/seo/PageSEOSections";
import { getContentItem, getRelatedContent } from "@/lib/db";
import {
  buildMetaDescription,
  buildPageTitle,
  getCategoryPath,
} from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("calculators", slug);

  if (!item) {
    return {
      title: "Calculator Not Found | QuickFnd",
      description: "The requested calculator could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/calculators/${item.slug}`;
  const title = buildPageTitle(item, "calculators");
  const description = buildMetaDescription(item, "calculators");

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "QuickFnd",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CalculatorDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("calculators", slug);

  if (!item) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${getCategoryPath("calculators")}/${item.slug}`;

  const relatedItems = await getRelatedContent(
    "calculators",
    item.related_slugs,
    item.slug
  );

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <JsonLd
        id="calculator-breadcrumb-schema"
        data={buildBreadcrumbSchema("calculators", item)}
      />
      <JsonLd
        id="calculator-faq-schema"
        data={buildFaqSchema("calculators", item)}
      />
      <JsonLd
        id="calculator-software-schema"
        data={buildSoftwareSchema("calculators", item)}
      />

      <section className="mx-auto max-w-6xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-q-muted">
          <Link href="/" className="hover:text-q-text">
            Home
          </Link>
          <span>/</span>
          <Link href="/calculators" className="hover:text-q-text">
            Calculators
          </Link>
          <span>/</span>
          <span className="text-q-text">{item.name}</span>
        </nav>

        <div className="mb-10">
          <Link
            href="/calculators"
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            ← Back to calculators
          </Link>

          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Calculator
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl">
            {item.name}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            {item.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <BuiltInCalculatorClient item={item} />

          <aside className="space-y-6">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">
                About this calculator
              </h2>
              <p className="mt-4 text-sm leading-7 text-q-muted">
                {item.name} is published as a live QuickFnd calculator page
                with metadata, internal links, and engine-based rendering.
              </p>
            </section>

            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">
                Calculator details
              </h2>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="text-q-muted">Slug</dt>
                  <dd className="mt-1 text-q-text">{item.slug}</dd>
                </div>
                <div>
                  <dt className="text-q-muted">Category</dt>
                  <dd className="mt-1 text-q-text">Calculator</dd>
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
          <PageSEOSections table="calculators" item={item} />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-q-text">
            Related calculators
          </h2>

          {relatedItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
              No related calculators available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedItems.map((related) => (
                <Link
                  key={related.slug}
                  href={`/calculators/${related.slug}`}
                  className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                >
                  <h3 className="text-lg font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                    {related.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-q-muted">
                    {related.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                    Open calculator →
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