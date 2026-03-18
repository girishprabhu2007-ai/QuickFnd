import { inferEngineType, type ToolEngineType } from "@/lib/engine-catalog";

export type LegacyToolEngineType =
  | "uuid-generator"
  | "slug-generator"
  | "random-string-generator"
  | "base64-encoder"
  | "base64-decoder"
  | "url-encoder"
  | "url-decoder"
  | "text-case-converter"
  | null;

const LEGACY_SUPPORTED_ENGINES = new Set<ToolEngineType>([
  "uuid-generator",
  "slug-generator",
  "random-string-generator",
  "base64-encoder",
  "base64-decoder",
  "url-encoder",
  "url-decoder",
  "text-case-converter",
]);

export function getToolEngineType(slug: string): LegacyToolEngineType {
  const inferred = inferEngineType("tool", slug) as ToolEngineType | null;
  if (inferred && LEGACY_SUPPORTED_ENGINES.has(inferred)) {
    return inferred as LegacyToolEngineType;
  }

  return null;
}

export function supportsWorkingToolEngine(slug: string) {
  return getToolEngineType(slug) !== null;
}