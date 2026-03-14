"use client";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-10 text-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">
          {mode === "login" ? "Admin Login" : "Forgot Password"}
        </h1>

        <p className="mb-6 text-sm text-gray-400">
          {mode === "login"
            ? "Use your admin email and password."
            : "Enter your admin email to receive a reset link."}
        </p>

        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
        />

        {mode === "login" ? (
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
          />
        ) : null}

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

        {mode === "login" ? (
          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        ) : (
          <button
            onClick={handleForgotPassword}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:opacity-60"
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
          className="mt-4 w-full text-sm text-blue-300 hover:text-blue-200"
        >
          {mode === "login"
            ? "Forgot password?"
            : "Back to email + password login"}
        </button>
      </div>
    </main>
  );
}