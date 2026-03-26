import type { Metadata } from "next";
import SubmitArticleForm from "./SubmitArticleForm";
import SiteFooter from "@/components/site/SiteFooter";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Submit an Article | QuickFnd",
  description: "Approved QuickFnd contributors can submit articles here for AI review and editorial approval.",
  alternates: { canonical: `${getSiteUrl()}/submit-article` },
};

export default function SubmitArticlePage() {
  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-3xl space-y-8">

          <div className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm">
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              Contributors Only
            </div>
            <h1 className="mt-4 text-3xl font-bold text-q-text">Submit an Article</h1>
            <p className="mt-3 text-sm leading-6 text-q-muted">
              Every submission goes through our AI content review before reaching the editorial team.
              The AI checks structure, SEO, word count, relevance, originality, and formatting.
              Articles that pass (score ≥ 70/100) move to editorial review. You'll receive feedback either way.
            </p>

            {/* Review criteria */}
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                { label: "Word count", req: "900+ words" },
                { label: "SEO structure", req: "Target keyword + meta" },
                { label: "Headings", req: "3+ H2 subheadings" },
                { label: "Internal links", req: "2+ QuickFnd tool links" },
                { label: "Originality", req: "No copied content" },
                { label: "Relevance", req: "Fits QuickFnd audience" },
                { label: "Formatting", req: "Lists, bold, structure" },
                { label: "Brand fit", req: "Helpful, not promotional" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2">
                  <span className="text-xs font-medium text-q-text">{item.label}</span>
                  <span className="text-xs text-q-muted">{item.req}</span>
                </div>
              ))}
            </div>
          </div>

          <SubmitArticleForm />

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}