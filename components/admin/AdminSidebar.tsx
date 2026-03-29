"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Menu structure ───────────────────────────────────────────────────────────

type MenuItem = {
  href: string;
  label: string;
  badge?: "count" | "alert";
  badgeKey?: string;
};

type MenuGroup = {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
};

const GROUPS: MenuGroup[] = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
        <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
        <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/seo-dashboard", label: "SEO dashboard" },
      { href: "/admin/operations", label: "Operations" },
      { href: "/admin/diagnostics", label: "Diagnostics" },
      { href: "/admin/recently-added", label: "Recently added" },
    ],
  },
  {
    key: "content",
    label: "Content",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="5.5" y1="6.5" x2="12.5" y2="6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="5.5" y1="9.5" x2="10.5" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="5.5" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    items: [
      { href: "/admin/tools", label: "Tools", badge: "count", badgeKey: "tools" },
      { href: "/admin/calculators", label: "Calculators", badge: "count", badgeKey: "calculators" },
      { href: "/admin/ai-tools", label: "AI tools", badge: "count", badgeKey: "aiTools" },
      { href: "/admin/blog", label: "Blog", badge: "count", badgeKey: "blog" },
      { href: "/admin/topics", label: "Topics" },
    ],
  },
  {
    key: "publishing",
    label: "Publishing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3v8M5.5 7.5L9 4l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12v2a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0015 14v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    items: [
      { href: "/admin/generate", label: "Generate" },
      { href: "/admin/bulk-generate", label: "Bulk generate" },
      { href: "/admin/placeholders", label: "Placeholders" },
      { href: "/admin/requests", label: "Requests", badge: "alert", badgeKey: "requests" },
    ],
  },
  {
    key: "growth",
    label: "Growth & SEO",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <polyline points="2.5,14 6.5,8.5 10.5,10.5 15.5,4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="15.5" cy="4" r="1.5" fill="currentColor" />
      </svg>
    ),
    items: [
      { href: "/admin/backlinks", label: "Backlinks" },
      { href: "/admin/seo-content", label: "SEO content" },
      { href: "/admin/intelligence", label: "Intelligence" },
      { href: "/admin/authors", label: "Authors" },
      { href: "/admin/guest-posts", label: "Guest posts" },
    ],
  },
  {
    key: "monetisation",
    label: "Monetisation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
        <text x="9" y="12.5" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="500">$</text>
      </svg>
    ),
    items: [
      { href: "/admin/ads", label: "Ad settings" },
      { href: "/admin/affiliates", label: "Affiliates" },
      { href: "/admin/subscribers", label: "Subscribers", badge: "count", badgeKey: "subscribers" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    items: [
      { href: "/admin/site-settings", label: "Site settings" },
      { href: "/admin/applications", label: "Applications", badge: "alert", badgeKey: "applications" },
    ],
  },
];

// ── Badge counts type ────────────────────────────────────────────────────────

type BadgeCounts = {
  tools?: number;
  calculators?: number;
  aiTools?: number;
  blog?: number;
  subscribers?: number;
  requests?: number;
  applications?: number;
};

// ── Find which group a pathname belongs to ───────────────────────────────────

function findActiveGroup(pathname: string): string {
  for (const group of GROUPS) {
    for (const item of group.items) {
      if (item.href === "/admin" && pathname === "/admin") return group.key;
      if (item.href !== "/admin" && pathname.startsWith(item.href)) return group.key;
    }
  }
  return "overview";
}

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(() => findActiveGroup(pathname));
  const [counts, setCounts] = useState<BadgeCounts>({});

  // Update active group when route changes
  useEffect(() => {
    setActiveGroup(findActiveGroup(pathname));
  }, [pathname]);

  // Fetch badge counts
  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard-stats");
      if (!res.ok) return;
      const data = await res.json();
      setCounts({
        tools: data.counts?.tools || 0,
        calculators: data.counts?.calculators || 0,
        aiTools: data.counts?.aiTools || 0,
        blog: 0, // blog count not in dashboard-stats yet
        subscribers: 0,
        requests: data.counts?.requests || 0,
        applications: 0,
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  // Check if any item in a group has an alert badge
  function groupHasAlert(group: MenuGroup): boolean {
    return group.items.some(
      (item) => item.badge === "alert" && item.badgeKey && (counts[item.badgeKey as keyof BadgeCounts] || 0) > 0
    );
  }

  const currentGroup = GROUPS.find((g) => g.key === activeGroup) || GROUPS[0];

  return (
    <div className="flex h-full">

      {/* ── Dark icon rail ───────────────────────────────────────────────── */}
      <div className="flex w-[52px] flex-col items-center gap-1 bg-[#16131f] py-3 dark:bg-[#0d0b14]">

        {/* Logo */}
        <Link href="/admin" className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: "var(--q-gradient-purple)" }}>
          Q
        </Link>

        {/* Group icons */}
        {GROUPS.map((group) => {
          const isActive = activeGroup === group.key;
          const hasAlert = groupHasAlert(group);
          return (
            <button
              key={group.key}
              onClick={() => {
                setActiveGroup(group.key);
                if (collapsed) setCollapsed(false);
              }}
              title={group.label}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-white/[0.1] text-white"
                  : "text-white/[0.4] hover:bg-white/[0.06] hover:text-white/[0.7]"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 h-5 w-[3px] rounded-r-full bg-[#7c3aed]" />
              )}
              {group.icon}
              {/* Alert dot */}
              {hasAlert && (
                <span className="absolute right-1 top-1 h-[7px] w-[7px] rounded-full bg-red-500 ring-[1.5px] ring-[#16131f]" />
              )}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/[0.25] transition-colors hover:bg-white/[0.06] hover:text-white/[0.5]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Sidebar panel (collapsible) ──────────────────────────────────── */}
      {!collapsed && (
        <div className="flex w-[200px] flex-col border-r border-q-border bg-q-bg overflow-y-auto">

          {/* Group label */}
          <div className="px-4 pb-1 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-q-muted">
              {currentGroup.label}
            </p>
          </div>

          {/* Items */}
          <nav className="flex-1 px-2 pb-4 pt-1">
            {currentGroup.items.map((item) => {
              const active = isItemActive(pathname, item.href);
              const badgeValue = item.badgeKey ? counts[item.badgeKey as keyof BadgeCounts] : undefined;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-[7px] text-[13px] transition-colors ${
                    active
                      ? "bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400"
                      : "text-q-muted hover:bg-q-card-hover hover:text-q-text"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge === "count" && badgeValue !== undefined && badgeValue > 0 && (
                    <span className="rounded bg-q-card px-1.5 py-[1px] text-[10px] tabular-nums text-q-muted">
                      {badgeValue}
                    </span>
                  )}
                  {item.badge === "alert" && badgeValue !== undefined && badgeValue > 0 && (
                    <span className="rounded bg-amber-100 px-1.5 py-[1px] text-[10px] font-semibold tabular-nums text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                      {badgeValue}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider + other groups quick access */}
          <div className="border-t border-q-border px-2 py-3">
            <div className="flex flex-wrap gap-1">
              {GROUPS.filter((g) => g.key !== activeGroup).map((group) => (
                <button
                  key={group.key}
                  onClick={() => setActiveGroup(group.key)}
                  className="rounded-md px-2 py-1 text-[10px] text-q-muted transition-colors hover:bg-q-card-hover hover:text-q-text"
                  title={group.label}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
