"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import FormulaCalculatorRenderer from "@/components/calculators/FormulaCalculatorRenderer";

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
        <div>
          <label className="mb-2 block text-sm text-q-muted">Loan amount</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={inputClass()}
            placeholder="100000"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-q-muted">Annual interest rate (%)</label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className={inputClass()}
            placeholder="8.5"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-q-muted">Loan term (years)</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className={inputClass()}
            placeholder="20"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Monthly payment</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.monthlyPayment.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Total payment</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.totalPayment.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Total interest</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.totalInterest.toFixed(2) : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

function EMICalculator({ title }: { title: string }) {
  return <LoanCalculator title={title} />;
}

function PercentageCalculator({ title }: { title: string }) {
  const [value, setValue] = useState("");
  const [percent, setPercent] = useState("");

  const result = useMemo(() => {
    const v = safeNumber(value);
    const p = safeNumber(percent);
    if (v === null || p === null) return null;
    return (v * p) / 100;
  }, [value, percent]);

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-q-muted">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass()}
            placeholder="500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-q-muted">Percentage</label>
          <input
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className={inputClass()}
            placeholder="15"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-q-border bg-q-bg p-4">
        <div className="text-sm text-q-muted">Result</div>
        <div className="mt-2 text-2xl font-semibold text-q-text">
          {result !== null ? result.toFixed(2) : "—"}
        </div>
      </div>
    </section>
  );
}

function SimpleInterestCalculator({ title }: { title: string }) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");

  const result = useMemo(() => {
    const p = safeNumber(principal);
    const r = safeNumber(rate);
    const t = safeNumber(time);
    if (p === null || r === null || t === null) return null;

    const interest = (p * r * t) / 100;
    const total = p + interest;

    return { interest, total };
  }, [principal, rate, time]);

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className={inputClass()}
          placeholder="Principal"
        />
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className={inputClass()}
          placeholder="Rate %"
        />
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={inputClass()}
          placeholder="Time (years)"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Interest</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.interest.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Total amount</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.total.toFixed(2) : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

function BMICalculator({ title }: { title: string }) {
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const result = useMemo(() => {
    const w = safeNumber(weight);
    const h = safeNumber(heightCm);
    if (w === null || h === null || h <= 0) return null;

    const meters = h / 100;
    const bmi = w / (meters * meters);

    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obese";

    return { bmi, category };
  }, [weight, heightCm]);

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className={inputClass()}
          placeholder="Weight (kg)"
        />
        <input
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          className={inputClass()}
          placeholder="Height (cm)"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">BMI</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.bmi.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Category</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.category : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

function AgeCalculator({ title }: { title: string }) {
  const [birthDate, setBirthDate] = useState("");

  const result = useMemo(() => {
    if (!birthDate) return null;

    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }

    return age >= 0 ? age : null;
  }, [birthDate]);

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 max-w-md">
        <label className="mb-2 block text-sm text-q-muted">Birth date</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={inputClass()}
        />
      </div>

      <div className="mt-6 rounded-xl border border-q-border bg-q-bg p-4">
        <div className="text-sm text-q-muted">Age</div>
        <div className="mt-2 text-2xl font-semibold text-q-text">
          {result !== null ? `${result} years` : "—"}
        </div>
      </div>
    </section>
  );
}

function GSTCalculator({ title }: { title: string }) {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");

  const result = useMemo(() => {
    const a = safeNumber(amount);
    const r = safeNumber(rate);
    if (a === null || r === null) return null;

    const gst = (a * r) / 100;
    const total = a + gst;

    return { gst, total };
  }, [amount, rate]);

  return (
    <section className={cardClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass()}
          placeholder="Amount"
        />
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className={inputClass()}
          placeholder="GST rate %"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">GST amount</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.gst.toFixed(2) : "—"}
          </div>
        </div>
        <div className={panelClass()}>
          <div className="text-sm text-q-muted">Total amount</div>
          <div className="mt-2 text-2xl font-semibold text-q-text">
            {result ? result.total.toFixed(2) : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CalculatorEngineRenderer({ item }: Props) {
  const engineType = String(item.engine_type || "").trim().toLowerCase();
  const title = item.name;
  const description =
    item.description ||
    "This calculator page is live and database-driven. You can attach a more specific calculator engine later.";

  if (engineType === "formula-calculator") {
    return <FormulaCalculatorRenderer item={item} />;
  }

  if (engineType === "loan-calculator") {
    return <LoanCalculator title={title} />;
  }

  if (engineType === "emi-calculator") {
    return <EMICalculator title={title} />;
  }

  if (engineType === "percentage-calculator") {
    return <PercentageCalculator title={title} />;
  }

  if (engineType === "simple-interest-calculator") {
    return <SimpleInterestCalculator title={title} />;
  }

  if (engineType === "bmi-calculator") {
    return <BMICalculator title={title} />;
  }

  if (engineType === "age-calculator") {
    return <AgeCalculator title={title} />;
  }

  if (engineType === "gst-calculator") {
    return <GSTCalculator title={title} />;
  }

  return <GenericCalculator title={title} description={description} />;
}