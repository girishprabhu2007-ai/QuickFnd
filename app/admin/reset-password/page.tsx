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
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-10 text-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Reset admin password</h1>
        <p className="mb-6 text-sm text-gray-400">
          Set a strong new password for your admin account.
        </p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4 w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
        />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </div>
    </main>
  );
}