type TaxonomyEntry = {
  key: string;
  label: string;
  match: (slug: string, name: string) => boolean;
};

const TOOL_GROUPS: TaxonomyEntry[] = [
  {
    key: "developer-tools",
    label: "Developer Tools",
    match: (slug, name) =>
      /json|code|debug|base64|url|uuid|slug|formatter|snippet/i.test(`${slug} ${name}`),
  },
  {
    key: "text-content",
    label: "Text & Content",
    match: (slug, name) =>
      /text|word|blog|content|title|headline|transform|writer/i.test(`${slug} ${name}`),
  },
  {
    key: "generators",
    label: "Generators",
    match: (slug, name) =>
      /generator|random|password/i.test(`${slug} ${name}`),
  },
  {
    key: "conversion-tools",
    label: "Conversion Tools",
    match: (slug, name) =>
      /convert|converter|unit|currency/i.test(`${slug} ${name}`),
  },
];

const CALCULATOR_GROUPS: TaxonomyEntry[] = [
  {
    key: "finance-calculators",
    label: "Finance Calculators",
    match: (slug, name) =>
      /loan|emi|interest|gst|profit|margin|tax/i.test(`${slug} ${name}`),
  },
  {
    key: "math-calculators",
    label: "Math Calculators",
    match: (slug, name) =>
      /percentage|age/i.test(`${slug} ${name}`),
  },
  {
    key: "health-calculators",
    label: "Health Calculators",
    match: (slug, name) =>
      /bmi|health/i.test(`${slug} ${name}`),
  },
];

const AI_GROUPS: TaxonomyEntry[] = [
  {
    key: "writing-ai",
    label: "Writing AI",
    match: (slug, name) =>
      /writer|email|blog|content|summary|rewrite/i.test(`${slug} ${name}`),
  },
  {
    key: "prompt-ai",
    label: "Prompt AI",
    match: (slug, name) =>
      /prompt/i.test(`${slug} ${name}`),
  },
  {
    key: "workspace-ai",
    label: "Workspace AI",
    match: (slug, name) =>
      /notion|meeting|notes|task|workflow/i.test(`${slug} ${name}`),
  },
];

type TaxonomyGroup<T extends { slug: string; name: string }> = {
  key: string;
  label: string;
  count: number;
  items: T[];
};

function bucketItems<T extends { slug: string; name: string }>(
  items: T[],
  groups: TaxonomyEntry[],
  fallbackKey: string,
  fallbackLabel: string
): TaxonomyGroup<T>[] {
  const buckets = new Map<string, { key: string; label: string; items: T[] }>();

  for (const item of items) {
    const group =
      groups.find((entry) => entry.match(item.slug, item.name)) || {
        key: fallbackKey,
        label: fallbackLabel,
      };

    const current = buckets.get(group.key) || {
      key: group.key,
      label: group.label,
      items: [] as T[],
    };

    current.items.push(item);
    buckets.set(group.key, current);
  }

  return Array.from(buckets.values())
    .map((group) => ({
      key: group.key,
      label: group.label,
      count: group.items.length,
      items: group.items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.count - a.count);
}

export function buildHomepageTaxonomy<TTool extends { slug: string; name: string }, TCalc extends { slug: string; name: string }, TAi extends { slug: string; name: string }>(input: {
  tools: TTool[];
  calculators: TCalc[];
  aiTools: TAi[];
}) {
  return {
    tools: bucketItems(input.tools, TOOL_GROUPS, "other-tools", "Other Tools"),
    calculators: bucketItems(
      input.calculators,
      CALCULATOR_GROUPS,
      "other-calculators",
      "Other Calculators"
    ),
    aiTools: bucketItems(input.aiTools, AI_GROUPS, "other-ai-tools", "Other AI Tools"),
  };
}

export function filterItemsByGroup<T extends { slug: string; name: string }>(
  type: "tools" | "calculators" | "aiTools",
  items: T[],
  groupKey?: string
): T[] {
  if (!groupKey) return items;

  if (type === "tools") {
    const groups = bucketItems(items, TOOL_GROUPS, "other-tools", "Other Tools");
    return groups.find((group) => group.key === groupKey)?.items || [];
  }

  if (type === "calculators") {
    const groups = bucketItems(
      items,
      CALCULATOR_GROUPS,
      "other-calculators",
      "Other Calculators"
    );
    return groups.find((group) => group.key === groupKey)?.items || [];
  }

  const groups = bucketItems(items, AI_GROUPS, "other-ai-tools", "Other AI Tools");
  return groups.find((group) => group.key === groupKey)?.items || [];
}