import SiteFooter from "@/components/site/SiteFooter";

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto max-w-4xl rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">Terms of Use</h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-q-muted md:text-base">
            <p>QuickFnd provides browser-based tools, calculators, and AI utilities for general informational and productivity use.</p>
            <p>You are responsible for verifying any outputs before relying on them for financial, legal, medical, or professional decisions.</p>
            <p>You may not misuse the platform, attempt unauthorized access, or use the service for unlawful purposes.</p>
            <p>We may update, remove, or improve features at any time.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}