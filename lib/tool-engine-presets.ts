import type { PublicContentItem } from "@/lib/content-pages";
import { inferEngineType, normalizeEngineConfig } from "@/lib/engine-metadata";

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

const PRESETS: Record<string, ToolEnginePreset> = {
  "password-strength-checker": {
    engineType: "password-strength-checker",
    family: "strength-checker",
    title: "Password Strength Checker",
    description: "Evaluate password strength using reusable scoring rules.",
    config: {
      minLength: 8,
      scoringRules: ["length", "uppercase", "lowercase", "number", "symbol"],
    },
  },
  "password-generator": {
    engineType: "password-generator",
    family: "string-generator",
    title: "Password Generator",
    description: "Generate secure passwords using configurable character sets.",
    config: {
      mode: "password",
      minLength: 8,
      maxLength: 64,
      defaultLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    },
  },
  "random-string-generator": {
    engineType: "random-string-generator",
    family: "string-generator",
    title: "Random String Generator",
    description: "Generate reusable random strings with configurable options.",
    config: {
      mode: "random-string",
      minLength: 4,
      maxLength: 128,
      defaultLength: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
    },
  },
  "uuid-generator": {
    engineType: "uuid-generator",
    family: "string-generator",
    title: "UUID Generator",
    description: "Generate browser-side UUID values.",
    config: {
      mode: "uuid",
    },
  },
  "json-formatter": {
    engineType: "json-formatter",
    family: "text-formatter",
    title: "JSON Formatter",
    description: "Format or minify JSON using one reusable formatter family.",
    config: {
      mode: "json",
      allowMinify: true,
    },
  },
  "code-formatter": {
    engineType: "code-formatter",
    family: "text-formatter",
    title: "Code Formatter",
    description: "Apply lightweight formatting to JSON or plain code blocks.",
    config: {
      mode: "code",
      allowMinify: false,
    },
  },
  "word-counter": {
    engineType: "word-counter",
    family: "text-analyzer",
    title: "Word Counter",
    description: "Analyze text metrics like words, characters, and reading time.",
    config: {
      readingWordsPerMinute: 200,
    },
  },
  "slug-generator": {
    engineType: "slug-generator",
    family: "text-transformer",
    title: "Slug Generator",
    description: "Convert text into clean URL-ready slugs.",
    config: {
      modes: ["slug"],
    },
  },
  "text-case-converter": {
    engineType: "text-case-converter",
    family: "text-transformer",
    title: "Text Case Converter",
    description: "Convert text to lowercase, uppercase, title case, and slug.",
    config: {
      modes: ["lowercase", "uppercase", "titlecase", "slug"],
    },
  },
  "text-transformer": {
    engineType: "text-transformer",
    family: "text-transformer",
    title: "Text Transformer",
    description: "Run reusable text transforms from config-driven modes.",
    config: {
      modes: ["lowercase", "uppercase", "titlecase", "slug", "trim"],
    },
  },
  "base64-encoder": {
    engineType: "base64-encoder",
    family: "codec",
    title: "Base64 Encoder",
    description: "Encode plain text into Base64.",
    config: {
      mode: "base64-encode",
    },
  },
  "base64-decoder": {
    engineType: "base64-decoder",
    family: "codec",
    title: "Base64 Decoder",
    description: "Decode Base64 input back into plain text.",
    config: {
      mode: "base64-decode",
    },
  },
  "url-encoder": {
    engineType: "url-encoder",
    family: "codec",
    title: "URL Encoder",
    description: "Encode text for safe URL use.",
    config: {
      mode: "url-encode",
    },
  },
  "url-decoder": {
    engineType: "url-decoder",
    family: "codec",
    title: "URL Decoder",
    description: "Decode URL-encoded input.",
    config: {
      mode: "url-decode",
    },
  },
  "code-snippet-manager": {
    engineType: "code-snippet-manager",
    family: "snippet-manager",
    title: "Code Snippet Manager",
    description: "Save, copy, and delete reusable code snippets in the browser.",
    config: {},
  },
  "number-generator": {
    engineType: "number-generator",
    family: "number-generator",
    title: "Number Generator",
    description: "Generate random numbers using a configurable range.",
    config: {
      min: 1,
      max: 100,
      allowDecimal: false,
      decimalPlaces: 2,
    },
  },
  "unit-converter": {
    engineType: "unit-converter",
    family: "unit-converter",
    title: "Unit Converter",
    description: "Convert values between units using config-driven multipliers.",
    config: {
      fromUnit: "meters",
      toUnit: "feet",
      multiplier: 3.28084,
      precision: 4,
    },
  },
  "currency-converter": {
    engineType: "currency-converter",
    family: "currency-converter",
    title: "Currency Converter",
    description: "Convert currencies using the live currency tool engine.",
    config: {},
  },
  "regex-tester": {
    engineType: "regex-tester",
    family: "regex-tools",
    title: "Regex Tester",
    description: "Test regular expressions against text and review match counts.",
    config: {
      mode: "test",
      flags: "g",
    },
  },
  "regex-extractor": {
    engineType: "regex-extractor",
    family: "regex-tools",
    title: "Regex Extractor",
    description: "Extract all matching values from text using a regex pattern.",
    config: {
      mode: "extract",
      flags: "g",
    },
  },
  "sha256-generator": {
    engineType: "sha256-generator",
    family: "hash-tools",
    title: "SHA256 Generator",
    description: "Generate SHA-256 hashes from text input.",
    config: {
      mode: "sha256",
    },
  },
  "md5-generator": {
    engineType: "md5-generator",
    family: "hash-tools",
    title: "MD5 Generator",
    description: "Generate MD5 hashes from text input.",
    config: {
      mode: "md5",
    },
  },
  "timestamp-converter": {
    engineType: "timestamp-converter",
    family: "timestamp-tools",
    title: "Timestamp Converter",
    description: "Convert Unix timestamps and readable dates in one reusable tool.",
    config: {},
  },
  "hex-to-rgb": {
    engineType: "hex-to-rgb",
    family: "color-tools",
    title: "Hex To RGB",
    description: "Convert hex color values into RGB format.",
    config: {
      mode: "hex-to-rgb",
    },
  },
  "rgb-to-hex": {
    engineType: "rgb-to-hex",
    family: "color-tools",
    title: "RGB To Hex",
    description: "Convert RGB color values into hex format.",
    config: {
      mode: "rgb-to-hex",
    },
  },
  "text-to-binary": {
    engineType: "text-to-binary",
    family: "developer-converters",
    title: "Text To Binary",
    description: "Convert text into binary values.",
    config: {
      mode: "text-to-binary",
    },
  },
  "binary-to-text": {
    engineType: "binary-to-text",
    family: "developer-converters",
    title: "Binary To Text",
    description: "Convert binary values into readable text.",
    config: {
      mode: "binary-to-text",
    },
  },
  "json-escape": {
    engineType: "json-escape",
    family: "developer-converters",
    title: "JSON Escape",
    description: "Escape text safely for JSON string usage.",
    config: {
      mode: "json-escape",
    },
  },
  "json-unescape": {
    engineType: "json-unescape",
    family: "developer-converters",
    title: "JSON Unescape",
    description: "Unescape JSON string values back into readable text.",
    config: {
      mode: "json-unescape",
    },
  },
  "generic-directory": {
    engineType: "generic-directory",
    family: "generic-directory",
    title: "Tool Interface",
    description: "This page is live and ready for a dedicated engine later.",
    config: {},
  },
};

export function getToolEnginePreset(item: PublicContentItem): ToolEnginePreset {
  const inferred = inferEngineType("tool", item.slug) || "generic-directory";
  const engineType = String(item.engine_type || inferred);
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