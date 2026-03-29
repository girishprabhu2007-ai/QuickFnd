"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = { href: string; label: string; badge?: "count" | "alert"; badgeKey?: string };
type MenuGroup = { key: string; label: string; icon: React.ReactNode; items: MenuItem[] };

const GROUPS: MenuGroup[] = [
  {
    key: "overview", label: "Overview",
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1.5" y="1.5" width="7" height="7" rx="2" fill="currentColor" opacity="0.85"/><rect x="11.5" y="1.5" width="7" height="7" rx="2" fill="currentColor" opacity="0.35"/><rect x="1.5" y="11.5" width="7" height="7" rx="2" fill="currentColor" opacity="0.35"/><rect x="11.5" y="11.5" width="7" height="7" rx="2" fill="currentColor" opacity="0.35"/></svg>,
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/hub", label: "Command Hub" },
      { href: "/admin/health", label: "System Health" },
      { href: "/admin/seo-dashboard", label: "SEO Dashboard" },
      { href: "/admin/operations", label: "Operations" },
      { href: "/admin/diagnostics", label: "Diagnostics" },
      { href: "/admin/recently-added", label: "Recently Added" },
    ],
  },
  {
    key: "content", label: "Content",
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="6" y1="10.5" x2="12" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="6" y1="14" x2="9.5" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    items: [
      { href: "/admin/tools", label: "Tools", badge: "count", badgeKey: "tools" },
      { href: "/admin/calculators", label: "Calculators", badge: "count", badgeKey: "calculators" },
      { href: "/admin/ai-tools", label: "AI Tools", badge: "count", badgeKey: "aiTools" },
      { href: "/admin/blog", label: "Blog", badge: "count", badgeKey: "blog" },
      { href: "/admin/authors", label: "Authors" },
      { href: "/admin/guest-posts", label: "Guest Posts" },
      { href: "/admin/topics", label: "Topics" },
    ],
  },
  {
    key: "publishing", label: "Publishing",
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v9M6 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 13.5v2.5a2 2 0 002 2h10a2 2 0 002-2v-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    items: [
      { href: "/admin/generate", label: "Generate" },
      { href: "/admin/bulk-generate", label: "Bulk Generate" },
      { href: "/admin/placeholders", label: "Placeholders" },
      { href: "/admin/requests", label: "Requests", badge: "alert", badgeKey: "requests" },
      { href: "/admin/applications", label: "Applications", badge: "alert", badgeKey: "applications" },
    ],
  },
  {
    key: "growth", label: "Growth & SEO",
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="2.5,16 7,9 11,11.5 17.5,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="17.5" cy="4" r="2" fill="currentColor"/></svg>,
    items: [
      { href: "/admin/backlinks", label: "Backlinks" },
      { href: "/admin/seo-content", label: "SEO Content" },
      { href: "/admin/intelligence", label: "Intelligence" },
    ],
  },
  {
    key: "monetisation", label: "Monetisation",
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><text x="10" y="14" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="500">$</text></svg>,
    items: [
      { href: "/admin/ads", label: "Ad Settings" },
      { href: "/admin/affiliates", label: "Affiliates" },
      { href: "/admin/subscribers", label: "Subscribers", badge: "count", badgeKey: "subscribers" },
    ],
  },
  {
    key: "settings", label: "Settings",
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 1.5v2.5M10 16v2.5M1.5 10H4M16 10h2.5M4.2 4.2l1.8 1.8M14 14l1.8 1.8M15.8 4.2l-1.8 1.8M6 14l-1.8 1.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    items: [
      { href: "/admin/site-settings", label: "Site Settings" },
    ],
  },
];

type BadgeCounts = { tools?: number; calculators?: number; aiTools?: number; blog?: number; subscribers?: number; requests?: number; applications?: number };

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

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(() => findActiveGroup(pathname));
  const [counts, setCounts] = useState<BadgeCounts>({});

  useEffect(() => { setActiveGroup(findActiveGroup(pathname)); }, [pathname]);

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard-stats");
      if (!res.ok) return;
      const data = await res.json();
      setCounts({ tools: data.counts?.tools || 0, calculators: data.counts?.calculators || 0, aiTools: data.counts?.aiTools || 0, blog: 0, subscribers: 0, requests: data.counts?.requests || 0, applications: 0 });
    } catch {}
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  function groupHasAlert(group: MenuGroup): boolean {
    return group.items.some(item => item.badge === "alert" && item.badgeKey && (counts[item.badgeKey as keyof BadgeCounts] || 0) > 0);
  }

  const currentGroup = GROUPS.find(g => g.key === activeGroup) || GROUPS[0];

  return (
    <div className="flex h-full">
      <div className="flex w-[56px] flex-col items-center gap-1.5 bg-[#16131f] py-3 dark:bg-[#0d0b14]">
        <Link href="/admin" className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: "var(--q-gradient-purple)" }}>Q</Link>
        {GROUPS.map(group => {
          const isActive = activeGroup === group.key;
          const hasAlert = groupHasAlert(group);
          return (
            <button key={group.key} onClick={() => { setActiveGroup(group.key); if (collapsed) setCollapsed(false); }} title={group.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-white/[0.12] text-white" : "text-white/[0.35] hover:bg-white/[0.07] hover:text-white/[0.65]"}`}>
              {isActive && <span className="absolute left-0 top-2 h-6 w-[3px] rounded-r-full bg-[#7c3aed]" />}
              {group.icon}
              {hasAlert && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#16131f]" />}
            </button>
          );
        })}
        <div className="flex-1" />
        <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/[0.2] transition-colors hover:bg-white/[0.06] hover:text-white/[0.5]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}><path d="M10 3L5.5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {!collapsed && (
        <div className="flex w-[210px] flex-col border-r border-q-border bg-q-bg overflow-y-auto">
          <div className="px-4 pb-1 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-q-muted">{currentGroup.label}</p>
          </div>
          <nav className="flex-1 px-2 pb-4 pt-1.5">
            {currentGroup.items.map(item => {
              const active = isItemActive(pathname, item.href);
              const badgeValue = item.badgeKey ? counts[item.badgeKey as keyof BadgeCounts] : undefined;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-[14px] transition-colors ${active ? "bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400" : "text-q-muted hover:bg-q-card-hover hover:text-q-text"}`}>
                  <span className="truncate">{item.label}</span>
                  {item.badge === "count" && badgeValue !== undefined && badgeValue > 0 && (
                    <span className="rounded-md bg-q-card px-1.5 py-0.5 text-[11px] tabular-nums text-q-muted border border-q-border">{badgeValue}</span>
                  )}
                  {item.badge === "alert" && badgeValue !== undefined && badgeValue > 0 && (
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">{badgeValue}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-q-border px-3 py-3">
            <div className="flex flex-wrap gap-1">
              {GROUPS.filter(g => g.key !== activeGroup).map(group => (
                <button key={group.key} onClick={() => setActiveGroup(group.key)}
                  className="rounded-md px-2 py-1 text-[11px] text-q-muted transition-colors hover:bg-q-card-hover hover:text-q-text" title={group.label}>{group.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
