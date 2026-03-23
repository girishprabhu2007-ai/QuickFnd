import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import SiteHeader from "@/components/layout/SiteHeader";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QuickFnd — Free Tools, Calculators & AI Utilities",
    template: "%s | QuickFnd",
  },
  description:
    "QuickFnd is a free browser-based platform of tools, calculators, and AI utilities for developers, writers, and everyday productivity. No install needed.",
  keywords: [
    "free online tools",
    "browser tools",
    "online calculators",
    "AI writing tools",
    "developer utilities",
    "text tools",
    "productivity tools",
  ],
  authors: [{ name: "QuickFnd", url: siteUrl }],
  creator: "QuickFnd",
  publisher: "QuickFnd",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "QuickFnd",
    title: "QuickFnd — Free Tools, Calculators & AI Utilities",
    description:
      "Free browser-based tools, calculators, and AI utilities for developers, writers, and everyday productivity. No install needed.",
    images: [
      {
        url: `${siteUrl}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "QuickFnd — Free Tools, Calculators & AI Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickFnd — Free Tools, Calculators & AI Utilities",
    description:
      "Free browser-based tools, calculators, and AI utilities. No install needed.",
    images: [`${siteUrl}/og-default.png`],
    creator: "@quickfnd",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add your Google Search Console verification token here:
    // google: "your-verification-token",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeInitScript = `
    (function() {
      try {
        var stored = localStorage.getItem("quickfnd-theme");
        var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        var theme = stored === "light" || stored === "dark"
          ? stored
          : (prefersLight ? "light" : "dark");

        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {}
    })();
  `;

  // AdSense publisher ID — set NEXT_PUBLIC_ADSENSE_CLIENT in .env.local
  // e.g. NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXXX
  const hasAdsense = Boolean(ADSENSE_CLIENT.trim());

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense — only loads when publisher ID is configured */}
        {hasAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Pass the client ID to the AdSlot component */}
        {hasAdsense && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__ADSENSE_CLIENT__ = "${ADSENSE_CLIENT}";`,
            }}
          />
        )}
      </head>
      <body className="min-h-screen bg-q-bg text-q-text transition-colors">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <div className="min-h-screen bg-q-bg text-q-text">
            <SiteHeader />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
