/**
 * lib/engine-registry.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH for all engine lists.
 *
 * Every file that needs to know "which engines are live" imports from here.
 * When you add a new engine/renderer, add it HERE and nowhere else.
 *
 * Consumers:
 *  - lib/quality-gate.ts           → VALID_ENGINES
 *  - lib/review-console.ts         → LIVE_TOOL_ENGINES, LIVE_CALC_ENGINES, LIVE_AI_ENGINES
 *  - app/api/admin/execute-repair  → same sets
 *  - app/api/cron/auto-screen-queue → WORKING_ENGINES
 *  - app/api/cron/auto-publish     → post-publish health check
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ── Tools with working renderers in UniversalToolEngineRenderer ──────────────
export const LIVE_TOOL_ENGINES = new Set([
  "password-strength-checker", "password-generator", "json-formatter", "word-counter",
  "uuid-generator", "slug-generator", "random-string-generator", "base64-encoder",
  "base64-decoder", "url-encoder", "url-decoder", "text-case-converter",
  "code-formatter", "code-snippet-manager", "text-transformer", "number-generator",
  "unit-converter", "currency-converter", "regex-tester", "regex-extractor",
  "sha256-generator", "md5-generator", "timestamp-converter", "hex-to-rgb",
  "rgb-to-hex", "text-to-binary", "binary-to-text", "json-escape", "json-unescape",
  "qr-generator", "barcode-generator", "color-picker", "markdown-editor", "csv-to-json",
  "ip-lookup", "cron-builder", "diff-checker", "jwt-decoder", "lorem-ipsum-generator",
  "number-base-converter", "html-entity-encoder", "string-escape-tool",
  "yaml-json-converter", "json-to-csv", "color-contrast-checker",
  "robots-txt-generator", "open-graph-tester",
  "html-minifier", "css-minifier", "js-minifier",
  "email-validator", "line-sorter", "box-shadow-generator", "css-gradient-generator",
  // Image / File tools
  "image-compressor", "image-resizer", "image-converter",
  "image-cropper", "image-to-base64", "svg-to-png",
]);

// ── Calculators with working renderers in BuiltInCalculatorClient ────────────
export const LIVE_CALC_ENGINES = new Set([
  "age-calculator", "bmi-calculator", "loan-calculator", "emi-calculator",
  "percentage-calculator", "simple-interest-calculator", "compound-interest-calculator",
  "gst-calculator", "sip-calculator", "fd-calculator", "ppf-calculator",
  "hra-calculator", "income-tax-calculator", "formula-calculator",
  "discount-calculator", "tip-calculator", "roi-calculator", "savings-calculator",
  "retirement-calculator", "salary-calculator", "calorie-calculator", "fuel-cost-calculator",
  "cagr-calculator", "gratuity-calculator", "rd-calculator",
  "mortgage-calculator", "sales-tax-calculator", "vat-calculator",
]);

// ── AI Tools with working renderers ──────────────────────────────────────────
export const LIVE_AI_ENGINES = new Set([
  "openai-text-tool", "ai-prompt-generator", "ai-email-writer", "ai-blog-outline-generator",
]);

// ── Combined set — used by quality gate and auto-screen ──────────────────────
export const ALL_VALID_ENGINES = new Set([
  ...LIVE_TOOL_ENGINES,
  ...LIVE_CALC_ENGINES,
  ...LIVE_AI_ENGINES,
]);

// ── Helper functions ─────────────────────────────────────────────────────────

export function getLiveEngines(table: "tools" | "calculators" | "ai_tools"): Set<string> {
  if (table === "tools") return LIVE_TOOL_ENGINES;
  if (table === "calculators") return LIVE_CALC_ENGINES;
  return LIVE_AI_ENGINES;
}

export function isPlaceholderEngine(
  engineType: string | null | undefined,
  table: "tools" | "calculators" | "ai_tools"
): boolean {
  if (!engineType) return true;
  const et = engineType.trim().toLowerCase();
  if (et === "generic-directory" || et === "" || et === "auto") return true;
  return !getLiveEngines(table).has(et);
}

export function isValidEngine(engineType: string): boolean {
  return ALL_VALID_ENGINES.has(engineType);
}

/**
 * Returns the table name for a given engine type.
 * Used by auto-publish to determine which DB table to insert into.
 */
export function getTableForEngine(engineType: string): "tools" | "calculators" | "ai_tools" | null {
  if (LIVE_TOOL_ENGINES.has(engineType)) return "tools";
  if (LIVE_CALC_ENGINES.has(engineType)) return "calculators";
  if (LIVE_AI_ENGINES.has(engineType)) return "ai_tools";
  return null;
}