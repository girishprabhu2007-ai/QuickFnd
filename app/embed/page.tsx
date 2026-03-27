import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Embed QuickFnd Tools — Free Widget for Your Website",
  description: "Embed any QuickFnd tool or calculator on your website for free. Copy the iframe code and get a backlink automatically.",
};

const EXAMPLE_TOOLS = [
  { slug: "emi-calculator", name: "EMI Calculator", type: "calculators" },
  { slug: "json-formatter", name: "JSON Formatter", type: "tools" },
  { slug: "bmi-calculator", name: "BMI Calculator", type: "calculators" },
  { slug: "password-generator", name: "Password Generator", type: "tools" },
  { slug: "gst-calculator", name: "GST Calculator", type: "calculators" },
  { slug: "word-counter", name: "Word Counter", type: "tools" },
];

function EmbedCode({ slug, type }: { slug: string; type: string }) {
  const code = `<iframe\n  src="https://quickfnd.com/embed/${type}/${slug}"\n  width="100%"\n  height="500"\n  frameborder="0"\n  title="QuickFnd Tool"\n  loading="lazy"\n></iframe>`;
  return (
    <pre className="rounded-xl bg-q-bg border border-q-border p-4 text-xs text-q-muted overflow-x-auto font-mono leading-5">
      {code}
    </pre>
  );
}

export default function EmbedPage() {
  return (
    <main className="min-h-screen bg-q-bg text-q-text">
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl space-y-10">

          {/* Header */}
          <div className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm">
            <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
              Free Embed
            </div>
            <h1 className="mt-4 text-3xl font-bold text-q-text md:text-5xl">
              Embed Any QuickFnd Tool
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-q-muted">
              Add any of our 130+ free tools to your website with one line of code.
              No API key, no account, no cost. The embedded tool includes a "Powered by QuickFnd" link automatically.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                "✓ Free forever",
                "✓ No account needed",
                "✓ Works on any website",
                "✓ Mobile responsive",
                "✓ Always up to date",
              ].map(f => (
                <span key={f} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="font-semibold text-q-text mb-5">How to embed in 30 seconds</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Choose a tool below", desc: "Pick any calculator or tool from our directory." },
                { step: "2", title: "Copy the embed code", desc: "One iframe tag. Paste it anywhere in your HTML." },
                { step: "3", title: "Done", desc: "The tool loads in your page. Users never leave your site." },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-q-primary text-sm font-bold text-white">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-medium text-q-text text-sm">{s.title}</p>
                    <p className="text-xs text-q-muted mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular embeds */}
          <div className="space-y-4">
            <h2 className="font-semibold text-q-text text-lg">Popular embeds</h2>
            {EXAMPLE_TOOLS.map(tool => (
              <div key={tool.slug} className="rounded-2xl border border-q-border bg-q-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-q-text">{tool.name}</h3>
                  <Link href={`/${tool.type}/${tool.slug}`} target="_blank"
                    className="text-xs text-blue-500 hover:text-blue-400">
                    Preview →
                  </Link>
                </div>
                <EmbedCode slug={tool.slug} type={tool.type} />
              </div>
            ))}
          </div>

          {/* Custom tool */}
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-6 dark:border-blue-500/20 dark:bg-blue-500/5">
            <h2 className="font-semibold text-q-text mb-2">Embed any tool</h2>
            <p className="text-sm text-q-muted mb-3">
              Replace <code className="text-blue-500 bg-q-bg rounded px-1">TOOL_SLUG</code> with any tool slug from our directory:
            </p>
            <pre className="rounded-xl bg-q-bg border border-q-border p-4 text-xs text-q-muted font-mono leading-5 overflow-x-auto">
              {`<!-- For tools: -->\n<iframe src="https://quickfnd.com/embed/tools/TOOL_SLUG" width="100%" height="500" frameborder="0"></iframe>\n\n<!-- For calculators: -->\n<iframe src="https://quickfnd.com/embed/calculators/CALC_SLUG" width="100%" height="500" frameborder="0"></iframe>`}
            </pre>
            <div className="mt-4 flex gap-3">
              <Link href="/tools" className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
                Browse all tools →
              </Link>
              <Link href="/calculators" className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
                Browse calculators →
              </Link>
            </div>
          </div>

          {/* API section */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="font-semibold text-q-text mb-2">Free Public API</h2>
            <p className="text-sm text-q-muted mb-4">
              Access our tools directory programmatically. No API key needed.
            </p>
            <div className="space-y-3">
              {[
                { endpoint: "GET /api/v1/tools", desc: "All 62+ tools" },
                { endpoint: "GET /api/v1/calculators", desc: "All 49+ calculators" },
                { endpoint: "GET /api/v1/search?q=emi", desc: "Search all tools" },
              ].map(api => (
                <div key={api.endpoint} className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-4 py-3">
                  <code className="text-xs font-mono text-blue-500">{api.endpoint}</code>
                  <span className="text-xs text-q-muted">{api.desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-q-muted">
              All responses include CORS headers. Free, no rate limit for reasonable use.
            </p>
          </div>

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}