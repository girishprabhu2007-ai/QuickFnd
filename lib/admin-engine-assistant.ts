import {
  ENGINE_OPTIONS,
  getDefaultEngineConfig,
  normalizeEngineConfig,
  normalizeEngineType,
  type EngineCategory,
  type EngineConfig,
  type EngineType,
} from "@/lib/engine-metadata";
import { resolveCalculatorRuntime } from "@/lib/calculator-runtime";

export type AdminEngineSuggestionInput = {
  name?: string;
  slug?: string;
  description?: string;
  engine_type?: unknown;
  engine_config?: unknown;
};

export type AdminEngineSuggestion = {
  engine_type: string | null;
  engine_config: EngineConfig;
  reason: string;
  is_supported: boolean;
};

function safeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function includesAll(value: string, parts: string[]) {
  return parts.every((part) => value.includes(part));
}

function getSupportedValues(category: EngineCategory): string[] {
  const values = ENGINE_OPTIONS[category].map((option) => String(option.value));

  if (category === "calculator" && !values.includes("formula-calculator")) {
    values.push("formula-calculator");
  }

  return values;
}

function getPreferredAIToolEngine(slug: string): string {
  const value = safeSlug(slug);

  if (value.includes("email")) return "ai-email-writer";
  if (value.includes("prompt")) return "ai-prompt-generator";
  if (value.includes("outline") || value.includes("blog-outline")) {
    return "ai-blog-outline-generator";
  }

  return "openai-text-tool";
}

function getCommonUnitMultiplier(
  slug: string
): { fromUnit: string; toUnit: string; multiplier: number; precision: number } | null {
  const value = safeSlug(slug);

  const pairs = [
    {
      match: ["meters-to-feet"],
      fromUnit: "meters",
      toUnit: "feet",
      multiplier: 3.28084,
      precision: 4,
    },
    {
      match: ["feet-to-meters"],
      fromUnit: "feet",
      toUnit: "meters",
      multiplier: 0.3048,
      precision: 4,
    },
    {
      match: ["inches-to-cm", "inch-to-cm"],
      fromUnit: "inches",
      toUnit: "cm",
      multiplier: 2.54,
      precision: 4,
    },
    {
      match: ["cm-to-inches", "cm-to-inch"],
      fromUnit: "cm",
      toUnit: "inches",
      multiplier: 0.393701,
      precision: 4,
    },
    {
      match: ["kg-to-lbs", "kg-to-pounds"],
      fromUnit: "kg",
      toUnit: "lbs",
      multiplier: 2.20462,
      precision: 4,
    },
    {
      match: ["lbs-to-kg", "pounds-to-kg"],
      fromUnit: "lbs",
      toUnit: "kg",
      multiplier: 0.453592,
      precision: 4,
    },
  ];

  for (const pair of pairs) {
    if (pair.match.some((entry) => value.includes(entry))) {
      return {
        fromUnit: pair.fromUnit,
        toUnit: pair.toUnit,
        multiplier: pair.multiplier,
        precision: pair.precision,
      };
    }
  }

  if (includesAll(value, ["to", "converter"])) {
    return {
      fromUnit: "unit-a",
      toUnit: "unit-b",
      multiplier: 1,
      precision: 4,
    };
  }

  return null;
}

function getSuggestedToolEngineType(slug: string): string {
  const value = safeSlug(slug);

  if (value === "currency-converter") return "currency-converter";
  if (value.includes("password-strength")) return "password-strength-checker";
  if (value.includes("password") && value.includes("generator")) return "password-generator";
  if (value.includes("json") && (value.includes("formatter") || value.includes("format"))) {
    return "json-formatter";
  }
  if (
    value.includes("word-counter") ||
    value.includes("character-counter") ||
    value.includes("reading-time")
  ) {
    return "word-counter";
  }
  if (value.includes("uuid")) return "uuid-generator";
  if (value.includes("slug")) return "slug-generator";
  if (value.includes("random-string") || value.includes("string-generator")) {
    return "random-string-generator";
  }
  if (value.includes("base64") && value.includes("decode")) return "base64-decoder";
  if (value.includes("base64")) return "base64-encoder";
  if (value.includes("url") && value.includes("decode")) return "url-decoder";
  if (value.includes("url") && value.includes("encode")) return "url-encoder";
  if (value.includes("case")) return "text-case-converter";
  if (value.includes("code") && value.includes("format")) return "code-formatter";
  if (value.includes("snippet")) return "code-snippet-manager";
  if (value.includes("text") && value.includes("transform")) return "text-transformer";
  if (value.includes("number") && value.includes("generator")) return "number-generator";
  if (value.includes("regex") && value.includes("extract")) return "regex-extractor";
  if (value.includes("regex")) return "regex-tester";
  if (value.includes("sha256")) return "sha256-generator";
  if (value.includes("md5")) return "md5-generator";
  if (value.includes("timestamp") || value.includes("unix-time")) return "timestamp-converter";
  if (value.includes("hex-to-rgb")) return "hex-to-rgb";
  if (value.includes("rgb-to-hex")) return "rgb-to-hex";
  if (value.includes("text-to-binary")) return "text-to-binary";
  if (value.includes("binary-to-text")) return "binary-to-text";
  if (value.includes("json-escape")) return "json-escape";
  if (value.includes("json-unescape")) return "json-unescape";
  if (value.includes("converter")) return "unit-converter";

  return "generic-directory";
}

function buildSuggestedEngineConfig(
  category: EngineCategory,
  engineType: string | null,
  slug: string,
  input: AdminEngineSuggestionInput
): EngineConfig {
  if (!engineType) return {};

  const defaults =
    engineType === "formula-calculator"
      ? {}
      : getDefaultEngineConfig(engineType as EngineType);

  const value = safeSlug(slug);

  if (category === "calculator") {
    const runtime = resolveCalculatorRuntime({
      name: input.name,
      slug,
      description: String(input.description || ""),
    });

    if (runtime.engine_type === "formula-calculator") {
      return {
        ...runtime.engine_config,
        ...normalizeEngineConfig(input.engine_config),
      };
    }

    return {
      ...defaults,
      ...normalizeEngineConfig(input.engine_config),
    };
  }

  if (category === "tool") {
    if (engineType === "password-generator") {
      return {
        ...defaults,
        mode: "password",
        defaultLength: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      };
    }

    if (engineType === "random-string-generator") {
      return {
        ...defaults,
        mode: "random-string",
      };
    }

    if (engineType === "uuid-generator") {
      return {
        ...defaults,
        mode: "uuid",
      };
    }

    if (engineType === "base64-encoder") {
      return {
        ...defaults,
        mode: "base64-encode",
      };
    }

    if (engineType === "base64-decoder") {
      return {
        ...defaults,
        mode: "base64-decode",
      };
    }

    if (engineType === "url-encoder") {
      return {
        ...defaults,
        mode: "url-encode",
      };
    }

    if (engineType === "url-decoder") {
      return {
        ...defaults,
        mode: "url-decode",
      };
    }

    if (engineType === "regex-tester") {
      return {
        ...defaults,
        mode: "test",
        flags: "g",
      };
    }

    if (engineType === "regex-extractor") {
      return {
        ...defaults,
        mode: "extract",
        flags: "g",
      };
    }

    if (engineType === "sha256-generator") {
      return {
        ...defaults,
        mode: "sha256",
      };
    }

    if (engineType === "md5-generator") {
      return {
        ...defaults,
        mode: "md5",
      };
    }

    if (engineType === "text-case-converter") {
      return {
        ...defaults,
        modes: ["lowercase", "uppercase", "titlecase", "slug"],
      };
    }

    if (engineType === "text-transformer") {
      return {
        ...defaults,
        modes: ["lowercase", "uppercase", "titlecase", "slug", "trim"],
      };
    }

    if (engineType === "hex-to-rgb") {
      return {
        ...defaults,
        mode: "hex-to-rgb",
      };
    }

    if (engineType === "rgb-to-hex") {
      return {
        ...defaults,
        mode: "rgb-to-hex",
      };
    }

    if (engineType === "text-to-binary") {
      return {
        ...defaults,
        mode: "text-to-binary",
      };
    }

    if (engineType === "binary-to-text") {
      return {
        ...defaults,
        mode: "binary-to-text",
      };
    }

    if (engineType === "json-escape") {
      return {
        ...defaults,
        mode: "json-escape",
      };
    }

    if (engineType === "json-unescape") {
      return {
        ...defaults,
        mode: "json-unescape",
      };
    }

    if (engineType === "unit-converter") {
      const commonPair = getCommonUnitMultiplier(value);
      if (commonPair) {
        return {
          ...defaults,
          ...commonPair,
        };
      }
    }
  }

  if (category === "ai-tool") {
    if (engineType === "ai-email-writer") {
      return {
        ...defaults,
        toneOptions: ["professional", "friendly", "persuasive"],
        outputType: "email",
      };
    }

    if (engineType === "ai-prompt-generator") {
      return {
        ...defaults,
        outputType: "prompt",
      };
    }

    if (engineType === "ai-blog-outline-generator") {
      return {
        ...defaults,
        outputType: "outline",
      };
    }

    if (engineType === "openai-text-tool") {
      const description = String(input.description || "").toLowerCase();
      let task = "text-generation";

      if (description.includes("summary") || value.includes("summary")) task = "summarization";
      if (description.includes("rewrite") || value.includes("rewrite")) task = "rewrite";
      if (description.includes("email") || value.includes("email")) task = "email";
      if (description.includes("outline") || value.includes("outline")) task = "outline";

      return {
        ...defaults,
        task,
      };
    }
  }

  return {
    ...defaults,
    ...normalizeEngineConfig(input.engine_config),
  };
}

function getSuggestionReason(
  category: EngineCategory,
  engineType: string | null,
  slug: string,
  explicitEngineType: unknown
) {
  const explicit = String(explicitEngineType || "").trim();

  if (explicit && explicit.toLowerCase() !== "auto") {
    return `Manual engine override selected: ${engineType || "none"}.`;
  }

  if (!engineType || engineType === "generic-directory") {
    return `No strong ${category} engine match found yet.`;
  }

  return `Recommended from slug pattern "${safeSlug(slug)}" using engine ${engineType}.`;
}

export function suggestAdminEngine(
  category: EngineCategory,
  input: AdminEngineSuggestionInput
): AdminEngineSuggestion {
  const name = String(input.name || "").trim();
  const slug = safeSlug(String(input.slug || name));
  const explicitEngineType = input.engine_type;
  const explicitText = String(explicitEngineType || "").trim().toLowerCase();

  let engineType: string | null = null;
  let isSupported = false;

  if (category === "calculator") {
    const runtime = resolveCalculatorRuntime({
      name,
      slug,
      description: String(input.description || ""),
    });

    if (explicitText && explicitText !== "auto") {
      engineType =
        explicitText === "formula-calculator"
          ? "formula-calculator"
          : normalizeEngineType(category, explicitText, slug);
    } else {
      engineType = runtime.engine_type;
    }

    isSupported =
      Boolean(engineType) &&
      engineType !== "generic-directory" &&
      (runtime.is_supported || engineType === "formula-calculator");
  } else if (explicitText && explicitText !== "auto") {
    engineType = normalizeEngineType(category, explicitText, slug);
    isSupported = Boolean(engineType) && engineType !== "generic-directory";
  } else if (category === "tool") {
    engineType = getSuggestedToolEngineType(slug);
    isSupported = engineType !== "generic-directory";
  } else {
    engineType = getPreferredAIToolEngine(slug);
    isSupported = true;
  }

  const supportedValues = new Set(getSupportedValues(category));

  const finalEngineType =
    engineType && supportedValues.has(engineType)
      ? engineType
      : category === "ai-tool"
        ? "openai-text-tool"
        : "generic-directory";

  const finalConfig = buildSuggestedEngineConfig(category, finalEngineType, slug, input);

  return {
    engine_type: finalEngineType,
    engine_config: finalConfig,
    reason: getSuggestionReason(category, finalEngineType, slug, explicitEngineType),
    is_supported: isSupported && finalEngineType !== "generic-directory",
  };
}

export function getAdminEngineOptions(category: EngineCategory) {
  const base = ENGINE_OPTIONS[category];

  if (category === "calculator") {
    const hasFormula = base.some((option) => String(option.value) === "formula-calculator");
    if (!hasFormula) {
      return [
        ...base,
        {
          value: "formula-calculator",
          label: "Formula Calculator",
        },
      ];
    }
  }

  return base;
}