import type { PublicContentItem } from "@/lib/content-pages";
import {
  getEngineDefinition,
  inferEngineType,
  normalizeEngineConfig,
  type ToolEngineType,
} from "@/lib/engine-catalog";

export type ToolEngineFamily =
  | "strength-checker"
  | "string-generator"
  | "text-formatter"
  | "text-analyzer"
  | "text-transformer"
  | "codec"
  | "snippet-manager"
  | "number-generator"
  | "unit-converter"
  | "currency-converter"
  | "regex-tools"
  | "hash-tools"
  | "timestamp-tools"
  | "color-tools"
  | "developer-converters"
  | "generic-directory";

export type ToolEnginePreset = {
  engineType: string;
  family: ToolEngineFamily;
  title: string;
  description: string;
  config: Record<string, unknown>;
};

const TOOL_PRESET_TYPES: ToolEngineType[] = [
  "password-strength-checker",
  "password-generator",
  "json-formatter",
  "word-counter",
  "uuid-generator",
  "slug-generator",
  "random-string-generator",
  "base64-encoder",
  "base64-decoder",
  "url-encoder",
  "url-decoder",
  "text-case-converter",
  "code-formatter",
  "code-snippet-manager",
  "text-transformer",
  "number-generator",
  "unit-converter",
  "currency-converter",
  "regex-tester",
  "regex-extractor",
  "sha256-generator",
  "md5-generator",
  "timestamp-converter",
  "hex-to-rgb",
  "rgb-to-hex",
  "text-to-binary",
  "binary-to-text",
  "json-escape",
  "json-unescape",
  "generic-directory",
];

const PRESETS: Record<string, ToolEnginePreset> = TOOL_PRESET_TYPES.reduce(
  (accumulator, engineType) => {
    const definition = getEngineDefinition(engineType);
    accumulator[engineType] = {
      engineType,
      family: definition.family as ToolEngineFamily,
      title: definition.title,
      description: definition.description,
      config: { ...definition.defaultConfig },
    };
    return accumulator;
  },
  {} as Record<string, ToolEnginePreset>
);

/* 🔥 NEW: SMART FALLBACK (SAFE) */
function inferFallbackEngineType(slug: string): ToolEngineType | null {
  const s = slug.toLowerCase();

  if (s.includes("password")) return "password-generator";
  if (s.includes("uuid")) return "uuid-generator";
  if (s.includes("json")) return "json-formatter";
  if (s.includes("word")) return "word-counter";
  if (s.includes("slug")) return "slug-generator";
  if (s.includes("base64")) return "base64-encoder";
  if (s.includes("url")) return "url-encoder";
  if (s.includes("regex")) return "regex-tester";
  if (s.includes("hash") || s.includes("sha") || s.includes("md5")) return "sha256-generator";
  if (s.includes("timestamp")) return "timestamp-converter";
  if (s.includes("binary")) return "text-to-binary";
  if (s.includes("color") || s.includes("hex") || s.includes("rgb")) return "hex-to-rgb";

  return null;
}

export function getToolEnginePreset(item: PublicContentItem): ToolEnginePreset {
  const inferred = inferEngineType("tool", item.slug);

  let engineType = String(item.engine_type || inferred || "").trim().toLowerCase();

  /* 🔥 NEW: fallback before generic */
  if (!engineType || !PRESETS[engineType]) {
    const fallback = inferFallbackEngineType(item.slug);
    if (fallback) {
      engineType = fallback;
    }
  }

  /* FINAL fallback (existing) */
  if (!engineType || !PRESETS[engineType]) {
    engineType = "generic-directory";
  }

  const preset = PRESETS[engineType];
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