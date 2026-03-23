"use client";

/**
 * components/ads/AdSlot.tsx
 * Admin-controlled ad slot component.
 * Settings are fetched from /api/admin/ad-settings and cached in sessionStorage.
 * When ads_enabled=false in admin, NO ads render anywhere.
 * Each slot can be individually toggled in admin → Ad Settings.
 */

import { useEffect, useRef, useState } from "react";

export type AdSlotType =
  | "leaderboard"
  | "rectangle"
  | "mobile-banner"
  | "in-article"
  | "footer";

type SlotSettings = {
  enabled: boolean;
  slot_id: string;
};

type AdSettings = {
  adsense_client: string;
  ads_enabled: boolean;
  slots: Record<string, SlotSettings>;
  pages: Record<string, boolean>;
};

type AdSlotProps = {
  type: AdSlotType;
  pageKey?: string; // e.g. "homepage", "tool_detail" — for page-level control
  label?: boolean;
  className?: string;
};

const SLOT_DIMENSIONS: Record<AdSlotType, { w: number; h: number; label: string }> = {
  leaderboard:    { w: 728, h: 90,  label: "728×90" },
  rectangle:      { w: 300, h: 250, label: "300×250" },
  "mobile-banner":{ w: 320, h: 50,  label: "320×50" },
  "in-article":   { w: 0,   h: 90,  label: "In-Article" },
  footer:         { w: 728, h: 90,  label: "728×90" },
};

// Map AdSlotType → admin settings key
const SLOT_KEY_MAP: Record<AdSlotType, string> = {
  leaderboard:    "leaderboard",
  rectangle:      "rectangle",
  "mobile-banner":"mobile_banner",
  "in-article":   "in_article",
  footer:         "footer",
};

const SETTINGS_CACHE_KEY = "qf_ad_settings";
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchAdSettings(): Promise<AdSettings | null> {
  try {
    // Check sessionStorage cache
    const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < SETTINGS_CACHE_TTL) return data;
    }

    const res = await fetch("/api/ad-settings", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const settings = data.settings as AdSettings;

    sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: settings }));
    return settings;
  } catch {
    return null;
  }
}

function Placeholder({ type, className }: { type: AdSlotType; className?: string }) {
  const dim = SLOT_DIMENSIONS[type];
  const isResponsive = type === "in-article";
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-q-border bg-q-card text-xs text-q-muted ${className ?? ""}`}
      style={isResponsive ? { width: "100%", minHeight: 90 } : { width: dim.w, height: dim.h, maxWidth: "100%" }}
      aria-hidden="true"
    >
      <span className="opacity-30">Ad · {dim.label}</span>
    </div>
  );
}

function AdsenseUnit({ type, slotId, client }: { type: AdSlotType; slotId: string; client: string }) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const dim = SLOT_DIMENSIONS[type];
  const isResponsive = type === "in-article" || type === "footer";

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as Record<string, unknown[]>;
      w.adsbygoogle = w.adsbygoogle ?? [];
      w.adsbygoogle.push({});
    } catch { /* ad blocker */ }
  }, []);

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={isResponsive ? { display: "block" } : { display: "inline-block", width: dim.w, height: dim.h }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format={isResponsive ? "auto" : undefined}
      data-full-width-responsive={isResponsive ? "true" : undefined}
    />
  );
}

export default function AdSlot({ type, pageKey, label = true, className }: AdSlotProps) {
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    fetchAdSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  // Don't render anything until settings loaded (avoids layout shift)
  if (!loaded) return null;

  // Dev mode — always show placeholder
  if (isDev) {
    return (
      <div className={`overflow-hidden ${className ?? ""}`}>
        {label && <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-q-muted opacity-40">Advertisement</p>}
        <Placeholder type={type} />
      </div>
    );
  }

  // No settings or ads disabled globally
  if (!settings || !settings.ads_enabled) return null;

  // Page-level check
  if (pageKey && settings.pages && settings.pages[pageKey] === false) return null;

  // Slot-level check
  const slotKey = SLOT_KEY_MAP[type];
  const slot = settings.slots?.[slotKey];
  if (!slot?.enabled) return null;

  // No publisher ID configured
  if (!settings.adsense_client?.trim()) return null;

  // No slot ID configured
  if (!slot.slot_id?.trim()) return null;

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      {label && <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-q-muted opacity-40">Advertisement</p>}
      <AdsenseUnit type={type} slotId={slot.slot_id} client={settings.adsense_client} />
    </div>
  );
}