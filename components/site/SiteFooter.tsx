import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-q-border bg-q-card">

      {/* Footer leaderboard ad */}
      <div className="border-b border-q-border py-4">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <AdSlot type="leaderboard" label={true} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-q-muted sm:px-6 lg:px-8">

        {/* Main footer grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
                style={{ background: "var(--q-gradient-blue)" }}
              >
                Q
              </div>
              <span className="text-lg font-bold text-q-text">
                Quick<span style={{ color: "var(--q-primary)" }}>Fnd</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs leading-7 text-q-muted">
              Free browser-based tools, calculators, and AI utilities. No account, no install —
              just open and use.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-q-muted">
              <span className="rounded-full border border-q-border bg-q-bg px-2.5 py-1">
                ⚙️ {" "}Tools
              </span>
              <span className="rounded-full border border-q-border bg-q-bg px-2.5 py-1">
                🧮 Calculators
              </span>
              <span className="rounded-full border border-q-border bg-q-bg px-2.5 py-1">
                ✨ AI Tools
              </span>
            </div>
          </div>

          {/* Directory */}
          <div>
            <h3 className="font-semibold text-q-text">Directory</h3>
            <div className="mt-3 space-y-2">
              {[
                { href: "/tools", label: "All Tools" },
                { href: "/calculators", label: "Calculators" },
                { href: "/ai-tools", label: "AI Tools" },
                { href: "/topics", label: "Topic Clusters" },
                { href: "/request-tool", label: "Request a Tool" },
              ].map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="transition hover:text-blue-500">{link.label}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Popular */}
          <div>
            <h3 className="font-semibold text-q-text">Popular Tools</h3>
            <div className="mt-3 space-y-2">
              {[
                { href: "/tools/password-generator", label: "Password Generator" },
                { href: "/tools/json-formatter", label: "JSON Formatter" },
                { href: "/tools/word-counter", label: "Word Counter" },
                { href: "/calculators/bmi-calculator", label: "BMI Calculator" },
                { href: "/calculators/emi-calculator", label: "EMI Calculator" },
                { href: "/ai-tools/ai-email-writer", label: "AI Email Writer" },
              ].map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="transition hover:text-blue-500">{link.label}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-q-text">Company</h3>
            <div className="mt-3 space-y-2">
              {[
                { href: "/about", label: "About QuickFnd" },
                { href: "/blog", label: "Blog" },
                { href: "/blog/authors", label: "Our Writers" },
                { href: "/write-for-us", label: "Write for Us" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Use" },
                { href: "/disclaimer", label: "Disclaimer" },
                { href: "/cookie-policy", label: "Cookie Policy" },
              ].map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="transition hover:text-blue-500">{link.label}</Link>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Write for Us banner */}
        <div className="mt-10 rounded-2xl border border-q-border bg-q-bg px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-q-text text-sm">Write for QuickFnd</p>
            <p className="text-xs text-q-muted mt-0.5">
              Share your expertise with our audience of developers, finance professionals &amp; students.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/write-for-us"
              className="rounded-xl bg-q-primary px-4 py-2 text-xs font-semibold text-white hover:bg-q-primary-hover transition"
            >
              Apply to Write →
            </Link>
            <Link
              href="/submit-article"
              className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition"
            >
              Submit Article
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-q-border pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-q-muted">
              <span>© {year} QuickFnd. All rights reserved.</span>
              <span className="hidden sm:inline text-q-border">|</span>
              <Link href="/privacy" className="hover:text-blue-500">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-500">Terms</Link>
              <Link href="/disclaimer" className="hover:text-blue-500">Disclaimer</Link>
              <Link href="/cookie-policy" className="hover:text-blue-500">Cookies</Link>
            </div>

            <p className="text-xs text-q-muted opacity-70">
              This site may display advertisements.{" "}
              <Link href="/privacy#advertising" className="hover:text-blue-500">
                Ad Policy
              </Link>
            </p>

          </div>
        </div>

      </div>
    </footer>
  );
}