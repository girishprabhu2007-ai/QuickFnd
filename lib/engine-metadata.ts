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

export type EngineType =
  | ToolEngineType
  | CalculatorEngineType
  | AIToolEngineType;

export type EngineConfig = Record<string, unknown>;

type EngineOption = {
  value: EngineType;
  label: string;
};

export const ENGINE_OPTIONS: Record<EngineCategory, EngineOption[]> = {
  tool: [
    { value: "password-strength-checker", label: "Password Strength Checker" },
    { value: "password-generator", label: "Password Generator" },
    { value: "json-formatter", label: "JSON Formatter" },
    { value: "word-counter", label: "Word Counter" },
    { value: "uuid-generator", label: "UUID Generator" },
    { value: "slug-generator", label: "Slug Generator" },
    { value: "random-string-generator", label: "Random String Generator" },
    { value: "base64-encoder", label: "Base64 Encoder" },
    { value: "base64-decoder", label: "Base64 Decoder" },
    { value: "url-encoder", label: "URL Encoder" },
    { value: "url-decoder", label: "URL Decoder" },
    { value: "text-case-converter", label: "Text Case Converter" },
    { value: "code-formatter", label: "Code Formatter" },
    { value: "code-snippet-manager", label: "Code Snippet Manager" },
    { value: "text-transformer", label: "Text Transformer" },
    { value: "number-generator", label: "Number Generator" },
    { value: "unit-converter", label: "Unit Converter" },
    { value: "currency-converter", label: "Currency Converter" },
    { value: "regex-tester", label: "Regex Tester" },
    { value: "regex-extractor", label: "Regex Extractor" },
    { value: "sha256-generator", label: "SHA256 Generator" },
    { value: "md5-generator", label: "MD5 Generator" },
    { value: "timestamp-converter", label: "Timestamp Converter" },
    { value: "hex-to-rgb", label: "Hex To RGB" },
    { value: "rgb-to-hex", label: "RGB To Hex" },
    { value: "text-to-binary", label: "Text To Binary" },
    { value: "binary-to-text", label: "Binary To Text" },
    { value: "json-escape", label: "JSON Escape" },
    { value: "json-unescape", label: "JSON Unescape" },
    { value: "generic-directory", label: "Generic Directory Page" },
  ],
  calculator: [
    { value: "age-calculator", label: "Age Calculator" },
    { value: "bmi-calculator", label: "BMI Calculator" },
    { value: "loan-calculator", label: "Loan Calculator" },
    { value: "emi-calculator", label: "EMI Calculator" },
    { value: "percentage-calculator", label: "Percentage Calculator" },
    { value: "simple-interest-calculator", label: "Simple Interest Calculator" },
    { value: "gst-calculator", label: "GST Calculator" },
    { value: "generic-directory", label: "Generic Directory Page" },
  ],
  "ai-tool": [
    { value: "openai-text-tool", label: "OpenAI Text Tool" },
    { value: "ai-prompt-generator", label: "AI Prompt Generator" },
    { value: "ai-email-writer", label: "AI Email Writer" },
    { value: "ai-blog-outline-generator", label: "AI Blog Outline Generator" },
    { value: "generic-directory", label: "Generic Directory Page" },
  ],
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

export function inferEngineType(
  category: EngineCategory,
  slug: string
): EngineType | null {
  const value = safeSlug(slug);

  if (category === "tool") {
    if (value.includes("password-strength")) return "password-strength-checker";
    if (value === "password-generator" || (value.includes("password") && value.includes("generator"))) {
      return "password-generator";
    }
    if (value.includes("json-formatter") || value.includes("json-pretty") || value.includes("json-minify")) {
      return "json-formatter";
    }
    if (value.includes("word-counter") || value.includes("character-counter") || value.includes("reading-time")) {
      return "word-counter";
    }
    if (value.includes("uuid")) return "uuid-generator";
    if (value === "slug-generator" || (value.includes("slug") && value.includes("generator"))) {
      return "slug-generator";
    }
    if (value.includes("random-string") || value.includes("string-generator")) {
      return "random-string-generator";
    }
    if (value === "base64-encoder" || (value.includes("base64") && value.includes("encode"))) {
      return "base64-encoder";
    }
    if (value === "base64-decoder" || (value.includes("base64") && value.includes("decode"))) {
      return "base64-decoder";
    }
    if (value === "url-encoder" || (value.includes("url") && value.includes("encode"))) {
      return "url-encoder";
    }
    if (value === "url-decoder" || (value.includes("url") && value.includes("decode"))) {
      return "url-decoder";
    }
    if (value === "text-case-converter" || value.includes("case-converter")) {
      return "text-case-converter";
    }
    if (value === "code-formatter" || value.includes("code-formatter")) {
      return "code-formatter";
    }
    if (value === "code-snippet-manager" || value.includes("snippet-manager")) {
      return "code-snippet-manager";
    }
    if (value.includes("text") && value.includes("transform")) {
      return "text-transformer";
    }
    if (value.includes("number") && value.includes("generator")) {
      return "number-generator";
    }
    if (value === "currency-converter") {
      return "currency-converter";
    }
    if (value === "regex-tester" || value.includes("regex-test")) {
      return "regex-tester";
    }
    if (value === "regex-extractor" || value.includes("regex-extract") || value.includes("match-extractor")) {
      return "regex-extractor";
    }
    if (value.includes("sha256")) {
      return "sha256-generator";
    }
    if (value.includes("md5")) {
      return "md5-generator";
    }
    if (value.includes("timestamp") || value.includes("unix-time")) {
      return "timestamp-converter";
    }
    if (value.includes("hex-to-rgb")) {
      return "hex-to-rgb";
    }
    if (value.includes("rgb-to-hex")) {
      return "rgb-to-hex";
    }
    if (value.includes("text-to-binary")) {
      return "text-to-binary";
    }
    if (value.includes("binary-to-text")) {
      return "binary-to-text";
    }
    if (value.includes("json-escape")) {
      return "json-escape";
    }
    if (value.includes("json-unescape")) {
      return "json-unescape";
    }
    if (value.includes("converter")) {
      return "unit-converter";
    }
    return "generic-directory";
  }

  if (category === "calculator") {
    if (value.includes("age")) return "age-calculator";
    if (value.includes("bmi")) return "bmi-calculator";
    if (value.includes("loan")) return "loan-calculator";
    if (value.includes("emi")) return "emi-calculator";
    if (value.includes("percentage")) return "percentage-calculator";
    if (value.includes("simple-interest") || value.includes("interest")) {
      return "simple-interest-calculator";
    }
    if (value.includes("gst")) return "gst-calculator";
    return "generic-directory";
  }

  if (
    value === "ai-prompt-generator" ||
    value === "ai-email-writer" ||
    value === "ai-blog-outline-generator" ||
    value.includes("ai-")
  ) {
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

  const allowed = ENGINE_OPTIONS[category].map((option) => option.value);
  if (allowed.includes(normalized as EngineType)) {
    return normalized as EngineType;
  }

  return inferEngineType(category, slug);
}