"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AUTH_PAGES = new Set(["/admin/login", "/admin/reset-password"]);

// Map pathname to readable page title
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/seo-dashboard": "SEO dashboard",
    "/admin/operations": "Operations",
    "/admin/diagnostics": "Diagnostics",
    "/admin/recently-added": "Recently added",
    "/admin/tools": "Tools",
    "/admin/calculators": "Calculators",
    "/admin/ai-tools": "AI tools",
    "/admin/blog": "Blog",
    "/admin/topics": "Topics",
    "/admin/generate": "Generate",
    "/admin/bulk-generate": "Bulk generate",
    "/admin/placeholders": "Placeholders",
    "/admin/requests": "Requests",
    "/admin/backlinks": "Backlinks",
    "/admin/seo-content": "SEO content",
    "/admin/intelligence": "Intelligence",
    "/admin/authors": "Authors",
    "/admin/guest-posts": "Guest posts",
    "/admin/ads": "Ad settings",
    "/admin/affiliates": "Affiliates",
    "/admin/subscribers": "Subscribers",
    "/admin/site-settings": "Site settings",
    "/admin/applications": "Applications",
  };

  // Exact match
  if (map[pathname]) return map[pathname];

  // Partial match (for nested routes like /admin/blog/something)
  for (const [key, value] of Object.entries(map)) {
    if (key !== "/admin" && pathname.startsWith(key)) return value;
  }

  return "Admin";
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-q-bg text-q-text">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <AdminSidebar />

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-q-border bg-q-card px-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="font-semibold text-q-text transition hover:text-blue-500" style={{ fontSize: "14px" }}>
              QuickFnd
            </Link>
            <span className="text-q-muted">/</span>
            <Link href="/admin" className="text-q-muted transition hover:text-q-text" style={{ fontSize: "13px" }}>
              Admin
            </Link>
            {pathname !== "/admin" && (
              <>
                <span className="text-q-muted">/</span>
                <span className="text-q-text" style={{ fontSize: "13px" }}>
                  {pageTitle}
                </span>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://quickfnd.com"
              target="_blank"
              rel="noopener"
              className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-500/15 dark:text-blue-400"
            >
              View live site
            </a>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-muted transition hover:bg-q-card-hover hover:text-q-text"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
