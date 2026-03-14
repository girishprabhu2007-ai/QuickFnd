"use client";

import { useMemo, useState } from "react";

type Props = {
  slug: string;
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
              <div>
                Monthly Payment: <strong>{result.monthly}</strong>
              </div>
              <div>
                Total Payment: <strong>{result.total}</strong>
              </div>
              <div>
                Total Interest: <strong>{result.interest}</strong>
              </div>
            </div>
          ) : (
            "Enter loan values to calculate monthly payment."
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
        This calculator page is live and database-driven. You can add a custom
        formula interface for this calculator later.
      </div>
    </Card>
  );
}

export default function BuiltInCalculatorClient({ slug }: Props) {
  if (slug === "age-calculator") return <AgeCalculator />;
  if (slug === "bmi-calculator") return <BMICalculator />;
  if (slug === "loan-calculator") return <LoanCalculator />;
  return <GenericCalculator />;
}