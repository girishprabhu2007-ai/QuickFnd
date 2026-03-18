export function resolveCalculatorEngine(slug: string): string | null {
  const s = slug.toLowerCase();

  if (s.includes("loan") || s.includes("emi")) return "loan-calculator";
  if (s.includes("percentage")) return "percentage-calculator";
  if (s.includes("interest")) return "simple-interest-calculator";
  if (s.includes("bmi")) return "bmi-calculator";
  if (s.includes("age")) return "age-calculator";
  if (s.includes("gst") || s.includes("tax")) return "gst-calculator";

  return null;
}