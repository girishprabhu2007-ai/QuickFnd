/**
 * lib/replenishment-catalog.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTHORITATIVE list of every item QuickFnd should have.
 *
 * status: "live"    = already in DB, skip
 *         "missing" = auto-replenishment cron will publish this
 *         "planned" = needs new engine first, skip for now
 *
 * The daily cron at 3am finds status="missing" items not yet in DB
 * and publishes them automatically via the auto-generate pipeline.
 *
 * Rules:
 * - One entry per real function. No platform variants (no "Twitter X", "Instagram Y").
 * - engine_type MUST exist in engine-catalog.ts CalculatorEngineType / ToolEngineType / AIToolEngineType
 * - priority: 1=high demand, 2=medium, 3=future
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
  status: "live" | "missing" | "planned";
};

export const TOOL_CATALOG: CatalogEntry[] = [

  // ══ TOOLS — LIVE ══════════════════════════════════════════════════════════

  { slug: "word-counter", name: "Word Counter", status: "live",
    description: "Count words, characters, sentences, paragraphs and reading time.",
    engine_type: "word-counter", related_slugs: ["text-case-converter", "advanced-text-transformer", "seo-slug-generator"],
    category: "tool", priority: 1, group: "text" },

  { slug: "text-case-converter", name: "Text Case Converter", status: "live",
    description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case.",
    engine_type: "text-case-converter", related_slugs: ["word-counter", "advanced-text-transformer", "seo-slug-generator"],
    category: "tool", priority: 1, group: "text" },

  { slug: "advanced-text-transformer", name: "Text Transformer", status: "live",
    description: "Reverse, trim, remove blank lines, deduplicate and more.",
    engine_type: "text-transformer", related_slugs: ["word-counter", "text-case-converter", "seo-slug-generator"],
    category: "tool", priority: 1, group: "text" },

  { slug: "seo-slug-generator", name: "Slug Generator", status: "live",
    description: "Convert text into a clean URL-friendly slug.",
    engine_type: "slug-generator", related_slugs: ["text-case-converter", "url-encoder-for-seo", "word-counter"],
    category: "tool", priority: 1, group: "text" },

  { slug: "json-formatter", name: "JSON Formatter", status: "live",
    description: "Format, validate, prettify and minify JSON. Catches syntax errors instantly.",
    engine_type: "json-formatter", related_slugs: ["csv-to-json", "base64-encoder", "regex-pattern-tester"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "base64-encoder", name: "Base64 Encoder / Decoder", status: "live",
    description: "Encode text to Base64 or decode Base64 back to plain text.",
    engine_type: "base64-encoder", related_slugs: ["url-encoder-for-seo", "sha256-hash-generator", "json-formatter"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "url-encoder-for-seo", name: "URL Encoder / Decoder", status: "live",
    description: "Percent-encode URLs or decode encoded URLs back to readable text.",
    engine_type: "url-encoder", related_slugs: ["base64-encoder", "seo-slug-generator", "json-formatter"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "sha256-hash-generator", name: "Hash Generator", status: "live",
    description: "Generate SHA-256 and MD5 hashes from any text. Browser-side only.",
    engine_type: "sha256-generator", related_slugs: ["password-generator", "base64-encoder", "uuid-version-selector"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "uuid-version-selector", name: "UUID Generator", status: "live",
    description: "Generate UUID v1, v4 and v5 unique identifiers.",
    engine_type: "uuid-generator", related_slugs: ["password-generator", "custom-random-string-generator", "sha256-hash-generator"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "password-generator", name: "Password Generator", status: "live",
    description: "Generate strong random passwords with configurable options.",
    engine_type: "password-generator", related_slugs: ["password-strength-checker", "uuid-version-selector", "custom-random-string-generator"],
    category: "tool", priority: 1, group: "security" },

  { slug: "password-strength-checker", name: "Password Strength Checker", status: "live",
    description: "Score any password against strength criteria and get improvement tips.",
    engine_type: "password-strength-checker", related_slugs: ["password-generator", "sha256-hash-generator", "uuid-version-selector"],
    category: "tool", priority: 1, group: "security" },

  { slug: "regex-pattern-tester", name: "Regex Tester", status: "live",
    description: "Test regular expressions against text in real time with match highlighting.",
    engine_type: "regex-tester", related_slugs: ["json-formatter", "word-counter", "advanced-text-transformer"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "unix-timestamp-converter", name: "Timestamp Converter", status: "live",
    description: "Convert Unix timestamps to human-readable dates and back. All timezones.",
    engine_type: "timestamp-converter", related_slugs: ["json-formatter", "regex-pattern-tester", "uuid-version-selector"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "csv-to-json", name: "CSV to JSON Converter", status: "live",
    description: "Convert CSV data to JSON. Auto-detects delimiter and handles headers.",
    engine_type: "csv-to-json", related_slugs: ["json-formatter", "base64-encoder", "markdown-editor"],
    category: "tool", priority: 1, group: "data" },

  { slug: "markdown-editor", name: "Markdown Editor", status: "live",
    description: "Write Markdown with live HTML preview. All standard syntax supported.",
    engine_type: "markdown-editor", related_slugs: ["word-counter", "advanced-text-transformer", "json-formatter"],
    category: "tool", priority: 1, group: "text" },

  { slug: "ip-address-lookup", name: "IP Address Lookup", status: "live",
    description: "Look up location, ISP, timezone for any IP. Leave blank to check yours.",
    engine_type: "ip-lookup", related_slugs: ["json-formatter", "url-encoder-for-seo", "sha256-hash-generator"],
    category: "tool", priority: 1, group: "network" },

  { slug: "color-picker", name: "Color Picker", status: "live",
    description: "Pick any color and get HEX, RGB, HSL and CSS values instantly.",
    engine_type: "color-picker", related_slugs: ["hex-to-rgb-with-palette-generator", "qr-code-generator"],
    category: "tool", priority: 1, group: "design" },

  { slug: "qr-code-generator", name: "QR Code Generator", status: "live",
    description: "Generate QR codes from any URL, text or data. Download as PNG.",
    engine_type: "qr-generator", related_slugs: ["url-encoder-for-seo", "color-picker", "base64-encoder"],
    category: "tool", priority: 1, group: "utility" },

  // ══ TOOLS — MISSING (will be auto-published by replenishment cron) ═════════

  { slug: "diff-checker", name: "Text Diff Checker", status: "missing",
    description: "Compare two pieces of text side by side and see exactly what changed. Essential for reviewing document edits, code changes, or any version comparison.",
    engine_type: "text-transformer", engine_config: { mode: "diff" },
    related_slugs: ["json-formatter", "advanced-text-transformer", "word-counter"],
    category: "tool", priority: 1, group: "text" },

  { slug: "jwt-decoder", name: "JWT Decoder", status: "missing",
    description: "Decode and inspect JSON Web Tokens in your browser. View header, payload and expiry without sending tokens to any server.",
    engine_type: "base64-decoder", engine_config: { mode: "jwt" },
    related_slugs: ["json-formatter", "base64-encoder", "sha256-hash-generator"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "html-entity-encoder", name: "HTML Entity Encoder", status: "missing",
    description: "Encode special characters to HTML entities or decode HTML entities back to plain text. Critical for web developers working with HTML content.",
    engine_type: "url-encoder", engine_config: { mode: "html" },
    related_slugs: ["base64-encoder", "url-encoder-for-seo", "json-formatter"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "number-base-converter", name: "Number Base Converter", status: "missing",
    description: "Convert numbers between decimal, binary, hex and octal instantly. Shows all bases simultaneously for easy comparison.",
    engine_type: "text-transformer", engine_config: { mode: "base-converter" },
    related_slugs: ["text-to-binary-visual-converter", "sha256-hash-generator", "json-formatter"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", status: "missing",
    description: "Generate placeholder Lorem Ipsum text for mockups, wireframes and designs. Choose paragraphs, sentences or word count.",
    engine_type: "text-transformer", engine_config: { mode: "lorem-ipsum" },
    related_slugs: ["word-counter", "markdown-editor", "text-case-converter"],
    category: "tool", priority: 1, group: "text" },

  { slug: "line-counter", name: "Line Counter", status: "missing",
    description: "Count lines, blank lines and non-blank lines in any text. Also removes duplicates, sorts lines and joins them.",
    engine_type: "word-counter", engine_config: { mode: "lines" },
    related_slugs: ["word-counter", "advanced-text-transformer", "diff-checker"],
    category: "tool", priority: 1, group: "text" },

  { slug: "string-reverse", name: "String Reverser", status: "missing",
    description: "Reverse any string, sentence or text block instantly. Also reverses word order, mirrors text, and flips unicode characters.",
    engine_type: "text-transformer", engine_config: { mode: "reverse" },
    related_slugs: ["text-case-converter", "advanced-text-transformer", "word-counter"],
    category: "tool", priority: 2, group: "text" },

  { slug: "css-minifier", name: "CSS Minifier", status: "missing",
    description: "Minify CSS code by removing whitespace, comments and redundant rules. Reduces file size for faster page loads.",
    engine_type: "code-formatter", engine_config: { mode: "css-minify" },
    related_slugs: ["json-formatter", "markdown-editor", "advanced-text-transformer"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "html-minifier", name: "HTML Minifier", status: "missing",
    description: "Minify HTML by removing comments, extra whitespace and optional tags. Safe compression for production websites.",
    engine_type: "code-formatter", engine_config: { mode: "html-minify" },
    related_slugs: ["css-minifier", "json-formatter", "html-entity-encoder"],
    category: "tool", priority: 1, group: "developer" },

  { slug: "robots-txt-generator", name: "Robots.txt Generator", status: "missing",
    description: "Generate a valid robots.txt file for your website. Control which pages search engines can crawl with a visual builder.",
    engine_type: "text-transformer", engine_config: { mode: "robots-txt" },
    related_slugs: ["seo-slug-generator", "json-formatter", "url-encoder-for-seo"],
    category: "tool", priority: 1, group: "seo" },

  { slug: "open-graph-tester", name: "Open Graph Preview", status: "missing",
    description: "Preview how your page looks when shared on Twitter, Facebook and LinkedIn. Enter a URL or paste meta tags to check your OG setup.",
    engine_type: "text-transformer", engine_config: { mode: "og-preview" },
    related_slugs: ["seo-slug-generator", "word-counter", "robots-txt-generator"],
    category: "tool", priority: 1, group: "seo" },

  { slug: "email-validator", name: "Email Address Validator", status: "missing",
    description: "Validate email addresses instantly. Checks format, domain syntax and MX record patterns. Bulk validate a list at once.",
    engine_type: "regex-tester", engine_config: { mode: "email-validate" },
    related_slugs: ["regex-pattern-tester", "url-encoder-for-seo", "json-formatter"],
    category: "tool", priority: 1, group: "utility" },

  // ══ CALCULATORS — LIVE ════════════════════════════════════════════════════

  { slug: "emi-calculator", name: "EMI Calculator", status: "live",
    description: "Calculate monthly EMI for home loan, car loan or personal loan.",
    engine_type: "emi-calculator", related_slugs: ["loan-calculator", "sip-calculator", "gst-calculator"],
    category: "calculator", priority: 1, group: "finance" },

  { slug: "sip-calculator", name: "SIP Calculator", status: "live",
    description: "Calculate SIP returns for mutual fund investments with compounding.",
    engine_type: "sip-calculator", related_slugs: ["fd-calculator", "ppf-calculator", "emi-calculator"],
    category: "calculator", priority: 1, group: "investment" },

  { slug: "fd-calculator", name: "FD Calculator", status: "live",
    description: "Calculate fixed deposit maturity amount and interest earned.",
    engine_type: "fd-calculator", related_slugs: ["sip-calculator", "ppf-calculator", "compound-interest-calculator"],
    category: "calculator", priority: 1, group: "investment" },

  { slug: "ppf-calculator", name: "PPF Calculator", status: "live",
    description: "Calculate Public Provident Fund maturity with annual contributions.",
    engine_type: "ppf-calculator", related_slugs: ["sip-calculator", "fd-calculator", "income-tax-calculator"],
    category: "calculator", priority: 1, group: "investment" },

  { slug: "income-tax-calculator", name: "Income Tax Calculator", status: "live",
    description: "Estimate income tax under old and new tax regime for FY 2024-25.",
    engine_type: "income-tax-calculator", related_slugs: ["hra-calculator", "gst-calculator", "ppf-calculator"],
    category: "calculator", priority: 1, group: "tax" },

  { slug: "gst-calculator", name: "GST Calculator", status: "live",
    description: "Calculate GST-inclusive and GST-exclusive amounts at 5%, 12%, 18%, 28%.",
    engine_type: "gst-calculator", related_slugs: ["income-tax-calculator", "emi-calculator", "percentage-calculator"],
    category: "calculator", priority: 1, group: "tax" },

  { slug: "bmi-calculator", name: "BMI Calculator", status: "live",
    description: "Calculate body mass index from height and weight with health category.",
    engine_type: "bmi-calculator", related_slugs: ["age-calculator", "calorie-calculator", "ideal-weight-calculator"],
    category: "calculator", priority: 1, group: "health" },

  { slug: "age-calculator", name: "Age Calculator", status: "live",
    description: "Find your exact age in years, months and days from your date of birth.",
    engine_type: "age-calculator", related_slugs: ["bmi-calculator", "date-difference-calculator", "retirement-calculator"],
    category: "calculator", priority: 1, group: "health" },

  { slug: "percentage-calculator", name: "Percentage Calculator", status: "live",
    description: "Calculate percentages for marks, discounts, increases and more.",
    engine_type: "percentage-calculator", related_slugs: ["gst-calculator", "emi-calculator", "profit-margin-calculator"],
    category: "calculator", priority: 1, group: "math" },

  // ══ CALCULATORS — MISSING ═════════════════════════════════════════════════

  { slug: "compound-interest-calculator", name: "Compound Interest Calculator", status: "missing",
    description: "Calculate how investments grow with compound interest. Choose monthly, quarterly or annual compounding to see the power of reinvested returns.",
    engine_type: "compound-interest-calculator",
    related_slugs: ["sip-calculator", "fd-calculator", "simple-interest-calculator"],
    category: "calculator", priority: 1, group: "investment" },

  { slug: "simple-interest-calculator", name: "Simple Interest Calculator", status: "missing",
    description: "Calculate simple interest for any principal amount, interest rate and time period. Shows interest earned and total amount payable.",
    engine_type: "simple-interest-calculator",
    related_slugs: ["compound-interest-calculator", "emi-calculator", "loan-calculator"],
    category: "calculator", priority: 1, group: "finance" },

  { slug: "hra-calculator", name: "HRA Calculator", status: "missing",
    description: "Calculate your House Rent Allowance tax exemption under Section 10(13A). Enter salary, HRA received and rent paid to find your exempt amount.",
    engine_type: "hra-calculator",
    related_slugs: ["income-tax-calculator", "ppf-calculator", "gst-calculator"],
    category: "calculator", priority: 1, group: "tax" },

  { slug: "loan-calculator", name: "Loan Calculator", status: "missing",
    description: "Calculate loan EMI, total interest paid and total payment for any loan amount, interest rate and tenure. Works for home, car and personal loans.",
    engine_type: "loan-calculator",
    related_slugs: ["emi-calculator", "simple-interest-calculator", "compound-interest-calculator"],
    category: "calculator", priority: 1, group: "finance" },

  { slug: "discount-calculator", name: "Discount Calculator", status: "missing",
    description: "Calculate the final price after any discount percentage. Also works in reverse — find what discount was applied. Useful for shopping and pricing.",
    engine_type: "percentage-calculator", engine_config: { mode: "discount" },
    related_slugs: ["percentage-calculator", "gst-calculator", "profit-margin-calculator"],
    category: "calculator", priority: 1, group: "math" },

  { slug: "profit-margin-calculator", name: "Profit Margin Calculator", status: "missing",
    description: "Calculate gross profit margin, net margin and markup percentage. Enter cost and selling price to get all profit metrics instantly.",
    engine_type: "percentage-calculator", engine_config: { mode: "profit-margin" },
    related_slugs: ["percentage-calculator", "gst-calculator", "discount-calculator"],
    category: "calculator", priority: 1, group: "math" },

  { slug: "date-difference-calculator", name: "Date Difference Calculator", status: "missing",
    description: "Calculate the exact number of days, weeks, months and years between any two dates. Add or subtract days from a date to find a future or past date.",
    engine_type: "formula-calculator", engine_config: { preset: "datetime-difference" },
    related_slugs: ["age-calculator", "retirement-calculator", "unix-timestamp-converter"],
    category: "calculator", priority: 1, group: "utility" },

  { slug: "retirement-calculator", name: "Retirement Calculator", status: "missing",
    description: "Calculate how much corpus you need for retirement. Enter your current age, monthly expenses and expected return to plan your retirement savings.",
    engine_type: "formula-calculator", engine_config: { preset: "rate-estimator" },
    related_slugs: ["sip-calculator", "ppf-calculator", "compound-interest-calculator"],
    category: "calculator", priority: 1, group: "investment" },

  { slug: "sleep-calculator", name: "Sleep Calculator", status: "missing",
    description: "Find the best bedtime or wake-up time based on 90-minute sleep cycles. Wake up refreshed by aligning your alarm with your natural sleep rhythm.",
    engine_type: "formula-calculator", engine_config: { preset: "sleep-cycle" },
    related_slugs: ["age-calculator", "date-difference-calculator", "bmi-calculator"],
    category: "calculator", priority: 1, group: "health" },

  { slug: "calorie-calculator", name: "Calorie Calculator", status: "missing",
    description: "Calculate your daily calorie needs based on age, weight, height and activity level. Uses the Mifflin-St Jeor equation for accurate TDEE estimation.",
    engine_type: "bmi-calculator", engine_config: { mode: "calories" },
    related_slugs: ["bmi-calculator", "age-calculator", "ideal-weight-calculator"],
    category: "calculator", priority: 1, group: "health" },

  { slug: "fuel-cost-calculator", name: "Fuel Cost Calculator", status: "missing",
    description: "Calculate the fuel cost for any trip. Enter distance, fuel efficiency and price per litre to find total fuel expense for car, bike or truck.",
    engine_type: "formula-calculator", engine_config: { preset: "cost-estimator" },
    related_slugs: ["percentage-calculator", "discount-calculator", "loan-calculator"],
    category: "calculator", priority: 1, group: "utility" },

  { slug: "tip-calculator", name: "Tip Calculator", status: "missing",
    description: "Calculate tip amount and total bill per person. Split the bill easily among any number of diners with custom tip percentages.",
    engine_type: "percentage-calculator", engine_config: { mode: "tip" },
    related_slugs: ["discount-calculator", "profit-margin-calculator", "percentage-calculator"],
    category: "calculator", priority: 1, group: "math" },

  // ══ AI TOOLS — LIVE ═══════════════════════════════════════════════════════

  { slug: "ai-email-writer", name: "AI Email Writer", status: "live",
    description: "Generate polished, send-ready emails from a short description.",
    engine_type: "ai-email-writer", related_slugs: ["ai-prompt-generator", "ai-blog-outline-generator"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-prompt-generator", name: "AI Prompt Generator", status: "live",
    description: "Create better prompts for any AI tool � text, image, or code assistants.",
    engine_type: "ai-prompt-generator", related_slugs: ["ai-email-writer", "ai-blog-outline-generator"],
    category: "ai_tool", priority: 1, group: "prompt" },

  { slug: "ai-blog-outline-generator", name: "AI Blog Outline Generator", status: "live",
    description: "Generate structured blog post outlines from a topic in seconds.",
    engine_type: "ai-blog-outline-generator", related_slugs: ["ai-email-writer", "ai-prompt-generator"],
    category: "ai_tool", priority: 1, group: "content" },

  // ══ AI TOOLS — MISSING ════════════════════════════════════════════════════

  { slug: "ai-grammar-checker", name: "AI Grammar Checker", status: "missing",
    description: "Check and fix grammar, spelling and punctuation errors in any text using AI. Get corrections with explanations so you learn as you write.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "grammar-check",
      systemPrompt: "You are a professional editor. Check the user's text for grammar, spelling and punctuation errors. Return the corrected text followed by a brief list of changes made. Be clear and practical.",
      buttonLabel: "Check Grammar",
      outputLabel: "Corrected Text",
    },
    related_slugs: ["ai-paraphraser", "word-counter", "advanced-text-transformer"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-paraphraser", name: "AI Paraphraser", status: "missing",
    description: "Rewrite any text in a fresh way while keeping the original meaning. Choose your tone — formal, casual, creative or academic.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "paraphrase",
      systemPrompt: "You are a skilled writer. Rewrite the user's text to express the same meaning in different words. Keep the length similar. Do not add new information. Match the requested tone.",
      buttonLabel: "Paraphrase",
      outputLabel: "Paraphrased Text",
    },
    related_slugs: ["ai-grammar-checker", "ai-summarizer", "word-counter"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-summarizer", name: "AI Summarizer", status: "missing",
    description: "Summarize any article, document or text into concise key points. Choose bullet points or paragraph summary format.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "summarize",
      systemPrompt: "You are an expert at summarizing. Condense the user's text into a clear, concise summary. Preserve the most important points. Do not add any information not present in the original.",
      buttonLabel: "Summarize",
      outputLabel: "Summary",
    },
    related_slugs: ["ai-paraphraser", "ai-blog-outline-generator", "word-counter"],
    category: "ai_tool", priority: 1, group: "content" },

  { slug: "ai-cover-letter-writer", name: "AI Cover Letter Writer", status: "missing",
    description: "Write a compelling cover letter for any job application. Paste the job description and your experience to get a tailored letter in seconds.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "cover-letter",
      systemPrompt: "You are an expert career coach and professional writer. Write a strong, genuine cover letter based on the user's job description and background. Keep it under 350 words. Be specific, not generic. Match the company's tone where possible.",
      buttonLabel: "Write Cover Letter",
      outputLabel: "Cover Letter",
    },
    related_slugs: ["ai-email-writer", "ai-linkedin-bio-writer", "ai-grammar-checker"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-linkedin-bio-writer", name: "AI LinkedIn Bio Writer", status: "missing",
    description: "Write a professional LinkedIn About section that gets noticed. Enter your role, experience and goals for a polished, keyword-rich bio.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "linkedin-bio",
      systemPrompt: "You are a LinkedIn profile expert. Write a compelling About section for LinkedIn. Keep it under 300 words. Use first person. Be professional but human. Focus on value delivered, not just job titles. Include a clear call to action at the end.",
      buttonLabel: "Write LinkedIn Bio",
      outputLabel: "LinkedIn Bio",
    },
    related_slugs: ["ai-cover-letter-writer", "ai-email-writer", "ai-grammar-checker"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-product-description-writer", name: "AI Product Description Writer", status: "missing",
    description: "Write persuasive product descriptions for e-commerce listings. Enter product name, features and target audience to get a conversion-focused description.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "product-description",
      systemPrompt: "You are a conversion copywriter specialising in e-commerce. Write a compelling product description. Lead with the main benefit. Include key features as supporting points. End with a subtle call to action. Keep it concise and scannable.",
      buttonLabel: "Write Description",
      outputLabel: "Product Description",
    },
    related_slugs: ["ai-email-writer", "ai-blog-outline-generator", "ai-summarizer"],
    category: "ai_tool", priority: 1, group: "content" },

  { slug: "ai-tweet-generator", name: "AI Tweet Generator", status: "missing",
    description: "Generate engaging tweets and Twitter/X threads from any topic or idea. Choose between single tweet, thread or quote tweet format.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "tweet",
      systemPrompt: "You are a social media expert specialising in Twitter/X content. Write engaging, concise tweets based on the user's idea. A single tweet must be under 280 characters. For threads, number each tweet. Be punchy, direct and use hooks. No hashtag spam.",
      buttonLabel: "Generate Tweet",
      outputLabel: "Tweet",
    },
    related_slugs: ["ai-product-description-writer", "ai-email-writer", "ai-blog-outline-generator"],
    category: "ai_tool", priority: 1, group: "content" },

  { slug: "ai-youtube-description-writer", name: "AI YouTube Description Writer", status: "missing",
    description: "Write SEO-optimised YouTube video descriptions that rank and convert. Enter your video title and key points to get a description with keywords and timestamps.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "youtube-description",
      systemPrompt: "You are a YouTube SEO expert. Write a complete YouTube video description. Start with a hook in the first 2 lines (visible before 'Show more'). Include natural keywords. Add a timestamps section placeholder. End with subscribe CTA and relevant links placeholder. Make it informative and scannable.",
      buttonLabel: "Write Description",
      outputLabel: "YouTube Description",
    },
    related_slugs: ["ai-tweet-generator", "ai-blog-outline-generator", "ai-product-description-writer"],
    category: "ai_tool", priority: 1, group: "content" },

  { slug: "ai-cold-email-writer", name: "AI Cold Email Writer", status: "missing",
    description: "Write effective cold outreach emails that get replies. Enter the prospect's context and your offer to get a personalised, non-spammy email.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "cold-email",
      systemPrompt: "You are an expert in B2B sales and cold email outreach. Write a concise, personalised cold email. Lead with relevance to the prospect. Keep it under 150 words. One clear ask only. No buzzwords, no fluff. Make it human and easy to reply to.",
      buttonLabel: "Write Cold Email",
      outputLabel: "Cold Email",
    },
    related_slugs: ["ai-email-writer", "ai-cover-letter-writer", "ai-linkedin-bio-writer"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-meta-description-writer", name: "AI Meta Description Writer", status: "missing",
    description: "Write SEO meta descriptions that improve click-through rates. Enter your page title and content summary to get a compelling 155-character description.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "meta-description",
      systemPrompt: "You are an SEO copywriter. Write a compelling meta description for the user's webpage. Keep it between 145-155 characters. Include the primary keyword naturally. Make it action-oriented with a clear value proposition. Do not use clickbait.",
      buttonLabel: "Write Meta Description",
      outputLabel: "Meta Description",
    },
    related_slugs: ["ai-blog-outline-generator", "seo-slug-generator", "ai-tweet-generator"],
    category: "ai_tool", priority: 1, group: "content" },

  { slug: "ai-meeting-notes-summarizer", name: "AI Meeting Notes Summarizer", status: "missing",
    description: "Turn messy meeting notes or transcripts into clean summaries with action items. Paste your notes and get decisions, action items and key points extracted.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "meeting-summary",
      systemPrompt: "You are an expert at synthesising meeting notes. Extract and structure the following from the user's meeting notes: 1) Key decisions made, 2) Action items with owners if mentioned, 3) Key discussion points. Format clearly with headers. Be concise.",
      buttonLabel: "Summarize Meeting",
      outputLabel: "Meeting Summary",
    },
    related_slugs: ["ai-summarizer", "ai-email-writer", "word-counter"],
    category: "ai_tool", priority: 1, group: "writing" },

  { slug: "ai-resume-bullet-points", name: "AI Resume Bullet Point Writer", status: "missing",
    description: "Turn vague job responsibilities into powerful resume bullet points. Uses the STAR method to highlight impact and quantify achievements.",
    engine_type: "openai-text-tool",
    engine_config: {
      task: "resume-bullets",
      systemPrompt: "You are a professional resume writer and career coach. Rewrite the user's job descriptions as strong resume bullet points. Use action verbs. Quantify impact where possible (use placeholders like [X%] if exact numbers aren't given). Each bullet should start with a past-tense action verb. Maximum 2 lines each.",
      buttonLabel: "Write Bullets",
      outputLabel: "Resume Bullet Points",
    },
    related_slugs: ["ai-cover-letter-writer", "ai-linkedin-bio-writer", "ai-grammar-checker"],
    category: "ai_tool", priority: 1, group: "writing" },
];

// ─── Catalog helpers ──────────────────────────────────────────────────────────

export function getCatalogByStatus(status: "live" | "missing" | "planned"): CatalogEntry[] {
  return TOOL_CATALOG.filter((t) => t.status === status);
}

export function getCatalogByPriority(priority: 1 | 2 | 3): CatalogEntry[] {
  return TOOL_CATALOG.filter((t) => t.priority === priority);
}

export function getCatalogByGroup(group: string): CatalogEntry[] {
  return TOOL_CATALOG.filter((t) => t.group === group);
}

export function getMissingItems(): CatalogEntry[] {
  return TOOL_CATALOG.filter((t) => t.status === "missing" && t.priority === 1);
}

export function getMissingTools(existingSlugs: string[]): CatalogEntry[] {
  const slugSet = new Set(existingSlugs);
  return TOOL_CATALOG.filter((t) => !slugSet.has(t.slug) && t.priority === 1 && t.status === "missing");
}

export function getCatalogSlug(slug: string): CatalogEntry | undefined {
  return TOOL_CATALOG.find((t) => t.slug === slug);
}