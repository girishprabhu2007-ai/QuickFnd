import SiteFooter from "@/components/site/SiteFooter";

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto max-w-4xl rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">Privacy Policy</h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-q-muted md:text-base">
            <p>QuickFnd may collect limited technical and usage information to improve the platform.</p>
            <p>We do not intentionally collect sensitive personal information through public tools.</p>
            <p>If you submit a tool request, the information you provide may be reviewed to evaluate and improve our product roadmap.</p>
            <p>For questions about privacy, use the contact page.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}