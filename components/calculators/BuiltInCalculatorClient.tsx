"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import { inferEngineType } from "@/lib/engine-metadata";

type Props = {
  item: PublicContentItem;
};

type InterpretedResult = {
  primary: string;
  secondary: string;
  extra?: string;
  insight?: string;
  recommendation?: string;
  notes?: string[];
};

function Workspace({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-q-border bg-q-card p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
          Calculator Workspace
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-q-text md:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function CalculatorGrid({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">{left}{right}</div>;
}

function InputPanel({
  title = "Inputs",
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-q-border bg-q-bg p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-2 text-sm leading-6 text-q-muted">{subtitle}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ResultsStage({
  title = "Result",
  result,
  emptyText,
}: {
  title?: string;
  result: InterpretedResult | null;
  emptyText: string;
}) {
  return (
    <section className="rounded-[26px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
            Output
          </div>
          <div className="mt-2 text-lg font-semibold text-q-text">{title}</div>
        </div>
        <span
          className={
            result
              ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
              : "rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium text-q-muted"
          }
        >
          {result ? "Ready" : "Waiting"}
        </span>
      </div>

      {result ? (
        <ResultInterpretation result={result} />
      ) : (
        <div className="rounded-2xl border border-q-border bg-q-card p-5 text-sm leading-7 text-q-muted">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function ResultInterpretation({ result }: { result: InterpretedResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-q-border bg-q-card p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
          {result.secondary}
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight text-q-text">
          {result.primary}
        </div>
        {result.extra ? (
          <div className="mt-3 text-sm leading-7 text-q-muted">{result.extra}</div>
        ) : null}
      </div>

      {result.insight ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-slate-800">
          <div className="font-semibold">What this means</div>
          <div className="mt-1">{result.insight}</div>
        </div>
      ) : null}

      {result.recommendation ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
          <div className="font-semibold">Recommendation</div>
          <div className="mt-1">{result.recommendation}</div>
        </div>
      ) : null}

      {result.notes && result.notes.length > 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-4 text-sm text-q-muted">
          <div className="font-semibold text-q-text">Notes</div>
          <ul className="mt-2 grid gap-2">
            {result.notes.map((note, index) => (
              <li key={`${note}-${index}`}>• {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function fieldClass() {
  return "w-full rounded-2xl border border-q-border bg-q-card px-4 py-3.5 text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-white";
}

function selectClass() {
  return fieldClass();
}

function formatNumber(value: number, decimals = 2) {
  return value.toFixed(decimals);
}

function formatCurrency(value: number, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "0.00";
}

function getBMIInterpretation(bmi: number) {
  if (bmi < 18.5) {
    return {
      category: "Underweight",
      insight:
        "Your BMI is below the standard healthy range. This can be a signal to review nutrition, activity levels, or overall health context.",
      recommendation:
        "Consider tracking nutrition and speaking with a healthcare professional if low weight is unintentional.",
    };
  }

  if (bmi < 25) {
    return {
      category: "Normal",
      insight: "Your BMI is within the standard healthy range for most adults.",
      recommendation:
        "Maintain current habits with balanced nutrition, sleep, and regular activity.",
    };
  }

  if (bmi < 30) {
    return {
      category: "Overweight",
      insight:
        "Your BMI is above the standard healthy range. BMI is only a screening metric, but it may indicate elevated health risk over time.",
      recommendation:
        "Focus on sustainable diet, movement, and sleep improvements rather than short-term changes.",
    };
  }

  return {
    category: "Obesity",
    insight:
      "Your BMI is in a high-risk range. BMI alone is not a diagnosis, but it can indicate a need for more complete health review.",
    recommendation:
      "Consider a professional medical assessment for a more accurate evaluation beyond BMI alone.",
  };
}

function getLoanInterpretation(principal: number, interest: number) {
  const interestShare = principal > 0 ? (interest / principal) * 100 : 0;

  if (interestShare < 15) {
    return {
      insight:
        "This loan has a relatively low total interest burden compared with the borrowed amount.",
      recommendation:
        "This is generally efficient borrowing, but still compare against prepayment options and fees.",
    };
  }

  if (interestShare < 50) {
    return {
      insight:
        "A meaningful portion of the total repayment is interest, which is common for medium-term loans.",
      recommendation:
        "Try a shorter term or lower rate quote to reduce total interest if cash flow allows.",
    };
  }

  return {
    insight:
      "You will repay substantially more than the borrowed amount over the full term.",
    recommendation:
      "Review whether a shorter tenure, larger down payment, or refinancing option can reduce interest burden.",
  };
}

function getGSTInterpretation(mode: "add" | "remove", amount: number, rate: number) {
  if (mode === "add") {
    return {
      insight:
        "This shows the tax amount added on top of your base price and the final billed amount.",
      recommendation:
        amount > 0 && rate > 0
          ? "Use this when pricing invoices or checking whether quoted totals match expected tax."
          : "Enter a valid amount and GST rate for a meaningful result.",
    };
  }

  return {
    insight:
      "This splits a tax-inclusive amount into the original base amount and the GST portion already included.",
    recommendation:
      "Use this when you only have the final billed amount and need to recover the pre-tax value.",
  };
}

function getPercentageInterpretation(
  mode: "of" | "whatPercent" | "change",
  result: number
) {
  if (mode === "of") {
    return {
      insight: "This calculates a percentage portion of a whole value.",
      recommendation:
        "Useful for discounts, commissions, tax portions, and proportional breakdowns.",
    };
  }

  if (mode === "whatPercent") {
    return {
      insight: "This tells you how large A is relative to B as a percentage.",
      recommendation:
        result > 100
          ? "Since the result is above 100%, A is larger than B."
          : "Use this when comparing contribution, completion, or share of total.",
    };
  }

  return {
    insight:
      "This measures relative growth or decline from the original value B to the new value A.",
    recommendation:
      result >= 0
        ? "Positive values indicate growth; compare over equal time periods for fair analysis."
        : "Negative values indicate decline; check whether the baseline value is appropriate.",
  };
}

function getRateInterpretation(rate: number, label: string) {
  if (rate <= 0) {
    return {
      insight: `${label} is zero or negative, which usually means there is no measurable output in the chosen period.`,
      recommendation: "Check both the input count and the period value.",
    };
  }

  if (rate < 1) {
    return {
      insight: `${label} is below 1 per unit period, which suggests a slow rate of output.`,
      recommendation:
        "Try a longer observation period if the value looks too small to interpret easily.",
    };
  }

  if (rate < 10) {
    return {
      insight: `${label} is moderate and likely realistic for ongoing work or growth activity.`,
      recommendation:
        "Compare this against historical averages or team benchmarks for better meaning.",
    };
  }

  return {
    insight: `${label} is high relative to a single period.`,
    recommendation:
      "Double-check that the period unit is correct and that the input volume is realistic.",
  };
}

function getProbabilityInterpretation(percentage: number) {
  if (percentage < 20) {
    return {
      insight: "This is a relatively low probability.",
      recommendation:
        "Low does not mean impossible. Use it as directional context, not certainty.",
    };
  }

  if (percentage < 60) {
    return {
      insight: "This is a moderate probability where outcomes are still uncertain.",
      recommendation:
        "Treat the result as a planning signal and combine it with real-world constraints or additional data.",
    };
  }

  return {
    insight: "This is a high probability based on the values entered.",
    recommendation:
      "High probability still does not guarantee the outcome. Validate assumptions before acting on it.",
  };
}

function getTimeBudgetInterpretation(free: number, total: number) {
  if (free < 0) {
    return {
      insight:
        "You have allocated more hours than fit into the day, which means the plan is overcommitted.",
      recommendation:
        "Reduce one or more commitments, or spread tasks across multiple days to avoid burnout.",
    };
  }

  if (free < 1) {
    return {
      insight:
        "Your schedule is extremely tight, leaving almost no buffer for breaks, delays, or recovery.",
      recommendation:
        "Add at least a small margin for rest and unexpected tasks if this is meant to be sustainable.",
    };
  }

  if (free <= total * 0.25) {
    return {
      insight: "You still have some free time, but your day is heavily scheduled.",
      recommendation:
        "Protect this remaining time for rest, transitions, and unplanned tasks instead of filling it completely.",
    };
  }

  return {
    insight: "Your schedule leaves a healthy amount of unallocated time.",
    recommendation:
      "You likely have room for recovery, flexibility, or optional tasks without overcrowding the day.",
  };
}

function getRevenueInterpretation(revenue: number) {
  if (revenue <= 0) {
    return {
      insight:
        "The estimated revenue is zero or negative based on your current inputs.",
      recommendation:
        "Check both traffic volume and RPM assumptions before relying on the estimate.",
    };
  }

  if (revenue < 100) {
    return {
      insight:
        "This is a modest revenue estimate, which may be realistic for smaller traffic volumes or lower monetization quality.",
      recommendation:
        "Improve either traffic scale or RPM assumptions if this result is below your target.",
    };
  }

  if (revenue < 1000) {
    return {
      insight: "This is a meaningful mid-range revenue estimate.",
      recommendation:
        "Use this as a directional forecast and compare it against historical performance or niche benchmarks.",
    };
  }

  return {
    insight:
      "This is a large estimated revenue value relative to many small-to-mid traffic scenarios.",
    recommendation:
      "Stress-test the assumptions, especially RPM, because optimistic inputs can overstate projected earnings.",
  };
}

function getUnixTimestampNotes() {
  return [
    "Unix timestamps are typically measured in seconds since January 1, 1970 UTC.",
    "The converted ISO date is shown in UTC by default.",
    "If you expected a local time, compare it against your timezone separately.",
  ];
}

function AgeCalculator({ name = "" }: { name?: string }) {
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

    const nextBirthday = new Date(
      today.getFullYear(),
      birth.getMonth(),
      birth.getDate()
    );
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const msUntilBirthday = nextBirthday.getTime() - today.getTime();
    const daysUntilBirthday = Math.ceil(msUntilBirthday / (1000 * 60 * 60 * 24));

    return {
      primary: `${years} years, ${months} months, ${days} days`,
      secondary: "Calculated age",
      extra: `Next birthday in approximately ${daysUntilBirthday} day${
        daysUntilBirthday === 1 ? "" : "s"
      }.`,
      insight:
        "This calculates exact calendar age based on your birth date and today’s date.",
      recommendation:
        "Use this for eligibility checks, forms, school admissions, or age-based planning.",
    } satisfies InterpretedResult;
  }, [birthDate]);

  return (
    <Workspace title={name || "Age Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel
            subtitle="Choose a birth date to calculate current age and next birthday timing."
          >
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={fieldClass()}
            />
          </InputPanel>
        }
        right={
          <ResultsStage
            title="Age summary"
            result={result}
            emptyText="Choose a birth date to calculate age."
          />
        }
      />
    </Workspace>
  );
}

function BMICalculator({ name = "" }: { name?: string }) {
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (!height || !weight) return null;

    const bmi = weight / Math.pow(height / 100, 2);
    const interpretation = getBMIInterpretation(bmi);

    return {
      primary: `${bmi.toFixed(1)} (${interpretation.category})`,
      secondary: "BMI",
      insight: interpretation.insight,
      recommendation: interpretation.recommendation,
      notes: [
        "BMI is a screening metric, not a full medical diagnosis.",
        "Very muscular or highly trained individuals may see misleading BMI values.",
      ],
    };
  }, [heightCm, weightKg]);

  return (
    <Workspace title={name || "BMI Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Enter height and weight to estimate body mass index.">
            <div className="grid gap-4">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Height in cm"
                className={fieldClass()}
              />
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Weight in kg"
                className={fieldClass()}
              />
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="BMI result"
            result={result}
            emptyText="Enter height and weight to calculate BMI."
          />
        }
      />
    </Workspace>
  );
}

function LoanCalculator({ name = "" }: { name?: string }) {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(principal);
    const y = Number(years);
    const monthlyRate = Number(annualRate) / 100 / 12;
    const payments = y * 12;

    if (!p || !y || payments <= 0) return null;

    if (monthlyRate === 0) {
      const monthly = p / payments;
      const interpretation = getLoanInterpretation(p, 0);

      return {
        primary: formatCurrency(monthly),
        secondary: "Monthly payment",
        extra: `Total payment: ${formatCurrency(monthly * payments)} · Total interest: ${formatCurrency(0)}`,
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
      };
    }

    const monthly =
      (p * monthlyRate * Math.pow(1 + monthlyRate, payments)) /
      (Math.pow(1 + monthlyRate, payments) - 1);

    const total = monthly * payments;
    const interest = total - p;
    const interpretation = getLoanInterpretation(p, interest);

    return {
      primary: formatCurrency(monthly),
      secondary: "Monthly payment",
      extra: `Total payment: ${formatCurrency(total)} · Total interest: ${formatCurrency(interest)}`,
      insight: interpretation.insight,
      recommendation: interpretation.recommendation,
    };
  }, [principal, annualRate, years]);

  return (
    <Workspace title={name || "Loan Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Estimate monthly repayment and total borrowing cost.">
            <div className="grid gap-4">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="Loan amount"
                className={fieldClass()}
              />
              <input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                placeholder="Annual interest rate (%)"
                className={fieldClass()}
              />
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="Repayment years"
                className={fieldClass()}
              />
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="Loan summary"
            result={result}
            emptyText="Enter loan values to calculate monthly payment."
          />
        }
      />
    </Workspace>
  );
}

function EMICalculator({ name = "" }: { name?: string }) {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [months, setMonths] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(principal);
    const m = Number(months);
    const monthlyRate = Number(annualRate) / 100 / 12;

    if (!p || !m || m <= 0) return null;

    if (monthlyRate === 0) {
      const emi = p / m;
      return {
        primary: formatCurrency(emi),
        secondary: "Monthly EMI",
        extra: `Total payment: ${formatCurrency(emi * m)} · Total interest: ${formatCurrency(0)}`,
        insight:
          "With a zero interest rate, your EMI is simply the principal divided by the total months.",
        recommendation:
          "Use this as a baseline to compare how much the interest rate changes your repayment burden.",
      };
    }

    const emi =
      (p * monthlyRate * Math.pow(1 + monthlyRate, m)) /
      (Math.pow(1 + monthlyRate, m) - 1);

    const total = emi * m;
    const interest = total - p;
    const loanNotes = getLoanInterpretation(p, interest);

    return {
      primary: formatCurrency(emi),
      secondary: "Monthly EMI",
      extra: `Total payment: ${formatCurrency(total)} · Total interest: ${formatCurrency(interest)}`,
      insight: `This EMI reflects the monthly payment needed to fully repay the loan in ${m} month${
        m === 1 ? "" : "s"
      }. ${loanNotes.insight}`,
      recommendation: loanNotes.recommendation,
    };
  }, [principal, annualRate, months]);

  return (
    <Workspace title={name || "EMI Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Estimate monthly EMI for a loan tenure in months.">
            <div className="grid gap-4">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="Loan amount"
                className={fieldClass()}
              />
              <input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                placeholder="Annual interest rate (%)"
                className={fieldClass()}
              />
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                placeholder="Loan tenure in months"
                className={fieldClass()}
              />
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="EMI summary"
            result={result}
            emptyText="Enter EMI values to calculate payment."
          />
        }
      />
    </Workspace>
  );
}

function PercentageCalculator({ config = {}, name = "" }: { config?: Record<string, unknown>; name?: string }) {
  const [mode, setMode] = useState<"of" | "whatPercent" | "change">("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const first = Number(a);
    const second = Number(b);

    if (
      !Number.isFinite(first) ||
      !Number.isFinite(second) ||
      a === "" ||
      b === ""
    ) {
      return null;
    }

    if (mode === "of") {
      const value = (first / 100) * second;
      const info = getPercentageInterpretation(mode, value);
      return {
        primary: formatNumber(value),
        secondary: "Calculated value",
        insight: info.insight,
        recommendation: info.recommendation,
      };
    }

    if (mode === "whatPercent") {
      if (second === 0) {
        return {
          primary: "Cannot divide by zero",
          secondary: "Result",
          insight: "A percentage comparison needs a non-zero baseline value.",
          recommendation: "Use a non-zero value for B.",
        };
      }

      const value = (first / second) * 100;
      const info = getPercentageInterpretation(mode, value);

      return {
        primary: `${formatNumber(value)}%`,
        secondary: "Percentage relationship",
        insight: info.insight,
        recommendation: info.recommendation,
      };
    }

    if (second === 0) {
      return {
        primary: "Cannot divide by zero",
        secondary: "Result",
        insight: "Percentage change needs a valid original value.",
        recommendation: "Use a non-zero starting value for B.",
      };
    }

    const value = ((first - second) / second) * 100;
    const info = getPercentageInterpretation(mode, value);

    return {
      primary: `${formatNumber(value)}%`,
      secondary: "Percentage change",
      insight: info.insight,
      recommendation: info.recommendation,
    };
  }, [mode, a, b]);

  return (
    <Workspace title={name || "Percentage Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Compare values as percentages, portions, or relative change.">
            <div className="grid gap-4">
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "of" | "whatPercent" | "change")
                }
                className={selectClass()}
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
                className={fieldClass()}
              />
              <input
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="Value B"
                className={fieldClass()}
              />
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="Percentage result"
            result={result}
            emptyText="Enter values to calculate."
          />
        }
      />
    </Workspace>
  );
}

function SimpleInterestCalculator(config: Record<string, unknown>) {
  const title = String(config.title || "Simple Interest Calculator");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(principal);
    const r = Number(rate);
    const t = Number(time);

    if (!p || !r || !t) return null;

    const interest = (p * r * t) / 100;
    const total = p + interest;
    const interestShare = (interest / p) * 100;

    return {
      primary: formatCurrency(interest),
      secondary: "Simple interest",
      extra: `Total amount after interest: ${formatCurrency(total)}`,
      insight:
        "Simple interest grows linearly because interest is calculated only on the original principal.",
      recommendation:
        interestShare > 50
          ? "The interest cost is large relative to the principal. Compare with shorter duration or lower-rate options."
          : "Use this as a baseline before comparing against compound interest products.",
    };
  }, [principal, rate, time]);

  return (
    <Workspace title={title}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Estimate interest earned or owed on a simple-interest basis.">
            <div className="grid gap-4">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="Principal amount"
                className={fieldClass()}
              />
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Rate (%)"
                className={fieldClass()}
              />
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time (years)"
                className={fieldClass()}
              />
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="Interest summary"
            result={result}
            emptyText="Enter values to calculate simple interest."
          />
        }
      />
    </Workspace>
  );
}

function GSTCalculator(config: Record<string, unknown>) {
  const title = String(config.title || "GST Calculator");
  const defaultRate = Number(config.defaultRate ?? 18);

  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(String(defaultRate));
  const [mode, setMode] = useState<"add" | "remove">("add");

  const result = useMemo<InterpretedResult | null>(() => {
    const amt = Number(amount);
    const gstRate = Number(rate);

    if (!amt || !gstRate) return null;

    if (mode === "add") {
      const gst = (amt * gstRate) / 100;
      const interpretation = getGSTInterpretation(mode, amt, gstRate);

      return {
        primary: formatCurrency(gst),
        secondary: "GST amount",
        extra: `Total with GST: ${formatCurrency(amt + gst)}`,
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
      };
    }

    const base = amt / (1 + gstRate / 100);
    const gst = amt - base;
    const interpretation = getGSTInterpretation(mode, amt, gstRate);

    return {
      primary: formatCurrency(gst),
      secondary: "GST amount included",
      extra: `Base amount before GST: ${formatCurrency(base)}`,
      insight: interpretation.insight,
      recommendation: interpretation.recommendation,
    };
  }, [amount, rate, mode]);

  return (
    <Workspace title={title}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Add GST to a base amount or remove GST from a tax-inclusive total.">
            <div className="grid gap-4">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "add" | "remove")}
                className={selectClass()}
              >
                <option value="add">Add GST</option>
                <option value="remove">Remove GST</option>
              </select>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className={fieldClass()}
              />
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="GST rate (%)"
                className={fieldClass()}
              />
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="GST summary"
            result={result}
            emptyText="Enter values to calculate GST."
          />
        }
      />
    </Workspace>
  );
}

function FormulaCalculator({
  config,
  name,
}: {
  config: Record<string, unknown>;
  name: string;
}) {
  const preset = String(config.preset || "").trim().toLowerCase();

  const [values, setValues] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"timestamp-to-date" | "date-to-timestamp">(
    "timestamp-to-date"
  );
  const [dateTimeValue, setDateTimeValue] = useState("");

  const fieldDefinitions = useMemo(() => {
    if (Array.isArray(config.fields) && config.fields.length > 0) {
      return config.fields.map((field, index) => {
        const record =
          field && typeof field === "object"
            ? (field as Record<string, unknown>)
            : {};

        return {
          key: String(record.key || `field_${index + 1}`),
          label: String(record.label || record.key || `Field ${index + 1}`),
          placeholder: String(record.placeholder || record.label || record.key || ""),
        };
      });
    }

    switch (preset) {
      case "tip-split":
        return [
          { key: "bill", label: "Bill amount", placeholder: "50.00" },
          { key: "tip_pct", label: "Tip percentage (%)", placeholder: "15" },
          { key: "people", label: "Number of people", placeholder: "2" },
        ];
      case "discount":
        return [
          { key: "original", label: "Original price", placeholder: "100.00" },
          { key: "discount_pct", label: "Discount (%)", placeholder: "20" },
        ];
      case "vat":
        return [
          { key: "amount", label: "Amount", placeholder: "100.00" },
          { key: "rate", label: "VAT / tax rate (%)", placeholder: "20" },
          { key: "direction", label: "Mode: add or extract", placeholder: "add" },
        ];
      case "sales-tax":
        return [
          { key: "price", label: "Price before tax", placeholder: "100.00" },
          { key: "rate", label: "Tax rate (%)", placeholder: "10" },
        ];
      case "mortgage":
        return [
          { key: "principal", label: "Loan amount", placeholder: "300000" },
          { key: "rate", label: "Annual interest rate (%)", placeholder: "4.5" },
          { key: "years", label: "Loan term (years)", placeholder: "25" },
        ];
      case "calories":
        return [
          { key: "age", label: "Age (years)", placeholder: "30" },
          { key: "weight", label: "Weight (kg)", placeholder: "70" },
          { key: "height", label: "Height (cm)", placeholder: "175" },
          { key: "gender", label: "Gender (male or female)", placeholder: "male" },
          { key: "activity", label: "Activity (1=sedentary 2=light 3=moderate 4=active 5=very active)", placeholder: "2" },
        ];
      case "fuel-cost":
        return [
          { key: "distance", label: "Distance (km)", placeholder: "100" },
          { key: "efficiency", label: "Fuel use per 100km (litres)", placeholder: "8" },
          { key: "price", label: "Fuel price per litre", placeholder: "1.50" },
        ];
      case "inflation":
        return [
          { key: "amount", label: "Original amount", placeholder: "1000" },
          { key: "from_year", label: "From year", placeholder: "2000" },
          { key: "to_year", label: "To year", placeholder: "2024" },
          { key: "rate", label: "Average annual inflation rate (%)", placeholder: "3" },
        ];
      case "ratio-percentage":
        return [
          { key: "numerator", label: String(config.numeratorLabel || "Value (part)"), placeholder: "25" },
          { key: "denominator", label: String(config.denominatorLabel || "Total (whole)"), placeholder: "100" },
        ];

      case "uptime-percentage":
        return [
          { key: "uptime_hours", label: "Server uptime (hours)", placeholder: "719" },
          { key: "total_hours", label: "Total period (hours, e.g. 720 = 30 days)", placeholder: "720" },
        ];

      case "growth-rate":
        return [
          { key: "current", label: String(config.numeratorLabel || "Current value"), placeholder: "150" },
          { key: "previous", label: String(config.denominatorLabel || "Previous value"), placeholder: "100" },
        ];

      case "daily-time-budget":
        return [
          { key: "total_hours", label: "Total hours in day", placeholder: "24" },
          { key: "sleep_hours", label: "Sleep hours", placeholder: "8" },
          { key: "work_hours", label: "Work hours", placeholder: "8" },
          { key: "commute_hours", label: "Commute hours", placeholder: "1" },
          { key: "exercise_hours", label: "Exercise hours", placeholder: "1" },
          { key: "other_hours", label: "Other planned hours", placeholder: "2" },
        ];

      case "api-rate-limit":
        return [
          { key: "requests", label: "Allowed requests", placeholder: "1000" },
          { key: "window_seconds", label: "Window seconds", placeholder: "60" },
        ];

      case "cost-estimator":
        return [
          {
            key: "quantity",
            label: String(config.quantityLabel || "Quantity"),
            placeholder: "100",
          },
          {
            key: "unit_cost",
            label: String(config.unitCostLabel || "Unit cost"),
            placeholder: "2.5",
          },
          {
            key: "overhead_percent",
            label: String(config.overheadLabel || "Overhead %"),
            placeholder: "10",
          },
        ];

      case "rate-estimator":
        return [
          {
            key: "numerator",
            label: String(config.numeratorLabel || "Units"),
            placeholder: "20",
          },
          {
            key: "period",
            label: String(config.periodLabel || "Period"),
            placeholder: "5",
          },
        ];

      case "revenue-estimator":
        return [
          {
            key: "views",
            label: String(config.viewsLabel || "Views"),
            placeholder: "100000",
          },
          {
            key: "rpm",
            label: String(config.rpmLabel || "RPM"),
            placeholder: "3.5",
          },
        ];

      case "time-conversion":
        return [
          { key: "value", label: "Value to convert", placeholder: "60" },
          { key: "from_unit", label: "From unit", placeholder: "minutes" },
          { key: "to_unit", label: "To unit", placeholder: "hours" },
        ];

      case "datetime-difference":
        return [
          { key: "start_date", label: "Start date (YYYY-MM-DD)", placeholder: "2024-01-01" },
          { key: "end_date", label: "End date (YYYY-MM-DD)", placeholder: "2024-12-31" },
        ];

      case "shift-hours":
        return [
          { key: "start_hour", label: "Shift start (24h, e.g. 9 for 9am)", placeholder: "9" },
          { key: "end_hour", label: "Shift end (24h, e.g. 17 for 5pm)", placeholder: "17" },
          { key: "break_minutes", label: "Break minutes", placeholder: "30" },
        ];

      case "sleep-cycle":
        return [
          { key: "sleep_time", label: "Bedtime (24h hour, e.g. 23 for 11pm)", placeholder: "23" },
          { key: "cycles", label: "Sleep cycles (each ~90 min, usually 5-6)", placeholder: "5" },
        ];

      case "project-time-estimator":
        return [
          { key: "tasks", label: "Number of tasks", placeholder: "10" },
          { key: "hours_per_task", label: "Hours per task (estimate)", placeholder: "2" },
          { key: "buffer_pct", label: "Buffer % (e.g. 20 for 20% extra)", placeholder: "20" },
        ];

      case "countdown":
        return [
          { key: "target_days", label: "Days until the event", placeholder: "30" },
          { key: "hours_per_day", label: "Working hours per day", placeholder: "8" },
        ];

      case "pomodoro":
        return [
          { key: "focus_minutes", label: "Focus session (minutes)", placeholder: "25" },
          { key: "break_minutes", label: "Short break (minutes)", placeholder: "5" },
          { key: "sessions", label: "Number of sessions", placeholder: "4" },
        ];

      case "timezone-difference":
        return [
          { key: "offset_a", label: "Timezone A offset from UTC (e.g. 5.5 for IST)", placeholder: "5.5" },
          { key: "offset_b", label: "Timezone B offset from UTC (e.g. -5 for EST)", placeholder: "-5" },
        ];

      case "unix-timestamp":
        return [
          { key: "timestamp", label: "Unix timestamp (seconds since 1970)", placeholder: "1700000000" },
        ];

      case "probability":
      case "metric-ratio":
      default:
        return [
          {
            key: "a",
            label: String(config.numeratorLabel || "Value A"),
            placeholder: "10",
          },
          {
            key: "b",
            label: String(config.denominatorLabel || "Value B"),
            placeholder: "20",
          },
        ];
    }
  }, [config, preset]);

  const result = useMemo<InterpretedResult | null>(() => {
    if (preset === "unix-timestamp") {
      if (mode === "timestamp-to-date") {
        const timestamp = Number(values.timestamp || "");
        if (!Number.isFinite(timestamp)) return null;

        const date = new Date(timestamp * 1000);
        if (Number.isNaN(date.getTime())) return null;

        return {
          primary: date.toISOString(),
          secondary: "UTC date/time",
          insight:
            "This converts a Unix timestamp into a human-readable UTC date and time.",
          recommendation:
            "Use this when debugging logs, APIs, databases, or event records stored as Unix time.",
          notes: getUnixTimestampNotes(),
        };
      }

      if (!dateTimeValue) return null;
      const date = new Date(dateTimeValue);
      if (Number.isNaN(date.getTime())) return null;

      return {
        primary: String(Math.floor(date.getTime() / 1000)),
        secondary: "Unix timestamp",
        insight:
          "This converts a date/time input into a Unix timestamp measured in seconds.",
        recommendation:
          "Use this when preparing timestamps for APIs, databases, scheduling systems, or log comparisons.",
        notes: getUnixTimestampNotes(),
      };
    }

    if (preset === "tip-split") {
      const bill=Number(values.bill), tip=Number(values.tip_pct||15), ppl=Math.max(Number(values.people||1),1);
      if (!Number.isFinite(bill)||bill<=0) return null;
      const tipAmt=bill*(tip/100), total=bill+tipAmt, perPerson=total/ppl, tipPer=tipAmt/ppl;
      return { primary: perPerson.toFixed(2), secondary: "per person (incl. tip)", extra: `Tip total: ${tipAmt.toFixed(2)} · Each pays: ${perPerson.toFixed(2)} · Bill total: ${total.toFixed(2)}`, insight: `A ${tip}% tip on ${bill.toFixed(2)} = ${tipAmt.toFixed(2)} tip. Split ${ppl} ways: ${perPerson.toFixed(2)} each (${tipPer.toFixed(2)} tip per person).`, recommendation: "Standard tip: 15-20% for good service. 10% for average.", notes: ["Tip is typically calculated on the pre-tax subtotal"] };
    }
    if (preset === "discount") {
      const orig=Number(values.original), pct=Number(values.discount_pct);
      if (!Number.isFinite(orig)||!Number.isFinite(pct)) return null;
      const saving=orig*(pct/100), final=orig-saving;
      return { primary: final.toFixed(2), secondary: "final price", extra: `You save: ${saving.toFixed(2)} (${pct}% off ${orig.toFixed(2)})`, insight: `${pct}% discount on ${orig.toFixed(2)} saves ${saving.toFixed(2)}.`, recommendation: "Always compare the discounted price with competitors before purchasing.", notes: ["Price shown excludes applicable taxes"] };
    }
    if (preset === "vat") {
      const amount=Number(values.amount), rate=Number(values.rate||20), dir=(values.direction||"add").toLowerCase();
      if (!Number.isFinite(amount)||!Number.isFinite(rate)) return null;
      let net: number, vatAmt: number, gross: number;
      if (dir.includes("extract")) { net=amount/(1+rate/100); vatAmt=amount-net; gross=amount; }
      else { net=amount; vatAmt=amount*(rate/100); gross=amount+vatAmt; }
      return { primary: gross.toFixed(2), secondary: dir.includes("extract")?"gross (inc-tax)":"total (inc-tax)", extra: `Net: ${net.toFixed(2)} · Tax (${rate}%): ${vatAmt.toFixed(2)} · Gross: ${gross.toFixed(2)}`, insight: `At ${rate}% VAT: net ${net.toFixed(2)} + ${vatAmt.toFixed(2)} tax = ${gross.toFixed(2)} gross.`, recommendation: "Check the applicable rate for your country and product category.", notes: ["UK VAT: 20% standard · EU: 17-27% · Australia GST: 10% · USA: no federal VAT"] };
    }
    if (preset === "sales-tax") {
      const price=Number(values.price), rate=Number(values.rate);
      if (!Number.isFinite(price)||!Number.isFinite(rate)) return null;
      const tax=price*(rate/100), total=price+tax;
      return { primary: total.toFixed(2), secondary: "total with tax", extra: `Pre-tax: ${price.toFixed(2)} · Tax (${rate}%): ${tax.toFixed(2)} · Total: ${total.toFixed(2)}`, insight: `${rate}% tax on ${price.toFixed(2)} = ${tax.toFixed(2)} tax, ${total.toFixed(2)} total.`, recommendation: "US sales tax varies by state (0%–10.25%) and product category.", notes: ["Some states exempt groceries, medicine, and clothing from sales tax"] };
    }
    if (preset === "mortgage") {
      const P=Number(values.principal), ann=Number(values.rate), yrs=Number(values.years);
      if (!Number.isFinite(P)||!Number.isFinite(ann)||!Number.isFinite(yrs)||ann<=0) return null;
      const r=ann/100/12, n=yrs*12;
      const monthly=P*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
      const totalPaid=monthly*n, totalInterest=totalPaid-P;
      return { primary: monthly.toFixed(2), secondary: "monthly payment", extra: `Total paid: ${totalPaid.toFixed(2)} · Interest: ${totalInterest.toFixed(2)} · Loan: ${P.toFixed(2)}`, insight: `Over ${yrs} years at ${ann}%, you pay ${monthly.toFixed(2)}/month — ${totalInterest.toFixed(2)} in total interest.`, recommendation: "Even a 0.5% rate reduction saves tens of thousands over a 25-year term. Shop around.", notes: ["Assumes fixed rate. Variable rate mortgages will differ."] };
    }
    if (preset === "calories") {
      const age=Number(values.age), weight=Number(values.weight), height=Number(values.height), activity=Number(values.activity||2);
      const gender=(values.gender||"male").toLowerCase();
      if ([age,weight,height].some(v=>!Number.isFinite(v)||v<=0)) return null;
      const bmr=gender.includes("f") ? 10*weight+6.25*height-5*age-161 : 10*weight+6.25*height-5*age+5;
      const factors=[1,1.2,1.375,1.55,1.725,1.9];
      const tdee=bmr*(factors[Math.min(Math.floor(activity),5)]||1.375);
      return { primary: Math.round(tdee).toString(), secondary: "calories/day to maintain weight", extra: `BMR: ${Math.round(bmr)} · Weight loss: ${Math.round(tdee-500)} cal/day · Weight gain: ${Math.round(tdee+500)} cal/day`, insight: `Your BMR is ${Math.round(bmr)} calories. With your activity level, you need ${Math.round(tdee)} cal/day to maintain weight.`, recommendation: "A 500 cal/day deficit = ~0.5kg/week weight loss. Consult a doctor before major dietary changes.", notes: ["Mifflin-St Jeor equation — global medical standard","Activity: 1=sedentary 2=light 3=moderate 4=active 5=very active"] };
    }
    if (preset === "fuel-cost") {
      const dist=Number(values.distance), eff=Number(values.efficiency), price=Number(values.price);
      if ([dist,eff,price].some(v=>!Number.isFinite(v)||v<=0)) return null;
      const fuelUsed=(dist/100)*eff, total=fuelUsed*price;
      return { primary: total.toFixed(2), secondary: "total fuel cost", extra: `Fuel used: ${fuelUsed.toFixed(2)}L · Cost per 100km: ${((total/dist)*100).toFixed(2)}`, insight: `${dist}km at ${eff}L/100km uses ${fuelUsed.toFixed(1)} litres costing ${total.toFixed(2)}.`, recommendation: "Reducing highway speed from 120 to 100 km/h typically cuts fuel use by 15-20%.", notes: ["Actual consumption varies with driving conditions, load and vehicle age"] };
    }
    if (preset === "inflation") {
      const amount=Number(values.amount), from=Number(values.from_year), to=Number(values.to_year), rate=Number(values.rate||3);
      if ([amount,from,to,rate].some(v=>!Number.isFinite(v))) return null;
      const years=to-from, adjusted=amount*Math.pow(1+rate/100,years), change=adjusted-amount;
      return { primary: adjusted.toFixed(2), secondary: `equivalent in ${to}`, extra: `Original: ${amount.toFixed(2)} in ${from} · Change: +${change.toFixed(2)} (+${((change/amount)*100).toFixed(1)}%)`, insight: `${amount.toFixed(2)} in ${from} equals ${adjusted.toFixed(2)} in ${to} at ${rate}% average annual inflation.`, recommendation: "Global average inflation has been ~3-4% historically. Check your country's CPI for accurate figures.", notes: ["This is an estimate. Real purchasing power varies by country and product category."] };
    }
    if (preset === "ratio-percentage") {
      const num = Number(values.numerator);
      const den = Number(values.denominator);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
      const pct = (num / den) * 100;
      const resultLabel = String(config.resultLabel || "Result");
      const numLabel = String(config.numeratorLabel || "Value");
      const denLabel = String(config.denominatorLabel || "Total");
      return {
        primary: `${pct.toFixed(2)}%`,
        secondary: resultLabel,
        extra: `${num} out of ${den}`,
        insight: `${numLabel}: ${num} ÷ ${denLabel}: ${den} = ${pct.toFixed(2)}%`,
        recommendation: pct >= 100 ? "Value equals or exceeds total." : pct >= 75 ? "High ratio — strong performance." : pct >= 50 ? "Above average." : "Below 50% — room for improvement.",
        notes: ["Result is calculated as (numerator ÷ denominator) × 100"],
      };
    }

    if (preset === "uptime-percentage") {
      const up = Number(values.uptime_hours);
      const total = Number(values.total_hours);
      if (!Number.isFinite(up) || !Number.isFinite(total) || total === 0) return null;
      const pct = (up / total) * 100;
      const downtime = total - up;
      const sla = pct >= 99.99 ? "Four Nines (99.99%)" : pct >= 99.9 ? "Three Nines (99.9%)" : pct >= 99.5 ? "99.5% SLA" : pct >= 99 ? "99% SLA" : "Below standard SLA";
      return {
        primary: `${pct.toFixed(3)}%`,
        secondary: "Uptime percentage",
        extra: `Downtime: ${downtime.toFixed(1)} hours · SLA level: ${sla}`,
        insight: `${up} hours up out of ${total} total hours = ${pct.toFixed(3)}% uptime.`,
        recommendation: pct >= 99.9 ? "Excellent — meets Three Nines SLA standard." : "Consider infrastructure improvements to reach 99.9% uptime.",
        notes: ["99.9% uptime = 8.76 hours downtime/year", "99.99% (four nines) = 52 minutes downtime/year"],
      };
    }

    if (preset === "growth-rate") {
      const current = Number(values.current);
      const previous = Number(values.previous);
      if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
      const growth = ((current - previous) / previous) * 100;
      const isPositive = growth >= 0;
      return {
        primary: `${isPositive ? "+" : ""}${growth.toFixed(2)}%`,
        secondary: String(config.resultLabel || "Growth rate"),
        extra: `From ${previous} to ${current} (change: ${current - previous > 0 ? "+" : ""}${current - previous})`,
        insight: `Growth from ${previous} to ${current} = ${isPositive ? "+" : ""}${growth.toFixed(2)}%`,
        recommendation: growth > 20 ? "Strong growth — sustain the momentum." : growth > 0 ? "Positive growth — look for ways to accelerate." : "Decline detected — investigate contributing factors.",
        notes: ["Growth rate = ((current - previous) / previous) × 100"],
      };
    }

    if (preset === "daily-time-budget") {
      const total = Number(values.total_hours || "");
      const sleep = Number(values.sleep_hours || "");
      const work = Number(values.work_hours || "");
      const commute = Number(values.commute_hours || "");
      const exercise = Number(values.exercise_hours || "");
      const other = Number(values.other_hours || "");

      if (
        [total, sleep, work, commute, exercise, other].some(
          (v) => !Number.isFinite(v)
        )
      ) {
        return null;
      }

      const used = sleep + work + commute + exercise + other;
      const free = total - used;
      const interpretation = getTimeBudgetInterpretation(free, total);

      return {
        primary: free.toFixed(2),
        secondary: "Free hours remaining",
        extra: `Allocated hours: ${used.toFixed(2)}`,
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "This calculator assumes the entered activities are mutually exclusive.",
          "You can use it for routine planning, work-life balance checks, and schedule stress testing.",
        ],
      };
    }

    if (preset === "time-conversion") {
      const unitMap: Record<string, number> = {
        seconds: 1, minutes: 60, hours: 3600, days: 86400, weeks: 604800,
      };
      const val = Number(values.value);
      const from = (values.from_unit || "minutes").toLowerCase().trim();
      const to = (values.to_unit || "hours").toLowerCase().trim();
      if (!Number.isFinite(val) || !unitMap[from] || !unitMap[to]) return null;
      const converted = (val * unitMap[from]) / unitMap[to];
      const display = Number.isInteger(converted) ? String(converted) : converted.toFixed(6).replace(/0+$/, "");
      return {
        primary: display,
        secondary: to,
        insight: `${val} ${from} = ${display} ${to}`,
        recommendation: "Convert time units for scheduling, development, and planning tasks.",
        notes: ["Supported: seconds, minutes, hours, days, weeks"],
      };
    }

    if (preset === "datetime-difference") {
      const start = new Date(values.start_date || "");
      const end = new Date(values.end_date || "");
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      const diffMs = end.getTime() - start.getTime();
      const days = Math.abs(Math.floor(diffMs / 86400000));
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30.44);
      return {
        primary: String(days),
        secondary: "days difference",
        extra: `${weeks} weeks · ${months} months`,
        insight: days === 0 ? "Same date" : `${days} days between the two dates`,
        recommendation: "Use for project timelines, deadlines, and date range calculations.",
        notes: ["Negative values mean the end date is before the start date"],
      };
    }

    if (preset === "shift-hours") {
      const start = Number(values.start_hour);
      const end = Number(values.end_hour);
      const brk = Number(values.break_minutes || 0);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      let totalMins = (end - start) * 60 - brk;
      if (totalMins < 0) totalMins += 24 * 60;
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return {
        primary: `${hrs}h ${mins}m`,
        secondary: "working time",
        insight: `${hrs} hours ${mins} minutes of work after ${brk} minute break`,
        recommendation: "Use for shift planning, payroll calculations, and scheduling.",
        notes: ["Handles overnight shifts automatically"],
      };
    }

    if (preset === "sleep-cycle") {
      const bedtime = Number(values.sleep_time);
      const cycles = Number(values.cycles || 5);
      if (!Number.isFinite(bedtime) || !Number.isFinite(cycles)) return null;
      const totalMinutes = cycles * 90;
      const wakeHour = (bedtime + Math.floor(totalMinutes / 60)) % 24;
      const wakeMins = totalMinutes % 60;
      return {
        primary: `${wakeHour}:${String(wakeMins).padStart(2, "0")}`,
        secondary: "optimal wake time",
        insight: `After ${cycles} sleep cycles (${totalMinutes} minutes), wake at ${wakeHour}:${String(wakeMins).padStart(2, "0")}`,
        recommendation: "Wake between sleep cycles to feel more refreshed.",
        notes: ["Each sleep cycle is approximately 90 minutes", "Most adults need 5-6 cycles (7.5-9 hours)"],
      };
    }

    if (preset === "project-time-estimator") {
      const tasks = Number(values.tasks);
      const hoursPerTask = Number(values.hours_per_task);
      const buffer = Number(values.buffer_pct || 0);
      if (!Number.isFinite(tasks) || !Number.isFinite(hoursPerTask)) return null;
      const base = tasks * hoursPerTask;
      const total = base * (1 + buffer / 100);
      return {
        primary: total.toFixed(1),
        secondary: "total hours estimated",
        extra: `Base: ${base}h + ${buffer}% buffer = ${total.toFixed(1)}h`,
        insight: `With ${buffer}% buffer, ${tasks} tasks at ${hoursPerTask}h each = ${total.toFixed(1)} hours total`,
        recommendation: "Always add a buffer — software projects typically need 20-30% extra time.",
        notes: ["Buffer accounts for meetings, debugging, and unexpected complexity"],
      };
    }

    if (preset === "countdown") {
      const days = Number(values.target_days);
      const hpd = Number(values.hours_per_day || 8);
      if (!Number.isFinite(days) || !Number.isFinite(hpd)) return null;
      const totalHours = days * hpd;
      const weeks = Math.floor(days / 7);
      return {
        primary: String(days),
        secondary: "days remaining",
        extra: `${totalHours} working hours · ${weeks} weeks`,
        insight: `${days} days = ${totalHours} working hours at ${hpd}h/day`,
        recommendation: "Break large goals into weekly milestones for better progress tracking.",
        notes: ["Working hours calculated based on your hours-per-day setting"],
      };
    }

    if (preset === "pomodoro") {
      const focus = Number(values.focus_minutes || 25);
      const brk = Number(values.break_minutes || 5);
      const sessions = Number(values.sessions || 4);
      if (!Number.isFinite(focus) || !Number.isFinite(brk) || !Number.isFinite(sessions)) return null;
      const totalMinutes = sessions * focus + (sessions - 1) * brk;
      const longBreak = 15;
      const grandTotal = totalMinutes + longBreak;
      return {
        primary: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        secondary: "total focus time",
        extra: `Full cycle with long break: ${Math.floor(grandTotal / 60)}h ${grandTotal % 60}m`,
        insight: `${sessions} × ${focus}min focus + ${sessions - 1} × ${brk}min breaks = ${totalMinutes} minutes`,
        recommendation: "After every 4 Pomodoros, take a longer 15-30 minute break.",
        notes: ["The Pomodoro Technique improves focus by breaking work into timed intervals"],
      };
    }

    if (preset === "timezone-difference") {
      const a = Number(values.offset_a);
      const b = Number(values.offset_b);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      const diff = Math.abs(a - b);
      const diffH = Math.floor(diff);
      const diffM = Math.round((diff - diffH) * 60);
      return {
        primary: `${diffH}h ${diffM}m`,
        secondary: "time difference",
        insight: `UTC+${a} and UTC+${b} are ${diffH}h ${diffM}m apart`,
        recommendation: "Use for scheduling meetings across time zones.",
        notes: ["Positive UTC offset = ahead of UTC, Negative = behind UTC", "IST = UTC+5:30, EST = UTC-5, PST = UTC-8"],
      };
    }

    if (preset === "api-rate-limit") {
      const requests = Number(values.requests || "");
      const windowSeconds = Number(values.window_seconds || "");

      if (
        !Number.isFinite(requests) ||
        !Number.isFinite(windowSeconds) ||
        windowSeconds === 0
      ) {
        return null;
      }

      const perSecond = requests / windowSeconds;
      const perMinute = perSecond * 60;

      return {
        primary: perSecond.toFixed(2),
        secondary: "Requests per second",
        extra: `Requests per minute: ${perMinute.toFixed(2)}`,
        insight:
          "This expresses your rate limit as an average throughput per second, which is useful for backend and API capacity planning.",
        recommendation:
          perSecond < 1
            ? "A low request rate may be fine for internal or low-volume use, but confirm peak traffic behavior separately."
            : "Compare this against expected burst traffic and concurrency, not only average traffic.",
      };
    }

    if (preset === "cost-estimator") {
      const quantity = Number(values.quantity || "");
      const unitCost = Number(values.unit_cost || "");
      const overheadPercent = Number(values.overhead_percent || "0");

      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitCost) ||
        !Number.isFinite(overheadPercent)
      ) {
        return null;
      }

      const base = quantity * unitCost;
      const total = base * (1 + overheadPercent / 100);

      return {
        primary: total.toFixed(Number(config.decimals ?? 2)),
        secondary: String(config.resultLabel || "Estimated result"),
        extra: `Base value: ${base.toFixed(Number(config.decimals ?? 2))}`,
        insight:
          "This combines direct cost with an overhead adjustment to produce a more realistic estimate than base cost alone.",
        recommendation:
          overheadPercent > 25
            ? "Your overhead assumption is relatively high. Confirm whether this is intended or if some costs are being double-counted."
            : "Stress-test the result with multiple overhead values to see best-case and worst-case scenarios.",
      };
    }

    if (preset === "rate-estimator") {
      const numerator = Number(values.numerator || "");
      const period = Number(values.period || "");

      if (!Number.isFinite(numerator) || !Number.isFinite(period) || period === 0) {
        return null;
      }

      const rate = numerator / period;
      const interpretation = getRateInterpretation(
        rate,
        String(config.resultLabel || "Rate")
      );

      return {
        primary: rate.toFixed(Number(config.decimals ?? 2)),
        secondary: String(config.resultLabel || "Rate"),
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
      };
    }

    if (preset === "revenue-estimator") {
      const views = Number(values.views || "");
      const rpm = Number(values.rpm || "");

      if (!Number.isFinite(views) || !Number.isFinite(rpm)) {
        return null;
      }

      const revenue = (views / 1000) * rpm;
      const interpretation = getRevenueInterpretation(revenue);

      return {
        primary: revenue.toFixed(Number(config.decimals ?? 2)),
        secondary: String(config.resultLabel || "Estimated revenue"),
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "This is an estimate based on RPM assumptions and does not include payout thresholds, taxes, or platform-specific deductions.",
        ],
      };
    }

    if (preset === "probability") {
      const a = Number(values.a || "");
      const b = Number(values.b || "");

      if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
        return null;
      }

      const multiplier = Number(config.multiplier ?? 100);
      const decimals = Number(config.decimals ?? 2);
      const resultValue = (a / b) * multiplier;
      const suffix = String(config.resultSuffix || "");
      const interpretation = getProbabilityInterpretation(resultValue);

      return {
        primary: `${resultValue.toFixed(decimals)}${suffix}`,
        secondary: String(config.resultLabel || "Probability"),
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "The result depends entirely on how well your input values reflect reality.",
        ],
      };
    }

    const a = Number(values.a || "");
    const b = Number(values.b || "");

    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
      return null;
    }

    const multiplier = Number(config.multiplier ?? 100);
    const decimals = Number(config.decimals ?? 2);
    const resultValue = (a / b) * multiplier;
    const suffix = String(config.resultSuffix || "");
    const label = String(config.resultLabel || "Result");

    if (preset === "metric-ratio") {
      let insight =
        "This expresses Value A relative to Value B using the configured multiplier.";
      let recommendation =
        "Use this to compare efficiency, completion, utilization, or share of total.";

      if (resultValue < 25) {
        insight = "The ratio is low relative to the baseline.";
        recommendation =
          "Review whether the numerator is underperforming or the denominator is too large for the intended target.";
      } else if (resultValue > 75) {
        insight = "The ratio is high relative to the baseline.";
        recommendation =
          "This may indicate strong performance, but confirm that the baseline and units are appropriate.";
      }

      return {
        primary: `${resultValue.toFixed(decimals)}${suffix}`,
        secondary: label,
        insight,
        recommendation,
      };
    }

    return {
      primary: `${resultValue.toFixed(decimals)}${suffix}`,
      secondary: label,
      insight: "This result is based on the configured formula for this calculator.",
      recommendation:
        "Check the units and assumptions behind both values before using the result in decisions.",
    };
  }, [config, dateTimeValue, mode, preset, values]);

  return (
    <Workspace title={name || "Formula Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Enter the required values for this configured formula calculator.">
            <div className="grid gap-4">
              {preset === "unix-timestamp" ? (
                <>
                  <select
                    value={mode}
                    onChange={(e) =>
                      setMode(
                        e.target.value as "timestamp-to-date" | "date-to-timestamp"
                      )
                    }
                    className={selectClass()}
                  >
                    <option value="timestamp-to-date">Timestamp → Date</option>
                    <option value="date-to-timestamp">Date → Timestamp</option>
                  </select>

                  {mode === "timestamp-to-date" ? (
                    <input
                      type="number"
                      value={values.timestamp || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          timestamp: e.target.value,
                        }))
                      }
                      placeholder="Unix timestamp"
                      className={fieldClass()}
                    />
                  ) : (
                    <input
                      type="datetime-local"
                      value={dateTimeValue}
                      onChange={(e) => setDateTimeValue(e.target.value)}
                      className={fieldClass()}
                    />
                  )}
                </>
              ) : (
                fieldDefinitions.map((field) => {
                  const isUnitField = field.key === "from_unit" || field.key === "to_unit";
                  const isDateField = field.key === "start_date" || field.key === "end_date";
                  return (
                    <div key={field.key} className="flex flex-col gap-1">
                      {field.label && (
                        <label className="text-xs font-medium text-q-muted px-1">{field.label}</label>
                      )}
                      {isUnitField ? (
                        <select
                          value={values[field.key] || field.placeholder || "minutes"}
                          onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className={fieldClass()}
                        >
                          {["seconds","minutes","hours","days","weeks"].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={isDateField ? "date" : "number"}
                          value={values[field.key] || ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder || field.label}
                          className={fieldClass()}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title="Formula result"
            result={result}
            emptyText="Enter values to calculate."
          />
        }
      />
    </Workspace>
  );
}

function GenericCalculator({ name }: { name?: string }) {
  return (
    <Workspace title={name || "Calculator"}>
      <div className="grid gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="text-lg font-semibold">No direct formula available</div>
          <div className="mt-2 text-sm leading-7">
            This page represents a real concept, but it does not map cleanly to a single universal formula. The result depends on context, definitions, and how the metric is measured.
          </div>
        </div>

        <div className="rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-text">
          <div className="font-medium">Why this happens</div>
          <ul className="mt-2 grid gap-2 text-q-muted">
            <li>• Some topics are analytical concepts rather than strict mathematical formulas.</li>
            <li>• Results may depend on team rules, platform rules, scoring models, or time windows.</li>
            <li>• A trustworthy calculator needs a validated domain-specific method before publishing a formula.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-slate-800">
          <div className="font-medium">What to do instead</div>
          <ul className="mt-2 grid gap-2">
            <li>• Break the problem into measurable components such as rates, ratios, or time values.</li>
            <li>• Use related calculators that measure one part of the concept reliably.</li>
            <li>• Treat this page as an informational concept page until a real validated engine is available.</li>
          </ul>
        </div>
      </div>
    </Workspace>
  );
}


// ─── SIP Calculator ───────────────────────────────────────────────────────────
function SIPCalculator({ name = "" }: { name?: string }) {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(monthly);
    const r = Number(rate) / 100 / 12;
    const n = Number(years) * 12;
    if (!p || !r || !n || n <= 0) return null;

    const invested = p * n;
    const maturity = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const gains = maturity - invested;
    const xirr = ((maturity / invested) ** (1 / Number(years)) - 1) * 100;

    return {
      primary: `₹${maturity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      secondary: "Estimated maturity value",
      extra: `Total invested: ₹${invested.toLocaleString("en-IN")} · Estimated gains: ₹${gains.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      insight: `Your ₹${p.toLocaleString("en-IN")}/month grows to ₹${maturity.toLocaleString("en-IN", { maximumFractionDigits: 0 })} over ${years} years at ${rate}% p.a. — wealth created is ${((gains / invested) * 100).toFixed(0)}% more than what you invested.`,
      recommendation: xirr > 12
        ? "This projection assumes a consistent rate. Equity mutual funds historically average 12–15% over long periods but returns vary year to year — stay invested through market cycles."
        : "For long-term goals like retirement, SIPs in equity mutual funds tend to outperform FDs and PPF over 10+ year horizons. Start early to maximise compounding.",
    };
  }, [monthly, rate, years]);

  return (
    <Workspace title={name || "SIP Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Calculate returns on a monthly Systematic Investment Plan (SIP) in mutual funds.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Investment (₹)</label>
                <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="e.g. 5000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Expected Annual Return (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 12" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Investment Period (Years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 10" className={fieldClass()} />
              </div>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="SIP maturity estimate" result={result} emptyText="Enter monthly amount, return rate, and period to calculate." />}
      />
    </Workspace>
  );
}

// ─── FD Calculator ────────────────────────────────────────────────────────────
function FDCalculator({ name = "" }: { name?: string }) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [compounding, setCompounding] = useState("4");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(years);
    const n = Number(compounding);
    if (!p || !r || !t || !n) return null;

    const maturity = p * Math.pow(1 + r / n, n * t);
    const interest = maturity - p;

    return {
      primary: `₹${maturity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      secondary: "Maturity amount",
      extra: `Principal: ₹${p.toLocaleString("en-IN")} · Interest earned: ₹${interest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      insight: `Your FD of ₹${p.toLocaleString("en-IN")} at ${rate}% p.a. (compounded ${["","annually","semi-annually","","quarterly"][n] || n+"x/year"}) matures to ₹${maturity.toLocaleString("en-IN", { maximumFractionDigits: 0 })} in ${t} years.`,
      recommendation: interest / p > 0.5
        ? "FD interest income is fully taxable as per your income tax slab. For higher returns with similar safety, consider debt mutual funds (indexation benefits after 3 years) or RBI Floating Rate Bonds."
        : "FDs are ideal for capital preservation. Compare rates across banks — small finance banks and NBFCs often offer 0.5–1% higher rates than large banks with similar deposit insurance protection.",
    };
  }, [principal, rate, years, compounding]);

  return (
    <Workspace title={name || "FD Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Calculate the maturity amount for a Fixed Deposit with compound interest.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Principal Amount (₹)</label>
                <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="e.g. 100000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Interest Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 7.5" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tenure (Years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 3" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Compounding Frequency</label>
                <select value={compounding} onChange={e => setCompounding(e.target.value)} className={fieldClass()}>
                  <option value="1">Annual</option>
                  <option value="2">Semi-Annual</option>
                  <option value="4">Quarterly</option>
                  <option value="12">Monthly</option>
                </select>
              </div>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="FD maturity value" result={result} emptyText="Enter principal, rate, and tenure to calculate FD maturity." />}
      />
    </Workspace>
  );
}

// ─── PPF Calculator ───────────────────────────────────────────────────────────
function PPFCalculator({ name = "" }: { name?: string }) {
  const [yearly, setYearly] = useState("");
  const [rate, setRate] = useState("7.1");
  const [years, setYears] = useState("15");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(yearly);
    const r = Number(rate) / 100;
    const n = Number(years);
    if (!p || !r || !n || n < 15) return null;

    let balance = 0;
    for (let i = 0; i < n; i++) {
      balance = (balance + p) * (1 + r);
    }
    const invested = p * n;
    const interest = balance - invested;

    return {
      primary: `₹${balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      secondary: "PPF maturity value",
      extra: `Total deposited: ₹${invested.toLocaleString("en-IN")} · Interest earned: ₹${interest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      insight: `Investing ₹${p.toLocaleString("en-IN")}/year in PPF for ${n} years at ${rate}% p.a. builds a corpus of ₹${balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}. All interest and maturity amount is fully tax-free.`,
      recommendation: p > 150000
        ? "PPF deposits are capped at ₹1,50,000 per year. Contributions above this limit do not earn interest. Consider NPS, ELSS, or Sukanya Samriddhi for additional tax-saving options."
        : "PPF is one of India's safest long-term investments — government-backed, EEE tax status (exempt-exempt-exempt), and currently earning " + rate + "% p.a. Ideal for retirement and children's education planning.",
    };
  }, [yearly, rate, years]);

  return (
    <Workspace title={name || "PPF Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Calculate Public Provident Fund maturity with India's EEE tax-free government scheme.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Yearly Deposit (₹ max 1,50,000)</label>
                <input type="number" value={yearly} onChange={e => setYearly(e.target.value)} placeholder="e.g. 150000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">PPF Interest Rate (% p.a.)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="7.1" className={fieldClass()} />
                <p className="mt-1 text-xs text-q-muted">Current rate: 7.1% p.a. (Q1 FY2025-26)</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tenure (min 15 years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="15" min="15" className={fieldClass()} />
              </div>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="PPF maturity estimate" result={result} emptyText="Enter yearly deposit and tenure (minimum 15 years) to calculate." />}
      />
    </Workspace>
  );
}

// ─── HRA Calculator ───────────────────────────────────────────────────────────
function HRACalculator({ name = "" }: { name?: string }) {
  const [basic, setBasic] = useState("");
  const [hra, setHra] = useState("");
  const [rent, setRent] = useState("");
  const [metro, setMetro] = useState("true");

  const result = useMemo<InterpretedResult | null>(() => {
    const b = Number(basic);
    const h = Number(hra);
    const r = Number(rent);
    const isMetro = metro === "true";
    if (!b || !h || !r) return null;

    const annual_basic = b * 12;
    const annual_hra = h * 12;
    const annual_rent = r * 12;

    const exemption1 = annual_hra;
    const exemption2 = annual_rent - 0.1 * annual_basic;
    const exemption3 = (isMetro ? 0.5 : 0.4) * annual_basic;

    const exemption = Math.max(0, Math.min(exemption1, exemption2, exemption3));
    const taxable_hra = annual_hra - exemption;

    return {
      primary: `₹${exemption.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      secondary: "Annual HRA exemption",
      extra: `Monthly exemption: ₹${(exemption / 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })} · Taxable HRA: ₹${taxable_hra.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/year`,
      insight: `Your HRA exemption is the lowest of: (1) Actual HRA ₹${annual_hra.toLocaleString("en-IN")}, (2) Rent minus 10% basic ₹${Math.max(0, exemption2).toLocaleString("en-IN", { maximumFractionDigits: 0 })}, (3) ${isMetro ? "50%" : "40%"} of basic ₹${exemption3.toLocaleString("en-IN", { maximumFractionDigits: 0 })}. The lowest of these three = ₹${exemption.toLocaleString("en-IN", { maximumFractionDigits: 0 })} is your exemption.`,
      recommendation: exemption < annual_hra
        ? `You are leaving ₹${(annual_hra - exemption).toLocaleString("en-IN", { maximumFractionDigits: 0 })}/year of HRA taxable. To maximise exemption, either pay higher rent (ensure rent receipts and landlord PAN for rent above ₹1 lakh/year) or check if you qualify for the old tax regime.`
        : "Your full HRA is exempt from tax based on the three-condition check. Ensure you submit rent receipts and landlord PAN details to your employer for Form 12BB.",
    };
  }, [basic, hra, rent, metro]);

  return (
    <Workspace title={name || "HRA Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Calculate your House Rent Allowance (HRA) exemption under Indian income tax rules.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Basic Salary per Month (₹)</label>
                <input type="number" value={basic} onChange={e => setBasic(e.target.value)} placeholder="e.g. 50000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">HRA Received per Month (₹)</label>
                <input type="number" value={hra} onChange={e => setHra(e.target.value)} placeholder="e.g. 20000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Actual Rent Paid per Month (₹)</label>
                <input type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="e.g. 18000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">City Type</label>
                <select value={metro} onChange={e => setMetro(e.target.value)} className={fieldClass()}>
                  <option value="true">Metro (Delhi, Mumbai, Chennai, Kolkata) — 50%</option>
                  <option value="false">Non-Metro — 40%</option>
                </select>
              </div>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="HRA exemption" result={result} emptyText="Enter your basic salary, HRA received, and rent paid to calculate." />}
      />
    </Workspace>
  );
}

// ─── MULTI-COUNTRY INCOME TAX CALCULATOR ─────────────────────────────────────
type TaxCountry = "US" | "UK" | "IN" | "CA" | "AU" | "DE" | "GENERIC";

const TAX_COUNTRY_INFO: Record<TaxCountry, { label: string; flag: string; symbol: string; defaultIncome: string }> = {
  US: { label: "United States", flag: "🇺🇸", symbol: "$", defaultIncome: "75000" },
  UK: { label: "United Kingdom", flag: "🇬🇧", symbol: "£", defaultIncome: "45000" },
  IN: { label: "India", flag: "🇮🇳", symbol: "₹", defaultIncome: "1200000" },
  CA: { label: "Canada", flag: "🇨🇦", symbol: "$", defaultIncome: "65000" },
  AU: { label: "Australia", flag: "🇦🇺", symbol: "$", defaultIncome: "90000" },
  DE: { label: "Germany", flag: "🇩🇪", symbol: "€", defaultIncome: "55000" },
  GENERIC: { label: "Other", flag: "🌍", symbol: "", defaultIncome: "60000" },
};

function detectTaxCountry(slug: string): TaxCountry {
  const s = slug.toLowerCase();
  if (s.includes("canada") || s.includes("-ca-") || s.endsWith("-ca") || s.includes("canadian")) return "CA";
  if (s.includes("usa") || s.includes("united-states") || s.includes("-us-") || s.endsWith("-us") ||
      s.includes("federal") || s.includes("irs")) return "US";
  if (s.includes("uk") || s.includes("united-kingdom") || s.includes("hmrc") || s.includes("paye")) return "UK";
  if (s.includes("india") || s.includes("-in-") || s.endsWith("-in") || s.includes("itr")) return "IN";
  if (s.includes("australia") || s.includes("-au-") || s.endsWith("-au") || s.includes("ato")) return "AU";
  if (s.includes("germany") || s.includes("deutschland") || s.includes("-de-") || s.endsWith("-de")) return "DE";
  return "GENERIC";
}

type TaxResult = {
  tax: number;
  netIncome: number;
  effectiveRate: number;
  rows: Array<{ label: string; value: number; type: "income" | "deduction" | "total" | "final" }>;
  note: string;
};

function calcTaxUS(income: number, filing: string): TaxResult {
  const sd = filing === "married" ? 29200 : 14600;
  const ti = Math.max(0, income - sd);
  const sB = [{ l: 11600, r: 0.10 },{ l: 47150, r: 0.12 },{ l: 100525, r: 0.22 },{ l: 191950, r: 0.24 },{ l: 243725, r: 0.32 },{ l: 609350, r: 0.35 },{ l: Infinity, r: 0.37 }];
  const mB = [{ l: 23200, r: 0.10 },{ l: 94300, r: 0.12 },{ l: 201050, r: 0.22 },{ l: 383900, r: 0.24 },{ l: 487450, r: 0.32 },{ l: 731200, r: 0.35 },{ l: Infinity, r: 0.37 }];
  const brackets = filing === "married" ? mB : sB;
  let tax = 0; let prev = 0;
  for (const b of brackets) { if (ti <= prev) break; tax += (Math.min(ti, b.l) - prev) * b.r; prev = b.l; }
  return {
    tax, netIncome: income - tax, effectiveRate: income > 0 ? tax / income * 100 : 0,
    note: "Federal income tax only (2025). Does not include state tax, FICA, or AMT.",
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: `Standard Deduction (${filing === "married" ? "MFJ" : "Single"})`, value: -sd, type: "deduction" },
      { label: "Taxable Income", value: ti, type: "total" },
      { label: "Federal Income Tax", value: -tax, type: "deduction" },
      { label: "After-Tax Income", value: income - tax, type: "final" },
    ],
  };
}

function calcTaxUK(income: number): TaxResult {
  const pa = income <= 100000 ? 12570 : Math.max(0, 12570 - (income - 100000) / 2);
  const ti = Math.max(0, income - pa);
  let tax = 0;
  if (ti <= 37700) tax = ti * 0.20;
  else if (ti <= 125140) tax = 37700 * 0.20 + (ti - 37700) * 0.40;
  else tax = 37700 * 0.20 + (125140 - 37700) * 0.40 + (ti - 125140) * 0.45;
  return {
    tax, netIncome: income - tax, effectiveRate: income > 0 ? tax / income * 100 : 0,
    note: "HMRC income tax 2025-26. Does not include National Insurance.",
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: "Personal Allowance", value: -pa, type: "deduction" },
      { label: "Taxable Income", value: ti, type: "total" },
      { label: "Income Tax", value: -tax, type: "deduction" },
      { label: "After-Tax Income", value: income - tax, type: "final" },
    ],
  };
}

function calcTaxIN(income: number, regime: string, deductions80c: number): TaxResult {
  let taxable = income;
  let tax = 0;
  if (regime === "new") {
    taxable = Math.max(0, income - 75000);
    const slabs = [{ u: 400000, r: 0 },{ u: 800000, r: 0.05 },{ u: 1200000, r: 0.10 },{ u: 1600000, r: 0.15 },{ u: 2000000, r: 0.20 },{ u: 2400000, r: 0.25 },{ u: Infinity, r: 0.30 }];
    let prev = 0;
    for (const s of slabs) { if (taxable > prev) { tax += (Math.min(taxable, s.u) - prev) * s.r; prev = s.u; } }
    if (taxable <= 1200000) tax = 0;
  } else {
    const ded = Math.min(deductions80c, 150000);
    taxable = Math.max(0, income - 50000 - ded);
    if (taxable <= 250000) tax = 0;
    else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
    else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
    else tax = 112500 + (taxable - 1000000) * 0.30;
    if (taxable <= 500000) tax = 0;
  }
  const cess = tax * 0.04;
  const total = tax + cess;
  return {
    tax: total, netIncome: income - total, effectiveRate: income > 0 ? total / income * 100 : 0,
    note: `India FY2025-26 (${regime === "new" ? "New" : "Old"} Regime). Includes 4% cess.`,
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: regime === "new" ? "Standard Deduction (₹75,000)" : `Deductions (Std + 80C)`, value: -(income - taxable), type: "deduction" },
      { label: "Taxable Income", value: taxable, type: "total" },
      { label: "Income Tax", value: -tax, type: "deduction" },
      { label: "Health & Education Cess (4%)", value: -cess, type: "deduction" },
      { label: "After-Tax Income", value: income - total, type: "final" },
    ],
  };
}

function calcTaxCA(income: number): TaxResult {
  // Federal brackets 2025
  const brackets = [
    { l: 57375, r: 0.15 },
    { l: 114750, r: 0.205 },
    { l: 158468, r: 0.26 },
    { l: 220000, r: 0.29 },
    { l: Infinity, r: 0.33 },
  ];
  const bpa = 16129; // Basic Personal Amount 2025
  const ti = Math.max(0, income - bpa);
  let tax = 0; let prev = 0;
  for (const b of brackets) { if (ti <= prev) break; tax += (Math.min(ti, b.l) - prev) * b.r; prev = b.l; }
  // CPP contribution (employee share, 2025)
  const cppMax = 4034.10;
  const cpp = Math.min(Math.max(0, income - 3500) * 0.0595, cppMax);
  // EI contribution (employee share, 2025)
  const eiMax = 1077.48;
  const ei = Math.min(income * 0.0163, eiMax);
  const totalTax = tax + cpp + ei;
  return {
    tax: totalTax, netIncome: income - totalTax, effectiveRate: income > 0 ? totalTax / income * 100 : 0,
    note: "Federal tax only (2025). Provincial tax varies by province — typically adds 5-20%. CPP2 not included.",
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: "Basic Personal Amount", value: -bpa, type: "deduction" },
      { label: "Taxable Income", value: ti, type: "total" },
      { label: "Federal Income Tax", value: -tax, type: "deduction" },
      { label: "CPP Contribution", value: -cpp, type: "deduction" },
      { label: "EI Premium", value: -ei, type: "deduction" },
      { label: "After Federal Deductions", value: income - totalTax, type: "final" },
    ],
  };
}

function calcTaxAU(income: number): TaxResult {
  let tax = 0;
  if (income <= 18200) tax = 0;
  else if (income <= 45000) tax = (income - 18200) * 0.16;
  else if (income <= 135000) tax = 4288 + (income - 45000) * 0.30;
  else if (income <= 190000) tax = 31288 + (income - 135000) * 0.37;
  else tax = 51638 + (income - 190000) * 0.45;
  const ml = income > 24276 ? income * 0.02 : 0;
  const total = tax + ml;
  return {
    tax: total, netIncome: income - total, effectiveRate: income > 0 ? total / income * 100 : 0,
    note: "ATO 2025-26 resident rates. Includes Medicare Levy. Excludes HELP/HECS.",
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: "Tax-Free Threshold", value: -18200, type: "deduction" },
      { label: "Income Tax", value: -tax, type: "deduction" },
      { label: "Medicare Levy (2%)", value: -ml, type: "deduction" },
      { label: "After-Tax Income", value: income - total, type: "final" },
    ],
  };
}

function calcTaxDE(income: number): TaxResult {
  const gf = 11784; const taxable = Math.max(0, income - gf);
  let tax = 0;
  if (taxable <= 17005) tax = taxable * 0.14;
  else if (taxable <= 66760) tax = 17005 * 0.14 + (taxable - 17005) * 0.2397;
  else if (taxable <= 277826 - gf) tax = 17005 * 0.14 + (66760 - 17005) * 0.2397 + (taxable - 66760) * 0.42;
  else tax = 17005 * 0.14 + (66760 - 17005) * 0.2397 + (277826 - gf - 66760) * 0.42 + (taxable - (277826 - gf)) * 0.45;
  const soli = tax > 18130 ? tax * 0.055 : 0;
  const total = tax + soli;
  return {
    tax: total, netIncome: income - total, effectiveRate: income > 0 ? total / income * 100 : 0,
    note: "Estimated 2025 Einkommensteuer (Class I). Excludes Kirchensteuer, social contributions.",
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: "Grundfreibetrag", value: -gf, type: "deduction" },
      { label: "Taxable Income", value: taxable, type: "total" },
      { label: "Income Tax", value: -tax, type: "deduction" },
      { label: "Solidarity Surcharge", value: -soli, type: "deduction" },
      { label: "After-Tax Income", value: income - total, type: "final" },
    ],
  };
}

function calcTaxGeneric(income: number, rate: number): TaxResult {
  const tax = income * (rate / 100);
  return {
    tax, netIncome: income - tax, effectiveRate: rate,
    note: "Using flat estimated rate. Select your country for accurate tax brackets.",
    rows: [
      { label: "Gross Income", value: income, type: "income" },
      { label: `Estimated Tax (${rate}%)`, value: -tax, type: "deduction" },
      { label: "After-Tax Income", value: income - tax, type: "final" },
    ],
  };
}

function IncomeTaxCalculator({ slug = "" }: { slug?: string }) {
  const detected = detectTaxCountry(slug);
  const [country, setCountry] = useState<TaxCountry>(detected);
  const info = TAX_COUNTRY_INFO[country];
  const [income, setIncome] = useState(info.defaultIncome);
  const [filing, setFiling] = useState("single");
  const [regime, setRegime] = useState("new");
  const [deductions, setDeductions] = useState("");
  const [taxRate, setTaxRate] = useState("25");

  const handleCountry = (c: TaxCountry) => { setCountry(c); setIncome(TAX_COUNTRY_INFO[c].defaultIncome); };

  const result: TaxResult | null = useMemo(() => {
    const inc = parseFloat(income);
    if (!isFinite(inc) || inc <= 0) return null;
    switch (country) {
      case "US": return calcTaxUS(inc, filing);
      case "UK": return calcTaxUK(inc);
      case "IN": return calcTaxIN(inc, regime, parseFloat(deductions) || 0);
      case "CA": return calcTaxCA(inc);
      case "AU": return calcTaxAU(inc);
      case "DE": return calcTaxDE(inc);
      case "GENERIC": return calcTaxGeneric(inc, parseFloat(taxRate) || 25);
    }
  }, [income, country, filing, regime, deductions, taxRate]);

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    if (country === "IN") return `₹${Math.round(abs).toLocaleString("en-IN")}`;
    return `${info.symbol}${Math.round(abs).toLocaleString("en-US")}`;
  };

  return (
    <Workspace title="Income Tax Calculator">
      {/* Country selector */}
      <div className="mb-5">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">Country / Tax System</div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TAX_COUNTRY_INFO) as TaxCountry[]).map(c => (
            <button key={c} onClick={() => handleCountry(c)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${country === c ? "bg-q-primary border-q-primary text-white" : "border-q-border bg-q-bg text-q-muted hover:text-q-text hover:border-q-text/30"}`}>
              {TAX_COUNTRY_INFO[c].flag} {TAX_COUNTRY_INFO[c].label}
            </button>
          ))}
        </div>
      </div>

      <CalculatorGrid
        left={
          <InputPanel subtitle="Enter your income to estimate tax liability.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Gross Income</label>
                <div className="flex items-center rounded-2xl border border-q-border bg-q-card overflow-hidden">
                  {info.symbol && <span className="px-3 text-q-muted text-sm">{info.symbol}</span>}
                  <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                    className="flex-1 bg-transparent py-3.5 px-2 text-q-text outline-none" />
                </div>
              </div>

              {country === "US" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Filing Status</label>
                  <div className="flex gap-2">
                    {["single", "married"].map(s => (
                      <button key={s} onClick={() => setFiling(s)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${filing === s ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                        {s === "single" ? "Single" : "Married Filing Jointly"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {country === "IN" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tax Regime</label>
                    <div className="flex gap-2">
                      {[["new", "New Regime"], ["old", "Old Regime"]].map(([val, lbl]) => (
                        <button key={val} onClick={() => setRegime(val)}
                          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${regime === val ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  {regime === "old" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Section 80C Deductions (max ₹1,50,000)</label>
                      <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} placeholder="e.g. 150000" className={fieldClass()} />
                    </div>
                  )}
                </>
              )}

              {country === "GENERIC" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Estimated Tax Rate</label>
                  <div className="flex items-center rounded-2xl border border-q-border bg-q-card overflow-hidden">
                    <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                      className="flex-1 bg-transparent py-3.5 px-3 text-q-text outline-none" />
                    <span className="px-3 text-q-muted text-sm">%</span>
                  </div>
                </div>
              )}
            </div>
          </InputPanel>
        }
        right={
          result ? (
            <section className="rounded-[26px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm md:p-6 space-y-4">
              <div className="rounded-2xl border-2 border-blue-400/40 bg-blue-50/40 dark:bg-blue-500/10 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Total Tax</div>
                <div className="mt-1 text-3xl font-bold text-blue-700 dark:text-blue-300">{fmt(result.tax)}</div>
                <div className="mt-1 text-sm text-q-muted">Effective rate: {result.effectiveRate.toFixed(1)}% · After tax: {fmt(result.netIncome)}</div>
              </div>
              <div className="rounded-2xl border border-q-border bg-q-bg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-q-border text-xs font-semibold uppercase tracking-widest text-q-muted">Tax Breakdown</div>
                <div className="divide-y divide-q-border">
                  {result.rows.map(row => (
                    <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 ${row.type === "total" || row.type === "final" ? "bg-q-card" : ""}`}>
                      <span className={`text-sm ${row.type === "final" ? "font-semibold text-q-text" : "text-q-muted"}`}>{row.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${row.type === "deduction" ? "text-red-500" : row.type === "final" ? "text-emerald-600 dark:text-emerald-400" : "text-q-text"}`}>
                        {row.value < 0 ? `-${fmt(-row.value)}` : fmt(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-q-muted">{result.note}</p>
            </section>
          ) : (
            <ResultsStage title="Tax estimate" result={null} emptyText="Enter your annual income to estimate tax." />
          )
        }
      />
    </Workspace>
  );
}

// ─── Compound Interest Calculator ─────────────────────────────────────────────
function CompoundInterestCalculator({ name = "" }: { name?: string }) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [compounding, setCompounding] = useState("1");

  const result = useMemo<InterpretedResult | null>(() => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(years);
    const n = Number(compounding);
    if (!p || !r || !t) return null;

    const amount = n === 0
      ? p * Math.exp(r * t) // continuous
      : p * Math.pow(1 + r / n, n * t);
    const interest = amount - p;
    const simpleInterest = p * r * t;
    const extraFromCompounding = interest - simpleInterest;

    return {
      primary: `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      secondary: "Total amount after compounding",
      extra: `Principal: ₹${p.toLocaleString("en-IN")} · Interest: ₹${interest.toLocaleString("en-IN", { maximumFractionDigits: 0 })} · Extra vs simple interest: ₹${extraFromCompounding.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      insight: `Compounding adds ₹${extraFromCompounding.toLocaleString("en-IN", { maximumFractionDigits: 0 })} more than simple interest over ${t} years. Your money grows ${(amount / p).toFixed(2)}x — this is the power of earning "interest on interest".`,
      recommendation: extraFromCompounding > p * 0.5
        ? "At this time horizon, compounding frequency matters significantly. Monthly compounding earns noticeably more than annual compounding — compare investments by their effective annual rate (EAR), not just the nominal rate."
        : "For shorter time periods, the difference between compounding frequencies is small. Focus on the interest rate and tenure — both have a larger impact on returns than compounding frequency.",
      notes: [
        "This calculator assumes a fixed, constant rate for the entire period.",
        "Real-world investments like mutual funds have variable returns — this is for illustration only.",
        "Compare investments using CAGR (Compound Annual Growth Rate) for fair comparison.",
      ],
    };
  }, [principal, rate, years, compounding]);

  return (
    <Workspace title={name || "Compound Interest Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Calculate compound interest and compare it against simple interest over any period.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Principal Amount (₹)</label>
                <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="e.g. 100000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Interest Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 8" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Time Period (Years)</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 10" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Compounding Frequency</label>
                <select value={compounding} onChange={e => setCompounding(e.target.value)} className={fieldClass()}>
                  <option value="1">Annual</option>
                  <option value="2">Semi-Annual</option>
                  <option value="4">Quarterly</option>
                  <option value="12">Monthly</option>
                  <option value="365">Daily</option>
                </select>
              </div>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="Compound interest result" result={result} emptyText="Enter principal, rate, and time period to calculate compound interest." />}
      />
    </Workspace>
  );
}


// ─── DISCOUNT CALCULATOR ─────────────────────────────────────────────────────
function DiscountCalculator({ name }: { name: string }) {
  const [original, setOriginal] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const orig = parseFloat(original);
    const disc = parseFloat(discount);
    if (!isFinite(orig) || !isFinite(disc) || orig <= 0 || disc < 0 || disc > 100) {
      setResult({ primary: "Invalid input", secondary: "Enter valid price and discount %", insight: "Original price must be > 0 and discount must be 0–100%.", recommendation: "" });
      return;
    }
    const savings = (orig * disc) / 100;
    const final = orig - savings;
    setResult({ primary: `₹${formatCurrency(final)}`, secondary: `Final price after ${disc}% off`, extra: `You save ₹${formatCurrency(savings)} on ₹${formatCurrency(orig)}`, insight: `A ${disc}% discount on ₹${formatCurrency(orig)} saves you ₹${formatCurrency(savings)}.`, recommendation: disc >= 50 ? "Great deal! Over 50% off." : disc >= 20 ? "Good savings on this purchase." : "Modest discount — compare with other offers." });
  }
  return (
    <Workspace title={name || "Discount Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Enter original price and discount percentage.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Original Price (₹)</label><input type="number" value={original} onChange={e => setOriginal(e.target.value)} placeholder="e.g. 2999" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Discount (%)</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 20" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Discount result" result={result} emptyText="Enter price and discount to calculate savings." />}
      />
    </Workspace>
  );
}

// ─── TIP CALCULATOR ──────────────────────────────────────────────────────────
function TipCalculator({ name }: { name: string }) {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState("15");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const b = parseFloat(bill);
    const t = parseFloat(tipPct);
    const p = Math.max(1, parseInt(people) || 1);
    if (!isFinite(b) || b <= 0 || !isFinite(t) || t < 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Enter a valid bill amount.", recommendation: "" }); return; }
    const tip = (b * t) / 100;
    const total = b + tip;
    const perPerson = total / p;
    setResult({ primary: `₹${formatCurrency(total)}`, secondary: `Total bill with ${t}% tip`, extra: `Tip: ₹${formatCurrency(tip)} · Per person: ₹${formatCurrency(perPerson)}`, insight: `On a ₹${formatCurrency(b)} bill, a ${t}% tip is ₹${formatCurrency(tip)}, making the total ₹${formatCurrency(total)}.`, recommendation: p > 1 ? `Split ${p} ways: ₹${formatCurrency(perPerson)} each.` : "Adjust the tip % to match service quality." });
  }
  return (
    <Workspace title={name || "Tip Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate tip and split the bill among friends.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Bill Amount (₹)</label><input type="number" value={bill} onChange={e => setBill(e.target.value)} placeholder="e.g. 1200" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tip (%)</label><select value={tipPct} onChange={e => setTipPct(e.target.value)} className={fieldClass()}><option value="5">5%</option><option value="10">10%</option><option value="15">15%</option><option value="18">18%</option><option value="20">20%</option><option value="25">25%</option></select></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Number of People</label><input type="number" value={people} onChange={e => setPeople(e.target.value)} placeholder="1" min="1" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Tip result" result={result} emptyText="Enter bill amount to calculate tip." />}
      />
    </Workspace>
  );
}

// ─── ROI CALCULATOR ──────────────────────────────────────────────────────────
function ROICalculator({ name }: { name: string }) {
  const [initial, setInitial] = useState("");
  const [finalVal, setFinalVal] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const i = parseFloat(initial);
    const f = parseFloat(finalVal);
    const y = parseFloat(years) || 0;
    if (!isFinite(i) || !isFinite(f) || i <= 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid investment values.", recommendation: "" }); return; }
    const roi = ((f - i) / i) * 100;
    const gain = f - i;
    const annualised = y > 0 ? (Math.pow(f / i, 1 / y) - 1) * 100 : null;
    setResult({ primary: `${formatNumber(roi, 2)}%`, secondary: `Total ROI on ₹${formatCurrency(i)}`, extra: `Gain: ₹${formatCurrency(gain)}${annualised !== null ? ` · Annualised: ${formatNumber(annualised, 2)}%` : ""}`, insight: `Your investment of ₹${formatCurrency(i)} returned ₹${formatCurrency(f)}, a ${roi >= 0 ? "gain" : "loss"} of ₹${formatCurrency(Math.abs(gain))} (${formatNumber(Math.abs(roi), 1)}%).`, recommendation: roi >= 15 ? "Excellent return — significantly above inflation." : roi >= 8 ? "Good return — beating typical fixed deposit rates." : roi >= 0 ? "Modest return — consider higher-yield options." : "Negative ROI — review the investment strategy." });
  }
  return (
    <Workspace title={name || "ROI Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate return on investment and annualised growth.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Initial Investment (₹)</label><input type="number" value={initial} onChange={e => setInitial(e.target.value)} placeholder="e.g. 50000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Final Value (₹)</label><input type="number" value={finalVal} onChange={e => setFinalVal(e.target.value)} placeholder="e.g. 75000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Duration (Years, optional)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 3" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="ROI result" result={result} emptyText="Enter initial and final investment values." />}
      />
    </Workspace>
  );
}

// ─── SAVINGS CALCULATOR ───────────────────────────────────────────────────────
function SavingsCalculator({ name }: { name: string }) {
  const [initial, setInitial] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const p = parseFloat(initial) || 0;
    const m = parseFloat(monthly) || 0;
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (!isFinite(n) || n <= 0 || !isFinite(r) || r < 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid years and interest rate.", recommendation: "" }); return; }
    const futureInitial = p * Math.pow(1 + r, n);
    const futureMonthly = r > 0 ? m * ((Math.pow(1 + r, n) - 1) / r) : m * n;
    const total = futureInitial + futureMonthly;
    const invested = p + m * n;
    const interest = total - invested;
    setResult({ primary: `₹${formatCurrency(total)}`, secondary: `Projected savings after ${years} years`, extra: `Invested: ₹${formatCurrency(invested)} · Interest earned: ₹${formatCurrency(interest)}`, insight: `Starting with ₹${formatCurrency(p)} and saving ₹${formatCurrency(m)}/month at ${rate}% p.a., you'll accumulate ₹${formatCurrency(total)} in ${years} years.`, recommendation: interest > invested ? "Your interest earnings exceed contributions — excellent compounding!" : "Keep increasing monthly savings to accelerate wealth building." });
  }
  return (
    <Workspace title={name || "Savings Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Project your savings with monthly contributions and interest.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Initial Savings (₹)</label><input type="number" value={initial} onChange={e => setInitial(e.target.value)} placeholder="e.g. 10000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Contribution (₹)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="e.g. 5000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 7" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Time Period (Years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 10" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Savings projection" result={result} emptyText="Enter savings details to project growth." />}
      />
    </Workspace>
  );
}

// ─── RETIREMENT CALCULATOR ────────────────────────────────────────────────────
function RetirementCalculator({ name }: { name: string }) {
  const [currentAge, setCurrentAge] = useState("");
  const [retireAge, setRetireAge] = useState("60");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [rate, setRate] = useState("10");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const ca = parseFloat(currentAge);
    const ra = parseFloat(retireAge);
    const ms = parseFloat(monthlySavings);
    const r = parseFloat(rate) / 100 / 12;
    if (!isFinite(ca) || !isFinite(ra) || ra <= ca || !isFinite(ms) || ms <= 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Retirement age must be greater than current age.", recommendation: "" }); return; }
    const n = (ra - ca) * 12;
    const corpus = r > 0 ? ms * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : ms * n;
    const invested = ms * n;
    const growth = corpus - invested;
    setResult({ primary: `₹${(corpus / 10000000).toFixed(2)} Cr`, secondary: `Estimated corpus at age ${ra}`, extra: `Invested: ₹${(invested / 100000).toFixed(1)}L · Growth: ₹${(growth / 100000).toFixed(1)}L`, insight: `Saving ₹${formatCurrency(ms)}/month for ${ra - ca} years at ${rate}% p.a. builds a corpus of ₹${(corpus / 10000000).toFixed(2)} crore.`, recommendation: corpus >= 10000000 ? "Strong retirement corpus — you're on track for a comfortable retirement." : "Consider increasing monthly savings or extending your investment horizon." });
  }
  return (
    <Workspace title={name || "Retirement Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Estimate your retirement corpus with monthly SIP investments.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Current Age</label><input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} placeholder="e.g. 30" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Retirement Age</label><input type="number" value={retireAge} onChange={e => setRetireAge(e.target.value)} placeholder="60" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Investment (₹)</label><input type="number" value={monthlySavings} onChange={e => setMonthlySavings(e.target.value)} placeholder="e.g. 10000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Expected Annual Return (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="10" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Retirement corpus" result={result} emptyText="Enter your age and savings to project retirement corpus." />}
      />
    </Workspace>
  );
}

// ─── CALORIE CALCULATOR ───────────────────────────────────────────────────────
function CalorieCalculator({ name }: { name: string }) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const act = parseFloat(activity);
    if (!isFinite(a) || !isFinite(w) || !isFinite(h) || a <= 0 || w <= 0 || h <= 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid age, weight and height.", recommendation: "" }); return; }
    // Mifflin-St Jeor equation
    const bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    setResult({ primary: `${Math.round(tdee)} kcal/day`, secondary: `Total daily energy expenditure`, extra: `BMR: ${Math.round(bmr)} kcal · To lose 0.5kg/week: ${Math.round(tdee - 500)} kcal`, insight: `Your basal metabolic rate is ${Math.round(bmr)} kcal. With your activity level, you burn approximately ${Math.round(tdee)} calories daily.`, recommendation: `To lose weight: eat ${Math.round(tdee - 500)}–${Math.round(tdee - 300)} kcal/day. To gain: eat ${Math.round(tdee + 300)}–${Math.round(tdee + 500)} kcal/day.` });
  }
  return (
    <Workspace title={name || "Calorie Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate daily calorie needs using the Mifflin-St Jeor equation.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Age (years)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={fieldClass()}><option value="male">Male</option><option value="female">Female</option></select></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Activity Level</label><select value={activity} onChange={e => setActivity(e.target.value)} className={fieldClass()}><option value="1.2">Sedentary (desk job, no exercise)</option><option value="1.375">Light (1–3 days/week exercise)</option><option value="1.55">Moderate (3–5 days/week)</option><option value="1.725">Active (6–7 days/week)</option><option value="1.9">Very Active (physical job + exercise)</option></select></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Daily calories" result={result} emptyText="Enter your details to calculate daily calorie needs." />}
      />
    </Workspace>
  );
}

// ─── FUEL COST CALCULATOR ─────────────────────────────────────────────────────
function FuelCostCalculator({ name }: { name: string }) {
  const [distance, setDistance] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const d = parseFloat(distance);
    const m = parseFloat(mileage);
    const fp = parseFloat(fuelPrice);
    if (!isFinite(d) || !isFinite(m) || !isFinite(fp) || d <= 0 || m <= 0 || fp <= 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid distance, mileage and fuel price.", recommendation: "" }); return; }
    const litresNeeded = d / m;
    const totalCost = litresNeeded * fp;
    const costPerKm = totalCost / d;
    setResult({ primary: `₹${formatCurrency(totalCost)}`, secondary: `Fuel cost for ${d} km trip`, extra: `Fuel needed: ${litresNeeded.toFixed(2)}L · Cost per km: ₹${costPerKm.toFixed(2)}`, insight: `For a ${d} km trip at ${m} km/L mileage and ₹${fp}/L fuel price, you need ${litresNeeded.toFixed(2)} litres costing ₹${formatCurrency(totalCost)}.`, recommendation: costPerKm < 5 ? "Very fuel efficient — great mileage for this trip." : costPerKm < 10 ? "Average fuel cost per km for Indian conditions." : "Consider a more fuel-efficient vehicle or route for long trips." });
  }
  return (
    <Workspace title={name || "Fuel Cost Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate fuel cost for any trip based on distance and mileage.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Distance (km)</label><input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder="e.g. 300" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Vehicle Mileage (km/litre)</label><input type="number" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="e.g. 15" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Fuel Price (₹/litre)</label><input type="number" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} placeholder="e.g. 106" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Fuel cost result" result={result} emptyText="Enter trip details to calculate fuel cost." />}
      />
    </Workspace>
  );
}

// ─── CAGR CALCULATOR ─────────────────────────────────────────────────────────
function CAGRCalculator({ name }: { name: string }) {
  const [initial, setInitial] = useState("");
  const [finalVal, setFinalVal] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const i = parseFloat(initial);
    const f = parseFloat(finalVal);
    const y = parseFloat(years);
    if (!isFinite(i) || !isFinite(f) || !isFinite(y) || i <= 0 || f <= 0 || y <= 0) { setResult({ primary: "Invalid input", secondary: "", insight: "All values must be positive numbers.", recommendation: "" }); return; }
    const cagr = (Math.pow(f / i, 1 / y) - 1) * 100;
    setResult({ primary: `${formatNumber(cagr, 2)}%`, secondary: `CAGR over ${y} years`, extra: `From ₹${formatCurrency(i)} → ₹${formatCurrency(f)}`, insight: `Your investment grew from ₹${formatCurrency(i)} to ₹${formatCurrency(f)} in ${y} years at a CAGR of ${formatNumber(cagr, 2)}% per year.`, recommendation: cagr >= 15 ? "Exceptional growth — top quartile investment performance." : cagr >= 10 ? "Strong CAGR — above average equity market returns." : cagr >= 7 ? "Decent CAGR — beating fixed income returns." : "Below average — consider reviewing your investment strategy." });
  }
  return (
    <Workspace title={name || "CAGR Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate compound annual growth rate between two values.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Initial Value (₹)</label><input type="number" value={initial} onChange={e => setInitial(e.target.value)} placeholder="e.g. 100000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Final Value (₹)</label><input type="number" value={finalVal} onChange={e => setFinalVal(e.target.value)} placeholder="e.g. 250000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Number of Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 5" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="CAGR result" result={result} emptyText="Enter initial value, final value and years." />}
      />
    </Workspace>
  );
}

// ─── GRATUITY CALCULATOR ─────────────────────────────────────────────────────
function GratuityCalculator({ name }: { name: string }) {
  const [salary, setSalary] = useState("");
  const [yearsWorked, setYearsWorked] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const s = parseFloat(salary);
    const y = parseFloat(yearsWorked);
    if (!isFinite(s) || !isFinite(y) || s <= 0 || y < 5) { setResult({ primary: y < 5 ? "Min 5 years required" : "Invalid input", secondary: "Gratuity requires minimum 5 years of service", insight: "As per the Payment of Gratuity Act, an employee must complete at least 5 years of continuous service.", recommendation: "" }); return; }
    // Formula: (Last drawn salary × 15/26) × years of service
    const gratuity = (s * 15 / 26) * Math.floor(y);
    const maxGratuity = 2000000; // ₹20 lakh cap
    const finalGratuity = Math.min(gratuity, maxGratuity);
    setResult({ primary: `₹${formatCurrency(finalGratuity)}`, secondary: `Gratuity amount after ${y} years`, extra: finalGratuity === maxGratuity ? "Capped at ₹20 lakh (statutory limit)" : `Based on last drawn salary of ₹${formatCurrency(s)}/month`, insight: `Based on a last drawn salary of ₹${formatCurrency(s)} and ${Math.floor(y)} years of service, your gratuity is ₹${formatCurrency(finalGratuity)}.`, recommendation: "This amount is tax-exempt up to ₹20 lakhs for private sector employees under the Payment of Gratuity Act." });
  }
  return (
    <Workspace title={name || "Gratuity Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate gratuity as per Indian Payment of Gratuity Act, 1972.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Last Drawn Salary (Basic + DA, ₹/month)</label><input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 50000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Years of Service (min 5)</label><input type="number" value={yearsWorked} onChange={e => setYearsWorked(e.target.value)} placeholder="e.g. 8" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="Gratuity amount" result={result} emptyText="Enter salary and years of service (minimum 5 years)." />}
      />
    </Workspace>
  );
}

// ─── RD CALCULATOR ───────────────────────────────────────────────────────────
function RDCalculator({ name }: { name: string }) {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);
  function calculate() {
    const m = parseFloat(monthly);
    const r = parseFloat(rate) / 100 / 4; // Quarterly compounding (RBI standard)
    const n = parseFloat(months);
    if (!isFinite(m) || !isFinite(r) || !isFinite(n) || m <= 0 || r <= 0 || n <= 0) { setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid monthly deposit, interest rate and tenure.", recommendation: "" }); return; }
    // RD maturity formula with quarterly compounding
    const maturity = m * (((Math.pow(1 + r, n / 3) - 1) / (1 - Math.pow(1 + r, -1 / 3))));
    const invested = m * n;
    const interest = maturity - invested;
    setResult({ primary: `₹${formatCurrency(maturity)}`, secondary: `RD maturity after ${n} months`, extra: `Invested: ₹${formatCurrency(invested)} · Interest: ₹${formatCurrency(interest)}`, insight: `Depositing ₹${formatCurrency(m)}/month for ${n} months at ${rate}% p.a. (quarterly compounding) yields ₹${formatCurrency(maturity)} at maturity.`, recommendation: `Interest earned: ₹${formatCurrency(interest)} (${formatNumber((interest / invested) * 100, 1)}% return on investment).` });
  }
  return (
    <Workspace title={name || "RD Calculator"}>
      <CalculatorGrid
        left={<InputPanel subtitle="Calculate recurring deposit maturity amount with quarterly compounding.">
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Deposit (₹)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="e.g. 5000" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 7.5" className={fieldClass()} /></div>
            <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tenure (Months)</label><input type="number" value={months} onChange={e => setMonths(e.target.value)} placeholder="e.g. 24" className={fieldClass()} /></div>
            <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
          </div>
        </InputPanel>}
        right={<ResultsStage title="RD maturity amount" result={result} emptyText="Enter monthly deposit, rate and tenure to calculate maturity." />}
      />
    </Workspace>
  );
}


// ─── MORTGAGE CALCULATOR ─────────────────────────────────────────────────────
function MortgageCalculator({ name }: { name: string }) {
  const [price, setPrice] = useState("");
  const [down, setDown] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<InterpretedResult | null>(null);

  function calculate() {
    const p = parseFloat(price);
    const d = parseFloat(down) || 0;
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const principal = p - d;
    if (!isFinite(p) || p <= 0 || !isFinite(n) || n <= 0 || !isFinite(r) || r < 0) {
      setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid property price, rate and years.", recommendation: "" });
      return;
    }
    const emi = r > 0 ? principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : principal / n;
    const total = emi * n;
    const interest = total - principal;
    setResult({
      primary: `₹${formatCurrency(emi)}`,
      secondary: `Monthly mortgage payment`,
      extra: `Total: ₹${formatCurrency(total)} · Interest: ₹${formatCurrency(interest)} · Loan: ₹${formatCurrency(principal)}`,
      insight: `On a ₹${formatCurrency(principal)} loan at ${rate}% for ${years} years, monthly payment is ₹${formatCurrency(emi)}.`,
      recommendation: interest > principal ? "High interest cost — consider a larger down payment or shorter term." : "Interest is below the principal — healthy loan structure.",
    });
  }

  return (
    <Workspace title={name || "Mortgage Calculator"}>
      <CalculatorGrid
        left={
          <InputPanel subtitle="Calculate monthly mortgage payments for any property.">
            <div className="grid gap-4">
              <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Property Price (₹)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 5000000" className={fieldClass()} /></div>
              <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Down Payment (₹)</label><input type="number" value={down} onChange={e => setDown(e.target.value)} placeholder="e.g. 1000000" className={fieldClass()} /></div>
              <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 8.5" className={fieldClass()} /></div>
              <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Loan Term (Years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="e.g. 20" className={fieldClass()} /></div>
              <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="Mortgage result" result={result} emptyText="Enter property details to calculate monthly payment." />}
      />
    </Workspace>
  );
}

// ─── SALES TAX / VAT CALCULATOR ──────────────────────────────────────────────
function SalesTaxCalculator({ name, label = "Tax" }: { name: string; label?: string }) {
  const [price, setPrice] = useState("");
  const [rate, setRate] = useState("");
  const [mode, setMode] = useState<"add" | "extract">("add");
  const [result, setResult] = useState<InterpretedResult | null>(null);

  function calculate() {
    const p = parseFloat(price);
    const r = parseFloat(rate) / 100;
    if (!isFinite(p) || !isFinite(r) || p <= 0 || r < 0) {
      setResult({ primary: "Invalid input", secondary: "", insight: "Enter valid price and tax rate.", recommendation: "" });
      return;
    }
    if (mode === "add") {
      const tax = p * r;
      const total = p + tax;
      setResult({
        primary: `${formatCurrency(total)}`,
        secondary: `Total price including ${rate}% ${label}`,
        extra: `${label} amount: ${formatCurrency(tax)} · Pre-tax: ${formatCurrency(p)}`,
        insight: `Adding ${rate}% ${label} to ${formatCurrency(p)} gives a total of ${formatCurrency(total)}.`,
        recommendation: `${label} amount payable: ${formatCurrency(tax)}`,
      });
    } else {
      const preTax = p / (1 + r);
      const tax = p - preTax;
      setResult({
        primary: `${formatCurrency(preTax)}`,
        secondary: `Pre-tax price extracted from ${formatCurrency(p)}`,
        extra: `${label} portion: ${formatCurrency(tax)} · Rate: ${rate}%`,
        insight: `The ${label}-inclusive price of ${formatCurrency(p)} at ${rate}% contains ${formatCurrency(tax)} in ${label}.`,
        recommendation: `Net price before ${label}: ${formatCurrency(preTax)}`,
      });
    }
  }

  return (
    <Workspace title={name || `${label} Calculator`}>
      <CalculatorGrid
        left={
          <InputPanel subtitle={`Add ${label} to a price or extract ${label} from an inclusive amount.`}>
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Mode</label>
                <div className="flex gap-2">
                  {([["add", `Add ${label}`], ["extract", `Extract ${label}`]] as const).map(([val, lbl]) => (
                    <button key={val} onClick={() => setMode(val)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${mode === val ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">{mode === "add" ? "Pre-tax Price" : `${label}-inclusive Price`}</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 1000" className={fieldClass()} /></div>
              <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">{label} Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 18" className={fieldClass()} /></div>
              <button onClick={calculate} className="w-full rounded-2xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition">Calculate →</button>
            </div>
          </InputPanel>
        }
        right={<ResultsStage title={`${label} result`} result={result} emptyText={`Enter price and ${label} rate.`} />}
      />
    </Workspace>
  );
}

// ─── MULTI-COUNTRY SALARY CALCULATOR ────────────────────────────────────────
type SalaryCountry = "US" | "UK" | "IN" | "AU" | "DE" | "GENERIC";

const SALARY_COUNTRY_INFO: Record<SalaryCountry, { label: string; flag: string; symbol: string; defaultSalary: string; period: string }> = {
  US:      { label: "United States", flag: "🇺🇸", symbol: "$",  defaultSalary: "75000",   period: "Annual Salary" },
  UK:      { label: "United Kingdom", flag: "🇬🇧", symbol: "£",  defaultSalary: "45000",   period: "Annual Salary" },
  IN:      { label: "India",          flag: "🇮🇳", symbol: "₹",  defaultSalary: "1200000", period: "Annual CTC" },
  AU:      { label: "Australia",      flag: "🇦🇺", symbol: "$",  defaultSalary: "90000",   period: "Annual Salary" },
  DE:      { label: "Germany",        flag: "🇩🇪", symbol: "€",  defaultSalary: "55000",   period: "Annual Brutto" },
  GENERIC: { label: "Other Country",  flag: "🌍", symbol: "",   defaultSalary: "60000",   period: "Annual Salary" },
};

function detectSalaryCountry(slug: string): SalaryCountry {
  const s = slug.toLowerCase();
  if (s.includes("washington") || s.includes("maryland") || s.includes("virginia") ||
      s.includes("california") || s.includes("new-york") || s.includes("texas") ||
      s.includes("florida") || s.includes("illinois") || s.includes("usa") ||
      s.includes("united-states") || s.includes("-us-") || s.endsWith("-us")) return "US";
  if (s.includes("uk") || s.includes("united-kingdom") || s.includes("paye") ||
      s.includes("london") || s.includes("england") || s.includes("scotland")) return "UK";
  if (s.includes("india") || s.includes("ctc") || s.includes("in-hand") ||
      s.includes("-in-") || s.endsWith("-in") || s.includes("inr")) return "IN";
  if (s.includes("australia") || s.includes("-au-") || s.endsWith("-au") ||
      s.includes("superannuation")) return "AU";
  if (s.includes("germany") || s.includes("deutschland") || s.includes("-de-") ||
      s.endsWith("-de") || s.includes("brutto")) return "DE";
  return "GENERIC";
}

type SalaryResult = {
  grossMonthly: number;
  netMonthly: number;
  rows: Array<{ label: string; value: number; type: "income" | "deduction" | "total" | "final" }>;
  effectiveTaxRate: number;
  note: string;
};

function calcSalaryUS(salary: number, filing: string): SalaryResult {
  const sB = [{ l: 11600, r: 0.10 },{ l: 47150, r: 0.12 },{ l: 100525, r: 0.22 },{ l: 191950, r: 0.24 },{ l: 243725, r: 0.32 },{ l: 609350, r: 0.35 },{ l: Infinity, r: 0.37 }];
  const mB = [{ l: 23200, r: 0.10 },{ l: 94300, r: 0.12 },{ l: 201050, r: 0.22 },{ l: 383900, r: 0.24 },{ l: 487450, r: 0.32 },{ l: 731200, r: 0.35 },{ l: Infinity, r: 0.37 }];
  const sd = filing === "married" ? 29200 : 14600;
  const brackets = filing === "married" ? mB : sB;
  const ti = Math.max(0, salary - sd);
  let ft = 0; let prev = 0;
  for (const b of brackets) { if (ti <= prev) break; ft += (Math.min(ti, b.l) - prev) * b.r; prev = b.l; }
  const ss = Math.min(salary, 168600) * 0.062;
  const mc = salary * 0.0145;
  const amc = salary > 200000 ? (salary - 200000) * 0.009 : 0;
  const fica = ss + mc + amc;
  const totalTax = ft + fica;
  const net = salary - totalTax;
  return {
    grossMonthly: salary / 12, netMonthly: net / 12, effectiveTaxRate: salary > 0 ? totalTax / salary * 100 : 0,
    note: "Federal tax only. State/local taxes vary. Based on 2025 brackets.",
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" },
      { label: `Standard Deduction (${filing === "married" ? "Married" : "Single"})`, value: -sd, type: "deduction" },
      { label: "Federal Income Tax", value: -ft, type: "deduction" },
      { label: "Social Security (6.2%)", value: -ss, type: "deduction" },
      { label: "Medicare (1.45%)", value: -mc, type: "deduction" },
      ...(amc > 0 ? [{ label: "Additional Medicare (0.9%)", value: -amc, type: "deduction" as const }] : []),
      { label: "Annual Take-Home", value: net, type: "final" },
    ],
  };
}

function calcSalaryUK(salary: number): SalaryResult {
  const pa = salary <= 100000 ? 12570 : Math.max(0, 12570 - (salary - 100000) / 2);
  const ti = Math.max(0, salary - pa);
  let it = 0;
  if (ti <= 37700) it = ti * 0.20;
  else if (ti <= 125140) it = 37700 * 0.20 + (ti - 37700) * 0.40;
  else it = 37700 * 0.20 + (125140 - 37700) * 0.40 + (ti - 125140) * 0.45;
  let ni = 0;
  const wp = salary / 52; const wpt = 242; const wuel = 967;
  if (wp > wpt) { ni = Math.min(wp - wpt, wuel - wpt) * 0.08; if (wp > wuel) ni += (wp - wuel) * 0.02; ni *= 52; }
  const td = it + ni; const net = salary - td;
  return {
    grossMonthly: salary / 12, netMonthly: net / 12, effectiveTaxRate: salary > 0 ? td / salary * 100 : 0,
    note: "Based on PAYE 2025-26 tax year. Excludes student loan, pension, and salary sacrifice.",
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" },
      { label: "Personal Allowance", value: -pa, type: "deduction" },
      { label: "Income Tax (PAYE)", value: -it, type: "deduction" },
      { label: "National Insurance", value: -ni, type: "deduction" },
      { label: "Annual Take-Home", value: net, type: "final" },
    ],
  };
}

function calcSalaryIN(annual: number, city: string, rent: number): SalaryResult {
  const basic = annual * 0.40; const hra = basic * (city === "metro" ? 0.50 : 0.40);
  const special = annual * 0.20; const lta = annual * 0.05; const med = 15000;
  const pfM = Math.min(basic / 12 * 0.12, 1800); const pfA = pfM * 12;
  const rentA = rent * 12;
  const hraEx = Math.max(0, Math.min(hra, rentA - basic * 0.10, basic * (city === "metro" ? 0.50 : 0.40)));
  const gross = basic + hra + special + lta + med;
  const taxable = Math.max(0, gross - hraEx - pfA - 50000);
  let tax = 0;
  if (taxable <= 300000) tax = 0;
  else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
  else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.10;
  else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15;
  else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.20;
  else tax = 150000 + (taxable - 1500000) * 0.30;
  const totalTax = tax + tax * 0.04; const pt = 2400;
  const inHand = gross - pfA - totalTax - pt;
  return {
    grossMonthly: gross / 12, netMonthly: inHand / 12, effectiveTaxRate: gross > 0 ? totalTax / gross * 100 : 0,
    note: "New Tax Regime FY 2025-26. Assumes 40% Basic, standard CTC structure.",
    rows: [
      { label: "Basic Salary", value: basic / 12, type: "income" },
      { label: "HRA", value: hra / 12, type: "income" },
      { label: "Special Allowance", value: special / 12, type: "income" },
      { label: "Gross Monthly", value: gross / 12, type: "total" },
      { label: "Provident Fund (12%)", value: -pfM, type: "deduction" },
      { label: "Income Tax (New Regime)", value: -(totalTax / 12), type: "deduction" },
      { label: "Professional Tax", value: -(pt / 12), type: "deduction" },
      { label: "Monthly In-Hand", value: inHand / 12, type: "final" },
    ],
  };
}

function calcSalaryAU(salary: number): SalaryResult {
  let it = 0;
  if (salary <= 18200) it = 0;
  else if (salary <= 45000) it = (salary - 18200) * 0.16;
  else if (salary <= 135000) it = 4288 + (salary - 45000) * 0.30;
  else if (salary <= 190000) it = 31288 + (salary - 135000) * 0.37;
  else it = 51638 + (salary - 190000) * 0.45;
  const ml = salary > 24276 ? salary * 0.02 : 0;
  const superG = salary * 0.115;
  const td = it + ml; const net = salary - td;
  return {
    grossMonthly: salary / 12, netMonthly: net / 12, effectiveTaxRate: salary > 0 ? td / salary * 100 : 0,
    note: "Based on 2025-26 PAYG rates. Super is employer-paid on top. Excludes HECS/HELP.",
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" },
      { label: "Income Tax (PAYG)", value: -it, type: "deduction" },
      { label: "Medicare Levy (2%)", value: -ml, type: "deduction" },
      { label: "Super Guarantee (11.5%)", value: superG, type: "income" },
      { label: "Annual Take-Home", value: net, type: "final" },
    ],
  };
}

function calcSalaryDE(salary: number, tc: string): SalaryResult {
  const gf = 11784; const taxable = Math.max(0, salary - gf);
  let it = 0;
  if (taxable <= 17005) it = taxable * 0.14;
  else if (taxable <= 66760) it = 17005 * 0.14 + (taxable - 17005) * 0.2397;
  else if (taxable <= 277826 - gf) it = 17005 * 0.14 + (66760 - 17005) * 0.2397 + (taxable - 66760) * 0.42;
  else it = 17005 * 0.14 + (66760 - 17005) * 0.2397 + (277826 - gf - 66760) * 0.42 + (taxable - (277826 - gf)) * 0.45;
  if (tc === "III") it *= 0.65;
  const soli = it > 18130 ? it * 0.055 : 0;
  const hi = Math.min(salary, 66150) * 0.073;
  const nc = Math.min(salary, 66150) * 0.017;
  const pen = Math.min(salary, 90600) * 0.093;
  const ue = Math.min(salary, 90600) * 0.013;
  const td = it + soli + hi + nc + pen + ue; const net = salary - td;
  return {
    grossMonthly: salary / 12, netMonthly: net / 12, effectiveTaxRate: salary > 0 ? td / salary * 100 : 0,
    note: "Estimated 2025 rates. Actual amounts depend on tax class, church tax, and health insurer.",
    rows: [
      { label: "Brutto (Gross Annual)", value: salary, type: "income" },
      { label: `Income Tax (Class ${tc})`, value: -it, type: "deduction" },
      { label: "Solidarity Surcharge", value: -soli, type: "deduction" },
      { label: "Health Insurance (7.3%)", value: -hi, type: "deduction" },
      { label: "Pension (9.3%)", value: -pen, type: "deduction" },
      { label: "Unemployment (1.3%)", value: -ue, type: "deduction" },
      { label: "Nursing Care (1.7%)", value: -nc, type: "deduction" },
      { label: "Netto (Annual Take-Home)", value: net, type: "final" },
    ],
  };
}

function calcSalaryGeneric(salary: number, rate: number): SalaryResult {
  const tax = salary * (rate / 100); const net = salary - tax;
  return {
    grossMonthly: salary / 12, netMonthly: net / 12, effectiveTaxRate: rate,
    note: "Using flat estimated tax rate. For accurate results, select your country above.",
    rows: [
      { label: "Gross Annual Salary", value: salary, type: "income" },
      { label: `Estimated Tax (${rate}%)`, value: -tax, type: "deduction" },
      { label: "Estimated Take-Home", value: net, type: "final" },
    ],
  };
}

function SalaryCalculator({ name, slug }: { name: string; slug: string }) {
  const detected = detectSalaryCountry(slug);
  const [country, setCountry] = useState<SalaryCountry>(detected);
  const info = SALARY_COUNTRY_INFO[country];
  const [salary, setSalary] = useState(info.defaultSalary);
  const [filing, setFiling] = useState("single");
  const [city, setCity] = useState<"metro" | "non-metro">("metro");
  const [rent, setRent] = useState("25000");
  const [taxClass, setTaxClass] = useState("I");
  const [taxRate, setTaxRate] = useState("25");

  const handleCountry = (c: SalaryCountry) => { setCountry(c); setSalary(SALARY_COUNTRY_INFO[c].defaultSalary); };

  const result: SalaryResult | null = useMemo(() => {
    const s = parseFloat(salary);
    if (!isFinite(s) || s <= 0) return null;
    switch (country) {
      case "US": return calcSalaryUS(s, filing);
      case "UK": return calcSalaryUK(s);
      case "IN": return calcSalaryIN(s, city, parseFloat(rent) || 0);
      case "AU": return calcSalaryAU(s);
      case "DE": return calcSalaryDE(s, taxClass);
      case "GENERIC": return calcSalaryGeneric(s, parseFloat(taxRate) || 25);
    }
  }, [salary, country, filing, city, rent, taxClass, taxRate]);

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    if (country === "IN") return `${info.symbol}${Math.round(abs).toLocaleString("en-IN")}`;
    return `${info.symbol || ""}${Math.round(abs).toLocaleString("en-US")}`;
  };

  return (
    <Workspace title={name || "Salary Calculator"}>
      {/* Country selector */}
      <div className="mb-5">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">Country / Tax System</div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SALARY_COUNTRY_INFO) as SalaryCountry[]).map(c => (
            <button key={c} onClick={() => handleCountry(c)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${country === c ? "bg-q-primary border-q-primary text-white" : "border-q-border bg-q-bg text-q-muted hover:text-q-text hover:border-q-text/30"}`}>
              {SALARY_COUNTRY_INFO[c].flag} {SALARY_COUNTRY_INFO[c].label}
            </button>
          ))}
        </div>
      </div>

      <CalculatorGrid
        left={
          <InputPanel subtitle="Enter your salary details to calculate take-home pay.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">{info.period}</label>
                <div className="flex items-center rounded-2xl border border-q-border bg-q-card overflow-hidden">
                  {info.symbol && <span className="px-3 text-q-muted text-sm">{info.symbol}</span>}
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
                    className="flex-1 bg-transparent py-3.5 px-2 text-q-text outline-none" />
                </div>
              </div>

              {country === "US" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Filing Status</label>
                  <div className="flex gap-2">
                    {["single", "married"].map(s => (
                      <button key={s} onClick={() => setFiling(s)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition capitalize ${filing === s ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                        {s === "single" ? "Single" : "Married Filing Jointly"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {country === "IN" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">City Type</label>
                    <div className="flex gap-2">
                      {(["metro", "non-metro"] as const).map(c => (
                        <button key={c} onClick={() => setCity(c)}
                          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition capitalize ${city === c ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                          {c === "metro" ? "Metro City" : "Non-Metro"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Monthly Rent Paid</label>
                    <div className="flex items-center rounded-2xl border border-q-border bg-q-card overflow-hidden">
                      <span className="px-3 text-q-muted text-sm">₹</span>
                      <input type="number" value={rent} onChange={e => setRent(e.target.value)}
                        className="flex-1 bg-transparent py-3.5 px-2 text-q-text outline-none" />
                    </div>
                  </div>
                </>
              )}

              {country === "DE" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tax Class (Steuerklasse)</label>
                  <div className="flex gap-2">
                    {["I", "III", "V"].map(tc => (
                      <button key={tc} onClick={() => setTaxClass(tc)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${taxClass === tc ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
                        Class {tc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {country === "GENERIC" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Estimated Tax Rate</label>
                  <div className="flex items-center rounded-2xl border border-q-border bg-q-card overflow-hidden">
                    <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                      className="flex-1 bg-transparent py-3.5 px-3 text-q-text outline-none" />
                    <span className="px-3 text-q-muted text-sm">%</span>
                  </div>
                </div>
              )}
            </div>
          </InputPanel>
        }
        right={
          result ? (
            <section className="rounded-[26px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm md:p-6 space-y-4">
              <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-500/10 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Monthly Take-Home</div>
                <div className="mt-1 text-3xl font-bold text-emerald-700 dark:text-emerald-300">{fmt(result.netMonthly)}</div>
                <div className="mt-1 text-sm text-q-muted">{fmt(result.netMonthly * 12)}/yr · Tax rate: {result.effectiveTaxRate.toFixed(1)}%</div>
              </div>
              <div className="rounded-2xl border border-q-border bg-q-bg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-q-border text-xs font-semibold uppercase tracking-widest text-q-muted">
                  {country === "IN" ? "Monthly" : "Annual"} Breakdown
                </div>
                <div className="divide-y divide-q-border">
                  {result.rows.map(row => (
                    <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 ${row.type === "total" || row.type === "final" ? "bg-q-card" : ""}`}>
                      <span className={`text-sm ${row.type === "final" ? "font-semibold text-q-text" : "text-q-muted"}`}>{row.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${row.type === "deduction" ? "text-red-500" : row.type === "final" ? "text-emerald-600 dark:text-emerald-400" : "text-q-text"}`}>
                        {row.value < 0 ? `-${fmt(-row.value)}` : fmt(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-q-muted">{result.note}</p>
            </section>
          ) : (
            <ResultsStage title="Salary result" result={null} emptyText="Enter your salary to see the take-home breakdown." />
          )
        }
      />
    </Workspace>
  );
}


export default function BuiltInCalculatorClient({ item }: Props) {
  const engine = String(item.engine_type || inferEngineType("calculator", item.slug) || "");
  const config = item.engine_config || {};
  const name = item.name || "";

  if (engine === "age-calculator") return <AgeCalculator name={name} />;
  if (engine === "bmi-calculator") return <BMICalculator name={name} />;
  if (engine === "loan-calculator") return <LoanCalculator name={name} />;
  if (engine === "emi-calculator") return <EMICalculator name={name} />;
  if (engine === "percentage-calculator") return <PercentageCalculator config={config} name={name} />;
  if (engine === "simple-interest-calculator") {
    return <SimpleInterestCalculator config={config} />;
  }
  if (engine === "gst-calculator") {
    return <GSTCalculator config={config} />;
  }
  if (engine === "formula-calculator") {
    return <FormulaCalculator config={config} name={item.name} />;
  }
  if (engine === "sip-calculator") return <SIPCalculator name={name} />;
  if (engine === "fd-calculator") return <FDCalculator name={name} />;
  if (engine === "ppf-calculator") return <PPFCalculator name={name} />;
  if (engine === "hra-calculator") return <HRACalculator name={name} />;
  if (engine === "income-tax-calculator") return <IncomeTaxCalculator slug={item.slug} />;
  if (engine === "compound-interest-calculator") return <CompoundInterestCalculator name={name} />;
  if (engine === "discount-calculator") return <DiscountCalculator name={name} />;
  if (engine === "tip-calculator") return <TipCalculator name={name} />;
  if (engine === "roi-calculator") return <ROICalculator name={name} />;
  if (engine === "savings-calculator") return <SavingsCalculator name={name} />;
  if (engine === "retirement-calculator") return <RetirementCalculator name={name} />;
  if (engine === "calorie-calculator") return <CalorieCalculator name={name} />;
  if (engine === "fuel-cost-calculator") return <FuelCostCalculator name={name} />;
  if (engine === "cagr-calculator") return <CAGRCalculator name={name} />;
  if (engine === "gratuity-calculator") return <GratuityCalculator name={name} />;
  if (engine === "rd-calculator") return <RDCalculator name={name} />;
  if (engine === "mortgage-calculator") return <MortgageCalculator name={name} />;
  if (engine === "sales-tax-calculator") return <SalesTaxCalculator name={name} label="Sales Tax" />;
  if (engine === "vat-calculator") return <SalesTaxCalculator name={name} label="VAT" />;
  if (engine === "salary-calculator") return <SalaryCalculator name={name} slug={item.slug} />;

  return <GenericCalculator name={item.name} />;
}