import Link from "next/link";
import { getCalculators } from "@/lib/db";

export default async function CalculatorsPage() {
  const calculators = await getCalculators();

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-blue-400">
            QuickFnd Directory
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">All Calculators</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            Explore calculators for finance, percentages, age, and other everyday
            calculations in one place.
          </p>
        </div>

        {calculators.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-gray-400">
            No calculators available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {calculators.map((calculator) => (
              <Link
                key={calculator.slug}
                href={`/calculators/${calculator.slug}`}
                className="block rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
              >
                <h2 className="text-xl font-semibold">{calculator.name}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {calculator.description}
                </p>
                <div className="mt-5 text-sm font-medium text-blue-400">
                  Open calculator →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}