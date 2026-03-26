import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts, getAllPublishedSlugs, CATEGORY_LABELS } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article Not Found | QuickFnd" };

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/blog/${post.slug}`;
  const title = post.og_title || post.title;
  const description = post.og_description || post.excerpt;

  return {
    title: `${title} | QuickFnd`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "QuickFnd", type: "article",
      publishedTime: post.published_at || undefined,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description },
    keywords: [post.target_keyword || "", ...post.secondary_keywords].filter(Boolean).join(", "),
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Very simple markdown → HTML renderer (no external deps)
function renderMarkdown(md: string): string {
  let html = md
    // Headings
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Code inline
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-400 underline underline-offset-2">$1</a>')
    // Unordered lists — group consecutive lines starting with -
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Paragraphs — blank line separated blocks
    .split(/\n\n+/)
    .map(block => {
      const b = block.trim();
      if (!b) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|code)/.test(b)) return b;
      if (b.startsWith("<li>")) return `<ul>${b}</ul>`;
      return `<p>${b.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  // Wrap consecutive <li> not already in ul/ol
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => {
    if (match.trim().startsWith("<ul>") || match.trim().startsWith("<ol>")) return match;
    return `<ul>${match}</ul>`;
  });

  return html;
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const htmlContent = renderMarkdown(post.content);

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Main article */}
          <article>
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-xs text-q-muted">
              <Link href="/" className="hover:text-q-text transition">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-q-text transition">Blog</Link>
              <span>/</span>
              <span className="truncate text-q-text">{post.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium text-q-muted uppercase tracking-wider">
                  {CATEGORY_LABELS[post.category]}
                </span>
                <span className="text-xs text-q-muted">{post.reading_time_minutes} min read</span>
                {post.published_at && (
                  <span className="text-xs text-q-muted">{formatDate(post.published_at)}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight text-q-text md:text-4xl">{post.title}</h1>
              <p className="mt-4 text-base leading-7 text-q-muted md:text-lg">{post.excerpt}</p>
            </header>

            {/* Article content */}
            <div
              className="prose prose-sm md:prose-base max-w-none text-q-text
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-q-text [&_h2]:mt-8 [&_h2]:mb-4
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-q-text [&_h3]:mt-6 [&_h3]:mb-3
                [&_p]:text-q-muted [&_p]:leading-7 [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
                [&_li]:text-q-muted [&_li]:leading-6
                [&_strong]:text-q-text [&_strong]:font-semibold
                [&_code]:rounded [&_code]:bg-q-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_code]:text-blue-500
                [&_a]:text-blue-500 [&_a]:hover:text-blue-400 [&_a]:underline [&_a]:underline-offset-2"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Tool CTA */}
            {post.tool_slug && (
              <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-5 dark:border-blue-500/20 dark:bg-blue-500/5">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                  Free Tool
                </p>
                <p className="text-sm font-semibold text-q-text mb-3">
                  Try the {post.tool_slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")} for free
                </p>
                <Link
                  href={`/tools/${post.tool_slug}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Open Tool →
                </Link>
              </div>
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-q-border bg-q-card p-5">
                <h3 className="text-sm font-semibold text-q-text mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {related.map(rel => (
                    <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block">
                      <p className="text-sm font-medium text-q-text group-hover:text-blue-500 transition leading-snug">
                        {rel.title}
                      </p>
                      <p className="mt-1 text-xs text-q-muted">{rel.reading_time_minutes} min read</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Browse tools */}
            <div className="rounded-2xl border border-q-border bg-q-card p-5">
              <h3 className="text-sm font-semibold text-q-text mb-3">Browse QuickFnd</h3>
              <div className="space-y-2">
                {[
                  { href: "/tools", label: "⚙️ All Tools" },
                  { href: "/calculators", label: "🧮 Calculators" },
                  { href: "/ai-tools", label: "✨ AI Tools" },
                  { href: "/blog", label: "📝 All Articles" },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text hover:bg-q-card-hover transition">
                    <span>{item.label}</span>
                    <span className="text-q-muted">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}