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


function RetirementCalculator({ title }: { title: string }) {
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("60");
  const [monthlyExpenses, setMonthlyExpenses] = useState("50000");
  const [currentSavings, setCurrentSavings] = useState("500000");
  const [expectedReturn, setExpectedReturn] = useState("12");
  const [inflationRate, setInflationRate] = useState("6");

  const result = useMemo(() => {
    const ca = safeNumber(currentAge);
    const ra = safeNumber(retireAge);
    const me = safeNumber(monthlyExpenses);
    const cs = safeNumber(currentSavings);
    const er = safeNumber(expectedReturn);
    const ir = safeNumber(inflationRate);
    if (!ca || !ra || !me || cs === null || !er || !ir) return null;
    if (ra <= ca) return null;

    const yearsToRetire = ra - ca;
    const yearsInRetirement = 85 - ra; // assume life to 85
    const realReturn = (er - ir) / 100;
    const annualExpensesAtRetire = me * 12 * Math.pow(1 + ir / 100, yearsToRetire);

    // Corpus needed at retirement (present value of annuity)
    const corpusNeeded = realReturn > 0
      ? annualExpensesAtRetire * (1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn
      : annualExpensesAtRetire * yearsInRetirement;

    // Future value of current savings
    const fvCurrentSavings = cs * Math.pow(1 + er / 100, yearsToRetire);
    const additionalCorpusNeeded = Math.max(0, corpusNeeded - fvCurrentSavings);

    // Monthly SIP needed
    const monthlyRate = er / 100 / 12;
    const n = yearsToRetire * 12;
    const sipNeeded = monthlyRate > 0
      ? (additionalCorpusNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, n) - 1)
      : additionalCorpusNeeded / n;

    return {
      yearsToRetire,
      corpusNeeded,
      fvCurrentSavings,
      additionalCorpusNeeded,
      sipNeeded: Math.max(0, sipNeeded),
      annualExpensesAtRetire,
    };
  }, [currentAge, retireAge, monthlyExpenses, currentSavings, expectedReturn, inflationRate]);

  const fmt = (n: number) => n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
    ? `₹${(n / 100000).toFixed(2)} L`
    : `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text mb-6">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Current Age", value: currentAge, onChange: setCurrentAge, suffix: "yrs" },
          { label: "Retirement Age", value: retireAge, onChange: setRetireAge, suffix: "yrs" },
          { label: "Monthly Expenses Today", value: monthlyExpenses, onChange: setMonthlyExpenses, prefix: "₹" },
          { label: "Current Savings / Investments", value: currentSavings, onChange: setCurrentSavings, prefix: "₹" },
          { label: "Expected Annual Return", value: expectedReturn, onChange: setExpectedReturn, suffix: "%" },
          { label: "Expected Inflation Rate", value: inflationRate, onChange: setInflationRate, suffix: "%" },
        ].map(f => (
          <div key={f.label}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">{f.label}</label>
            <div className="flex items-center rounded-xl border border-q-border bg-q-bg overflow-hidden">
              {f.prefix && <span className="px-3 text-q-muted text-sm">{f.prefix}</span>}
              <input type="number" value={f.value} onChange={e => f.onChange(e.target.value)}
                className="flex-1 bg-transparent py-3 px-3 text-q-text outline-none" />
              {f.suffix && <span className="px-3 text-q-muted text-sm">{f.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-blue-400/40 bg-blue-50/40 dark:bg-blue-500/10 p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Retirement Corpus Needed</div>
              <div className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">{fmt(result.corpusNeeded)}</div>
              <div className="mt-1 text-xs text-q-muted">At age {retireAge}, inflation-adjusted</div>
            </div>
            <div className="rounded-2xl border border-q-border bg-q-bg p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly SIP Needed</div>
              <div className="mt-2 text-3xl font-bold text-q-text">{fmt(result.sipNeeded)}</div>
              <div className="mt-1 text-xs text-q-muted">To reach your corpus goal</div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={panelClass()}>
              <div className="text-xs text-q-muted">Years to retire</div>
              <div className="mt-1 text-xl font-bold text-q-text">{result.yearsToRetire} years</div>
            </div>
            <div className={panelClass()}>
              <div className="text-xs text-q-muted">Value of current savings at retirement</div>
              <div className="mt-1 text-xl font-bold text-q-text">{fmt(result.fvCurrentSavings)}</div>
            </div>
            <div className={panelClass()}>
              <div className="text-xs text-q-muted">Monthly expenses at retirement</div>
              <div className="mt-1 text-xl font-bold text-q-text">{fmt(result.annualExpensesAtRetire / 12)}/mo</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


function SalaryCalculator({ title }: { title: string }) {
  const [ctc, setCtc] = useState("1200000");
  const [city, setCity] = useState<"metro" | "non-metro">("metro");
  const [rentPaid, setRentPaid] = useState("25000");

  const result = useMemo(() => {
    const annual = safeNumber(ctc);
    if (!annual || annual <= 0) return null;

    // Typical CTC breakdown
    const basicPct = 0.40;
    const hraRatePct = city === "metro" ? 0.50 : 0.40;
    const specialPct = 0.20;
    const pfPct = 0.12;

    const basicAnnual = annual * basicPct;
    const hraAnnual = basicAnnual * hraRatePct;
    const specialAnnual = annual * specialPct;
    const lta = annual * 0.05;
    const medAllowance = 15000;

    // PF — 12% of basic (capped at ₹1800/month)
    const pfMonthly = Math.min(basicAnnual / 12 * pfPct, 1800);
    const pfAnnual = pfMonthly * 12;

    // HRA exemption (least of 3 conditions)
    const rentAnnual = safeNumber(rentPaid) ? (safeNumber(rentPaid) as number) * 12 : 0;
    const hraExemption = Math.min(
      hraAnnual,
      rentAnnual - basicAnnual * 0.10,
      basicAnnual * (city === "metro" ? 0.50 : 0.40)
    );
    const hraExemptionFinal = Math.max(0, hraExemption);

    const grossSalary = basicAnnual + hraAnnual + specialAnnual + lta + medAllowance;
    const taxableIncome = grossSalary - hraExemptionFinal - pfAnnual - 50000; // standard deduction
    const taxableIncomePos = Math.max(0, taxableIncome);

    // New Tax Regime FY 2025-26
    let taxNewRegime = 0;
    if (taxableIncomePos <= 300000) taxNewRegime = 0;
    else if (taxableIncomePos <= 600000) taxNewRegime = (taxableIncomePos - 300000) * 0.05;
    else if (taxableIncomePos <= 900000) taxNewRegime = 15000 + (taxableIncomePos - 600000) * 0.10;
    else if (taxableIncomePos <= 1200000) taxNewRegime = 45000 + (taxableIncomePos - 900000) * 0.15;
    else if (taxableIncomePos <= 1500000) taxNewRegime = 90000 + (taxableIncomePos - 1200000) * 0.20;
    else taxNewRegime = 150000 + (taxableIncomePos - 1500000) * 0.30;

    const cess = taxNewRegime * 0.04;
    const totalTax = taxNewRegime + cess;

    // Professional tax (state — avg ₹200/month)
    const ptAnnual = 2400;

    const inHandAnnual = grossSalary - pfAnnual - totalTax - ptAnnual;
    const inHandMonthly = inHandAnnual / 12;

    return {
      grossMonthly: grossSalary / 12,
      basicMonthly: basicAnnual / 12,
      hraMonthly: hraAnnual / 12,
      specialMonthly: specialAnnual / 12,
      pfMonthly,
      taxMonthly: totalTax / 12,
      ptMonthly: ptAnnual / 12,
      hraExemptionMonthly: hraExemptionFinal / 12,
      inHandMonthly,
      effectiveTaxRate: grossSalary > 0 ? (totalTax / grossSalary * 100) : 0,
    };
  }, [ctc, city, rentPaid]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text mb-6">{title}</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual CTC</label>
          <div className="flex items-center rounded-xl border border-q-border bg-q-bg overflow-hidden">
            <span className="px-3 text-q-muted text-sm">₹</span>
            <input type="number" value={ctc} onChange={e => setCtc(e.target.value)}
              className="flex-1 bg-transparent py-3 px-2 text-q-text outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">City Type</label>
          <div className="flex gap-2">
            {(["metro", "non-metro"] as const).map(c => (
              <button key={c} onClick={() => setCity(c)}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition capitalize ${city === c ? "bg-q-primary border-q-primary text-white" : "border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
                {c === "metro" ? "Metro City" : "Non-Metro"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Rent Paid</label>
          <div className="flex items-center rounded-xl border border-q-border bg-q-bg overflow-hidden">
            <span className="px-3 text-q-muted text-sm">₹</span>
            <input type="number" value={rentPaid} onChange={e => setRentPaid(e.target.value)}
              className="flex-1 bg-transparent py-3 px-2 text-q-text outline-none" />
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          {/* In-Hand highlight */}
          <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-500/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Monthly In-Hand Salary</div>
                <div className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">{fmt(result.inHandMonthly)}</div>
                <div className="mt-1 text-sm text-q-muted">{fmt(result.inHandMonthly * 12)} per year · Effective tax rate: {result.effectiveTaxRate.toFixed(1)}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-q-muted">Gross Monthly</div>
                <div className="text-xl font-bold text-q-text">{fmt(result.grossMonthly)}</div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-q-border bg-q-bg overflow-hidden">
            <div className="px-5 py-3 border-b border-q-border">
              <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Breakdown</div>
            </div>
            <div className="divide-y divide-q-border">
              {[
                { label: "Basic Salary", value: result.basicMonthly, type: "income" },
                { label: "HRA", value: result.hraMonthly, type: "income" },
                { label: "Special Allowance", value: result.specialMonthly, type: "income" },
                { label: "Gross Salary", value: result.grossMonthly, type: "total" },
                { label: "Provident Fund (12%)", value: -result.pfMonthly, type: "deduction" },
                { label: `Income Tax (New Regime)`, value: -result.taxMonthly, type: "deduction" },
                { label: "Professional Tax", value: -result.ptMonthly, type: "deduction" },
                { label: "In-Hand Salary", value: result.inHandMonthly, type: "final" },
              ].map(row => (
                <div key={row.label} className={`flex items-center justify-between px-5 py-3 ${row.type === "total" || row.type === "final" ? "bg-q-card" : ""}`}>
                  <span className={`text-sm ${row.type === "final" ? "font-semibold text-q-text" : "text-q-muted"}`}>{row.label}</span>
                  <span className={`text-sm font-semibold tabular-nums ${row.type === "deduction" ? "text-red-500" : row.type === "final" ? "text-emerald-600 dark:text-emerald-400 text-base" : "text-q-text"}`}>
                    {row.value < 0 ? `-${fmt(-row.value)}` : fmt(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-q-muted">Calculated using New Tax Regime FY 2025-26. Assumes 40% Basic, standard CTC structure. Actual figures may vary by employer.</p>
        </div>
      )}
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

  // ✅ Retirement Calculator
  if (engineType === "retirement-calculator" || (engineType === "compound-interest-calculator" && item.slug.includes("retirement"))) {
    return <RetirementCalculator title={title} />;
  }

  // ✅ Salary Calculator (India — exact engine_type match only)
  if (engineType === "salary-calculator") {
    return <SalaryCalculator title={title} />;
  }

  // 👉 Add more mappings here safely later

  // ✅ Fallback (safe)
  return <GenericCalculator title={title} description={description} />;
}