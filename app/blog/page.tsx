import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, CATEGORY_LABELS, type BlogCategory } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Free Tool Guides & How-To Articles | QuickFnd",
  description: "Learn how to use free online tools, calculators, and AI utilities. Step-by-step guides, how-to articles, and tips from the QuickFnd team.",
  alternates: { canonical: `${getSiteUrl()}/blog` },
};

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  "how-to": "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "tools-guide": "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  "calculator-guide": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "ai-guide": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "seo-guide": "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "finance-guide": "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  "developer-guide": "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  "comparison": "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "pillar": "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  const { posts, total } = await getPublishedPosts({ limit: 24 });

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
            QuickFnd Blog
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-q-text md:text-5xl">
            Guides & How-To Articles
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-q-muted md:text-lg">
            Step-by-step guides for free online tools, calculators, and AI utilities. Learn faster, work smarter.
          </p>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
            <p className="text-q-muted">Articles coming soon — check back shortly.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-q-border bg-q-card p-6 transition hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category]}`}>
                      {CATEGORY_LABELS[post.category]}
                    </span>
                    <span className="text-xs text-q-muted">{post.reading_time_minutes} min read</span>
                  </div>
                  <h2 className="mt-4 text-base font-semibold leading-snug text-q-text group-hover:text-blue-500 transition">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-q-muted line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-q-muted">
                      {post.published_at ? formatDate(post.published_at) : ""}
                    </span>
                    <span className="text-xs font-medium text-blue-500 group-hover:text-blue-400">
                      Read article →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {total > 24 && (
              <p className="mt-8 text-center text-sm text-q-muted">{total} articles published · more added daily</p>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-q-border bg-q-card p-8 text-center">
          <h2 className="text-xl font-semibold text-q-text">Looking for a specific tool?</h2>
          <p className="mt-2 text-sm text-q-muted">
            Browse our complete library of free browser-based tools, calculators, and AI utilities.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/tools" className="rounded-xl bg-q-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-q-primary-hover transition">
              Browse Tools
            </Link>
            <Link href="/calculators" className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
              Calculators
            </Link>
            <Link href="/ai-tools" className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
              AI Tools
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}