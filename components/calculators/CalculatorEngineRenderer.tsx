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


/* ═══════════════════════════════════════════════════════════════════════════════
   MULTI-COUNTRY SALARY CALCULATOR
   Supports: US, UK, India, Australia, Germany, Generic
   Auto-detects country from slug (e.g. "salary-calculator-washington-dc" → US)
   ═══════════════════════════════════════════════════════════════════════════════ */

type SalaryCountry = "US" | "UK" | "IN" | "AU" | "DE" | "GENERIC";

const COUNTRY_INFO: Record<SalaryCountry, { label: string; flag: string; currency: string; symbol: string; defaultSalary: string; period: string }> = {
  US:      { label: "United States", flag: "🇺🇸", currency: "USD", symbol: "$",  defaultSalary: "75000",   period: "Annual" },
  UK:      { label: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£",  defaultSalary: "45000",   period: "Annual" },
  IN:      { label: "India",          flag: "🇮🇳", currency: "INR", symbol: "₹",  defaultSalary: "1200000", period: "Annual CTC" },
  AU:      { label: "Australia",      flag: "🇦🇺", currency: "AUD", symbol: "$",  defaultSalary: "90000",   period: "Annual" },
  DE:      { label: "Germany",        flag: "🇩🇪", currency: "EUR", symbol: "€",  defaultSalary: "55000",   period: "Annual Brutto" },
  GENERIC: { label: "Other Country",  flag: "🌍", currency: "",    symbol: "",   defaultSalary: "60000",   period: "Annual" },
};

function detectCountryFromSlug(slug: string): SalaryCountry {
  const s = slug.toLowerCase();
  // US states / cities
  if (s.includes("washington") || s.includes("maryland") || s.includes("virginia") ||
      s.includes("california") || s.includes("new-york") || s.includes("texas") ||
      s.includes("florida") || s.includes("illinois") || s.includes("usa") ||
      s.includes("united-states") || s.includes("-us-") || s.endsWith("-us")) return "US";
  // UK
  if (s.includes("uk") || s.includes("united-kingdom") || s.includes("paye") ||
      s.includes("london") || s.includes("england") || s.includes("scotland")) return "UK";
  // India
  if (s.includes("india") || s.includes("ctc") || s.includes("in-hand") ||
      s.includes("-in-") || s.endsWith("-in") || s.includes("inr")) return "IN";
  // Australia
  if (s.includes("australia") || s.includes("-au-") || s.endsWith("-au") ||
      s.includes("superannuation")) return "AU";
  // Germany
  if (s.includes("germany") || s.includes("deutschland") || s.includes("-de-") ||
      s.endsWith("-de") || s.includes("brutto")) return "DE";
  return "GENERIC";
}

// ── US Federal Tax 2025 ──
function calcUS(salary: number, filingStatus: string) {
  // Federal brackets (2025, Single)
  const singleBrackets = [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];
  const marriedBrackets = [
    { limit: 23200, rate: 0.10 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  const standardDeduction = filingStatus === "married" ? 29200 : 14600;
  const brackets = filingStatus === "married" ? marriedBrackets : singleBrackets;
  const taxableIncome = Math.max(0, salary - standardDeduction);

  let federalTax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, bracket.limit) - prev;
    federalTax += taxable * bracket.rate;
    prev = bracket.limit;
  }

  // FICA: Social Security 6.2% (capped at $168,600) + Medicare 1.45%
  const ssCap = 168600;
  const socialSecurity = Math.min(salary, ssCap) * 0.062;
  const medicare = salary * 0.0145;
  const additionalMedicare = salary > 200000 ? (salary - 200000) * 0.009 : 0;
  const fica = socialSecurity + medicare + additionalMedicare;

  const totalTax = federalTax + fica;
  const annualNet = salary - totalTax;

  return {
    grossMonthly: salary / 12,
    netMonthly: annualNet / 12,
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" as const },
      { label: `Standard Deduction (${filingStatus === "married" ? "Married" : "Single"})`, value: -standardDeduction, type: "deduction" as const },
      { label: "Federal Income Tax", value: -federalTax, type: "deduction" as const },
      { label: "Social Security (6.2%)", value: -socialSecurity, type: "deduction" as const },
      { label: "Medicare (1.45%)", value: -medicare, type: "deduction" as const },
      ...(additionalMedicare > 0 ? [{ label: "Additional Medicare (0.9%)", value: -additionalMedicare, type: "deduction" as const }] : []),
      { label: "Annual Take-Home", value: annualNet, type: "final" as const },
    ],
    effectiveTaxRate: salary > 0 ? (totalTax / salary * 100) : 0,
    note: "Federal tax only. State/local taxes vary. Based on 2025 brackets.",
  };
}

// ── UK PAYE 2025-26 ──
function calcUK(salary: number) {
  const personalAllowance = salary <= 100000 ? 12570 : Math.max(0, 12570 - (salary - 100000) / 2);
  const taxableIncome = Math.max(0, salary - personalAllowance);

  let incomeTax = 0;
  if (taxableIncome <= 37700) {
    incomeTax = taxableIncome * 0.20;
  } else if (taxableIncome <= 125140) {
    incomeTax = 37700 * 0.20 + (taxableIncome - 37700) * 0.40;
  } else {
    incomeTax = 37700 * 0.20 + (125140 - 37700) * 0.40 + (taxableIncome - 125140) * 0.45;
  }

  // National Insurance (Class 1, 2025-26)
  let ni = 0;
  const weeklyPay = salary / 52;
  const weeklyPT = 242; // Primary Threshold
  const weeklyUEL = 967; // Upper Earnings Limit
  if (weeklyPay > weeklyPT) {
    ni = Math.min(weeklyPay - weeklyPT, weeklyUEL - weeklyPT) * 0.08;
    if (weeklyPay > weeklyUEL) ni += (weeklyPay - weeklyUEL) * 0.02;
    ni *= 52;
  }

  const totalDeductions = incomeTax + ni;
  const annualNet = salary - totalDeductions;

  return {
    grossMonthly: salary / 12,
    netMonthly: annualNet / 12,
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" as const },
      { label: `Personal Allowance`, value: -personalAllowance, type: "deduction" as const },
      { label: "Income Tax (PAYE)", value: -incomeTax, type: "deduction" as const },
      { label: "National Insurance", value: -ni, type: "deduction" as const },
      { label: "Annual Take-Home", value: annualNet, type: "final" as const },
    ],
    effectiveTaxRate: salary > 0 ? (totalDeductions / salary * 100) : 0,
    note: "Based on PAYE 2025-26 tax year. Excludes student loan, pension, and salary sacrifice.",
  };
}

// ── India CTC → In-Hand ──
function calcIndia(annual: number, city: "metro" | "non-metro", rentPaid: number) {
  const basicPct = 0.40;
  const hraRatePct = city === "metro" ? 0.50 : 0.40;
  const pfPct = 0.12;

  const basicAnnual = annual * basicPct;
  const hraAnnual = basicAnnual * hraRatePct;
  const specialAnnual = annual * 0.20;
  const lta = annual * 0.05;
  const medAllowance = 15000;

  const pfMonthly = Math.min(basicAnnual / 12 * pfPct, 1800);
  const pfAnnual = pfMonthly * 12;

  const rentAnnual = rentPaid * 12;
  const hraExemption = Math.max(0, Math.min(hraAnnual, rentAnnual - basicAnnual * 0.10, basicAnnual * (city === "metro" ? 0.50 : 0.40)));

  const grossSalary = basicAnnual + hraAnnual + specialAnnual + lta + medAllowance;
  const taxableIncome = Math.max(0, grossSalary - hraExemption - pfAnnual - 50000);

  let tax = 0;
  if (taxableIncome <= 300000) tax = 0;
  else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
  else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
  else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
  else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
  else tax = 150000 + (taxableIncome - 1500000) * 0.30;

  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const ptAnnual = 2400;
  const inHandAnnual = grossSalary - pfAnnual - totalTax - ptAnnual;

  return {
    grossMonthly: grossSalary / 12,
    netMonthly: inHandAnnual / 12,
    rows: [
      { label: "Basic Salary", value: basicAnnual / 12, type: "income" as const },
      { label: "HRA", value: hraAnnual / 12, type: "income" as const },
      { label: "Special Allowance", value: specialAnnual / 12, type: "income" as const },
      { label: "Gross Monthly", value: grossSalary / 12, type: "total" as const },
      { label: "Provident Fund (12%)", value: -pfMonthly, type: "deduction" as const },
      { label: "Income Tax (New Regime)", value: -(totalTax / 12), type: "deduction" as const },
      { label: "Professional Tax", value: -(ptAnnual / 12), type: "deduction" as const },
      { label: "Monthly In-Hand", value: inHandAnnual / 12, type: "final" as const },
    ],
    effectiveTaxRate: grossSalary > 0 ? (totalTax / grossSalary * 100) : 0,
    note: "New Tax Regime FY 2025-26. Assumes 40% Basic, standard CTC structure.",
  };
}

// ── Australia PAYG 2025-26 ──
function calcAustralia(salary: number) {
  let incomeTax = 0;
  if (salary <= 18200) incomeTax = 0;
  else if (salary <= 45000) incomeTax = (salary - 18200) * 0.16;
  else if (salary <= 135000) incomeTax = 4288 + (salary - 45000) * 0.30;
  else if (salary <= 190000) incomeTax = 31288 + (salary - 135000) * 0.37;
  else incomeTax = 51638 + (salary - 190000) * 0.45;

  // Medicare Levy 2%
  const medicare = salary > 24276 ? salary * 0.02 : 0;
  const superannuation = salary * 0.115; // 11.5% SG from 1 July 2025

  const totalTax = incomeTax + medicare;
  const annualNet = salary - totalTax;

  return {
    grossMonthly: salary / 12,
    netMonthly: annualNet / 12,
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" as const },
      { label: "Income Tax (PAYG)", value: -incomeTax, type: "deduction" as const },
      { label: "Medicare Levy (2%)", value: -medicare, type: "deduction" as const },
      { label: `Super Guarantee (11.5%)`, value: superannuation, type: "income" as const },
      { label: "Annual Take-Home", value: annualNet, type: "final" as const },
    ],
    effectiveTaxRate: salary > 0 ? (totalTax / salary * 100) : 0,
    note: "Based on 2025-26 PAYG rates. Super is employer-paid on top of salary. Excludes HECS/HELP.",
  };
}

// ── Germany Brutto → Netto ──
function calcGermany(salary: number, taxClass: string) {
  // Simplified German income tax (2025)
  const grundfreibetrag = 11784;
  const taxable = Math.max(0, salary - grundfreibetrag);

  let incomeTax = 0;
  if (taxable <= 17005) {
    incomeTax = taxable * 0.14;
  } else if (taxable <= 66760) {
    incomeTax = 17005 * 0.14 + (taxable - 17005) * 0.2397;
  } else if (taxable <= 277826 - grundfreibetrag) {
    incomeTax = 17005 * 0.14 + (66760 - 17005) * 0.2397 + (taxable - 66760) * 0.42;
  } else {
    incomeTax = 17005 * 0.14 + (66760 - 17005) * 0.2397 + (277826 - grundfreibetrag - 66760) * 0.42 + (taxable - (277826 - grundfreibetrag)) * 0.45;
  }

  if (taxClass === "III") incomeTax *= 0.65; // rough approximation for married
  const soli = incomeTax > 18130 ? incomeTax * 0.055 : 0;

  // Social contributions (employee share, capped)
  const healthInsurance = Math.min(salary, 66150) * 0.073; // ~14.6% / 2
  const nursingCare = Math.min(salary, 66150) * 0.017;
  const pension = Math.min(salary, 90600) * 0.093;
  const unemployment = Math.min(salary, 90600) * 0.013;

  const totalDeductions = incomeTax + soli + healthInsurance + nursingCare + pension + unemployment;
  const annualNet = salary - totalDeductions;

  return {
    grossMonthly: salary / 12,
    netMonthly: annualNet / 12,
    rows: [
      { label: "Brutto (Gross Annual)", value: salary, type: "income" as const },
      { label: `Income Tax (Class ${taxClass})`, value: -incomeTax, type: "deduction" as const },
      { label: "Solidarity Surcharge", value: -soli, type: "deduction" as const },
      { label: "Health Insurance (7.3%)", value: -healthInsurance, type: "deduction" as const },
      { label: "Pension (9.3%)", value: -pension, type: "deduction" as const },
      { label: "Unemployment (1.3%)", value: -unemployment, type: "deduction" as const },
      { label: "Nursing Care (1.7%)", value: -nursingCare, type: "deduction" as const },
      { label: "Netto (Annual Take-Home)", value: annualNet, type: "final" as const },
    ],
    effectiveTaxRate: salary > 0 ? (totalDeductions / salary * 100) : 0,
    note: "Estimated 2025 rates. Actual amounts depend on tax class, church tax, and health insurer.",
  };
}

// ── Generic (flat tax estimate) ──
function calcGeneric(salary: number, taxRate: number) {
  const tax = salary * (taxRate / 100);
  const annualNet = salary - tax;
  return {
    grossMonthly: salary / 12,
    netMonthly: annualNet / 12,
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" as const },
      { label: `Estimated Tax (${taxRate}%)`, value: -tax, type: "deduction" as const },
      { label: "Estimated Take-Home", value: annualNet, type: "final" as const },
    ],
    effectiveTaxRate: taxRate,
    note: "Using flat estimated tax rate. For accurate results, select your country above.",
  };
}

type CalcResult = {
  grossMonthly: number;
  netMonthly: number;
  rows: Array<{ label: string; value: number; type: "income" | "deduction" | "total" | "final" }>;
  effectiveTaxRate: number;
  note: string;
};

function SalaryCalculator({ title, slug }: { title: string; slug: string }) {
  const detectedCountry = detectCountryFromSlug(slug);
  const [country, setCountry] = useState<SalaryCountry>(detectedCountry);
  const info = COUNTRY_INFO[country];

  const [salary, setSalary] = useState(info.defaultSalary);
  const [filingStatus, setFilingStatus] = useState("single"); // US
  const [city, setCity] = useState<"metro" | "non-metro">("metro"); // India
  const [rentPaid, setRentPaid] = useState("25000"); // India
  const [taxClass, setTaxClass] = useState("I"); // Germany
  const [taxRate, setTaxRate] = useState("25"); // Generic

  // Reset defaults when country changes
  const handleCountryChange = (c: SalaryCountry) => {
    setCountry(c);
    setSalary(COUNTRY_INFO[c].defaultSalary);
  };

  const result: CalcResult | null = useMemo(() => {
    const s = safeNumber(salary);
    if (!s || s <= 0) return null;

    switch (country) {
      case "US": return calcUS(s, filingStatus);
      case "UK": return calcUK(s);
      case "IN": return calcIndia(s, city, safeNumber(rentPaid) || 0);
      case "AU": return calcAustralia(s);
      case "DE": return calcGermany(s, taxClass);
      case "GENERIC": return calcGeneric(s, safeNumber(taxRate) || 25);
    }
  }, [salary, country, filingStatus, city, rentPaid, taxClass, taxRate]);

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    if (country === "IN") {
      return `${info.symbol}${Math.round(abs).toLocaleString("en-IN")}`;
    }
    return `${info.symbol || ""}${Math.round(abs).toLocaleString("en-US")}`;
  };

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text mb-6">{title}</h2>

      {/* Country selector */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Country / Tax System</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(COUNTRY_INFO) as SalaryCountry[]).map(c => (
            <button key={c} onClick={() => handleCountryChange(c)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${country === c ? "bg-q-primary border-q-primary text-white" : "border-q-border bg-q-bg text-q-muted hover:text-q-text hover:border-q-text/30"}`}>
              {COUNTRY_INFO[c].flag} {COUNTRY_INFO[c].label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">{info.period}</label>
          <div className="flex items-center rounded-xl border border-q-border bg-q-bg overflow-hidden">
            {info.symbol && <span className="px-3 text-q-muted text-sm">{info.symbol}</span>}
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
              className="flex-1 bg-transparent py-3 px-2 text-q-text outline-none" />
          </div>
        </div>

        {/* US-specific: filing status */}
        {country === "US" && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Filing Status</label>
            <div className="flex gap-2">
              {["single", "married"].map(s => (
                <button key={s} onClick={() => setFilingStatus(s)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition capitalize ${filingStatus === s ? "bg-q-primary border-q-primary text-white" : "border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
                  {s === "single" ? "Single" : "Married Filing Jointly"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* India-specific: city type + rent */}
        {country === "IN" && (
          <>
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
          </>
        )}

        {/* Germany-specific: tax class */}
        {country === "DE" && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tax Class (Steuerklasse)</label>
            <div className="flex gap-2">
              {["I", "III", "V"].map(tc => (
                <button key={tc} onClick={() => setTaxClass(tc)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${taxClass === tc ? "bg-q-primary border-q-primary text-white" : "border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
                  Class {tc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generic: manual tax rate */}
        {country === "GENERIC" && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Estimated Tax Rate</label>
            <div className="flex items-center rounded-xl border border-q-border bg-q-bg overflow-hidden">
              <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="flex-1 bg-transparent py-3 px-3 text-q-text outline-none" />
              <span className="px-3 text-q-muted text-sm">%</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* In-Hand highlight */}
          <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-500/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Monthly Take-Home</div>
                <div className="mt-1 text-4xl font-black text-emerald-700 dark:text-emerald-300">{fmt(result.netMonthly)}</div>
                <div className="mt-1 text-sm text-q-muted">{fmt(result.netMonthly * 12)} per year · Effective rate: {result.effectiveTaxRate.toFixed(1)}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-q-muted">Gross Monthly</div>
                <div className="text-xl font-bold text-q-text">{fmt(result.grossMonthly)}</div>
              </div>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="rounded-2xl border border-q-border bg-q-bg overflow-hidden">
            <div className="px-5 py-3 border-b border-q-border">
              <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">{country === "IN" ? "Monthly" : "Annual"} Breakdown</div>
            </div>
            <div className="divide-y divide-q-border">
              {result.rows.map(row => (
                <div key={row.label} className={`flex items-center justify-between px-5 py-3 ${row.type === "total" || row.type === "final" ? "bg-q-card" : ""}`}>
                  <span className={`text-sm ${row.type === "final" ? "font-semibold text-q-text" : "text-q-muted"}`}>{row.label}</span>
                  <span className={`text-sm font-semibold tabular-nums ${row.type === "deduction" ? "text-red-500" : row.type === "final" ? "text-emerald-600 dark:text-emerald-400 text-base" : "text-q-text"}`}>
                    {row.value < 0 ? `-${fmt(-row.value)}` : fmt(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-q-muted">{result.note}</p>
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

  // ✅ Salary Calculator (multi-country — auto-detects from slug)
  if (engineType === "salary-calculator") {
    return <SalaryCalculator title={title} slug={item.slug} />;
  }

  // 👉 Add more mappings here safely later

  // ✅ Fallback (safe)
  return <GenericCalculator title={title} description={description} />;
}