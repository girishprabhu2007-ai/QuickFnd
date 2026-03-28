import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "About QuickFnd",
  description: "Learn about QuickFnd — a free, browser-based platform of tools, calculators, and AI utilities built for developers, writers, students, and everyday productivity.",
};

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg text-q-text">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16 space-y-8">

          {/* Hero */}
          <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-10">
            <div className="badge badge-blue mb-4">ℹ️ About</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">About QuickFnd</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-q-muted">
              QuickFnd is a free, browser-based platform of tools, calculators, and AI utilities
              built for developers, writers, students, marketers, and anyone who needs fast,
              reliable results without installing software or creating an account.
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-q-text">Our Mission</h2>
            <p className="mt-4 leading-7 text-q-muted">
              The internet is full of tools that require sign-ups, charge subscriptions, show
              misleading results, or bury the actual functionality behind dark patterns.
            </p>
            <p className="mt-3 leading-7 text-q-muted">
              QuickFnd exists to fix that. Every tool on this platform is free, runs instantly
              in your browser, requires no account, and does exactly what it says. We believe
              the best tool is one you can find, use, and trust in under 10 seconds.
            </p>
          </div>

          {/* What we offer */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-q-text">What QuickFnd Offers</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: "⚙️",
                  title: "Tools",
                  desc: "Developer utilities, text tools, encoders, converters, generators — all running client-side in your browser with zero data sent to our servers.",
                  href: "/tools",
                  color: "rgba(37,99,235,0.06)",
                },
                {
                  icon: "🧮",
                  title: "Calculators",
                  desc: "Financial calculators (EMI, GST, loan), health calculators (BMI), math utilities, and more — with results and plain-English interpretation.",
                  href: "/calculators",
                  color: "rgba(124,58,237,0.06)",
                },
                {
                  icon: "✨",
                  title: "AI Tools",
                  desc: "AI-powered writing assistants for emails, prompts, outlines, and content workflows — built on QuickFnd, free to use without a subscription.",
                  href: "/ai-tools",
                  color: "rgba(16,185,129,0.06)",
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="card-glow rounded-2xl border border-q-border p-5 transition"
                  style={{ background: item.color }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-q-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-q-muted">{item.desc}</p>
                  <p className="mt-3 text-sm font-medium text-q-primary">Browse {item.title} →</p>
                </Link>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-q-text">How QuickFnd Works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { icon: "🔒", title: "Privacy by default", desc: "Most tools process your data entirely in your browser. Text you enter into the JSON Formatter, Password Generator, Word Counter, and similar tools never leaves your device." },
                { icon: "⚡", title: "No friction", desc: "No signup, no login, no subscription. Open a tool page and start using it immediately. Everything works on desktop and mobile." },
                { icon: "🤖", title: "AI where it helps", desc: "AI tools generate drafts for emails, prompts, and content. We use AI where it genuinely saves time — not as a gimmick." },
                { icon: "📈", title: "Community-driven", desc: "Users can request new tools, report issues, and suggest improvements. The tools we build next are driven by what people actually need." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-q-text">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-q-muted">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Built with */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-q-text">Built With</h2>
            <p className="mt-3 text-sm leading-7 text-q-muted">
              QuickFnd is built on modern, reliable technology chosen for speed, security, and scalability:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Supabase", "AI Engine", "Vercel"].map((tech) => (
                <span key={tech}
                  className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-sm font-medium text-q-muted">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Advertising disclosure */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-q-text">How QuickFnd Is Funded</h2>
            <p className="mt-4 leading-7 text-q-muted">
              QuickFnd is free to use and always will be. To cover server costs and ongoing development,
              the platform displays advertisements served by Google AdSense. Ads are clearly distinguished
              from tool content and do not influence which tools we build or how results are presented.
            </p>
            <p className="mt-3 leading-7 text-q-muted">
              We do not receive payment from any tool, product, or service mentioned or linked on
              QuickFnd unless explicitly disclosed. We do not sell user data.
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-q-text">Get Involved</h2>
            <p className="mt-3 text-sm leading-7 text-q-muted">
              Have a tool idea? Found a bug? Want to see something improved?
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/request-tool"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">
                Request a Tool
              </Link>
              <Link href="/contact"
                className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-semibold text-q-text transition hover:bg-q-card-hover">
                Contact Us
              </Link>
              <Link href="/tools"
                className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-semibold text-q-text transition hover:bg-q-card-hover">
                Browse All Tools →
              </Link>
            </div>
          </div>

        </div>
      </main>
      <SiteFooter />
    </>
  );
}