import type { Metadata } from "next";
import Link from "next/link";
import { AUTHORS } from "@/lib/authors";
import { getSiteUrl } from "@/lib/site-url";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Meet Our Writers | QuickFnd Blog",
  description: "The QuickFnd blog is written by developers, finance experts, designers, and analysts who use these tools every day.",
  alternates: { canonical: `${getSiteUrl()}/blog/authors` },
};

export default function AuthorsPage() {
  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl space-y-10">

          <div>
            <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
              Our Writers
            </div>
            <h1 className="mt-4 text-3xl font-bold text-q-text md:text-5xl">Meet the Team</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-q-muted">
              QuickFnd articles are written by real practitioners — developers, finance professionals, designers, and analysts who use these tools in their daily work.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {AUTHORS.map(author => (
              <Link
                key={author.slug}
                href={`/blog/authors/${author.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-q-border bg-q-card p-6 transition hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    width={56} height={56}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-q-text group-hover:text-blue-500 transition">{author.name}</p>
                    <p className="text-xs text-q-muted">{author.title}</p>
                    <p className="text-xs text-q-muted">{author.location}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-q-muted line-clamp-3">{author.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {author.expertise.slice(0, 4).map(exp => (
                    <span key={exp} className="rounded-full border border-q-border bg-q-bg px-2 py-0.5 text-xs text-q-muted">
                      {exp}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-blue-500 group-hover:text-blue-400">
                  View articles →
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}