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
    <Workspace title="Age Calculator">
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

function BMICalculator() {
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
    <Workspace title="BMI Calculator">
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

function LoanCalculator() {
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
    <Workspace title="Loan Calculator">
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

function EMICalculator() {
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
    <Workspace title="EMI Calculator">
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

function PercentageCalculator({ config = {} }: { config?: Record<string, unknown> }) {
  const [mode, setMode] = useState<"of" | "whatPercent" | "change">("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  // Config-driven mode: custom labels mean this is a specific ratio calculator
  const customMode = Boolean(config.numeratorLabel || config.denominatorLabel);
  const numeratorLabel = String(config.numeratorLabel || "Value A");
  const denominatorLabel = String(config.denominatorLabel || "Value B");
  const resultLabel = String(config.resultLabel || "Percentage");
  const multiplier = Number(config.multiplier || 100);

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

    // Custom config mode: calculate ratio/percentage with specific labels
    if (customMode) {
      if (second === 0) return { primary: "Cannot divide by zero", secondary: resultLabel, insight: `Enter a valid ${denominatorLabel}.`, recommendation: "" };
      const value = (first / second) * multiplier;
      return {
        primary: `${value.toFixed(2)}${multiplier === 100 ? "%" : ""}`,
        secondary: resultLabel,
        insight: `${first} out of ${second} = ${value.toFixed(2)}${multiplier === 100 ? "%" : ""}`,
        recommendation: `${numeratorLabel}: ${first} · ${denominatorLabel}: ${second}`,
      };
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
    <Workspace title="Percentage Calculator">
      <CalculatorGrid
        left={
          <InputPanel subtitle={customMode ? `Enter values to calculate ${resultLabel.toLowerCase()}.` : "Compare values as percentages, portions, or relative change."}>
            <div className="grid gap-4">
              {!customMode && (
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
              )}
              <div className="flex flex-col gap-1">
                {customMode && <label className="text-xs font-medium text-q-muted px-1">{numeratorLabel}</label>}
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder={customMode ? numeratorLabel : "Value A"}
                  className={fieldClass()}
                />
              </div>
              <div className="flex flex-col gap-1">
                {customMode && <label className="text-xs font-medium text-q-muted px-1">{denominatorLabel}</label>}
                <input
                  type="number"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  placeholder={customMode ? denominatorLabel : "Value B"}
                  className={fieldClass()}
                />
              </div>
            </div>
          </InputPanel>
        }
        right={
          <ResultsStage
            title={customMode ? resultLabel : "Percentage result"}
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
function SIPCalculator() {
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
    <Workspace title="SIP Calculator">
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
function FDCalculator() {
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
    <Workspace title="FD Calculator">
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
function PPFCalculator() {
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
    <Workspace title="PPF Calculator">
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
function HRACalculator() {
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
    <Workspace title="HRA Calculator">
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

// ─── Income Tax Calculator ────────────────────────────────────────────────────
function IncomeTaxCalculator() {
  const [income, setIncome] = useState("");
  const [regime, setRegime] = useState("new");
  const [deductions, setDeductions] = useState("");

  const result = useMemo<InterpretedResult | null>(() => {
    const gross = Number(income);
    if (!gross || gross <= 0) return null;

    let taxable = gross;
    let tax = 0;

    if (regime === "new") {
      // New regime FY2025-26 slabs
      taxable = Math.max(0, gross - 75000); // Standard deduction ₹75,000
      const slabs = [
        { upto: 400000, rate: 0 },
        { upto: 800000, rate: 0.05 },
        { upto: 1200000, rate: 0.10 },
        { upto: 1600000, rate: 0.15 },
        { upto: 2000000, rate: 0.20 },
        { upto: 2400000, rate: 0.25 },
        { upto: Infinity, rate: 0.30 },
      ];
      let prev = 0;
      for (const slab of slabs) {
        if (taxable > prev) {
          tax += (Math.min(taxable, slab.upto) - prev) * slab.rate;
          prev = slab.upto;
        }
      }
      // Rebate u/s 87A — zero tax if taxable income ≤ ₹12,00,000
      if (taxable <= 1200000) tax = 0;
    } else {
      // Old regime
      const ded = Math.min(Number(deductions) || 0, 150000);
      taxable = Math.max(0, gross - 50000 - ded); // Standard deduction + 80C
      if (taxable <= 250000) tax = 0;
      else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
      else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
      else tax = 112500 + (taxable - 1000000) * 0.30;
      // Rebate u/s 87A for old regime ≤ ₹5L
      if (taxable <= 500000) tax = 0;
    }

    const cess = tax * 0.04;
    const total = tax + cess;
    const effective = gross > 0 ? (total / gross) * 100 : 0;
    const monthly = total / 12;

    return {
      primary: `₹${total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      secondary: `Total tax payable (FY2025-26, ${regime === "new" ? "New" : "Old"} Regime)`,
      extra: `Base tax: ₹${tax.toLocaleString("en-IN", { maximumFractionDigits: 0 })} + Cess (4%): ₹${cess.toLocaleString("en-IN", { maximumFractionDigits: 0 })} · Monthly TDS: ₹${monthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })} · Effective rate: ${effective.toFixed(1)}%`,
      insight: regime === "new"
        ? `Under the new regime, standard deduction of ₹75,000 applies. ${taxable <= 1200000 ? "Your net taxable income is ₹" + taxable.toLocaleString("en-IN") + " — within the ₹12L rebate limit under Sec 87A, so zero tax applies." : "No rebate applies at your income level — tax calculated on full taxable income."}`
        : `Under the old regime with ₹${(50000 + Math.min(Number(deductions) || 0, 150000)).toLocaleString("en-IN")} in deductions, your taxable income is ₹${taxable.toLocaleString("en-IN")}.`,
      recommendation: total === 0
        ? "Your income falls within the zero-tax bracket under the selected regime. File your ITR by July 31 even if tax payable is nil — it establishes your financial record."
        : `Compare both regimes. The new regime is simpler and better if your deductions are low. The old regime saves more if you have high 80C, HRA, and home loan deductions. Always consult a CA for final planning.`,
    };
  }, [income, regime, deductions]);

  return (
    <Workspace title="Income Tax Calculator">
      <CalculatorGrid
        left={
          <InputPanel subtitle="Estimate income tax for FY2025-26 under the new or old tax regime.">
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Annual Gross Income (₹)</label>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 1200000" className={fieldClass()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Tax Regime</label>
                <select value={regime} onChange={e => setRegime(e.target.value)} className={fieldClass()}>
                  <option value="new">New Regime (FY2025-26) — Default</option>
                  <option value="old">Old Regime (with deductions)</option>
                </select>
              </div>
              {regime === "old" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-q-muted">Section 80C Deductions (₹ max 1,50,000)</label>
                  <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} placeholder="e.g. 150000" className={fieldClass()} />
                  <p className="mt-1 text-xs text-q-muted">Includes PPF, ELSS, LIC, EPF, home loan principal etc.</p>
                </div>
              )}
            </div>
          </InputPanel>
        }
        right={<ResultsStage title="Tax estimate" result={result} emptyText="Enter your annual income and select a tax regime to estimate tax." />}
      />
    </Workspace>
  );
}

// ─── Compound Interest Calculator ─────────────────────────────────────────────
function CompoundInterestCalculator() {
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
    <Workspace title="Compound Interest Calculator">
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

export default function BuiltInCalculatorClient({ item }: Props) {
  const engine = String(item.engine_type || inferEngineType("calculator", item.slug) || "");
  const config = item.engine_config || {};

  if (engine === "age-calculator") return <AgeCalculator />;
  if (engine === "bmi-calculator") return <BMICalculator />;
  if (engine === "loan-calculator") return <LoanCalculator />;
  if (engine === "emi-calculator") return <EMICalculator />;
  if (engine === "percentage-calculator") return <PercentageCalculator config={config} />;
  if (engine === "simple-interest-calculator") {
    return <SimpleInterestCalculator config={config} />;
  }
  if (engine === "gst-calculator") {
    return <GSTCalculator config={config} />;
  }
  if (engine === "formula-calculator") {
    return <FormulaCalculator config={config} name={item.name} />;
  }
  if (engine === "sip-calculator") return <SIPCalculator />;
  if (engine === "fd-calculator") return <FDCalculator />;
  if (engine === "ppf-calculator") return <PPFCalculator />;
  if (engine === "hra-calculator") return <HRACalculator />;
  if (engine === "income-tax-calculator") return <IncomeTaxCalculator />;
  if (engine === "compound-interest-calculator") return <CompoundInterestCalculator />;

  return <GenericCalculator name={item.name} />;
}