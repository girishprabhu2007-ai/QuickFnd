import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, CATEGORY_LABELS, type BlogCategory } from "@/lib/blog";
import { getAuthorById } from "@/lib/authors";
import { getSiteUrl } from "@/lib/site-url";
import SiteFooter from "@/components/site/SiteFooter";
import AdSlot from "@/components/ads/AdSlot";
import EmailCapture from "@/components/email/EmailCapture";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — Free Tool Guides & How-To Articles | QuickFnd",
  description:
    "Learn how to use free online tools, calculators, and AI utilities. Step-by-step guides, how-to articles, and tips from the QuickFnd team.",
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Props = { searchParams: Promise<{ page?: string; category?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam, category: catParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));
  const PER_PAGE = 24;
  const offset = (page - 1) * PER_PAGE;
  const category = (catParam as import("@/lib/blog").BlogCategory) || undefined;

  const { posts, total } = await getPublishedPosts({ limit: PER_PAGE, offset, category });
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl space-y-10">

          {/* Header */}
          <div>
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

          {/* Ad slot — below header */}
          <div className="flex justify-center">
            <AdSlot type="leaderboard" />
          </div>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
              <p className="text-q-muted">Articles coming soon — check back shortly.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post, index) => (
                  <>
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
                      <h2 className="mt-4 text-base font-semibold leading-snug text-q-text group-hover:text-blue-500 transition line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-6 text-q-muted line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {(() => {
                            const author = post.author_id ? getAuthorById(post.author_id) : null;
                            if (!author) return null;
                            return (
                              <>
                                <img
                                  src={author.avatar_url}
                                  alt={author.name}
                                  width={20} height={20}
                                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                                />
                                <span className="text-xs text-q-muted truncate">{author.name}</span>
                              </>
                            );
                          })()}
                        </div>
                        <span className="text-xs font-medium text-blue-500 group-hover:text-blue-400 shrink-0">
                          {post.reading_time_minutes}min →
                        </span>
                      </div>
                    </Link>
                    {/* Ad slot after every 6th article */}
                    {(index + 1) % 6 === 0 && index + 1 < posts.length && (
                      <div key={`ad-${index}`} className="md:col-span-2 xl:col-span-3 flex justify-center">
                        <AdSlot type="in-article" />
                      </div>
                    )}
                  </>
                ))}
              </div>

              {total > 24 && (
                <p className="text-center text-sm text-q-muted">
                  {total} articles published · more added daily
                </p>
              )}
            </>
          )}

          {/* Email capture */}
          <EmailCapture variant="banner" source="blog-listing" />

          {/* CTA */}
          <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center">
            <h2 className="text-xl font-semibold text-q-text">
              Looking for a specific tool?
            </h2>
            <p className="mt-2 text-sm text-q-muted">
              Browse our complete library of free browser-based tools, calculators, and AI utilities.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/tools"
                className="rounded-xl bg-q-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-q-primary-hover transition"
              >
                Browse Tools
              </Link>
              <Link
                href="/calculators"
                className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-medium text-q-text hover:bg-q-card-hover transition"
              >
                Calculators
              </Link>
              <Link
                href="/ai-tools"
                className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-medium text-q-text hover:bg-q-card-hover transition"
              >
                AI Tools
              </Link>
              <Link
                href="/blog/authors"
                className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-medium text-q-text hover:bg-q-card-hover transition"
              >
                Our Writers
              </Link>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <a href={`/blog?page=${page - 1}`}
                  className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover">
                  ← Previous
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <a key={p} href={`/blog?page=${p}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition ${p === page ? "bg-q-primary text-white" : "border border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                    {p}
                  </a>
                ))
              }
              {page < totalPages && (
                <a href={`/blog?page=${page + 1}`}
                  className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover">
                  Next →
                </a>
              )}
            </div>
          )}
          <p className="text-center text-xs text-q-muted">
            Showing {Math.min(offset + 1, total)}–{Math.min(offset + PER_PAGE, total)} of {total} articles
          </p>

          {/* Footer ad */}
          <div className="flex justify-center">
            <AdSlot type="footer" />
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}