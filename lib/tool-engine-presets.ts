/**
 * lib/tool-engine-presets.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * FULLY DYNAMIC — no hardcoded engine list.
 *
 * Presets are built automatically from ENGINE_CATALOG at module load time.
 * To add a new engine: add it to engine-catalog.ts only. Nothing to change here.
 *
 * How it works:
 *   ENGINE_CATALOG (source of truth) → PRESETS (auto-built) → resolveToolEnginePreset
 *
 * ToolEngineFamily is now a plain string — never needs updating when new
 * families are added to the catalog.
 */

import type { PublicContentItem } from "@/lib/content-pages";
import {
  ENGINE_CATALOG,
  inferEngineType,
  normalizeEngineConfig,
} from "@/lib/engine-catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

// Open string — no manual union needed. Any family from the catalog works.
export type ToolEngineFamily = string;

export type ToolEnginePreset = {
  engineType: string;
  family: ToolEngineFamily;
  title: string;
  description: string;
  config: Record<string, unknown>;
};

// ─── Dynamic preset registry ──────────────────────────────────────────────────
// Built once at module load from ENGINE_CATALOG.
// Every engine in the catalog is automatically available as a preset.
// Zero manual registration required when adding new engines.

const PRESETS: Record<string, ToolEnginePreset> = Object.entries(ENGINE_CATALOG).reduce(
  (acc, [engineType, definition]) => {
    acc[engineType] = {
      engineType,
      family: String(definition.family || "generic-directory"),
      title: String(definition.title || engineType),
      description: String(definition.description || ""),
      config: { ...(definition.defaultConfig || {}) },
    };
    return acc;
  },
  {} as Record<string, ToolEnginePreset>
);

// ─── Resolver ─────────────────────────────────────────────────────────────────

function resolveToolEnginePreset(item: PublicContentItem): ToolEnginePreset {
  // Step 1: use item.engine_type if it maps to a known preset
  let engineType = String(item.engine_type || "").trim().toLowerCase();

  // Step 2: if missing or unknown, infer from slug using catalog rules
  if (!engineType || !PRESETS[engineType]) {
    const inferred = inferEngineType("tool", item.slug);
    if (inferred && PRESETS[inferred]) {
      engineType = inferred;
    }
  }

  // Step 3: fallback to generic-directory
  if (!engineType || !PRESETS[engineType]) {
    engineType = "generic-directory";
  }

  const preset = PRESETS[engineType] ?? PRESETS["generic-directory"];
  const itemConfig = normalizeEngineConfig(item.engine_config);

  return {
    ...preset,
    title: String(itemConfig.title || item.name || preset.title),
    description: String(itemConfig.description || item.description || preset.description),
    config: {
      ...preset.config,
      ...itemConfig,
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getToolEnginePreset(item: PublicContentItem): ToolEnginePreset;
export function getToolEnginePreset(name: string, slug: string): ToolEnginePreset;
export function getToolEnginePreset(
  itemOrName: PublicContentItem | string,
  slug?: string
): ToolEnginePreset {
  if (typeof itemOrName === "string") {
    const syntheticItem: PublicContentItem = {
      name: itemOrName,
      slug: slug || itemOrName,
      description: "",
      related_slugs: [],
      engine_type: null,
      engine_config: {},
      created_at: null,
    };
    return resolveToolEnginePreset(syntheticItem);
  }
  return resolveToolEnginePreset(itemOrName);
}

/**
 * Returns all registered preset families derived from the catalog.
 * Useful for admin UI dropdowns and diagnostics.
 */
export function getAllToolEngineFamilies(): string[] {
  return [...new Set(Object.values(PRESETS).map((p) => p.family))].sort();
}

/**
 * Returns all registered engine types from the catalog.
 * Replaces the old hardcoded TOOL_PRESET_TYPES array entirely.
 */
export function getAllToolEngineTypes(): string[] {
  return Object.keys(PRESETS).sort();
}

/**
 * Check if a given engine type is a real working engine (not generic-directory).
 */
export function isKnownEngineType(engineType: string): boolean {
  return engineType in PRESETS && engineType !== "generic-directory";
}