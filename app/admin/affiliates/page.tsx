"use client";

import { useEffect, useState } from "react";
import type { AffiliateRule, AffiliateSettings } from "@/app/api/admin/affiliate-settings/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function emptyRule(): AffiliateRule {
  return {
    id: uid(),
    enabled: true,
    name: "",
    pattern: "",
    pattern_type: "regex",
    title: "",
    description: "",
    link: "",
    label: "",
    badge: "",
    priority: 100,
  };
}

function inputCls() {
  return "w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 focus:bg-q-card transition";
}

function btnCls(variant: "primary" | "ghost" | "danger" = "ghost") {
  if (variant === "primary") return "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50";
  if (variant === "danger") return "rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition";
  return "rounded-xl border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition";
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-q-border"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ─── Rule Editor Modal ────────────────────────────────────────────────────────

function RuleEditor({
  rule, onSave, onClose,
}: {
  rule: AffiliateRule;
  onSave: (r: AffiliateRule) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AffiliateRule>({ ...rule });

  function set(key: keyof AffiliateRule, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function testPattern() {
    const testSlug = prompt("Enter a slug to test (e.g. password-generator):");
    if (!testSlug) return;
    try {
      const matches = form.pattern_type === "regex"
        ? new RegExp(form.pattern, "i").test(testSlug)
        : form.pattern.split(",").map((s) => s.trim()).includes(testSlug.trim());
      alert(matches ? `✅ "${testSlug}" MATCHES this rule` : `❌ "${testSlug}" does NOT match this rule`);
    } catch {
      alert("Invalid regex pattern");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-q-border bg-q-card p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-q-text">
            {rule.name ? `Edit: ${rule.name}` : "New Affiliate Rule"}
          </h3>
          <button onClick={onClose} className="text-q-muted hover:text-q-text text-xl">×</button>
        </div>

        <div className="space-y-4">
          {/* Status + Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Toggle checked={form.enabled} onChange={(v) => set("enabled", v)} />
              <span className="text-sm text-q-muted">{form.enabled ? "Enabled" : "Disabled"}</span>
            </div>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Rule name (internal, e.g. Password tools → Bitwarden)"
              className={`flex-1 ${inputCls()}`} />
          </div>

          {/* Pattern */}
          <div className="rounded-xl border border-q-border bg-q-bg p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">Slug Matching</div>
            <div className="flex gap-2">
              <select value={form.pattern_type} onChange={(e) => set("pattern_type", e.target.value)}
                className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text">
                <option value="regex">Regex pattern</option>
                <option value="slugs">Exact slugs (comma-separated)</option>
              </select>
              <input value={form.pattern} onChange={(e) => set("pattern", e.target.value)}
                placeholder={form.pattern_type === "regex" ? "e.g. password|bitwarden" : "e.g. password-generator,password-strength-checker"}
                className={`flex-1 ${inputCls()} font-mono text-xs`} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={testPattern} className={btnCls()}>Test Pattern</button>
              <span className="text-xs text-q-muted">
                {form.pattern_type === "regex"
                  ? "Regex is tested against the tool slug using case-insensitive match"
                  : "Exact slug match — list the full slugs separated by commas"}
              </span>
            </div>
          </div>

          {/* Card content */}
          <div className="rounded-xl border border-q-border bg-q-bg p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">Card Content</div>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Card headline (e.g. Never forget a password again)"
              className={inputCls()} />
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="One sentence description of why this is relevant to the tool"
              rows={2} className={`${inputCls()} resize-none`} />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.label} onChange={(e) => set("label", e.target.value)}
                placeholder="CTA button text (e.g. Try Bitwarden Free)"
                className={inputCls()} />
              <input value={form.badge} onChange={(e) => set("badge", e.target.value)}
                placeholder="Badge text (optional, e.g. Free forever plan)"
                className={inputCls()} />
            </div>
          </div>

          {/* Link + Priority */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input value={form.link} onChange={(e) => set("link", e.target.value)}
              placeholder="Affiliate URL (e.g. https://bitwarden.com/?utm_source=quickfnd)"
              className={`${inputCls()} font-mono text-xs`} />
            <div className="flex items-center gap-2">
              <label className="text-xs text-q-muted whitespace-nowrap">Priority</label>
              <input type="number" value={form.priority} onChange={(e) => set("priority", Number(e.target.value))}
                className="w-20 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text text-center" />
            </div>
          </div>

          {/* Preview */}
          {form.title && form.description && form.link && (
            <div className="rounded-xl border border-q-border bg-q-card p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">Preview</div>
              <div className="rounded-xl border border-q-border bg-q-bg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-q-muted uppercase tracking-wide">Sponsored recommendation</span>
                  {form.badge && <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">{form.badge}</span>}
                </div>
                <p className="font-semibold text-q-text text-sm">{form.title}</p>
                <p className="text-sm text-q-muted">{form.description}</p>
                <span className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                  {form.label || "Click here"} →
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className={btnCls()}>Cancel</button>
          <button onClick={() => onSave(form)} className={btnCls("primary")}
            disabled={!form.name || !form.pattern || !form.link || !form.title}>
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AffiliatesAdminPage() {
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingRule, setEditingRule] = useState<AffiliateRule | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch("/api/admin/affiliate-settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data.settings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function save(updated: AffiliateSettings) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/affiliate-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(updated);
      setMessage({ type: "success", text: "Saved successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  function toggleGlobal(v: boolean) {
    if (!settings) return;
    const updated = { ...settings, global_enabled: v };
    save(updated);
  }

  function toggleRule(id: string, v: boolean) {
    if (!settings) return;
    const updated = {
      ...settings,
      rules: settings.rules.map((r) => r.id === id ? { ...r, enabled: v } : r),
    };
    save(updated);
  }

  function deleteRule(id: string) {
    if (!settings || !confirm("Delete this affiliate rule?")) return;
    const updated = { ...settings, rules: settings.rules.filter((r) => r.id !== id) };
    save(updated);
  }

  function openEdit(rule: AffiliateRule) {
    setIsNew(false);
    setEditingRule({ ...rule });
  }

  function openNew() {
    setIsNew(true);
    setEditingRule(emptyRule());
  }

  function handleSaveRule(rule: AffiliateRule) {
    if (!settings) return;
    const rules = isNew
      ? [...settings.rules, rule]
      : settings.rules.map((r) => r.id === rule.id ? rule : r);
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    save({ ...settings, rules: sorted });
    setEditingRule(null);
  }

  function moveRule(id: string, dir: "up" | "down") {
    if (!settings) return;
    const rules = [...settings.rules];
    const idx = rules.findIndex((r) => r.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === rules.length - 1) return;
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [rules[idx], rules[swap]] = [rules[swap], rules[idx]];
    // Reassign priorities based on new order
    const reordered = rules.map((r, i) => ({ ...r, priority: (i + 1) * 10 }));
    save({ ...settings, rules: reordered });
  }

  if (loading) {
    return <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">Loading affiliate settings...</div>;
  }

  if (!settings) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">Failed to load settings.</div>;
  }

  const activeRules = settings.rules.filter((r) => r.enabled).length;

  return (
    <>
      {editingRule && (
        <RuleEditor
          rule={editingRule}
          onSave={handleSaveRule}
          onClose={() => setEditingRule(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-q-border bg-q-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-q-text">Affiliate Settings</h2>
              <p className="mt-1 text-sm text-q-muted">
                Control which affiliate cards show in the sidebar of tool, calculator, and AI tool pages.
                Rules are matched against the page slug in priority order. First match wins.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-q-muted">Global affiliate cards</span>
              <Toggle checked={settings.global_enabled} onChange={toggleGlobal} />
              <span className={`text-sm font-medium ${settings.global_enabled ? "text-emerald-500" : "text-q-muted"}`}>
                {settings.global_enabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm text-q-muted">
              {settings.rules.length} rules total · <span className="text-emerald-500 font-medium">{activeRules} active</span>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm text-q-muted">
              Rules are cached for 5 minutes after saving
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        {/* Add rule button */}
        <div className="flex justify-end">
          <button onClick={openNew} className={btnCls("primary")}>
            + Add Affiliate Rule
          </button>
        </div>

        {/* Rules list */}
        <div className="space-y-3">
          {settings.rules.length === 0 && (
            <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">
              No affiliate rules yet. Click &quot;Add Affiliate Rule&quot; to create one.
            </div>
          )}

          {settings.rules.map((rule, idx) => (
            <div key={rule.id} className={`rounded-2xl border bg-q-card p-5 transition ${
              rule.enabled ? "border-q-border" : "border-q-border opacity-50"
            }`}>
              <div className="flex items-start gap-4">
                {/* Priority controls */}
                <div className="flex flex-col gap-1 pt-0.5">
                  <button onClick={() => moveRule(rule.id, "up")} disabled={idx === 0}
                    className="rounded-lg border border-q-border bg-q-bg px-2 py-1 text-xs text-q-muted hover:bg-q-card-hover disabled:opacity-30">▲</button>
                  <span className="text-center text-xs text-q-muted">{idx + 1}</span>
                  <button onClick={() => moveRule(rule.id, "down")} disabled={idx === settings.rules.length - 1}
                    className="rounded-lg border border-q-border bg-q-bg px-2 py-1 text-xs text-q-muted hover:bg-q-card-hover disabled:opacity-30">▼</button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-q-text text-sm">{rule.name || "Unnamed rule"}</span>
                    {rule.badge && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">{rule.badge}</span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      rule.enabled ? "bg-emerald-50 text-emerald-700" : "bg-q-bg text-q-muted"
                    }`}>
                      {rule.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="mt-2 grid gap-1 text-xs text-q-muted">
                    <div className="flex gap-2">
                      <span className="font-medium text-q-text">Pattern:</span>
                      <code className="font-mono bg-q-bg px-1.5 py-0.5 rounded">{rule.pattern}</code>
                      <span className="text-q-muted">({rule.pattern_type})</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-q-text">CTA:</span>
                      <span>{rule.label}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-medium text-q-text">Link:</span>
                      <a href={rule.link} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate max-w-xs">{rule.link}</a>
                    </div>
                  </div>

                  {/* Card preview inline */}
                  <div className="mt-3 rounded-xl border border-q-border bg-q-bg p-3 text-xs text-q-muted italic">
                    &quot;{rule.title}&quot; — {rule.description.slice(0, 80)}{rule.description.length > 80 ? "…" : ""}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Toggle checked={rule.enabled} onChange={(v) => toggleRule(rule.id, v)} />
                  <button onClick={() => openEdit(rule)} className={btnCls()}>Edit</button>
                  <button onClick={() => deleteRule(rule.id)} className={btnCls("danger")}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {saving && (
          <div className="fixed bottom-6 right-6 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Saving...
          </div>
        )}
      </div>
    </>
  );
}