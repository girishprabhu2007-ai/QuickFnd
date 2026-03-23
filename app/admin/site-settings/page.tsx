"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  google_site_verification: string;
  bing_site_verification: string;
  yandex_verification: string;
  norton_safe_web: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  facebook_domain_verification: string;
  custom_head_scripts: string;
  custom_body_scripts: string;
};

const DEFAULT: SiteSettings = {
  google_site_verification: "",
  bing_site_verification: "",
  yandex_verification: "",
  norton_safe_web: "",
  google_analytics_id: "",
  google_tag_manager_id: "",
  facebook_pixel_id: "",
  facebook_domain_verification: "",
  custom_head_scripts: "",
  custom_body_scripts: "",
};

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  mono = false,
  textarea = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-q-text">{label}</label>
      <p className="text-xs text-q-muted">{hint}</p>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text placeholder-q-muted focus:border-blue-400 focus:outline-none ${mono ? "font-mono text-xs" : ""}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text placeholder-q-muted focus:border-blue-400 focus:outline-none ${mono ? "font-mono" : ""}`}
        />
      )}
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-q-text">
        <span>{icon}</span>
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSettings({ ...DEFAULT, ...d.settings }))
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  function set(key: keyof SiteSettings) {
    return (value: string) => setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message || "Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-q-muted p-6">Loading settings...</div>;

  return (
    <div className="max-w-3xl space-y-8">

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"
        style={{ borderColor: "rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.04)" }}>
        <h3 className="text-sm font-semibold text-q-text">How these settings work</h3>
        <p className="mt-2 text-sm text-q-muted leading-6">
          Verification codes and analytics IDs are saved here and automatically injected into
          your site's <code className="font-mono text-xs bg-q-card px-1.5 py-0.5 rounded">&lt;head&gt;</code>.
          No code changes needed — save here and redeploy to activate.
        </p>
      </div>

      {/* Search Engine Verification */}
      <SectionCard title="Search Engine Verification" icon="🔍">
        <Field
          label="Google Search Console"
          hint="Paste your verification meta tag content value only — e.g. AbCdEfGhIjKlMnOpQrStUvWxYz123456"
          placeholder="AbCdEfGhIjKlMnOpQrStUvWxYz123456"
          value={settings.google_site_verification}
          onChange={set("google_site_verification")}
          mono
        />
        <Field
          label="Bing Webmaster Tools"
          hint="Paste the content value from the Bing verification meta tag"
          placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={settings.bing_site_verification}
          onChange={set("bing_site_verification")}
          mono
        />
        <Field
          label="Yandex Webmaster"
          hint="Paste the content value from the Yandex verification meta tag"
          placeholder="xxxxxxxxxxxxxxxx"
          value={settings.yandex_verification}
          onChange={set("yandex_verification")}
          mono
        />
        <div className="rounded-xl border border-q-border bg-q-bg p-4 text-xs text-q-muted">
          <strong className="text-q-text">How to get your Google verification code:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Go to <strong>search.google.com/search-console</strong></li>
            <li>Add your property → choose "URL prefix"</li>
            <li>Choose "HTML tag" verification method</li>
            <li>Copy only the <strong>content="..."</strong> value (not the whole tag)</li>
            <li>Paste it above → Save → Redeploy → then verify in Search Console</li>
          </ol>
        </div>
      </SectionCard>

      {/* Analytics */}
      <SectionCard title="Analytics & Tracking" icon="📊">
        <Field
          label="Google Analytics 4 (Measurement ID)"
          hint="Format: G-XXXXXXXXXX — found in GA4 → Admin → Data Streams → your stream"
          placeholder="G-XXXXXXXXXX"
          value={settings.google_analytics_id}
          onChange={set("google_analytics_id")}
          mono
        />
        <Field
          label="Google Tag Manager (Container ID)"
          hint="Format: GTM-XXXXXXX — found in GTM dashboard. Leave blank if using GA4 directly."
          placeholder="GTM-XXXXXXX"
          value={settings.google_tag_manager_id}
          onChange={set("google_tag_manager_id")}
          mono
        />
        <Field
          label="Facebook Pixel ID"
          hint="Numeric ID from Facebook Events Manager. Used for tracking ad conversions."
          placeholder="123456789012345"
          value={settings.facebook_pixel_id}
          onChange={set("facebook_pixel_id")}
          mono
        />
        <Field
          label="Facebook Domain Verification"
          hint="Content value from the Facebook domain verification meta tag"
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={settings.facebook_domain_verification}
          onChange={set("facebook_domain_verification")}
          mono
        />
      </SectionCard>

      {/* Custom Scripts */}
      <SectionCard title="Custom Code Injection" icon="💻">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800"
          style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.06)", color: "#92400e" }}>
          ⚠️ Only paste code you trust. Scripts injected here run on every page of your site.
        </div>
        <Field
          label="Custom &lt;head&gt; Scripts"
          hint="Paste raw HTML/script tags to inject before </head> on every page. Use for custom fonts, heatmaps (Hotjar, Microsoft Clarity), or other head-level integrations."
          placeholder={'<!-- Example: Microsoft Clarity -->\n<script type="text/javascript">\n  (function(c,l,a,r,i,t,y){ ... })(window, document, "clarity", ...);\n</script>'}
          value={settings.custom_head_scripts}
          onChange={set("custom_head_scripts")}
          mono
          textarea
        />
        <Field
          label="Custom Body Scripts"
          hint="Paste raw HTML/script tags to inject before </body> on every page. Use for live chat widgets, support tools, or other body-level integrations."
          placeholder={'<!-- Example: Live chat widget -->\n<script src="https://..." async></script>'}
          value={settings.custom_body_scripts}
          onChange={set("custom_body_scripts")}
          mono
          textarea
        />
      </SectionCard>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Site Settings"}
        </button>
        {message && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            ✓ {message}
          </span>
        )}
        {error && <span className="text-sm font-medium text-red-600">✗ {error}</span>}
      </div>

      <div className="rounded-2xl border border-q-border bg-q-card p-5 text-sm text-q-muted">
        <strong className="text-q-text block mb-2">After saving — important:</strong>
        These settings are read at build time. After saving, you must <strong>git push</strong> and
        redeploy for them to take effect on the live site. The layout.tsx automatically picks them
        up from the database during the build.
      </div>
    </div>
  );
}