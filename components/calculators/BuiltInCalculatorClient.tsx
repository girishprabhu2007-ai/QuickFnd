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
    <section className="rounded-2xl border border-q-border bg-q-card p-6">
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted";
}

function panelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-5 text-q-text";
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
          className={inputClass()}
        />
        <div className={panelClass()}>
          {result ? (
            <span>
              Age: <strong>{result.years}</strong> years,{" "}
              <strong>{result.months}</strong> months,{" "}
              <strong>{result.days}</strong> days
            </span>
          ) : (
            <span className="text-q-muted">Choose a birth date to calculate age.</span>
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
          className={inputClass()}
        />
        <input
          type="number"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          placeholder="Weight in kg"
          className={inputClass()}
        />
        <div className={panelClass()}>
          {result ? (
            <span>
              BMI: <strong>{result.bmi}</strong> ({result.category})
            </span>
          ) : (
            <span className="text-q-muted">Enter height and weight to calculate BMI.</span>
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
          className={inputClass()}
        />
        <input
          type="number"
          value={annualRate}
          onChange={(e) => setAnnualRate(e.target.value)}
          placeholder="Annual interest rate (%)"
          className={inputClass()}
        />
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="Repayment years"
          className={inputClass()}
        />
        <div className={panelClass()}>
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
            <span className="text-q-muted">Enter loan values to calculate monthly payment.</span>
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
          className={inputClass()}
        />
        <input
          type="number"
          value={annualRate}
          onChange={(e) => setAnnualRate(e.target.value)}
          placeholder="Annual interest rate (%)"
          className={inputClass()}
        />
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="Loan tenure in months"
          className={inputClass()}
        />
        <div className={panelClass()}>
          {result ? (
            <div className="grid gap-2">
              <div>
                Monthly EMI: <strong>{result.emi}</strong>
              </div>
              <div>
                Total Payment: <strong>{result.total}</strong>
              </div>
              <div>
                Total Interest: <strong>{result.interest}</strong>
              </div>
            </div>
          ) : (
            <span className="text-q-muted">Enter EMI values to calculate payment.</span>
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
          className={inputClass()}
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
          className={inputClass()}
        />
        <input
          type="number"
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="Value B"
          className={inputClass()}
        />

        <div className={panelClass()}>
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
          className={inputClass()}
        />
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate (%)"
          className={inputClass()}
        />
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Time (years)"
          className={inputClass()}
        />
        <div className={panelClass()}>
          {result ? (
            <div className="grid gap-2">
              <div>
                Interest: <strong>{result.interest}</strong>
              </div>
              <div>
                Total Amount: <strong>{result.total}</strong>
              </div>
            </div>
          ) : (
            <span className="text-q-muted">Enter values to calculate simple interest.</span>
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
          className={inputClass()}
        >
          <option value="add">Add GST</option>
          <option value="remove">Remove GST</option>
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className={inputClass()}
        />
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="GST rate (%)"
          className={inputClass()}
        />

        <div className={panelClass()}>
          {result ? (
            <div className="grid gap-2">
              <div>
                GST Amount: <strong>{result.gst}</strong>
              </div>
              <div>
                {mode === "add" ? "Total with GST" : "Base Amount"}: <strong>{result.total}</strong>
              </div>
            </div>
          ) : (
            <span className="text-q-muted">Enter values to calculate GST.</span>
          )}
        </div>
      </div>
    </Card>
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

  const result = useMemo(() => {
    if (preset === "unix-timestamp") {
      if (mode === "timestamp-to-date") {
        const timestamp = Number(values.timestamp || "");
        if (!Number.isFinite(timestamp)) return null;

        const date = new Date(timestamp * 1000);
        if (Number.isNaN(date.getTime())) return null;

        return {
          primary: date.toISOString(),
          secondary: "UTC date/time",
        };
      }

      if (!dateTimeValue) return null;
      const date = new Date(dateTimeValue);
      if (Number.isNaN(date.getTime())) return null;

      return {
        primary: String(Math.floor(date.getTime() / 1000)),
        secondary: "Unix timestamp",
      };
    }

    if (preset === "daily-time-budget") {
      const total = Number(values.total_hours || "");
      const sleep = Number(values.sleep_hours || "");
      const work = Number(values.work_hours || "");
      const commute = Number(values.commute_hours || "");
      const exercise = Number(values.exercise_hours || "");
      const other = Number(values.other_hours || "");

      if ([total, sleep, work, commute, exercise, other].some((v) => !Number.isFinite(v))) {
        return null;
      }

      const used = sleep + work + commute + exercise + other;
      const free = total - used;

      return {
        primary: free.toFixed(2),
        secondary: "Free hours remaining",
        extra: `Allocated hours: ${used.toFixed(2)}`,
      };
    }

    if (preset === "api-rate-limit") {
      const requests = Number(values.requests || "");
      const windowSeconds = Number(values.window_seconds || "");

      if (!Number.isFinite(requests) || !Number.isFinite(windowSeconds) || windowSeconds === 0) {
        return null;
      }

      const perSecond = requests / windowSeconds;
      const perMinute = perSecond * 60;

      return {
        primary: perSecond.toFixed(2),
        secondary: "Requests per second",
        extra: `Requests per minute: ${perMinute.toFixed(2)}`,
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
      };
    }

    if (preset === "rate-estimator") {
      const numerator = Number(values.numerator || "");
      const period = Number(values.period || "");

      if (!Number.isFinite(numerator) || !Number.isFinite(period) || period === 0) {
        return null;
      }

      const rate = numerator / period;

      return {
        primary: rate.toFixed(Number(config.decimals ?? 2)),
        secondary: String(config.resultLabel || "Rate"),
      };
    }

    if (preset === "revenue-estimator") {
      const views = Number(values.views || "");
      const rpm = Number(values.rpm || "");

      if (!Number.isFinite(views) || !Number.isFinite(rpm)) {
        return null;
      }

      const revenue = (views / 1000) * rpm;

      return {
        primary: revenue.toFixed(Number(config.decimals ?? 2)),
        secondary: String(config.resultLabel || "Estimated revenue"),
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

    return {
      primary: `${resultValue.toFixed(decimals)}${suffix}`,
      secondary: String(config.resultLabel || "Result"),
    };
  }, [config, dateTimeValue, mode, preset, values]);

  return (
    <Card title={name || "Formula Calculator"}>
      <div className="grid gap-4">
        {preset === "unix-timestamp" ? (
          <>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "timestamp-to-date" | "date-to-timestamp")
              }
              className={inputClass()}
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
                className={inputClass()}
              />
            ) : (
              <input
                type="datetime-local"
                value={dateTimeValue}
                onChange={(e) => setDateTimeValue(e.target.value)}
                className={inputClass()}
              />
            )}
          </>
        ) : (
          fieldDefinitions.map((field) => (
            <input
              key={field.key}
              type="number"
              value={values[field.key] || ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [field.key]: e.target.value,
                }))
              }
              placeholder={field.placeholder || field.label}
              className={inputClass()}
            />
          ))
        )}

        <div className={panelClass()}>
          {result ? (
            <div className="grid gap-2">
              <div>
                {result.secondary}: <strong>{result.primary}</strong>
              </div>
              {"extra" in result && result.extra ? <div>{result.extra}</div> : null}
            </div>
          ) : (
            <span className="text-q-muted">Enter values to calculate.</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function GenericCalculator() {
  return (
    <Card title="Calculator Interface">
      <div className="rounded-xl border border-q-border bg-q-bg p-5 text-q-muted">
        This calculator page is live and database-driven. You can attach a
        more specific calculator engine later.
      </div>
    </Card>
  );
}

export default function BuiltInCalculatorClient({ item }: Props) {
  const engine = String(item.engine_type || inferEngineType("calculator", item.slug) || "");
  const config = item.engine_config || {};

  if (engine === "age-calculator") return <AgeCalculator />;
  if (engine === "bmi-calculator") return <BMICalculator />;
  if (engine === "loan-calculator") return <LoanCalculator />;
  if (engine === "emi-calculator") return <EMICalculator />;
  if (engine === "percentage-calculator") return <PercentageCalculator />;
  if (engine === "simple-interest-calculator") return <SimpleInterestCalculator {...{ config }} />;
  if (engine === "gst-calculator") return <GSTCalculator {...{ config }} />;
  if (engine === "formula-calculator") {
    return <FormulaCalculator config={config} name={item.name} />;
  }

  return <GenericCalculator />;
}