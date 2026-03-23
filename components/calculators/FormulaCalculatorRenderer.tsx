"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";

type Props = {
  item: PublicContentItem;
};

type FormulaConfig = {
  preset?: string;
  titleOverride?: string;
  numeratorLabel?: string;
  denominatorLabel?: string;
  resultLabel?: string;
  resultSuffix?: string;
  multiplier?: number;
  decimals?: number;
  quantityLabel?: string;
  unitCostLabel?: string;
  overheadLabel?: string;
  viewsLabel?: string;
  rpmLabel?: string;
  periodLabel?: string;
};

type ResultBlock = {
  label: string;
  value: string;
};

type ResultPayload = {
  blocks: ResultBlock[];
  insight?: string;
  recommendation?: string;
  notes?: string[];
};

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none";
}

function panelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-4";
}

function sectionClass() {
  return "rounded-2xl border border-q-border bg-q-card p-6";
}

function safeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, decimals = 2) {
  return value.toFixed(decimals);
}

function getConfig(item: PublicContentItem): FormulaConfig {
  if (!item.engine_config || typeof item.engine_config !== "object") {
    return {};
  }

  return item.engine_config as FormulaConfig;
}

function timeToMinutes(value: string) {
  if (!value) return null;
  const parts = value.split(":").map(Number);
  if (parts.length < 2 || parts.some((part) => !Number.isFinite(part))) return null;
  return parts[0] * 60 + parts[1];
}

function minutesToClock(totalMinutes: number) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (normalized % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function infoBoxClass() {
  return "rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700";
}

function recommendationBoxClass() {
  return "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900";
}

function notesBoxClass() {
  return "rounded-xl border border-q-border bg-white p-4 text-sm text-q-muted";
}

function buildSleepCycleInsight(cycles: number) {
  if (cycles < 4) {
    return {
      insight:
        "This sleep duration is short for most adults and may leave you under-rested.",
      recommendation:
        "Aim for 5 or 6 full sleep cycles when possible for more complete rest and recovery.",
    };
  }

  if (cycles <= 6) {
    return {
      insight:
        "This is within a common sleep-cycle range used for planning wake-up times.",
      recommendation:
        "Try to keep wake time consistent and leave a little wind-down time before sleep.",
    };
  }

  return {
    insight:
      "This is a long sleep duration and may be useful for recovery, but could be more than needed for routine scheduling.",
    recommendation:
      "Use a duration that fits your real routine, energy levels, and recovery needs rather than always maximizing cycles.",
  };
}

function buildTimeBudgetInsight(free: number, total: number) {
  if (free < 0) {
    return {
      insight:
        "Your entered commitments exceed the total hours available, so this schedule is over-allocated.",
      recommendation:
        "Reduce one or more commitments or redistribute them across multiple days.",
    };
  }

  if (free < 1) {
    return {
      insight:
        "Your day leaves almost no margin for breaks, delays, or recovery.",
      recommendation:
        "Create at least a small time buffer for transitions, meals, and unexpected tasks.",
    };
  }

  if (free <= total * 0.25) {
    return {
      insight:
        "Your day is tightly planned but still leaves some limited free time.",
      recommendation:
        "Protect that remaining time instead of filling it with more obligations.",
    };
  }

  return {
    insight:
      "Your daily schedule leaves a reasonable amount of unallocated time.",
    recommendation:
      "This likely gives you room for flexibility, recovery, and unplanned tasks.",
  };
}

function buildProbabilityInsight(percentage: number) {
  if (percentage < 20) {
    return {
      insight: "This indicates a relatively low probability.",
      recommendation:
        "Treat it as directional guidance, not certainty, and validate assumptions before acting.",
    };
  }

  if (percentage < 60) {
    return {
      insight: "This indicates a moderate probability with meaningful uncertainty.",
      recommendation:
        "Use this for planning scenarios, not as a guaranteed prediction.",
    };
  }

  return {
    insight: "This indicates a high probability based on the values entered.",
    recommendation:
      "Even high probabilities can fail in reality, so review your input assumptions carefully.",
  };
}

function buildRateInsight(rate: number, label: string) {
  if (rate <= 0) {
    return {
      insight: `${label} is zero or negative, which usually means there is no measurable output in the selected period.`,
      recommendation: "Check both your numerator and your period value.",
    };
  }

  if (rate < 1) {
    return {
      insight: `${label} is low relative to the selected period.`,
      recommendation: "Try a longer period if you want a more stable and interpretable average.",
    };
  }

  if (rate < 10) {
    return {
      insight: `${label} is moderate and likely realistic for ongoing work or performance measurement.`,
      recommendation: "Compare this value against a prior period or benchmark for better meaning.",
    };
  }

  return {
    insight: `${label} is high relative to the selected period.`,
    recommendation: "Double-check the period unit and your numerator to confirm the result is realistic.",
  };
}

function buildRevenueInsight(revenue: number) {
  if (revenue <= 0) {
    return {
      insight:
        "This estimate is zero or negative based on your current assumptions.",
      recommendation:
        "Check the traffic volume and RPM inputs before using the forecast.",
    };
  }

  if (revenue < 100) {
    return {
      insight:
        "This is a modest revenue estimate that may fit smaller traffic volumes or lower monetization quality.",
      recommendation:
        "Improve either traffic or RPM assumptions if this is below your target outcome.",
    };
  }

  if (revenue < 1000) {
    return {
      insight:
        "This is a meaningful mid-range estimate suitable for directional planning.",
      recommendation:
        "Compare this with historical performance rather than treating it as a guaranteed result.",
    };
  }

  return {
    insight:
      "This is a large revenue estimate and may reflect ambitious assumptions.",
    recommendation:
      "Stress-test the RPM and volume assumptions because optimistic values can overstate earnings.",
  };
}

function buildMetricRatioInsight(value: number) {
  if (value < 25) {
    return {
      insight: "The ratio is low relative to the baseline.",
      recommendation:
        "Review whether the numerator is underperforming or the denominator is too large for the intended target.",
    };
  }

  if (value > 75) {
    return {
      insight: "The ratio is high relative to the baseline.",
      recommendation:
        "This may indicate strong performance, but confirm the units and baseline are appropriate.",
    };
  }

  return {
    insight: "The ratio sits in a moderate middle range.",
    recommendation:
      "Compare this against a benchmark or previous period to make it more actionable.",
  };
}

export default function FormulaCalculatorRenderer({ item }: Props) {
  const config = getConfig(item);
  const preset = String(config.preset || "metric-ratio").trim().toLowerCase();
  const title = config.titleOverride || item.name;

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [e, setE] = useState("");
  const [f, setF] = useState("");
  const [fromUnit, setFromUnit] = useState("minutes");
  const [toUnit, setToUnit] = useState("hours");
  const [datetimeA, setDatetimeA] = useState("");
  const [datetimeB, setDatetimeB] = useState("");
  const [timeA, setTimeA] = useState("");
  const [timeB, setTimeB] = useState("");
  const [countdownNow] = useState(() => Date.now());

  const result = useMemo<ResultPayload | null>(() => {
    if (preset === "daily-time-budget") {
      const total = safeNumber(a);
      const sleep = safeNumber(b);
      const work = safeNumber(c);
      const commute = safeNumber(d);
      const exercise = safeNumber(e);
      const other = safeNumber(f);

      if ([total, sleep, work, commute, exercise, other].some((value) => value === null)) {
        return null;
      }

      const allocated =
        (sleep as number) +
        (work as number) +
        (commute as number) +
        (exercise as number) +
        (other as number);

      const free = (total as number) - allocated;
      const interpretation = buildTimeBudgetInsight(free, total as number);

      return {
        blocks: [
          { label: "Allocated hours", value: formatNumber(allocated, 2) },
          { label: "Free hours", value: formatNumber(free, 2) },
          {
            label: "Status",
            value: free >= 0 ? "Within daily budget" : "Over allocated",
          },
        ],
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "This assumes the entered activities do not overlap.",
          "Use it as a planning aid, not as a measure of overall wellbeing by itself.",
        ],
      };
    }

    if (preset === "datetime-difference") {
      if (!datetimeA || !datetimeB) return null;
      const start = new Date(datetimeA).getTime();
      const end = new Date(datetimeB).getTime();

      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

      const diffMs = Math.abs(end - start);
      const minutes = diffMs / 60000;
      const hours = minutes / 60;
      const days = hours / 24;

      return {
        blocks: [
          { label: "Difference in minutes", value: formatNumber(minutes, 2) },
          { label: "Difference in hours", value: formatNumber(hours, 2) },
          { label: "Difference in days", value: formatNumber(days, 2) },
        ],
        insight:
          "This measures the absolute time gap between the two date/time values you entered.",
        recommendation:
          "Useful for schedules, deadlines, event duration checks, and time tracking comparisons.",
        notes: [
          "The calculation uses your entered timestamps directly.",
          "Timezone handling depends on the values provided by your browser input fields.",
        ],
      };
    }

    if (preset === "sleep-cycle") {
      const bedtimeMinutes = timeToMinutes(timeA);
      const cycles = safeNumber(a);

      if (bedtimeMinutes === null || cycles === null) return null;

      const wakeMinutes = bedtimeMinutes + (cycles as number) * 90 + 15;
      const interpretation = buildSleepCycleInsight(cycles as number);

      return {
        blocks: [
          { label: "Suggested wake-up time", value: minutesToClock(wakeMinutes) },
          {
            label: "Estimated sleep duration",
            value: `${formatNumber((cycles as number) * 1.5, 1)} hours`,
          },
          {
            label: "Sleep cycles",
            value: formatNumber(cycles as number, 0),
          },
        ],
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "This uses a simplified 90-minute sleep cycle model plus 15 minutes to fall asleep.",
          "It is useful for planning, but not a medical sleep assessment.",
        ],
      };
    }

    if (preset === "shift-hours") {
      const start = timeToMinutes(timeA);
      const end = timeToMinutes(timeB);
      const breakMinutes = safeNumber(a) ?? 0;
      const workDays = safeNumber(b);

      if (start === null || end === null) return null;

      let total = end - start;
      if (total < 0) total += 1440;
      total -= breakMinutes as number;

      const dailyHours = total / 60;
      const weeklyHours = workDays !== null ? dailyHours * (workDays as number) : null;

      return {
        blocks: [
          { label: "Daily working hours", value: formatNumber(dailyHours, 2) },
          {
            label: "Weekly working hours",
            value: weeklyHours !== null ? formatNumber(weeklyHours, 2) : "Enter work days",
          },
        ],
        insight:
          "This estimates actual working time after subtracting your break duration.",
        recommendation:
          dailyHours > 10
            ? "This is a long working day. Double-check break time, overtime assumptions, and sustainability."
            : "Use the weekly total to compare workloads across schedules or staffing plans.",
        notes: [
          "Overnight shifts are supported when end time is earlier than start time.",
        ],
      };
    }

    if (preset === "project-time-estimator") {
      const tasks = safeNumber(a);
      const minutesPerTask = safeNumber(b);
      const bufferPercent = safeNumber(c) ?? 0;

      if (tasks === null || minutesPerTask === null) return null;

      const rawMinutes = (tasks as number) * (minutesPerTask as number);
      const totalMinutes = rawMinutes * (1 + (bufferPercent as number) / 100);

      return {
        blocks: [
          { label: "Estimated minutes", value: formatNumber(totalMinutes, 2) },
          { label: "Estimated hours", value: formatNumber(totalMinutes / 60, 2) },
          { label: "Buffer applied", value: `${formatNumber(bufferPercent as number, 2)}%` },
        ],
        insight:
          "This estimate multiplies task count by average task duration and adds a planning buffer.",
        recommendation:
          "Use a buffer whenever tasks have uncertainty; estimates without buffer are usually too optimistic.",
        notes: [
          "This is best used for rough planning, not guaranteed delivery forecasting.",
        ],
      };
    }

    if (preset === "time-conversion") {
      const value = safeNumber(a);
      if (value === null) return null;

      const units: Record<string, number> = {
        seconds: 1,
        minutes: 60,
        hours: 3600,
        days: 86400,
        weeks: 604800,
      };

      if (!units[fromUnit] || !units[toUnit]) return null;

      const seconds = (value as number) * units[fromUnit];
      const converted = seconds / units[toUnit];

      return {
        blocks: [
          { label: "Converted value", value: formatNumber(converted, 4) },
          { label: "From unit", value: fromUnit },
          { label: "To unit", value: toUnit },
        ],
        insight:
          "This converts time units through a common seconds-based representation.",
        recommendation:
          "Useful for duration normalization, reporting, and comparing time values across different unit systems.",
      };
    }

    if (preset === "unix-timestamp") {
      const timestamp = safeNumber(a);

      if (timestamp !== null) {
        const date = new Date((timestamp as number) * 1000);
        if (!Number.isNaN(date.getTime())) {
          return {
            blocks: [
              { label: "UTC date", value: date.toISOString() },
              { label: "Timestamp", value: String(timestamp) },
            ],
            insight:
              "This converts a Unix timestamp in seconds into a human-readable UTC date.",
            recommendation:
              "Use it for API logs, database values, event debugging, and backend integrations.",
            notes: [
              "Unix timestamps are commonly stored in UTC seconds.",
              "If you need local time, compare the result with your timezone separately.",
            ],
          };
        }
      }

      if (datetimeA) {
        const ms = new Date(datetimeA).getTime();
        if (!Number.isNaN(ms)) {
          return {
            blocks: [
              { label: "Unix timestamp", value: String(Math.floor(ms / 1000)) },
              { label: "Input date/time", value: datetimeA },
            ],
            insight:
              "This converts the provided date/time into a Unix timestamp in seconds.",
            recommendation:
              "Use it when preparing timestamps for APIs, logs, databases, and automation schedules.",
            notes: [
              "Browser datetime-local values do not include timezone text explicitly.",
            ],
          };
        }
      }

      return null;
    }

    if (preset === "countdown") {
      if (!datetimeA) return null;
      const future = new Date(datetimeA).getTime();
      const now = countdownNow;

      if (!Number.isFinite(future)) return null;

      const diff = future - now;
      const totalMinutes = diff / 60000;
      const totalHours = diff / 3600000;
      const totalDays = diff / 86400000;

      return {
        blocks: [
          { label: "Days remaining", value: formatNumber(totalDays, 2) },
          { label: "Hours remaining", value: formatNumber(totalHours, 2) },
          { label: "Minutes remaining", value: formatNumber(totalMinutes, 2) },
        ],
        insight:
          diff >= 0
            ? "This shows the remaining time until your selected future moment."
            : "The selected time is already in the past, so the values represent elapsed time since that moment.",
        recommendation:
          diff >= 0
            ? "Use this for deadlines, launches, events, or milestone countdowns."
            : "Pick a future date if you want a true countdown rather than elapsed time.",
      };
    }

    if (preset === "pomodoro") {
      const focus = safeNumber(a);
      const shortBreak = safeNumber(b);
      const sessions = safeNumber(c);

      if (focus === null || shortBreak === null || sessions === null) return null;

      const totalFocus = (focus as number) * (sessions as number);
      const totalBreak = (shortBreak as number) * Math.max((sessions as number) - 1, 0);

      return {
        blocks: [
          { label: "Total focus minutes", value: formatNumber(totalFocus, 0) },
          { label: "Total break minutes", value: formatNumber(totalBreak, 0) },
          {
            label: "Full cycle minutes",
            value: formatNumber(totalFocus + totalBreak, 0),
          },
        ],
        insight:
          "This estimates the total time required for a Pomodoro-style work block including short breaks.",
        recommendation:
          "Use this to plan study sessions, deep work blocks, or task batching with realistic break time included.",
      };
    }

    if (preset === "timezone-difference") {
      const offsetA = safeNumber(a);
      const offsetB = safeNumber(b);

      if (offsetA === null || offsetB === null) return null;

      const diff = Math.abs((offsetA as number) - (offsetB as number));

      return {
        blocks: [{ label: "Time difference", value: `${formatNumber(diff, 2)} hours` }],
        insight:
          "This compares two UTC offsets to show the time gap between locations or working regions.",
        recommendation:
          "Useful for scheduling calls, remote collaboration, and support coverage planning.",
        notes: [
          "This does not automatically account for daylight saving rules.",
        ],
      };
    }

    if (preset === "probability") {
      const favorable = safeNumber(a);
      const total = safeNumber(b);

      if (favorable === null || total === null || total === 0) return null;

      const percentage = ((favorable as number) / (total as number)) * 100;
      const interpretation = buildProbabilityInsight(percentage);

      return {
        blocks: [
          { label: config.resultLabel || "Probability", value: `${formatNumber(percentage, 2)}%` },
        ],
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "The result depends entirely on how well your inputs reflect reality.",
        ],
      };
    }

    if (preset === "api-rate-limit") {
      const requests = safeNumber(a);
      const windowSeconds = safeNumber(b);

      if (requests === null || windowSeconds === null || windowSeconds === 0) return null;

      const perSecond = (requests as number) / (windowSeconds as number);
      const perMinute = perSecond * 60;

      return {
        blocks: [
          { label: "Requests per second", value: formatNumber(perSecond, 2) },
          { label: "Requests per minute", value: formatNumber(perMinute, 2) },
        ],
        insight:
          "This expresses your rate limit as average throughput over the chosen time window.",
        recommendation:
          perSecond < 1
            ? "Low average throughput may be fine for small workloads, but check burst traffic separately."
            : "Compare this result against expected burst traffic and concurrency, not only average usage.",
      };
    }

    if (preset === "cost-estimator") {
      const quantity = safeNumber(a);
      const unitCost = safeNumber(b);
      const overhead = safeNumber(c) ?? 0;

      if (quantity === null || unitCost === null) return null;

      const base = (quantity as number) * (unitCost as number);
      const total = base * (1 + (overhead as number) / 100);

      return {
        blocks: [
          { label: "Base value", value: formatNumber(base, 2) },
          { label: config.resultLabel || "Estimated result", value: formatNumber(total, 2) },
        ],
        insight:
          "This combines direct cost with an overhead adjustment to create a more realistic estimate.",
        recommendation:
          (overhead as number) > 25
            ? "The overhead assumption is fairly high. Confirm whether this is intentional or if costs are being double-counted."
            : "Test multiple overhead values to understand best-case and worst-case cost scenarios.",
      };
    }

    if (preset === "rate-estimator") {
      const numerator = safeNumber(a);
      const period = safeNumber(b);

      if (numerator === null || period === null || period === 0) return null;

      const rate = (numerator as number) / (period as number);
      const interpretation = buildRateInsight(rate, String(config.resultLabel || "Rate"));

      return {
        blocks: [{ label: config.resultLabel || "Rate", value: formatNumber(rate, 2) }],
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
      };
    }

    if (preset === "revenue-estimator") {
      const views = safeNumber(a);
      const rpm = safeNumber(b);

      if (views === null || rpm === null) return null;

      const revenue = ((views as number) / 1000) * (rpm as number);
      const interpretation = buildRevenueInsight(revenue);

      return {
        blocks: [{ label: config.resultLabel || "Estimated revenue", value: formatNumber(revenue, 2) }],
        insight: interpretation.insight,
        recommendation: interpretation.recommendation,
        notes: [
          "This estimate does not include taxes, payout thresholds, or platform-specific deductions.",
        ],
      };
    }

    const numerator = safeNumber(a);
    const denominator = safeNumber(b);
    const multiplier = Number(config.multiplier || 100);

    if (numerator === null || denominator === null || denominator === 0) return null;

    const computed = ((numerator as number) / (denominator as number)) * multiplier;
    const interpretation = buildMetricRatioInsight(computed);

    return {
      blocks: [
        {
          label: config.resultLabel || "Result",
          value: `${formatNumber(computed, Number(config.decimals || 2))}${config.resultSuffix || ""}`,
        },
      ],
      insight: interpretation.insight,
      recommendation: interpretation.recommendation,
    };
  }, [preset, a, b, c, d, e, f, fromUnit, toUnit, datetimeA, datetimeB, timeA, timeB, config, countdownNow]);

  return (
    <section className={sectionClass()}>
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {preset === "daily-time-budget" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Total hours in day (e.g. 24)" />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder="Sleep hours" />
            <input value={c} onChange={(e) => setC(e.target.value)} className={inputClass()} placeholder="Work hours" />
            <input value={d} onChange={(e) => setD(e.target.value)} className={inputClass()} placeholder="Commute hours" />
            <input value={e} onChange={(e) => setE(e.target.value)} className={inputClass()} placeholder="Exercise hours" />
            <input value={f} onChange={(e) => setF(e.target.value)} className={inputClass()} placeholder="Other committed hours" />
          </>
        ) : preset === "datetime-difference" ? (
          <>
            <input type="datetime-local" value={datetimeA} onChange={(e) => setDatetimeA(e.target.value)} className={inputClass()} />
            <input type="datetime-local" value={datetimeB} onChange={(e) => setDatetimeB(e.target.value)} className={inputClass()} />
          </>
        ) : preset === "sleep-cycle" ? (
          <>
            <input type="time" value={timeA} onChange={(e) => setTimeA(e.target.value)} className={inputClass()} />
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Number of cycles (e.g. 5 or 6)" />
          </>
        ) : preset === "shift-hours" ? (
          <>
            <input type="time" value={timeA} onChange={(e) => setTimeA(e.target.value)} className={inputClass()} />
            <input type="time" value={timeB} onChange={(e) => setTimeB(e.target.value)} className={inputClass()} />
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Break minutes" />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder="Work days (optional for weekly total)" />
          </>
        ) : preset === "project-time-estimator" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Number of tasks" />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder="Minutes per task" />
            <input value={c} onChange={(e) => setC(e.target.value)} className={inputClass()} placeholder="Buffer percent" />
          </>
        ) : preset === "time-conversion" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Value" />
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className={inputClass()}>
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className={inputClass()}>
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </>
        ) : preset === "unix-timestamp" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Unix timestamp" />
            <input type="datetime-local" value={datetimeA} onChange={(e) => setDatetimeA(e.target.value)} className={inputClass()} />
          </>
        ) : preset === "countdown" ? (
          <>
            <input type="datetime-local" value={datetimeA} onChange={(e) => setDatetimeA(e.target.value)} className={inputClass()} />
          </>
        ) : preset === "pomodoro" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Focus minutes" />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder="Short break minutes" />
            <input value={c} onChange={(e) => setC(e.target.value)} className={inputClass()} placeholder="Sessions" />
          </>
        ) : preset === "timezone-difference" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="UTC offset A (e.g. 5.5)" />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder="UTC offset B (e.g. -4)" />
          </>
        ) : preset === "api-rate-limit" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Allowed requests" />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder="Window seconds" />
          </>
        ) : preset === "cost-estimator" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder={String(config.quantityLabel || "Quantity")} />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder={String(config.unitCostLabel || "Unit value")} />
            <input value={c} onChange={(e) => setC(e.target.value)} className={inputClass()} placeholder={String(config.overheadLabel || "Adjustment %")} />
          </>
        ) : preset === "rate-estimator" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder={String(config.numeratorLabel || "Units")} />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder={String(config.periodLabel || "Period")} />
          </>
        ) : preset === "revenue-estimator" ? (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder={String(config.viewsLabel || "Views")} />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder={String(config.rpmLabel || "RPM")} />
          </>
        ) : (
          <>
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder={String(config.numeratorLabel || "Value A")} />
            <input value={b} onChange={(e) => setB(e.target.value)} className={inputClass()} placeholder={String(config.denominatorLabel || "Value B")} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(result?.blocks || []).map((block) => (
          <div key={block.label} className={panelClass()}>
            <div className="text-sm text-q-muted">{block.label}</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{block.value}</div>
          </div>
        ))}

        {!result ? (
          <div className={panelClass()}>
            <div className="text-sm text-q-muted">Result</div>
            <div className="mt-2 text-lg font-semibold text-q-text">Enter values to calculate</div>
          </div>
        ) : null}
      </div>

      {result?.insight ? (
        <div className={`mt-6 ${infoBoxClass()}`}>
          <div className="font-medium text-slate-800">What this means</div>
          <div className="mt-1">{result.insight}</div>
        </div>
      ) : null}

      {result?.recommendation ? (
        <div className={`mt-4 ${recommendationBoxClass()}`}>
          <div className="font-medium">Recommendation</div>
          <div className="mt-1">{result.recommendation}</div>
        </div>
      ) : null}

      {result?.notes && result.notes.length > 0 ? (
        <div className={`mt-4 ${notesBoxClass()}`}>
          <div className="font-medium text-q-text">Notes</div>
          <ul className="mt-2 grid gap-1">
            {result.notes.map((note, index) => (
              <li key={`${note}-${index}`}>• {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}