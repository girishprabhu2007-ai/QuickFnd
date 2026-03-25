/**
 * components/email/EmailCapture.tsx
 * Homepage email capture banner — "Get notified when new tools launch"
 * Client component — handles submission, shows states, no page reload.
 */

"use client";

import { useState } from "react";

type Props = {
  source?: string;
  variant?: "banner" | "inline"; // banner = full-width homepage strip, inline = compact
};

export default function EmailCapture({ source = "homepage", variant = "banner" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };

      if (!res.ok) throw new Error(data.error || "Subscription failed.");
      setStatus("success");
      setMessage(data.message || "Subscribed!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (variant === "inline") {
    return (
      <div className="rounded-2xl border border-q-border bg-q-card p-5">
        <h3 className="text-sm font-semibold text-q-text">🔔 Get notified</h3>
        <p className="mt-1 text-xs text-q-muted leading-relaxed">
          New tools launch weekly. Get an email when they go live.
        </p>
        {status === "success" ? (
          <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium">
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-xs text-q-text outline-none focus:border-blue-400/60 transition"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-q-primary px-3 py-2 text-xs font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Notify me"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-1 text-xs text-red-500">{message}</p>
        )}
      </div>
    );
  }

  // Banner variant — full-width homepage section
  return (
    <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/8 via-q-card to-q-card p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              Stay in the loop
            </span>
          </div>
          <h2 className="text-xl font-bold text-q-text md:text-2xl">
            New tools launch every week
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-q-muted">
            Get a short email when new tools, calculators, and AI utilities go live on QuickFnd.
            No spam — just useful updates, max once a week.
          </p>
        </div>

        <div className="w-full md:w-auto md:min-w-[320px]">
          {status === "success" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <p className="text-sm font-semibold text-emerald-700">{message}</p>
              <p className="mt-1 text-xs text-emerald-600">Check your inbox for a welcome email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text outline-none focus:border-blue-400/60 focus:bg-q-card transition placeholder:text-q-muted"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              >
                {status === "loading" ? "Subscribing..." : "Notify me when new tools launch →"}
              </button>
              {status === "error" && (
                <p className="text-xs text-red-500 text-center">{message}</p>
              )}
              <p className="text-xs text-q-muted text-center">
                Free. Unsubscribe anytime. No spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}