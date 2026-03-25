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
  | "qr-generator"
  | "color-picker"
  | "markdown-editor"
  | "csv-to-json"
  | "ip-lookup"
  | "json-unescape"
  | "generic-directory";

// ─── FIXED: Added all calculator engines that exist in calculator-runtime.ts ──
// Previously missing: sip, fd, ppf, hra, income-tax, compound-interest, formula
// This caused auto-generated calculators to fall through to generic-directory
// and get filtered as invisible on all public pages.
export type CalculatorEngineType =
  | "age-calculator"
  | "bmi-calculator"
  | "loan-calculator"
  | "emi-calculator"
  | "percentage-calculator"
  | "simple-interest-calculator"
  | "compound-interest-calculator"
  | "gst-calculator"
  | "sip-calculator"
  | "fd-calculator"
  | "ppf-calculator"
  | "hra-calculator"
  | "income-tax-calculator"
  | "formula-calculator"
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
    family: "string-generator",
    title: "Slug Generator",
    description: "Generate URL-friendly slugs from any text.",
    keywords: ["slug-generator", "slug generator", "url-slug"],
    defaultConfig: {
      mode: "slug",
    },
  }),
  "random-string-generator": createDefinition({
    type: "random-string-generator",
    category: "tool",
    family: "string-generator",
    title: "Random String Generator",
    description: "Generate random strings with configurable characters and length.",
    keywords: ["random-string-generator", "random string generator", "string generator"],
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
    family: "encoder-decoder",
    title: "Base64 Encoder",
    description: "Encode text or data to Base64 format.",
    keywords: ["base64-encoder", "base64 encoder", "base64 encode"],
    defaultConfig: {
      mode: "encode",
    },
  }),
  "base64-decoder": createDefinition({
    type: "base64-decoder",
    category: "tool",
    family: "encoder-decoder",
    title: "Base64 Decoder",
    description: "Decode Base64 data back into readable text.",
    keywords: ["base64-decoder", "base64 decoder", "base64 decode"],
    defaultConfig: {
      mode: "decode",
    },
  }),
  "url-encoder": createDefinition({
    type: "url-encoder",
    category: "tool",
    family: "encoder-decoder",
    title: "URL Encoder",
    description: "Percent-encode URLs for safe transmission.",
    keywords: ["url-encoder", "url encoder", "url encode", "percent-encode"],
    defaultConfig: {
      mode: "encode",
    },
  }),
  "url-decoder": createDefinition({
    type: "url-decoder",
    category: "tool",
    family: "encoder-decoder",
    title: "URL Decoder",
    description: "Decode percent-encoded URLs back to readable text.",
    keywords: ["url-decoder", "url decoder", "url decode"],
    defaultConfig: {
      mode: "decode",
    },
  }),
  "text-case-converter": createDefinition({
    type: "text-case-converter",
    category: "tool",
    family: "text-formatter",
    title: "Text Case Converter",
    description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case.",
    keywords: [
      "text-case-converter",
      "text case converter",
      "case-converter",
      "uppercase",
      "lowercase",
      "title-case",
    ],
    defaultConfig: {},
  }),
  "code-formatter": createDefinition({
    type: "code-formatter",
    category: "tool",
    family: "code-tools",
    title: "Code Formatter",
    description: "Format source code with proper indentation and structure.",
    keywords: ["code-formatter", "code formatter", "code beautifier"],
    defaultConfig: {},
  }),
  "code-snippet-manager": createDefinition({
    type: "code-snippet-manager",
    category: "tool",
    family: "code-tools",
    title: "Code Snippet Manager",
    description: "Save and retrieve reusable code snippets.",
    keywords: ["code-snippet-manager", "code snippet", "snippet manager"],
    defaultConfig: {},
  }),
  "text-transformer": createDefinition({
    type: "text-transformer",
    category: "tool",
    family: "text-formatter",
    title: "Text Transformer",
    description: "Transform text by reversing, trimming, removing blanks, deduplicating lines.",
    keywords: ["text-transformer", "text transformer", "text transform"],
    defaultConfig: {},
  }),
  "number-generator": createDefinition({
    type: "number-generator",
    category: "tool",
    family: "string-generator",
    title: "Random Number Generator",
    description: "Generate random numbers in a configurable range.",
    keywords: ["number-generator", "number generator", "random number"],
    defaultConfig: {
      min: 1,
      max: 100,
      count: 1,
    },
  }),
  "unit-converter": createDefinition({
    type: "unit-converter",
    category: "tool",
    family: "converter",
    title: "Unit Converter",
    description: "Convert between units of length, weight, temperature and volume.",
    keywords: ["unit-converter", "unit converter", "measurement converter"],
    defaultConfig: {},
  }),
  "currency-converter": createDefinition({
    type: "currency-converter",
    category: "tool",
    family: "converter",
    title: "Currency Converter",
    description: "Convert between currencies using live exchange rates.",
    keywords: ["currency-converter", "currency converter", "exchange rate"],
    defaultConfig: {},
  }),
  "regex-tester": createDefinition({
    type: "regex-tester",
    category: "tool",
    family: "developer-tools",
    title: "Regex Tester",
    description: "Test regular expressions against text with real-time match highlighting.",
    keywords: ["regex-tester", "regex tester", "regular expression tester"],
    defaultConfig: {},
  }),
  "regex-extractor": createDefinition({
    type: "regex-extractor",
    category: "tool",
    family: "developer-tools",
    title: "Regex Extractor",
    description: "Extract matching groups from text using regex patterns.",
    keywords: ["regex-extractor", "regex extractor", "match extractor"],
    defaultConfig: {},
  }),
  "sha256-generator": createDefinition({
    type: "sha256-generator",
    category: "tool",
    family: "hash-generator",
    title: "SHA-256 Hash Generator",
    description: "Generate SHA-256 cryptographic hashes from any text input.",
    keywords: ["sha256-generator", "sha256 generator", "sha-256", "hash generator"],
    defaultConfig: {},
  }),
  "md5-generator": createDefinition({
    type: "md5-generator",
    category: "tool",
    family: "hash-generator",
    title: "MD5 Hash Generator",
    description: "Generate MD5 hashes from text input.",
    keywords: ["md5-generator", "md5 generator", "md5 hash"],
    defaultConfig: {},
  }),
  "timestamp-converter": createDefinition({
    type: "timestamp-converter",
    category: "tool",
    family: "converter",
    title: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa.",
    keywords: ["timestamp-converter", "timestamp converter", "unix timestamp", "epoch converter"],
    defaultConfig: {},
  }),
  "hex-to-rgb": createDefinition({
    type: "hex-to-rgb",
    category: "tool",
    family: "color-tools",
    title: "HEX to RGB Converter",
    description: "Convert HEX color codes to RGB values.",
    keywords: ["hex-to-rgb", "hex to rgb", "color converter"],
    defaultConfig: {},
  }),
  "rgb-to-hex": createDefinition({
    type: "rgb-to-hex",
    category: "tool",
    family: "color-tools",
    title: "RGB to HEX Converter",
    description: "Convert RGB color values to HEX codes.",
    keywords: ["rgb-to-hex", "rgb to hex", "color converter"],
    defaultConfig: {},
  }),
  "text-to-binary": createDefinition({
    type: "text-to-binary",
    category: "tool",
    family: "encoder-decoder",
    title: "Text to Binary Converter",
    description: "Convert plain text to binary representation.",
    keywords: ["text-to-binary", "text to binary", "binary converter"],
    defaultConfig: {},
  }),
  "binary-to-text": createDefinition({
    type: "binary-to-text",
    category: "tool",
    family: "encoder-decoder",
    title: "Binary to Text Converter",
    description: "Convert binary code back to readable text.",
    keywords: ["binary-to-text", "binary to text", "binary decoder"],
    defaultConfig: {},
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
  "qr-generator": createDefinition({
    type: "qr-generator",
    category: "tool",
    family: "generator",
    title: "QR Code Generator",
    description: "Generate QR codes from URLs, text or any content.",
    keywords: ["qr-generator", "qr code generator", "qr code"],
    defaultConfig: {},
  }),
  "color-picker": createDefinition({
    type: "color-picker",
    category: "tool",
    family: "color-tools",
    title: "Color Picker",
    description: "Pick colors visually and get HEX, RGB, HSL values.",
    keywords: ["color-picker", "color picker", "colour picker"],
    defaultConfig: {},
  }),
  "markdown-editor": createDefinition({
    type: "markdown-editor",
    category: "tool",
    family: "text-formatter",
    title: "Markdown Editor",
    description: "Write Markdown with live HTML preview.",
    keywords: ["markdown-editor", "markdown editor", "markdown preview"],
    defaultConfig: {},
  }),
  "csv-to-json": createDefinition({
    type: "csv-to-json",
    category: "tool",
    family: "converter",
    title: "CSV to JSON Converter",
    description: "Convert CSV data to JSON with auto-delimiter detection.",
    keywords: ["csv-to-json", "csv to json", "csv json converter"],
    defaultConfig: {},
  }),
  "ip-lookup": createDefinition({
    type: "ip-lookup",
    category: "tool",
    family: "network-tools",
    title: "IP Address Lookup",
    description: "Look up location, ISP and timezone for any IP address.",
    keywords: ["ip-lookup", "ip lookup", "ip address lookup"],
    defaultConfig: {},
  }),

  // ─── CALCULATORS ──────────────────────────────────────────────────────────

  "age-calculator": createDefinition({
    type: "age-calculator",
    category: "calculator",
    family: "date-calculator",
    title: "Age Calculator",
    description: "Calculate exact age from a birth date.",
    keywords: ["age-calculator", "age calculator"],
    defaultConfig: {},
  }),
  "bmi-calculator": createDefinition({
    type: "bmi-calculator",
    category: "calculator",
    family: "health-calculator",
    title: "BMI Calculator",
    description: "Calculate body mass index from height and weight.",
    keywords: ["bmi-calculator", "bmi calculator", "body mass index"],
    defaultConfig: {},
  }),
  "loan-calculator": createDefinition({
    type: "loan-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Loan Calculator",
    description: "Calculate loan repayment, total interest and monthly payments.",
    keywords: ["loan-calculator", "loan calculator"],
    defaultConfig: {},
  }),
  "emi-calculator": createDefinition({
    type: "emi-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "EMI Calculator",
    description: "Calculate equated monthly instalments for any loan.",
    keywords: ["emi-calculator", "emi calculator"],
    defaultConfig: {},
  }),
  "percentage-calculator": createDefinition({
    type: "percentage-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Percentage Calculator",
    description: "Calculate percentages, increases, decreases and differences.",
    keywords: ["percentage-calculator", "percentage calculator"],
    defaultConfig: {},
  }),
  "simple-interest-calculator": createDefinition({
    type: "simple-interest-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Simple Interest Calculator",
    description: "Calculate simple interest for any principal, rate and time.",
    keywords: ["simple-interest-calculator", "simple interest", "interest calculator"],
    defaultConfig: {},
  }),
  // ─── NEWLY ADDED to type union ─────────────────────────────────────────────
  "compound-interest-calculator": createDefinition({
    type: "compound-interest-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Compound Interest Calculator",
    description: "Calculate compound interest with configurable compounding frequency.",
    keywords: ["compound-interest-calculator", "compound interest", "compound calculator"],
    defaultConfig: {},
  }),
  "gst-calculator": createDefinition({
    type: "gst-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "GST Calculator",
    description: "Calculate GST-inclusive and GST-exclusive amounts instantly.",
    keywords: ["gst-calculator", "gst calculator"],
    defaultConfig: {},
  }),
  "sip-calculator": createDefinition({
    type: "sip-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "SIP Calculator",
    description: "Calculate SIP returns for mutual fund investments.",
    keywords: ["sip-calculator", "sip calculator", "systematic investment plan"],
    defaultConfig: {},
  }),
  "fd-calculator": createDefinition({
    type: "fd-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "FD Calculator",
    description: "Calculate fixed deposit maturity amount and interest earned.",
    keywords: ["fd-calculator", "fd calculator", "fixed deposit calculator"],
    defaultConfig: {},
  }),
  "ppf-calculator": createDefinition({
    type: "ppf-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "PPF Calculator",
    description: "Calculate PPF maturity amount with annual contributions.",
    keywords: ["ppf-calculator", "ppf calculator", "public provident fund"],
    defaultConfig: {},
  }),
  "hra-calculator": createDefinition({
    type: "hra-calculator",
    category: "calculator",
    family: "tax-calculator",
    title: "HRA Calculator",
    description: "Calculate House Rent Allowance tax exemption.",
    keywords: ["hra-calculator", "hra calculator", "house rent allowance"],
    defaultConfig: {},
  }),
  "income-tax-calculator": createDefinition({
    type: "income-tax-calculator",
    category: "calculator",
    family: "tax-calculator",
    title: "Income Tax Calculator",
    description: "Estimate income tax under old and new tax regime.",
    keywords: ["income-tax-calculator", "income tax calculator", "tax calculator"],
    defaultConfig: {},
  }),
  "formula-calculator": createDefinition({
    type: "formula-calculator",
    category: "calculator",
    family: "formula-calculator",
    title: "Formula Calculator",
    description: "Evaluate mathematical formulas and expressions with configurable presets.",
    keywords: ["formula-calculator", "formula calculator"],
    defaultConfig: {},
  }),

  // ─── AI TOOLS ─────────────────────────────────────────────────────────────

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
  "qr-generator",
  "color-picker",
  "markdown-editor",
  "csv-to-json",
  "ip-lookup",
  "generic-directory",
];

const CALCULATOR_ENGINE_ORDER: CalculatorEngineType[] = [
  "age-calculator",
  "bmi-calculator",
  "loan-calculator",
  "emi-calculator",
  "percentage-calculator",
  "simple-interest-calculator",
  "compound-interest-calculator",
  "gst-calculator",
  "sip-calculator",
  "fd-calculator",
  "ppf-calculator",
  "hra-calculator",
  "income-tax-calculator",
  "formula-calculator",
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
    if (value === "qr-code-generator" || value.includes("qr-code") || (value.includes("qr") && value.includes("generator"))) return "qr-generator";
    if (value === "color-picker" || value.includes("color-picker") || value === "colour-picker") return "color-picker";
    if (value === "markdown-editor" || value.includes("markdown-editor") || value.includes("markdown-preview")) return "markdown-editor";
    if (value === "csv-to-json" || value.includes("csv-to-json") || value.includes("csv-json")) return "csv-to-json";
    if (value === "ip-lookup" || value.includes("ip-lookup") || value.includes("ip-address-lookup") || value === "ip-checker") return "ip-lookup";
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
      includesAny(value, [
        "meter-to",
        "meters-to",
        "feet-to",
        "foot-to",
        "inch-to",
        "inches-to",
        "cm-to",
        "mm-to",
        "km-to",
        "mile-to",
        "miles-to",
        "yard-to",
        "yards-to",
        "length-converter",
        "distance-converter",
        "unit-converter",
      ])
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
    if (value.includes("bmi") || value.includes("body-mass")) return "bmi-calculator";
    if (value.includes("emi")) return "emi-calculator";
    if (value.includes("sip") || includesAll(value, ["systematic", "investment"])) return "sip-calculator";
    if (value.includes("fixed-deposit") || value === "fd-calculator" || includesAll(value, ["fd", "calculator"])) return "fd-calculator";
    if (value.includes("ppf") || value.includes("public-provident")) return "ppf-calculator";
    if (value.includes("hra") || value.includes("house-rent-allowance")) return "hra-calculator";
    if (value.includes("income-tax") || value.includes("tax-calculator") || value.includes("itr")) return "income-tax-calculator";
    if (value.includes("compound-interest") || includesAll(value, ["compound", "interest"])) return "compound-interest-calculator";
    if (value.includes("loan")) return "loan-calculator";
    if (value.includes("simple-interest") || value === "interest-calculator") return "simple-interest-calculator";
    if (value.includes("gst") || value.includes("vat")) return "gst-calculator";
    if (value.includes("percentage")) return "percentage-calculator";
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