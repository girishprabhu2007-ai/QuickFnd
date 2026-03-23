import type { EngineCategory } from "@/lib/engine-metadata";

export type AdminFormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "list";

export type AdminFormFieldOption = {
  label: string;
  value: string;
};

export type AdminFormField = {
  key: string;
  type: AdminFormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  options?: AdminFormFieldOption[];
};

export type AdminEngineFormSchema = {
  title: string;
  description?: string;
  fields: AdminFormField[];
};

function yesNoOptions(): AdminFormFieldOption[] {
  return [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];
}

export function getAdminEngineFormSchema(
  category: EngineCategory,
  engineType: string | null | undefined
): AdminEngineFormSchema | null {
  const type = String(engineType || "").trim().toLowerCase();

  if (!type || type === "generic-directory") {
    return null;
  }

  if (category === "tool") {
    if (type === "password-strength-checker") {
      return {
        title: "Password strength settings",
        fields: [
          {
            key: "minLength",
            type: "number",
            label: "Minimum length",
            min: 1,
            step: 1,
          },
          {
            key: "scoringRules",
            type: "list",
            label: "Scoring rules",
            description:
              "Examples: length, uppercase, lowercase, number, symbol",
          },
        ],
      };
    }

    if (type === "password-generator" || type === "random-string-generator") {
      return {
        title: "String generator settings",
        fields: [
          {
            key: "mode",
            type: "select",
            label: "Mode",
            options: [
              { label: "Password", value: "password" },
              { label: "Random string", value: "random-string" },
              { label: "UUID", value: "uuid" },
            ],
          },
          {
            key: "defaultLength",
            type: "number",
            label: "Default length",
            min: 1,
            step: 1,
          },
          {
            key: "minLength",
            type: "number",
            label: "Minimum length",
            min: 1,
            step: 1,
          },
          {
            key: "maxLength",
            type: "number",
            label: "Maximum length",
            min: 1,
            step: 1,
          },
          {
            key: "includeUppercase",
            type: "checkbox",
            label: "Include uppercase",
          },
          {
            key: "includeLowercase",
            type: "checkbox",
            label: "Include lowercase",
          },
          {
            key: "includeNumbers",
            type: "checkbox",
            label: "Include numbers",
          },
          {
            key: "includeSymbols",
            type: "checkbox",
            label: "Include symbols",
          },
        ],
      };
    }

    if (
      type === "base64-encoder" ||
      type === "base64-decoder" ||
      type === "url-encoder" ||
      type === "url-decoder" ||
      type === "sha256-generator" ||
      type === "md5-generator" ||
      type === "hex-to-rgb" ||
      type === "rgb-to-hex" ||
      type === "text-to-binary" ||
      type === "binary-to-text" ||
      type === "json-escape" ||
      type === "json-unescape"
    ) {
      return {
        title: "Mode settings",
        fields: [
          {
            key: "mode",
            type: "text",
            label: "Mode",
            placeholder: "Auto-filled mode value",
          },
        ],
      };
    }

    if (type === "json-formatter" || type === "code-formatter") {
      return {
        title: "Formatter settings",
        fields: [
          {
            key: "mode",
            type: "select",
            label: "Mode",
            options: [
              { label: "JSON", value: "json" },
              { label: "Code", value: "code" },
            ],
          },
          {
            key: "allowMinify",
            type: "checkbox",
            label: "Allow minify action",
          },
        ],
      };
    }

    if (type === "word-counter") {
      return {
        title: "Text analyzer settings",
        fields: [
          {
            key: "readingWordsPerMinute",
            type: "number",
            label: "Reading words per minute",
            min: 1,
            step: 1,
          },
        ],
      };
    }

    if (type === "text-case-converter" || type === "text-transformer") {
      return {
        title: "Text transform settings",
        fields: [
          {
            key: "modes",
            type: "list",
            label: "Enabled modes",
            description:
              "Examples: lowercase, uppercase, titlecase, slug, trim",
          },
        ],
      };
    }

    if (type === "number-generator") {
      return {
        title: "Number generator settings",
        fields: [
          {
            key: "min",
            type: "number",
            label: "Minimum value",
            step: 1,
          },
          {
            key: "max",
            type: "number",
            label: "Maximum value",
            step: 1,
          },
          {
            key: "allowDecimal",
            type: "checkbox",
            label: "Allow decimal values",
          },
          {
            key: "decimalPlaces",
            type: "number",
            label: "Decimal places",
            min: 0,
            step: 1,
          },
        ],
      };
    }

    if (type === "unit-converter") {
      return {
        title: "Unit converter settings",
        fields: [
          {
            key: "fromUnit",
            type: "text",
            label: "From unit",
            placeholder: "meters",
          },
          {
            key: "toUnit",
            type: "text",
            label: "To unit",
            placeholder: "feet",
          },
          {
            key: "multiplier",
            type: "number",
            label: "Multiplier",
            step: 0.000001,
          },
          {
            key: "precision",
            type: "number",
            label: "Precision",
            min: 0,
            step: 1,
          },
          {
            key: "formula",
            type: "text",
            label: "Optional formula",
            placeholder: "value * 1.8 + 32",
          },
        ],
      };
    }

    if (type === "regex-tester" || type === "regex-extractor") {
      return {
        title: "Regex settings",
        fields: [
          {
            key: "mode",
            type: "select",
            label: "Mode",
            options: [
              { label: "Test", value: "test" },
              { label: "Extract", value: "extract" },
            ],
          },
          {
            key: "flags",
            type: "text",
            label: "Default flags",
            placeholder: "g",
          },
        ],
      };
    }

    if (type === "currency-converter") {
      return {
        title: "Currency converter settings",
        fields: [],
      };
    }
  }

  if (category === "calculator") {
    if (
      type === "loan-calculator" ||
      type === "emi-calculator" ||
      type === "simple-interest-calculator" ||
      type === "percentage-calculator" ||
      type === "age-calculator" ||
      type === "bmi-calculator" ||
      type === "gst-calculator"
    ) {
      return {
        title: "Calculator settings",
        fields: [
          {
            key: "titleOverride",
            type: "text",
            label: "Optional title override",
            placeholder: "Leave empty to use item name",
          },
        ],
      };
    }
  }

  if (category === "ai-tool") {
    if (
      type === "openai-text-tool" ||
      type === "ai-prompt-generator" ||
      type === "ai-email-writer" ||
      type === "ai-blog-outline-generator"
    ) {
      return {
        title: "AI tool settings",
        fields: [
          {
            key: "task",
            type: "select",
            label: "Task",
            options: [
              { label: "Text generation", value: "text-generation" },
              { label: "Rewrite", value: "rewrite" },
              { label: "Summarization", value: "summarization" },
              { label: "Email", value: "email" },
              { label: "Prompt", value: "prompt" },
              { label: "Outline", value: "outline" },
            ],
          },
          {
            key: "outputType",
            type: "select",
            label: "Output type",
            options: [
              { label: "Generic text", value: "text" },
              { label: "Email", value: "email" },
              { label: "Prompt", value: "prompt" },
              { label: "Outline", value: "outline" },
            ],
          },
          {
            key: "toneOptions",
            type: "list",
            label: "Tone options",
            description: "Examples: professional, friendly, persuasive",
          },
        ],
      };
    }
  }

  return {
    title: "Engine settings",
    fields: [
      {
        key: "enabled",
        type: "select",
        label: "Enabled",
        options: yesNoOptions(),
      },
    ],
  };
}