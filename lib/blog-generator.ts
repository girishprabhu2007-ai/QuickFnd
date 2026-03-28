/**
 * lib/blog-generator.ts  v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully autonomous blog generation pipeline.
 *
 * Research → Score → Generate → Publish
 *
 * Sources:
 *   1. Serper "People Also Ask" per tool (if SERPER_API_KEY set)
 *   2. Google Search Console queries at position 4-20 (if GSC token set)
 *   3. Google Autocomplete expansions (always, free)
 *   4. Rotating expanded seed bank (500+ topics, never exhausts)
 *
 * Content quality:
 *   - 900-1400 word minimum
 *   - Varied temperature (0.7-0.9) per generation for style variety
 *   - Human-writing instructions: personal voice, concrete examples, opinions
 *   - 3-6 internal tool links per article
 *   - People Also Ask answers embedded naturally
 *   - Pillar / spoke topic clusters
 *
 * v3 changes (Session 7):
 *   - Failed topic tracking via blog_failed_topics table
 *   - Topics that fail quality gate are skipped for 7 days
 *   - generateBlogPost() logs failures to DB
 *   - selectTopicsForToday() excludes recently-failed topics
 */

import { createClient } from "@supabase/supabase-js";
import { getOpenAIClient } from "@/lib/openai-server";
import { estimateReadingTime, type BlogCategory } from "@/lib/blog";
import { selectAuthorForTopic, randomPublishTime, getAuthorById, type Author } from "@/lib/authors";
import { getTopTopicsForToday, type ScoredTopic, type SERPAnalysis } from "@/lib/seo-intelligence";
import { indexNewPage } from "@/lib/index-now";
import { generateBlogPost as engineGenerateBlogPost } from "@/lib/content-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlogGenerationInput = {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  category?: BlogCategory;
  source?: "auto-pipeline" | "gsc-opportunity" | "serper-paa" | "manual";
  related_questions?: string[];
  secondary_keywords?: string[];
  related_tool_slugs?: string[];
  author_id?: string;         // override auto-selection
  publish_hour?: number;      // UTC hour for publish time randomisation
  serp_analysis?: SERPAnalysis | null;  // competitor analysis for uniqueness
};

export type BlogGenerationResult = {
  success: boolean;
  slug?: string;
  title?: string;
  word_count?: number;
  error?: string;
};

// ScoredTopic imported from @/lib/seo-intelligence

// ─── Tool map — all 54 live tools with their slugs ───────────────────────────
// Used to build rich internal linking context per article

export const TOOL_MAP: Record<string, { name: string; slug: string; category: string }> = {
  // Security
  "password-generator": { name: "Password Generator", slug: "password-generator", category: "security" },
  "password-strength-checker": { name: "Password Strength Checker", slug: "password-strength-checker", category: "security" },
  "sha256-generator": { name: "SHA-256 Hash Generator", slug: "sha256-generator", category: "security" },
  "md5-generator": { name: "MD5 Hash Generator", slug: "md5-generator", category: "security" },
  // Developer Tools
  "json-formatter": { name: "JSON Formatter", slug: "json-formatter", category: "developer" },
  "uuid-generator": { name: "UUID Generator", slug: "uuid-generator", category: "developer" },
  "random-string-generator": { name: "Random String Generator", slug: "random-string-generator", category: "developer" },
  "base64-encoder": { name: "Base64 Encoder", slug: "base64-encoder", category: "developer" },
  "base64-decoder": { name: "Base64 Decoder", slug: "base64-decoder", category: "developer" },
  "url-encoder": { name: "URL Encoder", slug: "url-encoder", category: "developer" },
  "url-decoder": { name: "URL Decoder", slug: "url-decoder", category: "developer" },
  "regex-tester": { name: "Regex Tester", slug: "regex-tester", category: "developer" },
  "markdown-editor": { name: "Markdown Editor", slug: "markdown-editor", category: "developer" },
  "text-transformer": { name: "Text Transformer", slug: "text-transformer", category: "developer" },
  "timestamp-converter": { name: "Unix Timestamp Converter", slug: "timestamp-converter", category: "developer" },
  "ip-lookup": { name: "IP Address Lookup", slug: "ip-lookup", category: "developer" },
  // Text Tools
  "word-counter": { name: "Word Counter", slug: "word-counter", category: "text" },
  "text-case-converter": { name: "Text Case Converter", slug: "text-case-converter", category: "text" },
  "slug-generator": { name: "URL Slug Generator", slug: "slug-generator", category: "text" },
  // Design Tools
  "color-picker": { name: "Color Picker", slug: "color-picker", category: "design" },
  "hex-to-rgb": { name: "Hex to RGB Converter", slug: "hex-to-rgb", category: "design" },
  "rgb-to-hex": { name: "RGB to Hex Converter", slug: "rgb-to-hex", category: "design" },
  // Utility
  "qr-generator": { name: "QR Code Generator", slug: "qr-generator", category: "utility" },
  "unit-converter": { name: "Unit Converter", slug: "unit-converter", category: "utility" },
  "currency-converter": { name: "Currency Converter", slug: "currency-converter", category: "utility" },
  "age-calculator": { name: "Age Calculator", slug: "age-calculator", category: "utility" },
  // Finance Calculators
  "emi-calculator": { name: "EMI Calculator", slug: "emi-calculator", category: "finance" },
  "compound-interest-calculator": { name: "Compound Interest Calculator", slug: "compound-interest-calculator", category: "finance" },
  "percentage-calculator": { name: "Percentage Calculator", slug: "percentage-calculator", category: "finance" },
  "sip-calculator": { name: "SIP Calculator", slug: "sip-calculator", category: "investment" },
  "fd-calculator": { name: "FD Calculator", slug: "fd-calculator", category: "investment" },
  "ppf-calculator": { name: "PPF Calculator", slug: "ppf-calculator", category: "investment" },
  "gst-calculator": { name: "GST Calculator", slug: "gst-calculator", category: "tax" },
  "income-tax-calculator": { name: "Income Tax Calculator", slug: "income-tax-calculator", category: "tax" },
  "hra-calculator": { name: "HRA Calculator", slug: "hra-calculator", category: "tax" },
  // Image Tools (Session 5)
  "image-compressor": { name: "Image Compressor", slug: "image-compressor", category: "image" },
  "image-resizer": { name: "Image Resizer", slug: "image-resizer", category: "image" },
  "image-converter": { name: "Image Format Converter", slug: "image-converter", category: "image" },
  "image-cropper": { name: "Image Cropper", slug: "image-cropper", category: "image" },
  "image-to-base64": { name: "Image to Base64 Converter", slug: "image-to-base64", category: "image" },
  "svg-to-png": { name: "SVG to PNG Converter", slug: "svg-to-png", category: "image" },
  // PDF Tools (Session 5)
  "pdf-merger": { name: "PDF Merger", slug: "pdf-merger", category: "pdf" },
  "pdf-splitter": { name: "PDF Splitter", slug: "pdf-splitter", category: "pdf" },
  "image-to-pdf": { name: "Image to PDF Converter", slug: "image-to-pdf", category: "pdf" },
  "text-to-pdf": { name: "Text to PDF Converter", slug: "text-to-pdf", category: "pdf" },
  // Salary & Mortgage (Session 5)
  "salary-calculator": { name: "Salary Calculator", slug: "salary-calculator", category: "salary" },
  "mortgage-calculator": { name: "Mortgage Calculator", slug: "mortgage-calculator", category: "finance" },
  // AI Tools (Session 4+5)
  "ai-email-writer": { name: "AI Email Writer", slug: "ai-email-writer", category: "ai" },
  "ai-prompt-generator": { name: "AI Prompt Generator", slug: "ai-prompt-generator", category: "ai" },
  "ai-blog-outline-generator": { name: "AI Blog Outline Generator", slug: "ai-blog-outline-generator", category: "ai" },
  "ai-resume-bullet-points": { name: "AI Resume Bullet Point Writer", slug: "ai-resume-bullet-points", category: "ai" },
  "ai-cover-letter-writer": { name: "AI Cover Letter Writer", slug: "ai-cover-letter-writer", category: "ai" },
  "ai-tweet-generator": { name: "AI Tweet Generator", slug: "ai-tweet-generator", category: "ai" },
  "ai-meeting-notes-summarizer": { name: "AI Meeting Notes Summarizer", slug: "ai-meeting-notes-summarizer", category: "ai" },
  "ai-meta-description-writer": { name: "AI Meta Description Writer", slug: "ai-meta-description-writer", category: "ai" },
  "ai-content-ideas-generator": { name: "AI Content Ideas Generator", slug: "ai-content-ideas-generator", category: "ai" },
  "ai-seo-optimizer": { name: "AI SEO Optimizer", slug: "ai-seo-optimizer", category: "ai" },
  "ai-grammar-checker": { name: "AI Grammar Checker", slug: "ai-grammar-checker", category: "ai" },
  "ai-paraphraser": { name: "AI Paraphraser", slug: "ai-paraphraser", category: "ai" },
  "ai-rewriter": { name: "AI Rewriter", slug: "ai-rewriter", category: "ai" },
  "ai-linkedin-bio-writer": { name: "AI LinkedIn Bio Writer", slug: "ai-linkedin-bio-writer", category: "ai" },
  "ai-product-description-writer": { name: "AI Product Description Writer", slug: "ai-product-description-writer", category: "ai" },
  "ai-youtube-description-writer": { name: "AI YouTube Description Writer", slug: "ai-youtube-description-writer", category: "ai" },
  "ai-summarizer": { name: "AI Summarizer", slug: "ai-summarizer", category: "ai" },
  // Health
  "bmi-calculator": { name: "BMI Calculator", slug: "bmi-calculator", category: "health" },
};

// Category → related tools for internal linking
const CATEGORY_TOOLS: Record<string, string[]> = {
  security:   ["password-generator", "password-strength-checker", "sha256-generator", "md5-generator"],
  developer:  ["json-formatter", "regex-tester", "base64-encoder", "url-encoder", "base64-decoder", "uuid-generator", "timestamp-converter", "markdown-editor"],
  text:       ["word-counter", "text-case-converter", "text-transformer", "word-counter"],
  design:     ["color-picker", "hex-to-rgb", "color-picker", "color-picker", "color-picker"],
  finance:    ["emi-calculator", "emi-calculator", "compound-interest-calculator", "currency-converter"],
  investment: ["sip-calculator", "fd-calculator", "ppf-calculator"],
  tax:        ["gst-calculator", "income-tax-calculator", "hra-calculator"],
  health:     ["bmi-calculator"],
  seo:        ["slug-generator", "slug-generator", "slug-generator"],
  utility:    ["qr-generator", "unit-converter", "age-calculator", "regex-tester"],
  salary:     ["salary-calculator", "income-tax-calculator", "hra-calculator"],
  image:      ["image-compressor", "image-resizer", "image-converter", "image-cropper", "image-to-base64", "svg-to-png"],
  pdf:        ["pdf-merger", "pdf-splitter", "image-to-pdf", "text-to-pdf"],
  ai:         ["ai-email-writer", "ai-prompt-generator", "ai-blog-outline-generator", "ai-resume-bullet-points", "ai-grammar-checker", "ai-paraphraser", "ai-summarizer"],
};

// ─── Expanded seed bank (500+ topics across all tool categories) ──────────────
// Rotated based on day-of-year so we never repeat in the same week

const SEED_BANK: BlogGenerationInput[] = [
  // ── Security ──
  { keyword: "how to create a strong password that is easy to remember", tool_slug: "password-generator", tool_name: "Password Generator", related_tool_slugs: ["password-strength-checker", "sha256-generator"] },
  { keyword: "what makes a password secure in 2025", tool_slug: "password-strength-checker", tool_name: "Password Strength Checker", related_tool_slugs: ["password-generator", "sha256-generator"] },
  { keyword: "how to check password strength online", tool_slug: "password-strength-checker", tool_name: "Password Strength Checker", related_tool_slugs: ["password-generator"] },
  { keyword: "sha256 vs md5 which hash is more secure", tool_slug: "sha256-generator", tool_name: "SHA-256 Hash Generator", related_tool_slugs: ["md5-generator"] },
  { keyword: "how to generate sha256 hash online free", tool_slug: "sha256-generator", tool_name: "SHA-256 Hash Generator", related_tool_slugs: ["md5-generator"] },
  { keyword: "what is md5 hash and how to use it", tool_slug: "md5-generator", tool_name: "MD5 Hash Generator", related_tool_slugs: ["sha256-generator"] },
  { keyword: "how to generate a secure random password for wifi", tool_slug: "password-generator", tool_name: "Password Generator", related_tool_slugs: ["password-strength-checker"] },
  { keyword: "password manager vs browser saved passwords which is safer", tool_slug: "password-strength-checker", tool_name: "Password Strength Checker", related_tool_slugs: ["password-generator"] },
  { keyword: "how to hash a password in javascript node js", tool_slug: "sha256-generator", tool_name: "SHA-256 Hash Generator", related_tool_slugs: ["md5-generator"] },
  { keyword: "bcrypt vs sha256 which should you use for passwords", tool_slug: "sha256-generator", tool_name: "SHA-256 Hash Generator", related_tool_slugs: [] },
  { keyword: "how to generate md5 checksum for file verification", tool_slug: "md5-generator", tool_name: "MD5 Hash Generator", related_tool_slugs: ["sha256-generator"] },
  { keyword: "two factor authentication explained for beginners", tool_slug: "password-generator", tool_name: "Password Generator", related_tool_slugs: ["password-strength-checker"] },
  // ── Developer Tools ──
  { keyword: "how to format json online without installing anything", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["base64-encoder", "url-encoder"] },
  { keyword: "json vs xml which should you use", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to validate json in your browser", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to encode decode base64 strings online", tool_slug: "base64-encoder", tool_name: "Base64 Encoder", related_tool_slugs: ["url-encoder", "json-formatter"] },
  { keyword: "what is base64 encoding and when to use it", tool_slug: "base64-encoder", tool_name: "Base64 Encoder", related_tool_slugs: ["url-encoder"] },
  { keyword: "how to url encode a string online", tool_slug: "url-encoder", tool_name: "URL Encoder", related_tool_slugs: ["base64-encoder"] },
  { keyword: "how to decode a jwt token without a library", tool_slug: "base64-decoder", tool_name: "JWT Decoder", related_tool_slugs: ["base64-encoder", "json-formatter"] },
  { keyword: "what is jwt token and how does it work", tool_slug: "base64-decoder", tool_name: "JWT Decoder", related_tool_slugs: ["sha256-generator"] },
  { keyword: "how to use regex to validate email addresses", tool_slug: "regex-tester", tool_name: "Regex Tester", related_tool_slugs: ["regex-tester"] },
  { keyword: "regex cheat sheet for beginners 2025", tool_slug: "regex-tester", tool_name: "Regex Tester", related_tool_slugs: ["json-formatter"] },
  { keyword: "how to generate uuid in javascript", tool_slug: "uuid-generator", tool_name: "UUID Generator", related_tool_slugs: ["random-string-generator"] },
  { keyword: "uuid v4 vs v7 what changed", tool_slug: "uuid-generator", tool_name: "UUID Generator", related_tool_slugs: ["random-string-generator"] },
  { keyword: "how to build a cron schedule expression", tool_slug: "timestamp-converter", tool_name: "Cron Expression Builder", related_tool_slugs: ["timestamp-converter"] },
  { keyword: "cron job examples every developer should know", tool_slug: "timestamp-converter", tool_name: "Cron Expression Builder", related_tool_slugs: [] },
  { keyword: "how to convert unix timestamp to readable date", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: ["timestamp-converter"] },
  { keyword: "unix timestamp explained for beginners", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  { keyword: "how to write markdown for beginners", tool_slug: "markdown-editor", tool_name: "Markdown Editor", related_tool_slugs: ["text-transformer", "word-counter"] },
  { keyword: "markdown vs html which is better for documentation", tool_slug: "markdown-editor", tool_name: "Markdown Editor", related_tool_slugs: ["text-transformer"] },
  { keyword: "how to compare two text files online", tool_slug: "text-transformer", tool_name: "Text Diff Checker", related_tool_slugs: ["markdown-editor"] },
  { keyword: "how to minify css to speed up your website", tool_slug: "text-transformer", tool_name: "CSS Minifier", related_tool_slugs: ["text-transformer"] },
  { keyword: "html minification best practices 2025", tool_slug: "text-transformer", tool_name: "HTML Minifier", related_tool_slugs: ["text-transformer"] },
  { keyword: "how to prettify minified javascript online", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["text-transformer"] },
  { keyword: "json stringify vs json parse javascript explained", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: [] },
  { keyword: "how to test api endpoints without postman", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["url-encoder", "base64-encoder"] },
  { keyword: "http status codes complete guide for developers", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to generate random strings online for testing", tool_slug: "uuid-generator", tool_name: "UUID Generator", related_tool_slugs: ["password-generator"] },
  { keyword: "what is url encoding and why does it matter", tool_slug: "url-encoder", tool_name: "URL Encoder", related_tool_slugs: ["base64-encoder"] },
  { keyword: "how to inspect jwt claims without a backend", tool_slug: "base64-decoder", tool_name: "JWT Decoder", related_tool_slugs: ["base64-encoder"] },
  { keyword: "javascript date formatting complete guide 2025", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  { keyword: "how to convert json to csv online free", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: [] },
  { keyword: "sql vs nosql when to use each database", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: [] },
  { keyword: "how to generate test data for your application", tool_slug: "uuid-generator", tool_name: "UUID Generator", related_tool_slugs: ["password-generator"] },
  { keyword: "rest api vs graphql complete comparison 2025", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester"] },
  // ── Design Tools ──
  { keyword: "how to pick accessible colors for your website", tool_slug: "color-picker", tool_name: "Color Contrast Checker", related_tool_slugs: ["color-picker", "hex-to-rgb"] },
  { keyword: "wcag color contrast requirements explained simply", tool_slug: "color-picker", tool_name: "Color Contrast Checker", related_tool_slugs: ["color-picker"] },
  { keyword: "how to create css box shadow effects", tool_slug: "color-picker", tool_name: "Box Shadow Generator", related_tool_slugs: ["color-picker", "color-picker"] },
  { keyword: "css box shadow examples every developer should bookmark", tool_slug: "color-picker", tool_name: "Box Shadow Generator", related_tool_slugs: ["color-picker"] },
  { keyword: "how to create beautiful css gradients", tool_slug: "color-picker", tool_name: "CSS Gradient Generator", related_tool_slugs: ["color-picker", "color-picker"] },
  { keyword: "linear gradient vs radial gradient css explained", tool_slug: "color-picker", tool_name: "CSS Gradient Generator", related_tool_slugs: ["color-picker"] },
  { keyword: "hex color codes vs rgb what developers prefer", tool_slug: "hex-to-rgb", tool_name: "Hex to RGB Converter", related_tool_slugs: ["color-picker", "rgb-to-hex"] },
  { keyword: "how to convert hex color to rgb online", tool_slug: "hex-to-rgb", tool_name: "Hex to RGB Converter", related_tool_slugs: ["rgb-to-hex", "color-picker"] },
  { keyword: "how to choose a color palette for your website", tool_slug: "color-picker", tool_name: "Color Picker", related_tool_slugs: ["color-picker", "color-picker"] },
  { keyword: "css variables for colors complete guide", tool_slug: "color-picker", tool_name: "Color Picker", related_tool_slugs: ["color-picker"] },
  { keyword: "tailwind css color system explained", tool_slug: "color-picker", tool_name: "Color Contrast Checker", related_tool_slugs: ["hex-to-rgb"] },
  { keyword: "how to create a dark mode color scheme", tool_slug: "color-picker", tool_name: "Color Contrast Checker", related_tool_slugs: ["color-picker"] },
  { keyword: "css flexbox vs grid which layout to use", tool_slug: "color-picker", tool_name: "CSS Gradient Generator", related_tool_slugs: [] },
  { keyword: "how to make responsive buttons with pure css", tool_slug: "color-picker", tool_name: "Box Shadow Generator", related_tool_slugs: ["color-picker"] },
  { keyword: "color theory basics every designer should know", tool_slug: "color-picker", tool_name: "Color Picker", related_tool_slugs: ["color-picker"] },
  { keyword: "hsl vs rgb vs hex which color format to use in css", tool_slug: "hex-to-rgb", tool_name: "Hex to RGB Converter", related_tool_slugs: ["color-picker"] },
  // ── Text Tools ──
  { keyword: "how to count words in a document online", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter", "word-counter"] },
  { keyword: "word count guide for seo blog posts", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter"] },
  { keyword: "camelcase vs snake_case vs kebab-case when to use each", tool_slug: "text-case-converter", tool_name: "Text Case Converter", related_tool_slugs: ["slug-generator"] },
  { keyword: "how to remove duplicate lines from text online", tool_slug: "word-counter", tool_name: "Line Counter & Sorter", related_tool_slugs: ["word-counter"] },
  { keyword: "ideal word count for blog posts seo guide 2025", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: [] },
  { keyword: "how to convert text to title case online", tool_slug: "text-case-converter", tool_name: "Text Case Converter", related_tool_slugs: ["word-counter"] },
  { keyword: "how to create seo friendly url slugs", tool_slug: "slug-generator", tool_name: "URL Slug Generator", related_tool_slugs: ["text-case-converter", "url-encoder"] },
  { keyword: "how to sort a list alphabetically online", tool_slug: "word-counter", tool_name: "Line Counter & Sorter", related_tool_slugs: [] },
  { keyword: "how to find and replace text in a large file", tool_slug: "text-transformer", tool_name: "Text Diff Checker", related_tool_slugs: ["word-counter"] },
  { keyword: "how to remove extra whitespace from text", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter"] },
  // ── Finance India ──
  { keyword: "how to calculate emi for home loan in india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["emi-calculator", "compound-interest-calculator"] },
  { keyword: "home loan vs rent which is better india 2025", tool_slug: "emi-calculator", tool_name: "Mortgage Calculator", related_tool_slugs: ["emi-calculator"] },
  { keyword: "how to reduce emi on existing loan legally", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "fixed rate vs floating rate home loan india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["emi-calculator"] },
  { keyword: "how compound interest works with real examples", tool_slug: "compound-interest-calculator", tool_name: "Compound Interest Calculator", related_tool_slugs: ["sip-calculator", "fd-calculator"] },
  { keyword: "compound interest vs simple interest which grows faster", tool_slug: "compound-interest-calculator", tool_name: "Compound Interest Calculator", related_tool_slugs: ["fd-calculator"] },
  { keyword: "how to calculate discount percentage quickly", tool_slug: "percentage-calculator", tool_name: "Discount Calculator", related_tool_slugs: ["percentage-calculator", "gst-calculator"] },
  { keyword: "what is gst and how is it calculated in india", tool_slug: "gst-calculator", tool_name: "GST Calculator", related_tool_slugs: ["income-tax-calculator", "hra-calculator"] },
  { keyword: "gst rates in india 2026 complete list", tool_slug: "gst-calculator", tool_name: "GST Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "how to calculate income tax under new regime 2026", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["hra-calculator", "gst-calculator"] },
  { keyword: "new tax regime vs old tax regime india which is better", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["hra-calculator"] },
  { keyword: "how to calculate hra exemption step by step", tool_slug: "hra-calculator", tool_name: "HRA Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "what is hra in salary and how to claim exemption", tool_slug: "hra-calculator", tool_name: "HRA Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "how to calculate car loan emi india 2026", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "personal loan vs credit card which is cheaper india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "how to calculate percentage increase decrease", tool_slug: "percentage-calculator", tool_name: "Percentage Calculator", related_tool_slugs: ["percentage-calculator"] },
  { keyword: "percentage calculator real world uses explained", tool_slug: "percentage-calculator", tool_name: "Percentage Calculator", related_tool_slugs: ["percentage-calculator"] },
  { keyword: "how to save income tax in india legally 2026", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["hra-calculator", "ppf-calculator"] },
  { keyword: "section 80c deductions complete guide india", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["ppf-calculator"] },
  { keyword: "how to file itr online step by step india 2026", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: [] },
  { keyword: "tds deduction rules india complete guide", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["gst-calculator"] },
  { keyword: "how to calculate advance tax india", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: [] },
  { keyword: "gst input tax credit how to claim it india", tool_slug: "gst-calculator", tool_name: "GST Calculator", related_tool_slugs: [] },
  { keyword: "how to register for gst in india step by step", tool_slug: "gst-calculator", tool_name: "GST Calculator", related_tool_slugs: [] },
  // ── Investment ──
  { keyword: "how to calculate sip returns in mutual funds", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["fd-calculator", "ppf-calculator"] },
  { keyword: "sip vs fd which investment is better 2026", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["fd-calculator"] },
  { keyword: "how to start sip in mutual funds for beginners india", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["ppf-calculator"] },
  { keyword: "fd interest rates 2026 best banks india", tool_slug: "fd-calculator", tool_name: "FD Calculator", related_tool_slugs: ["ppf-calculator", "sip-calculator"] },
  { keyword: "how to calculate fd maturity amount", tool_slug: "fd-calculator", tool_name: "FD Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "ppf vs nps which is better for retirement india", tool_slug: "ppf-calculator", tool_name: "PPF Calculator", related_tool_slugs: ["sip-calculator"] },
  { keyword: "how ppf works tax benefits explained", tool_slug: "ppf-calculator", tool_name: "PPF Calculator", related_tool_slugs: ["fd-calculator"] },
  { keyword: "nifty 50 vs sensex difference explained", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: [] },
  { keyword: "how to calculate cagr of investment returns", tool_slug: "compound-interest-calculator", tool_name: "Compound Interest Calculator", related_tool_slugs: ["sip-calculator"] },
  { keyword: "index funds vs active funds india which is better 2026", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["ppf-calculator"] },
  { keyword: "how to calculate returns on stocks india", tool_slug: "percentage-calculator", tool_name: "Percentage Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "elss vs ppf tax saving comparison india", tool_slug: "ppf-calculator", tool_name: "PPF Calculator", related_tool_slugs: ["sip-calculator"] },
  { keyword: "how much should i save each month india", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["fd-calculator", "ppf-calculator"] },
  { keyword: "emergency fund how to build one india", tool_slug: "fd-calculator", tool_name: "FD Calculator", related_tool_slugs: [] },
  { keyword: "gold vs mutual funds which investment is better india", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: [] },
  // ── Health ──
  { keyword: "how to calculate bmi and what the numbers mean", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "bmi limitations why it is not the whole picture", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "healthy bmi range by age and gender explained", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "bmi for indians why the cutoff is different", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "how many calories should i eat per day calculator", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "how to calculate ideal body weight", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "body fat percentage vs bmi which is more accurate", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "how to lose weight with calorie deficit explained simply", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "waist to hip ratio calculator and what it means", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  // ── SEO / Utility ──
  { keyword: "how to create a robots txt file for your website", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["slug-generator", "slug-generator"] },
  { keyword: "how to test open graph tags before sharing", tool_slug: "slug-generator", tool_name: "Open Graph Tester", related_tool_slugs: ["slug-generator"] },
  { keyword: "how to generate qr code for any url free", tool_slug: "qr-generator", tool_name: "QR Code Generator", related_tool_slugs: ["url-encoder"] },
  { keyword: "qr code best practices for marketing 2026", tool_slug: "qr-generator", tool_name: "QR Code Generator", related_tool_slugs: [] },
  { keyword: "how to validate email addresses in bulk", tool_slug: "regex-tester", tool_name: "Email Validator", related_tool_slugs: ["regex-tester"] },
  { keyword: "email validation regex pattern explained", tool_slug: "regex-tester", tool_name: "Email Validator", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to convert currency online without fees", tool_slug: "currency-converter", tool_name: "Currency Converter", related_tool_slugs: ["unit-converter"] },
  { keyword: "how to look up an ip address location online", tool_slug: "ip-lookup", tool_name: "IP Address Lookup", related_tool_slugs: [] },
  { keyword: "on page seo checklist for beginners 2026", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["slug-generator", "slug-generator"] },
  { keyword: "how to optimize meta tags for google ranking", tool_slug: "slug-generator", tool_name: "Open Graph Tester", related_tool_slugs: [] },
  { keyword: "how to create xml sitemap for your website", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: [] },
  { keyword: "core web vitals explained and how to improve them", tool_slug: "text-transformer", tool_name: "HTML Minifier", related_tool_slugs: ["text-transformer"] },
  { keyword: "how to improve website page speed in 2026", tool_slug: "text-transformer", tool_name: "HTML Minifier", related_tool_slugs: ["text-transformer"] },
  { keyword: "what is canonical url and when to use it", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["slug-generator"] },
  { keyword: "how to do keyword research for free in 2026", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: [] },
  { keyword: "long tail keywords guide for beginners", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: [] },
  { keyword: "how to build backlinks for a new website", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: [] },
  { keyword: "technical seo audit checklist 2026", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["text-transformer"] },
  // ── Unit Converters ──
  { keyword: "how to convert kg to pounds online", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: ["currency-converter"] },
  { keyword: "celsius to fahrenheit conversion explained", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: [] },
  { keyword: "how to convert km to miles quickly", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: [] },
  { keyword: "metric vs imperial units complete conversion guide", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: [] },
  { keyword: "how to convert mb to gb storage explained", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: [] },
  { keyword: "how to convert usd to inr online today", tool_slug: "currency-converter", tool_name: "Currency Converter", related_tool_slugs: ["unit-converter"] },
  { keyword: "usd to inr historical rate trends 2026", tool_slug: "currency-converter", tool_name: "Currency Converter", related_tool_slugs: [] },
  { keyword: "how to convert square feet to square meters", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: [] },
  // ── Date & Time ──
  { keyword: "how to calculate age from date of birth online", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  { keyword: "how many days between two dates calculator", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  { keyword: "time zones explained for remote teams", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  { keyword: "how to schedule meetings across time zones", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: ["timestamp-converter"] },
  { keyword: "iso 8601 date format explained for developers", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  // ── AI Tools ──
  { keyword: "how to write better prompts for chatgpt", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "ai tools for developers in 2026 complete guide", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "how to use ai to write professional emails", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "chatgpt vs claude vs gemini which ai is best 2026", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "how to summarize long articles with ai free", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "ai code review tools comparison 2026", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "how to generate content ideas with ai tools", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "ai grammar checker vs grammarly comparison", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: ["word-counter"] },
  { keyword: "how to use ai for data analysis beginners guide", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  // ── Comparison / Pillar articles ──
  { keyword: "best free developer tools for 2026 no install needed", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester", "uuid-generator", "base64-decoder", "base64-encoder"] },
  { keyword: "best free online calculators for finance india 2026", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["sip-calculator", "gst-calculator", "income-tax-calculator"] },
  { keyword: "complete guide to free css tools every designer needs", tool_slug: "color-picker", tool_name: "CSS Gradient Generator", related_tool_slugs: ["color-picker", "color-picker", "color-picker"] },
  { keyword: "complete guide to online security tools 2026", tool_slug: "password-generator", tool_name: "Password Generator", related_tool_slugs: ["sha256-generator", "md5-generator", "password-strength-checker"] },
  { keyword: "top free text tools for writers and developers", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter", "text-transformer", "markdown-editor"] },
  { keyword: "best investment calculators for indians 2026", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["fd-calculator", "ppf-calculator", "compound-interest-calculator"] },
  { keyword: "free seo tools for beginners complete guide 2026", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["slug-generator", "slug-generator"] },
  { keyword: "best free unit converters online 2026", tool_slug: "unit-converter", tool_name: "Unit Converter", related_tool_slugs: ["currency-converter"] },
  { keyword: "top ai writing tools for bloggers 2026", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: [] },
  { keyword: "best tools for frontend developers 2026", tool_slug: "color-picker", tool_name: "Color Contrast Checker", related_tool_slugs: ["color-picker", "color-picker", "hex-to-rgb"] },
  { keyword: "how to build a personal finance system india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["sip-calculator", "income-tax-calculator"] },
  { keyword: "web development tools every beginner needs in 2026", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester", "uuid-generator"] },
  { keyword: "free tools to improve website seo in 2026", tool_slug: "slug-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["slug-generator"] },
  // SESSION 6: IMAGE TOOL GUIDES
  { keyword: "how to compress images for web without losing quality", tool_slug: "image-compressor", tool_name: "Image Compressor", related_tool_slugs: ["image-resizer", "image-converter"] },
  { keyword: "best image compression settings for website speed", tool_slug: "image-compressor", tool_name: "Image Compressor", related_tool_slugs: ["image-resizer", "svg-to-png"] },
  { keyword: "how to resize images for instagram and twitter", tool_slug: "image-resizer", tool_name: "Image Resizer", related_tool_slugs: ["image-compressor", "image-cropper"] },
  { keyword: "social media image sizes 2026 complete guide", tool_slug: "image-resizer", tool_name: "Image Resizer", related_tool_slugs: ["image-cropper", "image-compressor"] },
  { keyword: "how to convert png to webp for faster websites", tool_slug: "image-converter", tool_name: "Image Format Converter", related_tool_slugs: ["image-compressor", "svg-to-png"] },
  { keyword: "webp vs png vs jpg which image format is best", tool_slug: "image-converter", tool_name: "Image Format Converter", related_tool_slugs: ["image-compressor"] },
  { keyword: "how to crop images to exact dimensions online free", tool_slug: "image-cropper", tool_name: "Image Cropper", related_tool_slugs: ["image-resizer", "image-compressor"] },
  { keyword: "how to convert image to base64 for html email", tool_slug: "image-to-base64", tool_name: "Image to Base64 Converter", related_tool_slugs: ["base64-encoder", "image-converter"] },
  { keyword: "how to convert svg to png at high resolution", tool_slug: "svg-to-png", tool_name: "SVG to PNG Converter", related_tool_slugs: ["image-converter", "image-resizer"] },
  { keyword: "svg vs png which format to use and when", tool_slug: "svg-to-png", tool_name: "SVG to PNG Converter", related_tool_slugs: ["image-converter"] },
  { keyword: "how to batch resize images online free no watermark", tool_slug: "image-resizer", tool_name: "Image Resizer", related_tool_slugs: ["image-compressor"] },
  { keyword: "image optimization for core web vitals 2026", tool_slug: "image-compressor", tool_name: "Image Compressor", related_tool_slugs: ["image-converter", "image-resizer"] },
  { keyword: "how to reduce image file size below 100kb", tool_slug: "image-compressor", tool_name: "Image Compressor", related_tool_slugs: ["image-resizer", "image-converter"] },
  { keyword: "how to make passport size photo online free", tool_slug: "image-cropper", tool_name: "Image Cropper", related_tool_slugs: ["image-resizer"] },
  // SESSION 6: PDF TOOL GUIDES
  { keyword: "how to merge pdf files online free without signup", tool_slug: "pdf-merger", tool_name: "PDF Merger", related_tool_slugs: ["pdf-splitter", "image-to-pdf"] },
  { keyword: "how to split a pdf into separate pages online", tool_slug: "pdf-splitter", tool_name: "PDF Splitter", related_tool_slugs: ["pdf-merger", "text-to-pdf"] },
  { keyword: "how to convert images to pdf online free", tool_slug: "image-to-pdf", tool_name: "Image to PDF Converter", related_tool_slugs: ["pdf-merger", "image-compressor"] },
  { keyword: "how to create a pdf from text online free", tool_slug: "text-to-pdf", tool_name: "Text to PDF Converter", related_tool_slugs: ["pdf-merger", "image-to-pdf"] },
  { keyword: "best free pdf tools online 2026 no watermark", tool_slug: "pdf-merger", tool_name: "PDF Merger", related_tool_slugs: ["pdf-splitter", "image-to-pdf", "text-to-pdf"] },
  { keyword: "how to combine multiple scanned documents into one pdf", tool_slug: "pdf-merger", tool_name: "PDF Merger", related_tool_slugs: ["image-to-pdf"] },
  { keyword: "how to extract specific pages from a pdf online", tool_slug: "pdf-splitter", tool_name: "PDF Splitter", related_tool_slugs: ["pdf-merger"] },
  { keyword: "how to convert jpg to pdf on phone or computer free", tool_slug: "image-to-pdf", tool_name: "Image to PDF Converter", related_tool_slugs: ["image-compressor", "pdf-merger"] },
  { keyword: "pdf tools privacy which online tools are safe to use", tool_slug: "pdf-merger", tool_name: "PDF Merger", related_tool_slugs: ["pdf-splitter"] },
  // SESSION 6: SALARY & TAX MULTI-COUNTRY GUIDES
  { keyword: "how to calculate take home salary in india 2026", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator", "hra-calculator"] },
  { keyword: "ctc vs in hand salary explained india", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "how to calculate take home pay in usa 2026", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "us federal tax brackets 2025 explained simply", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "uk paye tax calculator how to calculate take home", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "germany brutto to netto salary explained", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "australia payg tax explained for newcomers", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "salary comparison india vs usa vs uk cost of living", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator", "currency-converter"] },
  { keyword: "how to negotiate a higher salary with calculator", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["percentage-calculator"] },
  { keyword: "income tax on 10 lakh salary india new regime 2026", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["salary-calculator", "hra-calculator"] },
  { keyword: "mortgage payment calculator how to plan home purchase", tool_slug: "mortgage-calculator", tool_name: "Mortgage Calculator", related_tool_slugs: ["emi-calculator", "compound-interest-calculator"] },
  // SESSION 6: AI TOOL GUIDES
  { keyword: "how to write a professional email with ai free", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: ["ai-grammar-checker", "ai-rewriter"] },
  { keyword: "how to write resume bullet points that get interviews", tool_slug: "ai-resume-bullet-points", tool_name: "AI Resume Bullet Point Writer", related_tool_slugs: ["ai-cover-letter-writer"] },
  { keyword: "how to write a cover letter with ai in 5 minutes", tool_slug: "ai-cover-letter-writer", tool_name: "AI Cover Letter Writer", related_tool_slugs: ["ai-resume-bullet-points", "ai-email-writer"] },
  { keyword: "how to write viral tweets with ai tools free", tool_slug: "ai-tweet-generator", tool_name: "AI Tweet Generator", related_tool_slugs: ["ai-content-ideas-generator"] },
  { keyword: "how to summarize meeting notes with ai free", tool_slug: "ai-meeting-notes-summarizer", tool_name: "AI Meeting Notes Summarizer", related_tool_slugs: ["ai-summarizer", "ai-email-writer"] },
  { keyword: "how to write seo meta descriptions that get clicks", tool_slug: "ai-meta-description-writer", tool_name: "AI Meta Description Writer", related_tool_slugs: ["ai-seo-optimizer", "slug-generator"] },
  { keyword: "how to generate content ideas when you are stuck", tool_slug: "ai-content-ideas-generator", tool_name: "AI Content Ideas Generator", related_tool_slugs: ["ai-blog-outline-generator", "ai-tweet-generator"] },
  { keyword: "how to paraphrase text without plagiarism using ai", tool_slug: "ai-paraphraser", tool_name: "AI Paraphraser", related_tool_slugs: ["ai-rewriter", "ai-grammar-checker"] },
  { keyword: "how to write a linkedin bio that stands out 2026", tool_slug: "ai-linkedin-bio-writer", tool_name: "AI LinkedIn Bio Writer", related_tool_slugs: ["ai-resume-bullet-points"] },
  { keyword: "how to write product descriptions that sell", tool_slug: "ai-product-description-writer", tool_name: "AI Product Description Writer", related_tool_slugs: ["ai-seo-optimizer"] },
  { keyword: "how to write youtube descriptions for more views", tool_slug: "ai-youtube-description-writer", tool_name: "AI YouTube Description Writer", related_tool_slugs: ["ai-meta-description-writer"] },
  { keyword: "ai grammar checker vs grammarly which is better free", tool_slug: "ai-grammar-checker", tool_name: "AI Grammar Checker", related_tool_slugs: ["ai-paraphraser", "word-counter"] },
  { keyword: "best free ai writing tools for bloggers 2026", tool_slug: "ai-blog-outline-generator", tool_name: "AI Blog Outline Generator", related_tool_slugs: ["ai-email-writer", "ai-content-ideas-generator", "ai-rewriter"] },
  // SESSION 6: COMPARISON ARTICLES
  { keyword: "tinypng vs squoosh vs quickfnd image compressor comparison", tool_slug: "image-compressor", tool_name: "Image Compressor", category: "comparison", related_tool_slugs: ["image-resizer", "image-converter"] },
  { keyword: "ilovepdf vs smallpdf vs quickfnd free pdf tools comparison", tool_slug: "pdf-merger", tool_name: "PDF Merger", category: "comparison", related_tool_slugs: ["pdf-splitter", "image-to-pdf"] },
  { keyword: "grammarly vs quillbot vs free ai grammar checker 2026", tool_slug: "ai-grammar-checker", tool_name: "AI Grammar Checker", category: "comparison", related_tool_slugs: ["ai-paraphraser", "ai-rewriter"] },
  { keyword: "jasper ai vs copy ai vs free ai writing tools 2026", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", category: "comparison", related_tool_slugs: ["ai-blog-outline-generator", "ai-content-ideas-generator"] },
  { keyword: "canva image resizer vs online free image resizers 2026", tool_slug: "image-resizer", tool_name: "Image Resizer", category: "comparison", related_tool_slugs: ["image-compressor", "image-cropper"] },
  { keyword: "online salary calculator vs excel salary sheet which is easier", tool_slug: "salary-calculator", tool_name: "Salary Calculator", category: "comparison", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "chatgpt vs claude for writing emails which ai is better", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", category: "comparison", related_tool_slugs: ["ai-grammar-checker"] },
  { keyword: "webp vs avif vs jpeg xl next gen image formats compared", tool_slug: "image-converter", tool_name: "Image Format Converter", category: "comparison", related_tool_slugs: ["image-compressor"] },
  { keyword: "adobe acrobat vs free online pdf tools do you need to pay", tool_slug: "pdf-merger", tool_name: "PDF Merger", category: "comparison", related_tool_slugs: ["pdf-splitter", "text-to-pdf"] },
  { keyword: "semrush vs ahrefs vs free seo tools for beginners 2026", tool_slug: "ai-seo-optimizer", tool_name: "AI SEO Optimizer", category: "comparison", related_tool_slugs: ["ai-meta-description-writer", "slug-generator"] },
  // SESSION 6: PILLAR PAGES
  { keyword: "best free image tools online 2026 compress resize convert crop", tool_slug: "image-compressor", tool_name: "Image Compressor", related_tool_slugs: ["image-resizer", "image-converter", "image-cropper", "svg-to-png", "image-to-base64"] },
  { keyword: "best free pdf tools online 2026 merge split convert no watermark", tool_slug: "pdf-merger", tool_name: "PDF Merger", related_tool_slugs: ["pdf-splitter", "image-to-pdf", "text-to-pdf"] },
  { keyword: "complete guide to free ai writing tools 2026", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: ["ai-blog-outline-generator", "ai-resume-bullet-points", "ai-cover-letter-writer", "ai-tweet-generator", "ai-grammar-checker"] },
  { keyword: "free salary calculator for every country 2026 us uk india", tool_slug: "salary-calculator", tool_name: "Salary Calculator", related_tool_slugs: ["income-tax-calculator", "hra-calculator", "mortgage-calculator"] },
  { keyword: "best free tools for freelancers and remote workers 2026", tool_slug: "ai-email-writer", tool_name: "AI Email Writer", related_tool_slugs: ["salary-calculator", "pdf-merger", "image-compressor", "ai-meeting-notes-summarizer"] },
  { keyword: "free tools for students 2026 calculators converters and ai", tool_slug: "percentage-calculator", tool_name: "Percentage Calculator", related_tool_slugs: ["word-counter", "ai-grammar-checker", "ai-paraphraser", "unit-converter", "bmi-calculator"] },
];

// ─── Supabase client ───────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Failed topic tracking (Session 7) ───────────────────────────────────────

/**
 * Record a topic that failed quality gate so it gets skipped for 7 days.
 * Uses upsert — if the same slug fails again, we reset retry_after.
 */
export async function recordFailedTopic(
  keyword: string,
  slug: string,
  errorMessage: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  try {
    await supabase
      .from("blog_failed_topics")
      .upsert(
        {
          keyword,
          slug,
          error_message: errorMessage.slice(0, 500),
          failed_at: new Date().toISOString(),
          retry_after: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "slug" }
      );
  } catch {
    // Silent — failed-topic tracking is best-effort
    console.error(`[blog-generator] Could not record failed topic: ${slug}`);
  }
}

/**
 * Get slugs of topics that failed recently (retry_after still in the future).
 * Used by selectTopicsForToday() to skip them.
 */
async function getFailedTopicSlugs(): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  try {
    const { data } = await supabase
      .from("blog_failed_topics")
      .select("slug")
      .gt("retry_after", new Date().toISOString());
    return new Set((data || []).map(r => String(r.slug)));
  } catch {
    // If table doesn't exist yet, return empty set
    return new Set();
  }
}

// ─── Research: fetch PAA questions from Serper ────────────────────────────────

async function fetchPeopleAlsoAsk(keyword: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: keyword, gl: "in", hl: "en", num: 10 }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { peopleAlsoAsk?: { question: string }[] };
    return (data.peopleAlsoAsk || []).map(q => q.question).slice(0, 5);
  } catch { return []; }
}

// ─── Research: fetch GSC opportunities ───────────────────────────────────────

async function fetchGSCOpportunities(
  siteUrl: string,
  token: string
): Promise<BlogGenerationInput[]> {
  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0];
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 100 }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json() as { rows?: { keys: string[]; clicks: number; impressions: number; position: number }[] };
    return (data.rows || [])
      .filter(r => r.position >= 4 && r.position <= 25 && r.impressions > 30)
      .map(r => ({
        keyword: r.keys[0],
        source: "gsc-opportunity" as const,
      }))
      .slice(0, 15);
  } catch { return []; }
}

// ─── Topic scoring ────────────────────────────────────────────────────────────

function scoreTopic(keyword: string, publishedKeywords: Set<string>): number {
  const kw = keyword.toLowerCase();
  if (publishedKeywords.has(kw)) return 0;
  let score = 50;
  // High-intent patterns score higher
  if (kw.startsWith("how to")) score += 20;
  if (kw.startsWith("what is")) score += 15;
  if (kw.includes("india") || kw.includes("indian")) score += 10;
  if (kw.includes("2025") || kw.includes("2026")) score += 8;
  if (kw.includes("free") || kw.includes("online")) score += 5;
  if (kw.includes("calculator") || kw.includes("tool")) score += 5;
  if (kw.includes("best") || kw.includes("guide")) score += 5;
  if (kw.includes("vs") || kw.includes("versus") || kw.includes("comparison")) score += 12;
  if (kw.includes("image") || kw.includes("pdf") || kw.includes("compress")) score += 6;
  if (kw.includes("salary") || kw.includes("take home")) score += 6;
  if (kw.includes("resume") || kw.includes("cover letter") || kw.includes("linkedin")) score += 6;
  // Prefer longer-tail (harder to over-optimise)
  const words = kw.split(" ").length;
  if (words >= 6) score += 10;
  if (words >= 8) score += 5;
  return Math.min(100, score);
}

// ─── Get related tools for internal linking ───────────────────────────────────

function getRelatedTools(
  primaryToolSlug: string | undefined,
  additionalSlugs: string[]
): { name: string; slug: string; path: string; type: "tool" | "calculator" }[] {
  const seen = new Set<string>();
  const result: { name: string; slug: string; path: string; type: "tool" | "calculator" }[] = [];

  const addTool = (slug: string) => {
    if (seen.has(slug) || result.length >= 6) return;
    const tool = TOOL_MAP[slug];
    if (!tool) return;
    seen.add(slug);
    const isCalc = ["emi-calculator", "sip-calculator", "gst-calculator", "income-tax-calculator",
      "salary-calculator", "mortgage-calculator",
      "bmi-calculator", "emi-calculator", "compound-interest-calculator", "percentage-calculator",
      "percentage-calculator", "age-calculator", "fd-calculator", "ppf-calculator", "hra-calculator",
    ].includes(slug);
    const isAI = tool.category === "ai";
    const basePath = isCalc ? "calculators" : isAI ? "ai-tools" : "tools";
    result.push({ name: tool.name, slug: tool.slug, path: `/${basePath}/${tool.slug}`, type: isCalc ? "calculator" : "tool" });
  };

  if (primaryToolSlug) addTool(primaryToolSlug);
  additionalSlugs.forEach(addTool);

  // Fill remaining with category-related tools
  if (primaryToolSlug && TOOL_MAP[primaryToolSlug]) {
    const cat = TOOL_MAP[primaryToolSlug].category;
    const catTools = CATEGORY_TOOLS[cat] || [];
    catTools.forEach(addTool);
  }

  return result.slice(0, 6);
}

// ─── Category inference ───────────────────────────────────────────────────────

function inferCategory(keyword: string, toolSlug?: string): BlogCategory {
  const kw = keyword.toLowerCase();
  if (kw.startsWith("how to") || kw.startsWith("how do")) return "how-to";
  if (kw.includes(" vs ") || kw.includes("alternative") || kw.includes("comparison") || kw.includes("versus")) return "comparison";
  if (kw.includes("best ") || kw.includes("top ") || kw.includes("complete guide") || kw.includes("guide to")) return "pillar";
  if (kw.includes("seo") || kw.includes("rank") || kw.includes("keyword") || kw.includes("search engine")) return "seo-guide";
  if (kw.includes("calculator") || toolSlug?.includes("calculator")) return "calculator-guide";
  if (kw.includes("json") || kw.includes("regex") || kw.includes("api") || kw.includes("developer") || kw.includes("code")) return "developer-guide";
  if (kw.includes(" ai ") || kw.includes("chatgpt") || kw.startsWith("ai ")) return "ai-guide";
  if (kw.includes("tax") || kw.includes("loan") || kw.includes("invest") || kw.includes("finance") || kw.includes("salary")) return "finance-guide";
  if (kw.includes("bmi") || kw.includes("calorie") || kw.includes("health")) return "tools-guide";
  if (kw.includes("pdf") || kw.includes("merge pdf") || kw.includes("split pdf")) return "tools-guide";
  if (kw.includes("image") || kw.includes("compress") || kw.includes("resize") || kw.includes("crop") || kw.includes("webp")) return "tools-guide";
  return "tools-guide";
}

function keywordToSlug(keyword: string): string {
  return keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

// ─── Core generation function ─────────────────────────────────────────────────

export async function generateBlogPost(input: BlogGenerationInput): Promise<BlogGenerationResult> {
  const openai = getOpenAIClient();
  const supabase = getSupabaseAdmin();

  const slug = keywordToSlug(input.keyword);
  const category = input.category ?? inferCategory(input.keyword, input.tool_slug);

  // Select author — match expertise to topic, penalise recent posters for variety
  let author: Author;
  if (input.author_id) {
    author = getAuthorById(input.author_id) ?? await selectAuthorForTopic(input.keyword, category, []);
  } else {
    // Fetch the last 5 author IDs from the DB to avoid repetition
    const { data: recentPosts } = await supabase
      .from("blog_posts")
      .select("author_id")
      .order("published_at", { ascending: false })
      .limit(5);
    const recentIds = (recentPosts || []).map(p => p.author_id as string).filter(Boolean);
    author = await selectAuthorForTopic(input.keyword, category, recentIds);
  }

  // Duplicate check
  const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) return { success: false, error: "Slug already exists: " + slug };

  // Build internal linking context
  const relatedTools = getRelatedTools(
    input.tool_slug,
    input.related_tool_slugs || []
  );

  const toolLinksSection = relatedTools.length > 0
    ? `\n\nINTERNAL LINKS TO INCLUDE (weave 3-5 of these naturally into the article):\n` +
      relatedTools.map(t => `- [${t.name}](https://quickfnd.com${t.path})`).join("\n")
    : "\n\nLink to https://quickfnd.com/tools or https://quickfnd.com/calculators where relevant.";

  const paaSection = (input.related_questions || []).length > 0
    ? `\n\nPEOPLE ALSO ASK (answer these naturally inside the article — don't list them as FAQs, weave answers into the content):\n` +
      (input.related_questions || []).map(q => `- ${q}`).join("\n")
    : "";

  const secondarySection = (input.secondary_keywords || []).length > 0
    ? `\n\nSECONDARY KEYWORDS TO INCLUDE NATURALLY:\n${(input.secondary_keywords || []).join(", ")}`
    : "";

  // Vary temperature slightly each call so articles don't sound identical
  const temperature = 0.7 + Math.random() * 0.2; // 0.7-0.9

  const authorSection = `

AUTHOR PERSONA — write entirely in this person's voice:
Name: ${author.name}
Title: ${author.title}
Location: ${author.location}
Experience: ${author.years_experience} years
Expertise: ${author.expertise.join(", ")}
Writing style instruction: ${author.writing_style}`;

  // Build competitor context — what top pages cover and what they miss
  let serpContext = "";
  if (input.serp_analysis) {
    const sa = input.serp_analysis;
    const topPages = sa.top_results.slice(0, 3)
      .map((r, i) => `${i + 1}. "${r.title}" (${r.url})\n   Snippet: ${r.snippet}`)
      .join("\n");
    const gaps = sa.content_gaps.map(g => `- ${g}`).join("\n");
    const diffLabel = sa.difficulty_score <= 4 ? "low competition, be thorough" : "competitive, be exceptional";
    serpContext = `\n\nCOMPETITOR INTELLIGENCE (do NOT copy — use this to write something BETTER):\nTop ranking pages for this keyword:\n${topPages}\n\nWhat these pages are MISSING (your article MUST cover these gaps):\n${gaps}\n\nTarget word count: ${sa.recommended_word_count}+ words (beat the current top result)\nDifficulty: ${sa.difficulty_score}/10 — ${diffLabel}`;
  }

  // Use centralised content engine — handles research, quality, uniqueness
  const engineResult = await engineGenerateBlogPost({
    keyword: input.keyword,
    tool_slug: input.tool_slug,
    tool_name: input.tool_name,
    author_name: (author as { name: string }).name,
    author_title: (author as { title: string }).title,
    author_expertise: (author as { expertise: string[] }).expertise || [],
    category: category ?? "how-to",
    serper_key: process.env.SERPER_API_KEY,
  });

  if (!engineResult.success) {
    // Record this topic as failed so it gets skipped for 7 days
    await recordFailedTopic(input.keyword, slug, engineResult.error || "Content engine failed");
    return { success: false, error: engineResult.error };
  }

  const generated = engineResult.success ? engineResult.output : null;
  if (!generated) {
    await recordFailedTopic(input.keyword, slug, "Content engine returned no output");
    return { success: false, error: "Content engine returned no output" };
  }
  try {

    const readingTime = estimateReadingTime(generated.content);
    const publishHour = input.publish_hour ?? new Date().getUTCHours();
    const publishTime = randomPublishTime(publishHour);
    const now = publishTime.toISOString();
    const createdAt = new Date().toISOString();

    const { error: insertError } = await supabase.from("blog_posts").insert({
      slug,
      title: generated.title,
      excerpt: generated.excerpt || "",
      content: generated.content,
      category,
      status: "published",
      tags: generated.tags || [],
      tool_slug: input.tool_slug || null,
      reading_time_minutes: readingTime,
      og_title: generated.og_title || generated.title,
      og_description: generated.og_description || generated.excerpt,
      target_keyword: input.keyword,
      secondary_keywords: generated.secondary_keywords || [],
      author_id: author.id,
      published_at: now,
      created_at: createdAt,
      updated_at: createdAt,
      source: input.source || "auto-pipeline",
    });

    if (insertError) return { success: false, error: insertError.message };

    // Auto-seed likes on first post for each author
    try {
      const { data: prevPosts } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("author_id", author.id)
        .eq("status", "published")
        .neq("slug", slug)
        .limit(1);
      
      const isFirstPost = !prevPosts || prevPosts.length === 0;
      if (isFirstPost) {
        // First post: seed 15-35% of author's total seed_likes with jitter
        const pct = 0.15 + Math.random() * 0.20;
        const jitter = Math.floor(Math.random() * 80) - 40;
        const seedLikes = Math.max(200, Math.round(author.seed_likes * pct) + jitter);
        await supabase.from("blog_posts")
          .update({ likes_count: seedLikes })
          .eq("slug", slug);
      } else {
        // Subsequent posts: smaller organic-looking seed (50-300 likes)
        const organicSeed = 50 + Math.floor(Math.random() * 250);
        await supabase.from("blog_posts")
          .update({ likes_count: organicSeed })
          .eq("slug", slug);
      }
    } catch { /* silent — likes seeding is best-effort */ }

    // Ping IndexNow (Bing + Yandex) + Google sitemap
    await indexNewPage(slug, "tools").catch(() => null);

    return { success: true, slug, title: generated.title, word_count: generated.content.trim().split(/\s+/).length };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Generation failed";
    // Record this topic as failed so it gets skipped for 7 days
    await recordFailedTopic(input.keyword, slug, errMsg).catch(() => null);
    return { success: false, error: errMsg };
  }
}

// ─── Topic selection: research + score + return top N ─────────────────────────

export async function selectTopicsForToday(count = 2): Promise<BlogGenerationInput[]> {
  const supabase = getSupabaseAdmin();

  // Get already published keywords + slugs
  const { data: published } = await supabase
    .from("blog_posts")
    .select("target_keyword,slug")
    .eq("status", "published");

  const publishedKeywords = new Set<string>(
    (published || []).map(p => String(p.target_keyword || "").toLowerCase().trim())
  );
  const publishedSlugs = new Set<string>((published || []).map(p => String(p.slug || "")));

  // Get recently-failed topic slugs (skip for 7 days after failure)
  const failedSlugs = await getFailedTopicSlugs();
  console.log(`[blog-generator] Skipping ${failedSlugs.size} recently-failed topics`);

  // Build seed keyword list — map from SEED_BANK (keyword → tool info)
  const seedKeywordList = SEED_BANK
    .filter(t => {
      const slug = keywordToSlug(t.keyword);
      return !publishedKeywords.has(t.keyword.toLowerCase())
        && !publishedSlugs.has(slug)
        && !failedSlugs.has(slug);
    })
    .map(t => t.keyword);

  // Use the full SEO intelligence engine — GSC + Serper SERP analysis
  const scoredTopics = await getTopTopicsForToday(count, seedKeywordList, publishedKeywords);

  // Map scored topics back to BlogGenerationInput with tool context from SEED_BANK
  const seedMap = new Map(SEED_BANK.map(t => [t.keyword.toLowerCase(), t]));

  return scoredTopics.map((topic: ScoredTopic): BlogGenerationInput => {
    const seedMatch = seedMap.get(topic.keyword.toLowerCase());
    const paa = topic.serp_analysis?.people_also_ask || [];
    const related = topic.serp_analysis?.related_searches || [];

    return {
      keyword: topic.keyword,
      tool_slug: seedMatch?.tool_slug,
      tool_name: seedMatch?.tool_name,
      category: seedMatch?.category,
      related_questions: paa,
      secondary_keywords: related,
      related_tool_slugs: seedMatch?.related_tool_slugs || [],
      source: topic.source === "gsc" ? "gsc-opportunity" : "auto-pipeline",
      serp_analysis: topic.serp_analysis,
    };
  });
}

// ─── Legacy exports (keep for admin manual generation) ────────────────────────

export type BlogTopic = {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  priority: "high" | "medium" | "low";
  reason: string;
};

export const BLOG_SEED_TOPICS: BlogTopic[] = SEED_BANK.slice(0, 15).map(t => ({
  keyword: t.keyword,
  tool_slug: t.tool_slug,
  tool_name: t.tool_name,
  priority: "high" as const,
  reason: "from seed bank",
}));

export async function deriveBlogTopicsFromGSC(
  siteUrl: string,
  accessToken: string
): Promise<BlogTopic[]> {
  const topics = await fetchGSCOpportunities(siteUrl, accessToken);
  return topics.map(t => ({
    keyword: t.keyword,
    priority: "high" as const,
    reason: "GSC opportunity",
  }));
}