"use client";

import { useEffect, useState } from "react";

type AdSettings = {
  adsense_client: string;
  ads_enabled: boolean;
  slots: {
    leaderboard: { enabled: boolean; slot_id: string };
    rectangle: { enabled: boolean; slot_id: string };
    in_article: { enabled: boolean; slot_id: string };
    mobile_banner: { enabled: boolean; slot_id: string };
    footer: { enabled: boolean; slot_id: string };
  };
  pages: {
    homepage: boolean;
    tools_listing: boolean;
    calculators_listing: boolean;
    ai_tools_listing: boolean;
    tool_detail: boolean;
    calculator_detail: boolean;
    ai_tool_detail: boolean;
  };
};

const SLOT_LABELS: Record<keyof AdSettings["slots"], { label: string; desc: string }> = {
  leaderboard: { label: "Leaderboard (728×90)", desc: "Below hero on listing + detail pages, desktop" },
  rectangle: { label: "Rectangle (300×250)", desc: "Sidebar on all pages" },
  in_article: { label: "In-Article (Responsive)", desc: "Between content sections on detail pages" },
  mobile_banner: { label: "Mobile Banner (320×50)", desc: "Sticky footer on mobile devices" },
  footer: { label: "Footer Leaderboard", desc: "Above footer links on all pages" },
};

const PAGE_LABELS: Record<keyof AdSettings["pages"], string> = {
  homepage: "Homepage",
  tools_listing: "Tools Listing (/tools)",
  calculators_listing: "Calculators Listing (/calculators)",
  ai_tools_listing: "AI Tools Listing (/ai-tools)",
  tool_detail: "Tool Detail Pages (/tools/[slug])",
  calculator_detail: "Calculator Detail Pages (/calculators/[slug])",
  ai_tool_detail: "AI Tool Detail Pages (/ai-tools/[slug])",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-q-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminAdsPage() {
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ad-settings", { cache: "no-store" });
      const data = await res.json();
      setSettings(data.settings);
    } catch {
      setError("Failed to load ad settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSettings(); }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/ad-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setMessage(data.message || "Saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-q-muted">Loading ad settings...</div>;
  }

  if (!settings) {
    return <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error || "Failed to load settings."}</div>;
  }

  return (
    <div className="grid gap-8 max-w-3xl">

      {/* Master switch */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">Ad Network</h2>
        <p className="mt-2 text-sm text-q-muted">
          Master switch for all ads. When off, no ads appear anywhere regardless of slot settings.
        </p>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-q-border bg-q-bg p-4">
          <div>
            <div className="text-sm font-semibold text-q-text">Ads Enabled</div>
            <div className="text-xs text-q-muted mt-0.5">Turn all ads on or off site-wide</div>
          </div>
          <Toggle
            checked={settings.ads_enabled}
            onChange={(v) => setSettings({ ...settings, ads_enabled: v })}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-q-text mb-2">
            Google AdSense Publisher ID
          </label>
          <input
            type="text"
            value={settings.adsense_client}
            onChange={(e) => setSettings({ ...settings, adsense_client: e.target.value })}
            placeholder="ca-pub-XXXXXXXXXXXXXXXXX"
            className="w-full rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text placeholder-q-muted focus:border-blue-400 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-q-muted">
            Get this from your Google AdSense dashboard under Account → Account information.
          </p>
        </div>
      </section>

      {/* Slot controls */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">Ad Slots</h2>
        <p className="mt-2 text-sm text-q-muted">
          Enable or disable individual ad slot positions and set their AdSense slot IDs.
        </p>

        <div className="mt-6 grid gap-4">
          {(Object.keys(settings.slots) as Array<keyof AdSettings["slots"]>).map((slotKey) => {
            const slot = settings.slots[slotKey];
            const meta = SLOT_LABELS[slotKey];
            return (
              <div key={slotKey} className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-q-text">{meta.label}</div>
                    <div className="text-xs text-q-muted mt-0.5">{meta.desc}</div>
                  </div>
                  <Toggle
                    checked={slot.enabled}
                    onChange={(v) =>
                      setSettings({
                        ...settings,
                        slots: {
                          ...settings.slots,
                          [slotKey]: { ...slot, enabled: v },
                        },
                      })
                    }
                  />
                </div>
                {slot.enabled && (
                  <input
                    type="text"
                    value={slot.slot_id}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        slots: {
                          ...settings.slots,
                          [slotKey]: { ...slot, slot_id: e.target.value },
                        },
                      })
                    }
                    placeholder="AdSense Slot ID (e.g. 1234567890)"
                    className="mt-3 w-full rounded-lg border border-q-border bg-q-card px-3 py-2 text-sm text-q-text placeholder-q-muted focus:border-blue-400 focus:outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Page controls */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">Page Visibility</h2>
        <p className="mt-2 text-sm text-q-muted">
          Choose which page types show ads.
        </p>

        <div className="mt-6 grid gap-3">
          {(Object.keys(settings.pages) as Array<keyof AdSettings["pages"]>).map((pageKey) => (
            <div
              key={pageKey}
              className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-4 py-3"
            >
              <span className="text-sm text-q-text">{PAGE_LABELS[pageKey]}</span>
              <Toggle
                checked={settings.pages[pageKey]}
                onChange={(v) =>
                  setSettings({
                    ...settings,
                    pages: { ...settings.pages, [pageKey]: v },
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Ad Settings"}
        </button>
        {message && <p className="text-sm font-medium text-green-600">{message}</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>

      {/* Setup guide */}
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-base font-semibold text-blue-900">AdSense Setup Checklist</h3>
        <ol className="mt-3 space-y-2 text-sm text-blue-800 list-decimal list-inside">
          <li>Apply at <strong>adsense.google.com</strong> with your domain</li>
          <li>Wait for approval (1–14 days)</li>
          <li>Copy your Publisher ID (ca-pub-XXXX) and paste above</li>
          <li>Copy each Slot ID from AdSense → Ads → By ad unit</li>
          <li>Enable ads and click Save — ads go live instantly</li>
        </ol>
      </section>
    </div>
  );
}