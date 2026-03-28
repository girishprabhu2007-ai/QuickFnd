import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import SiteFooter from "@/components/site/SiteFooter";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 60;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Compare Tools — Honest X vs Y Comparisons | QuickFnd",
  description:
    "Side-by-side comparisons of popular online tools, calculators, and AI utilities. Honest pros, cons, and verdicts to help you choose the right tool.",
  alternates: { canonical: `${siteUrl}/compare` },
  openGraph: {
    url: `${siteUrl}/compare`,
    title: "Compare Tools — Honest Comparisons | QuickFnd",
    description:
      "Side-by-side comparisons of popular online tools. Honest pros, cons, and verdicts.",
  },
};

type ComparisonListItem = {
  slug: string;
  title: string;
  tool_a_name: string;
  tool_b_name: string;
  tool_a_type: string;
  verdict: string | null;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getAllComparisons(): Promise<ComparisonListItem[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("comparison_pages")
    .select("slug, title, tool_a_name, tool_b_name, tool_a_type, verdict")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return (data || []) as ComparisonListItem[];
}

function typeIcon(type: string): string {
  if (type === "ai-tools" || type === "ai_tools") return "✨";
  if (type === "calculators") return "🧮";
  return "🔧";
}

export default async function CompareIndexPage() {
  const comparisons = await getAllComparisons();

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl">

          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-q-muted">
            <Link href="/" className="transition hover:text-q-text">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-q-text">Compare</span>
          </nav>

          {/* Hero */}
          <section className="rounded-3xl border border-q-border bg-q-card p-6 shadow-sm md:p-8 lg:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-500">
              Comparisons
            </p>
            <h1 className="mt-4 text-3xl font-bold md:text-5xl">
              Compare Tools
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
              Honest side-by-side comparisons of popular online tools, calculators,
              and AI utilities. No fluff — just pros, cons, and a clear verdict.
            </p>
            <p className="mt-3 text-sm text-q-muted">
              {comparisons.length} comparison{comparisons.length !== 1 ? "s" : ""} published
            </p>
          </section>

          {/* Grid */}
          {comparisons.length === 0 ? (
            <p className="mt-10 text-q-muted">No comparisons published yet. Check back soon.</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {comparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  className="group rounded-2xl border border-q-border bg-q-card p-5 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:border-amber-400/50 hover:shadow-md md:p-6"
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="text-base">{typeIcon(c.tool_a_type)}</span>
                    <div className="flex h-6 items-center rounded-full border border-amber-300/40 bg-amber-50/50 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-400">
                      VS
                    </div>
                  </div>
                  <h2 className="text-base font-bold leading-6 text-q-text group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {c.title}
                  </h2>
                  {c.verdict && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-q-muted">
                      {c.verdict}
                    </p>
                  )}
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-amber-500 transition group-hover:translate-x-1">
                    Read comparison →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
