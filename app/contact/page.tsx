import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Contact QuickFnd",
  description: "Contact QuickFnd — request a tool, report a bug, ask a question, or send feedback about our free browser-based tools and calculators.",
};

export default function ContactPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg text-q-text">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16 space-y-8">

          {/* Header */}
          <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-10">
            <div className="badge badge-blue mb-4">📬 Contact</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Contact QuickFnd</h1>
            <p className="mt-4 max-w-2xl leading-7 text-q-muted">
              Have a question, a suggestion, or a tool idea? We'd love to hear from you.
              Choose the most relevant option below for the fastest response.
            </p>
          </div>

          {/* Contact options */}
          <div className="grid gap-4 md:grid-cols-2">

            {/* Request a tool */}
            <Link href="/request-tool"
              className="card-glow group rounded-2xl border border-q-border bg-q-card p-6 transition"
              style={{ background: "rgba(37,99,235,0.03)" }}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background: "rgba(37,99,235,0.08)" }}>
                  💡
                </div>
                <div>
                  <h2 className="font-bold text-q-text group-hover:text-q-primary transition-colors">
                    Request a Tool
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-q-muted">
                    Have an idea for a tool, calculator, or AI utility that should be on QuickFnd?
                    Submit it here and we'll evaluate it for our roadmap.
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-q-primary">
                    Submit request →
                  </span>
                </div>
              </div>
            </Link>

            {/* Report an issue */}
            <Link href="/request-tool?mode=report"
              className="card-glow group rounded-2xl border border-q-border bg-q-card p-6 transition"
              style={{ background: "rgba(239,68,68,0.02)" }}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background: "rgba(239,68,68,0.06)" }}>
                  🚨
                </div>
                <div>
                  <h2 className="font-bold text-q-text group-hover:text-q-primary transition-colors">
                    Report an Issue
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-q-muted">
                    Found a broken tool, incorrect result, or something that needs fixing?
                    Report it and we'll prioritise a fix.
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-q-primary">
                    Report issue →
                  </span>
                </div>
              </div>
            </Link>

          </div>

          {/* General contact */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-q-text">General Enquiries</h2>
            <p className="mt-3 text-sm leading-7 text-q-muted">
              For general questions, partnership enquiries, press, or anything else, you can
              reach us via the tool request form above and mention "General" in your description.
            </p>
            <p className="mt-3 text-sm leading-7 text-q-muted">
              We review all submissions and aim to respond within 2–5 business days.
              Please note we are a small team — we may not be able to respond to all messages,
              but we read every one.
            </p>
          </div>

          {/* Privacy / legal */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-q-text">Privacy & Legal Requests</h2>
            <p className="mt-3 text-sm leading-7 text-q-muted">
              For privacy-related requests including data access, correction, or deletion under
              GDPR, CCPA, or India's DPDPA, please use the tool request form and clearly
              state your request. We will respond within 30 days.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
              <span className="text-q-muted">·</span>
              <Link href="/terms" className="text-blue-500 hover:underline">Terms of Use</Link>
              <span className="text-q-muted">·</span>
              <Link href="/disclaimer" className="text-blue-500 hover:underline">Disclaimer</Link>
              <span className="text-q-muted">·</span>
              <Link href="/cookie-policy" className="text-blue-500 hover:underline">Cookie Policy</Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-q-text">Quick Links</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { href: "/tools", label: "Browse all tools" },
                { href: "/calculators", label: "Browse calculators" },
                { href: "/ai-tools", label: "Browse AI tools" },
                { href: "/topics", label: "Browse by topic" },
                { href: "/about", label: "About QuickFnd" },
                { href: "/request-tool", label: "Request a tool" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-muted transition hover:bg-q-card-hover hover:text-q-text">
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
      <SiteFooter />
    </>
  );
}