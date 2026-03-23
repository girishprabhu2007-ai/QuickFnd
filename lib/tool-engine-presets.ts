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
  | "qr-generator"
  | "color-picker"
  | "markdown-editor"
  | "csv-to-json"
  | "ip-lookup"
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
  "qr-generator",
  "color-picker",
  "markdown-editor",
  "csv-to-json",
  "ip-lookup",
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

function inferFallbackEngineType(slug: string): ToolEngineType | null {
  const s = slug.toLowerCase();

  if (s.includes("password-strength")) return "password-strength-checker";
  if (s.includes("password")) return "password-generator";
  if (s.includes("uuid")) return "uuid-generator";
  if (s.includes("slug")) return "slug-generator";
  if (s.includes("random-string")) return "random-string-generator";

  if (s.includes("json-formatter")) return "json-formatter";
  if (s.includes("json-escape")) return "json-escape";
  if (s.includes("json-unescape")) return "json-unescape";

  if (s.includes("word-counter")) return "word-counter";

  if (s.includes("base64-decoder")) return "base64-decoder";
  if (s.includes("base64-encoder")) return "base64-encoder";

  if (s.includes("url-decoder")) return "url-decoder";
  if (s.includes("url-encoder")) return "url-encoder";

  if (s.includes("text-case")) return "text-case-converter";
  if (s.includes("text-transform")) return "text-transformer";

  if (s.includes("code-formatter")) return "code-formatter";
  if (s.includes("code-snippet")) return "code-snippet-manager";

  if (s.includes("number-generator")) return "number-generator";
  if (s.includes("unit-converter")) return "unit-converter";
  if (s.includes("currency-converter")) return "currency-converter";

  if (s.includes("regex-extractor")) return "regex-extractor";
  if (s.includes("regex")) return "regex-tester";

  if (s.includes("sha256")) return "sha256-generator";
  if (s.includes("md5")) return "md5-generator";

  if (s.includes("timestamp")) return "timestamp-converter";

  if (s.includes("hex-to-rgb")) return "hex-to-rgb";
  if (s.includes("rgb-to-hex")) return "rgb-to-hex";

  if (s.includes("text-to-binary")) return "text-to-binary";
  if (s.includes("binary-to-text")) return "binary-to-text";

  if (s.includes("hex") || s.includes("rgb") || s.includes("color")) return "hex-to-rgb";
  if (s.includes("binary")) return "text-to-binary";
  if (s.includes("hash")) return "sha256-generator";

  return null;
}

function resolveToolEnginePreset(item: PublicContentItem): ToolEnginePreset {
  const inferred = inferEngineType("tool", item.slug);

  let engineType = String(item.engine_type || inferred || "")
    .trim()
    .toLowerCase();

  if (!engineType || !PRESETS[engineType]) {
    const fallback = inferFallbackEngineType(item.slug || "");
    if (fallback) {
      engineType = fallback;
    }
  }

  if (!engineType || !PRESETS[engineType]) {
    engineType = "generic-directory";
  }

  const preset = PRESETS[engineType] || PRESETS["generic-directory"];
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