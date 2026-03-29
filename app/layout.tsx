import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
  preload: false,
});
import ThemeProvider from "@/components/theme/ThemeProvider";
import SiteHeader from "@/components/layout/SiteHeader";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import { Suspense } from "react";
import EmbedModeDetector from "@/components/embed/EmbedModeDetector";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@supabase/supabase-js";

const siteUrl = getSiteUrl();

// â”€â”€â”€ Load site settings from DB at build/request time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function getSettings() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!url || !key) return { site: null, ads: null };

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const [siteRes, adsRes] = await Promise.all([
      supabase.from("site_settings").select("value").eq("key", "site_settings").maybeSingle(),
      supabase.from("site_settings").select("value").eq("key", "ad_settings").maybeSingle(),
    ]);

    return {
      site: siteRes.data?.value ?? null,
      ads:  adsRes.data?.value  ?? null,
    };
  } catch {
    return { site: null, ads: null };
  }
}

async function getSiteSettings() {
  return (await getSettings()).site;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QuickFnd â€” Free Tools, Calculators & AI Utilities",
    template: "%s | QuickFnd",
  },
  description:
    "QuickFnd is a free browser-based platform of 205+ tools, calculators, and AI utilities. No install, no account â€” just results.",
  keywords: [
    "free online tools",
    "browser tools",
    "online calculators",
    "AI writing tools",
    "developer utilities",
    "text tools",
    "productivity tools",
    "JSON formatter",
    "password generator",
    "BMI calculator",
  ],
  authors: [{ name: "QuickFnd", url: siteUrl }],
  creator: "QuickFnd",
  publisher: "QuickFnd",
  manifest: "/manifest.json",
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
    title: "QuickFnd â€” Free Tools, Calculators & AI Utilities",
    description:
      "205+ free browser-based tools, calculators, and AI utilities. No install needed.",
    images: [
      {
        url: `${siteUrl}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "QuickFnd â€” Free Tools, Calculators & AI Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickFnd â€” Free Tools, Calculators & AI Utilities",
    description: "205+ free browser-based tools, calculators, and AI utilities. No install needed.",
    images: [`${siteUrl}/og-default.png`],
    creator: "@quickfnd",
  },
  alternates: { canonical: siteUrl },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site: siteSettings, ads: adSettings } = await getSettings();

  const ADSENSE_CLIENT =
    (adSettings as Record<string, unknown> | null)?.adsense_client as string | undefined
    ?? process.env.NEXT_PUBLIC_ADSENSE_CLIENT
    ?? "";

  const googleVerification = siteSettings?.google_site_verification ?? "";
  const bingVerification = siteSettings?.bing_site_verification ?? "";
  const yandexVerification = siteSettings?.yandex_verification ?? "";
  const gaId = siteSettings?.google_analytics_id ?? "";
  const gtmId = siteSettings?.google_tag_manager_id ?? "";
  const fbPixelId = siteSettings?.facebook_pixel_id ?? "";
  const fbDomainVerification = siteSettings?.facebook_domain_verification ?? "";
  const customHeadScripts = siteSettings?.custom_head_scripts ?? "";
  const customBodyScripts = siteSettings?.custom_body_scripts ?? "";

  const hasAdsense = Boolean(ADSENSE_CLIENT.trim());
  const hasGA = Boolean(gaId.trim());
  const hasGTM = Boolean(gtmId.trim());
  const hasFbPixel = Boolean(fbPixelId.trim());

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

  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        {/* Performance: preconnect & dns-prefetch */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* â”€â”€ PWA: apple-touch-icon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="QuickFnd" />

        {/* Search engine verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}
        {bingVerification && (
          <meta name="msvalidate.01" content={bingVerification} />
        )}
        {yandexVerification && (
          <meta name="yandex-verification" content={yandexVerification} />
        )}
        {fbDomainVerification && (
          <meta name="facebook-domain-verification" content={fbDomainVerification} />
        )}

        {/* â”€â”€ Google Tag Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {hasGTM && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}

        {/* â”€â”€ Google Analytics 4 (direct, only if no GTM) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {hasGA && !hasGTM && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}

        {/* â”€â”€ Facebook Pixel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {hasFbPixel && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');`,
            }}
          />
        )}

        {/* â”€â”€ Google AdSense â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {hasAdsense && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.__ADSENSE_CLIENT__="${ADSENSE_CLIENT}";
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    var s = document.createElement('script');
                    s.async = true; s.crossOrigin = 'anonymous';
                    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}';
                    document.head.appendChild(s);
                  }, 3000);
                });
              `,
            }}
          />
        )}

        {/* â”€â”€ Custom head scripts (from Admin â†’ Site Settings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {customHeadScripts && (
          <div
            dangerouslySetInnerHTML={{ __html: customHeadScripts }}
            style={{ display: "none" }}
          />
        )}
      </head>

      <body className="min-h-screen bg-q-bg text-q-text transition-colors">
        {/* GTM noscript */}
        {hasGTM && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        <ThemeProvider>
          <div className="min-h-screen bg-q-bg text-q-text">
            <SiteHeader />
            {children}
          </div>
        </ThemeProvider>

        {/* â”€â”€ Service Worker Registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <ServiceWorkerRegistrar />
            <Suspense fallback={null}><EmbedModeDetector /></Suspense>

        {/* â”€â”€ Custom body scripts (from Admin â†’ Site Settings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {customBodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: customBodyScripts }} />
        )}
      </body>
    </html>
  );
}