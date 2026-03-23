import { getTools, getCalculators, getAITools } from "@/lib/db";
import { filterVisibleTools } from "@/lib/public-tool-visibility";
import { filterVisibleContent } from "@/lib/public-content-visibility";
import type { PublicContentItem } from "@/lib/content-pages";

function uniqueBySlug(items: PublicContentItem[]) {
  const seen = new Set<string>();
  const output: PublicContentItem[] = [];

  for (const item of items) {
    const slug = String(item.slug || "").trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    output.push(item);
  }

  return output;
}

/**
 * CORE: unified public inventory pipeline
 */
export async function getPublicInventory() {
  const [toolsRaw, calculatorsRaw, aiRaw] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  // Step 1: apply visibility rules
  const tools = filterVisibleTools(toolsRaw);
  const calculators = filterVisibleContent(calculatorsRaw);
  const aiTools = filterVisibleContent(aiRaw);

  // Step 2: enforce dedupe (future-safe)
  return {
    tools: uniqueBySlug(tools),
    calculators: uniqueBySlug(calculators),
    aiTools: uniqueBySlug(aiTools),
  };
}

/**
 * Centralized counts (NO PAGE SHOULD COMPUTE COUNTS)
 */
export async function getPublicCounts() {
  const { tools, calculators, aiTools } = await getPublicInventory();

  return {
    tools: tools.length,
    calculators: calculators.length,
    aiTools: aiTools.length,
    total: tools.length + calculators.length + aiTools.length,
  };
}