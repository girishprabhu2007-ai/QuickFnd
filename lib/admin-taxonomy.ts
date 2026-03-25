type TaxonomyEntry = {
  key: string;
  label: string;
  include: RegExp[];
  exclude?: RegExp[];
  minScore?: number;
};

export type TaxonomyGroup<
  T extends { slug: string; name: string; description?: string | null }
> = {
  key: string;
  label: string;
  count: number;
  items: T[];
};

function textBlob(item: {
  slug: string;
  name: string;
  description?: string | null;
}) {
  return `${item.slug} ${item.name} ${item.description || ""}`.toLowerCase();
}

function scoreEntry(
  entry: TaxonomyEntry,
  item: { slug: string; name: string; description?: string | null }
) {
  const text = textBlob(item);

  if (entry.exclude && entry.exclude.some((pattern) => pattern.test(text))) {
    return -999;
  }

  let score = 0;

  for (const pattern of entry.include) {
    if (pattern.test(text)) {
      score += 1;
    }
  }

  return score;
}

function pickGroup(
  item: { slug: string; name: string; description?: string | null },
  groups: TaxonomyEntry[],
  fallbackKey: string,
  fallbackLabel: string
) {
  let bestGroup: TaxonomyEntry | null = null;
  let bestScore = 0;

  for (const entry of groups) {
    const score = scoreEntry(entry, item);

    if (score > bestScore) {
      bestScore = score;
      bestGroup = entry;
    }
  }

  if (!bestGroup) {
    return { key: fallbackKey, label: fallbackLabel };
  }

  const minScore = bestGroup.minScore ?? 1;

  if (bestScore < minScore) {
    return { key: fallbackKey, label: fallbackLabel };
  }

  return { key: bestGroup.key, label: bestGroup.label };
}

function bucketItems<
  T extends { slug: string; name: string; description?: string | null }
>(
  items: T[],
  groups: TaxonomyEntry[],
  fallbackKey: string,
  fallbackLabel: string
): TaxonomyGroup<T>[] {
  const buckets = new Map<string, { key: string; label: string; items: T[] }>();

  for (const item of items) {
    const group = pickGroup(item, groups, fallbackKey, fallbackLabel);

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

// ─── TOOL GROUPS ──────────────────────────────────────────────────────────────
// Order matters: more specific groups are matched first.

const TOOL_GROUPS: TaxonomyEntry[] = [
  {
    key: "developer-tools",
    label: "Developer Tools",
    include: [
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
      /\bsyntax\b/i,
      /\bdeveloper\b/i,
      /\bjwt\b/i,
      /\bdiff\b/i,
      /\bhtml\b/i,
      /\bcss\b/i,
      /\bminif\b/i,
    ],
    minScore: 1,
  },
  {
    key: "encoders-converters",
    label: "Encoders & Converters",
    include: [
      /\bbase64\b/i,
      /\burl\b/i,
      /\bencode\b/i,
      /\bdecode\b/i,
      /\bhex\b/i,
      /\brgb\b/i,
      /\bbinary\b/i,
      /\bconvert\b/i,
      /\bconverter\b/i,
      /\bunit\b/i,
      /\bcurrency\b/i,
    ],
    minScore: 1,
  },
  {
    key: "text-writing-tools",
    label: "Text & Writing",
    include: [
      /\btext\b/i,
      /\bword\b/i,
      /\bcase\b/i,
      /\bwriting\b/i,
      /\bwriter\b/i,
      /\bcontent\b/i,
      /\bblog\b/i,
      /\bparagraph\b/i,
      /\bslug\b/i,
      /\brewrite\b/i,
      /\btransform\b/i,
      /\bdiff\b/i,
      /\bmarkdown\b/i,
      /\blorem\b/i,
      /\blines?\b/i,
    ],
    exclude: [/\byoutube\b/i, /\bvideo\b/i],
    minScore: 1,
  },
  {
    key: "seo-marketing-tools",
    label: "SEO & Marketing",
    include: [
      /\bseo\b/i,
      /\bmeta\b/i,
      /\bkeyword\b/i,
      /\bserp\b/i,
      /\bheadline\b/i,
      /\butm\b/i,
      /\brank\b/i,
      /\bmarketing\b/i,
      /\brobots\b/i,
      /\bopen.graph\b/i,
      /\bog.tag\b/i,
    ],
    exclude: [/\byoutube\b/i, /\bvideo\b/i, /\bthumbnail\b/i],
    minScore: 1,
  },
  {
    key: "youtube-video-tools",
    label: "YouTube & Video",
    include: [
      /\byoutube\b/i,
      /\bvideo\b/i,
      /\bthumbnail\b/i,
      /\bplaylist\b/i,
      /\bchannel\b/i,
      /\bshorts\b/i,
      /\bcaption\b/i,
    ],
    exclude: [/\btwitter\b/i, /\binstagram\b/i, /\btiktok\b/i],
    minScore: 1,
  },
  {
    key: "security-tools",
    label: "Security & Privacy",
    include: [
      /\bpassword\b/i,
      /\bsecurity\b/i,
      /\bencrypt\b/i,
      /\bhash\b/i,
      /\bprivacy\b/i,
      /\bsafe\b/i,
    ],
    minScore: 1,
  },
  {
    key: "design-tools",
    label: "Design Tools",
    include: [
      /\bcolor\b/i,
      /\bcolour\b/i,
      /\bgradient\b/i,
      /\bpalette\b/i,
      /\bdesign\b/i,
      /\bcss\b/i,
      /\bshadow\b/i,
    ],
    minScore: 1,
  },
  {
    key: "generators",
    label: "Generators",
    include: [/\bgenerator\b/i, /\brandom\b/i, /\bqr\b/i],
    exclude: [/\bpassword\b/i],
    minScore: 1,
  },
  {
    key: "network-tools",
    label: "Network & Web",
    include: [
      /\bip\b/i,
      /\bdns\b/i,
      /\bssl\b/i,
      /\bnetwork\b/i,
      /\blookup\b/i,
      /\bping\b/i,
      /\bemail\b/i,
      /\bvalidat\b/i,
    ],
    minScore: 1,
  },
];

// ─── CALCULATOR GROUPS ────────────────────────────────────────────────────────
// FIXED: "Other Calculators" → proper named groups
// ADDED: Investment, Tax, Utility groups

const CALCULATOR_GROUPS: TaxonomyEntry[] = [
  {
    key: "finance-calculators",
    label: "Finance Calculators",
    include: [
      /\bloan\b/i,
      /\bemi\b/i,
      /\binterest\b/i,
      /\bprofit\b/i,
      /\bpayment\b/i,
      /\bfinance\b/i,
      /\bdiscount\b/i,
      /\bsimple.interest\b/i,
      /\bcompound\b/i,
    ],
    minScore: 1,
  },
  {
    key: "investment-calculators",
    label: "Investment Calculators",
    include: [
      /\bsip\b/i,
      /\bfixed.deposit\b/i,
      /\bfd\b/i,
      /\bppf\b/i,
      /\bretirement\b/i,
      /\binvest\b/i,
      /\bsavings\b/i,
      /\bprovident\b/i,
      /\bportfolio\b/i,
    ],
    minScore: 1,
  },
  {
    key: "tax-calculators",
    label: "Tax Calculators",
    include: [
      /\bgst\b/i,
      /\btax\b/i,
      /\bhra\b/i,
      /\bincome.tax\b/i,
      /\bvat\b/i,
      /\bexemption\b/i,
      /\bdeduction\b/i,
    ],
    minScore: 1,
  },
  {
    key: "health-calculators",
    label: "Health Calculators",
    include: [
      /\bbmi\b/i,
      /\bhealth\b/i,
      /\bweight\b/i,
      /\bcalorie\b/i,
      /\bsleep\b/i,
      /\bfitness\b/i,
      /\bideal.weight\b/i,
    ],
    minScore: 1,
  },
  {
    key: "math-calculators",
    label: "Math Calculators",
    include: [
      /\bpercentage\b/i,
      /\bmath\b/i,
      /\bnumber\b/i,
      /\baverage\b/i,
      /\bratio\b/i,
      /\bfraction\b/i,
      /\bprobability\b/i,
      /\btip\b/i,
      /\bmargin\b/i,
    ],
    minScore: 1,
  },
  {
    key: "date-time-calculators",
    label: "Date & Time Calculators",
    include: [
      /\bage\b/i,
      /\bdate\b/i,
      /\btime\b/i,
      /\bdays?\b/i,
      /\bduration\b/i,
      /\bschedule\b/i,
      /\bshift\b/i,
      /\bcountdown\b/i,
      /\bpomodoro\b/i,
    ],
    minScore: 1,
  },
  {
    key: "utility-calculators",
    label: "Utility Calculators",
    include: [
      /\bfuel\b/i,
      /\btrip\b/i,
      /\bcost\b/i,
      /\bestimate\b/i,
      /\bunit\b/i,
      /\brate\b/i,
    ],
    minScore: 1,
  },
];

// ─── AI TOOL GROUPS ───────────────────────────────────────────────────────────
// ADDED: Resume AI, Social AI groups

const AI_GROUPS: TaxonomyEntry[] = [
  {
    key: "writing-ai",
    label: "Writing AI",
    include: [
      /\bwriter\b/i,
      /\bemail\b/i,
      /\brewrite\b/i,
      /\bsummary\b/i,
      /\boutline\b/i,
      /\bwriting\b/i,
      /\bgrammar\b/i,
      /\bparaphras\b/i,
      /\bcover.letter\b/i,
      /\bresume\b/i,
      /\bmeeting\b/i,
      /\bnotes\b/i,
    ],
    minScore: 1,
  },
  {
    key: "content-ai",
    label: "Content AI",
    include: [
      /\bblog\b/i,
      /\bcontent\b/i,
      /\bpost\b/i,
      /\bcaption\b/i,
      /\bdescription\b/i,
      /\bheadline\b/i,
      /\btitle\b/i,
      /\bmeta\b/i,
      /\bproduct\b/i,
      /\byoutube\b/i,
    ],
    minScore: 1,
  },
  {
    key: "social-ai",
    label: "Social Media AI",
    include: [
      /\btweet\b/i,
      /\btwitter\b/i,
      /\blinkedin\b/i,
      /\binstagram\b/i,
      /\bsocial\b/i,
      /\bbio\b/i,
    ],
    minScore: 1,
  },
  {
    key: "prompt-ai",
    label: "Prompt AI",
    include: [
      /\bprompt\b/i,
      /\bmidjourney\b/i,
      /\bchatgpt\b/i,
    ],
    minScore: 1,
  },
];

export function buildHomepageTaxonomy<
  TTool extends { slug: string; name: string; description?: string | null },
  TCalc extends { slug: string; name: string; description?: string | null },
  TAi extends { slug: string; name: string; description?: string | null }
>(input: {
  tools: TTool[];
  calculators: TCalc[];
  aiTools: TAi[];
}) {
  return {
    tools: bucketItems(input.tools, TOOL_GROUPS, "utility-tools", "Utility Tools"),
    calculators: bucketItems(
      input.calculators,
      CALCULATOR_GROUPS,
      "general-calculators",
      "General Calculators"
    ),
    aiTools: bucketItems(
      input.aiTools,
      AI_GROUPS,
      "other-ai-tools",
      "Other AI Tools"
    ),
  };
}

export function filterItemsByGroup<
  T extends { slug: string; name: string; description?: string | null }
>(
  type: "tools" | "calculators" | "aiTools",
  items: T[],
  groupKey?: string
): T[] {
  if (!groupKey) return items;

  if (type === "tools") {
    const groups = bucketItems(items, TOOL_GROUPS, "utility-tools", "Utility Tools");
    return groups.find((group) => group.key === groupKey)?.items || [];
  }

  if (type === "calculators") {
    const groups = bucketItems(
      items,
      CALCULATOR_GROUPS,
      "general-calculators",
      "General Calculators"
    );
    return groups.find((group) => group.key === groupKey)?.items || [];
  }

  const groups = bucketItems(items, AI_GROUPS, "other-ai-tools", "Other AI Tools");
  return groups.find((group) => group.key === groupKey)?.items || [];
}