import Link from "next/link";

const calculators = [
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    description: "Calculate monthly loan EMI payments quickly.",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Find your exact age in years, months, and days.",
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages instantly for daily use.",
  },
];

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Calculators</h1>

      <p className="text-gray-400 mb-10">
        Browse useful calculators available on QuickFnd.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {calculators.map((calculator) => (
          <Link
            key={calculator.slug}
            href={`/calculators/${calculator.slug}`}
            className="block rounded-xl bg-gray-900 p-6 transition hover:bg-gray-800"
          >
            <h2 className="text-xl font-semibold">{calculator.name}</h2>
            <p className="mt-2 text-gray-400">{calculator.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}