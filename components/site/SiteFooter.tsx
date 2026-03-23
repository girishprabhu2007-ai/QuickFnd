import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-q-border bg-q-card">
      {/* Footer leaderboard ad — above footer links */}
      <div className="border-b border-q-border py-4">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <AdSlot type="leaderboard" label={true} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-q-muted sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-base font-semibold text-q-text">QuickFnd</h3>
            <p className="mt-3 leading-7">
              Free browser-based tools, calculators, and AI utilities for
              developers, writers, and everyday productivity.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-q-text">Tools</h3>
            <div className="mt-3 space-y-2">
              <div>
                <Link href="/tools" className="hover:text-blue-500">
                  All Tools
                </Link>
              </div>
              <div>
                <Link href="/calculators" className="hover:text-blue-500">
                  Calculators
                </Link>
              </div>
              <div>
                <Link href="/ai-tools" className="hover:text-blue-500">
                  AI Tools
                </Link>
              </div>
              <div>
                <Link href="/topics" className="hover:text-blue-500">
                  Topics
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-q-text">Popular</h3>
            <div className="mt-3 space-y-2">
              <div>
                <Link
                  href="/tools/password-generator"
                  className="hover:text-blue-500"
                >
                  Password Generator
                </Link>
              </div>
              <div>
                <Link
                  href="/tools/json-formatter"
                  className="hover:text-blue-500"
                >
                  JSON Formatter
                </Link>
              </div>
              <div>
                <Link
                  href="/calculators/bmi-calculator"
                  className="hover:text-blue-500"
                >
                  BMI Calculator
                </Link>
              </div>
              <div>
                <Link
                  href="/calculators/emi-calculator"
                  className="hover:text-blue-500"
                >
                  EMI Calculator
                </Link>
              </div>
              <div>
                <Link
                  href="/ai-tools/ai-email-writer"
                  className="hover:text-blue-500"
                >
                  AI Email Writer
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-q-text">Company</h3>
            <div className="mt-3 space-y-2">
              <div>
                <Link href="/privacy" className="hover:text-blue-500">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link href="/terms" className="hover:text-blue-500">
                  Terms of Use
                </Link>
              </div>
              <div>
                <Link href="/contact" className="hover:text-blue-500">
                  Contact
                </Link>
              </div>
              <div>
                <Link href="/request-tool" className="hover:text-blue-500">
                  Request a Tool
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-q-border pt-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} QuickFnd. All rights reserved.</p>
            <p className="text-xs text-q-muted opacity-60">
              This site may display advertisements.{" "}
              <Link href="/privacy" className="hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
