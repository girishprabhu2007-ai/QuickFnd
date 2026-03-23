import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "QuickFnd Privacy Policy — how we collect, use, and protect your information when you use our free browser-based tools, calculators, and AI utilities.",
};

const LAST_UPDATED = "March 23, 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-q-text md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
        {children}
      </div>
    </section>
  );
}

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Information" },
  { id: "cookies", label: "Cookies & Tracking" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "advertising", label: "Advertising" },
  { id: "ai-tools", label: "AI Tools & Data" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "children", label: "Children's Privacy" },
  { id: "security", label: "Security" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg text-q-text">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

          {/* Header */}
          <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-10">
            <div className="badge badge-blue mb-4">⚖️ Legal</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Privacy Policy</h1>
            <p className="mt-4 text-q-muted">Last updated: {LAST_UPDATED}</p>
            <p className="mt-3 max-w-2xl leading-7 text-q-muted">
              This Privacy Policy explains how QuickFnd ("we", "us", "our") collects, uses, and
              protects information when you use our website at quickfnd.com and its subdomains
              (the "Service"). Please read this carefully.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

            {/* Table of contents — sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-q-border bg-q-card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-q-muted mb-3">Contents</p>
                <nav className="space-y-1">
                  {TOC.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-1.5 text-sm text-q-muted transition hover:bg-q-card-hover hover:text-q-text"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="space-y-10">

              <Section id="overview" title="1. Overview">
                <p>QuickFnd is a free, browser-based platform providing tools, calculators, and AI utilities.
                Most tools on QuickFnd run entirely in your browser — your input data is processed locally
                on your device and is never sent to our servers.</p>
                <p>We are committed to protecting your privacy. This policy describes what limited data we
                do collect, why we collect it, and how we use it. We do not sell your personal data to
                any third party.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="information-we-collect" title="2. Information We Collect">
                <p><strong className="text-q-text">2.1 Information you provide directly</strong></p>
                <p>When you use our contact form, request a tool, or report an issue, you may voluntarily
                provide your name, email address, and a description of your request. This information
                is stored in our database solely to process your request.</p>

                <p><strong className="text-q-text">2.2 Automatically collected information</strong></p>
                <p>When you visit QuickFnd, our hosting provider (Vercel) and analytics services may
                automatically collect:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>IP address (anonymised)</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent</li>
                  <li>Referring URL</li>
                  <li>Device type (desktop, mobile, tablet)</li>
                  <li>General geographic location (country/city level)</li>
                </ul>

                <p><strong className="text-q-text">2.3 Tool usage data</strong></p>
                <p>We may record anonymised, aggregated usage events — such as which tools are used
                and how frequently — to understand which tools are most valuable and to improve the
                platform. We do not record the content of your tool inputs or outputs.</p>

                <p><strong className="text-q-text">2.4 What we do NOT collect</strong></p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>The text, files, or data you process in our tools</li>
                  <li>Passwords you generate using our Password Generator</li>
                  <li>JSON, code, or other content you format or transform</li>
                  <li>Payment or financial information (we have no paid features)</li>
                </ul>
              </Section>

              <div className="divider-gradient" />

              <Section id="how-we-use" title="3. How We Use Information">
                <p>We use the information we collect to:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>Operate, maintain, and improve the QuickFnd platform</li>
                  <li>Respond to tool requests, bug reports, and user inquiries</li>
                  <li>Understand usage patterns to prioritise new tools and features</li>
                  <li>Monitor for abuse, spam, or malicious activity</li>
                  <li>Comply with legal obligations</li>
                  <li>Display relevant advertising through Google AdSense (see Advertising section)</li>
                </ul>
                <p>We do not use your data for automated decision-making that produces legal effects,
                and we do not create individual user profiles.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="cookies" title="4. Cookies & Tracking">
                <p>QuickFnd uses the following types of cookies and local storage:</p>

                <p><strong className="text-q-text">Strictly necessary</strong></p>
                <p>We store your theme preference (light/dark mode) in your browser's localStorage under
                the key <code className="font-mono text-xs bg-q-bg px-1.5 py-0.5 rounded">quickfnd-theme</code>.
                This is not a tracking cookie — it simply remembers your display preference.</p>

                <p><strong className="text-q-text">Analytics cookies</strong></p>
                <p>If Google Analytics is enabled, Google places cookies to measure traffic and usage
                patterns. These cookies collect anonymised aggregate data. You can opt out using
                the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>

                <p><strong className="text-q-text">Advertising cookies</strong></p>
                <p>If Google AdSense is active, Google uses cookies to serve personalised or
                contextual advertisements. You can manage your ad personalisation preferences at
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Google Ad Settings</a>.</p>

                <p><strong className="text-q-text">Managing cookies</strong></p>
                <p>You can disable cookies in your browser settings at any time. Disabling cookies
                will not prevent you from using QuickFnd's tools, but it may affect analytics
                and advertising functionality.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="third-party" title="5. Third-Party Services">
                <p>QuickFnd uses the following third-party services. Each has its own privacy policy:</p>
                <ul className="ml-4 space-y-2 list-disc list-outside">
                  <li><strong className="text-q-text">Vercel</strong> — hosting and edge network.
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a></li>
                  <li><strong className="text-q-text">Supabase</strong> — database for tool requests, usage data, and site settings.
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a></li>
                  <li><strong className="text-q-text">OpenAI</strong> — powers AI tools such as AI Email Writer and AI Prompt Generator.
                    <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a></li>
                  <li><strong className="text-q-text">Google Analytics</strong> — anonymised traffic analytics (if enabled).
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a></li>
                  <li><strong className="text-q-text">Google AdSense</strong> — advertising (if enabled).
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a></li>
                  <li><strong className="text-q-text">ipapi.co</strong> — used by the IP Address Lookup tool to retrieve geolocation data for IP addresses you explicitly submit.
                    <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a></li>
                </ul>
              </Section>

              <div className="divider-gradient" />

              <Section id="advertising" title="6. Advertising">
                <p>QuickFnd may display advertisements served by Google AdSense. Google uses cookies
                and device identifiers to show ads based on your browsing history and interests.</p>
                <p>We do not control the content of Google's advertisements. Google's use of advertising
                cookies is governed by their privacy policy. You can opt out of personalised advertising
                at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">adssettings.google.com</a> or via
                the <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Network Advertising Initiative opt-out page</a>.</p>
                <p>QuickFnd does not receive any personal data from advertising interactions. We only
                receive aggregate performance metrics (impressions, clicks).</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="ai-tools" title="7. AI Tools & Data">
                <p>Several QuickFnd tools use OpenAI's API to generate content — including the
                AI Email Writer, AI Prompt Generator, and AI Blog Outline Generator.</p>
                <p>When you use these tools, the text you enter as input is sent to OpenAI's servers
                to generate a response. <strong className="text-q-text">Do not enter sensitive personal information,
                passwords, confidential business data, or any information you would not want
                shared with a third party</strong> into AI tool input fields.</p>
                <p>OpenAI's data handling is governed by their
                <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Privacy Policy</a>.
                QuickFnd does not store, log, or review the content of your AI tool inputs or outputs.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="data-retention" title="8. Data Retention">
                <p>We retain data for the following periods:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li><strong className="text-q-text">Tool requests and reports</strong> — retained indefinitely to inform our product roadmap. You may request deletion at any time.</li>
                  <li><strong className="text-q-text">Analytics data</strong> — retained for up to 26 months in Google Analytics, after which it is automatically deleted.</li>
                  <li><strong className="text-q-text">Server logs</strong> — Vercel retains server logs for a limited period per their data retention policies.</li>
                  <li><strong className="text-q-text">Browser localStorage</strong> — theme preference remains in your browser until you clear your browser data.</li>
                </ul>
              </Section>

              <div className="divider-gradient" />

              <Section id="your-rights" title="9. Your Rights">
                <p>Depending on your location, you may have the following rights regarding your data:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li><strong className="text-q-text">Access</strong> — request a copy of the personal data we hold about you</li>
                  <li><strong className="text-q-text">Correction</strong> — request correction of inaccurate data</li>
                  <li><strong className="text-q-text">Deletion</strong> — request deletion of your personal data</li>
                  <li><strong className="text-q-text">Opt-out of advertising</strong> — manage ad preferences via Google Ad Settings</li>
                  <li><strong className="text-q-text">Data portability</strong> — request a portable copy of your data</li>
                </ul>
                <p>To exercise any of these rights, contact us via the <Link href="/contact" className="text-blue-500 hover:underline">Contact page</Link>.
                We will respond within 30 days.</p>
                <p>If you are in the European Union, you have additional rights under the GDPR. If you are
                in California, you have additional rights under the CCPA. If you are in India, your rights
                are governed by the Digital Personal Data Protection Act 2023 (DPDPA).</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="children" title="10. Children's Privacy">
                <p>QuickFnd is not directed at children under the age of 13. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us
                and we will promptly delete it.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="security" title="11. Security">
                <p>We take reasonable technical and organisational measures to protect the data we hold.
                These include HTTPS encryption for all data in transit, access controls on our
                database, and regular security reviews.</p>
                <p>However, no internet transmission or electronic storage is 100% secure. We cannot
                guarantee absolute security, and we encourage you not to submit sensitive personal
                data through any web platform.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="changes" title="12. Changes to This Policy">
                <p>We may update this Privacy Policy from time to time. When we make material changes,
                we will update the "Last updated" date at the top of this page. We encourage you to
                review this page periodically.</p>
                <p>Your continued use of QuickFnd after any changes constitutes your acceptance of
                the updated Privacy Policy.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="contact" title="13. Contact Us">
                <p>If you have any questions, concerns, or requests related to this Privacy Policy,
                please contact us:</p>
                <div className="rounded-2xl border border-q-border bg-q-bg p-5 mt-2">
                  <p className="font-semibold text-q-text">QuickFnd</p>
                  <p className="mt-1">Website: <a href="https://quickfnd.com" className="text-blue-500 hover:underline">quickfnd.com</a></p>
                  <p className="mt-1">Contact: <Link href="/contact" className="text-blue-500 hover:underline">quickfnd.com/contact</Link></p>
                </div>
                <p className="text-xs text-q-muted">We aim to respond to all privacy-related enquiries within 30 days.</p>
              </Section>

            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}