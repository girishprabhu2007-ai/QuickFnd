import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/calculators", label: "Calculators" },
  { href: "/ai-tools", label: "AI Tools" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-q-border bg-q-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold text-q-text">
            QuickFnd
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <nav className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-q-muted transition hover:bg-q-card-hover hover:text-q-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}