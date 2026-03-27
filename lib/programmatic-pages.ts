import type { PublicContentItem, PublicTable } from "@/lib/content-pages";
import { getCategoryPath } from "@/lib/content-pages";

export type ProgrammaticPage = {
  slug: string;
  href: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  keyword: string;
  table: PublicTable;
  targetSlug: string;
  targetName: string;
  breadcrumbs: { name: string; href: string }[];
  benefits: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

type Variant = {
  slugBuilder: (item: PublicContentItem) => string;
  keywordBuilder: (item: PublicContentItem) => string;
  titleBuilder: (item: PublicContentItem) => string;
  headingBuilder: (item: PublicContentItem) => string;
  descriptionBuilder: (item: PublicContentItem) => string;
  introBuilder: (item: PublicContentItem) => string;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildFaqs(
  table: PublicTable,
  item: PublicContentItem,
  keyword: string
) {
  if (table === "tools") {
    return [
      {
        question: `What is ${keyword}?`,
        answer: `${keyword} refers to a QuickFnd landing page built around ${item.name}, helping users find and use the tool more easily for a specific search intent.`,
      },
      {
        question: `Is ${item.name} available online?`,
        answer: `Yes. ${item.name} is available through QuickFnd as a browser-based page, so users can access it without installing extra software.`,
      },
      {
        question: `How is this page different from the main tool page?`,
        answer: `This page is designed as a more search-specific landing page, while the main ${item.name} page is the core tool experience.`,
      },
    ];
  }

  if (table === "calculators") {
    return [
      {
        question: `What is ${keyword}?`,
        answer: `${keyword} is a QuickFnd landing page built around ${item.name}, helping users discover the calculator through a more specific search phrase.`,
      },
      {
        question: `Can I use ${item.name} online?`,
        answer: `Yes. ${item.name} is available on QuickFnd as a browser-based calculator page.`,
      },
      {
        question: `Does this page replace the main calculator page?`,
        answer: `No. This page supports search discovery and context, while the main ${item.name} page remains the primary calculator experience.`,
      },
    ];
  }

  return [
    {
      question: `What is ${keyword}?`,
      answer: `${keyword} is a QuickFnd landing page built around ${item.name}, helping users discover this AI workflow through a more targeted search phrase.`,
    },
    {
      question: `Can I access ${item.name} directly?`,
      answer: `Yes. QuickFnd includes a dedicated page for ${item.name}, with supporting content and related navigation paths.`,
    },
    {
      question: `Why does QuickFnd create pages like this?`,
      answer: `These pages help users find the right AI workflow more quickly while also connecting them to the main tool page and related AI tools.`,
    },
  ];
}

function buildBenefits(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return [
      `Find ${item.name} through a more specific search-focused landing page.`,
      `Jump quickly from discovery content into the main working tool.`,
      `Explore related QuickFnd tools from the same context.`,
    ];
  }

  if (table === "calculators") {
    return [
      `Reach ${item.name} from a more targeted calculator search query.`,
      `Understand the calculator intent before opening the main calculator page.`,
      `Continue into related calculators for deeper comparison.`,
    ];
  }

  return [
    `Discover ${item.name} from a more targeted AI search phrase.`,
    `Use a structured landing page before moving into the main AI tool page.`,
    `Explore adjacent AI workflows through related QuickFnd pages.`,
  ];
}

const TOOL_VARIANTS: Variant[] = [
  {
    slugBuilder: (item) => `${item.slug}-online`,
    keywordBuilder: (item) => `${item.name} online`,
    titleBuilder: (item) => `${item.name} Online — Free Browser Tool | QuickFnd`,
    headingBuilder: (item) => `${item.name} Online`,
    descriptionBuilder: (item) =>
      `Use ${item.name} online for free. No install, no signup — runs instantly in your browser. ${item.description || ""}`,
    introBuilder: (item) =>
      `${item.name} Online is a free browser-based tool on QuickFnd. Open it instantly and use it without downloading anything.`,
  },
  {
    slugBuilder: (item) => `free-${item.slug}`,
    keywordBuilder: (item) => `free ${item.name}`,
    titleBuilder: (item) => `Free ${item.name} — No Signup Required | QuickFnd`,
    headingBuilder: (item) => `Free ${item.name}`,
    descriptionBuilder: (item) =>
      `Free ${item.name} on QuickFnd — no account, no install, no ads on the tool itself. Just open and use.`,
    introBuilder: (item) =>
      `Free ${item.name} is available instantly on QuickFnd. No credit card, no signup, no download required.`,
  },
  {
    slugBuilder: (item) => `best-${item.slug}`,
    keywordBuilder: (item) => `best ${item.name}`,
    titleBuilder: (item) => `Best ${item.name} Online in 2026 | QuickFnd`,
    headingBuilder: (item) => `Best ${item.name} Online`,
    descriptionBuilder: (item) =>
      `Why QuickFnd is the best place to use ${item.name} online — fast, free, privacy-friendly, and no install needed.`,
    introBuilder: (item) =>
      `Looking for the best ${item.name} online? QuickFnd offers a fast, free, browser-based version with no signup required.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-no-download`,
    keywordBuilder: (item) => `${item.name} no download`,
    titleBuilder: (item) => `${item.name} — No Download Needed | QuickFnd`,
    headingBuilder: (item) => `${item.name} — No Download`,
    descriptionBuilder: (item) =>
      `Use ${item.name} without downloading anything. Runs entirely in your browser on QuickFnd — instant and free.`,
    introBuilder: (item) =>
      `${item.name} requires no download on QuickFnd. Open your browser, use the tool, close the tab. Done.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-for-beginners`,
    keywordBuilder: (item) => `${item.name} for beginners`,
    titleBuilder: (item) => `${item.name} for Beginners — Step by Step | QuickFnd`,
    headingBuilder: (item) => `${item.name} for Beginners`,
    descriptionBuilder: (item) =>
      `New to ${item.name}? This page explains what it does, how to use it, and why it matters — then opens the tool directly.`,
    introBuilder: (item) =>
      `${item.name} for beginners: a simple explanation of what this tool does and how to get started on QuickFnd in under a minute.`,
  },
  {
    slugBuilder: (item) => `how-to-use-${item.slug}`,
    keywordBuilder: (item) => `how to use ${item.name}`,
    titleBuilder: (item) => `How to Use ${item.name} — Guide | QuickFnd`,
    headingBuilder: (item) => `How to Use ${item.name}`,
    descriptionBuilder: (item) =>
      `Step-by-step guide on how to use ${item.name} on QuickFnd. Learn the inputs, outputs, and practical use cases.`,
    introBuilder: (item) =>
      `This page walks you through how to use ${item.name} on QuickFnd — what to enter, what you get, and when to use it.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-alternative`,
    keywordBuilder: (item) => `${item.name} alternative`,
    titleBuilder: (item) => `${item.name} Alternative — Free & Instant | QuickFnd`,
    headingBuilder: (item) => `Free ${item.name} Alternative`,
    descriptionBuilder: (item) =>
      `Looking for a free ${item.name} alternative? QuickFnd offers a browser-based version with no signup and no cost.`,
    introBuilder: (item) =>
      `QuickFnd is a free ${item.name} alternative that runs in your browser. No installation, no account, no paid plan needed.`,
  },
];

const CALCULATOR_VARIANTS: Variant[] = [
  {
    slugBuilder: (item) => `${item.slug}-online`,
    keywordBuilder: (item) => `${item.name} online`,
    titleBuilder: (item) => `${item.name} Online — Free Calculator | QuickFnd`,
    headingBuilder: (item) => `${item.name} Online`,
    descriptionBuilder: (item) =>
      `Free ${item.name} online — instant results in your browser. No signup, no install. ${item.description || ""}`,
    introBuilder: (item) =>
      `${item.name} Online on QuickFnd gives you instant calculations in your browser. Free, accurate, and no account needed.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-india`,
    keywordBuilder: (item) => `${item.name} India`,
    titleBuilder: (item) => `${item.name} India — Free Online | QuickFnd`,
    headingBuilder: (item) => `${item.name} for India`,
    descriptionBuilder: (item) =>
      `${item.name} built for India — uses Indian financial rules, rupee values, and local regulations. Free on QuickFnd.`,
    introBuilder: (item) =>
      `This ${item.name} is designed for Indian users — supporting INR values, Indian tax rules, and local financial context.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-formula`,
    keywordBuilder: (item) => `${item.name} formula`,
    titleBuilder: (item) => `${item.name} Formula Explained | QuickFnd`,
    headingBuilder: (item) => `${item.name} Formula`,
    descriptionBuilder: (item) =>
      `Learn the ${item.name} formula with a clear explanation and worked examples — then calculate instantly on QuickFnd.`,
    introBuilder: (item) =>
      `Understanding the ${item.name} formula helps you verify results. Here's the formula explained simply, with a free calculator below.`,
  },
  {
    slugBuilder: (item) => `free-${item.slug}`,
    keywordBuilder: (item) => `free ${item.name}`,
    titleBuilder: (item) => `Free ${item.name} — No Signup | QuickFnd`,
    headingBuilder: (item) => `Free ${item.name}`,
    descriptionBuilder: (item) =>
      `Free ${item.name} on QuickFnd — no account, no cost, instant results. Used by thousands of Indians every month.`,
    introBuilder: (item) =>
      `QuickFnd's free ${item.name} gives you instant results with no signup required. Open the calculator and start calculating now.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-2026`,
    keywordBuilder: (item) => `${item.name} 2026`,
    titleBuilder: (item) => `${item.name} 2026 — Updated Rates | QuickFnd`,
    headingBuilder: (item) => `${item.name} 2026`,
    descriptionBuilder: (item) =>
      `${item.name} updated for 2026 — reflects latest tax rates, interest rates, and Indian financial regulations.`,
    introBuilder: (item) =>
      `This ${item.name} is updated for 2026 with the latest rates and rules applicable in India. Calculate accurately for this financial year.`,
  },
  {
    slugBuilder: (item) => `how-to-calculate-${item.slug.replace("-calculator", "")}`,
    keywordBuilder: (item) => `how to calculate ${item.name.replace(" Calculator", "").toLowerCase()}`,
    titleBuilder: (item) => `How to Calculate ${item.name.replace(" Calculator", "")} | QuickFnd`,
    headingBuilder: (item) => `How to Calculate ${item.name.replace(" Calculator", "")}`,
    descriptionBuilder: (item) =>
      `Step-by-step guide on how to calculate ${item.name.replace(" Calculator", "").toLowerCase()} — with formula, examples, and a free calculator.`,
    introBuilder: (item) =>
      `Learn how to calculate ${item.name.replace(" Calculator", "").toLowerCase()} manually or use our free tool for instant results.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-with-examples`,
    keywordBuilder: (item) => `${item.name} with examples`,
    titleBuilder: (item) => `${item.name} with Examples — Step by Step | QuickFnd`,
    headingBuilder: (item) => `${item.name} with Examples`,
    descriptionBuilder: (item) =>
      `${item.name} explained with real worked examples. Understand the calculation step by step and verify with our free tool.`,
    introBuilder: (item) =>
      `Real examples make ${item.name.toLowerCase()} easy to understand. Follow along below and use our free calculator to verify.`,
  },
  {
    slugBuilder: (item) => `best-${item.slug}`,
    keywordBuilder: (item) => `best ${item.name}`,
    titleBuilder: (item) => `Best ${item.name} Online 2026 | QuickFnd`,
    headingBuilder: (item) => `Best ${item.name} Online`,
    descriptionBuilder: (item) =>
      `Why QuickFnd has the best free ${item.name} — accurate results, no signup, India-specific, and constantly updated.`,
    introBuilder: (item) =>
      `QuickFnd's ${item.name} is trusted by thousands of Indians for its accuracy, simplicity, and India-specific calculations.`,
  },
];

const AI_TOOL_VARIANTS: Variant[] = [
  {
    slugBuilder: (item) => `${item.slug}-online`,
    keywordBuilder: (item) => `${item.name} online`,
    titleBuilder: (item) => `${item.name} Online | QuickFnd`,
    headingBuilder: (item) => `${item.name} Online`,
    descriptionBuilder: (item) =>
      `Explore ${item.name} online on QuickFnd with a dedicated landing page, FAQs, and direct access to the main AI tool page.`,
    introBuilder: (item) =>
      `${item.name} Online is a QuickFnd landing page designed for users who want to find this AI workflow quickly through a focused search phrase.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-for-beginners`,
    keywordBuilder: (item) => `${item.name} for beginners`,
    titleBuilder: (item) => `${item.name} for Beginners | QuickFnd`,
    headingBuilder: (item) => `${item.name} for Beginners`,
    descriptionBuilder: (item) =>
      `New to ${item.name}? Explore this QuickFnd landing page, understand the workflow, and continue into the main AI tool page.`,
    introBuilder: (item) =>
      `${item.name} for Beginners is a QuickFnd landing page created for users who want a clearer introduction before using or exploring the AI workflow.`,
  },
  {
    slugBuilder: (item) => `best-${item.slug}`,
    keywordBuilder: (item) => `best ${item.name}`,
    titleBuilder: (item) => `Best ${item.name} | QuickFnd`,
    headingBuilder: (item) => `Best ${item.name}`,
    descriptionBuilder: (item) =>
      `Looking for the best ${item.name} workflow? Explore QuickFnd's landing page, related AI tools, and the main tool page.`,
    introBuilder: (item) =>
      `Best ${item.name} is a QuickFnd landing page built for users comparing AI workflows and searching for a strong starting point.`,
  },
];

function getVariants(table: PublicTable) {
  if (table === "tools") return TOOL_VARIANTS;
  if (table === "calculators") return CALCULATOR_VARIANTS;
  return AI_TOOL_VARIANTS;
}

function getTopicBasePath(table: PublicTable) {
  return `${getCategoryPath(table)}/topics`;
}

export function buildProgrammaticPages(
  table: PublicTable,
  items: PublicContentItem[]
): ProgrammaticPage[] {
  const variants = getVariants(table);
  const basePath = getTopicBasePath(table);

  return items.flatMap((item) =>
    variants.map((variant) => {
      const slug = normalizeSlug(variant.slugBuilder(item));
      const keyword = variant.keywordBuilder(item);
      const href = `${basePath}/${slug}`;

      return {
        slug,
        href,
        title: variant.titleBuilder(item),
        description: variant.descriptionBuilder(item),
        heading: variant.headingBuilder(item),
        intro: variant.introBuilder(item),
        keyword,
        table,
        targetSlug: item.slug,
        targetName: item.name,
        breadcrumbs: [
          { name: "Home", href: "/" },
          {
            name:
              table === "tools"
                ? "Tools"
                : table === "calculators"
                ? "Calculators"
                : "AI Tools",
            href: getCategoryPath(table),
          },
          { name: "Topics", href: basePath },
          { name: variant.headingBuilder(item), href },
        ],
        benefits: buildBenefits(table, item),
        faqs: buildFaqs(table, item, keyword),
      };
    })
  );
}

export function getProgrammaticPageBySlug(
  table: PublicTable,
  items: PublicContentItem[],
  slug: string
) {
  return buildProgrammaticPages(table, items).find((page) => page.slug === slug);
}

export function getProgrammaticLinksForItem(
  table: PublicTable,
  item: PublicContentItem,
  limit = 3
) {
  return buildProgrammaticPages(table, [item]).slice(0, limit);
}