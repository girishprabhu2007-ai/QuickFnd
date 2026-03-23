"use client";

/**
 * components/ads/AdSlot.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal ad slot component. Renders a Google AdSense unit in production.
 * Shows a clean placeholder in development so layout is always visible.
 *
 * SETUP INSTRUCTIONS (do once when AdSense is approved):
 * 1. Add your AdSense publisher ID to .env.local:
 *    NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXXX
 * 2. Add the AdSense <script> tag to app/layout.tsx <head>
 * 3. Replace the slot IDs below with your actual AdSense slot IDs
 *
 * SLOT TYPES:
 * - "leaderboard"   728x90  — below tool workspace on desktop
 * - "rectangle"     300x250 — sidebar and between content sections
 * - "mobile-banner" 320x50  — sticky footer on mobile
 * - "in-article"    responsive — between FAQ/benefit sections
 */

import { useEffect, useRef } from "react";

export type AdSlotType =
  | "leaderboard"    // 728×90 — below tool on desktop
  | "rectangle"      // 300×250 — sidebar
  | "mobile-banner"  // 320×50 — mobile footer
  | "in-article";    // responsive — between content sections

type AdSlotProps = {
  type: AdSlotType;
  slotId?: string;       // AdSense data-ad-slot value
  className?: string;
  label?: boolean;       // show "Advertisement" label above slot
};

const SLOT_DIMENSIONS: Record<AdSlotType, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: "728×90" },
  rectangle: { w: 300, h: 250, label: "300×250" },
  "mobile-banner": { w: 320, h: 50, label: "320×50" },
  "in-article": { w: 0, h: 90, label: "In-Article" },
};

// Replace with your actual AdSense slot IDs after approval
const DEFAULT_SLOT_IDS: Record<AdSlotType, string> = {
  leaderboard: "1234567890",
  rectangle: "0987654321",
  "mobile-banner": "1122334455",
  "in-article": "5544332211",
};

const ADSENSE_CLIENT =
  typeof window !== "undefined"
    ? (window as unknown as Record<string, string>).__ADSENSE_CLIENT__ ?? ""
    : "";

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function hasAdsenseClient(): boolean {
  if (typeof window === "undefined") return false;
  const client =
    (window as unknown as Record<string, string | undefined>)
      .__ADSENSE_CLIENT__ ?? "";
  return Boolean(client.trim());
}

// ─── Dev placeholder ─────────────────────────────────────────────────────────

function AdPlaceholder({ type, className }: { type: AdSlotType; className?: string }) {
  const dim = SLOT_DIMENSIONS[type];
  const isResponsive = type === "in-article";

  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-q-border bg-q-card text-xs text-q-muted ${className ?? ""}`}
      style={
        isResponsive
          ? { width: "100%", minHeight: 90 }
          : { width: dim.w, height: dim.h, maxWidth: "100%" }
      }
      aria-hidden="true"
    >
      <span className="opacity-40">Ad Slot · {dim.label}</span>
    </div>
  );
}

// ─── Live AdSense unit ───────────────────────────────────────────────────────

function AdsenseUnit({
  type,
  slotId,
  className,
}: {
  type: AdSlotType;
  slotId: string;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const dim = SLOT_DIMENSIONS[type];
  const isResponsive = type === "in-article";
  const client =
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_ADSENSE_CLIENT) ??
    "";

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      const adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle ?? [];
      (window as unknown as Record<string, unknown[]>).adsbygoogle = adsbygoogle;
      adsbygoogle.push({});
    } catch (e) {
      // silently ignore — ad blocker or not yet loaded
    }
  }, []);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className ?? ""}`}
      style={
        isResponsive
          ? { display: "block" }
          : { display: "inline-block", width: dim.w, height: dim.h }
      }
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format={isResponsive ? "auto" : undefined}
      data-full-width-responsive={isResponsive ? "true" : undefined}
    />
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function AdSlot({
  type,
  slotId,
  className,
  label = true,
}: AdSlotProps) {
  const resolvedSlotId = slotId ?? DEFAULT_SLOT_IDS[type];
  const showPlaceholder = isDev() || !hasAdsenseClient();

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      {label && (
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-q-muted opacity-50">
          Advertisement
        </p>
      )}
      {showPlaceholder ? (
        <AdPlaceholder type={type} />
      ) : (
        <AdsenseUnit type={type} slotId={resolvedSlotId} />
      )}
    </div>
  );
}
