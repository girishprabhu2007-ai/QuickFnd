"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeForm() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUnsubscribe() {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setStatus("done");
      setMessage("You've been unsubscribed. You won't receive any more emails from QuickFnd.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-q-border bg-q-card p-8 text-center shadow-sm">
      <div className="text-4xl mb-4">📭</div>
      <h1 className="text-2xl font-bold text-q-text">Unsubscribe</h1>

      {status === "done" ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-medium text-emerald-700">{message}</p>
          </div>
          <Link
            href="/"
            className="inline-block rounded-xl bg-q-primary px-6 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition"
          >
            Back to QuickFnd →
          </Link>
        </div>
      ) : email ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-q-muted leading-relaxed">
            You are unsubscribing{" "}
            <strong className="text-q-text font-mono text-xs break-all">{email}</strong>{" "}
            from QuickFnd email updates.
          </p>
          {status === "error" && (
            <p className="text-xs text-red-500">{message}</p>
          )}
          <button
            onClick={handleUnsubscribe}
            disabled={status === "loading"}
            className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-60"
          >
            {status === "loading" ? "Unsubscribing..." : "Confirm unsubscribe"}
          </button>
          <Link href="/" className="block text-sm text-q-muted hover:text-q-text transition">
            Cancel — take me back
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-q-muted">
            No email address found in the link. Please use the unsubscribe link from your email.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-400">
            Go to QuickFnd →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-q-bg flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-q-border bg-q-card p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-sm text-q-muted">Loading...</p>
          </div>
        }
      >
        <UnsubscribeForm />
      </Suspense>
    </main>
  );
}