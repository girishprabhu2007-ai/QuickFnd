import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BuiltInCalculatorClient from "@/components/calculators/BuiltInCalculatorClient";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import { getContentItem, getRelatedContent, getCalculators } from "@/lib/db";
import { buildMetaDescription, buildPageTitle } from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";
import {
  isContentPubliclyVisible,
  filterVisibleContent,
} from "@/lib/public-content-visibility";
import type { PublicContentItem } from "@/lib/content-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

function CalculatorFallback({
  item,
  suggestions,
}: {
  item: PublicContentItem;
  suggestions: PublicContentItem[];
}) {
  return (
    <main className="min-h-screen bg-q-bg px-4 py-10 text-q-text">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-q-border bg-q-card p-8">
          <h1 className="text-2xl font-semibold">{item.name} is being upgraded</h1>
          <p className="mt-3 text-q-muted">
            This calculator is not available yet. Try similar working calculators below.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {suggestions.map((s) => (
              <Link
                key={s.slug}
                href={`/calculators/${s.slug}`}
                className="rounded-xl border border-q-border bg-q-bg p-4"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

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

  if (!isContentPubliclyVisible(item)) {
    return {
      title: `${item.name} (Coming Soon) | QuickFnd`,
      description: item.description,
      alternates: { canonical: url },
      robots: { index: false, follow: true },
    };
  }

  const title = buildPageTitle(item, "calculators");
  const description = buildMetaDescription(item, "calculators");
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("calculators", slug);

  if (!item) notFound();

  if (!isContentPubliclyVisible(item)) {
    const all = await getCalculators();
    const suggestions = filterVisibleContent(all)
      .filter((entry) => entry.slug !== item.slug)
      .slice(0, 6);

    return <CalculatorFallback item={item} suggestions={suggestions} />;
  }

  const related = await getRelatedContent(
    "calculators",
    item.related_slugs,
    item.slug
  );

  return (
    <>
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

      <PublicDetailPage
        table="calculators"
        item={item}
        relatedItems={filterVisibleContent(related)}
        primaryContent={<BuiltInCalculatorClient item={item} />}
      />
    </>
  );
}