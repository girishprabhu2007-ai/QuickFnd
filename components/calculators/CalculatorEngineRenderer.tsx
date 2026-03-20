"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import FormulaCalculatorRenderer from "@/components/calculators/FormulaCalculatorRenderer";
import { resolveCalculatorRuntime } from "@/lib/calculator-runtime";

type Props = {
  item: PublicContentItem;
};

function cardClass() {
  return "rounded-2xl border border-q-border bg-q-card p-6";
}

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none";
}

function panelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-4";
}

function safeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function GenericCalculator({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>
      <div className="mt-4 rounded-xl border border-q-border bg-q-bg p-5 text-q-muted">
        {description}
      </div>
    </section>
  );
}

/* ---------- EXISTING CALCULATORS (UNCHANGED) ---------- */

function LoanCalculator({ title }: { title: string }) {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const result = useMemo(() => {
    const p = safeNumber(principal);
    const r = safeNumber(annualRate);
    const y = safeNumber(years);

    if (p === null || r === null || y === null || p <= 0 || y <= 0) {
      return null;
    }

    const monthlyRate = r / 100 / 12;
    const n = y * 12;

    if (monthlyRate === 0) {
      const monthlyPayment = p / n;
      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - p;
      return { monthlyPayment, totalPayment, totalInterest };
    }

    const monthlyPayment =
      (p * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;

    return { monthlyPayment, totalPayment, totalInterest };
  }, [principal, annualRate, years]);

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <input value={principal} onChange={(e) => setPrincipal(e.target.value)} className={inputClass()} placeholder="Loan amount" />
        <input value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} className={inputClass()} placeholder="Interest %" />
        <input value={years} onChange={(e) => setYears(e.target.value)} className={inputClass()} placeholder="Years" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Monthly</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.monthlyPayment.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Total</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.totalPayment.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Interest</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.totalInterest.toFixed(2) : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- MAIN ENGINE ---------- */

export default function CalculatorEngineRenderer({ item }: Props) {
  const runtime = resolveCalculatorRuntime({
    slug: item.slug,
    name: item.name,
    description: item.description,
  });

  const engineType = runtime.engine_type || item.engine_type || "";
  const title = item.name;
  const description = item.description;

  // ✅ Formula engine (dynamic)
  if (engineType === "formula-calculator") {
    return <FormulaCalculatorRenderer item={{ ...item, engine_config: runtime.engine_config }} />;
  }

  // ✅ Existing stable engines (preserved)
  if (engineType === "loan-calculator") {
    return <LoanCalculator title={title} />;
  }

  // 👉 Add more mappings here safely later

  // ✅ Fallback (safe)
  return <GenericCalculator title={title} description={description} />;
}