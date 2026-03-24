import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

// Load fonts via next/font — self-hosted on Vercel edge, no render blocking
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
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@supabase/supabase-js";

const siteUrl = getSiteUrl();
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

// ─── Load site settings from DB at build/request time ────────────────────────
async function getSiteSettings() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!url || !key) return null;

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle();

    return data?.value ?? null;
  } catch {
    return null;
  }
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
    default: "QuickFnd — Free Tools, Calculators & AI Utilities",
    template: "%s | QuickFnd",
  },
  description:
    "QuickFnd is a free browser-based platform of 199+ tools, calculators, and AI utilities. No install, no account — just results.",
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
      "199+ free browser-based tools, calculators, and AI utilities. No install needed.",
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
    description: "199+ free browser-based tools, calculators, and AI utilities. No install needed.",
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
  // Load site settings from DB — drives verification codes, analytics, custom scripts
  const siteSettings = await getSiteSettings();

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
        {/* ── Performance: preconnect to critical origins ─────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ── Search engine verification ───────────────────────────────── */}
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

        {/* ── Google Tag Manager ───────────────────────────────────────── */}
        {hasGTM && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}

        {/* ── Google Analytics 4 (direct, only if no GTM) ─────────────── */}
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

        {/* ── Facebook Pixel ───────────────────────────────────────────── */}
        {hasFbPixel && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');`,
            }}
          />
        )}

        {/* ── Google AdSense ───────────────────────────────────────────── */}
        {hasAdsense && (
          <script
            async
            defer
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {hasAdsense && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__ADSENSE_CLIENT__="${ADSENSE_CLIENT}";`,
            }}
          />
        )}

        {/* ── Custom head scripts (from Admin → Site Settings) ─────────── */}
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

        {/* ── Custom body scripts (from Admin → Site Settings) ─────────── */}
        {customBodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: customBodyScripts }} />
        )}
      </body>
    </html>
  );
}