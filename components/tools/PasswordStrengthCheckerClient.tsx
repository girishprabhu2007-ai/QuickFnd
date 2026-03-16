"use client";

import { useMemo, useState } from "react";

function calculateStrength(password: string) {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push("Use at least 8 characters.");

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Add lowercase letters.");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Add uppercase letters.");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Add numbers.");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push("Add special characters.");

  const repeated = /(.)\1{2,}/.test(password);
  if (repeated) {
    score -= 1;
    feedback.push("Avoid repeated characters.");
  }

  if (password.length === 0) {
    return {
      score: 0,
      label: "No password entered",
      colorClass: "bg-q-border",
      feedback: [],
      percentage: 0,
    };
  }

  const normalized = Math.max(0, Math.min(score, 6));

  if (normalized <= 2) {
    return {
      score: normalized,
      label: "Weak",
      colorClass: "bg-red-500",
      feedback,
      percentage: 25,
    };
  }

  if (normalized <= 4) {
    return {
      score: normalized,
      label: "Medium",
      colorClass: "bg-yellow-500",
      feedback,
      percentage: 60,
    };
  }

  return {
    score: normalized,
    label: "Strong",
    colorClass: "bg-green-500",
    feedback,
    percentage: 100,
  };
}

export default function PasswordStrengthCheckerClient() {
  const [password, setPassword] = useState("");

  const result = useMemo(() => calculateStrength(password), [password]);

  async function trackCheck() {
    try {
      await fetch("/api/usage/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_slug: "password-strength-checker",
          item_type: "tool",
          event_type: "check_strength",
        }),
      });
    } catch {}
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
      <div>
        <h2 className="text-2xl font-semibold text-q-text md:text-3xl">
          Password Strength Checker
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-q-muted md:text-base">
          Check how strong your password is and get suggestions to improve it.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-q-text">
            Enter password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value) {
                trackCheck();
              }
            }}
            placeholder="Type a password to test"
            className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
          />
        </div>

        <div className="rounded-2xl border border-q-border bg-q-bg p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-q-muted">Strength</div>
              <div className="mt-1 text-2xl font-bold text-q-text">
                {result.label}
              </div>
            </div>

            <div className="text-sm text-q-muted">
              Score: {result.score}/6
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-q-border">
            <div
              className={`h-full rounded-full transition-all duration-300 ${result.colorClass}`}
              style={{ width: `${result.percentage}%` }}
            />
          </div>

          {password ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-q-text">
                Suggestions
              </h3>

              {result.feedback.length === 0 ? (
                <p className="mt-2 text-sm text-green-600">
                  This password looks strong.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-q-muted">
                  {result.feedback.map((item) => (
                    <li key={item} className="rounded-xl border border-q-border bg-q-card p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-q-muted">
              Start typing to analyze your password.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}