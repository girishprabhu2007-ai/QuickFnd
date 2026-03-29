"use client";

import { useThemeMode } from "@/components/theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useThemeMode();

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200"
      style={{
        borderColor: "var(--q-border)",
        background: "var(--q-card)",
        color: "var(--q-muted)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--q-border-hover)";
        e.currentTarget.style.color = "var(--q-text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--q-border)";
        e.currentTarget.style.color = "var(--q-muted)";
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      <span className="hidden sm:inline">
        {mounted ? (isDark ? "Dark" : "Light") : "Theme"}
      </span>
    </button>
  );
}
