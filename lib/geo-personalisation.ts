/**
 * lib/geo-personalisation.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Country-aware tool and calculator prioritisation.
 * Every visitor sees tools most relevant to their country first,
 * with universal tools filling remaining slots.
 *
 * Adding a new country: add a profile below. No other files need changing.
 *
 * Session 8: Updated ALL country featuredToolSlugs to include
 * image-compressor, pdf-merger, video-to-gif alongside country-relevant tools.
 */

export type CountryProfile = {
  country: string;         // ISO 3166-1 alpha-2
  name: string;            // Display name
  currency: string;        // ISO 4217
  currencySymbol: string;
  // Calculator slugs in priority order for this country
  calculatorSlugs: string[];
  // Tool slugs that are especially relevant (e.g. VAT for EU)
  featuredToolSlugs: string[];
  // Labels shown on homepage
  financeLabel: string;    // e.g. "Finance · Tax · Investment"
  accentColor: string;     // tailwind color class for localised section
};

// ── Country profiles ──────────────────────────────────────────────────────────

const PROFILES: Record<string, CountryProfile> = {

  // ── South Asia ──────────────────────────────────────────────────────────────
  IN: {
    country: "IN", name: "India", currency: "INR", currencySymbol: "₹",
    calculatorSlugs: ["income-tax-calculator", "gst-calculator", "emi-calculator",
      "sip-calculator", "hra-calculator", "ppf-calculator", "fd-calculator",
      "salary-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "password-generator", "word-counter"],
    financeLabel: "Finance · Tax · Investment",
    accentColor: "orange",
  },
  PK: {
    country: "PK", name: "Pakistan", currency: "PKR", currencySymbol: "₨",
    calculatorSlugs: ["percentage-calculator", "loan-calculator", "compound-interest-calculator",
      "salary-calculator", "bmi-calculator", "age-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "password-generator", "currency-converter"],
    financeLabel: "Finance · Loans · Currency",
    accentColor: "green",
  },
  BD: {
    country: "BD", name: "Bangladesh", currency: "BDT", currencySymbol: "৳",
    calculatorSlugs: ["percentage-calculator", "loan-calculator", "bmi-calculator",
      "age-calculator", "salary-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "word-counter"],
    financeLabel: "Finance · Loans · Health",
    accentColor: "emerald",
  },
  LK: {
    country: "LK", name: "Sri Lanka", currency: "LKR", currencySymbol: "₨",
    calculatorSlugs: ["percentage-calculator", "loan-calculator", "bmi-calculator",
      "salary-calculator", "age-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "currency-converter", "qr-code-generator", "word-counter"],
    financeLabel: "Finance · Loans · Health",
    accentColor: "yellow",
  },

  // ── United Kingdom ──────────────────────────────────────────────────────────
  GB: {
    country: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£",
    calculatorSlugs: ["mortgage-calculator", "vat-calculator", "salary-calculator",
      "compound-interest-calculator", "bmi-calculator", "percentage-calculator",
      "loan-calculator", "age-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "password-generator", "qr-code-generator", "json-formatter"],
    financeLabel: "Finance · VAT · Mortgage",
    accentColor: "blue",
  },

  // ── Europe ──────────────────────────────────────────────────────────────────
  DE: {
    country: "DE", name: "Germany", currency: "EUR", currencySymbol: "€",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "password-generator", "qr-code-generator"],
    financeLabel: "Finance · MwSt · Kredit",
    accentColor: "slate",
  },
  FR: {
    country: "FR", name: "France", currency: "EUR", currencySymbol: "€",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "password-generator", "qr-code-generator"],
    financeLabel: "Finance · TVA · Crédit",
    accentColor: "blue",
  },
  NL: {
    country: "NL", name: "Netherlands", currency: "EUR", currencySymbol: "€",
    calculatorSlugs: ["vat-calculator", "mortgage-calculator", "salary-calculator",
      "compound-interest-calculator", "percentage-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "password-generator", "currency-converter"],
    financeLabel: "Finance · BTW · Hypotheek",
    accentColor: "orange",
  },
  ES: {
    country: "ES", name: "Spain", currency: "EUR", currencySymbol: "€",
    calculatorSlugs: ["vat-calculator", "mortgage-calculator", "salary-calculator",
      "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "password-generator", "word-counter"],
    financeLabel: "Finance · IVA · Hipoteca",
    accentColor: "red",
  },
  IT: {
    country: "IT", name: "Italy", currency: "EUR", currencySymbol: "€",
    calculatorSlugs: ["vat-calculator", "mortgage-calculator", "salary-calculator",
      "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "password-generator", "word-counter"],
    financeLabel: "Finance · IVA · Mutuo",
    accentColor: "green",
  },
  PL: {
    country: "PL", name: "Poland", currency: "PLN", currencySymbol: "zł",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "password-generator", "currency-converter"],
    financeLabel: "Finance · VAT · Kredyt",
    accentColor: "red",
  },

  // ── North America ───────────────────────────────────────────────────────────
  US: {
    country: "US", name: "United States", currency: "USD", currencySymbol: "$",
    calculatorSlugs: ["mortgage-calculator", "sales-tax-calculator", "retirement-calculator",
      "compound-interest-calculator", "salary-calculator", "bmi-calculator",
      "percentage-calculator", "loan-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "password-generator", "json-formatter", "qr-code-generator"],
    financeLabel: "Finance · Tax · Mortgage",
    accentColor: "blue",
  },
  CA: {
    country: "CA", name: "Canada", currency: "CAD", currencySymbol: "$",
    calculatorSlugs: ["mortgage-calculator", "sales-tax-calculator", "retirement-calculator",
      "compound-interest-calculator", "salary-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "password-generator", "qr-code-generator", "word-counter"],
    financeLabel: "Finance · GST · Mortgage",
    accentColor: "red",
  },

  // ── Asia Pacific ────────────────────────────────────────────────────────────
  AU: {
    country: "AU", name: "Australia", currency: "AUD", currencySymbol: "$",
    calculatorSlugs: ["mortgage-calculator", "vat-calculator", "retirement-calculator",
      "compound-interest-calculator", "salary-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "password-generator", "qr-code-generator", "json-formatter"],
    financeLabel: "Finance · GST · Super",
    accentColor: "yellow",
  },
  NZ: {
    country: "NZ", name: "New Zealand", currency: "NZD", currencySymbol: "$",
    calculatorSlugs: ["mortgage-calculator", "vat-calculator", "salary-calculator",
      "compound-interest-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "password-generator", "qr-code-generator", "currency-converter"],
    financeLabel: "Finance · GST · Mortgage",
    accentColor: "teal",
  },
  SG: {
    country: "SG", name: "Singapore", currency: "SGD", currencySymbol: "S$",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "retirement-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "password-generator", "qr-code-generator"],
    financeLabel: "Finance · GST · CPF",
    accentColor: "red",
  },
  MY: {
    country: "MY", name: "Malaysia", currency: "MYR", currencySymbol: "RM",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "loan-calculator",
      "compound-interest-calculator", "bmi-calculator", "percentage-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "password-generator"],
    financeLabel: "Finance · SST · Loan",
    accentColor: "blue",
  },
  PH: {
    country: "PH", name: "Philippines", currency: "PHP", currencySymbol: "₱",
    calculatorSlugs: ["salary-calculator", "loan-calculator", "percentage-calculator",
      "bmi-calculator", "age-calculator", "compound-interest-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "word-counter"],
    financeLabel: "Finance · Tax · Loans",
    accentColor: "blue",
  },
  ID: {
    country: "ID", name: "Indonesia", currency: "IDR", currencySymbol: "Rp",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "loan-calculator",
      "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "word-counter"],
    financeLabel: "Finance · PPN · KPR",
    accentColor: "red",
  },
  JP: {
    country: "JP", name: "Japan", currency: "JPY", currencySymbol: "¥",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "percentage-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "password-generator", "qr-code-generator"],
    financeLabel: "Finance · 消費税 · Loan",
    accentColor: "red",
  },
  KR: {
    country: "KR", name: "South Korea", currency: "KRW", currencySymbol: "₩",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "percentage-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "password-generator", "qr-code-generator"],
    financeLabel: "Finance · VAT · 대출",
    accentColor: "blue",
  },
  CN: {
    country: "CN", name: "China", currency: "CNY", currencySymbol: "¥",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "percentage-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "json-formatter", "qr-code-generator", "password-generator"],
    financeLabel: "Finance · 增值税 · 贷款",
    accentColor: "red",
  },

  // ── Middle East & Africa ────────────────────────────────────────────────────
  AE: {
    country: "AE", name: "UAE", currency: "AED", currencySymbol: "د.إ",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "password-generator"],
    financeLabel: "Finance · VAT · Mortgage",
    accentColor: "emerald",
  },
  SA: {
    country: "SA", name: "Saudi Arabia", currency: "SAR", currencySymbol: "﷼",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "percentage-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "password-generator"],
    financeLabel: "Finance · VAT · Loan",
    accentColor: "green",
  },
  NG: {
    country: "NG", name: "Nigeria", currency: "NGN", currencySymbol: "₦",
    calculatorSlugs: ["salary-calculator", "loan-calculator", "percentage-calculator",
      "compound-interest-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "word-counter"],
    financeLabel: "Finance · Tax · Loans",
    accentColor: "green",
  },
  ZA: {
    country: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "mortgage-calculator",
      "compound-interest-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "password-generator"],
    financeLabel: "Finance · VAT · Bond",
    accentColor: "yellow",
  },

  // ── Latin America ───────────────────────────────────────────────────────────
  BR: {
    country: "BR", name: "Brazil", currency: "BRL", currencySymbol: "R$",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "loan-calculator",
      "percentage-calculator", "compound-interest-calculator", "bmi-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "word-counter"],
    financeLabel: "Finance · IOF · Financiamento",
    accentColor: "yellow",
  },
  MX: {
    country: "MX", name: "Mexico", currency: "MXN", currencySymbol: "$",
    calculatorSlugs: ["vat-calculator", "salary-calculator", "loan-calculator",
      "percentage-calculator", "compound-interest-calculator"],
    featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
      "qr-code-generator", "currency-converter", "word-counter"],
    financeLabel: "Finance · IVA · Crédito",
    accentColor: "red",
  },
};

// ── Default profile (used when country not in map) ────────────────────────────
const DEFAULT_PROFILE: CountryProfile = {
  country: "US", name: "Global", currency: "USD", currencySymbol: "$",
  calculatorSlugs: ["mortgage-calculator", "compound-interest-calculator",
    "percentage-calculator", "bmi-calculator", "salary-calculator",
    "loan-calculator", "retirement-calculator", "age-calculator"],
  featuredToolSlugs: ["image-compressor", "pdf-merger", "video-to-gif",
    "password-generator", "json-formatter", "qr-code-generator"],
  financeLabel: "Finance · Health · Math",
  accentColor: "blue",
};

// ── Public API ─────────────────────────────────────────────────────────────────

export function getCountryProfile(countryCode: string): CountryProfile {
  const code = (countryCode || "").toUpperCase().slice(0, 2);
  return PROFILES[code] ?? DEFAULT_PROFILE;
}

export function isKnownCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() in PROFILES;
}

export function getAllProfiles(): CountryProfile[] {
  return Object.values(PROFILES);
}