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

export type ToolEngineDefinition = {
  type: ToolEngineType;
  family: ToolEngineFamily;
  title: string;
  description: string;
  keywords: string[];
  defaultConfig: Record<string, unknown>;
};

const TOOL_ENGINE_TYPES: ToolEngineType[] = [
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

export const TOOL_ENGINE_DEFINITIONS: Record<ToolEngineType, ToolEngineDefinition> =
  TOOL_ENGINE_TYPES.reduce((accumulator, type) => {
    const definition = getEngineDefinition(type);
    accumulator[type] = {
      type,
      family: definition.family as ToolEngineFamily,
      title: definition.title,
      description: definition.description,
      keywords: [...definition.keywords],
      defaultConfig: { ...definition.defaultConfig },
    };
    return accumulator;
  }, {} as Record<ToolEngineType, ToolEngineDefinition>);

export function normalizeToolEngineConfig(
  engineType: ToolEngineType,
  input: unknown
): Record<string, unknown> {
  const defaults = TOOL_ENGINE_DEFINITIONS[engineType]?.defaultConfig || {};
  return {
    ...defaults,
    ...normalizeEngineConfig(input),
  };
}

export function inferToolEngineType(slug: string): ToolEngineType {
  return (inferEngineType("tool", slug) || "generic-directory") as ToolEngineType;
}

export function getToolEngineDefinition(
  engineType: string | null | undefined,
  fallbackSlug: string
): ToolEngineDefinition {
  const normalized = ((engineType && String(engineType).trim().toLowerCase()) ||
    inferToolEngineType(fallbackSlug)) as ToolEngineType;
  return TOOL_ENGINE_DEFINITIONS[normalized] || TOOL_ENGINE_DEFINITIONS["generic-directory"];
}

export function resolveToolEngine(item: PublicContentItem) {
  const definition = getToolEngineDefinition(item.engine_type as string | null | undefined, item.slug);

  return {
    definition,
    engineType: definition.type,
    config: normalizeToolEngineConfig(definition.type, item.engine_config),
  };
}

export function supportsWorkingToolEngine(slug: string) {
  return inferToolEngineType(slug) !== "generic-directory";
}