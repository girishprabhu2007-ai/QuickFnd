"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import { inferEngineType } from "@/lib/engine-metadata";

type Props = {
  item: PublicContentItem;
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");

  const result = useMemo(() => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();

    if (Number.isNaN(birth.getTime())) return null;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  }, [birthDate]);

  return (
    <Card title="Age Calculator">
      <div className="space-y-4">
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          {result ? (
            <span>
              Age: <strong>{result.years}</strong> years,{" "}
              <strong>{result.months}</strong> months,{" "}
              <strong>{result.days}</strong> days
            </span>
          ) : (
            "Choose a birth date to calculate age."
          )}
        </div>
      </div>
    </Card>
  );
}

function BMICalculator() {
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const result = useMemo(() => {
    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (!height || !weight) return null;

    const bmi = weight / Math.pow(height / 100, 2);

    let category = "Underweight";
    if (bmi >= 18.5 && bmi < 25) category = "Normal";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obesity";

    return { bmi: bmi.toFixed(1), category };
  }, [heightCm, weightKg]);

  return (
    <Card title="BMI Calculator">
      <div className="grid gap-4">
        <input
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          placeholder="Height in cm"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          placeholder="Weight in kg"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          {result ? (
            <span>
              BMI: <strong>{result.bmi}</strong> ({result.category})
            </span>
          ) : (
            "Enter height and weight to calculate BMI."
          )}
        </div>
      </div>
    </Card>
  );
}

function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const result = useMemo(() => {
    const p = Number(principal);
    const y = Number(years);
    const monthlyRate = Number(annualRate) / 100 / 12;
    const payments = y * 12;

    if (!p || !y || payments <= 0) return null;

    if (monthlyRate === 0) {
      const monthly = p / payments;
      return {
        monthly: monthly.toFixed(2),
        total: (monthly * payments).toFixed(2),
        interest: "0.00",
      };
    }

    const monthly =
      (p * monthlyRate * Math.pow(1 + monthlyRate, payments)) /
      (Math.pow(1 + monthlyRate, payments) - 1);

    const total = monthly * payments;
    const interest = total - p;

    return {
      monthly: monthly.toFixed(2),
      total: total.toFixed(2),
      interest: interest.toFixed(2),
    };
  }, [principal, annualRate, years]);

  return (
    <Card title="Loan Calculator">
      <div className="grid gap-4">
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="Loan amount"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={annualRate}
          onChange={(e) => setAnnualRate(e.target.value)}
          placeholder="Annual interest rate (%)"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="Repayment years"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          {result ? (
            <div className="grid gap-2">
              <div>Monthly Payment: <strong>{result.monthly}</strong></div>
              <div>Total Payment: <strong>{result.total}</strong></div>
              <div>Total Interest: <strong>{result.interest}</strong></div>
            </div>
          ) : (
            "Enter loan values to calculate monthly payment."
          )}
        </div>
      </div>
    </Card>
  );
}

function EMICalculator() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [months, setMonths] = useState("");

  const result = useMemo(() => {
    const p = Number(principal);
    const m = Number(months);
    const monthlyRate = Number(annualRate) / 100 / 12;

    if (!p || !m || m <= 0) return null;

    if (monthlyRate === 0) {
      const emi = p / m;
      return {
        emi: emi.toFixed(2),
        total: (emi * m).toFixed(2),
        interest: "0.00",
      };
    }

    const emi =
      (p * monthlyRate * Math.pow(1 + monthlyRate, m)) /
      (Math.pow(1 + monthlyRate, m) - 1);

    const total = emi * m;
    const interest = total - p;

    return {
      emi: emi.toFixed(2),
      total: total.toFixed(2),
      interest: interest.toFixed(2),
    };
  }, [principal, annualRate, months]);

  return (
    <Card title="EMI Calculator">
      <div className="grid gap-4">
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="Loan amount"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={annualRate}
          onChange={(e) => setAnnualRate(e.target.value)}
          placeholder="Annual interest rate (%)"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="Loan tenure in months"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          {result ? (
            <div className="grid gap-2">
              <div>Monthly EMI: <strong>{result.emi}</strong></div>
              <div>Total Payment: <strong>{result.total}</strong></div>
              <div>Total Interest: <strong>{result.interest}</strong></div>
            </div>
          ) : (
            "Enter EMI values to calculate payment."
          )}
        </div>
      </div>
    </Card>
  );
}

function PercentageCalculator() {
  const [mode, setMode] = useState<"of" | "whatPercent" | "change">("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const first = Number(a);
    const second = Number(b);

    if (!Number.isFinite(first) || !Number.isFinite(second) || a === "" || b === "") {
      return "";
    }

    if (mode === "of") return `${((first / 100) * second).toFixed(2)}`;
    if (mode === "whatPercent") {
      if (second === 0) return "Cannot divide by zero";
      return `${((first / second) * 100).toFixed(2)}%`;
    }
    if (second === 0) return "Cannot divide by zero";
    return `${(((first - second) / second) * 100).toFixed(2)}%`;
  }, [mode, a, b]);

  return (
    <Card title="Percentage Calculator">
      <div className="grid gap-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "of" | "whatPercent" | "change")}
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        >
          <option value="of">What is A% of B?</option>
          <option value="whatPercent">A is what percent of B?</option>
          <option value="change">Percentage change from B to A</option>
        </select>

        <input
          type="number"
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="Value A"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="Value B"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          Result: <strong>{result || "Enter values to calculate."}</strong>
        </div>
      </div>
    </Card>
  );
}

function SimpleInterestCalculator(config: Record<string, unknown>) {
  const title = String(config.title || "Simple Interest Calculator");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");

  const result = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate);
    const t = Number(time);

    if (!p || !r || !t) return null;

    const interest = (p * r * t) / 100;
    const total = p + interest;

    return {
      interest: interest.toFixed(2),
      total: total.toFixed(2),
    };
  }, [principal, rate, time]);

  return (
    <Card title={title}>
      <div className="grid gap-4">
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="Principal amount"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate (%)"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Time (years)"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          {result ? (
            <div className="grid gap-2">
              <div>Interest: <strong>{result.interest}</strong></div>
              <div>Total Amount: <strong>{result.total}</strong></div>
            </div>
          ) : (
            "Enter values to calculate simple interest."
          )}
        </div>
      </div>
    </Card>
  );
}

function GSTCalculator(config: Record<string, unknown>) {
  const title = String(config.title || "GST Calculator");
  const defaultRate = Number(config.defaultRate ?? 18);

  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(String(defaultRate));
  const [mode, setMode] = useState<"add" | "remove">("add");

  const result = useMemo(() => {
    const amt = Number(amount);
    const gstRate = Number(rate);

    if (!amt || !gstRate) return null;

    if (mode === "add") {
      const gst = (amt * gstRate) / 100;
      return {
        gst: gst.toFixed(2),
        total: (amt + gst).toFixed(2),
      };
    }

    const base = amt / (1 + gstRate / 100);
    const gst = amt - base;
    return {
      gst: gst.toFixed(2),
      total: base.toFixed(2),
    };
  }, [amount, rate, mode]);

  return (
    <Card title={title}>
      <div className="grid gap-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "add" | "remove")}
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        >
          <option value="add">Add GST</option>
          <option value="remove">Remove GST</option>
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="GST rate (%)"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
          {result ? (
            <div className="grid gap-2">
              <div>GST Amount: <strong>{result.gst}</strong></div>
              <div>{mode === "add" ? "Total with GST" : "Base Amount"}: <strong>{result.total}</strong></div>
            </div>
          ) : (
            "Enter values to calculate GST."
          )}
        </div>
      </div>
    </Card>
  );
}

function GenericCalculator() {
  return (
    <Card title="Calculator Interface">
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
        This calculator page is live and database-driven. You can attach a
        more specific calculator engine later.
      </div>
    </Card>
  );
}

export default function BuiltInCalculatorClient({ item }: Props) {
  const engine = item.engine_type || inferEngineType("calculator", item.slug);
  const config = item.engine_config || {};

  if (engine === "age-calculator") return <AgeCalculator />;
  if (engine === "bmi-calculator") return <BMICalculator />;
  if (engine === "loan-calculator") return <LoanCalculator />;
  if (engine === "emi-calculator") return <EMICalculator />;
  if (engine === "percentage-calculator") return <PercentageCalculator />;
  if (engine === "simple-interest-calculator") return <SimpleInterestCalculator {...{ config }} />;
  if (engine === "gst-calculator") return <GSTCalculator {...{ config }} />;

  return <GenericCalculator />;
}