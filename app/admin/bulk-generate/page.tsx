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

type BulkItem = GeneratedAdminContent & {
  localId: string;
  selected: boolean;
  engineConfigText: string;
};

export default function AdminBulkGeneratePage() {
  const [theme, setTheme] = useState("");
  const [category, setCategory] = useState<AdminCategory>("tool");
  const [count, setCount] = useState(10);

  const [items, setItems] = useState<BulkItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCount = useMemo(
    () => items.filter((item) => item.selected).length,
    [items]
  );

  const engineOptions = ENGINE_OPTIONS[category];

  function replaceItem(localId: string, next: Partial<BulkItem>) {
    setItems((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, ...next } : item
      )
    );
  }

  async function handleGenerate() {
    setError("");
    setSuccess("");

    if (!theme.trim()) {
      setError("Please enter a theme first.");
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
          mode: "bulk-admin-content",
          theme,
          category,
          count,
        }),
      });

      const data = (await response.json()) as {
        items?: GeneratedAdminContent[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(data.items)) {
        throw new Error(data?.error || "Failed to bulk generate content.");
      }

      const nextItems: BulkItem[] = data.items.map(
        (item: GeneratedAdminContent, index: number) => ({
          ...item,
          localId: `${Date.now()}-${index}-${item.slug}`,
          selected: true,
          engineConfigText: JSON.stringify(item.engine_config || {}, null, 2),
        })
      );

      setItems(nextItems);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk generate content."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveSelected() {
    setError("");
    setSuccess("");

    const selectedItems = items.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setError("Select at least one item to save.");
      return;
    }

    setIsSaving(true);

    try {
      const saveRoute = saveRouteMap[category];
      let successCount = 0;
      const failed: string[] = [];

      for (const item of selectedItems) {
        const response = await fetch(saveRoute, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            slug: item.slug,
            description: item.description,
            related_slugs: item.related_slugs,
            engine_type: item.engine_type,
            engine_config: normalizeEngineConfig(item.engineConfigText),
          }),
        });

        const data = (await response.json()) as { error?: string };

        if (response.ok) {
          successCount += 1;
        } else {
          failed.push(`${item.name}: ${data?.error || "Save failed"}`);
        }
      }

      if (successCount > 0) {
        setSuccess(`Saved ${successCount} item${successCount === 1 ? "" : "s"} successfully.`);
      }

      if (failed.length > 0) {
        setError(failed.slice(0, 5).join(" | "));
      }

      if (successCount > 0) {
        setItems((prev) => prev.filter((item) => !item.selected));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save items.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleAll(selected: boolean) {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-semibold text-white">Bulk Generate Content</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Generate multiple tools, calculators, or AI tools at once from a single theme.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Category
            </label>
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

          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Count
            </label>
            <input
              type="number"
              min={2}
              max={25}
              value={count}
              onChange={(e) => setCount(Math.max(2, Math.min(25, Number(e.target.value) || 2)))}
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Theme
            </label>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. developer utilities, finance calculators, SEO AI tools"
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Generate Bulk Items"}
          </button>

          <button
            onClick={handleSaveSelected}
            disabled={isSaving || selectedCount === 0}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : `Save Selected (${selectedCount})`}
          </button>

          <button
            onClick={() => toggleAll(true)}
            className="rounded-xl bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-700"
          >
            Select All
          </button>

          <button
            onClick={() => toggleAll(false)}
            className="rounded-xl bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-700"
          >
            Clear Selection
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Generated Items</h3>
            <p className="mt-1 text-sm text-gray-400">
              Edit content, engine type, and config before saving.
            </p>
          </div>
          <div className="text-sm text-gray-400">
            {items.length} total / {selectedCount} selected
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-950 p-10 text-center text-gray-500">
            No items generated yet.
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
              <div
                key={item.localId}
                className="rounded-2xl border border-gray-800 bg-gray-950 p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) =>
                        replaceItem(item.localId, { selected: e.target.checked })
                      }
                    />
                    Select for save
                  </label>
                  <button
                    onClick={() =>
                      setItems((prev) =>
                        prev.filter((current) => current.localId !== item.localId)
                      )
                    }
                    className="text-sm text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Name
                    </label>
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        const nextSlug = slugify(nextName);
                        replaceItem(item.localId, {
                          name: nextName,
                          slug: item.slug === slugify(item.name) ? nextSlug : item.slug,
                          engine_type:
                            item.slug === slugify(item.name)
                              ? (inferEngineType(category, nextSlug) as EngineType)
                              : item.engine_type,
                        });
                      }}
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Slug
                    </label>
                    <input
                      value={item.slug}
                      onChange={(e) => {
                        const nextSlug = slugify(e.target.value);
                        replaceItem(item.localId, {
                          slug: nextSlug,
                          engine_type: inferEngineType(category, nextSlug) as EngineType,
                        });
                      }}
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Engine type
                    </label>
                    <select
                      value={item.engine_type || "generic-directory"}
                      onChange={(e) =>
                        replaceItem(item.localId, {
                          engine_type: e.target.value as EngineType,
                        })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
                    >
                      {engineOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Engine config (JSON)
                    </label>
                    <textarea
                      rows={4}
                      value={item.engineConfigText}
                      onChange={(e) =>
                        replaceItem(item.localId, { engineConfigText: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={item.description}
                      onChange={(e) =>
                        replaceItem(item.localId, { description: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Related slugs
                    </label>
                    <input
                      value={item.related_slugs.join(", ")}
                      onChange={(e) =>
                        replaceItem(item.localId, {
                          related_slugs: normalizeRelatedSlugs(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}