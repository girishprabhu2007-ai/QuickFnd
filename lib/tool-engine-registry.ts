import type { PublicContentItem } from "@/lib/content-pages";

export type ToolEngineType =
  | "password-strength-checker"
  | "password-generator"
  | "json-formatter"
  | "word-counter"
  | "uuid-generator"
  | "slug-generator"
  | "random-string-generator"
  | "base64-encoder"
  | "base64-decoder"
  | "url-encoder"
  | "url-decoder"
  | "text-case-converter"
  | "text-transformer"
  | "number-generator"
  | "unit-converter"
  | "currency-converter"
  | "generic-directory";

export type ToolEngineFamily =
  | "checker"
  | "generator"
  | "formatter"
  | "counter"
  | "encoder"
  | "decoder"
  | "transformer"
  | "converter"
  | "fallback";

export type ToolEngineDefinition = {
  type: ToolEngineType;
  family: ToolEngineFamily;
  title: string;
  description: string;
  keywords: string[];
  defaultConfig: Record<string, unknown>;
};

export const TOOL_ENGINE_DEFINITIONS: Record<ToolEngineType, ToolEngineDefinition> = {
  "password-strength-checker": {
    type: "password-strength-checker",
    family: "checker",
    title: "Password Strength Checker",
    description: "Checks password quality using configurable scoring rules.",
    keywords: ["password-strength", "password-strength-checker", "password checker"],
    defaultConfig: {
      minLength: 8,
      checks: [
        "length",
        "uppercase",
        "lowercase",
        "number",
        "symbol",
      ],
    },
  },
  "password-generator": {
    type: "password-generator",
    family: "generator",
    title: "Password Generator",
    description: "Generates strong passwords with configurable character rules.",
    keywords: ["password-generator", "password generator"],
    defaultConfig: {
      minLength: 8,
      maxLength: 64,
      defaultLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    },
  },
  "json-formatter": {
    type: "json-formatter",
    family: "formatter",
    title: "JSON Formatter",
    description: "Formats and minifies JSON.",
    keywords: ["json-formatter", "json formatter", "json"],
    defaultConfig: {},
  },
  "word-counter": {
    type: "word-counter",
    family: "counter",
    title: "Word Counter",
    description: "Counts words, characters, and reading time.",
    keywords: ["word-counter", "word counter", "character-counter", "character counter"],
    defaultConfig: {
      readingWordsPerMinute: 200,
    },
  },
  "uuid-generator": {
    type: "uuid-generator",
    family: "generator",
    title: "UUID Generator",
    description: "Generates browser-side UUID values.",
    keywords: ["uuid-generator", "uuid"],
    defaultConfig: {},
  },
  "slug-generator": {
    type: "slug-generator",
    family: "transformer",
    title: "Slug Generator",
    description: "Converts text into URL-safe slugs.",
    keywords: ["slug-generator", "slug generator"],
    defaultConfig: {},
  },
  "random-string-generator": {
    type: "random-string-generator",
    family: "generator",
    title: "Random String Generator",
    description: "Generates random strings using selected character sets.",
    keywords: ["random-string-generator", "string-generator", "random string"],
    defaultConfig: {
      minLength: 4,
      maxLength: 128,
      defaultLength: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
    },
  },
  "base64-encoder": {
    type: "base64-encoder",
    family: "encoder",
    title: "Base64 Encoder",
    description: "Encodes text into Base64.",
    keywords: ["base64-encoder", "base64 encoder"],
    defaultConfig: {},
  },
  "base64-decoder": {
    type: "base64-decoder",
    family: "decoder",
    title: "Base64 Decoder",
    description: "Decodes Base64 text.",
    keywords: ["base64-decoder", "base64 decoder"],
    defaultConfig: {},
  },
  "url-encoder": {
    type: "url-encoder",
    family: "encoder",
    title: "URL Encoder",
    description: "Encodes text for safe URL usage.",
    keywords: ["url-encoder", "url encoder"],
    defaultConfig: {},
  },
  "url-decoder": {
    type: "url-decoder",
    family: "decoder",
    title: "URL Decoder",
    description: "Decodes URL encoded text.",
    keywords: ["url-decoder", "url decoder"],
    defaultConfig: {},
  },
  "text-case-converter": {
    type: "text-case-converter",
    family: "transformer",
    title: "Text Case Converter",
    description: "Converts text into common case formats.",
    keywords: ["text-case-converter", "case-converter", "case converter"],
    defaultConfig: {
      modes: ["lowercase", "uppercase", "titlecase", "slug"],
    },
  },
  "text-transformer": {
    type: "text-transformer",
    family: "transformer",
    title: "Text Transformer",
    description: "Transforms text using config-driven modes.",
    keywords: ["text-transformer", "text transform"],
    defaultConfig: {
      modes: ["lowercase", "uppercase", "titlecase", "slug", "trim-lines"],
    },
  },
  "number-generator": {
    type: "number-generator",
    family: "generator",
    title: "Random Number Generator",
    description: "Generates random numbers inside a config-driven range.",
    keywords: ["number-generator", "random-number-generator", "random number"],
    defaultConfig: {
      min: 1,
      max: 100,
      allowDecimal: false,
      decimalPlaces: 2,
    },
  },
  "unit-converter": {
    type: "unit-converter",
    family: "converter",
    title: "Unit Converter",
    description: "Converts between two units using a multiplier.",
    keywords: ["unit-converter", "converter", "convert"],
    defaultConfig: {
      fromUnit: "meters",
      toUnit: "feet",
      multiplier: 3.28084,
      precision: 4,
    },
  },
  "currency-converter": {
    type: "currency-converter",
    family: "converter",
    title: "Currency Converter",
    description: "Converts live currencies using a real exchange-rate API.",
    keywords: ["currency-converter", "currency converter"],
    defaultConfig: {},
  },
  "generic-directory": {
    type: "generic-directory",
    family: "fallback",
    title: "Generic Directory Page",
    description: "Fallback view for unsupported tool ideas.",
    keywords: [],
    defaultConfig: {},
  },
};

export function normalizeToolEngineConfig(
  engineType: ToolEngineType,
  input: unknown
): Record<string, unknown> {
  const defaults = TOOL_ENGINE_DEFINITIONS[engineType]?.defaultConfig || {};

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ...defaults };
  }

  return {
    ...defaults,
    ...(input as Record<string, unknown>),
  };
}

export function inferToolEngineType(slug: string): ToolEngineType {
  const value = String(slug || "")
    .toLowerCase()
    .trim();

  for (const definition of Object.values(TOOL_ENGINE_DEFINITIONS)) {
    if (definition.type === "generic-directory") {
      continue;
    }

    if (definition.keywords.some((keyword) => value.includes(keyword))) {
      return definition.type;
    }
  }

  if (value.includes("base64") && value.includes("decode")) return "base64-decoder";
  if (value.includes("base64")) return "base64-encoder";
  if (value.includes("url") && value.includes("decode")) return "url-decoder";
  if (value.includes("url")) return "url-encoder";
  if (value.includes("password") && value.includes("strength")) return "password-strength-checker";
  if (value.includes("password") && value.includes("generator")) return "password-generator";
  if (value.includes("word") && value.includes("counter")) return "word-counter";
  if (value.includes("json")) return "json-formatter";
  if (value.includes("uuid")) return "uuid-generator";
  if (value.includes("slug")) return "slug-generator";
  if (value.includes("case")) return "text-case-converter";
  if (value.includes("string") && value.includes("generator")) return "random-string-generator";
  if (value.includes("number") && value.includes("generator")) return "number-generator";
  if (value.includes("currency") && value.includes("converter")) return "currency-converter";
  if (value.includes("converter")) return "unit-converter";

  return "generic-directory";
}

export function getToolEngineDefinition(
  engineType: string | null | undefined,
  fallbackSlug: string
): ToolEngineDefinition {
  const normalized = (engineType || inferToolEngineType(fallbackSlug)) as ToolEngineType;
  return TOOL_ENGINE_DEFINITIONS[normalized] || TOOL_ENGINE_DEFINITIONS["generic-directory"];
}

export function resolveToolEngine(item: PublicContentItem) {
  const definition = getToolEngineDefinition(
    item.engine_type as string | null | undefined,
    item.slug
  );

  return {
    definition,
    engineType: definition.type,
    config: normalizeToolEngineConfig(definition.type, item.engine_config),
  };
}

export function supportsWorkingToolEngine(slug: string) {
  return inferToolEngineType(slug) !== "generic-directory";
}