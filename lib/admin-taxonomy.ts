type TaxonomyEntry = {
  key: string;
  label: string;
  patterns: RegExp[];
};

type TaxonomyGroup<T extends { slug: string; name: string }> = {
  key: string;
  label: string;
  count: number;
  items: T[];
};

const TOOL_GROUPS: TaxonomyEntry[] = [
  {
    key: "youtube-video-tools",
    label: "YouTube & Video",
    patterns: [
      /\byoutube\b/i,
      /\bvideo\b/i,
      /\bthumbnail\b/i,
      /\bchannel\b/i,
      /\btag\b/i,
      /\bhashtag\b/i,
      /\bdescription\b/i,
    ],
  },
  {
    key: "seo-marketing-tools",
    label: "SEO & Marketing",
    patterns: [
      /\bseo\b/i,
      /\bmeta\b/i,
      /\bkeyword\b/i,
      /\btitle\b/i,
      /\bheadline\b/i,
      /\bslug\b/i,
      /\butm\b/i,
      /\brank\b/i,
      /\bmarketing\b/i,
    ],
  },
  {
    key: "developer-tools",
    label: "Developer Tools",
    patterns: [
      /\bjson\b/i,
      /\bcode\b/i,
      /\bdebug\b/i,
      /\bregex\b/i,
      /\bhash\b/i,
      /\bsha\b/i,
      /\bmd5\b/i,
      /\buuid\b/i,
      /\bapi\b/i,
      /\bsnippet\b/i,
      /\bformatter\b/i,
      /\btimestamp\b/i,
    ],
  },
  {
    key: "encoders-converters",
    label: "Encoders & Converters",
    patterns: [
      /\bbase64\b/i,
      /\burl\b/i,
      /\bencode\b/i,
      /\bdecode\b/i,
      /\bconverter\b/i,
      /\bconvert\b/i,
      /\bhex\b/i,
      /\brgb\b/i,
      /\bbinary\b/i,
      /\bjson-escape\b/i,
      /\bjson-unescape\b/i,
    ],
  },
  {
    key: "text-writing-tools",
    label: "Text & Writing",
    patterns: [
      /\btext\b/i,
      /\bword\b/i,
      /\bcase\b/i,
      /\bwriting\b/i,
      /\bwriter\b/i,
      /\bcontent\b/i,
      /\bblog\b/i,
      /\brewrite\b/i,
      /\btransform\b/i,
    ],
  },
  {
    key: "generators",
    label: "Generators",
    patterns: [
      /\bgenerator\b/i,
      /\brandom\b/i,
      /\bpassword\b/i,
    ],
  },
];

const CALCULATOR_GROUPS: TaxonomyEntry[] = [
  {
    key: "finance-calculators",
    label: "Finance Calculators",
    patterns: [
      /\bloan\b/i,
      /\bemi\b/i,
      /\binterest\b/i,
      /\bgst\b/i,
      /\btax\b/i,
      /\bprofit\b/i,
      /\bmargin\b/i,
      /\bpayment\b/i,
    ],
  },
  {
    key: "math-calculators",
    label: "Math Calculators",
    patterns: [
      /\bpercentage\b/i,
      /\bage\b/i,
      /\bmath\b/i,
      /\brate\b/i,
    ],
  },
  {
    key: "health-calculators",
    label: "Health Calculators",
    patterns: [
      /\bbmi\b/i,
      /\bhealth\b/i,
      /\bcalorie\b/i,
      /\bweight\b/i,
    ],
  },
];

const AI_GROUPS: TaxonomyEntry[] = [
  {
    key: "content-ai",
    label: "Content AI",
    patterns: [
      /\bblog\b/i,
      /\bcontent\b/i,
      /\bpost\b/i,
      /\bdescription\b/i,
      /\bcaption\b/i,
      /\bheadline\b/i,
      /\btitle\b/i,
    ],
  },
  {
    key: "writing-ai",
    label: "Writing AI",
    patterns: [
      /\bwriter\b/i,
      /\bemail\b/i,
      /\brewrite\b/i,
      /\bsummary\b/i,
      /\boutline\b/i,
      /\bwriting\b/i,
    ],
  },
  {
    key: "prompt-ai",
    label: "Prompt AI",
    patterns: [
      /\bprompt\b/i,
      /\bmidjourney\b/i,
      /\bchatgpt\b/i,
    ],
  },
  {
    key: "video-social-ai",
    label: "Video & Social AI",
    patterns: [
      /\byoutube\b/i,
      /\bvideo\b/i,
      /\binstagram\b/i,
      /\btiktok\b/i,
      /\bthumbnail\b/i,
    ],
  },
];

function scoreEntry(
  entry: TaxonomyEntry,
  slug: string,
  name: string
) {
  const text = `${slug} ${name}`;
  let score = 0;

  for (const pattern of entry.patterns) {
    if (pattern.test(text)) {
      score += 1;
    }
  }

  return score;
}

function pickGroup(
  slug: string,
  name: string,
  groups: TaxonomyEntry[],
  fallbackKey: string,
  fallbackLabel: string
) {
  let bestGroup: TaxonomyEntry | null = null;
  let bestScore = 0;

  for (const entry of groups) {
    const score = scoreEntry(entry, slug, name);
    if (score > bestScore) {
      bestScore = score;
      bestGroup = entry;
    }
  }

  if (!bestGroup) {
    return {
      key: fallbackKey,
      label: fallbackLabel,
    };
  }

  return {
    key: bestGroup.key,
    label: bestGroup.label,
  };
}

function bucketItems<T extends { slug: string; name: string }>(
  items: T[],
  groups: TaxonomyEntry[],
  fallbackKey: string,
  fallbackLabel: string
): TaxonomyGroup<T>[] {
  const buckets = new Map<string, { key: string; label: string; items: T[] }>();

  for (const item of items) {
    const group = pickGroup(
      item.slug,
      item.name,
      groups,
      fallbackKey,
      fallbackLabel
    );

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
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
}

export function buildHomepageTaxonomy<
  TTool extends { slug: string; name: string },
  TCalc extends { slug: string; name: string },
  TAi extends { slug: string; name: string }
>(input: {
  tools: TTool[];
  calculators: TCalc[];
  aiTools: TAi[];
}) {
  return {
    tools: bucketItems(
      input.tools,
      TOOL_GROUPS,
      "other-tools",
      "Other Tools"
    ),
    calculators: bucketItems(
      input.calculators,
      CALCULATOR_GROUPS,
      "other-calculators",
      "Other Calculators"
    ),
    aiTools: bucketItems(
      input.aiTools,
      AI_GROUPS,
      "other-ai-tools",
      "Other AI Tools"
    ),
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