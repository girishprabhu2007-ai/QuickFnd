"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Login failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send reset email.");
      }

      setSuccess(
        data?.message || "If the email is allowed, a reset link has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-q-bg px-4 py-10 text-q-text sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm md:p-10">
          <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
            QuickFnd Admin
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Manage your SaaS publishing system
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-q-muted md:text-lg">
            Access the internal dashboard to manage tools, calculators, AI utilities,
            user demand, and publishing workflows.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-q-border bg-q-bg p-5">
              <h2 className="text-sm font-semibold text-q-text">Publishing control</h2>
              <p className="mt-2 text-sm leading-6 text-q-muted">
                Create, review, and remove public content from one place.
              </p>
            </div>
            <div className="rounded-2xl border border-q-border bg-q-bg p-5">
              <h2 className="text-sm font-semibold text-q-text">Demand tracking</h2>
              <p className="mt-2 text-sm leading-6 text-q-muted">
                Review requests and usage patterns to decide what to build next.
              </p>
            </div>
          </div>

          <div className="mt-8 text-sm text-q-muted">
            Return to{" "}
            <Link href="/" className="font-medium text-q-text underline underline-offset-4">
              QuickFnd homepage
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm md:p-10">
          <div className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted inline-flex">
            {mode === "login" ? "Secure Sign In" : "Password Recovery"}
          </div>

          <h2 className="mt-5 text-3xl font-bold">
            {mode === "login" ? "Admin Login" : "Reset Admin Password"}
          </h2>

          <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
            {mode === "login"
              ? "Use your admin email and password to enter the control panel."
              : "Enter your admin email address to receive a password reset link."}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                Admin email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 outline-none transition focus:border-q-primary"
              />
            </div>

            {mode === "login" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-q-text">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 outline-none transition focus:border-q-primary"
                />
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-q-danger bg-q-danger-soft p-4 text-sm text-q-danger">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-2xl border border-q-success bg-q-success-soft p-4 text-sm text-q-success">
              {success}
            </div>
          ) : null}

          {mode === "login" ? (
            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-q-primary px-5 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          ) : (
            <button
              onClick={handleForgotPassword}
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-q-primary px-5 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          )}

          <button
            onClick={() => {
              setMode(mode === "login" ? "forgot" : "login");
              setError("");
              setSuccess("");
              setPassword("");
            }}
            className="mt-4 w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            {mode === "login"
              ? "Forgot password?"
              : "Back to email and password login"}
          </button>
        </section>
      </div>
    </main>
  );
}