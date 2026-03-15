"use client";

import { useThemeMode } from "@/components/theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
      aria-label="Toggle theme"
    >
      <span>{mounted ? (theme === "dark" ? "🌙" : "☀️") : "🌓"}</span>
      <span>{mounted ? (theme === "dark" ? "Dark" : "Light") : "Theme"}</span>
    </button>
  );
}