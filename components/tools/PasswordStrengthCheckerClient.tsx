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

function fieldClass() {
  return "w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3.5 text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-q-card";
}

function badgeClass(label: string) {
  if (label === "Strong") {
    return "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (label === "Medium") {
    return "rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700";
  }

  if (label === "Weak") {
    return "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700";
  }

  return "rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-semibold text-q-muted";
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-q-border bg-q-bg p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-q-text">
        {value}
      </div>
    </div>
  );
}

function RuleCard({
  title,
  passed,
}: {
  title: string;
  passed: boolean;
}) {
  return (
    <div
      className={
        passed
          ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
          : "rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text"
      }
    >
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-xs uppercase tracking-wide opacity-80">
        {passed ? "Passed" : "Missing"}
      </div>
    </div>
  );
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

  const rules = [
    { title: "At least 8 characters", passed: password.length >= 8 },
    { title: "Lowercase letters", passed: /[a-z]/.test(password) },
    { title: "Uppercase letters", passed: /[A-Z]/.test(password) },
    { title: "Numbers", passed: /\d/.test(password) },
    { title: "Special characters", passed: /[^A-Za-z0-9]/.test(password) },
    { title: "No repeated characters", passed: !/(.)\1{2,}/.test(password) || password.length === 0 },
  ];

  return (
    <section className="rounded-[30px] border border-q-border bg-q-card p-6 shadow-sm md:p-8 lg:p-10">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
          Security Check
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-q-text md:text-3xl">
          Password Strength Checker
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-q-muted md:text-base">
          Check how strong your password is and get clear suggestions to improve it without exposing internal system details.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-q-border bg-q-bg p-5 shadow-sm">
            <label className="mb-3 block text-sm font-medium text-q-text">
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
              className={fieldClass()}
            />
          </div>

          <div className="rounded-[26px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
                  Result
                </div>
                <div className="mt-2 text-lg font-semibold text-q-text">
                  Strength analysis
                </div>
              </div>
              <span className={badgeClass(result.label)}>{result.label}</span>
            </div>

            <div className="rounded-2xl border border-q-border bg-q-card p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Strength" value={result.label} />
                <StatCard label="Score" value={`${result.score}/6`} />
                <StatCard label="Coverage" value={`${result.percentage}%`} />
              </div>

              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-q-border">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${result.colorClass}`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>

              {password ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-q-text">
                    Improvement suggestions
                  </div>

                  {result.feedback.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      This password looks strong.
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-q-muted">
                      {result.feedback.map((item) => (
                        <li
                          key={item}
                          className="rounded-xl border border-q-border bg-q-bg p-3"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="mt-5 text-sm text-q-muted">
                  Start typing to analyze your password.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-q-border bg-q-bg p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
              Rules
            </div>
            <div className="mt-3 grid gap-3">
              {rules.map((rule) => (
                <RuleCard key={rule.title} title={rule.title} passed={rule.passed} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-slate-800 shadow-sm">
            <div className="font-semibold">Tip</div>
            <div className="mt-1">
              Strong passwords are longer, mixed, and hard to predict. A password manager usually makes this much easier.
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}