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
    <main className="min-h-screen bg-q-bg text-q-text">
      <JsonLd id="breadcrumb" data={breadcrumbSchema} />
      {faqSchema && <JsonLd id="faq" data={faqSchema} />}

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <article className="mx-auto max-w-5xl">

          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-q-muted">
            <Link href="/" className="transition hover:text-q-text">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/compare" className="transition hover:text-q-text">Compare</Link>
            <span className="mx-2">/</span>
            <span className="text-q-text">{page.title}</span>
          </nav>

          {/* Hero */}
          <section className="rounded-3xl border border-q-border bg-q-card p-6 shadow-sm md:p-8 lg:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-500">
              Comparison
            </p>
            <h1 className="mt-4 text-3xl font-bold md:text-5xl">
              {page.title}
            </h1>
            {page.intro && (
              <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                {page.intro}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {isInternal(page.tool_a_type) && (
                <Link
                  href={toolHref(page.tool_a_slug, page.tool_a_type)}
                  className="inline-flex items-center justify-center rounded-xl bg-q-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-q-primary-hover hover:shadow-md"
                >
                  Try {page.tool_a_name} →
                </Link>
              )}
              <Link
                href="/compare"
                className="inline-flex items-center justify-center rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
              >
                All Comparisons
              </Link>
            </div>
          </section>

          {/* VS Divider */}
          <div className="relative my-8 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-q-border" />
            </div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-q-border bg-q-card text-sm font-bold text-amber-500 shadow-sm">
              VS
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid gap-6 md:grid-cols-2">

            {/* Tool A Card */}
            <section className="rounded-2xl border border-q-border bg-q-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-sm font-bold text-blue-600 dark:text-blue-400">
                  A
                </div>
                <div>
                  <h2 className="text-lg font-bold text-q-text">{page.tool_a_name}</h2>
                  {isInternal(page.tool_a_type) && (
                    <Link
                      href={toolHref(page.tool_a_slug, page.tool_a_type)}
                      className="text-xs font-medium text-blue-500 transition hover:text-blue-600"
                    >
                      Open tool →
                    </Link>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                    Strengths
                  </span>
                </div>
                <div className="space-y-2.5">
                  {page.tool_a_pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-q-border bg-q-bg p-3.5 text-sm leading-6 text-q-text">
                      <span className="mt-0.5 text-emerald-500">+</span>
                      {pro}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-red-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500 dark:text-red-400">
                    Limitations
                  </span>
                </div>
                <div className="space-y-2.5">
                  {page.tool_a_cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-q-border bg-q-bg p-3.5 text-sm leading-6 text-q-muted">
                      <span className="mt-0.5 text-red-400">&minus;</span>
                      {con}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tool B Card */}
            <section className="rounded-2xl border border-q-border bg-q-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-sm font-bold text-purple-600 dark:text-purple-400">
                  B
                </div>
                <div>
                  <h2 className="text-lg font-bold text-q-text">{page.tool_b_name}</h2>
                  {isInternal(page.tool_b_type) && (
                    <Link
                      href={toolHref(page.tool_b_slug, page.tool_b_type)}
                      className="text-xs font-medium text-purple-500 transition hover:text-purple-600"
                    >
                      Open tool →
                    </Link>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                    Strengths
                  </span>
                </div>
                <div className="space-y-2.5">
                  {page.tool_b_pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-q-border bg-q-bg p-3.5 text-sm leading-6 text-q-text">
                      <span className="mt-0.5 text-emerald-500">+</span>
                      {pro}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-red-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500 dark:text-red-400">
                    Limitations
                  </span>
                </div>
                <div className="space-y-2.5">
                  {page.tool_b_cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-q-border bg-q-bg p-3.5 text-sm leading-6 text-q-muted">
                      <span className="mt-0.5 text-red-400">&minus;</span>
                      {con}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Verdict */}
          {page.verdict && (
            <section className="mt-8 rounded-3xl border border-q-border bg-q-card p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                  Our Verdict
                </span>
              </div>
              <p className="text-base leading-8 text-q-text md:text-lg">{page.verdict}</p>
            </section>
          )}

          <div className="my-8">
            <AdSlot type="in-article" />
          </div>

          {/* FAQs */}
          {page.faqs && page.faqs.length > 0 && (
            <section className="rounded-2xl border border-q-border bg-q-card p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                  Frequently Asked Questions
                </span>
              </div>
              <div className="space-y-3">
                {page.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-q-border bg-q-bg p-5 transition duration-150 ease-out hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-sm"
                  >
                    <summary className="cursor-pointer text-sm font-semibold leading-6 text-q-text">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-q-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10">
            <EmailCapture />
          </div>

        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
