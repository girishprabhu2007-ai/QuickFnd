import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/lib/data/calculators";

export const metadata: Metadata = {
  title: "Calculators",
  description:
    "Browse useful calculators including EMI, age, and percentage calculators.",
};

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <h1 className="mb-6 text-4xl font-bold">Calculators</h1>

      <p className="mb-10 text-gray-400">
        Browse useful calculators available on QuickFnd.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
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