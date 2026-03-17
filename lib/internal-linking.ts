import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { filterVisibleTools } from "@/lib/public-tool-visibility";
import { getTopicCollections, type TopicPageData } from "@/lib/programmatic-seo";

type MinimalTool = {
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
  related_slugs?: string[] | null;
};

type MinimalCalculator = {
  name: string;
  slug: string;
  description?: string | null;
};

type MinimalAITool = {
  name: string;
  slug: string;
  description?: string | null;
};

export type InternalLinkItem = {
  name: string;
  slug: string;
  href: string;
  description: string;
};

export type TopicLinkItem = {
  key: string;
  label: string;
  href: string;
  totalCount: number;
};

function normalizeText(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function tokenize(value: string | null | undefined) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);
}

function wordSet(value: string | null | undefined) {
  return new Set(tokenize(value));
}

function overlapScore(a: Set<string>, b: Set<string>) {
  let score = 0;
  for (const word of a) {
    if (b.has(word)) score += 1;
  }
  return score;
}

function itemText(item: { name: string; slug: string; description?: string | null }) {
  return `${item.name} ${item.slug} ${item.description || ""}`;
}

function getToolTopicKey(
  slug: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
) {
  const visibleTools = filterVisibleTools(allTools);
  const topics = getTopicCollections({
    tools: visibleTools,
    calculators,
    aiTools,
  });

  const topic = topics.find((entry) =>
    entry.tools.some((tool) => tool.slug === slug)
  );

  return topic?.key || "";
}

export function getRelatedVisibleTools(
  currentTool: MinimalTool,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[],
  limit = 6
): InternalLinkItem[] {
  const visibleTools = filterVisibleTools(allTools).filter(
    (tool) => tool.slug !== currentTool.slug
  );

  const currentWords = wordSet(itemText(currentTool));
  const currentRelatedSlugs = new Set(
    Array.isArray(currentTool.related_slugs) ? currentTool.related_slugs : []
  );
  const currentEngine = normalizeText(currentTool.engine_type);
  const currentTopicKey = getToolTopicKey(
    currentTool.slug,
    allTools,
    calculators,
    aiTools
  );

  const ranked = visibleTools
    .map((tool) => {
      let score = 0;

      if (currentRelatedSlugs.has(tool.slug)) {
        score += 40;
      }

      const candidateWords = wordSet(itemText(tool));
      const sharedWordCount = overlapScore(currentWords, candidateWords);
      score += sharedWordCount * 4;

      const candidateEngine = normalizeText(tool.engine_type);
      if (currentEngine && candidateEngine && candidateEngine === currentEngine) {
        score += 18;
      }

      const candidateTopicKey = getToolTopicKey(
        tool.slug,
        allTools,
        calculators,
        aiTools
      );
      if (currentTopicKey && candidateTopicKey === currentTopicKey) {
        score += 16;
      }

      const currentSlugTokens = tokenize(currentTool.slug);
      const candidateSlugTokens = new Set(tokenize(tool.slug));
      const sharedSlugTokens = currentSlugTokens.filter((token) =>
        candidateSlugTokens.has(token)
      ).length;
      score += sharedSlugTokens * 3;

      return {
        tool,
        score,
      };
    })
    .filter((entry) => entry.score >= 10)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.tool.name.localeCompare(b.tool.name);
    })
    .slice(0, limit)
    .map((entry) => ({
      name: entry.tool.name,
      slug: entry.tool.slug,
      href: `/tools/${entry.tool.slug}`,
      description: String(entry.tool.description || ""),
    }));

  return ranked;
}

export function getToolTopicLinks(
  currentTool: MinimalTool,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicLinkItem[] {
  const visibleTools = filterVisibleTools(allTools);

  const topics = getTopicCollections({
    tools: visibleTools,
    calculators,
    aiTools,
  });

  return topics
    .filter((topic) => topic.tools.some((item) => item.slug === currentTool.slug))
    .map((topic) => ({
      key: topic.key,
      label: topic.label,
      href: `/topics/${topic.key}`,
      totalCount: topic.totalCount,
    }));
}

export function getRelatedTopics(
  currentTopicKey: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[],
  limit = 4
): TopicLinkItem[] {
  const visibleTools = filterVisibleTools(allTools);

  const topics = getTopicCollections({
    tools: visibleTools,
    calculators,
    aiTools,
  });

  const currentTopic = topics.find((topic) => topic.key === currentTopicKey);
  if (!currentTopic) return [];

  const currentWords = wordSet(
    `${currentTopic.label} ${currentTopic.tools.map((item) => item.slug).join(" ")}`
  );

  return topics
    .filter((topic) => topic.key !== currentTopicKey)
    .map((topic) => {
      const topicWords = wordSet(
        `${topic.label} ${topic.tools.map((item) => item.slug).join(" ")}`
      );

      const sharedWords = overlapScore(currentWords, topicWords);
      const sharedTools = topic.tools.filter((item) =>
        currentTopic.tools.some((currentItem) => currentItem.slug === item.slug)
      ).length;

      const labelWordsCurrent = wordSet(currentTopic.label);
      const labelWordsCandidate = wordSet(topic.label);
      const sharedLabelWords = overlapScore(labelWordsCurrent, labelWordsCandidate);

      const score = sharedWords + sharedTools * 5 + sharedLabelWords * 4;

      return {
        key: topic.key,
        label: topic.label,
        href: `/topics/${topic.key}`,
        totalCount: topic.totalCount,
        score,
      };
    })
    .filter((topic) => topic.score >= 3)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
      return a.label.localeCompare(b.label);
    })
    .slice(0, limit)
    .map(({ key, label, href, totalCount }) => ({
      key,
      label,
      href,
      totalCount,
    }));
}

export function getTopicOverviewData(input: {
  tools: MinimalTool[];
  calculators: MinimalCalculator[];
  aiTools: MinimalAITool[];
}) {
  const visibleTools = filterVisibleTools(input.tools);

  return buildHomepageTaxonomy({
    tools: visibleTools,
    calculators: input.calculators,
    aiTools: input.aiTools,
  });
}

export function getTopicByToolSlug(
  slug: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicPageData | null {
  const visibleTools = filterVisibleTools(allTools);

  const topics = getTopicCollections({
    tools: visibleTools,
    calculators,
    aiTools,
  });

  return (
    topics.find((topic) => topic.tools.some((item) => item.slug === slug)) || null
  );
}