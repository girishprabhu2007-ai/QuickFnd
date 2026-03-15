"use client";

import { useMemo, useState } from "react";
import type { AdminCategory, GeneratedAdminContent } from "@/lib/admin-content";
import { normalizeRelatedSlugs, slugify } from "@/lib/admin-content";
import {
  ENGINE_OPTIONS,
  inferEngineType,
  normalizeEngineConfig,
  type EngineType,
} from "@/lib/engine-metadata";

const categoryOptions: { label: string; value: AdminCategory }[] = [
  { label: "Tool", value: "tool" },
  { label: "Calculator", value: "calculator" },
  { label: "AI Tool", value: "ai-tool" },
];

const saveRouteMap: Record<AdminCategory, string> = {
  tool: "/api/admin/add-tool",
  calculator: "/api/admin/add-calculator",
  "ai-tool": "/api/admin/add-ai-tool",
};

function prettyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

export default function AdminGeneratePage() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<AdminCategory>("tool");
  const [generated, setGenerated] = useState<GeneratedAdminContent | null>(null);
  const [engineConfigText, setEngineConfigText] = useState("{}");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const relatedSlugsText = useMemo(() => {
    return generated?.related_slugs?.join(", ") ?? "";
  }, [generated]);

  const engineOptions = ENGINE_OPTIONS[category];

  async function handleGenerate() {
    setError("");
    setSuccess("");

    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "admin-content",
          topic,
          category,
        }),
      });

      const data = (await response.json()) as {
        item?: GeneratedAdminContent;
        error?: string;
      };

      if (!response.ok || !data.item) {
        throw new Error(data?.error || "Failed to generate content.");
      }

      setGenerated(data.item);
      setEngineConfigText(prettyJson(data.item.engine_config));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!generated) {
      setError("Generate content first.");
      return;
    }

    if (!generated.name.trim() || !generated.slug.trim() || !generated.description.trim()) {
      setError("Name, slug, and description are required before saving.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(saveRouteMap[category], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...generated,
          engine_config: normalizeEngineConfig(engineConfigText),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save content.");
      }

      setSuccess(`Saved successfully to ${category}.`);
      setTopic("");
      setGenerated(null);
      setEngineConfigText("{}");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateGenerated<K extends keyof GeneratedAdminContent>(
    key: K,
    value: GeneratedAdminContent[K]
  ) {
    setGenerated((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  }

  function loadPresetConfig(nextEngine: string) {
    if (nextEngine === "text-transformer") {
      setEngineConfigText(
        prettyJson({
          title: "Text Transformer",
          modes: ["lowercase", "uppercase", "titlecase", "slug"],
        })
      );
      return;
    }

    if (nextEngine === "number-generator") {
      setEngineConfigText(
        prettyJson({
          title: "Random Number Generator",
          min: 1,
          max: 100,
          allowDecimal: false,
        })
      );
      return;
    }

    if (nextEngine === "unit-converter") {
      setEngineConfigText(
        prettyJson({
          title: "Meters to Feet Converter",
          fromUnit: "meters",
          toUnit: "feet",
          multiplier: 3.28084,
        })
      );
      return;
    }

    if (nextEngine === "simple-interest-calculator") {
      setEngineConfigText(
        prettyJson({
          title: "Simple Interest Calculator",
        })
      );
      return;
    }

    if (nextEngine === "gst-calculator") {
      setEngineConfigText(
        prettyJson({
          title: "GST Calculator",
          defaultRate: 18,
        })
      );
      return;
    }

    setEngineConfigText("{}");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-semibold text-white">Generate content</h2>
        <p className="mt-2 text-sm text-gray-400">
          Enter a topic and choose where the new item belongs.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. UUID Generator"
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AdminCategory)}
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>

          {error ? (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-semibold text-white">Preview & edit</h2>
        <p className="mt-2 text-sm text-gray-400">
          Review the generated result before saving to the database.
        </p>

        {!generated ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-950 p-10 text-center text-gray-500">
            No content generated yet.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Name</label>
              <input
                value={generated.name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  const nextSlug = slugify(nextName);
                  updateGenerated("name", nextName);
                  if (!generated.slug.trim() || generated.slug === slugify(generated.name)) {
                    updateGenerated("slug", nextSlug);
                    updateGenerated("engine_type", inferEngineType(category, nextSlug) as EngineType | null);
                  }
                }}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Slug</label>
              <input
                value={generated.slug}
                onChange={(e) => {
                  const nextSlug = slugify(e.target.value);
                  updateGenerated("slug", nextSlug);
                  updateGenerated("engine_type", inferEngineType(category, nextSlug) as EngineType | null);
                }}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Engine type</label>
              <select
                value={generated.engine_type || "generic-directory"}
                onChange={(e) => {
                  updateGenerated("engine_type", e.target.value as EngineType);
                  loadPresetConfig(e.target.value);
                }}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
              >
                {engineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Engine config (JSON)</label>
              <textarea
                rows={8}
                value={engineConfigText}
                onChange={(e) => setEngineConfigText(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Description</label>
              <textarea
                rows={8}
                value={generated.description}
                onChange={(e) => updateGenerated("description", e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Related slugs</label>
              <input
                value={relatedSlugsText}
                onChange={(e) => updateGenerated("related_slugs", normalizeRelatedSlugs(e.target.value))}
                placeholder="comma-separated-slugs"
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save to database"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}