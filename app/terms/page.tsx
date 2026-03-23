import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "QuickFnd Terms of Use — the rules and conditions governing your use of our free browser-based tools, calculators, and AI utilities.",
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
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Description of Service" },
  { id: "permitted-use", label: "Permitted Use" },
  { id: "prohibited-use", label: "Prohibited Use" },
  { id: "accuracy", label: "Accuracy of Results" },
  { id: "ai-tools", label: "AI Tool Terms" },
  { id: "ip", label: "Intellectual Property" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "advertising", label: "Advertising" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg text-q-text">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

          {/* Header */}
          <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-10">
            <div className="badge badge-blue mb-4">⚖️ Legal</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Terms of Use</h1>
            <p className="mt-4 text-q-muted">Last updated: {LAST_UPDATED}</p>
            <p className="mt-3 max-w-2xl leading-7 text-q-muted">
              These Terms of Use ("Terms") govern your access to and use of QuickFnd ("we", "us", "our")
              at quickfnd.com (the "Service"). By using QuickFnd, you agree to these Terms. If you do
              not agree, please do not use the Service.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

            {/* Table of contents */}
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

              <Section id="acceptance" title="1. Acceptance of Terms">
                <p>By accessing or using QuickFnd, you confirm that you are at least 13 years of age
                and have the legal capacity to enter into this agreement. If you are using QuickFnd
                on behalf of an organisation, you represent that you have authority to bind that
                organisation to these Terms.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="description" title="2. Description of Service">
                <p>QuickFnd provides a collection of free, browser-based tools, calculators, and AI
                utilities including but not limited to text tools, developer utilities, financial
                calculators, and AI-powered writing assistants.</p>
                <p>The Service is provided free of charge. We reserve the right to add, modify,
                suspend, or remove any tool or feature at any time without prior notice.</p>
                <p>Some tools use third-party APIs (including OpenAI) to deliver results. The availability
                of these tools depends on third-party service availability and is not guaranteed.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="permitted-use" title="3. Permitted Use">
                <p>You may use QuickFnd for:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>Personal productivity and everyday digital tasks</li>
                  <li>Professional work, development, writing, and content creation</li>
                  <li>Educational purposes</li>
                  <li>Research and informational purposes</li>
                  <li>Commercial use of outputs generated by the tools, subject to applicable laws</li>
                </ul>
              </Section>

              <div className="divider-gradient" />

              <Section id="prohibited-use" title="4. Prohibited Use">
                <p>You may not use QuickFnd to:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>Violate any applicable local, national, or international law or regulation</li>
                  <li>Generate, distribute, or use content that is unlawful, defamatory, obscene, fraudulent, or harmful</li>
                  <li>Attempt to gain unauthorised access to any part of the Service, our servers, or any connected systems</li>
                  <li>Scrape, crawl, or systematically extract data from the Service using automated tools without our written permission</li>
                  <li>Introduce malware, viruses, trojans, or any other malicious code</li>
                  <li>Use the AI tools to generate spam, phishing content, or any content designed to deceive people</li>
                  <li>Impersonate any person, organisation, or entity</li>
                  <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
                  <li>Use the Service in any way that could disable, overburden, or impair its infrastructure</li>
                  <li>Circumvent or attempt to circumvent any security features of the Service</li>
                </ul>
                <p>We reserve the right to terminate access for any user who violates these prohibitions.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="accuracy" title="5. Accuracy of Results">
                <p>QuickFnd tools are provided for general informational and productivity purposes only.</p>
                <p><strong className="text-q-text">Financial calculators</strong> (including EMI, loan, GST, and percentage calculators)
                produce estimates based on the inputs you provide. Results should not be treated as
                professional financial advice. Always verify calculations with a qualified financial
                adviser before making financial decisions.</p>
                <p><strong className="text-q-text">Health calculators</strong> (including BMI) produce screening estimates only.
                Results are not a medical diagnosis or professional health advice. Consult a qualified
                healthcare provider for any health-related decisions.</p>
                <p><strong className="text-q-text">Developer tools</strong> (including hash generators, encoders, and formatters)
                are provided as-is. Do not rely on them for security-critical production systems
                without independent verification.</p>
                <p>We make no warranty that any tool result is accurate, complete, or fit for any
                particular purpose.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="ai-tools" title="6. AI Tool Terms">
                <p>QuickFnd's AI tools use the OpenAI API to generate content. By using these tools:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>You acknowledge that AI-generated content may be inaccurate, incomplete, or inappropriate</li>
                  <li>You are responsible for reviewing, editing, and verifying all AI-generated outputs before use</li>
                  <li>You must not submit sensitive personal data, passwords, confidential information, or proprietary business secrets as inputs</li>
                  <li>You must not use AI tools to generate content that violates applicable laws, infringes copyright, or causes harm</li>
                  <li>You agree to OpenAI's usage policies in addition to these Terms</li>
                </ul>
                <p>QuickFnd does not store or review AI tool inputs or outputs. You retain full
                responsibility for the content you generate and how you use it.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="ip" title="7. Intellectual Property">
                <p><strong className="text-q-text">Our content:</strong> The QuickFnd name, logo, website design, tool interfaces,
                and written content are owned by or licensed to QuickFnd and are protected by
                intellectual property laws. You may not reproduce, distribute, or create derivative
                works without our written permission.</p>
                <p><strong className="text-q-text">Your content:</strong> You retain all rights to the data you input into
                QuickFnd tools. By submitting a tool request or contacting us, you grant us a
                limited, non-exclusive licence to use that information solely to evaluate and
                improve our product.</p>
                <p><strong className="text-q-text">Tool outputs:</strong> Results generated by QuickFnd tools (e.g. passwords,
                formatted text, QR codes) are produced by algorithms and do not attract copyright
                protection. You may use them freely for personal and commercial purposes.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="third-party" title="8. Third-Party Services">
                <p>QuickFnd integrates third-party services including Vercel (hosting), Supabase
                (database), OpenAI (AI capabilities), and Google (analytics and advertising).
                Your use of QuickFnd is subject to their respective terms of service and
                privacy policies.</p>
                <p>We are not responsible for the availability, accuracy, or conduct of any
                third-party service. Links to third-party websites are provided for convenience
                only and do not constitute an endorsement.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="advertising" title="9. Advertising">
                <p>QuickFnd may display advertisements served by Google AdSense. Advertisements
                are clearly separated from tool content. We do not endorse any advertised product
                or service.</p>
                <p>If you click on an advertisement, you will be directed to a third-party website
                governed by its own terms and privacy policy. QuickFnd is not responsible for
                the content or practices of advertised third parties.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="disclaimers" title="10. Disclaimers">
                <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, QUICKFND DISCLAIMS
                ALL WARRANTIES INCLUDING, WITHOUT LIMITATION:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                  <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
                  <li>Warranties that results obtained from the Service will be accurate or reliable</li>
                  <li>Warranties that any defects will be corrected</li>
                </ul>
                <p>Some jurisdictions do not allow the exclusion of implied warranties, so some of
                the above may not apply to you.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="liability" title="11. Limitation of Liability">
                <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, QUICKFND AND ITS OPERATORS
                SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>Loss of profits, revenue, data, or business opportunities</li>
                  <li>Damages arising from reliance on tool outputs for financial, medical, legal, or professional decisions</li>
                  <li>Damages resulting from unauthorised access to your account or data</li>
                  <li>Any damages resulting from third-party service disruptions</li>
                </ul>
                <p>Our total liability to you for any claim arising from or related to the Service
                shall not exceed the amount you paid to use the Service in the twelve months
                preceding the claim (which is zero, as the Service is free).</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="indemnification" title="12. Indemnification">
                <p>You agree to indemnify, defend, and hold harmless QuickFnd and its operators from
                any claims, damages, losses, liabilities, and expenses (including reasonable legal
                fees) arising from:</p>
                <ul className="ml-4 space-y-1 list-disc list-outside">
                  <li>Your use of or inability to use the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights, including intellectual property rights</li>
                  <li>Content you submit or generate through the Service</li>
                </ul>
              </Section>

              <div className="divider-gradient" />

              <Section id="termination" title="13. Termination">
                <p>We may suspend or terminate your access to the Service at any time, with or
                without notice, for any reason including violation of these Terms.</p>
                <p>Upon termination, all licences granted to you under these Terms will immediately
                cease. Sections 7, 10, 11, 12, and 14 survive termination.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="governing-law" title="14. Governing Law">
                <p>These Terms are governed by the laws of India. Any disputes arising under or
                in connection with these Terms shall be subject to the exclusive jurisdiction
                of the courts of India.</p>
                <p>If any provision of these Terms is found to be unenforceable, the remaining
                provisions shall continue in full force and effect.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="changes" title="15. Changes to Terms">
                <p>We may update these Terms from time to time. When we do, we will update the
                "Last updated" date at the top of this page. Material changes will be effective
                30 days after posting.</p>
                <p>Your continued use of the Service after any changes constitutes your acceptance
                of the updated Terms. If you do not agree, stop using the Service.</p>
              </Section>

              <div className="divider-gradient" />

              <Section id="contact" title="16. Contact">
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="rounded-2xl border border-q-border bg-q-bg p-5 mt-2">
                  <p className="font-semibold text-q-text">QuickFnd</p>
                  <p className="mt-1">Website: <a href="https://quickfnd.com" className="text-blue-500 hover:underline">quickfnd.com</a></p>
                  <p className="mt-1">Contact: <Link href="/contact" className="text-blue-500 hover:underline">quickfnd.com/contact</Link></p>
                </div>
              </Section>

            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}