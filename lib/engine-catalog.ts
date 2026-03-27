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
  | "qr-generator"
  | "barcode-generator"
  | "color-picker"
  | "markdown-editor"
  | "csv-to-json"
  | "ip-lookup"
  | "json-unescape"
  | "cron-builder"
  | "diff-checker"
  | "jwt-decoder"
  | "lorem-ipsum-generator"
  | "number-base-converter"
  | "html-entity-encoder"
  | "string-escape-tool"
  | "yaml-json-converter"
  | "json-to-csv"
  | "color-contrast-checker"
  | "robots-txt-generator"
  | "open-graph-tester"
  | "html-minifier"
  | "css-minifier"
  | "js-minifier"
  | "email-validator"
  | "line-sorter"
  | "box-shadow-generator"
  | "css-gradient-generator"
  | "generic-directory";

// ─── FIXED: Added all calculator engines that exist in calculator-runtime.ts ──
// Previously missing: sip, fd, ppf, hra, income-tax, compound-interest, formula
// This caused auto-generated calculators to fall through to generic-directory
// and get filtered as invisible on all public pages.
export type CalculatorEngineType =
  | "age-calculator"
  | "bmi-calculator"
  | "loan-calculator"
  | "emi-calculator"
  | "percentage-calculator"
  | "simple-interest-calculator"
  | "compound-interest-calculator"
  | "gst-calculator"
  | "sip-calculator"
  | "fd-calculator"
  | "ppf-calculator"
  | "hra-calculator"
  | "income-tax-calculator"
  | "formula-calculator"
  | "discount-calculator"
  | "tip-calculator"
  | "roi-calculator"
  | "savings-calculator"
  | "retirement-calculator"
  | "salary-calculator"
  | "calorie-calculator"
  | "fuel-cost-calculator"
  | "cagr-calculator"
  | "gratuity-calculator"
  | "rd-calculator"
  | "mortgage-calculator"
  | "sales-tax-calculator"
  | "vat-calculator"
  | "generic-directory";

export type AIToolEngineType =
  | "openai-text-tool"
  | "ai-prompt-generator"
  | "ai-email-writer"
  | "ai-blog-outline-generator"
  | "generic-directory";

export type EngineType = ToolEngineType | CalculatorEngineType | AIToolEngineType;
export type EngineConfig = Record<string, unknown>;

export type EngineOption = {
  value: EngineType;
  label: string;
};

export type CatalogEngineDefinition = {
  type: EngineType;
  category: EngineCategory;
  family: string;
  title: string;
  description: string;
  keywords: string[];
  defaultConfig: EngineConfig;
};

function createDefinition(definition: CatalogEngineDefinition): CatalogEngineDefinition {
  return definition;
}

export const ENGINE_CATALOG: Record<EngineType, CatalogEngineDefinition> = {
  "password-strength-checker": createDefinition({
    type: "password-strength-checker",
    category: "tool",
    family: "strength-checker",
    title: "Password Strength Checker",
    description: "Evaluate password strength using reusable scoring rules.",
    keywords: ["password-strength", "password strength", "password checker"],
    defaultConfig: {
      minLength: 8,
      scoringRules: ["length", "uppercase", "lowercase", "number", "symbol"],
      checks: ["length", "uppercase", "lowercase", "number", "symbol"],
    },
  }),
  "password-generator": createDefinition({
    type: "password-generator",
    category: "tool",
    family: "string-generator",
    title: "Password Generator",
    description: "Generate secure passwords using configurable character sets.",
    keywords: ["password-generator", "password generator"],
    defaultConfig: {
      mode: "password",
      minLength: 8,
      maxLength: 64,
      defaultLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    },
  }),
  "json-formatter": createDefinition({
    type: "json-formatter",
    category: "tool",
    family: "text-formatter",
    title: "JSON Formatter",
    description: "Format or minify JSON using one reusable formatter family.",
    keywords: ["json-formatter", "json formatter", "json-pretty", "json-minify"],
    defaultConfig: {
      mode: "json",
      allowMinify: true,
    },
  }),
  "word-counter": createDefinition({
    type: "word-counter",
    category: "tool",
    family: "text-analyzer",
    title: "Word Counter",
    description: "Analyze text metrics like words, characters, and reading time.",
    keywords: [
      "word-counter",
      "word counter",
      "character-counter",
      "character counter",
      "reading-time",
      "reading time",
      "text-counter",
      "text counter",
    ],
    defaultConfig: {
      readingWordsPerMinute: 200,
    },
  }),
  "uuid-generator": createDefinition({
    type: "uuid-generator",
    category: "tool",
    family: "string-generator",
    title: "UUID Generator",
    description: "Generate browser-side UUID values.",
    keywords: ["uuid-generator", "uuid"],
    defaultConfig: {
      mode: "uuid",
    },
  }),
  "slug-generator": createDefinition({
    type: "slug-generator",
    category: "tool",
    family: "string-generator",
    title: "Slug Generator",
    description: "Generate URL-friendly slugs from any text.",
    keywords: ["slug-generator", "slug generator", "url-slug"],
    defaultConfig: {
      mode: "slug",
    },
  }),
  "random-string-generator": createDefinition({
    type: "random-string-generator",
    category: "tool",
    family: "string-generator",
    title: "Random String Generator",
    description: "Generate random strings with configurable characters and length.",
    keywords: ["random-string-generator", "random string generator", "string generator"],
    defaultConfig: {
      mode: "random-string",
      minLength: 4,
      maxLength: 128,
      defaultLength: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
    },
  }),
  "base64-encoder": createDefinition({
    type: "base64-encoder",
    category: "tool",
    family: "codec",
    title: "Base64 Encoder",
    description: "Encode text or data to Base64 format.",
    keywords: ["base64-encoder", "base64 encoder", "base64 encode"],
    defaultConfig: {
      mode: "encode",
    },
  }),
  "base64-decoder": createDefinition({
    type: "base64-decoder",
    category: "tool",
    family: "codec",
    title: "Base64 Decoder",
    description: "Decode Base64 data back into readable text.",
    keywords: ["base64-decoder", "base64 decoder", "base64 decode"],
    defaultConfig: {
      mode: "decode",
    },
  }),
  "url-encoder": createDefinition({
    type: "url-encoder",
    category: "tool",
    family: "codec",
    title: "URL Encoder",
    description: "Percent-encode URLs for safe transmission.",
    keywords: ["url-encoder", "url encoder", "url encode", "percent-encode"],
    defaultConfig: {
      mode: "encode",
    },
  }),
  "url-decoder": createDefinition({
    type: "url-decoder",
    category: "tool",
    family: "codec",
    title: "URL Decoder",
    description: "Decode percent-encoded URLs back to readable text.",
    keywords: ["url-decoder", "url decoder", "url decode"],
    defaultConfig: {
      mode: "decode",
    },
  }),
  "text-case-converter": createDefinition({
    type: "text-case-converter",
    category: "tool",
    family: "text-formatter",
    title: "Text Case Converter",
    description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case.",
    keywords: [
      "text-case-converter",
      "text case converter",
      "case-converter",
      "uppercase",
      "lowercase",
      "title-case",
    ],
    defaultConfig: {},
  }),
  "code-formatter": createDefinition({
    type: "code-formatter",
    category: "tool",
    family: "text-formatter",
    title: "Code Formatter",
    description: "Format source code with proper indentation and structure.",
    keywords: ["code-formatter", "code formatter", "code beautifier"],
    defaultConfig: {},
  }),
  "code-snippet-manager": createDefinition({
    type: "code-snippet-manager",
    category: "tool",
    family: "text-formatter",
    title: "Code Snippet Manager",
    description: "Save and retrieve reusable code snippets.",
    keywords: ["code-snippet-manager", "code snippet", "snippet manager"],
    defaultConfig: {},
  }),
  "text-transformer": createDefinition({
    type: "text-transformer",
    category: "tool",
    family: "text-formatter",
    title: "Text Transformer",
    description: "Transform text by reversing, trimming, removing blanks, deduplicating lines.",
    keywords: ["text-transformer", "text transformer", "text transform"],
    defaultConfig: {},
  }),
  "number-generator": createDefinition({
    type: "number-generator",
    category: "tool",
    family: "string-generator",
    title: "Random Number Generator",
    description: "Generate random numbers in a configurable range.",
    keywords: ["number-generator", "number generator", "random number"],
    defaultConfig: {
      min: 1,
      max: 100,
      count: 1,
    },
  }),
  "unit-converter": createDefinition({
    type: "unit-converter",
    category: "tool",
    family: "unit-converter",
    title: "Unit Converter",
    description: "Convert between units of length, weight, temperature and volume.",
    keywords: ["unit-converter", "unit converter", "measurement converter"],
    defaultConfig: {},
  }),
  "currency-converter": createDefinition({
    type: "currency-converter",
    category: "tool",
    family: "currency-converter",
    title: "Currency Converter",
    description: "Convert between currencies using live exchange rates.",
    keywords: ["currency-converter", "currency converter", "exchange rate"],
    defaultConfig: {},
  }),
  "regex-tester": createDefinition({
    type: "regex-tester",
    category: "tool",
    family: "regex-tools",
    title: "Regex Tester",
    description: "Test regular expressions against text with real-time match highlighting.",
    keywords: ["regex-tester", "regex tester", "regular expression tester"],
    defaultConfig: {},
  }),
  "regex-extractor": createDefinition({
    type: "regex-extractor",
    category: "tool",
    family: "regex-tools",
    title: "Regex Extractor",
    description: "Extract matching groups from text using regex patterns.",
    keywords: ["regex-extractor", "regex extractor", "match extractor"],
    defaultConfig: {},
  }),
  "sha256-generator": createDefinition({
    type: "sha256-generator",
    category: "tool",
    family: "hash-tools",
    title: "SHA-256 Hash Generator",
    description: "Generate SHA-256 cryptographic hashes from any text input.",
    keywords: ["sha256-generator", "sha256 generator", "sha-256", "hash generator"],
    defaultConfig: {},
  }),
  "md5-generator": createDefinition({
    type: "md5-generator",
    category: "tool",
    family: "hash-tools",
    title: "MD5 Hash Generator",
    description: "Generate MD5 hashes from text input.",
    keywords: ["md5-generator", "md5 generator", "md5 hash"],
    defaultConfig: {},
  }),
  "timestamp-converter": createDefinition({
    type: "timestamp-converter",
    category: "tool",
    family: "timestamp-tools",
    title: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa.",
    keywords: ["timestamp-converter", "timestamp converter", "unix timestamp", "epoch converter"],
    defaultConfig: {},
  }),
  "hex-to-rgb": createDefinition({
    type: "hex-to-rgb",
    category: "tool",
    family: "color-tools",
    title: "HEX to RGB Converter",
    description: "Convert HEX color codes to RGB values.",
    keywords: ["hex-to-rgb", "hex to rgb", "color converter"],
    defaultConfig: {},
  }),
  "rgb-to-hex": createDefinition({
    type: "rgb-to-hex",
    category: "tool",
    family: "color-tools",
    title: "RGB to HEX Converter",
    description: "Convert RGB color values to HEX codes.",
    keywords: ["rgb-to-hex", "rgb to hex", "color converter"],
    defaultConfig: {},
  }),
  "text-to-binary": createDefinition({
    type: "text-to-binary",
    category: "tool",
    family: "codec",
    title: "Text to Binary Converter",
    description: "Convert plain text to binary representation.",
    keywords: ["text-to-binary", "text to binary", "binary converter"],
    defaultConfig: {},
  }),
  "binary-to-text": createDefinition({
    type: "binary-to-text",
    category: "tool",
    family: "codec",
    title: "Binary to Text Converter",
    description: "Convert binary code back to readable text.",
    keywords: ["binary-to-text", "binary to text", "binary decoder"],
    defaultConfig: {},
  }),
  "json-escape": createDefinition({
    type: "json-escape",
    category: "tool",
    family: "developer-converters",
    title: "JSON Escape",
    description: "Escape text safely for JSON string usage.",
    keywords: ["json-escape", "json escape"],
    defaultConfig: {
      mode: "json-escape",
    },
  }),
  "json-unescape": createDefinition({
    type: "json-unescape",
    category: "tool",
    family: "developer-converters",
    title: "JSON Unescape",
    description: "Unescape JSON string values back into readable text.",
    keywords: ["json-unescape", "json unescape"],
    defaultConfig: {
      mode: "json-unescape",
    },
  }),
  "qr-generator": createDefinition({
    type: "qr-generator",
    category: "tool",
    family: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from URLs, text or any content.",
    keywords: ["qr-generator", "qr code generator", "qr code"],
    defaultConfig: {},
  }),
  "color-picker": createDefinition({
    type: "color-picker",
    category: "tool",
    family: "color-tools",
    title: "Color Picker",
    description: "Pick colors visually and get HEX, RGB, HSL values.",
    keywords: ["color-picker", "color picker", "colour picker"],
    defaultConfig: {},
  }),
  "markdown-editor": createDefinition({
    type: "markdown-editor",
    category: "tool",
    family: "markdown-editor",
    title: "Markdown Editor",
    description: "Write Markdown with live HTML preview.",
    keywords: ["markdown-editor", "markdown editor", "markdown preview"],
    defaultConfig: {},
  }),
  "csv-to-json": createDefinition({
    type: "csv-to-json",
    category: "tool",
    family: "csv-to-json",
    title: "CSV to JSON Converter",
    description: "Convert CSV data to JSON with auto-delimiter detection.",
    keywords: ["csv-to-json", "csv to json", "csv json converter"],
    defaultConfig: {},
  }),
  "ip-lookup": createDefinition({
    type: "ip-lookup",
    category: "tool",
    family: "ip-lookup",
    title: "IP Address Lookup",
    description: "Look up location, ISP and timezone for any IP address.",
    keywords: ["ip-lookup", "ip lookup", "ip address lookup"],
    defaultConfig: {},
  }),

  "barcode-generator": createDefinition({
    type: "barcode-generator",
    category: "tool",
    family: "qr-generator",
    title: "Barcode Generator",
    description: "Generate barcodes in Code128, EAN-13, and QR formats instantly in your browser.",
    keywords: ["barcode generator", "barcode", "code128", "ean13", "barcode online"],
    defaultConfig: { format: "code128" },
  }),

  // ─── NEW DEVELOPER / UTILITY TOOLS ───────────────────────────────────────

  "cron-builder": createDefinition({
    type: "cron-builder",
    category: "tool",
    family: "cron-builder",
    title: "Cron Expression Builder",
    description: "Build, validate and understand cron schedule expressions with a visual editor.",
    keywords: ["cron-builder", "cron expression", "cron schedule", "cron-expression-builder", "cron generator"],
    defaultConfig: {},
  }),

  "diff-checker": createDefinition({
    type: "diff-checker",
    category: "tool",
    family: "diff-checker",
    title: "Text Diff Checker",
    description: "Compare two texts side-by-side and highlight added or removed lines.",
    keywords: ["diff-checker", "text diff", "compare text", "diff tool"],
    defaultConfig: {},
  }),

  "jwt-decoder": createDefinition({
    type: "jwt-decoder",
    category: "tool",
    family: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens — view header, payload and expiry instantly.",
    keywords: ["jwt-decoder", "jwt decode", "json web token", "jwt inspector"],
    defaultConfig: {},
  }),

  "lorem-ipsum-generator": createDefinition({
    type: "lorem-ipsum-generator",
    category: "tool",
    family: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder lorem ipsum text by paragraphs, sentences or words.",
    keywords: ["lorem-ipsum", "lorem ipsum generator", "placeholder text", "dummy text"],
    defaultConfig: {},
  }),

  "number-base-converter": createDefinition({
    type: "number-base-converter",
    category: "tool",
    family: "number-base-converter",
    title: "Number Base Converter",
    description: "Convert numbers between decimal, binary, hexadecimal and octal instantly.",
    keywords: ["number-base-converter", "binary converter", "hex converter", "base converter", "decimal to binary"],
    defaultConfig: {},
  }),

  "html-entity-encoder": createDefinition({
    type: "html-entity-encoder",
    category: "tool",
    family: "html-entity-encoder",
    title: "HTML Entity Encoder",
    description: "Encode and decode HTML entities like &amp; &lt; &gt; for safe use in web pages.",
    keywords: ["html-entity-encoder", "html entities", "html encode", "html decode"],
    defaultConfig: {},
  }),

  "string-escape-tool": createDefinition({
    type: "string-escape-tool",
    category: "tool",
    family: "string-escape-tool",
    title: "String Escape Tool",
    description: "Escape and unescape strings for JSON, JavaScript, HTML and SQL formats.",
    keywords: ["string-escape", "escape string", "json escape", "string escaper"],
    defaultConfig: {},
  }),

  "yaml-json-converter": createDefinition({
    type: "yaml-json-converter",
    category: "tool",
    family: "yaml-json-converter",
    title: "YAML ↔ JSON Converter",
    description: "Convert YAML to JSON and JSON to YAML instantly in the browser.",
    keywords: ["yaml-to-json", "json-to-yaml", "yaml json converter", "yaml converter"],
    defaultConfig: {},
  }),

  "json-to-csv": createDefinition({
    type: "json-to-csv",
    category: "tool",
    family: "json-to-csv",
    title: "JSON to CSV Converter",
    description: "Convert JSON arrays to CSV format with configurable delimiters and copy-ready output.",
    keywords: ["json-to-csv", "json csv", "convert json to csv"],
    defaultConfig: {},
  }),

  "robots-txt-generator": createDefinition({
    type: "robots-txt-generator",
    category: "tool",
    family: "robots-txt-generator",
    title: "Robots.txt Generator",
    description: "Generate a valid robots.txt file for your website with a visual builder.",
    keywords: ["robots-txt", "robots.txt generator", "robotstxt", "seo robots"],
    defaultConfig: {},
  }),

  "open-graph-tester": createDefinition({
    type: "open-graph-tester",
    category: "tool",
    family: "open-graph-tester",
    title: "Open Graph Preview",
    description: "Preview how your page looks when shared on social media. Check OG tags instantly.",
    keywords: ["open-graph", "og-preview", "og tester", "opengraph", "social preview"],
    defaultConfig: {},
  }),

  "color-contrast-checker": createDefinition({
    type: "color-contrast-checker",
    category: "tool",
    family: "color-contrast-checker",
    title: "Color Contrast Checker",
    description: "Check WCAG AA and AAA color contrast ratios for accessible web design.",
    keywords: ["color-contrast-checker", "contrast ratio", "wcag contrast", "accessibility contrast"],
    defaultConfig: {},
  }),

  // ─── CALCULATORS ──────────────────────────────────────────────────────────

  "age-calculator": createDefinition({
    type: "age-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Age Calculator",
    description: "Calculate exact age from a birth date.",
    keywords: ["age-calculator", "age calculator"],
    defaultConfig: {},
  }),
  "bmi-calculator": createDefinition({
    type: "bmi-calculator",
    category: "calculator",
    family: "health-calculator",
    title: "BMI Calculator",
    description: "Calculate body mass index from height and weight.",
    keywords: ["bmi-calculator", "bmi calculator", "body mass index"],
    defaultConfig: {},
  }),
  "loan-calculator": createDefinition({
    type: "loan-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Loan Calculator",
    description: "Calculate loan repayment, total interest and monthly payments.",
    keywords: ["loan-calculator", "loan calculator"],
    defaultConfig: {},
  }),
  "emi-calculator": createDefinition({
    type: "emi-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "EMI Calculator",
    description: "Calculate equated monthly instalments for any loan.",
    keywords: ["emi-calculator", "emi calculator"],
    defaultConfig: {},
  }),
  "percentage-calculator": createDefinition({
    type: "percentage-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Percentage Calculator",
    description: "Calculate percentages, increases, decreases and differences.",
    keywords: ["percentage-calculator", "percentage calculator"],
    defaultConfig: {},
  }),
  "simple-interest-calculator": createDefinition({
    type: "simple-interest-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Simple Interest Calculator",
    description: "Calculate simple interest for any principal, rate and time.",
    keywords: ["simple-interest-calculator", "simple interest", "interest calculator"],
    defaultConfig: {},
  }),
  // ─── NEWLY ADDED to type union ─────────────────────────────────────────────
  "compound-interest-calculator": createDefinition({
    type: "compound-interest-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Compound Interest Calculator",
    description: "Calculate compound interest with configurable compounding frequency.",
    keywords: ["compound-interest-calculator", "compound interest", "compound calculator"],
    defaultConfig: {},
  }),
  "gst-calculator": createDefinition({
    type: "gst-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "GST Calculator",
    description: "Calculate GST-inclusive and GST-exclusive amounts instantly.",
    keywords: ["gst-calculator", "gst calculator"],
    defaultConfig: {},
  }),
  "sip-calculator": createDefinition({
    type: "sip-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "SIP Calculator",
    description: "Calculate SIP returns for mutual fund investments.",
    keywords: ["sip-calculator", "sip calculator", "systematic investment plan"],
    defaultConfig: {},
  }),
  "fd-calculator": createDefinition({
    type: "fd-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "FD Calculator",
    description: "Calculate fixed deposit maturity amount and interest earned.",
    keywords: ["fd-calculator", "fd calculator", "fixed deposit calculator"],
    defaultConfig: {},
  }),
  "ppf-calculator": createDefinition({
    type: "ppf-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "PPF Calculator",
    description: "Calculate PPF maturity amount with annual contributions.",
    keywords: ["ppf-calculator", "ppf calculator", "public provident fund"],
    defaultConfig: {},
  }),
  "hra-calculator": createDefinition({
    type: "hra-calculator",
    category: "calculator",
    family: "tax-calculator",
    title: "HRA Calculator",
    description: "Calculate House Rent Allowance tax exemption.",
    keywords: ["hra-calculator", "hra calculator", "house rent allowance"],
    defaultConfig: {},
  }),
  "income-tax-calculator": createDefinition({
    type: "income-tax-calculator",
    category: "calculator",
    family: "tax-calculator",
    title: "Income Tax Calculator",
    description: "Estimate income tax under old and new tax regime.",
    keywords: ["income-tax-calculator", "income tax calculator", "tax calculator"],
    defaultConfig: {},
  }),
  "formula-calculator": createDefinition({
    type: "formula-calculator",
    category: "calculator",
    family: "formula-calculator",
    title: "Formula Calculator",
    description: "Evaluate mathematical formulas and expressions with configurable presets.",
    keywords: ["formula-calculator", "formula calculator"],
    defaultConfig: {},
  }),

  // ─── AI TOOLS ─────────────────────────────────────────────────────────────

  "openai-text-tool": createDefinition({
    type: "openai-text-tool",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "OpenAI Text Tool",
    description: "Generate text output using a prompt-driven AI workflow.",
    keywords: ["openai-text-tool", "openai", "ai tool", "ai text"],
    defaultConfig: {},
  }),
  "ai-prompt-generator": createDefinition({
    type: "ai-prompt-generator",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "AI Prompt Generator",
    description: "Generate prompts for different AI workflows.",
    keywords: ["ai-prompt-generator", "prompt generator", "ai prompt"],
    defaultConfig: {
      task: "rewrite",
      outputType: "text",
    },
  }),
  "ai-email-writer": createDefinition({
    type: "ai-email-writer",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "AI Email Writer",
    description: "Generate draft emails from short instructions.",
    keywords: ["ai-email-writer", "email writer", "email generator"],
    defaultConfig: {
      task: "email",
      outputType: "text",
      tone: "professional",
    },
  }),
  "ai-blog-outline-generator": createDefinition({
    type: "ai-blog-outline-generator",
    category: "ai-tool",
    family: "ai-text-tool",
    title: "AI Blog Outline Generator",
    description: "Generate blog post outline ideas from a topic.",
    keywords: ["ai-blog-outline-generator", "blog outline generator", "outline generator"],
    defaultConfig: {
      task: "outline",
      outputType: "text",
      tone: "clear",
    },
  }),
  "discount-calculator": createDefinition({
    type: "discount-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Discount Calculator",
    description: "Calculate discounted price, savings amount and percentage off.",
    keywords: ["discount-calculator", "discount calculator", "percentage off", "sale price"],
    defaultConfig: {},
  }),
  "tip-calculator": createDefinition({
    type: "tip-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Tip Calculator",
    description: "Calculate tip amount, total bill and per-person split.",
    keywords: ["tip-calculator", "tip calculator", "bill split", "restaurant tip"],
    defaultConfig: {},
  }),
  "roi-calculator": createDefinition({
    type: "roi-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "ROI Calculator",
    description: "Calculate return on investment as a percentage and absolute gain.",
    keywords: ["roi-calculator", "roi calculator", "return on investment"],
    defaultConfig: {},
  }),
  "savings-calculator": createDefinition({
    type: "savings-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "Savings Calculator",
    description: "Project savings growth over time with monthly contributions and interest.",
    keywords: ["savings-calculator", "savings calculator", "savings growth"],
    defaultConfig: {},
  }),
  "retirement-calculator": createDefinition({
    type: "retirement-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "Retirement Calculator",
    description: "Estimate retirement corpus needed based on age, income and expenses.",
    keywords: ["retirement-calculator", "retirement calculator", "retirement planning"],
    defaultConfig: {},
  }),
  "salary-calculator": createDefinition({
    type: "salary-calculator",
    category: "calculator",
    family: "salary-calculator",
    title: "Salary Calculator",
    description: "Calculate your in-hand salary from CTC with PF, PT, and HRA breakdowns for India.",
    keywords: ["salary calculator", "ctc calculator", "take home salary", "in hand salary india"],
    defaultConfig: {},
  }),
  "calorie-calculator": createDefinition({
    type: "calorie-calculator",
    category: "calculator",
    family: "health-calculator",
    title: "Calorie Calculator",
    description: "Calculate daily calorie needs based on age, weight, height and activity level.",
    keywords: ["calorie-calculator", "calorie calculator", "tdee", "daily calories"],
    defaultConfig: {},
  }),
  "fuel-cost-calculator": createDefinition({
    type: "fuel-cost-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Fuel Cost Calculator",
    description: "Estimate fuel cost for a trip based on distance, mileage and fuel price.",
    keywords: ["fuel-cost-calculator", "fuel calculator", "petrol cost", "trip cost"],
    defaultConfig: {},
  }),
  "cagr-calculator": createDefinition({
    type: "cagr-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "CAGR Calculator",
    description: "Calculate compound annual growth rate between an initial and final value.",
    keywords: ["cagr-calculator", "cagr calculator", "compound annual growth", "investment growth"],
    defaultConfig: {},
  }),
  "gratuity-calculator": createDefinition({
    type: "gratuity-calculator",
    category: "calculator",
    family: "tax-calculator",
    title: "Gratuity Calculator",
    description: "Calculate gratuity amount payable as per Indian Payment of Gratuity Act.",
    keywords: ["gratuity-calculator", "gratuity calculator", "gratuity amount"],
    defaultConfig: {},
  }),
  "rd-calculator": createDefinition({
    type: "rd-calculator",
    category: "calculator",
    family: "investment-calculator",
    title: "RD Calculator",
    description: "Calculate recurring deposit maturity amount and interest earned.",
    keywords: ["rd-calculator", "rd calculator", "recurring deposit"],
    defaultConfig: {},
  }),
  "html-minifier": createDefinition({
    type: "html-minifier",
    category: "tool",
    family: "html-minifier",
    title: "HTML Minifier",
    description: "Minify HTML by removing comments, whitespace and optional tags.",
    keywords: ["html-minifier", "minify html", "html minify", "html compressor", "html-compress"],
    defaultConfig: { mode: "html" },
  }),
  "css-minifier": createDefinition({
    type: "css-minifier",
    category: "tool",
    family: "css-minifier",
    title: "CSS Minifier",
    description: "Minify CSS by removing whitespace and comments.",
    keywords: ["css-minifier", "minify css", "css minify", "css compressor", "css-compress"],
    defaultConfig: { mode: "css" },
  }),
  "js-minifier": createDefinition({
    type: "js-minifier",
    category: "tool",
    family: "js-minifier",
    title: "JavaScript Minifier",
    description: "Minify JavaScript by removing whitespace and comments.",
    keywords: ["js-minifier", "javascript-minifier", "minify js", "minify javascript", "js-compress"],
    defaultConfig: { mode: "js" },
  }),
  "email-validator": createDefinition({
    type: "email-validator",
    category: "tool",
    family: "email-validator",
    title: "Email Validator",
    description: "Validate email addresses instantly. Bulk validate a list at once.",
    keywords: ["email-validator", "email validator", "validate email", "email-checker", "email-verify"],
    defaultConfig: {},
  }),
  "line-sorter": createDefinition({
    type: "line-sorter",
    category: "tool",
    family: "line-sorter",
    title: "Line Counter & Sorter",
    description: "Count lines, sort text, remove duplicates and blank lines.",
    keywords: ["line-counter", "line-sorter", "line counter", "sort lines", "remove duplicates", "text-sorter"],
    defaultConfig: {},
  }),
  "box-shadow-generator": createDefinition({
    type: "box-shadow-generator",
    category: "tool",
    family: "box-shadow-generator",
    title: "Box Shadow Generator",
    description: "Generate CSS box-shadow effects visually with live preview.",
    keywords: ["box-shadow-generator", "box shadow", "css shadow", "drop shadow", "shadow-generator"],
    defaultConfig: {},
  }),
  "css-gradient-generator": createDefinition({
    type: "css-gradient-generator",
    category: "tool",
    family: "css-gradient-generator",
    title: "CSS Gradient Generator",
    description: "Generate linear and radial CSS gradients visually.",
    keywords: ["css-gradient-generator", "gradient generator", "css gradient", "linear-gradient", "radial-gradient"],
    defaultConfig: {},
  }),
  "mortgage-calculator": createDefinition({
    type: "mortgage-calculator",
    category: "calculator",
    family: "finance-calculator",
    title: "Mortgage Calculator",
    description: "Calculate monthly mortgage payments, total interest and repayment schedule.",
    keywords: ["mortgage-calculator", "mortgage calculator", "home-loan", "home loan calculator"],
    defaultConfig: {},
  }),
  "sales-tax-calculator": createDefinition({
    type: "sales-tax-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "Sales Tax Calculator",
    description: "Calculate sales tax for any rate. Add tax or extract it from inclusive price.",
    keywords: ["sales-tax-calculator", "sales tax", "tax calculator", "sales-tax"],
    defaultConfig: {},
  }),
  "vat-calculator": createDefinition({
    type: "vat-calculator",
    category: "calculator",
    family: "math-calculator",
    title: "VAT Calculator",
    description: "Calculate VAT for any rate. Add VAT to a price or extract it from a VAT-inclusive amount.",
    keywords: ["vat-calculator", "vat calculator", "value added tax", "vat"],
    defaultConfig: {},
  }),
  "generic-directory": createDefinition({
    type: "generic-directory",
    category: "tool",
    family: "generic-directory",
    title: "Tool Interface",
    description: "This page is live and ready for a dedicated engine later.",
    keywords: [],
    defaultConfig: {},
  }),
};


const TOOL_ENGINE_ORDER: ToolEngineType[] = [
  "password-strength-checker",
  "password-generator",
  "json-formatter",
  "word-counter",
  "uuid-generator",
  "slug-generator",
  "random-string-generator",
  "base64-encoder",
  "base64-decoder",
  "url-encoder",
  "url-decoder",
  "text-case-converter",
  "code-formatter",
  "code-snippet-manager",
  "text-transformer",
  "number-generator",
  "unit-converter",
  "currency-converter",
  "regex-tester",
  "regex-extractor",
  "sha256-generator",
  "md5-generator",
  "timestamp-converter",
  "hex-to-rgb",
  "rgb-to-hex",
  "text-to-binary",
  "binary-to-text",
  "json-escape",
  "json-unescape",
  "qr-generator",
  "barcode-generator",
  "color-picker",
  "markdown-editor",
  "csv-to-json",
  "ip-lookup",
  "html-minifier",
  "css-minifier",
  "js-minifier",
  "email-validator",
  "line-sorter",
  "box-shadow-generator",
  "css-gradient-generator",
  "generic-directory",
];

const CALCULATOR_ENGINE_ORDER: CalculatorEngineType[] = [
  "age-calculator",
  "bmi-calculator",
  "loan-calculator",
  "emi-calculator",
  "percentage-calculator",
  "simple-interest-calculator",
  "compound-interest-calculator",
  "gst-calculator",
  "sip-calculator",
  "fd-calculator",
  "ppf-calculator",
  "hra-calculator",
  "income-tax-calculator",
  "formula-calculator",
  "discount-calculator",
  "tip-calculator",
  "roi-calculator",
  "savings-calculator",
  "retirement-calculator",
  "salary-calculator",
  "calorie-calculator",
  "fuel-cost-calculator",
  "cagr-calculator",
  "gratuity-calculator",
  "rd-calculator",
  "mortgage-calculator",
  "sales-tax-calculator",
  "vat-calculator",
  "generic-directory",
];

const AI_ENGINE_ORDER: AIToolEngineType[] = [
  "openai-text-tool",
  "ai-prompt-generator",
  "ai-email-writer",
  "ai-blog-outline-generator",
  "generic-directory",
];

export const ENGINE_OPTIONS: Record<EngineCategory, EngineOption[]> = {
  tool: TOOL_ENGINE_ORDER.map((type) => ({ value: type, label: ENGINE_CATALOG[type].title })),
  calculator: CALCULATOR_ENGINE_ORDER.map((type) => ({
    value: type,
    label: ENGINE_CATALOG[type].title,
  })),
  "ai-tool": AI_ENGINE_ORDER.map((type) => ({ value: type, label: ENGINE_CATALOG[type].title })),
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

function includesAll(value: string, parts: string[]) {
  return parts.every((part) => value.includes(part));
}

function includesAny(value: string, parts: string[]) {
  return parts.some((part) => value.includes(part));
}

export function inferEngineType(category: EngineCategory, slug: string): EngineType | null {
  const value = safeSlug(slug);

  if (!value) {
    return "generic-directory";
  }

  if (category === "tool") {
    if (value === "qr-code-generator" || value.includes("qr-code") || (value.includes("qr") && value.includes("generator"))) return "qr-generator";
    if (value.includes("barcode")) return "barcode-generator";
    if (value === "color-picker" || value.includes("color-picker") || value === "colour-picker") return "color-picker";
    if (value === "markdown-editor" || value.includes("markdown-editor") || value.includes("markdown-preview")) return "markdown-editor";
    if (value === "csv-to-json" || value.includes("csv-to-json") || value.includes("csv-json")) return "csv-to-json";
    if (value === "ip-lookup" || value.includes("ip-lookup") || value.includes("ip-address-lookup") || value === "ip-checker") return "ip-lookup";
    if (value.includes("password-strength")) return "password-strength-checker";
    if (value === "password-generator" || includesAll(value, ["password", "generator"])) {
      return "password-generator";
    }

    if (
      value.includes("json-formatter") ||
      value.includes("json-pretty") ||
      value.includes("json-minify")
    ) {
      return "json-formatter";
    }

    if (
      includesAny(value, [
        "word-counter",
        "character-counter",
        "reading-time",
        "content-length",
        "text-counter",
      ])
    ) {
      return "word-counter";
    }

    if (value.includes("uuid")) return "uuid-generator";
    if (value === "slug-generator" || includesAll(value, ["slug", "generator"])) {
      return "slug-generator";
    }
    if (value.includes("random-string") || value.includes("string-generator")) {
      return "random-string-generator";
    }

    if (value === "base64-encoder" || includesAll(value, ["base64", "encode"])) {
      return "base64-encoder";
    }
    if (value === "base64-decoder" || includesAll(value, ["base64", "decode"])) {
      return "base64-decoder";
    }

    if (value === "url-encoder" || includesAll(value, ["url", "encode"])) return "url-encoder";
    if (value === "url-decoder" || includesAll(value, ["url", "decode"])) return "url-decoder";

    if (
      value === "text-case-converter" ||
      value.includes("case-converter") ||
      includesAny(value, [
        "uppercase",
        "lowercase",
        "sentence-case",
        "title-case",
        "case-style",
      ])
    ) {
      return "text-case-converter";
    }

    if (value === "code-formatter" || value.includes("code-formatter")) return "code-formatter";
    if (value === "code-snippet-manager" || value.includes("snippet-manager")) {
      return "code-snippet-manager";
    }

    if (value.includes("text") && value.includes("transform")) return "text-transformer";
    if (value.includes("number") && value.includes("generator")) return "number-generator";

    if (value === "currency-converter") return "currency-converter";

    if (
      value === "unit-converter" ||
      includesAny(value, [
        "meter-to",
        "meters-to",
        "feet-to",
        "foot-to",
        "inch-to",
        "inches-to",
        "cm-to",
        "mm-to",
        "km-to",
        "mile-to",
        "miles-to",
        "yard-to",
        "yards-to",
        "length-converter",
        "distance-converter",
        "unit-converter",
      ])
    ) {
      return "unit-converter";
    }

    if (value === "regex-tester" || value.includes("regex-test")) return "regex-tester";
    if (
      value === "regex-extractor" ||
      value.includes("regex-extract") ||
      value.includes("match-extractor")
    ) {
      return "regex-extractor";
    }

    if (value.includes("sha256")) return "sha256-generator";
    if (value.includes("md5")) return "md5-generator";

    if (includesAny(value, ["timestamp", "unix-time", "unix-timestamp", "date-converter"])) {
      return "timestamp-converter";
    }

    if (value.includes("hex-to-rgb")) return "hex-to-rgb";
    if (value.includes("rgb-to-hex")) return "rgb-to-hex";
    if (value.includes("text-to-binary")) return "text-to-binary";
    if (value.includes("binary-to-text")) return "binary-to-text";
    if (value.includes("json-escape")) return "json-escape";
    if (value.includes("json-unescape")) return "json-unescape";

    // ─── New tool engines ─────────────────────────────────────────────────────
    if (value.includes("cron-expression") || value.includes("cron-builder") || value === "cron-expression-builder") return "cron-builder";
    if (value.includes("diff-checker") || value.includes("text-diff") || value.includes("compare-text")) return "diff-checker";
    if (value.includes("jwt-decoder") || value.includes("jwt-decode") || value.includes("json-web-token")) return "jwt-decoder";
    if (value.includes("lorem-ipsum") || value.includes("placeholder-text") || value.includes("dummy-text")) return "lorem-ipsum-generator";
    if (value.includes("number-base") || value.includes("base-converter") || (value.includes("binary") && value.includes("converter")) || value.includes("hex-converter")) return "number-base-converter";
    if (value.includes("html-entity") || value.includes("html-encode") || value.includes("html-decode")) return "html-entity-encoder";
    if (value.includes("string-escape") || value.includes("escape-tool") || value.includes("string-escaper")) return "string-escape-tool";
    if (value.includes("yaml-to-json") || value.includes("json-to-yaml") || value.includes("yaml-json") || value.includes("yaml-converter")) return "yaml-json-converter";
    if (value === "json-to-csv" || value.includes("json-to-csv") || value.includes("json-csv")) return "json-to-csv";
    if (value.includes("color-contrast") || value.includes("contrast-checker") || value.includes("contrast-ratio") || value.includes("wcag-contrast")) return "color-contrast-checker";
    if (value.includes("robots-txt") || value.includes("robots-txt-generator") || value.includes("robotstxt")) return "robots-txt-generator";
    if (value.includes("open-graph") || value.includes("og-preview") || value.includes("og-tester") || value.includes("opengraph")) return "open-graph-tester";

    // ─── New dedicated engines ───────────────────────────────────────────────────
    if (value.includes("html-minifier") || value.includes("minify-html") || value.includes("html-compress")) return "html-minifier";
    if (value.includes("css-minifier") || value.includes("minify-css") || value.includes("css-compress")) return "css-minifier";
    if (value.includes("js-minifier") || value.includes("javascript-minifier") || value.includes("minify-js") || value.includes("minify-javascript")) return "js-minifier";
    if (value.includes("email-validator") || value.includes("email-checker") || value.includes("validate-email") || value.includes("email-verify")) return "email-validator";
    if (value.includes("line-counter") || value.includes("line-sorter") || value.includes("line-count") || value.includes("sort-lines") || value.includes("text-sorter")) return "line-sorter";
    if (value.includes("box-shadow") || value.includes("shadow-generator") || value.includes("drop-shadow")) return "box-shadow-generator";
    if (value.includes("css-gradient") || value.includes("gradient-generator") || value.includes("linear-gradient") || value.includes("gradient-maker")) return "css-gradient-generator";

    // ─── Extended slug coverage for auto-generated tools ──────────────────────
    if (value.includes("email-validator") || value.includes("email-checker") || value.includes("email-verify")) return "regex-tester";
    if (value.includes("line-counter") || value.includes("line-count") || value.includes("word-frequency") || value.includes("text-statistics")) return "word-counter";
    if (value.includes("text-repeater") || value.includes("text-duplicator") || value.includes("repeat-text")) return "text-transformer";
    if (value.includes("camel-to-kebab") || value.includes("kebab-to-camel") || value.includes("snake-to-camel") || value.includes("naming-converter")) return "text-case-converter";
    if (value.includes("text-to-slug") || value.includes("url-friendly") || value.includes("slugify")) return "slug-generator";
    if (value.includes("html-minifier") || value.includes("css-minifier") || value.includes("js-minifier") || value.includes("javascript-minifier") || value.includes("minify")) return "code-formatter";
    if (value.includes("html-formatter") || value.includes("css-formatter") || value.includes("sql-formatter") || value.includes("xml-formatter") || value.includes("code-beautifier")) return "code-formatter";
    if (value.includes("json-validator") || value.includes("json-lint") || value.includes("json-check")) return "json-formatter";
    if (value.includes("xml-to-json") || value.includes("json-to-xml")) return "yaml-json-converter";
    if (value.includes("html-to-markdown") || value.includes("markdown-to-html")) return "markdown-editor";
    if (value.includes("image-to-base64") || value.includes("base64-to-image")) return "base64-encoder";
    if (value.includes("chmod") || value.includes("permission-calculator")) return "number-base-converter";
    if (value.includes("pixel-to-rem") || value.includes("rem-to-pixel") || value.includes("px-to-rem")) return "unit-converter";
    if (value.includes("meta-tag") || value.includes("metatag-generator")) return "open-graph-tester";
    if (value.includes("http-status") || value.includes("status-code") || value.includes("http-checker")) return "ip-lookup";
    if (value.includes("url-parser") || value.includes("url-analyzer") || value.includes("query-string-parser")) return "url-decoder";
    if (value.includes("color-name") || value.includes("color-palette") || value.includes("gradient-generator") || value.includes("box-shadow") || value.includes("css-color")) return "color-picker";
    if (value.includes("sitemap-generator") || value.includes("sitemap-builder")) return "robots-txt-generator";
    if (value.includes("htaccess") || value.includes("nginx-config") || value.includes("server-config")) return "robots-txt-generator";
    if (value.includes("tsv-to-csv") || value.includes("csv-formatter") || value.includes("excel-to-json") || value.includes("spreadsheet-to-json")) return "csv-to-json";
    if (value.includes("random-name") || value.includes("name-generator") || value.includes("fake-name")) return "random-string-generator";
    if (value.includes("image-converter") || value.includes("image-compressor") || value.includes("image-resize") || value.includes("photo-editor")) return "markdown-editor";

    for (const engineType of TOOL_ENGINE_ORDER) {
      if (engineType === "generic-directory") continue;
      const definition = ENGINE_CATALOG[engineType];
      if (definition.keywords.some((keyword) => value.includes(keyword))) {
        return engineType;
      }
    }

    return "generic-directory";
  }

  if (category === "calculator") {
    if (value.includes("age")) return "age-calculator";
    if (value.includes("bmi") || value.includes("body-mass")) return "bmi-calculator";
    if (value.includes("emi")) return "emi-calculator";
    if (value.includes("sip") || includesAll(value, ["systematic", "investment"])) return "sip-calculator";
    if (value.includes("fixed-deposit") || value === "fd-calculator" || includesAll(value, ["fd", "calculator"])) return "fd-calculator";
    if (value.includes("ppf") || value.includes("public-provident")) return "ppf-calculator";
    if (value.includes("hra") || value.includes("house-rent-allowance")) return "hra-calculator";
    if (value.includes("income-tax") || value.includes("tax-calculator") || value.includes("itr")) return "income-tax-calculator";
    if (value.includes("compound-interest") || includesAll(value, ["compound", "interest"])) return "compound-interest-calculator";
    if (value.includes("loan")) return "loan-calculator";
    if (value.includes("simple-interest") || value === "interest-calculator") return "simple-interest-calculator";
    if (value.includes("gst") || value.includes("vat")) return "gst-calculator";
    if (value.includes("percentage")) return "percentage-calculator";
    if (value.includes("discount") || value.includes("sale-price") || value.includes("percentage-off")) return "discount-calculator";
    if (value.includes("tip") || value.includes("bill-split") || value.includes("gratuity-tip")) return "tip-calculator";
    if (value.includes("roi") || value.includes("return-on-investment")) return "roi-calculator";
    if (value.includes("savings") && !value.includes("tax")) return "savings-calculator";
    if (value.includes("retirement")) return "retirement-calculator";
    if (value.includes("calorie") || value.includes("tdee") || value.includes("bmr")) return "calorie-calculator";
    if (value.includes("fuel") || value.includes("petrol-cost") || value.includes("mileage-cost")) return "fuel-cost-calculator";
    if (value.includes("cagr") || value.includes("compound-annual-growth")) return "cagr-calculator";
    if (value.includes("gratuity")) return "gratuity-calculator";
    if (value.includes("rd-calculator") || value.includes("recurring-deposit")) return "rd-calculator";
    if (value.includes("mortgage") || value.includes("home-loan")) return "loan-calculator";
    if (value.includes("credit-card") || value.includes("card-payoff")) return "loan-calculator";
    if (value.includes("car-loan") || value.includes("auto-loan")) return "loan-calculator";
    if (value.includes("salary") || value.includes("take-home") || value.includes("payroll")) return "salary-calculator";
    if (value.includes("inflation") || value.includes("real-return")) return "compound-interest-calculator";
    if (value.includes("investment-growth") || value.includes("mutual-fund") || value.includes("nps-")) return "sip-calculator";
    if (value.includes("step-up-sip") || value.includes("stepup-sip")) return "sip-calculator";
    if (value.includes("sukanya") || value.includes("nps") || value.includes("bond-yield") || value.includes("dividend-yield")) return "fd-calculator";
    if (value.includes("break-even") || value.includes("profit-margin") || value.includes("markup")) return "percentage-calculator";
    if (value.includes("net-worth") || value.includes("time-duration") || value.includes("time-value")) return "compound-interest-calculator";
    if (value.includes("rent-vs-buy") || value.includes("rent-calculator")) return "loan-calculator";
    if (value.includes("mortgage") || value.includes("home-loan")) return "mortgage-calculator";
    if (value.includes("sales-tax") || value.includes("sales-tax-calculator")) return "sales-tax-calculator";
    if (value.includes("vat-calculator") || value.includes("value-added-tax") || (value.includes("vat") && value.includes("calculator"))) return "vat-calculator";
    if (value.includes("tax-bracket") || value.includes("tds") || value.includes("professional-tax")) return "income-tax-calculator";
    return "generic-directory";
  }

  if (
    value === "ai-email-writer" ||
    includesAny(value, ["email-writer", "email-generator", "email-assistant"])
  ) {
    return "ai-email-writer";
  }

  if (
    value === "ai-blog-outline-generator" ||
    includesAny(value, ["blog-outline", "outline-generator", "content-outline"])
  ) {
    return "ai-blog-outline-generator";
  }

  if (
    value === "ai-prompt-generator" ||
    includesAny(value, ["prompt-generator", "prompt-builder", "prompt-tool"])
  ) {
    return "ai-prompt-generator";
  }

  if (includesAny(value, ["ai-", "chatgpt", "openai", "summarizer", "rewrite", "assistant"])) {
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

  const allowed = new Set(ENGINE_OPTIONS[category].map((option) => option.value));
  if (allowed.has(normalized as EngineType)) {
    return normalized as EngineType;
  }

  return inferEngineType(category, slug);
}

export function getEngineDefinition(engineType: string | null | undefined): CatalogEngineDefinition {
  const normalized = String(engineType || "").trim().toLowerCase() as EngineType;
  return ENGINE_CATALOG[normalized] || ENGINE_CATALOG["generic-directory"];
}

export function getDefaultEngineConfig(engineType: string | null | undefined): EngineConfig {
  return { ...getEngineDefinition(engineType).defaultConfig };
}