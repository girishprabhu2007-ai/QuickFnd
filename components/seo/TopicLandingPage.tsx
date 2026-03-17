import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import type { TopicPageData } from "@/lib/programmatic-seo";
import { getCachedTopicContent } from "@/lib/topic-content-cache";

export default async function TopicLandingPage({ topic }: { topic: TopicPageData }) {
  const content = await getCachedTopicContent(topic.key, topic.label);

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text">
      <section className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold">{topic.label}</h1>

        {/* Intro */}
        {content?.intro && (
          <section className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="text-xl font-semibold">About {topic.label}</h2>
            <p className="mt-3 text-q-muted">{content.intro}</p>
          </section>
        )}

        {/* Use cases */}
        {content?.use_cases?.length > 0 && (
          <section className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="text-xl font-semibold">What you can do</h2>
            <ul className="mt-3 space-y-2 text-q-muted">
              {content.use_cases.map((u: string) => (
                <li key={u}>• {u}</li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQs */}
        {content?.faqs?.length > 0 && (
          <section className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="text-xl font-semibold">FAQs</h2>
            {content.faqs.map((faq: any) => (
              <div key={faq.question} className="mt-4">
                <div className="font-semibold">{faq.question}</div>
                <div className="text-q-muted">{faq.answer}</div>
              </div>
            ))}
          </section>
        )}

        {/* EXISTING tool sections remain below */}

      </section>

      <SiteFooter />
    </main>
  );
}