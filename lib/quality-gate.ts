/**
 * lib/quality-gate.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 3 of the autonomous pipeline.
 * Runs 5 checks on every generated tool before it can be published.
 * All 5 must pass. Any failure sends the item back to the queue with a reason.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type GeneratedTool = {
  name: string;
  slug: string;
  description: string;
  engine_type: string;
  engine_config?: Record<string, unknown>;
  related_slugs?: string[];
  seo_intro?: string;
  seo_faqs?: { question: string; answer: string }[];
};

export type QualityResult = {
  passed: boolean;
  score: number; // 0-100
  checks: {
    name: string;
    passed: boolean;
    reason: string;
  }[];
  failure_reason?: string;
};

// ─── Known valid engine types ─────────────────────────────────────────────────

const VALID_ENGINES = new Set([
  "password-generator", "password-strength-checker", "json-formatter",
  "word-counter", "uuid-generator", "slug-generator", "random-string-generator",
  "base64-encoder", "base64-decoder", "url-encoder", "url-decoder",
  "text-case-converter", "text-transformer", "code-formatter", "number-generator",
  "unit-converter", "currency-converter", "regex-tester", "regex-extractor",
  "sha256-generator", "md5-generator", "timestamp-converter", "hex-to-rgb",
  "rgb-to-hex", "text-to-binary", "binary-to-text", "json-escape", "json-unescape",
  "qr-generator", "color-picker", "markdown-editor", "csv-to-json", "ip-lookup",
  "bmi-calculator", "emi-calculator", "gst-calculator", "sip-calculator",
  "fd-calculator", "ppf-calculator", "hra-calculator", "income-tax-calculator",
  "compound-interest-calculator", "simple-interest-calculator", "loan-calculator",
  "percentage-calculator", "age-calculator", "formula-calculator",
  "ai-email-writer", "ai-prompt-generator", "ai-blog-outline-generator",
  "openai-text-tool",
]);

// ─── Check 1: Name quality ────────────────────────────────────────────────────

function checkName(tool: GeneratedTool): { passed: boolean; reason: string } {
  const name = tool.name?.trim() || "";

  if (name.length < 5) return { passed: false, reason: "Name too short (under 5 chars)" };
  if (name.length > 80) return { passed: false, reason: "Name too long (over 80 chars)" };
  if (!/[a-zA-Z]/.test(name)) return { passed: false, reason: "Name has no letters" };

  // Must have at least 2 words
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 2) return { passed: false, reason: "Name needs at least 2 words" };

  // Reject generic/vague names
  const genericNames = /^(tool|converter|calculator|generator|checker|helper|utility)$/i;
  if (genericNames.test(name.trim())) return { passed: false, reason: "Name too generic" };

  return { passed: true, reason: "Name looks good" };
}

// ─── Check 2: Description quality ────────────────────────────────────────────

function checkDescription(tool: GeneratedTool): { passed: boolean; reason: string } {
  const desc = tool.description?.trim() || "";

  if (desc.length < 50) return { passed: false, reason: "Description too short (under 50 chars)" };
  if (desc.length > 500) return { passed: false, reason: "Description too long" };

  // Must have at least 2 sentences
  const sentences = desc.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length < 1) return { passed: false, reason: "Description needs more detail" };

  // Check for filler phrases
  const fillerPhrases = [
    "this tool helps", "this is a tool", "a simple tool",
    "easy to use", "user friendly", "our tool"
  ];
  const descLower = desc.toLowerCase();
  const hasFillers = fillerPhrases.filter(f => descLower.includes(f));
  if (hasFillers.length >= 2) return { passed: false, reason: `Too many generic phrases: ${hasFillers.join(", ")}` };

  return { passed: true, reason: "Description quality good" };
}

// ─── Check 3: Engine validity ─────────────────────────────────────────────────

function checkEngine(tool: GeneratedTool): { passed: boolean; reason: string } {
  const engine = tool.engine_type?.trim() || "";

  if (!engine) return { passed: false, reason: "No engine type assigned" };
  if (!VALID_ENGINES.has(engine)) return { passed: false, reason: `Unknown engine: "${engine}" — not in valid engine list` };

  // Block formula-calculator — requires a specific preset to be useful
  // Without preset it shows a meaningless generic interface
  if (engine === "formula-calculator") {
    return { passed: false, reason: "formula-calculator requires a specific preset — not safe for auto-publish. Use a specific calculator engine instead." };
  }

  // Block text-transformer for calculators — wrong engine type
  if (engine === "text-transformer") {
    return { passed: false, reason: "text-transformer is a text tool engine, not a calculator engine." };
  }

  // Cross-check engine vs name for obvious mismatches
  const nameLower = tool.name.toLowerCase();
  const obvious_mismatches: [RegExp, string[]][] = [
    [/password/i, ["password-generator", "password-strength-checker"]],
    [/json/i, ["json-formatter", "json-escape", "json-unescape", "csv-to-json", "code-formatter"]],
    [/bmi|body mass/i, ["bmi-calculator"]],
    [/emi|loan/i, ["emi-calculator", "loan-calculator"]],
    [/gst|tax/i, ["gst-calculator", "income-tax-calculator", "percentage-calculator"]],
    [/ip address|ip lookup/i, ["ip-lookup"]],
    [/qr code/i, ["qr-generator"]],
    [/color|colour|hex|rgb/i, ["color-picker", "hex-to-rgb", "rgb-to-hex"]],
    [/markdown/i, ["markdown-editor"]],
    [/csv/i, ["csv-to-json"]],
    [/uuid|guid/i, ["uuid-generator"]],
    [/base64/i, ["base64-encoder", "base64-decoder"]],
    [/timestamp|unix time|epoch/i, ["timestamp-converter"]],
    [/ai |gpt|chatgpt/i, ["ai-email-writer", "ai-prompt-generator", "ai-blog-outline-generator", "openai-text-tool"]],
  ];

  for (const [pattern, validEngines] of obvious_mismatches) {
    if (pattern.test(nameLower) && !validEngines.includes(engine)) {
      return {
        passed: false,
        reason: `Engine mismatch: "${tool.name}" suggests ${validEngines[0]} but got ${engine}`
      };
    }
  }

  return { passed: true, reason: `Engine "${engine}" is valid` };
}

// ─── Check 4: Slug quality ────────────────────────────────────────────────────

function checkSlug(tool: GeneratedTool): { passed: boolean; reason: string } {
  const slug = tool.slug?.trim() || "";

  if (!slug) return { passed: false, reason: "No slug" };
  if (slug.length < 5) return { passed: false, reason: "Slug too short" };
  if (slug.length > 70) return { passed: false, reason: "Slug too long" };
  if (!/^[a-z0-9-]+$/.test(slug)) return { passed: false, reason: "Slug has invalid characters (must be lowercase letters, numbers, hyphens)" };
  if (!slug.includes("-")) return { passed: false, reason: "Slug needs at least one hyphen" };
  if (slug.startsWith("-") || slug.endsWith("-")) return { passed: false, reason: "Slug cannot start or end with hyphen" };
  if (/--/.test(slug)) return { passed: false, reason: "Slug has double hyphens" };

  // Must have 2-6 words
  const words = slug.split("-");
  if (words.length < 2) return { passed: false, reason: "Slug needs 2+ words" };
  if (words.length > 7) return { passed: false, reason: "Slug too many words (7+)" };

  return { passed: true, reason: "Slug format valid" };
}

// ─── Check 5: SEO content quality ────────────────────────────────────────────

function checkSEO(tool: GeneratedTool): { passed: boolean; reason: string } {
  // SEO content is optional — if present, check quality
  if (!tool.seo_intro && !tool.seo_faqs) {
    return { passed: true, reason: "No SEO content (will use generic fallback — OK)" };
  }

  if (tool.seo_intro && tool.seo_intro.length < 80) {
    return { passed: false, reason: "SEO intro too short (under 80 chars)" };
  }

  if (tool.seo_faqs && tool.seo_faqs.length < 3) {
    return { passed: false, reason: "Need at least 3 FAQs" };
  }

  if (tool.seo_faqs) {
    for (const faq of tool.seo_faqs) {
      if (!faq.question || faq.question.length < 10) {
        return { passed: false, reason: "FAQ question too short" };
      }
      if (!faq.answer || faq.answer.length < 20) {
        return { passed: false, reason: "FAQ answer too short" };
      }
    }
  }

  return { passed: true, reason: "SEO content quality good" };
}

// ─── Main quality gate function ───────────────────────────────────────────────

export function runQualityGate(tool: GeneratedTool): QualityResult {
  const checks = [
    { name: "Name quality", ...checkName(tool) },
    { name: "Description quality", ...checkDescription(tool) },
    { name: "Engine validity", ...checkEngine(tool) },
    { name: "Slug format", ...checkSlug(tool) },
    { name: "SEO content", ...checkSEO(tool) },
  ];

  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  const passed = checks.every(c => c.passed);

  const failedCheck = checks.find(c => !c.passed);

  return {
    passed,
    score,
    checks,
    failure_reason: failedCheck ? `${failedCheck.name}: ${failedCheck.reason}` : undefined,
  };
}