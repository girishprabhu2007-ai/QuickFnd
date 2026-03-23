"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/generate", label: "Generate" },
  { href: "/admin/bulk-generate", label: "Bulk Generate" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/topics", label: "Topics" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/placeholders", label: "Placeholders" },
  { href: "/admin/ads", label: "Ad Settings" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/admin" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${
              active
                ? "border-q-primary bg-q-primary text-white"
                : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}