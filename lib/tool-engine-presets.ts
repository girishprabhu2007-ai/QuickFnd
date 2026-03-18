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

export function getToolEnginePreset(item: PublicContentItem): ToolEnginePreset {
  const inferred = inferEngineType("tool", item.slug) || "generic-directory";
  const engineType = String(item.engine_type || inferred).trim().toLowerCase();
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