import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog";

const CATEGORY_COLORS: Record<string, string> = {
  "how-to": "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  "tools-guide": "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
  "calculator-guide": "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  "developer-guide": "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20",
  "finance-guide": "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  "how-to": "How-To",
  "tools-guide": "Guide",
  "calculator-guide": "Guide",
  "developer-guide": "Dev Guide",
  "finance-guide": "Finance",
  "comparison": "Comparison",
  "pillar": "Complete Guide",
};

type Props = {
  posts: BlogPostSummary[];
  toolName: string;
};

export default function ToolArticlesSection({ posts, toolName }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-q-border bg-q-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-q-text">
            Articles about {toolName}
          </h2>
          <p className="text-xs text-q-muted mt-0.5">
            Guides, tutorials, and tips from our experts
          </p>
        </div>
        <Link
          href="/blog"
          className="text-xs font-medium text-blue-500 hover:text-blue-400 transition"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => {
          const catColor = CATEGORY_COLORS[post.category] || "text-q-muted bg-q-bg border-q-border";
          const catLabel = CATEGORY_LABELS[post.category] || post.category;
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-start gap-3 rounded-xl border border-q-border bg-q-bg p-4 transition hover:border-blue-400/40 hover:bg-q-card-hover group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${catColor}`}>
                    {catLabel}
                  </span>
                  {post.reading_time_minutes && (
                    <span className="text-[10px] text-q-muted">
                      {post.reading_time_minutes} min read
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-q-text leading-snug line-clamp-2 group-hover:text-blue-500 transition">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-xs text-q-muted mt-1 line-clamp-1">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <span className="text-q-muted text-sm shrink-0 mt-0.5 group-hover:text-blue-500 transition">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}