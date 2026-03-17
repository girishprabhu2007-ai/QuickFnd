import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { filterVisibleTools } from "@/lib/public-tool-visibility";

type ContentItem = {
  name: string;
  slug: string;
  description?: string | null;
};

export type TopicContentItem = {
  name: string;
  slug: string;
  description: string;
  href: string;
  type: "tool" | "calculator" | "ai-tool";
};

export type TopicPageData = {
  key: string;
  label: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  tools: TopicContentItem[];
  calculators: TopicContentItem[];
  aiTools: TopicContentItem[];
  totalCount: number;
};

function normalizeDescription(value: string | null | undefined) {
  return String(value || "").trim();
}

function toTopicItem(
  item: ContentItem,
  type: "tool" | "calculator" | "ai-tool"
): TopicContentItem {
  const href =
    type === "tool"
      ? `/tools/${item.slug}`
      : type === "calculator"
      ? `/calculators/${item.slug}`
      : `/ai-tools/${item.slug}`;

  return {
    name: item.name,
    slug: item.slug,
    description: normalizeDescription(item.description),
    href,
    type,
  };
}

function topicIntro(label: string, count: number) {
  return `Explore ${count} live ${label.toLowerCase()} pages on QuickFnd. These grouped pages help users discover the most relevant tools, calculators, and AI utilities for this niche from one dedicated landing page.`;
}

function topicMetaDescription(label: string, count: number) {
  return `Browse ${count} live QuickFnd pages in ${label}. Discover related tools, calculators, and AI utilities in one focused category page.`;
}

export function getTopicCollections(input: {
  tools: ContentItem[];
  calculators: ContentItem[];
  aiTools: ContentItem[];
}) {
  const visibleTools = filterVisibleTools(input.tools);

  const taxonomy = buildHomepageTaxonomy({
    tools: visibleTools,
    calculators: input.calculators,
    aiTools: input.aiTools,
  });

  const topicMap = new Map<string, TopicPageData>();

  for (const group of taxonomy.tools) {
    const tools = group.items.map((item) => toTopicItem(item, "tool"));
    const calculators: TopicContentItem[] = [];
    const aiTools: TopicContentItem[] = [];

    const totalCount = tools.length + calculators.length + aiTools.length;

    topicMap.set(group.key, {
      key: group.key,
      label: group.label,
      intro: topicIntro(group.label, totalCount),
      metaTitle: `${group.label} | QuickFnd`,
      metaDescription: topicMetaDescription(group.label, totalCount),
      tools,
      calculators,
      aiTools,
      totalCount,
    });
  }

  for (const group of taxonomy.calculators) {
    const existing = topicMap.get(group.key);

    const calculators = group.items.map((item) =>
      toTopicItem(item, "calculator")
    );

    if (existing) {
      existing.calculators.push(...calculators);
      existing.totalCount =
        existing.tools.length + existing.calculators.length + existing.aiTools.length;
      existing.intro = topicIntro(existing.label, existing.totalCount);
      existing.metaDescription = topicMetaDescription(
        existing.label,
        existing.totalCount
      );
    } else {
      const totalCount = calculators.length;
      topicMap.set(group.key, {
        key: group.key,
        label: group.label,
        intro: topicIntro(group.label, totalCount),
        metaTitle: `${group.label} | QuickFnd`,
        metaDescription: topicMetaDescription(group.label, totalCount),
        tools: [],
        calculators,
        aiTools: [],
        totalCount,
      });
    }
  }

  for (const group of taxonomy.aiTools) {
    const existing = topicMap.get(group.key);

    const aiTools = group.items.map((item) => toTopicItem(item, "ai-tool"));

    if (existing) {
      existing.aiTools.push(...aiTools);
      existing.totalCount =
        existing.tools.length + existing.calculators.length + existing.aiTools.length;
      existing.intro = topicIntro(existing.label, existing.totalCount);
      existing.metaDescription = topicMetaDescription(
        existing.label,
        existing.totalCount
      );
    } else {
      const totalCount = aiTools.length;
      topicMap.set(group.key, {
        key: group.key,
        label: group.label,
        intro: topicIntro(group.label, totalCount),
        metaTitle: `${group.label} | QuickFnd`,
        metaDescription: topicMetaDescription(group.label, totalCount),
        tools: [],
        calculators: [],
        aiTools,
        totalCount,
      });
    }
  }

  return Array.from(topicMap.values()).sort((a, b) => {
    if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
    return a.label.localeCompare(b.label);
  });
}

export function getTopicBySlug(
  slug: string,
  input: {
    tools: ContentItem[];
    calculators: ContentItem[];
    aiTools: ContentItem[];
  }
) {
  const topics = getTopicCollections(input);
  return topics.find((topic) => topic.key === slug) || null;
}