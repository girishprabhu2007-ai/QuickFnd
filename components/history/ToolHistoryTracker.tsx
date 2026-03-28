"use client";

import { useEffect } from "react";

export type HistoryEntry = {
  slug: string;
  name: string;
  table: "tools" | "calculators" | "ai_tools";
  href: string;
  visitedAt: number;
};

const STORAGE_KEY = "quickfnd-history";
const MAX_ENTRIES = 12;

function getTableHref(table: "tools" | "calculators" | "ai_tools", slug: string): string {
  if (table === "tools") return `/tools/${slug}`;
  if (table === "calculators") return `/calculators/${slug}`;
  return `/ai-tools/${slug}`;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

type Props = {
  slug: string;
  name: string;
  table: "tools" | "calculators" | "ai_tools";
};

export default function ToolHistoryTracker({ slug, name, table }: Props) {
  useEffect(() => {
    try {
      const history = getHistory();
      const filtered = history.filter((entry) => entry.slug !== slug);
      const entry: HistoryEntry = {
        slug,
        name,
        table,
        href: getTableHref(table, slug),
        visitedAt: Date.now(),
      };
      const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage not available — non-critical
    }
  }, [slug, name, table]);

  return null;
}