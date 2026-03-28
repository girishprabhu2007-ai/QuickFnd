"use client";

import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   LIKE BUTTON
   Shows like count + animated heart button.
   Stores liked state in localStorage to prevent duplicate likes.
   Calls /api/like to increment the count in DB.
   ═══════════════════════════════════════════════════════════════════════════════ */

type Props = {
  slug: string;
  table: "tools" | "calculators" | "ai_tools";
  initialLikes?: number;
};

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function LikeButton({ slug, table, initialLikes = 0 }: Props) {
  const storageKey = `liked:${table}:${slug}`;
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== "undefined" && localStorage.getItem(storageKey) === "1") {
        setLiked(true);
      }
    } catch { /* localStorage not available */ }
  }, [storageKey]);

  // Fetch live count on mount
  useEffect(() => {
    fetch(`/api/like?slug=${encodeURIComponent(slug)}&table=${encodeURIComponent(table)}`)
      .then(res => res.json())
      .then(data => {
        if (typeof data.likes === "number") setLikes(data.likes);
      })
      .catch(() => { /* use initial */ });
  }, [slug, table]);

  const handleLike = useCallback(async () => {
    if (liked) return;

    // Optimistic update
    setLiked(true);
    setLikes(prev => prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    // Persist in localStorage
    try { localStorage.setItem(storageKey, "1"); } catch { /* ignore */ }

    // API call
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, table }),
      });
      const data = await res.json();
      if (typeof data.likes === "number") setLikes(data.likes);
    } catch { /* optimistic count stays */ }
  }, [liked, slug, table, storageKey]);

  if (!mounted) {
    // SSR placeholder — matches shape but no interactivity
    return (
      <div className="flex items-center gap-2 rounded-full border border-q-border bg-q-bg px-4 py-2">
        <span className="text-base text-q-muted">♡</span>
        <span className="text-sm font-semibold text-q-muted tabular-nums">{formatCount(initialLikes)}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`
        group relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold
        transition-all duration-200 select-none
        ${liked
          ? "border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-800 dark:bg-pink-900/20 dark:text-pink-400"
          : "border-q-border bg-q-bg text-q-muted hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-500 dark:hover:border-pink-800 dark:hover:bg-pink-900/10 cursor-pointer"
        }
      `}
      aria-label={liked ? "Liked" : "Like this tool"}
    >
      {/* Heart icon */}
      <span
        className={`
          text-base transition-transform duration-300
          ${animating ? "scale-125" : "scale-100"}
          ${liked ? "text-pink-500" : "text-q-muted group-hover:text-pink-400"}
        `}
      >
        {liked ? "❤️" : "🤍"}
      </span>

      {/* Count */}
      <span className="tabular-nums">{formatCount(likes)}</span>

      {/* Burst animation */}
      {animating && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute h-8 w-8 animate-ping rounded-full bg-pink-400/30" />
        </span>
      )}
    </button>
  );
}