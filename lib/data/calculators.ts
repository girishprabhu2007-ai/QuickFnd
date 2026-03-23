export type CalculatorItem = {
  slug: string;
  name: string;
  description: string;
  relatedSlugs: string[];
};

export const calculators: CalculatorItem[] = [
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    description: "Calculate monthly EMI payments for loans with ease.",
    relatedSlugs: ["percentage-calculator", "age-calculator"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Find your exact age based on your date of birth.",
    relatedSlugs: ["percentage-calculator", "emi-calculator"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages for marks, discounts, and more.",
    relatedSlugs: ["emi-calculator", "age-calculator"],
  },
];

export function getCalculatorBySlug(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}

export function getRelatedCalculators(slug: string) {
  const currentCalculator = getCalculatorBySlug(slug);
  if (!currentCalculator) return [];

  return currentCalculator.relatedSlugs
    .map((relatedSlug) => getCalculatorBySlug(relatedSlug))
    .filter((calculator): calculator is CalculatorItem => Boolean(calculator));
}