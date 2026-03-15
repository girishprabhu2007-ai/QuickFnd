import Link from "next/link";
import { getCalculators } from "@/lib/db";

export const revalidate = 300;

export default async function CalculatorsPage() {
  const calculators = await getCalculators();

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Directory
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            Calculators
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            Use practical calculators for finance, health, percentages, EMI,
            age, and other everyday needs.
          </p>
        </div>

        {calculators.length === 0 ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
            No calculators available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {calculators.map((calculator) => (
              <Link
                key={calculator.slug}
                href={`/calculators/${calculator.slug}`}
                className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
              >
                <h2 className="text-xl font-semibold text-q-text">
                  {calculator.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {calculator.description}
                </p>
                <div className="mt-4 text-sm font-medium text-blue-500">
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