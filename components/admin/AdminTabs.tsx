"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin",             label: "Dashboard",      icon: "📊" },
  { href: "/admin/generate",    label: "Generate",       icon: "✨" },
  { href: "/admin/bulk-generate", label: "Bulk",         icon: "⚡" },
  { href: "/admin/tools",       label: "Tools",          icon: "⚙️" },
  { href: "/admin/topics",      label: "Topics",         icon: "🗂️" },
  { href: "/admin/requests",    label: "Requests",       icon: "📬" },
  { href: "/admin/placeholders", label: "Placeholders",  icon: "🔧" },
  { href: "/admin/ads",         label: "Ad Settings",    icon: "💰" },
  { href: "/admin/site-settings", label: "Site Settings", icon: "🌐" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/admin" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}