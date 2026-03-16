import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export default function ContactPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto max-w-4xl rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">Contact</h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-q-muted md:text-base">
            <p>Need a feature, want to report a bug, or want a new tool added?</p>
            <p>
              Use the{" "}
              <Link href="/request-tool" className="text-blue-500 hover:text-blue-400">
                Request a Tool
              </Link>{" "}
              page to submit ideas.
            </p>
            <p>You can also add your preferred public contact email here later if you want direct support contact visible on the site.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}