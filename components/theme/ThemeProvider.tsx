"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "dark" | "light";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "quickfnd-theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  if (theme === "light") {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  } else {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  }
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const nextTheme: ThemeMode = prefersLight ? "light" : "dark";
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    }

    setMounted(true);
  }, []);

  function setTheme(nextTheme: ThemeMode) {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      mounted,
    }),
    [theme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider.");
  }

  return context;
}