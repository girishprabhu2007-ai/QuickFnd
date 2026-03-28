import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import JsonLd from "@/components/seo/JsonLd";
import SiteFooter from "@/components/site/SiteFooter";
import AdSlot from "@/components/ads/AdSlot";
import EmailCapture from "@/components/email/EmailCapture";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 60;

type ComparisonPage = {
  id: number;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  tool_a_slug: string;
  tool_a_name: string;
  tool_a_type: string;
  tool_b_slug: string;
  tool_b_name: string;
  tool_b_type: string;
  intro: string | null;
  tool_a_pros: string[];
  tool_a_cons: string[];
  tool_b_pros: string[];
  tool_b_cons: string[];
  verdict: string | null;
  faqs: { question: string; answer: string }[];
  created_at: string;
  updated_at: string;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getComparison(slug: string): Promise<ComparisonPage | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comparison_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data as ComparisonPage;
}

async function getAllComparisonSlugs(): Promise<string[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("comparison_pages")
    .select("slug")
    .eq("status", "published");
  return (data || []).map((r) => String(r.slug));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllComparisonSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();
  const page = await getComparison(slug);
  if (!page) return { title: "Comparison Not Found" };

  const title = page.meta_title || `${page.title} — Honest Comparison | QuickFnd`;
  const description =
    page.meta_description ||
    `Compare ${page.tool_a_name} vs ${page.tool_b_name}. Honest pros, cons, and verdict to help you choose the right tool.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/compare/${slug}` },
    openGraph: {
      url: `${siteUrl}/compare/${slug}`,
      title,
      description,
      images: [
        {
          url: `${siteUrl}/api/og?title=${encodeURIComponent(page.title)}&subtitle=${encodeURIComponent("Honest Comparison")}&type=compare`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

function toolHref(slug: string, type: string): string {
  if (type === "external") return "#";
  if (type === "ai-tools" || type === "ai_tools") return `/ai-tools/${slug}`;
  if (type === "calculators") return `/calculators/${slug}`;
  return `/tools/${slug}`;
}

function isInternal(type: string): boolean {
  return type !== "external";
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const page = await getComparison(slug);
  if (!page) notFound();

  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${siteUrl}/compare` },
      { "@type": "ListItem", position: 3, name: page.title, item: `${siteUrl}/compare/${slug}` },
    ],
  };

  const faqSchema =
    page.faqs && page.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <JsonLd id="breadcrumb" data={breadcrumbSchema} />
      {faqSchema && <JsonLd id="faq" data={faqSchema} />}

      <article className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-q-muted">
          <Link href="/" className="hover:text-q-text transition">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:text-q-text transition">Compare</Link>
          <span>/</span>
          <span className="text-q-text">{page.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-amber-300/40 bg-amber-50/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-300">
            Comparison
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-q-text md:text-4xl">
            {page.title}
          </h1>
          {page.intro && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted">
              {page.intro}
            </p>
          )}
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tool A */}
          <div className="rounded-2xl border border-blue-200/50 bg-blue-50/30 p-6 dark:border-blue-800/40 dark:bg-blue-900/10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-600 dark:text-blue-400">
                A
              </div>
              <div>
                <h2 className="text-lg font-semibold text-q-text">{page.tool_a_name}</h2>
                {isInternal(page.tool_a_type) && (
                  <Link
                    href={toolHref(page.tool_a_slug, page.tool_a_type)}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Try it free →
                  </Link>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                Pros
              </h3>
              <ul className="space-y-2">
                {page.tool_a_pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-q-text">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-500 dark:text-red-400">
                Cons
              </h3>
              <ul className="space-y-2">
                {page.tool_a_cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-q-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tool B */}
          <div className="rounded-2xl border border-purple-200/50 bg-purple-50/30 p-6 dark:border-purple-800/40 dark:bg-purple-900/10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-lg text-purple-600 dark:text-purple-400">
                B
              </div>
              <div>
                <h2 className="text-lg font-semibold text-q-text">{page.tool_b_name}</h2>
                {isInternal(page.tool_b_type) && (
                  <Link
                    href={toolHref(page.tool_b_slug, page.tool_b_type)}
                    className="text-xs text-purple-600 hover:underline dark:text-purple-400"
                  >
                    Try it free →
                  </Link>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                Pros
              </h3>
              <ul className="space-y-2">
                {page.tool_b_pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-q-text">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-500 dark:text-red-400">
                Cons
              </h3>
              <ul className="space-y-2">
                {page.tool_b_cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-q-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Verdict */}
        {page.verdict && (
          <section className="mt-8 rounded-2xl border border-amber-200/50 bg-amber-50/30 p-6 dark:border-amber-700/40 dark:bg-amber-900/10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
              Our Verdict
            </h2>
            <p className="text-base leading-7 text-q-text">{page.verdict}</p>
          </section>
        )}

        <AdSlot type="in-article" className="my-8" />

        {/* FAQs */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-6 text-xl font-semibold text-q-text">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {page.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-q-border bg-q-card p-5 transition-colors hover:bg-q-card-hover"
                >
                  <summary className="cursor-pointer text-sm font-medium leading-6 text-q-text">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-q-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-10 flex flex-wrap gap-3">
          {isInternal(page.tool_a_type) && (
            <Link
              href={toolHref(page.tool_a_slug, page.tool_a_type)}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              Try {page.tool_a_name} Free →
            </Link>
          )}
          <Link
            href="/compare"
            className="rounded-xl border border-q-border bg-q-bg px-5 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Browse All Comparisons
          </Link>
        </section>

        <div className="mt-10"><EmailCapture /></div>
      </article>

      <SiteFooter />
    </main>
  );
}
