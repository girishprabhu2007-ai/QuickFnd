"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/tools",       label: "Tools",       accent: "blue"   },
  { href: "/calculators", label: "Calculators", accent: "purple" },
  { href: "/ai-tools",    label: "AI Tools",    accent: "green"  },
  { href: "/topics",      label: "Topics",      accent: "orange" },
];

const accentColors: Record<string, string> = {
  blue:   "text-blue-500",
  purple: "text-purple-500",
  green:  "text-green-500",
  orange: "text-orange-500",
};

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