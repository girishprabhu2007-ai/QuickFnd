import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorBySlug } from "@/lib/authors";
import { getPublishedPosts, CATEGORY_LABELS } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site-url";
import SiteFooter from "@/components/site/SiteFooter";
import AdSlot from "@/components/ads/AdSlot";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author Not Found | QuickFnd" };
  return {
    title: `${author.name} — ${author.title} | QuickFnd Blog`,
    description: author.bio,
    alternates: { canonical: `${getSiteUrl()}/blog/authors/${slug}` },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const authorOrUndef = getAuthorBySlug(slug);
  if (!authorOrUndef) notFound();
  const author = authorOrUndef!;

  // Get all posts by this author
  const { posts: allPosts } = await getPublishedPosts({ limit: 100 });
  const authorPosts = allPosts.filter(p => p.author_id === author.id);

  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">

          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-q-muted">
            <Link href="/" className="hover:text-q-text transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-q-text transition">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-q-text">{author.name}</span>
          </nav>

          {/* Author profile header */}
          <div className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm mb-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <img
                src={author.avatar_url}
                alt={author.name}
                width={96} height={96}
                className="h-24 w-24 shrink-0 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-q-text">{author.name}</h1>
                  <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-sm text-q-muted">{author.title}</span>
                </div>
                <p className="mt-1 text-sm text-q-muted">{author.location} · {author.years_experience} years experience</p>
                <p className="mt-4 text-base leading-7 text-q-muted max-w-2xl">{author.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {author.expertise.map(exp => (
                    <span key={exp} className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-muted capitalize">
                      {exp}
                    </span>
                  ))}
                </div>
                {(author.twitter || author.linkedin) && (
                  <div className="mt-4 flex gap-4 text-sm text-blue-500">
                    {author.twitter && (
                      <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                        Twitter / X
                      </a>
                    )}
                    {author.linkedin && (
                      <a href={`https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-3xl font-bold text-q-text">{authorPosts.length}</div>
                <div className="text-sm text-q-muted">articles published</div>
              </div>
            </div>
          </div>

          {/* Ad slot */}
          <div className="flex justify-center mb-10">
            <AdSlot type="leaderboard" />
          </div>

          {/* Author's articles */}
          <h2 className="text-xl font-semibold text-q-text mb-6">
            Articles by {author.name}
          </h2>

          {authorPosts.length === 0 ? (
            <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center text-q-muted">
              No articles published yet — check back soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {authorPosts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-q-border bg-q-card p-6 transition hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-sm"
                >
                  <span className="text-xs font-medium text-q-muted uppercase tracking-wider">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <h3 className="mt-3 text-base font-semibold leading-snug text-q-text group-hover:text-blue-500 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-q-muted line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-q-muted">
                    <span>{post.published_at ? formatDate(post.published_at) : ""}</span>
                    <span className="font-medium text-blue-500 group-hover:text-blue-400">{post.reading_time_minutes} min →</span>
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