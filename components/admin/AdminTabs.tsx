"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/generate", label: "Generate" },
  { href: "/admin/bulk-generate", label: "Bulk Generate" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/requests", label: "Requests" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              active
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-q-border bg-q-card text-q-text hover:border-blue-400/50 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}