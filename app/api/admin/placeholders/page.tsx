"use client";

import { useEffect, useMemo, useState } from "react";
import { ENGINE_OPTIONS } from "@/lib/engine-metadata";

type PlaceholderItem = {
  name: string;
  slug: string;
  description: string;
  current_engine_type: string;
  current_engine_config: Record<string, unknown>;
  suggested_engine_type: string;
  resolved_engine_type: string;
  public_url: string;
  reason: string;
};

type ActivationResult = {
  name: string;
  slug: string;
  engine_type: string;
  engine_config: Record<string, unknown>;
  public_url: string;
  is_publicly_visible: boolean;
};

const SUPPORTED_TOOL_ENGINES = ENGINE_OPTIONS.tool.filter(
  (option) => option.value !== "generic-directory"
);

export default function AdminPlaceholdersPage() {
  const [items, setItems] = useState<PlaceholderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [engineSelections, setEngineSelections] = useState<Record<string, string>>(
    {}
  );
  const [configInputs, setConfigInputs] = useState<Record<string, string>>({});
  const [busySlug, setBusySlug] = useState("");
  const [message, setMessage] = useState("");
  const [lastActivated, setLastActivated] = useState<ActivationResult | null>(null);

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/placeholder-tools", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load placeholder tools.");
      }

      const nextItems = Array.isArray(data.items) ? data.items : [];
      setItems(nextItems);

      const nextSelections: Record<string, string> = {};
      const nextConfigs: Record<string, string> = {};

      for (const item of nextItems) {
        const suggested =
          item.suggested_engine_type &&
          item.suggested_engine_type !== "generic-directory"
            ? item.suggested_engine_type
            : "";

        nextSelections[item.slug] = suggested;
        nextConfigs[item.slug] = JSON.stringify(
          item.current_engine_config || {},
          null,
          2
        );
      }

      setEngineSelections(nextSelections);
      setConfigInputs(nextConfigs);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof Error ? err.message : "Failed to load placeholder tools."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function activateTool(slug: string) {
    const engineType = String(engineSelections[slug] || "").trim();
    const configText = String(configInputs[slug] || "").trim() || "{}";

    setMessage("");
    setLastActivated(null);

    if (!engineType) {
      setError("Please select an engine type before activating the tool.");
      return;
    }

    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(configText);
    } catch {
      setError(`Engine config for ${slug} must be valid JSON.`);
      return;
    }

    setBusySlug(slug);
    setError("");

    try {
      const response = await fetch("/api/admin/update-tool-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          engine_type: engineType,
          engine_config: parsedConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to activate tool.");
      }

      setMessage(data?.message || "Tool activated successfully.");
      setLastActivated(data.item || null);

      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate tool.");
    } finally {
      setBusySlug("");
    }
  }

  const hiddenCount = useMemo(() => items.length, [items]);

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-q-text">Engine Upgrade Workflow</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-q-muted md:text-base">
          These tools are hidden from the public site because they do not currently
          resolve to a supported working engine. Select a supported engine, optionally
          add JSON config, and activate the tool to make it public.
        </p>

        <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
          Hidden placeholder tools: <span className="font-semibold text-q-text">{hiddenCount}</span>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {lastActivated ? (
          <div className="mt-5 rounded-2xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800">
            <div className="font-semibold">{lastActivated.name}</div>
            <div className="mt-1">Engine: {lastActivated.engine_type}</div>
            <div className="mt-2">
              <a
                href={lastActivated.public_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
              >
                Open live tool
              </a>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-q-text">Hidden Placeholder Tools</h3>
          <button
            onClick={loadItems}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            Loading placeholder tools...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-green-300 bg-green-50 p-5 text-sm text-green-700">
            No placeholder tools found. Public tool inventory is clean.
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {items.map((item) => (
              <div
                key={item.slug}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="text-xl font-semibold text-q-text">{item.name}</div>
                    <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>

                    {item.description ? (
                      <div className="mt-3 text-sm leading-6 text-q-muted">
                        {item.description}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-q-border bg-q-card p-3">
                        <div className="text-xs uppercase tracking-wide text-q-muted">
                          Current Engine
                        </div>
                        <div className="mt-1 text-sm font-medium text-q-text">
                          {item.current_engine_type || "(empty)"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-q-border bg-q-card p-3">
                        <div className="text-xs uppercase tracking-wide text-q-muted">
                          Suggested Engine
                        </div>
                        <div className="mt-1 text-sm font-medium text-q-text">
                          {item.suggested_engine_type}
                        </div>
                      </div>

                      <div className="rounded-xl border border-q-border bg-q-card p-3">
                        <div className="text-xs uppercase tracking-wide text-q-muted">
                          Public URL
                        </div>
                        <div className="mt-1 text-sm font-medium text-q-text">
                          {item.public_url}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-q-border bg-q-card p-4 text-sm text-q-muted">
                      {item.reason}
                    </div>
                  </div>

                  <div className="w-full xl:max-w-md">
                    <label className="mb-2 block text-sm font-medium text-q-text">
                      Assign supported engine
                    </label>
                    <select
                      value={engineSelections[item.slug] || ""}
                      onChange={(e) =>
                        setEngineSelections((prev) => ({
                          ...prev,
                          [item.slug]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none"
                    >
                      <option value="">Select engine type</option>
                      {SUPPORTED_TOOL_ENGINES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <label className="mb-2 mt-4 block text-sm font-medium text-q-text">
                      Engine config JSON
                    </label>
                    <textarea
                      value={configInputs[item.slug] || "{}"}
                      onChange={(e) =>
                        setConfigInputs((prev) => ({
                          ...prev,
                          [item.slug]: e.target.value,
                        }))
                      }
                      className="min-h-[160px] w-full rounded-xl border border-q-border bg-q-card p-4 font-mono text-sm text-q-text outline-none"
                    />

                    <button
                      onClick={() => activateTool(item.slug)}
                      disabled={busySlug === item.slug}
                      className="mt-4 w-full rounded-xl bg-q-primary px-4 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
                    >
                      {busySlug === item.slug ? "Activating..." : "Activate Tool"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}