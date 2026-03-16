import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-q-border bg-q-card">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-q-muted sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-base font-semibold text-q-text">QuickFnd</h3>
            <p className="mt-3 leading-7">
              Practical tools, calculators, and AI utilities built for fast browser-based use.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-q-text">Useful Links</h3>
            <div className="mt-3 space-y-2">
              <div><Link href="/tools" className="hover:text-blue-500">Tools</Link></div>
              <div><Link href="/calculators" className="hover:text-blue-500">Calculators</Link></div>
              <div><Link href="/ai-tools" className="hover:text-blue-500">AI Tools</Link></div>
              <div><Link href="/request-tool" className="hover:text-blue-500">Request a Tool</Link></div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-q-text">Legal</h3>
            <div className="mt-3 space-y-2">
              <div><Link href="/privacy" className="hover:text-blue-500">Privacy Policy</Link></div>
              <div><Link href="/terms" className="hover:text-blue-500">Terms of Use</Link></div>
              <div><Link href="/contact" className="hover:text-blue-500">Contact</Link></div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-q-border pt-6">
          <p>© {new Date().getFullYear()} QuickFnd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}