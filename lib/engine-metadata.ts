export type EngineCategory = "tool" | "calculator" | "ai-tool";

export type ToolEngineType =
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
    { value: "generic-directory", label: "Generic Directory Page" },
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
    { value: "text-transformer", label: "Text Transformer (Config)" },
    { value: "number-generator", label: "Number Generator (Config)" },
    { value: "unit-converter", label: "Unit Converter (Config)" },
  ],
  calculator: [
    { value: "generic-directory", label: "Generic Directory Page" },
    { value: "age-calculator", label: "Age Calculator" },
    { value: "bmi-calculator", label: "BMI Calculator" },
    { value: "loan-calculator", label: "Loan Calculator" },
    { value: "emi-calculator", label: "EMI Calculator" },
    { value: "percentage-calculator", label: "Percentage Calculator" },
    { value: "simple-interest-calculator", label: "Simple Interest Calculator" },
    { value: "gst-calculator", label: "GST Calculator" },
  ],
  "ai-tool": [
    { value: "generic-directory", label: "Generic Directory Page" },
    { value: "ai-prompt-generator", label: "AI Prompt Generator" },
    { value: "ai-email-writer", label: "AI Email Writer" },
    { value: "ai-blog-outline-generator", label: "AI Blog Outline Generator" },
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
    if (value === "password-generator") return "password-generator";
    if (value === "json-formatter") return "json-formatter";
    if (value === "word-counter") return "word-counter";
    if (value.includes("uuid")) return "uuid-generator";
    if (value === "slug-generator" || (value.includes("slug") && value.includes("generator"))) {
      return "slug-generator";
    }
    if (
      value === "random-string-generator" ||
      value.includes("random-string") ||
      value.includes("string-generator")
    ) {
      return "random-string-generator";
    }
    if (value === "base64-encoder") return "base64-encoder";
    if (value === "base64-decoder") return "base64-decoder";
    if (value === "url-encoder") return "url-encoder";
    if (value === "url-decoder") return "url-decoder";
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
    if (value.includes("converter")) {
      return "unit-converter";
    }
    return "generic-directory";
  }

  if (category === "calculator") {
    if (value === "age-calculator") return "age-calculator";
    if (value === "bmi-calculator") return "bmi-calculator";
    if (value === "loan-calculator") return "loan-calculator";
    if (value === "emi-calculator" || value.includes("emi")) {
      return "emi-calculator";
    }
    if (value === "percentage-calculator" || value.includes("percentage")) {
      return "percentage-calculator";
    }
    if (value.includes("simple-interest")) return "simple-interest-calculator";
    if (value === "gst-calculator" || value.includes("gst")) return "gst-calculator";
    return "generic-directory";
  }

  if (value === "ai-prompt-generator") return "ai-prompt-generator";
  if (value === "ai-email-writer") return "ai-email-writer";
  if (value === "ai-blog-outline-generator") return "ai-blog-outline-generator";
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