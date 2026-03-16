import type { ReactNode } from "react";
import AdminTabs from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
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

            <div className="rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-muted">
              Live control panel for tools, calculators, AI tools, and request handling.
            </div>
          </div>
        </div>

        <AdminTabs />

        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}