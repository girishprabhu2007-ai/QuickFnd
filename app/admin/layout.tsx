"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminTabs from "@/components/admin/AdminTabs";

const AUTH_PAGES = new Set(["/admin/login", "/admin/reset-password"]);

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-q-bg text-q-text">
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-3xl border border-q-border bg-q-card p-6 shadow-sm md:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
                  Admin Workspace
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                  QuickFnd Admin
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                  Manage publishing, requests, and analytics from one place.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-muted">
                  Live control panel for tools, calculators, AI tools, and request handling.
                </div>
                <form action="/api/admin/logout" method="POST">
                  <button
                    type="submit"
                    className="rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>

          <AdminTabs />

          <div className="mt-8">{children}</div>
        </section>
      </main>

      {/* Admin-only footer — no ads, no public links */}
      <footer className="mt-8 border-t border-q-border bg-q-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-q-muted">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white" style={{ background: "var(--q-gradient-blue)" }}>Q</span>
            <span className="font-medium text-q-text">QuickFnd</span>
            <span className="text-q-border">·</span>
            <span>Admin Panel</span>
            <span className="text-q-border">·</span>
            <span>Internal use only</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-q-muted">
            <a href="https://quickfnd.com" target="_blank" rel="noopener" className="hover:text-blue-500 transition">
              View Live Site →
            </a>
            <a href="/blog" target="_blank" rel="noopener" className="hover:text-blue-500 transition">
              Blog
            </a>
            <a href="/admin" className="hover:text-blue-500 transition">
              Dashboard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}