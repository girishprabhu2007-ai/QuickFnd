type CalculatorRuntimeInput = {
  name?: string;
  slug?: string;
  description?: string;
};

export type CalculatorRuntime = {
  engine_type: string | null;
  engine_config: Record<string, unknown>;
  is_supported: boolean;
  reason: string;
};

function safeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function hasAny(slug: string, parts: string[]) {
  return parts.some((part) => slug.includes(part));
}

function hasAll(slug: string, parts: string[]) {
  return parts.every((part) => slug.includes(part));
}

function formulaPreset(
  preset: string,
  title: string,
  extra: Record<string, unknown> = {}
): CalculatorRuntime {
  return {
    engine_type: "formula-calculator",
    engine_config: {
      preset,
      titleOverride: title,
      ...extra,
    },
    is_supported: true,
    reason: `Matched calculator preset "${preset}".`,
  };
}

function textContainsAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

export function resolveCalculatorRuntime(input: CalculatorRuntimeInput): CalculatorRuntime {
  const slug = safeSlug(input.slug || input.name || "");
  const name = String(input.name || "").trim();
  const description = String(input.description || "").toLowerCase();
  const fullText = `${slug} ${name.toLowerCase()} ${description}`.trim();

  if (!slug) {
    return {
      engine_type: null,
      engine_config: {},
      is_supported: false,
      reason: "Missing calculator slug.",
    };
  }

  if (slug.includes("age")) {
    return {
      engine_type: "age-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "age-calculator".',
    };
  }

  if (slug.includes("bmi") || slug.includes("body-mass-index")) {
    return {
      engine_type: "bmi-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "bmi-calculator".',
    };
  }

  if (slug.includes("loan") && slug.includes("emi")) {
    return {
      engine_type: "emi-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "emi-calculator".',
    };
  }

  if (slug.includes("loan")) {
    return {
      engine_type: "loan-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "loan-calculator".',
    };
  }

  if (slug.includes("percentage")) {
    return {
      engine_type: "percentage-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "percentage-calculator".',
    };
  }

  if (slug.includes("simple-interest") || slug === "interest-calculator") {
    return {
      engine_type: "simple-interest-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "simple-interest-calculator".',
    };
  }

  if (slug.includes("gst")) {
    return {
      engine_type: "gst-calculator",
      engine_config: {},
      is_supported: true,
      reason: 'Matched existing calculator engine "gst-calculator".',
    };
  }

  if (slug.includes("sip") || (slug.includes("systematic") && slug.includes("investment"))) {
    return { engine_type: "sip-calculator", engine_config: {}, is_supported: true, reason: 'Matched sip-calculator.' };
  }

  if (slug.includes("fixed-deposit") || slug === "fd-calculator" || (slug.includes("fd") && slug.includes("calculator"))) {
    return { engine_type: "fd-calculator", engine_config: {}, is_supported: true, reason: 'Matched fd-calculator.' };
  }

  if (slug.includes("ppf") || slug.includes("public-provident")) {
    return { engine_type: "ppf-calculator", engine_config: {}, is_supported: true, reason: 'Matched ppf-calculator.' };
  }

  if (slug.includes("hra") || slug.includes("house-rent-allowance")) {
    return { engine_type: "hra-calculator", engine_config: {}, is_supported: true, reason: 'Matched hra-calculator.' };
  }

  if (slug.includes("income-tax") || slug.includes("tax-calculator") || slug.includes("itr-calculator")) {
    return { engine_type: "income-tax-calculator", engine_config: {}, is_supported: true, reason: 'Matched income-tax-calculator.' };
  }

  if (slug.includes("compound-interest") || (slug.includes("compound") && slug.includes("interest"))) {
    return { engine_type: "compound-interest-calculator", engine_config: {}, is_supported: true, reason: 'Matched compound-interest-calculator.' };
  }

  if (hasAny(slug, ["event-duration", "elapsed-time"])) {
    return formulaPreset("datetime-difference", name || "Event Duration Calculator");
  }

  if (slug.includes("daily-time-budget")) {
    return formulaPreset("daily-time-budget", name || "Daily Time Budget Calculator");
  }

  if (slug.includes("sleep-cycle")) {
    return formulaPreset("sleep-cycle", name || "Sleep Cycle Calculator");
  }

  if (slug.includes("shift-scheduler")) {
    return formulaPreset("shift-hours", name || "Shift Scheduler Calculator");
  }

  if (slug.includes("project-time-estimator")) {
    return formulaPreset(
      "project-time-estimator",
      name || "Project Time Estimator Calculator"
    );
  }

  if (slug.includes("time-conversion")) {
    return formulaPreset("time-conversion", name || "Time Conversion Calculator");
  }

  if (slug.includes("unix-timestamp")) {
    return formulaPreset("unix-timestamp", name || "Unix Timestamp Converter");
  }

  if (slug.includes("countdown")) {
    return formulaPreset("countdown", name || "Countdown Timer Calculator");
  }

  if (slug.includes("pomodoro")) {
    return formulaPreset("pomodoro", name || "Pomodoro Timer Calculator");
  }

  if (slug.includes("work-hours")) {
    return formulaPreset("shift-hours", name || "Work Hours Calculator");
  }

  if (slug.includes("time-zone-difference") || slug.includes("timezone-difference")) {
    return formulaPreset("timezone-difference", name || "Time Zone Difference Calculator");
  }

  if (slug.includes("work-life-balance")) {
    return formulaPreset("daily-time-budget", name || "Work-Life Balance Calculator", {
      titleOverride: name || "Work-Life Balance Calculator",
      fields: [
        {
          key: "total_hours",
          label: "Total hours available in a day",
          placeholder: "24",
        },
        {
          key: "sleep_hours",
          label: "Sleep hours",
          placeholder: "8",
        },
        {
          key: "work_hours",
          label: "Work hours",
          placeholder: "8",
        },
        {
          key: "commute_hours",
          label: "Commute / transition hours",
          placeholder: "1",
        },
        {
          key: "exercise_hours",
          label: "Exercise / health hours",
          placeholder: "1",
        },
        {
          key: "other_hours",
          label: "Family / chores / other commitments",
          placeholder: "3",
        },
      ],
      resultLabel: "Balance score",
    });
  }

  if (slug.includes("merge-conflict") && slug.includes("probability")) {
    return formulaPreset("probability", name || "Merge Conflict Probability Calculator", {
      numeratorLabel: "Conflicting changes",
      denominatorLabel: "Total changed files",
      resultLabel: "Conflict probability",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (slug.includes("seo-strength")) {
    return formulaPreset("metric-ratio", name || "SEO Strength Calculator", {
      numeratorLabel: "SEO score",
      denominatorLabel: "Maximum possible score",
      resultLabel: "SEO strength",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (slug.includes("api-rate-limit")) {
    return formulaPreset("api-rate-limit", name || "API Rate Limit Calculator");
  }

  if (slug.includes("function-performance-cost")) {
    return formulaPreset(
      "cost-estimator",
      name || "Function Performance Cost Calculator",
      {
        quantityLabel: "Function calls",
        unitCostLabel: "Cost per call",
        overheadLabel: "Overhead %",
        resultLabel: "Estimated total cost",
        decimals: 4,
      }
    );
  }

  if (slug.includes("code-review-efficiency")) {
    return formulaPreset("metric-ratio", name || "Code Review Efficiency Calculator", {
      numeratorLabel: "Merged pull requests",
      denominatorLabel: "Reviewed pull requests",
      resultLabel: "Review efficiency",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (slug.includes("bug-fix-rate")) {
    return formulaPreset("rate-estimator", name || "Bug Fix Rate Calculator", {
      numeratorLabel: "Bugs fixed",
      periodLabel: "Days",
      resultLabel: "Bug fixes per day",
      decimals: 2,
    });
  }

  if (slug.includes("deployment-frequency")) {
    return formulaPreset("rate-estimator", name || "Deployment Frequency Calculator", {
      numeratorLabel: "Deployments",
      periodLabel: "Days",
      resultLabel: "Deployments per day",
      decimals: 2,
    });
  }

  if (slug.includes("ci-build-time")) {
    return formulaPreset("metric-ratio", name || "CI Build Time Calculator", {
      numeratorLabel: "Total build minutes",
      denominatorLabel: "Build runs",
      resultLabel: "Average build time",
      resultSuffix: " minutes",
      multiplier: 1,
      decimals: 2,
    });
  }

  if (slug.includes("youtube") && slug.includes("rpm")) {
    return formulaPreset("revenue-estimator", name || "YouTube RPM Calculator", {
      viewsLabel: "Views",
      rpmLabel: "RPM",
      resultLabel: "Estimated revenue",
      decimals: 2,
    });
  }

  if (slug.includes("youtube") && slug.includes("growth-rate")) {
    return formulaPreset("metric-ratio", name || "YouTube Growth Rate Calculator", {
      numeratorLabel: "Growth amount",
      denominatorLabel: "Starting value",
      resultLabel: "Growth rate",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (
    slug.includes("youtube") &&
    (slug.includes("revenue-estimator") || slug.includes("revenue"))
  ) {
    return formulaPreset("revenue-estimator", name || "YouTube Revenue Estimator", {
      viewsLabel: "Views",
      rpmLabel: "RPM",
      resultLabel: "Estimated revenue",
      decimals: 2,
    });
  }

  if (slug.includes("youtube") && slug.includes("ad-revenue-share")) {
    return formulaPreset("metric-ratio", name || "YouTube Ad Revenue Share Calculator", {
      numeratorLabel: "Creator revenue",
      denominatorLabel: "Total ad revenue",
      resultLabel: "Revenue share",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (slug.includes("youtube") && slug.includes("thumbnail-click-through-rate")) {
    return formulaPreset(
      "metric-ratio",
      name || "YouTube Thumbnail CTR Calculator",
      {
        numeratorLabel: "Clicks",
        denominatorLabel: "Impressions",
        resultLabel: "Click-through rate",
        resultSuffix: "%",
        multiplier: 100,
        decimals: 2,
      }
    );
  }

  if (slug.includes("youtube") && slug.includes("video-length-optimization")) {
    return formulaPreset(
      "metric-ratio",
      name || "Video Length Optimization Calculator",
      {
        numeratorLabel: "Watch minutes",
        denominatorLabel: "Video length minutes",
        resultLabel: "Retention multiple",
        resultSuffix: "x",
        multiplier: 1,
        decimals: 2,
      }
    );
  }

  if (slug.includes("audience-demographics")) {
    return formulaPreset("metric-ratio", name || "Audience Demographics Analyzer", {
      numeratorLabel: "Audience segment size",
      denominatorLabel: "Total audience size",
      resultLabel: "Audience segment share",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (slug.includes("hashtag-impact")) {
    return formulaPreset("metric-ratio", name || "YouTube Hashtag Impact Calculator", {
      numeratorLabel: "Hashtag-attributed views",
      denominatorLabel: "Total views",
      resultLabel: "Hashtag impact",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (
    hasAny(fullText, ["probability", "chance", "likelihood"]) &&
    !textContainsAny(fullText, ["sleep", "balance", "timestamp"])
  ) {
    return formulaPreset("probability", name || "Probability Calculator", {
      numeratorLabel: "Favorable outcomes",
      denominatorLabel: "Total outcomes",
      resultLabel: "Probability",
      resultSuffix: "%",
      multiplier: 100,
      decimals: 2,
    });
  }

  if (
    hasAny(fullText, ["rate", "frequency", "growth"]) &&
    !textContainsAny(fullText, ["heart rate", "sleep"])
  ) {
    return formulaPreset("rate-estimator", name || "Rate Calculator", {
      numeratorLabel: "Units",
      periodLabel: "Period",
      resultLabel: "Rate",
      decimals: 2,
    });
  }

  if (
    hasAny(fullText, ["cost", "budget", "revenue", "estimator", "share"]) &&
    !textContainsAny(fullText, ["balance", "sleep"])
  ) {
    return formulaPreset("cost-estimator", name || "Estimator Calculator", {
      quantityLabel: "Quantity",
      unitCostLabel: "Value per unit",
      overheadLabel: "Adjustment %",
      resultLabel: "Estimated result",
      decimals: 2,
    });
  }

  if (
    hasAll(slug, ["time", "calculator"]) ||
    (hasAny(fullText, ["time"]) &&
      !textContainsAny(fullText, ["sleep", "timestamp", "duration", "countdown", "shift"]))
  ) {
    return formulaPreset("time-conversion", name || "Time Calculator");
  }

  return {
    engine_type: "generic-directory",
    engine_config: {},
    is_supported: false,
    reason: "No strong calculator engine match found yet.",
  };
}