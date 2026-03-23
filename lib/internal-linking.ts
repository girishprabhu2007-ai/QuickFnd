import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { filterVisibleTools } from "@/lib/visibility";
import { filterVisibleContent } from "@/lib/public-content-visibility";
import { getTopicCollections, type TopicPageData } from "@/lib/programmatic-seo";
import type { PublicContentItem } from "@/lib/content-pages";

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
  related_slugs?: string[] | null;
};

type MinimalAITool = {
  name: string;
  slug: string;
  description?: string | null;
  related_slugs?: string[] | null;
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

type ContentType = "tools" | "calculators" | "ai-tools";

type RankedEntry<T extends { slug: string }> = {
  item: T;
  score: number;
  topicKey: string;
  diversityKey: string;
};

const GENERIC_STOP_WORDS = new Set([
  "tool",
  "tools",
  "calculator",
  "calculators",
  "checker",
  "checkers",
  "generator",
  "generators",
  "online",
  "free",
  "best",
  "quick",
  "quickfnd",
  "simple",
  "easy",
  "fast",
  "advanced",
  "smart",
  "utility",
  "utilities",
  "app",
  "apps",
  "page",
  "pages",
  "using",
  "with",
  "for",
  "and",
]);

function normalizeText(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function tokenize(value: string | null | undefined) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3)
    .filter((word) => !GENERIC_STOP_WORDS.has(word));
}

function wordSet(value: string | null | undefined) {
  return new Set(tokenize(value));
}

function overlapScore(a: Set<string>, b: Set<string>) {
  let score = 0;

  for (const word of a) {
    if (b.has(word)) {
      score += 1;
    }
  }

  return score;
}

function itemText(item: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  return `${item.name} ${item.slug} ${item.description || ""}`;
}

function safeDescription(value: string | null | undefined) {
  return String(value || "").trim();
}

function toPublicContentItem<T extends { name: string; slug: string; description?: string | null }>(
  item: T
): PublicContentItem {
  return {
    name: item.name,
    slug: item.slug,
    description: safeDescription(item.description),
    related_slugs: [],
    engine_type: null,
    engine_config: {},
    created_at: null,
  };
}

function toPublicToolItem(item: MinimalTool): PublicContentItem {
  return {
    name: item.name,
    slug: item.slug,
    description: safeDescription(item.description),
    related_slugs: Array.isArray(item.related_slugs) ? item.related_slugs : [],
    engine_type: (item.engine_type ?? null) as PublicContentItem["engine_type"],
    engine_config: {},
    created_at: null,
  };
}

function getTopicItemSlugs(topic: TopicPageData) {
  const record = topic as unknown as Record<string, unknown>;
  const slugs: string[] = [];

  for (const key of ["tools", "calculators", "aiTools", "ai_tools"]) {
    const value = record[key];

    if (!Array.isArray(value)) {
      continue;
    }

    for (const entry of value) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const slug = String((entry as Record<string, unknown>).slug || "").trim();

      if (slug) {
        slugs.push(slug);
      }
    }
  }

  return slugs;
}

function getTopicContext(
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
) {
  const visibleTools = filterVisibleTools(allTools.map(toPublicToolItem));
  const visibleCalculators = filterVisibleContent(calculators.map(toPublicContentItem));
  const visibleAITools = filterVisibleContent(aiTools.map(toPublicContentItem));

  const topics = getTopicCollections({
    tools: visibleTools,
    calculators: visibleCalculators,
    aiTools: visibleAITools,
  });

  const slugToTopicKey = new Map<string, string>();

  for (const topic of topics) {
    for (const slug of getTopicItemSlugs(topic)) {
      if (!slugToTopicKey.has(slug)) {
        slugToTopicKey.set(slug, topic.key);
      }
    }
  }

  return {
    topics,
    visibleTools: visibleTools as unknown as MinimalTool[],
    visibleCalculators: visibleCalculators as unknown as MinimalCalculator[],
    visibleAITools: visibleAITools as unknown as MinimalAITool[],
    slugToTopicKey,
  };
}

function getTopicKeyForSlug(slug: string, slugToTopicKey: Map<string, string>) {
  return slugToTopicKey.get(slug) || "";
}

function buildRelatedSlugSet(item: {
  related_slugs?: string[] | null;
}) {
  return new Set(
    Array.isArray(item.related_slugs)
      ? item.related_slugs.map((slug) => String(slug || "").trim()).filter(Boolean)
      : []
  );
}

function dedupeBySlug<T extends { slug: string }>(items: T[], excludeSlugs: string[] = []) {
  const seen = new Set(excludeSlugs.map((slug) => normalizeText(slug)));
  const output: T[] = [];

  for (const item of items) {
    const key = normalizeText(item.slug);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

export function dedupeInternalLinkItems(items: InternalLinkItem[], excludeSlugs: string[] = []) {
  return dedupeBySlug(items, excludeSlugs);
}

export function dedupeTopicLinkItems(items: TopicLinkItem[]) {
  const seen = new Set<string>();
  const output: TopicLinkItem[] = [];

  for (const item of items) {
    const key = normalizeText(item.key || item.href);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

function buildInternalLinkItem(
  item: { name: string; slug: string; description?: string | null },
  basePath: ContentType
): InternalLinkItem {
  return {
    name: item.name,
    slug: item.slug,
    href: `/${basePath}/${item.slug}`,
    description: safeDescription(item.description),
  };
}

function rankCandidates<T extends { slug: string; name: string; description?: string | null }>(
  currentItem: T & { related_slugs?: string[] | null; engine_type?: string | null },
  candidates: T[],
  options: {
    basePath: ContentType;
    currentTopicKey: string;
    getTopicKey: (slug: string) => string;
    currentEngine?: string;
    getCandidateEngine?: (item: T) => string;
    limit: number;
  }
) {
  const currentWords = wordSet(itemText(currentItem));
  const currentSlugTokens = wordSet(currentItem.slug);
  const currentRelatedSlugs = buildRelatedSlugSet(currentItem);

  const ranked: RankedEntry<T>[] = candidates
    .filter((candidate) => candidate.slug !== currentItem.slug)
    .map((candidate) => {
      const candidateWords = wordSet(itemText(candidate));
      const candidateSlugTokens = wordSet(candidate.slug);
      const topicKey = options.getTopicKey(candidate.slug);
      const candidateEngine = options.getCandidateEngine
        ? options.getCandidateEngine(candidate)
        : "";

      let score = 0;

      if (currentRelatedSlugs.has(candidate.slug)) {
        score += 100;
      }

      const sharedIntentWords = overlapScore(currentWords, candidateWords);
      score += sharedIntentWords * 3;

      const sharedSlugWords = overlapScore(currentSlugTokens, candidateSlugTokens);
      score += sharedSlugWords * 2;

      if (options.currentTopicKey && topicKey === options.currentTopicKey) {
        score += 30;
      }

      if (options.currentEngine && candidateEngine && candidateEngine === options.currentEngine) {
        score += 40;
      }

      if (
        normalizeText(currentItem.name) === normalizeText(candidate.name) ||
        normalizeText(currentItem.slug) === normalizeText(candidate.slug)
      ) {
        score = -9999;
      }

      return {
        item: candidate,
        score,
        topicKey,
        diversityKey: candidateEngine || topicKey || tokenize(candidate.slug)[0] || candidate.slug,
      };
    })
    .filter((entry) => entry.score >= 20)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.item.name.localeCompare(b.item.name);
    });

  const selected: RankedEntry<T>[] = [];
  const diversityCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();
  const seenSlugs = new Set<string>();

  for (const entry of ranked) {
    const slugKey = normalizeText(entry.item.slug);

    if (seenSlugs.has(slugKey)) {
      continue;
    }

    const diversityCount = diversityCounts.get(entry.diversityKey) || 0;
    const topicCount = entry.topicKey ? topicCounts.get(entry.topicKey) || 0 : 0;

    if (diversityCount >= 1 || topicCount >= 2) {
      continue;
    }

    selected.push(entry);
    seenSlugs.add(slugKey);
    diversityCounts.set(entry.diversityKey, diversityCount + 1);

    if (entry.topicKey) {
      topicCounts.set(entry.topicKey, topicCount + 1);
    }

    if (selected.length >= options.limit) {
      break;
    }
  }

  if (selected.length < options.limit) {
    for (const entry of ranked) {
      const slugKey = normalizeText(entry.item.slug);

      if (seenSlugs.has(slugKey)) {
        continue;
      }

      selected.push(entry);
      seenSlugs.add(slugKey);

      if (selected.length >= options.limit) {
        break;
      }
    }
  }

  return selected.map((entry) => buildInternalLinkItem(entry.item, options.basePath));
}

export function getRelatedVisibleTools(
  currentTool: MinimalTool,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[],
  limit = 6
): InternalLinkItem[] {
  const context = getTopicContext(allTools, calculators, aiTools);

  const related = rankCandidates(currentTool, context.visibleTools, {
    basePath: "tools",
    currentTopicKey: getTopicKeyForSlug(currentTool.slug, context.slugToTopicKey),
    getTopicKey: (slug) => getTopicKeyForSlug(slug, context.slugToTopicKey),
    currentEngine: normalizeText(currentTool.engine_type),
    getCandidateEngine: (tool) => normalizeText(tool.engine_type),
    limit,
  });

  return dedupeInternalLinkItems(related, [currentTool.slug]);
}

export function getRelatedVisibleCalculators(
  currentCalculator: MinimalCalculator,
  allCalculators: MinimalCalculator[],
  allTools: MinimalTool[],
  aiTools: MinimalAITool[],
  limit = 6
): InternalLinkItem[] {
  const context = getTopicContext(allTools, allCalculators, aiTools);

  const related = rankCandidates(currentCalculator, context.visibleCalculators, {
    basePath: "calculators",
    currentTopicKey: getTopicKeyForSlug(currentCalculator.slug, context.slugToTopicKey),
    getTopicKey: (slug) => getTopicKeyForSlug(slug, context.slugToTopicKey),
    limit,
  });

  return dedupeInternalLinkItems(related, [currentCalculator.slug]);
}

export function getRelatedVisibleAITools(
  currentAITool: MinimalAITool,
  allAITools: MinimalAITool[],
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  limit = 6
): InternalLinkItem[] {
  const context = getTopicContext(allTools, calculators, allAITools);

  const related = rankCandidates(currentAITool, context.visibleAITools, {
    basePath: "ai-tools",
    currentTopicKey: getTopicKeyForSlug(currentAITool.slug, context.slugToTopicKey),
    getTopicKey: (slug) => getTopicKeyForSlug(slug, context.slugToTopicKey),
    limit,
  });

  return dedupeInternalLinkItems(related, [currentAITool.slug]);
}

function buildTopicLinksForSlug(
  slug: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
) {
  const context = getTopicContext(allTools, calculators, aiTools);

  return dedupeTopicLinkItems(
    context.topics
      .filter((topic) => getTopicItemSlugs(topic).includes(slug))
      .map((topic) => ({
        key: topic.key,
        label: topic.label,
        href: `/topics/${topic.key}`,
        totalCount: topic.totalCount,
      }))
  );
}

export function getToolTopicLinks(
  currentTool: MinimalTool,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicLinkItem[] {
  return buildTopicLinksForSlug(currentTool.slug, allTools, calculators, aiTools);
}

export function getCalculatorTopicLinks(
  currentCalculator: MinimalCalculator,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicLinkItem[] {
  return buildTopicLinksForSlug(currentCalculator.slug, allTools, calculators, aiTools);
}

export function getAIToolTopicLinks(
  currentAITool: MinimalAITool,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicLinkItem[] {
  return buildTopicLinksForSlug(currentAITool.slug, allTools, calculators, aiTools);
}

export function getRelatedTopics(
  currentTopicKey: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[],
  limit = 4
): TopicLinkItem[] {
  const context = getTopicContext(allTools, calculators, aiTools);
  const currentTopic = context.topics.find((topic) => topic.key === currentTopicKey);

  if (!currentTopic) {
    return [];
  }

  const currentWords = wordSet(`${currentTopic.label} ${getTopicItemSlugs(currentTopic).join(" ")}`);

  const related = context.topics
    .filter((topic) => topic.key !== currentTopicKey)
    .map((topic) => {
      const topicWords = wordSet(`${topic.label} ${getTopicItemSlugs(topic).join(" ")}`);
      const sharedWords = overlapScore(currentWords, topicWords);

      const currentSlugs = new Set(getTopicItemSlugs(currentTopic));
      const sharedItems = getTopicItemSlugs(topic).filter((slug) => currentSlugs.has(slug)).length;

      const score = sharedWords * 3 + sharedItems * 8;

      return {
        key: topic.key,
        label: topic.label,
        href: `/topics/${topic.key}`,
        totalCount: topic.totalCount,
        score,
      };
    })
    .filter((topic) => topic.score >= 4)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.totalCount !== a.totalCount) {
        return b.totalCount - a.totalCount;
      }

      return a.label.localeCompare(b.label);
    })
    .slice(0, limit)
    .map(({ key, label, href, totalCount }) => ({
      key,
      label,
      href,
      totalCount,
    }));

  return dedupeTopicLinkItems(related);
}

export function getTopicOverviewData(input: {
  tools: MinimalTool[];
  calculators: MinimalCalculator[];
  aiTools: MinimalAITool[];
}) {
  const visibleTools = filterVisibleTools(input.tools.map(toPublicToolItem));

  return buildHomepageTaxonomy({
    tools: visibleTools,
    calculators: filterVisibleContent(input.calculators.map(toPublicContentItem)),
    aiTools: filterVisibleContent(input.aiTools.map(toPublicContentItem)),
  });
}

export function getTopicBySlug(
  slug: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicPageData | null {
  const context = getTopicContext(allTools, calculators, aiTools);

  return context.topics.find((topic) => getTopicItemSlugs(topic).includes(slug)) || null;
}

export function getTopicByToolSlug(
  slug: string,
  allTools: MinimalTool[],
  calculators: MinimalCalculator[],
  aiTools: MinimalAITool[]
): TopicPageData | null {
  return getTopicBySlug(slug, allTools, calculators, aiTools);
}