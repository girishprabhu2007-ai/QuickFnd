import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuiltInCalculatorClient from "@/components/calculators/BuiltInCalculatorClient";
import { getContentItem, getRelatedContent } from "@/lib/db";
import {
  buildMetaDescription,
  buildPageTitle,
  getCategoryPath,
  getSiteUrl,
} from "@/lib/content-pages";

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

  const relatedItems = await getRelatedContent(
    "calculators",
    item.related_slugs,
    item.slug
  );

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <Link
            href="/calculators"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to calculators
          </Link>
          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-blue-400">
            QuickFnd Calculator
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{item.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-400">
            {item.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <BuiltInCalculatorClient item={item} />

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-xl font-semibold">About this calculator</h2>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                {item.name} is published as a live QuickFnd calculator page with
                metadata, internal links, and engine-based rendering.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-xl font-semibold">Calculator details</h2>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Slug</dt>
                  <dd className="mt-1 text-gray-200">{item.slug}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="mt-1 text-gray-200">Calculator</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Engine</dt>
                  <dd className="mt-1 text-gray-200">{item.engine_type || "auto"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">URL</dt>
                  <dd className="mt-1 break-all text-gray-200">
                    {getSiteUrl() + getCategoryPath("calculators") + "/" + item.slug}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Related calculators</h2>
          {relatedItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 text-gray-400">
              No related calculators available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedItems.map((related) => (
                <Link
                  key={related.slug}
                  href={`/calculators/${related.slug}`}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
                >
                  <h3 className="text-lg font-semibold">{related.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {related.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-400">
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