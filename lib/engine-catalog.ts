export type EngineCategory = "tool" | "calculator" | "ai-tool";

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
  | "code-formatter"
  | "code-snippet-manager"
  | "text-transformer"
  | "number-generator"
  | "unit-converter"
  | "currency-converter"
  | "regex-tester"
  | "regex-extractor"
  | "sha256-generator"
  | "md5-generator"
  | "timestamp-converter"
  | "hex-to-rgb"
  | "rgb-to-hex"
  | "text-to-binary"
  | "binary-to-text"
  | "json-escape"
  | "json-unescape"
  | "generic-directory";

export type CalculatorEngineType =
  | "age-calculator"
  | "bmi-calculator"
  | "loan-calculator"
  | "emi-calculator"
  | "percentage-calculator"
  | "simple-interest-calculator"
  | "gst-calculator"
  | "generic-directory";

export type AIToolEngineType =
  | "openai-text-tool"
  | "ai-prompt-generator"
  | "ai-email-writer"
  | "ai-blog-outline-generator"
  | "generic-directory";

export type EngineType = ToolEngineType | CalculatorEngineType | AIToolEngineType;
export type EngineConfig = Record<string, unknown>;

export type EngineOption = {
  value: EngineType;
  label: string;
};

export type CatalogEngineDefinition = {
  type: EngineType;
  category: EngineCategory;
  family: string;
  title: string;
  description: string;
  keywords: string[];
  defaultConfig: EngineConfig;
};

function createDefinition(definition: CatalogEngineDefinition): CatalogEngineDefinition {
  return definition;
}

export const ENGINE_CATALOG: Record<EngineType, CatalogEngineDefinition> = {
  "password-strength-checker": createDefinition({
    type: "password-strength-checker",
    category: "tool",
    family: "strength-checker",
    title: "Password Strength Checker",
    description: "Evaluate password strength using reusable scoring rules.",
    keywords: ["password-strength", "password strength", "password checker"],
    defaultConfig: {
      minLength: 8,
      scoringRules: ["length", "uppercase", "lowercase", "number", "symbol"],
      checks: ["length", "uppercase", "lowercase", "number", "symbol"],
    },
  }),
  "password-generator": createDefinition({
    type: "password-generator",
    category: "tool",
    family: "string-generator",
    title: "Password Generator",
    description: "Generate secure passwords using configurable character sets.",
    keywords: ["password-generator", "password generator"],
    defaultConfig: {
      mode: "password",
      minLength: 8,
      maxLength: 64,
      defaultLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    },
  }),
  "json-formatter": createDefinition({
    type: "json-formatter",
    category: "tool",
    family: "text-formatter",
    title: "JSON Formatter",
    description: "Format or minify JSON using one reusable formatter family.",
    keywords: ["json-formatter", "json formatter", "json-pretty", "json-minify"],
    defaultConfig: {
      mode: "json",
      allowMinify: true,
    },
  }),
  "word-counter": createDefinition({
    type: "word-counter",
    category: "tool",
    family: "text-analyzer",
    title: "Word Counter",
    description: "Analyze text metrics like words, characters, and reading time.",
    keywords: [
      "word-counter",
      "word counter",
      "character-counter",
      "character counter",
      "reading-time",
      "reading time",
      "text-counter",
      "text counter",
    ],
    defaultConfig: {
      readingWordsPerMinute: 200,
    },
  }),
  "uuid-generator": createDefinition({
    type: "uuid-generator",
    category: "tool",
    family: "string-generator",
    title: "UUID Generator",
    description: "Generate browser-side UUID values.",
    keywords: ["uuid-generator", "uuid"],
    defaultConfig: {
      mode: "uuid",
    },
  }),
  "slug-generator": createDefinition({
    type: "slug-generator",
    category: "tool",
    family: "text-transformer",
    title: "Slug Generator",
    description: "Convert text into clean URL-ready slugs.",
    keywords: ["slug-generator", "slug generator"],
    defaultConfig: {
      modes: ["slug"],
    },
  }),
  "random-string-generator": createDefinition({
    type: "random-string-generator",
    category: "tool",
    family: "string-generator",
    title: "Random String Generator",
    description: "Generate reusable random strings with configurable options.",
    keywords: ["random-string-generator", "string-generator", "random string"],
    defaultConfig: {
      mode: "random-string",
      minLength: 4,
      maxLength: 128,
      defaultLength: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
    },
  }),
  "base64-encoder": createDefinition({
    type: "base64-encoder",
    category: "tool",
    family: "codec",
    title: "Base64 Encoder",
    description: "Encode plain text into Base64.",
    keywords: ["base64-encoder", "base64 encoder"],
    defaultConfig: {
      mode: "base64-encode",
    },
  }),
  "base64-decoder": createDefinition({
    type: "base64-decoder",
    category: "tool",
    family: "codec",
    title: "Base64 Decoder",
    description: "Decode Base64 input back into plain text.",
    keywords: ["base64-decoder", "base64 decoder"],
    defaultConfig: {
      mode: "base64-decode",
    },
  }),
  "url-encoder": createDefinition({
    type: "url-encoder",
    category: "tool",
    family: "codec",
    title: "URL Encoder",
    description: "Encode text for safe URL use.",
    keywords: ["url-encoder", "url encoder"],
    defaultConfig: {
      mode: "url-encode",
    },
  }),
  "url-decoder": createDefinition({
    type: "url-decoder",
    category: "tool",
    family: "codec",
    title: "URL Decoder",
    description: "Decode URL-encoded input.",
    keywords: ["url-decoder", "url decoder"],
    defaultConfig: {
      mode: "url-decode",
    },
  }),
  "text-case-converter": createDefinition({
    type: "text-case-converter",
    category: "tool",
    family: "text-transformer",
    title: "Text Case Converter",
    description: "Convert text to lowercase, uppercase, title case, and slug.",
    keywords: [
      "text-case-converter",
      "case-converter",
      "case converter",
      "uppercase",
      "lowercase",
      "title-case",
      "title case",
      "sentence-case",
      "sentence case",
    ],
    defaultConfig: {
      modes: ["lowercase", "uppercase", "titlecase", "slug"],
    },
  }),
  "code-formatter": createDefinition({
    type: "code-formatter",
    category: "tool",
    family: "text-formatter",
    title: "Code Formatter",
    description: "Apply lightweight formatting to JSON or plain code blocks.",
    keywords: ["code-formatter", "code formatter"],
    defaultConfig: {
      mode: "code",
      allowMinify: false,
    },
  }),
  "code-snippet-manager": createDefinition({
    type: "code-snippet-manager",
    category: "tool",
    family: "snippet-manager",
    title: "Code Snippet Manager",
    description: "Save, copy, and delete reusable code snippets in the browser.",
    keywords: ["code-snippet-manager", "snippet-manager", "snippet manager"],
    defaultConfig: {},
  }),
  "text-transformer": createDefinition({
    type: "text-transformer",
    category: "tool",
    family: "text-transformer",
    title: "Text Transformer",
    description: "Run reusable text transforms from config-driven modes.",
    keywords: ["text-transformer", "text transform"],
    defaultConfig: {
      modes: ["lowercase", "uppercase", "titlecase", "slug", "trim"],
    },
  }),
  "number-generator": createDefinition({
    type: "number-generator",
    category: "tool",
    family: "number-generator",
    title: "Number Generator",
    description: "Generate random numbers using a configurable range.",
    keywords: ["number-generator", "random-number-generator", "random number"],
    defaultConfig: {
      min: 1,
      max: 100,
      allowDecimal: false,
      decimalPlaces: 2,
    },
  }),
  "unit-converter": createDefinition({
    type: "unit-converter",
    category: "tool",
    family: "unit-converter",
    title: "Unit Converter",
    description: "Convert values between units using config-driven multipliers.",
    keywords: ["unit-converter", "unit converter", "converter", "convert"],
    defaultConfig: {
      fromUnit: "meters",
      toUnit: "feet",
      multiplier: 3.28084,
      precision: 4,
    },
  }),
  "currency-converter": createDefinition({
    type: "currency-converter",
    category: "tool",
    family: "currency-converter",
    title: "Currency Converter",
    description: "Convert currencies using the live currency tool engine.",
    keywords: ["currency-converter", "currency converter", "exchange-rate", "exchange rate"],
    defaultConfig: {},
  }),
  "regex-tester": createDefinition({
    type: "regex-tester",
    category: "tool",
    family: "regex-tools",
    title: "Regex Tester",
    description: "Test regular expressions against text and review match counts.",
    keywords: ["regex-tester", "regex-test", "regex tester"],
    defaultConfig: {
      mode: "test",
      flags: "g",
    },
  }),
  "regex-extractor": createDefinition({
    type: "regex-extractor",
    category: "tool",
    family: "regex-tools",
    title: "Regex Extractor",
    description: "Extract all matching values from text using a regex pattern.",
    keywords: ["regex-extractor", "regex-extract", "match-extractor"],
    defaultConfig: {
      mode: "extract",
      flags: "g",
    },
  }),
  "sha256-generator": createDefinition({
    type: "sha256-generator",
    category: "tool",
    family: "hash-tools",
    title: "SHA256 Generator",
    description: "Generate SHA-256 hashes from text input.",
    keywords: ["sha256-generator", "sha256", "sha 256"],
    defaultConfig: {
      mode: "sha256",
    },
  }),
  "md5-generator": createDefinition({
    type: "md5-generator",
    category: "tool",
    family: "hash-tools",
    title: "MD5 Generator",
    description: "Generate MD5 hashes from text input.",
    keywords: ["md5-generator", "md5"],
    defaultConfig: {
      mode: "md5",
    },
  }),
  "timestamp-converter": createDefinition({
    type: "timestamp-converter",
    category: "tool",
    family: "timestamp-tools",
    title: "Timestamp Converter",
    description: "Convert Unix timestamps and readable dates in one reusable tool.",
    keywords: ["timestamp-converter", "timestamp", "unix-time", "unix timestamp", "date converter"],
    defaultConfig: {},
  }),
  "hex-to-rgb": createDefinition({
    type: "hex-to-rgb",
    category: "tool",
    family: "color-tools",
    title: "Hex To RGB",
    description: "Convert hex color values into RGB format.",
    keywords: ["hex-to-rgb", "hex to rgb"],
    defaultConfig: {
      mode: "hex-to-rgb",
    },
  }),
  "rgb-to-hex": createDefinition({
    type: "rgb-to-hex",
    category: "tool",
    family: "color-tools",
    title: "RGB To Hex",
    description: "Convert RGB color values into hex format.",
    keywords: ["rgb-to-hex", "rgb to hex"],
    defaultConfig: {
      mode: "rgb-to-hex",
    },
  }),
  "text-to-binary": createDefinition({
    type: "text-to-binary",
    category: "tool",
    family: "developer-converters",
    title: "Text To Binary",
    description: "Convert text into binary values.",
    keywords: ["text-to-binary", "text to binary"],
    defaultConfig: {
      mode: "text-to-binary",
    },
  }),
  "binary-to-text": createDefinition({
    type: "binary-to-text",
    category: "tool",
    family: "developer-converters",
    title: "Binary To Text",
    description: "Convert binary values into readable text.",
    keywords: ["binary-to-text", "binary to text"],
    defaultConfig: {
      mode: "binary-to-text",
    },
  }),
  "json-escape": createDefinition({
    type: "json-escape",
    category: "tool",
    family: "developer-converters",
    title: "JSON Escape",
    description: "Escape text safely for JSON string usage.",
    keywords: ["json-escape", "json escape"],
    defaultConfig: {
      mode: "json-escape",
    },
  }),
  "json-unescape": createDefinition({
    type: "json-unescape",
    category: "tool",
    family: "developer-converters",
    title: "JSON Unescape",
    description: "Unescape JSON string values back into readable text.",
    keywords: ["json-unescape", "json unescape"],
    defaultConfig: {
      mode: "json-unescape",
    },
  }),
  "age-calculator": createDefinition({
    type: "age-calculator",
    category: "calculator",
    family: "date-calculator",
    title: "Age Calculator",
    description: "Calculate age from a birth date.",
    keywords: ["age-calculator", "age calculator"],
    defaultConfig: {},
  }),
  "bmi-calculator": createDefinition({
    type: "bmi-calculator",
    category: "calculator",
    family: "health-calculator",
    title: "BMI Calculator",
    description: "Calculate body mass index from height and weight.",
    keywords: ["bmi-calculator", "bmi calculator"],
    defaultConfig: {},
  }),
  "loan-calculator": createDefinition({
    type: "loan-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Loan Calculator",
    description: "Calculate loan repayment estimates.",
    keywords: ["loan-calculator", "loan calculator"],
    defaultConfig: {},
  }),
  "emi-calculator": createDefinition({
    type: "emi-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "EMI Calculator",
    description: "Calculate equated monthly instalments.",
    keywords: ["emi-calculator", "emi calculator"],
    defaultConfig: {},
  }),
  "percentage-calculator": createDefinition({
    type: "percentage-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Percentage Calculator",
    description: "Calculate common percentage values.",
    keywords: ["percentage-calculator", "percentage calculator"],
    defaultConfig: {},
  }),
  "simple-interest-calculator": createDefinition({
    type: "simple-interest-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Simple Interest Calculator",
    description: "Calculate simple interest values.",
    keywords: ["simple-interest-calculator", "simple interest", "interest calculator"],
    defaultConfig: {},
  }),
  "gst-calculator": createDefinition({
    type: "gst-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "GST Calculator",
    description: "Calculate GST-inclusive and GST-exclusive amounts.",
    keywords: ["gst-calculator", "gst calculator"],
    defaultConfig: {},
  }),
  "openai-text-tool": createDefinition({
    type: "openai-text-tool",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "OpenAI Text Tool",
    description: "Generate text output using a prompt-driven AI workflow.",
    keywords: ["openai-text-tool", "openai", "ai tool", "ai text"],
    defaultConfig: {},
  }),
  "ai-prompt-generator": createDefinition({
    type: "ai-prompt-generator",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "AI Prompt Generator",
    description: "Generate prompts for different AI workflows.",
    keywords: ["ai-prompt-generator", "prompt generator", "ai prompt"],
    defaultConfig: {
      task: "rewrite",
      outputType: "text",
    },
  }),
  "ai-email-writer": createDefinition({
    type: "ai-email-writer",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "AI Email Writer",
    description: "Generate draft emails from short instructions.",
    keywords: ["ai-email-writer", "email writer", "email generator"],
    defaultConfig: {
      task: "email",
      outputType: "text",
      tone: "professional",
    },
  }),
  "ai-blog-outline-generator": createDefinition({
    type: "ai-blog-outline-generator",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "AI Blog Outline Generator",
    description: "Generate blog post outline ideas from a topic.",
    keywords: ["ai-blog-outline-generator", "blog outline generator", "outline generator"],
    defaultConfig: {
      task: "outline",
      outputType: "text",
      tone: "clear",
    },
  }),
  "generic-directory": createDefinition({
    type: "generic-directory",
    category: "tool",
    family: "generic-directory",
    title: "Tool Interface",
    description: "This page is live and ready for a dedicated engine later.",
    keywords: [],
    defaultConfig: {},
  }),
};

const TOOL_ENGINE_ORDER: ToolEngineType[] = [
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

const CALCULATOR_ENGINE_ORDER: CalculatorEngineType[] = [
  "age-calculator",
  "bmi-calculator",
  "loan-calculator",
  "emi-calculator",
  "percentage-calculator",
  "simple-interest-calculator",
  "gst-calculator",
  "generic-directory",
];

const AI_ENGINE_ORDER: AIToolEngineType[] = [
  "openai-text-tool",
  "ai-prompt-generator",
  "ai-email-writer",
  "ai-blog-outline-generator",
  "generic-directory",
];

export const ENGINE_OPTIONS: Record<EngineCategory, EngineOption[]> = {
  tool: TOOL_ENGINE_ORDER.map((type) => ({ value: type, label: ENGINE_CATALOG[type].title })),
  calculator: CALCULATOR_ENGINE_ORDER.map((type) => ({
    value: type,
    label: ENGINE_CATALOG[type].title,
  })),
  "ai-tool": AI_ENGINE_ORDER.map((type) => ({ value: type, label: ENGINE_CATALOG[type].title })),
};

function safeSlug(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeEngineConfig(input: unknown): EngineConfig {
  if (!input) return {};

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as EngineConfig;
      }
      return {};
    } catch {
      return {};
    }
  }

  if (typeof input === "object" && !Array.isArray(input)) {
    return input as EngineConfig;
  }

  return {};
}

function includesAll(value: string, parts: string[]) {
  return parts.every((part) => value.includes(part));
}

function includesAny(value: string, parts: string[]) {
  return parts.some((part) => value.includes(part));
}

export function inferEngineType(category: EngineCategory, slug: string): EngineType | null {
  const value = safeSlug(slug);

  if (!value) {
    return "generic-directory";
  }

  if (category === "tool") {
    if (value.includes("password-strength")) return "password-strength-checker";
    if (value === "password-generator" || includesAll(value, ["password", "generator"])) {
      return "password-generator";
    }

    if (
      value.includes("json-formatter") ||
      value.includes("json-pretty") ||
      value.includes("json-minify")
    ) {
      return "json-formatter";
    }

    if (
      includesAny(value, [
        "word-counter",
        "character-counter",
        "reading-time",
        "content-length",
        "text-counter",
      ])
    ) {
      return "word-counter";
    }

    if (value.includes("uuid")) return "uuid-generator";
    if (value === "slug-generator" || includesAll(value, ["slug", "generator"])) {
      return "slug-generator";
    }
    if (value.includes("random-string") || value.includes("string-generator")) {
      return "random-string-generator";
    }

    if (value === "base64-encoder" || includesAll(value, ["base64", "encode"])) {
      return "base64-encoder";
    }
    if (value === "base64-decoder" || includesAll(value, ["base64", "decode"])) {
      return "base64-decoder";
    }

    if (value === "url-encoder" || includesAll(value, ["url", "encode"])) return "url-encoder";
    if (value === "url-decoder" || includesAll(value, ["url", "decode"])) return "url-decoder";

    if (
      value === "text-case-converter" ||
      value.includes("case-converter") ||
      includesAny(value, [
        "uppercase",
        "lowercase",
        "sentence-case",
        "title-case",
        "case-style",
      ])
    ) {
      return "text-case-converter";
    }

    if (value === "code-formatter" || value.includes("code-formatter")) return "code-formatter";
    if (value === "code-snippet-manager" || value.includes("snippet-manager")) {
      return "code-snippet-manager";
    }

    if (value.includes("text") && value.includes("transform")) return "text-transformer";
    if (value.includes("number") && value.includes("generator")) return "number-generator";

    if (value === "currency-converter") return "currency-converter";
    if (
      value === "unit-converter" ||
      (value.includes("convert") &&
        !includesAny(value, ["currency", "base64", "url", "timestamp", "hex", "rgb", "binary"]))
    ) {
      return "unit-converter";
    }

    if (value === "regex-tester" || value.includes("regex-test")) return "regex-tester";
    if (
      value === "regex-extractor" ||
      value.includes("regex-extract") ||
      value.includes("match-extractor")
    ) {
      return "regex-extractor";
    }

    if (value.includes("sha256")) return "sha256-generator";
    if (value.includes("md5")) return "md5-generator";

    if (includesAny(value, ["timestamp", "unix-time", "unix-timestamp", "date-converter"])) {
      return "timestamp-converter";
    }

    if (value.includes("hex-to-rgb")) return "hex-to-rgb";
    if (value.includes("rgb-to-hex")) return "rgb-to-hex";
    if (value.includes("text-to-binary")) return "text-to-binary";
    if (value.includes("binary-to-text")) return "binary-to-text";
    if (value.includes("json-escape")) return "json-escape";
    if (value.includes("json-unescape")) return "json-unescape";

    for (const engineType of TOOL_ENGINE_ORDER) {
      if (engineType === "generic-directory") continue;
      const definition = ENGINE_CATALOG[engineType];
      if (definition.keywords.some((keyword) => value.includes(keyword))) {
        return engineType;
      }
    }

    return "generic-directory";
  }

  if (category === "calculator") {
    if (value.includes("age")) return "age-calculator";
    if (value.includes("bmi")) return "bmi-calculator";
    if (value.includes("emi")) return "emi-calculator";
    if (value.includes("loan")) return "loan-calculator";
    if (value.includes("percentage")) return "percentage-calculator";
    if (value.includes("simple-interest") || value.includes("interest")) {
      return "simple-interest-calculator";
    }
    if (value.includes("gst")) return "gst-calculator";
    return "generic-directory";
  }

  if (
    value === "ai-email-writer" ||
    includesAny(value, ["email-writer", "email-generator", "email-assistant"])
  ) {
    return "ai-email-writer";
  }

  if (
    value === "ai-blog-outline-generator" ||
    includesAny(value, ["blog-outline", "outline-generator", "content-outline"])
  ) {
    return "ai-blog-outline-generator";
  }

  if (
    value === "ai-prompt-generator" ||
    includesAny(value, ["prompt-generator", "prompt-builder", "prompt-tool"])
  ) {
    return "ai-prompt-generator";
  }

  if (includesAny(value, ["ai-", "chatgpt", "openai", "summarizer", "rewrite", "assistant"])) {
    return "openai-text-tool";
  }

  return "generic-directory";
}

export function normalizeEngineType(
  category: EngineCategory,
  value: unknown,
  slug: string
): EngineType | null {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized || normalized === "auto") {
    return inferEngineType(category, slug);
  }

  const allowed = new Set(ENGINE_OPTIONS[category].map((option) => option.value));
  if (allowed.has(normalized as EngineType)) {
    return normalized as EngineType;
  }

  return inferEngineType(category, slug);
}

export function getEngineDefinition(engineType: string | null | undefined): CatalogEngineDefinition {
  const normalized = String(engineType || "").trim().toLowerCase() as EngineType;
  return ENGINE_CATALOG[normalized] || ENGINE_CATALOG["generic-directory"];
}

export function getDefaultEngineConfig(engineType: string | null | undefined): EngineConfig {
  return { ...getEngineDefinition(engineType).defaultConfig };
}