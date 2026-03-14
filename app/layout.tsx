import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QuickFnd",
    template: "%s | QuickFnd",
  },
  description:
    "QuickFnd is an all-in-one platform for online tools, calculators, and AI resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold">
              QuickFnd
            </Link>

            <div className="flex items-center gap-6 text-sm text-gray-300">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
              <Link href="/tools" className="transition hover:text-white">
                Tools
              </Link>
              <Link href="/calculators" className="transition hover:text-white">
                Calculators
              </Link>
              <Link href="/ai-tools" className="transition hover:text-white">
                AI Tools
              </Link>
            </div>
          </nav>
        </header>

        {children}

        <footer className="mt-16 border-t border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-400">
            © 2026 QuickFnd. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}