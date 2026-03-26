import type { Metadata } from "next";
import Link from "next/link";
import WriteForUsForm from "./WriteForUsForm";
import SiteFooter from "@/components/site/SiteFooter";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Write for QuickFnd — Become a Contributor",
  description: "Share your expertise with our audience of developers, finance professionals, and students. Apply to become a QuickFnd contributor.",
  alternates: { canonical: `${getSiteUrl()}/write-for-us` },
};

export default function WriteForUsPage() {
  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl space-y-10">

          {/* Header */}
          <div className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm">
            <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
              Contributor Program
            </div>
            <h1 className="mt-4 text-3xl font-bold text-q-text md:text-5xl">
              Write for QuickFnd
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-q-muted md:text-lg">
              QuickFnd reaches thousands of developers, finance professionals, and students every month.
              If you have real expertise in software development, personal finance, SEO, design, or health — we want to hear from you.
            </p>

            {/* What we look for */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: "🎯", title: "Real expertise", desc: "We only publish content from practitioners — people who actually use these tools in their work." },
                { icon: "✍️", title: "Original writing", desc: "Every article goes through AI quality review and human editorial before publishing. No filler content." },
                { icon: "🔗", title: "Tool-focused", desc: "Articles must connect to practical tools, calculators, or utilities. Theory without application doesn't fit us." },
              ].map(item => (
                <div key={item.title} className="rounded-2xl border border-q-border bg-q-bg p-5">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <div className="font-semibold text-q-text text-sm">{item.title}</div>
                  <p className="mt-1 text-xs leading-5 text-q-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The process */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="font-semibold text-q-text mb-5">How it works</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Apply below", desc: "Fill out the application with your background and a writing sample or topic pitch." },
                { step: "2", title: "We review your application", desc: "Our editorial team reviews applications within 3-5 business days. We look at expertise, writing quality, and fit." },
                { step: "3", title: "Submit your article", desc: "Approved contributors get a submission link. Submit your draft — our AI content review runs first." },
                { step: "4", title: "AI quality check", desc: "Every submission is automatically evaluated for SEO structure, originality, word count, relevance, and formatting before a human ever reads it." },
                { step: "5", title: "Editorial review", desc: "Submissions that pass the AI check go to our editorial team. We review within 3 business days and publish or provide feedback." },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-q-primary text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-medium text-q-text text-sm">{item.title}</div>
                    <p className="mt-0.5 text-xs leading-5 text-q-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application form */}
          <WriteForUsForm />

          {/* Already a contributor? */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-center">
            <p className="text-sm text-q-muted">
              Already an approved contributor?{" "}
              <Link href="/submit-article" className="text-blue-500 hover:text-blue-400 font-medium">
                Submit an article →
              </Link>
            </p>
          </div>

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
