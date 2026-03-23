"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminEngineOptions,
  suggestAdminEngine,
} from "@/lib/admin-engine-assistant";
import { slugify } from "@/lib/admin-content";
import EngineConfigForm from "@/components/admin/EngineConfigForm";

type Category = "tool" | "calculator" | "ai-tool";

function prettyCategory(value: Category) {
  if (value === "ai-tool") return "AI tool";
  return value;
}

function cleanConfigObject(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

export default function AdminGeneratePage() {
  const [category, setCategory] = useState<Category>("tool");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [engineType, setEngineType] = useState("auto");
  const [engineConfig, setEngineConfig] = useState<Record<string, unknown>>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [slugTouched, setSlugTouched] = useState(false);
  const [configTouched, setConfigTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const suggestion = useMemo(() => {
    return suggestAdminEngine(category, {
      name,
      slug,
      description,
      engine_type: engineType === "auto" ? undefined : engineType,
    });
  }, [category, name, slug, description, engineType]);

  const engineOptions = useMemo(() => {
    return getAdminEngineOptions(category);
  }, [category]);

  const effectiveEngineType =
    engineType === "auto" ? suggestion.engine_type || "" : engineType;

  const autoEngineConfig = useMemo(() => {
    return cleanConfigObject(suggestion.engine_config || {});
  }, [suggestion]);

  const effectiveEngineConfig = useMemo(() => {
    return configTouched ? cleanConfigObject(engineConfig) : autoEngineConfig;
  }, [configTouched, engineConfig, autoEngineConfig]);

  const engineConfigJson = useMemo(() => {
    return JSON.stringify(effectiveEngineConfig, null, 2);
  }, [effectiveEngineConfig]);

  async function handleCreate() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/create-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          name,
          slug,
          description,
          engine_type: engineType,
          engine_config: effectiveEngineConfig,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || !data.success) {
        throw new Error(data?.error || `Failed to create ${prettyCategory(category)}.`);
      }

      setMessage(
        data.alreadyExists
          ? `Already exists: ${data.path}`
          : `Created successfully: ${data.path}`
      );

      setName("");
      setSlug("");
      setDescription("");
      setEngineType("auto");
      setEngineConfig({});
      setSlugTouched(false);
      setConfigTouched(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Failed to create ${prettyCategory(category)}.`
      );
    } finally {
      setLoading(false);
    }
  }

  function fillExample(nextCategory: Category, nextName: string, nextDescription: string) {
    setCategory(nextCategory);
    setName(nextName);
    setDescription(nextDescription);
    setEngineType("auto");
    setEngineConfig({});
    setSlugTouched(false);
    setConfigTouched(false);
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">Generate one item</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-q-muted md:text-base">
        Create a single live tool, calculator, or AI tool with automatic engine
        assignment and structured engine config fields.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                setEngineType("auto");
                setEngineConfig({});
                setConfigTouched(false);
              }}
              className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
            >
              <option value="tool">Tool</option>
              <option value="calculator">Calculator</option>
              <option value="ai-tool">AI Tool</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Password Generator"
              className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="password-generator"
              className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Two concise SEO-friendly sentences."
              rows={5}
              className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              Engine
            </label>
            <select
              value={engineType}
              onChange={(e) => {
                setEngineType(e.target.value);
                setEngineConfig({});
                setConfigTouched(false);
              }}
              className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
            >
              <option value="auto">Auto (recommended)</option>
              {engineOptions.map((option) => (
                <option key={`${category}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <EngineConfigForm
            category={category}
            engineType={effectiveEngineType}
            value={effectiveEngineConfig}
            onChange={(nextValue) => {
              setConfigTouched(true);
              setEngineConfig(nextValue);
            }}
          />

          <div className="rounded-2xl border border-q-border bg-q-bg p-4">
            <div className="mb-2 text-sm font-medium text-q-text">Engine config JSON preview</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-q-muted">
              {engineConfigJson}
            </pre>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : `Create ${prettyCategory(category)}`}
          </button>

          {message ? (
            <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-q-border bg-q-bg p-5">
            <h3 className="text-lg font-semibold text-q-text">Engine recommendation</h3>
            <p className="mt-3 text-sm leading-6 text-q-muted">{suggestion.reason}</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-q-border bg-q-card p-4">
                <div className="text-xs uppercase tracking-wide text-q-muted">
                  Suggested engine
                </div>
                <div className="mt-2 text-sm font-medium text-q-text">
                  {suggestion.engine_type || "None"}
                </div>
              </div>

              <div className="rounded-xl border border-q-border bg-q-card p-4">
                <div className="text-xs uppercase tracking-wide text-q-muted">
                  Current engine
                </div>
                <div className="mt-2 text-sm font-medium text-q-text">
                  {effectiveEngineType || "None"}
                </div>
              </div>

              <div className="rounded-xl border border-q-border bg-q-card p-4">
                <div className="text-xs uppercase tracking-wide text-q-muted">
                  Support status
                </div>
                <div className="mt-2 text-sm font-medium text-q-text">
                  {category === "ai-tool"
                    ? "Supported"
                    : suggestion.is_supported
                      ? "Supported"
                      : "Needs new engine"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-q-border bg-q-bg p-5">
            <h3 className="text-lg font-semibold text-q-text">Examples</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  fillExample(
                    "tool",
                    "Password Generator",
                    "Generate secure passwords instantly with configurable length and character sets."
                  )
                }
                className="rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm text-q-text transition hover:bg-q-card-hover"
              >
                Password Generator
              </button>

              <button
                onClick={() =>
                  fillExample(
                    "tool",
                    "Base64 Decoder",
                    "Decode Base64 strings into readable text directly in the browser."
                  )
                }
                className="rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm text-q-text transition hover:bg-q-card-hover"
              >
                Base64 Decoder
              </button>

              <button
                onClick={() =>
                  fillExample(
                    "calculator",
                    "Loan Calculator",
                    "Calculate monthly payments and estimated loan totals quickly."
                  )
                }
                className="rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm text-q-text transition hover:bg-q-card-hover"
              >
                Loan Calculator
              </button>

              <button
                onClick={() =>
                  fillExample(
                    "ai-tool",
                    "AI Email Writer",
                    "Generate polished email drafts for outreach, support, and follow-up messages."
                  )
                }
                className="rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm text-q-text transition hover:bg-q-card-hover"
              >
                AI Email Writer
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}