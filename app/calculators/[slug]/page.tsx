"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import {
  getCalculatorBySlug,
  getRelatedCalculators,
} from "@/lib/data/calculators";

export default function CalculatorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const calculator = getCalculatorBySlug(slug);
  const relatedCalculators = getRelatedCalculators(slug);

  const [birthDate, setBirthDate] = useState("");
  const [partValue, setPartValue] = useState("");
  const [wholeValue, setWholeValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanYears, setLoanYears] = useState("");

  const ageResult = useMemo(() => {
    if (!birthDate) return null;

    const today = new Date();
    const dob = new Date(birthDate);

    if (Number.isNaN(dob.getTime()) || dob > today) return null;

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  }, [birthDate]);

  const percentageResult = useMemo(() => {
    const part = Number(partValue);
    const whole = Number(wholeValue);

    if (!wholeValue || !partValue || whole === 0 || Number.isNaN(part) || Number.isNaN(whole)) {
      return null;
    }

    return ((part / whole) * 100).toFixed(2);
  }, [partValue, wholeValue]);

  const emiResult = useMemo(() => {
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const years = Number(loanYears);

    if (
      !loanAmount ||
      !interestRate ||
      !loanYears ||
      principal <= 0 ||
      annualRate <= 0 ||
      years <= 0
    ) {
      return null;
    }

    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return {
      emi: emi.toFixed(2),
      totalPayment: (emi * months).toFixed(2),
      totalInterest: (emi * months - principal).toFixed(2),
    };
  }, [loanAmount, interestRate, loanYears]);

  if (!calculator) {
    return (
      <main className="min-h-screen bg-gray-950 p-10 text-white">
        <Link
          href="/calculators"
          className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Calculators
        </Link>
        <h1 className="mb-4 text-4xl font-bold">Calculator Not Found</h1>
        <p className="text-gray-400">
          The calculator you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <Link
        href="/calculators"
        className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300"
      >
        ← Back to Calculators
      </Link>

      <h1 className="mb-4 text-4xl font-bold">{calculator.name}</h1>
      <p className="mb-8 max-w-2xl text-gray-400">{calculator.description}</p>

      {slug === "age-calculator" && (
        <div className="max-w-2xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <label className="mb-2 block text-sm text-gray-400">Date of Birth</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mb-6 w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
          />

          <div className="rounded-xl bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Your Age</p>
            <p className="text-2xl font-bold">
              {ageResult
                ? `${ageResult.years} years, ${ageResult.months} months, ${ageResult.days} days`
                : "Select a valid birth date"}
            </p>
          </div>
        </div>
      )}

      {slug === "percentage-calculator" && (
        <div className="max-w-2xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Part Value</label>
            <input
              type="number"
              value={partValue}
              onChange={(e) => setPartValue(e.target.value)}
              placeholder="Enter part value"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">Whole Value</label>
            <input
              type="number"
              value={wholeValue}
              onChange={(e) => setWholeValue(e.target.value)}
              placeholder="Enter whole value"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="rounded-xl bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Percentage</p>
            <p className="text-2xl font-bold">
              {percentageResult ? `${percentageResult}%` : "Enter valid values"}
            </p>
          </div>
        </div>
      )}

      {slug === "emi-calculator" && (
        <div className="max-w-2xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Loan Amount</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="Enter loan amount"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Annual Interest Rate (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Enter interest rate"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">Loan Term (Years)</label>
            <input
              type="number"
              value={loanYears}
              onChange={(e) => setLoanYears(e.target.value)}
              placeholder="Enter loan term in years"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Monthly EMI</p>
              <p className="mt-2 text-xl font-bold">{emiResult ? emiResult.emi : "--"}</p>
            </div>

            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Total Payment</p>
              <p className="mt-2 text-xl font-bold">
                {emiResult ? emiResult.totalPayment : "--"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Total Interest</p>
              <p className="mt-2 text-xl font-bold">
                {emiResult ? emiResult.totalInterest : "--"}
              </p>
            </div>
          </div>
        </div>
      )}

      {relatedCalculators.length > 0 && (
        <section className="mt-12 max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold">Related Calculators</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCalculators.map((relatedCalculator) => (
              <Link
                key={relatedCalculator.slug}
                href={`/calculators/${relatedCalculator.slug}`}
                className="rounded-xl bg-gray-900 p-4 transition hover:bg-gray-800"
              >
                <h3 className="font-semibold">{relatedCalculator.name}</h3>
                <p className="mt-2 text-sm text-gray-400">
                  {relatedCalculator.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}