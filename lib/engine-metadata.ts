import {
  inferToolEngineType,
  type ToolEngineType,
} from "@/lib/tool-engine-registry";

export type EngineCategory = "tool" | "calculator" | "ai-tool";

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
    { value: "text-transformer", label: "Text Transformer" },
    { value: "number-generator", label: "Random Number Generator" },
    { value: "unit-converter", label: "Unit Converter" },
    { value: "currency-converter", label: "Currency Converter" },
    { value: "generic-directory", label: "Unsupported / Directory Only" },
  ],
  calculator: [
    { value: "age-calculator", label: "Age Calculator" },
    { value: "bmi-calculator", label: "BMI Calculator" },
    { value: "loan-calculator", label: "Loan Calculator" },
    { value: "emi-calculator", label: "EMI Calculator" },
    { value: "percentage-calculator", label: "Percentage Calculator" },
    { value: "simple-interest-calculator", label: "Simple Interest Calculator" },
    { value: "gst-calculator", label: "GST Calculator" },
    { value: "generic-directory", label: "Unsupported / Directory Only" },
  ],
  "ai-tool": [
    { value: "openai-text-tool", label: "OpenAI Text Tool" },
    { value: "ai-prompt-generator", label: "AI Prompt Generator" },
    { value: "ai-email-writer", label: "AI Email Writer" },
    { value: "ai-blog-outline-generator", label: "AI Blog Outline Generator" },
    { value: "generic-directory", label: "Unsupported / Directory Only" },
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
    return inferToolEngineType(value);
  }

  if (category === "calculator") {
    if (value.includes("age")) return "age-calculator";
    if (value.includes("bmi")) return "bmi-calculator";
    if (value.includes("loan")) return "loan-calculator";
    if (value.includes("emi")) return "emi-calculator";
    if (value.includes("percentage")) return "percentage-calculator";
    if (value.includes("simple-interest") || value.includes("interest")) return "simple-interest-calculator";
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