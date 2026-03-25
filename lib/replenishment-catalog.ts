/**
 * lib/replenishment-catalog.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The authoritative list of tools QuickFnd SHOULD have.
 *
 * Each entry defines:
 * - slug: the canonical URL
 * - name: display name
 * - engine_type: must match an existing working engine
 * - priority: 1=build now, 2=build next, 3=future
 * - status: "live" | "missing" | "planned"
 *
 * The auto-replenishment system checks this catalog daily,
 * finds anything with status="missing", and publishes it automatically.
 *
 * Philosophy: EVERY tool in this catalog must be genuinely useful.
 * No platform variants. No thin keyword pages. One tool per function.
 */

export type CatalogEntry = {
  slug: string;
  name: string;
  description: string;
  engine_type: string;
  engine_config?: Record<string, unknown>;
  related_slugs: string[];
  category: "tool" | "calculator" | "ai_tool";
  priority: 1 | 2 | 3;
  group: string;
};

export const TOOL_CATALOG: CatalogEntry[] = [

  // ══ ALREADY LIVE (canonical versions) ════════════════════════════════════
  // These should already exist after Phase 1 cleanup

  // ── Text & Writing ────────────────────────────────────────────────────────
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, paragraphs and reading time. Paste any text for instant analysis.",
    engine_type: "word-counter",
    related_slugs: ["text-case-converter", "advanced-text-transformer", "seo-slug-generator"],
    category: "tool",
    priority: 1,
    group: "text",
  },
  {
    slug: "text-case-converter",
    name: "Text Case Converter",
    description: "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and more.",
    engine_type: "text-case-converter",
    related_slugs: ["word-counter", "advanced-text-transformer", "seo-slug-generator"],
    category: "tool",
    priority: 1,
    group: "text",
  },
  {
    slug: "advanced-text-transformer",
    name: "Text Transformer",
    description: "Transform text by reversing, trimming whitespace, removing blank lines, removing duplicates and more.",
    engine_type: "text-transformer",
    related_slugs: ["word-counter", "text-case-converter", "seo-slug-generator"],
    category: "tool",
    priority: 1,
    group: "text",
  },
  {
    slug: "seo-slug-generator",
    name: "Slug Generator",
    description: "Convert any text into a clean URL slug. Handles spaces, special characters, and multiple languages.",
    engine_type: "slug-generator",
    related_slugs: ["text-case-converter", "url-encoder-for-seo", "word-counter"],
    category: "tool",
    priority: 1,
    group: "text",
  },

  // ── Developer Tools ───────────────────────────────────────────────────────
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, prettify and minify JSON. Instantly spot syntax errors with clear error messages.",
    engine_type: "json-formatter",
    related_slugs: ["csv-to-json", "base64-encoder", "regex-pattern-tester"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "base64-encoder",
    name: "Base64 Encoder / Decoder",
    description: "Encode text to Base64 or decode Base64 back to plain text. Supports UTF-8 and URL-safe variants.",
    engine_type: "base64-encoder",
    related_slugs: ["url-encoder-for-seo", "sha256-hash-generator", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "url-encoder-for-seo",
    name: "URL Encoder / Decoder",
    description: "Percent-encode URLs for safe transmission or decode encoded URLs back to readable text.",
    engine_type: "url-encoder",
    related_slugs: ["base64-encoder", "seo-slug-generator", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "sha256-hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from any text input. Instant, browser-side only.",
    engine_type: "sha256-generator",
    related_slugs: ["password-generator", "base64-encoder", "uuid-version-selector"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "uuid-version-selector",
    name: "UUID Generator",
    description: "Generate UUID v1, v4 and v5 unique identifiers. Copy single or bulk-generate hundreds at once.",
    engine_type: "uuid-generator",
    related_slugs: ["password-generator", "random-string-generator", "sha256-hash-generator"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong random passwords with configurable length, uppercase, numbers and symbols.",
    engine_type: "password-generator",
    related_slugs: ["password-strength-checker", "uuid-version-selector", "random-string-generator"],
    category: "tool",
    priority: 1,
    group: "security",
  },
  {
    slug: "password-strength-checker",
    name: "Password Strength Checker",
    description: "Check how strong your password is. Scores against common patterns, dictionary words and brute-force time.",
    engine_type: "password-strength-checker",
    related_slugs: ["password-generator", "sha256-hash-generator", "uuid-version-selector"],
    category: "tool",
    priority: 1,
    group: "security",
  },
  {
    slug: "regex-pattern-tester",
    name: "Regex Tester",
    description: "Test regular expressions against text in real time. See matches highlighted and group captures listed.",
    engine_type: "regex-tester",
    related_slugs: ["json-formatter", "word-counter", "advanced-text-transformer"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "unix-timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and back. Supports all timezones.",
    engine_type: "timestamp-converter",
    related_slugs: ["json-formatter", "regex-pattern-tester", "uuid-version-selector"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON Converter",
    description: "Convert CSV data to JSON instantly. Auto-detects delimiter, handles headers and nested structures.",
    engine_type: "csv-to-json",
    related_slugs: ["json-formatter", "base64-encoder", "markdown-editor"],
    category: "tool",
    priority: 1,
    group: "data",
  },
  {
    slug: "markdown-editor",
    name: "Markdown Editor",
    description: "Write Markdown with live HTML preview. Supports tables, code blocks, images and all standard syntax.",
    engine_type: "markdown-editor",
    related_slugs: ["word-counter", "advanced-text-transformer", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "text",
  },
  {
    slug: "ip-address-lookup",
    name: "IP Address Lookup",
    description: "Look up location, ISP, timezone and organisation for any IP address. Leave blank to check your own.",
    engine_type: "ip-lookup",
    related_slugs: ["dns-lookup", "ssl-checker", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "network",
  },
  {
    slug: "color-picker",
    name: "Color Picker",
    description: "Pick any color and instantly get HEX, RGB, HSL and CSS values. Includes a swatch palette.",
    engine_type: "color-picker",
    related_slugs: ["css-gradient-generator", "hex-to-rgb-with-palette-generator", "qr-generator"],
    category: "tool",
    priority: 1,
    group: "design",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate QR codes from any URL, text or data. Download as PNG. No account needed.",
    engine_type: "qr-generator",
    related_slugs: ["url-encoder-for-seo", "color-picker", "base64-encoder"],
    category: "tool",
    priority: 1,
    group: "utility",
  },

  // ══ PRIORITY 1 — BUILD NEXT (missing, high demand) ════════════════════════

  // ── Code Tools ────────────────────────────────────────────────────────────
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two pieces of text side by side and highlight exactly what changed. Line-by-line diff view.",
    engine_type: "text-transformer",
    engine_config: { mode: "diff" },
    related_slugs: ["json-formatter", "advanced-text-transformer", "regex-pattern-tester"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens instantly. View header, payload and verify token structure.",
    engine_type: "base64-decoder",
    engine_config: { mode: "jwt" },
    related_slugs: ["json-formatter", "base64-encoder", "sha256-hash-generator"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "html-entity-encoder",
    name: "HTML Entity Encoder",
    description: "Encode special characters to HTML entities or decode HTML entities back to plain text.",
    engine_type: "url-encoder",
    engine_config: { mode: "html" },
    related_slugs: ["base64-encoder", "url-encoder-for-seo", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "number-base-converter",
    name: "Number Base Converter",
    description: "Convert numbers between decimal, binary, hex, octal and any base. Instant multi-base output.",
    engine_type: "text-transformer",
    engine_config: { mode: "base-converter" },
    related_slugs: ["text-to-binary-visual-converter", "sha256-hash-generator", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "developer",
  },
  {
    slug: "cron-expression-builder",
    name: "Cron Expression Builder",
    description: "Build and validate cron expressions visually. Understand what any cron schedule means in plain English.",
    engine_type: "text-transformer",
    engine_config: { mode: "cron" },
    related_slugs: ["unix-timestamp-converter", "regex-pattern-tester", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "developer",
  },

  // ── Design Tools ──────────────────────────────────────────────────────────
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    description: "Generate linear and radial CSS gradients visually. Copy the CSS code instantly.",
    engine_type: "color-picker",
    engine_config: { mode: "gradient" },
    related_slugs: ["color-picker", "hex-to-rgb-with-palette-generator", "box-shadow-generator"],
    category: "tool",
    priority: 1,
    group: "design",
  },
  {
    slug: "box-shadow-generator",
    name: "Box Shadow Generator",
    description: "Generate CSS box shadow effects visually with live preview. Copy the CSS with one click.",
    engine_type: "color-picker",
    engine_config: { mode: "box-shadow" },
    related_slugs: ["css-gradient-generator", "color-picker", "hex-to-rgb-with-palette-generator"],
    category: "tool",
    priority: 1,
    group: "design",
  },

  // ── SEO Tools ─────────────────────────────────────────────────────────────
  {
    slug: "open-graph-preview",
    name: "Open Graph Preview",
    description: "Preview how your page looks when shared on Twitter, Facebook and LinkedIn. Check OG tags.",
    engine_type: "text-transformer",
    engine_config: { mode: "og-preview" },
    related_slugs: ["seo-slug-generator", "word-counter", "meta-tags-generator"],
    category: "tool",
    priority: 1,
    group: "seo",
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    description: "Generate a valid robots.txt file for your website. Control which pages search engines can crawl.",
    engine_type: "text-transformer",
    engine_config: { mode: "robots-txt" },
    related_slugs: ["seo-slug-generator", "open-graph-preview", "json-formatter"],
    category: "tool",
    priority: 1,
    group: "seo",
  },

  // ══ PRIORITY 2 — BUILD WHEN ENGINE EXISTS ════════════════════════════════
  // These need new engines to be built first

  {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Resize images to any dimension in your browser. No upload to server. Supports JPG, PNG, WebP.",
    engine_type: "image-resizer",  // NEW ENGINE NEEDED
    related_slugs: ["image-compressor", "image-converter", "color-picker"],
    category: "tool",
    priority: 2,
    group: "image",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress images without visible quality loss. Reduce file size up to 90% in your browser.",
    engine_type: "image-compressor",  // NEW ENGINE NEEDED
    related_slugs: ["image-resizer", "image-converter", "color-picker"],
    category: "tool",
    priority: 2,
    group: "image",
  },
  {
    slug: "image-format-converter",
    name: "Image Format Converter",
    description: "Convert images between JPG, PNG, WebP and AVIF formats. All processing in your browser.",
    engine_type: "image-converter",  // NEW ENGINE NEEDED
    related_slugs: ["image-resizer", "image-compressor", "base64-encoder"],
    category: "tool",
    priority: 2,
    group: "image",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word Converter",
    description: "Convert PDF files to editable Word documents. Preserves formatting, tables and images.",
    engine_type: "cloudconvert",  // NEW ENGINE NEEDED
    engine_config: { input_format: "pdf", output_format: "docx" },
    related_slugs: ["word-to-pdf", "merge-pdf", "compress-pdf"],
    category: "tool",
    priority: 2,
    group: "pdf",
  },
];

// ─── Catalog helpers ──────────────────────────────────────────────────────────

export function getCatalogByPriority(priority: 1 | 2 | 3): CatalogEntry[] {
  return TOOL_CATALOG.filter(t => t.priority === priority);
}

export function getCatalogByGroup(group: string): CatalogEntry[] {
  return TOOL_CATALOG.filter(t => t.group === group);
}

export function getMissingTools(existingSlugs: string[]): CatalogEntry[] {
  const slugSet = new Set(existingSlugs);
  return TOOL_CATALOG.filter(t => !slugSet.has(t.slug) && t.priority === 1);
}

export function getCatalogSlug(slug: string): CatalogEntry | undefined {
  return TOOL_CATALOG.find(t => t.slug === slug);
}