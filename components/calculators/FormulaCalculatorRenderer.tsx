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

  const result = useMemo(() => {
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

      return {
        blocks: [
          { label: "Allocated hours", value: formatNumber(allocated, 2) },
          { label: "Free hours", value: formatNumber(free, 2) },
          {
            label: "Status",
            value: free >= 0 ? "Within daily budget" : "Over allocated",
          },
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
      };
    }

    if (preset === "sleep-cycle") {
      const bedtimeMinutes = timeToMinutes(timeA);
      const cycles = safeNumber(a);

      if (bedtimeMinutes === null || cycles === null) return null;

      const wakeMinutes = bedtimeMinutes + (cycles as number) * 90 + 15;

      return {
        blocks: [
          { label: "Suggested wake-up time", value: minutesToClock(wakeMinutes) },
          {
            label: "Estimated sleep duration",
            value: `${formatNumber((cycles as number) * 1.5, 1)} hours`,
          },
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
        blocks: [{ label: "Converted value", value: formatNumber(converted, 4) }],
      };
    }

    if (preset === "unix-timestamp") {
      const timestamp = safeNumber(a);

      if (timestamp !== null) {
        const date = new Date((timestamp as number) * 1000);
        if (!Number.isNaN(date.getTime())) {
          return {
            blocks: [{ label: "UTC date", value: date.toISOString() }],
          };
        }
      }

      if (datetimeA) {
        const ms = new Date(datetimeA).getTime();
        if (!Number.isNaN(ms)) {
          return {
            blocks: [{ label: "Unix timestamp", value: String(Math.floor(ms / 1000)) }],
          };
        }
      }

      return null;
    }

    if (preset === "countdown") {
      if (!datetimeA) return null;
      const future = new Date(datetimeA).getTime();
      const now = Date.now();

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
      };
    }

    if (preset === "timezone-difference") {
      const offsetA = safeNumber(a);
      const offsetB = safeNumber(b);

      if (offsetA === null || offsetB === null) return null;

      const diff = Math.abs((offsetA as number) - (offsetB as number));

      return {
        blocks: [{ label: "Time difference", value: `${formatNumber(diff, 2)} hours` }],
      };
    }

    if (preset === "probability") {
      const favorable = safeNumber(a);
      const total = safeNumber(b);

      if (favorable === null || total === null || total === 0) return null;

      const percentage = ((favorable as number) / (total as number)) * 100;

      return {
        blocks: [
          { label: config.resultLabel || "Probability", value: `${formatNumber(percentage, 2)}%` },
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
      };
    }

    if (preset === "rate-estimator") {
      const numerator = safeNumber(a);
      const period = safeNumber(b);

      if (numerator === null || period === null || period === 0) return null;

      const rate = (numerator as number) / (period as number);

      return {
        blocks: [{ label: config.resultLabel || "Rate", value: formatNumber(rate, 2) }],
      };
    }

    if (preset === "revenue-estimator") {
      const views = safeNumber(a);
      const rpm = safeNumber(b);

      if (views === null || rpm === null) return null;

      const revenue = ((views as number) / 1000) * (rpm as number);

      return {
        blocks: [{ label: config.resultLabel || "Estimated revenue", value: formatNumber(revenue, 2) }],
      };
    }

    const numerator = safeNumber(a);
    const denominator = safeNumber(b);
    const multiplier = Number(config.multiplier || 100);

    if (numerator === null || denominator === null || denominator === 0) return null;

    const computed = ((numerator as number) / (denominator as number)) * multiplier;

    return {
      blocks: [
        {
          label: config.resultLabel || "Result",
          value: `${formatNumber(computed, Number(config.decimals || 2))}${config.resultSuffix || ""}`,
        },
      ],
    };
  }, [preset, a, b, c, d, e, f, fromUnit, toUnit, datetimeA, datetimeB, timeA, timeB, config]);

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
            <input value={a} onChange={(e) => setA(e.target.value)} className={inputClass()} placeholder="Number of cycles (e.g. 6)" />
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
    </section>
  );
}