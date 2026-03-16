import type { ReactNode } from "react";
import AdminTabs from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">QuickFnd Admin</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            Manage publishing, requests, and analytics from one place.
          </p>
        </div>

        <AdminTabs />

        {children}
      </section>
    </main>
  );
}