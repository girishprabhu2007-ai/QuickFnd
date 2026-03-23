import { Suspense } from "react";
import RequestToolClient from "./RequestToolClient";

export default function RequestToolPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
          <section className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
              <p className="text-sm text-q-muted">Loading request form...</p>
            </div>
          </section>
        </main>
      }
    >
      <RequestToolClient />
    </Suspense>
  );
}