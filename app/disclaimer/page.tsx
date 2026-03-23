import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "QuickFnd Disclaimer — important information about the limitations and intended use of our tools, calculators, and AI utilities.",
};

const LAST_UPDATED = "March 23, 2026";

export default function DisclaimerPage() {
  return (
    <>
      <main className="min-h-screen bg-q-bg text-q-text">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

          <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-10">
            <div className="badge badge-blue mb-4">⚠️ Disclaimer</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Disclaimer</h1>
            <p className="mt-4 text-q-muted">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="mt-8 space-y-8">

            {/* General */}
            <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-q-text">General Disclaimer</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>The information, tools, calculators, and AI utilities provided on QuickFnd
                (quickfnd.com) are for general informational and productivity purposes only.
                Nothing on this website constitutes professional advice of any kind.</p>
                <p>While we strive to keep our tools accurate and functional, we make no
                representations or warranties of any kind — express or implied — about the
                completeness, accuracy, reliability, suitability, or availability of any tool,
                calculator, or content on this website.</p>
              </div>
            </div>

            {/* Financial */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8"
              style={{ borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.04)" }}>
              <h2 className="text-xl font-bold text-q-text">Financial Calculator Disclaimer</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>QuickFnd's financial calculators — including the EMI Calculator, Loan Calculator,
                GST Calculator, Percentage Calculator, and Simple Interest Calculator — provide
                estimates based solely on the values you enter. These estimates are for general
                guidance only.</p>
                <p><strong className="text-q-text">These calculators do not constitute financial, investment, tax, or
                accounting advice.</strong> Results may differ from actual loan terms due to factors
                including processing fees, insurance, prepayment penalties, variable interest rates,
                and other charges your lender may apply.</p>
                <p>Always verify calculations with your bank, financial institution, or a qualified
                financial adviser before making any financial decision.</p>
              </div>
            </div>

            {/* Health */}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 md:p-8"
              style={{ borderColor: "rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
              <h2 className="text-xl font-bold text-q-text">Health Calculator Disclaimer</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>The BMI Calculator and any other health-related tools on QuickFnd are for
                general screening and informational purposes only. Results are not a medical
                diagnosis and should not be used as a substitute for professional medical advice,
                diagnosis, or treatment.</p>
                <p><strong className="text-q-text">Never disregard professional medical advice or delay seeking it
                because of something you have read or calculated on this website.</strong> Always
                consult a qualified healthcare provider for any health-related questions or concerns.</p>
                <p>BMI is a population-level screening metric. It does not account for muscle mass,
                bone density, age, sex-specific factors, or ethnicity-specific health thresholds.
                It is not a reliable indicator of individual health.</p>
              </div>
            </div>

            {/* AI Tools */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 md:p-8"
              style={{ borderColor: "rgba(37,99,235,0.15)", background: "rgba(37,99,235,0.03)" }}>
              <h2 className="text-xl font-bold text-q-text">AI-Generated Content Disclaimer</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>AI tools on QuickFnd (including the AI Email Writer, AI Prompt Generator, and
                AI Blog Outline Generator) generate content using OpenAI's language models.
                AI-generated content may be inaccurate, outdated, incomplete, biased, or
                otherwise unsuitable for your specific purpose.</p>
                <p><strong className="text-q-text">You are solely responsible for reviewing, editing, and verifying
                all AI-generated content before using it.</strong> Do not send AI-generated emails,
                articles, or communications without careful human review.</p>
                <p>AI-generated content does not represent the views of QuickFnd. QuickFnd accepts
                no responsibility for decisions made or actions taken based on AI-generated outputs.</p>
              </div>
            </div>

            {/* Security tools */}
            <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-q-text">Security Tools Disclaimer</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>Tools such as the Password Generator, SHA256 Generator, MD5 Generator, and
                similar utilities are intended for general use and learning purposes.</p>
                <p><strong className="text-q-text">Do not rely on these tools for critical security infrastructure</strong>
                without independent security review. MD5 and SHA-1 are considered cryptographically
                weak and should not be used for security-sensitive applications. Use SHA-256 or
                stronger algorithms for security-critical use cases.</p>
                <p>Passwords generated by our Password Generator are created client-side using the
                Web Crypto API and are never transmitted to our servers. However, you should
                always store passwords in a reputable password manager rather than relying on
                memory or insecure storage.</p>
              </div>
            </div>

            {/* External links */}
            <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-q-text">External Links Disclaimer</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>QuickFnd may contain links to external websites. These links are provided for
                convenience and do not constitute endorsement of the linked site or its content.
                We have no control over the content, privacy practices, or availability of
                external sites.</p>
                <p>Advertisements displayed on QuickFnd are served by Google AdSense. We do not
                endorse any advertiser or their products and services.</p>
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-q-text">Service Availability</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted md:text-base">
                <p>QuickFnd is provided "as is" and "as available". We do not guarantee that the
                Service will be available at all times, error-free, or uninterrupted. We reserve
                the right to modify, suspend, or discontinue any tool or feature without notice.</p>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-q-text">Questions</h2>
              <div className="mt-4 text-sm leading-7 text-q-muted md:text-base">
                <p>If you have questions about this disclaimer, please visit our{" "}
                <Link href="/contact" className="text-blue-500 hover:underline">Contact page</Link> or
                review our <Link href="/terms" className="text-blue-500 hover:underline">Terms of Use</Link> and{" "}
                <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}