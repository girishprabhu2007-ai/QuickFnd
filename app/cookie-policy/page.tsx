import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "QuickFnd Cookie Policy — how we use cookies and similar technologies on our website.",
};

const LAST_UPDATED = "March 23, 2026";

export default function CookiePolicyPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg text-q-text">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

          <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-10">
            <div className="badge badge-blue mb-4">🍪 Cookies</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Cookie Policy</h1>
            <p className="mt-4 text-q-muted">Last updated: {LAST_UPDATED}</p>
            <p className="mt-3 max-w-2xl leading-7 text-q-muted">
              This Cookie Policy explains how QuickFnd uses cookies and similar technologies
              when you visit quickfnd.com. It should be read alongside our{" "}
              <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <div className="mt-8 space-y-6 rounded-2xl border border-q-border bg-q-card p-6 md:p-8">

            <section>
              <h2 className="text-xl font-bold text-q-text">What Are Cookies?</h2>
              <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
                Cookies are small text files placed on your device when you visit a website.
                They are widely used to make websites work efficiently, to remember your
                preferences, and to provide information to website owners. We also use
                browser localStorage, which functions similarly.
              </p>
            </section>

            <div className="divider-gradient" />

            <section>
              <h2 className="text-xl font-bold text-q-text">Cookies We Use</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-widest text-q-muted">
                      <th className="px-4 py-2">Name / Key</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Purpose</th>
                      <th className="px-4 py-2">Duration</th>
                      <th className="px-4 py-2">Provider</th>
                    </tr>
                  </thead>
                  <tbody className="text-q-muted">
                    {[
                      {
                        name: "quickfnd-theme",
                        type: "Functional",
                        purpose: "Remembers your light/dark theme preference",
                        duration: "Until browser data cleared",
                        provider: "QuickFnd (localStorage)",
                      },
                      {
                        name: "_ga, _gid",
                        type: "Analytics",
                        purpose: "Tracks page views and usage patterns (anonymised)",
                        duration: "2 years / 24 hours",
                        provider: "Google Analytics",
                      },
                      {
                        name: "_gat",
                        type: "Analytics",
                        purpose: "Limits request rate to Google Analytics",
                        duration: "1 minute",
                        provider: "Google Analytics",
                      },
                      {
                        name: "NID, DSID, IDE",
                        type: "Advertising",
                        purpose: "Used by Google AdSense to serve personalised ads",
                        duration: "6 months – 1 year",
                        provider: "Google AdSense",
                      },
                      {
                        name: "quickfnd-snippets",
                        type: "Functional",
                        purpose: "Stores code snippets you save in the Code Snippet Manager",
                        duration: "Until browser data cleared",
                        provider: "QuickFnd (localStorage)",
                      },
                    ].map((row) => (
                      <tr key={row.name} className="rounded-xl bg-q-bg">
                        <td className="rounded-l-xl px-4 py-3 font-mono text-xs text-q-text">{row.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.type === "Functional" ? "bg-blue-50 text-blue-700" :
                            row.type === "Analytics" ? "bg-purple-50 text-purple-700" :
                            "bg-amber-50 text-amber-700"
                          }`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-3">{row.purpose}</td>
                        <td className="px-4 py-3">{row.duration}</td>
                        <td className="rounded-r-xl px-4 py-3">{row.provider}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="divider-gradient" />

            <section>
              <h2 className="text-xl font-bold text-q-text">Managing Cookies</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>You can control cookies through several methods:</p>
                <ul className="ml-4 space-y-2 list-disc list-outside">
                  <li><strong className="text-q-text">Browser settings</strong> — Most browsers allow you to refuse cookies, delete existing cookies, or be notified when a cookie is set. See your browser's help documentation for instructions.</li>
                  <li><strong className="text-q-text">Google Analytics opt-out</strong> — Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Analytics Opt-out Browser Add-on</a>.</li>
                  <li><strong className="text-q-text">Google ad personalisation</strong> — Visit <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Ad Settings</a> to manage or opt out of personalised advertising.</li>
                  <li><strong className="text-q-text">Industry opt-out</strong> — Use the <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">NAI opt-out tool</a> or <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">DAA opt-out tool</a>.</li>
                  <li><strong className="text-q-text">localStorage</strong> — Clear site data in your browser's developer tools or settings to remove QuickFnd's locally stored preferences.</li>
                </ul>
                <p>Disabling cookies will not prevent you from using QuickFnd's tools, but it
                may affect your theme preference being remembered and may cause advertising
                to be less relevant.</p>
              </div>
            </section>

            <div className="divider-gradient" />

            <section>
              <h2 className="text-xl font-bold text-q-text">Changes to This Policy</h2>
              <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
                We may update this Cookie Policy when we add new features or third-party
                integrations. The "Last updated" date will reflect any changes.
              </p>
            </section>

            <div className="divider-gradient" />

            <section>
              <h2 className="text-xl font-bold text-q-text">Contact</h2>
              <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
                For questions about our use of cookies, please visit our{" "}
                <Link href="/contact" className="text-blue-500 hover:underline">Contact page</Link>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}