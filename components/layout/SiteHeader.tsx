"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/tools",       label: "Tools",       accent: "blue"   },
  { href: "/calculators", label: "Calculators", accent: "purple" },
  { href: "/ai-tools",    label: "AI Tools",    accent: "green"  },
  { href: "/topics",      label: "Topics",      accent: "orange" },
  { href: "/blog",        label: "Blog",        accent: "rose"   },
];


const accentColors: Record<string, string> = {
  blue:   "text-blue-500",
  purple: "text-purple-500",
  green:  "text-green-500",
  orange: "text-orange-500",
  rose:   "text-rose-500",
};

// ─── Language Selector ───────────────────────────────────────────────────────
// Uses Google Translate widget for instant global language support
// No API key needed — free, supports 100+ languages

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
];

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectLanguage(code: string) {
    setCurrent(code);
    setOpen(false);

    if (code === "en") {
      // Reset to English — remove Google Translate cookie
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
      window.location.reload();
      return;
    }

    // Set Google Translate cookie
    const val = `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/`;
    document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`;

    // Trigger Google Translate if loaded
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    } else {
      // Load Google Translate script if not loaded yet
      if (!document.getElementById("google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).googleTranslateElementInit = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (window as any).google.translate.TranslateElement(
            { pageLanguage: "en", includedLanguages: LANGUAGES.map(l => l.code).join(",") },
            "google_translate_element"
          );
          setTimeout(() => {
            const sel = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (sel) { sel.value = code; sel.dispatchEvent(new Event("change")); }
          }, 1000);
        };
      }
    }
  }

  const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-q-border bg-q-bg px-2.5 py-2 text-xs font-medium text-q-muted transition hover:border-blue-400/50 hover:text-q-text"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-q-border bg-q-card shadow-xl overflow-hidden">
          <div className="py-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-q-card-hover ${current === lang.code ? "text-q-primary font-medium" : "text-q-text"}`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {current === lang.code && <span className="ml-auto text-q-primary">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b border-q-border bg-q-card/95 backdrop-blur-xl"
      style={{ boxShadow: "0 1px 0 var(--q-border), 0 4px 24px rgba(0,0,0,0.05)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-sm transition group-hover:scale-105"
            style={{ background: "var(--q-gradient-blue)" }}
          >
            Q
          </div>
          <span className="text-xl font-bold tracking-tight text-q-text">
            Quick<span style={{ color: "var(--q-primary)" }}>Fnd</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? `${accentColors[item.accent]} bg-q-bg`
                    : "text-q-muted hover:bg-q-bg hover:text-q-text"
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-3 h-0.5 rounded-full"
                    style={{ background: `var(--q-gradient-blue)` }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/request-tool"
            className="hidden items-center gap-1.5 rounded-lg border border-q-border bg-q-bg px-3 py-2 text-xs font-medium text-q-muted transition hover:border-blue-400/50 hover:text-q-text sm:flex"
          >
            <span className="text-blue-500">+</span>
            Request a Tool
          </Link>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex items-center gap-1 overflow-x-auto px-4 pb-2.5 md:hidden"
        style={{ scrollbarWidth: "none" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? `${accentColors[item.accent]} bg-q-bg`
                  : "text-q-muted hover:bg-q-bg hover:text-q-text"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/request-tool"
          className="ml-auto flex shrink-0 items-center rounded-lg border border-q-border px-3 py-1.5 text-xs text-q-muted"
        >
          + Request
        </Link>
      </div>
    </header>
  );
}