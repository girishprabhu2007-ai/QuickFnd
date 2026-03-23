"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const tokens = useMemo(() => {
    if (typeof window === "undefined") {
      return { accessToken: "", refreshToken: "" };
    }

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);

    return {
      accessToken: params.get("access_token") || "",
      refreshToken: params.get("refresh_token") || "",
    };
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!tokens.accessToken || !tokens.refreshToken) {
      setError("This reset link is invalid or expired.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reset password.");
      }

      setSuccess("Password updated successfully. Redirecting to admin...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-q-bg px-4 py-10 text-q-text sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm md:p-10">
          <div className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
            Password Recovery
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Reset your admin password
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-q-muted md:text-lg">
            Set a strong new password for your QuickFnd admin account and return to the
            control panel securely.
          </p>

          <div className="mt-8 rounded-2xl border border-q-border bg-q-bg p-5">
            <h2 className="text-sm font-semibold text-q-text">Password guidance</h2>
            <p className="mt-2 text-sm leading-6 text-q-muted">
              Use at least 12 characters and combine uppercase, lowercase, numbers,
              and symbols for better security.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-q-border bg-q-card p-8 shadow-sm md:p-10">
          <h2 className="text-3xl font-bold">Create a new password</h2>
          <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
            Enter your new password below and confirm it before saving.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                New password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 outline-none transition focus:border-q-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                Confirm new password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 outline-none transition focus:border-q-primary"
              />
            </div>
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

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-q-primary px-5 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </section>
      </div>
    </main>
  );
}