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
      `Find ${item.name.toLowerCase()} through a more specific search-focused landing page.`,
      `Jump quickly from discovery content into the main working tool.`,
      `Explore related QuickFnd tools from the same context.`,
    ];
  }

  if (table === "calculators") {
    return [
      `Reach ${item.name.toLowerCase()} from a more targeted calculator search query.`,
      `Understand the calculator intent before opening the main calculator page.`,
      `Continue into related calculators for deeper comparison.`,
    ];
  }

  return [
    `Discover ${item.name.toLowerCase()} from a more targeted AI search phrase.`,
    `Use a structured landing page before moving into the main AI tool page.`,
    `Explore adjacent AI workflows through related QuickFnd pages.`,
  ];
}

const TOOL_VARIANTS: Variant[] = [
  {
    slugBuilder: (item) => `${item.slug}-online`,
    keywordBuilder: (item) => `${item.name} online`,
    titleBuilder: (item) => `${item.name} Online | QuickFnd`,
    headingBuilder: (item) => `${item.name} Online`,
    descriptionBuilder: (item) =>
      `Use ${item.name.toLowerCase()} online with QuickFnd. Explore the browser-based page, benefits, FAQs, and the main tool experience.`,
    introBuilder: (item) =>
      `${item.name} Online is a search-focused QuickFnd landing page designed for users who want to find and use the tool quickly in the browser.`,
  },
  {
    slugBuilder: (item) => `free-${item.slug}`,
    keywordBuilder: (item) => `free ${item.name.toLowerCase()}`,
    titleBuilder: (item) => `Free ${item.name} | QuickFnd`,
    headingBuilder: (item) => `Free ${item.name}`,
    descriptionBuilder: (item) =>
      `Explore Free ${item.name} on QuickFnd. Learn what it does, why users search for it, and open the main tool page.`,
    introBuilder: (item) =>
      `Free ${item.name} is a QuickFnd landing page built for users searching for a fast, browser-based version of this tool.`,
  },
  {
    slugBuilder: (item) => `best-${item.slug}`,
    keywordBuilder: (item) => `best ${item.name.toLowerCase()}`,
    titleBuilder: (item) => `Best ${item.name} | QuickFnd`,
    headingBuilder: (item) => `Best ${item.name}`,
    descriptionBuilder: (item) =>
      `Looking for the best ${item.name.toLowerCase()} experience? Explore QuickFnd's dedicated page, related tools, FAQs, and direct access.`,
    introBuilder: (item) =>
      `Best ${item.name} is a QuickFnd landing page created for users comparing options and looking for a focused browser-based experience.`,
  },
];

const CALCULATOR_VARIANTS: Variant[] = [
  {
    slugBuilder: (item) => `${item.slug}-online`,
    keywordBuilder: (item) => `${item.name} online`,
    titleBuilder: (item) => `${item.name} Online | QuickFnd`,
    headingBuilder: (item) => `${item.name} Online`,
    descriptionBuilder: (item) =>
      `Use ${item.name.toLowerCase()} online with QuickFnd. Discover the calculator, FAQs, benefits, and the main calculation page.`,
    introBuilder: (item) =>
      `${item.name} Online is a search-focused QuickFnd landing page designed for users who want to calculate results quickly in the browser.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-formula`,
    keywordBuilder: (item) => `${item.name} formula`,
    titleBuilder: (item) => `${item.name} Formula | QuickFnd`,
    headingBuilder: (item) => `${item.name} Formula`,
    descriptionBuilder: (item) =>
      `Explore ${item.name.toLowerCase()} formula intent with QuickFnd, then continue into the main calculator for fast online calculation.`,
    introBuilder: (item) =>
      `${item.name} Formula is a QuickFnd landing page built for users searching for formula-related context before using the calculator itself.`,
  },
  {
    slugBuilder: (item) => `free-${item.slug}`,
    keywordBuilder: (item) => `free ${item.name.toLowerCase()}`,
    titleBuilder: (item) => `Free ${item.name} | QuickFnd`,
    headingBuilder: (item) => `Free ${item.name}`,
    descriptionBuilder: (item) =>
      `Use Free ${item.name} on QuickFnd. Discover the calculator page, FAQs, and a faster path into the main calculator experience.`,
    introBuilder: (item) =>
      `Free ${item.name} is a QuickFnd landing page created for users looking for a clean online calculator without extra setup.`,
  },
];

const AI_TOOL_VARIANTS: Variant[] = [
  {
    slugBuilder: (item) => `${item.slug}-online`,
    keywordBuilder: (item) => `${item.name} online`,
    titleBuilder: (item) => `${item.name} Online | QuickFnd`,
    headingBuilder: (item) => `${item.name} Online`,
    descriptionBuilder: (item) =>
      `Explore ${item.name.toLowerCase()} online on QuickFnd with a dedicated landing page, FAQs, and direct access to the main AI tool page.`,
    introBuilder: (item) =>
      `${item.name} Online is a QuickFnd landing page designed for users who want to find this AI workflow quickly through a focused search phrase.`,
  },
  {
    slugBuilder: (item) => `${item.slug}-for-beginners`,
    keywordBuilder: (item) => `${item.name} for beginners`,
    titleBuilder: (item) => `${item.name} for Beginners | QuickFnd`,
    headingBuilder: (item) => `${item.name} for Beginners`,
    descriptionBuilder: (item) =>
      `New to ${item.name.toLowerCase()}? Explore this QuickFnd landing page, understand the workflow, and continue into the main AI tool page.`,
    introBuilder: (item) =>
      `${item.name} for Beginners is a QuickFnd landing page created for users who want a clearer introduction before using or exploring the AI workflow.`,
  },
  {
    slugBuilder: (item) => `best-${item.slug}`,
    keywordBuilder: (item) => `best ${item.name.toLowerCase()}`,
    titleBuilder: (item) => `Best ${item.name} | QuickFnd`,
    headingBuilder: (item) => `Best ${item.name}`,
    descriptionBuilder: (item) =>
      `Looking for the best ${item.name.toLowerCase()} workflow? Explore QuickFnd's landing page, related AI tools, and the main tool page.`,
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