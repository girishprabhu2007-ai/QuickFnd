import type { PublicContentItem, PublicTable } from "@/lib/content-pages";
import { getCategoryLabel, getCategoryPath } from "@/lib/content-pages";
import { getSiteUrl } from "@/lib/site-url";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type FAQItem = {
  question: string;
  answer: string;
};

type SEOSectionData = {
  categoryLabel: string;
  categoryPath: string;
  categoryTitle: string;
  pageUrl: string;
  intro: string;
  benefits: string[];
  steps: string[];
  useCases: string[];
  faqs: FAQItem[];
  breadcrumbs: BreadcrumbItem[];
  applicationCategory: string;
};

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCategoryTitle(table: PublicTable) {
  if (table === "tools") return "Tools";
  if (table === "calculators") return "Calculators";
  return "AI Tools";
}

function getApplicationCategory(table: PublicTable) {
  if (table === "tools") return "DeveloperApplication";
  if (table === "calculators") return "FinanceApplication";
  return "BusinessApplication";
}

function buildIntro(table: PublicTable, item: PublicContentItem) {
  const label = getCategoryLabel(table).toLowerCase();

  if (table === "tools") {
    return `${item.name} helps you complete common browser-based tasks quickly without installing extra software. Use it on QuickFnd for fast results, a simple interface, and easy access from any device.`;
  }

  if (table === "calculators") {
    return `${item.name} helps you calculate results instantly with a clean interface and quick inputs. It is built for everyday use, fast estimation, and easier decision-making directly in your browser.`;
  }

  return `${item.name} is available on QuickFnd as an indexable ${label} page with a usable interface, helpful supporting content, and related discovery paths for users exploring AI workflows.`;
}

function buildBenefits(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return [
      `Use ${item.name.toLowerCase()} instantly in the browser without extra setup.`,
      `Get fast results with a focused interface built for repeat use.`,
      `Access a dedicated page that is easy to bookmark, share, and revisit.`,
      `Discover related QuickFnd tools for adjacent tasks and workflows.`,
    ];
  }

  if (table === "calculators") {
    return [
      `Run ${item.name.toLowerCase()} calculations quickly with fewer manual steps.`,
      `Reduce mistakes compared with doing the same math by hand.`,
      `Use a cleaner calculator layout that works on desktop and mobile.`,
      `Continue into related calculators for broader planning and comparison.`,
    ];
  }

  return [
    `Use ${item.name.toLowerCase()} from a dedicated, indexable QuickFnd page.`,
    `Explore the tool in context with related AI workflows and companion utilities.`,
    `Get a cleaner discovery experience than browsing scattered tool lists.`,
    `Benefit from structured content, internal links, and reusable navigation paths.`,
  ];
}

function buildSteps(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return [
      `Open the ${item.name} interface on this page.`,
      `Enter or paste the content needed for the tool.`,
      `Adjust any available settings if the tool supports configuration.`,
      `Review the output and copy or reuse the result immediately.`,
    ];
  }

  if (table === "calculators") {
    return [
      `Open the ${item.name} calculator on this page.`,
      `Enter the required values into the available fields.`,
      `Check any assumptions, units, or percentage values before calculating.`,
      `Review the result and compare it with related calculators if needed.`,
    ];
  }

  return [
    `Open the ${item.name} page and review the available interface or listing details.`,
    `Enter your prompt, topic, or task if this AI page includes an interactive engine.`,
    `Generate or review results and refine the input for better output quality.`,
    `Explore related AI tools on QuickFnd to expand the workflow.`,
  ];
}

function buildUseCases(table: PublicTable) {
  if (table === "tools") {
    return [
      `Quick one-off browser tasks without installing software`,
      `Developer, marketer, student, or creator utility workflows`,
      `Repeated formatting, encoding, transforming, or generation tasks`,
      `Saving time on small but frequent digital operations`,
    ];
  }

  if (table === "calculators") {
    return [
      `Fast estimation before making a decision`,
      `Comparing scenarios with slightly different inputs`,
      `Checking values for finance, planning, or personal calculations`,
      `Using a mobile-friendly calculator during daily workflows`,
    ];
  }

  return [
    `Exploring AI workflows from a dedicated landing page`,
    `Generating first drafts, prompts, or structured content ideas`,
    `Comparing related AI task flows on the same platform`,
    `Using AI utilities in a cleaner discovery environment`,
  ];
}

function buildFAQs(table: PublicTable, item: PublicContentItem): FAQItem[] {
  const itemName = item.name;

  if (table === "tools") {
    return [
      {
        question: `What is ${itemName}?`,
        answer: `${itemName} is a browser-based tool on QuickFnd that helps users complete a focused task quickly without needing extra software.`,
      },
      {
        question: `How do I use ${itemName}?`,
        answer: `Open the tool, enter the required input, adjust settings if available, and use the generated or transformed result directly on the page.`,
      },
      {
        question: `Is ${itemName} free to use?`,
        answer: `${itemName} is presented as a public QuickFnd page and is designed for quick access and repeat use from the browser.`,
      },
      {
        question: `Can I use ${itemName} on mobile?`,
        answer: `Yes. QuickFnd pages are designed to work across modern desktop and mobile browsers.`,
      },
    ];
  }

  if (table === "calculators") {
    return [
      {
        question: `What does ${itemName} calculate?`,
        answer: `${itemName} helps users enter relevant values and quickly estimate or calculate results directly in the browser.`,
      },
      {
        question: `How accurate is ${itemName}?`,
        answer: `${itemName} is useful for fast calculations and estimates, but users should verify important financial, legal, or professional decisions independently where necessary.`,
      },
      {
        question: `How do I use ${itemName}?`,
        answer: `Enter the required values, review the units or assumptions, and calculate the result instantly on the page.`,
      },
      {
        question: `Can I compare related calculations on QuickFnd?`,
        answer: `Yes. Each page can connect users to related calculators for broader comparison and planning.`,
      },
    ];
  }

  return [
    {
      question: `What is ${itemName}?`,
      answer: `${itemName} is an AI-related page on QuickFnd that helps users discover or use a focused AI workflow through a dedicated public page.`,
    },
    {
      question: `How do I use ${itemName}?`,
      answer: `Open the page, enter your topic or request if the interface is interactive, review the output, and refine as needed.`,
    },
    {
      question: `Who is ${itemName} useful for?`,
      answer: `${itemName} can be useful for creators, marketers, operators, founders, students, and anyone exploring practical AI workflows.`,
    },
    {
      question: `Does QuickFnd include related AI tools?`,
      answer: `Yes. QuickFnd organizes related AI pages so users can continue exploring adjacent use cases and workflows.`,
    },
  ];
}

export function buildSEOSectionData(
  table: PublicTable,
  item: PublicContentItem
): SEOSectionData {
  const siteUrl = getSiteUrl();
  const categoryPath = getCategoryPath(table);
  const categoryLabel = getCategoryLabel(table);
  const categoryTitle = getCategoryTitle(table);
  const pageUrl = `${siteUrl}${categoryPath}/${item.slug}`;

  return {
    categoryLabel,
    categoryPath,
    categoryTitle,
    pageUrl,
    intro: buildIntro(table, item),
    benefits: buildBenefits(table, item),
    steps: buildSteps(table, item),
    useCases: buildUseCases(table),
    faqs: buildFAQs(table, item),
    breadcrumbs: [
      { name: "Home", url: siteUrl },
      { name: categoryTitle, url: `${siteUrl}${categoryPath}` },
      { name: item.name || titleCaseFromSlug(item.slug), url: pageUrl },
    ],
    applicationCategory: getApplicationCategory(table),
  };
}

export function buildBreadcrumbSchema(
  table: PublicTable,
  item: PublicContentItem
) {
  const data = buildSEOSectionData(table, item);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: data.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function buildFaqSchema(table: PublicTable, item: PublicContentItem) {
  const data = buildSEOSectionData(table, item);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildSoftwareSchema(
  table: PublicTable,
  item: PublicContentItem
) {
  const data = buildSEOSectionData(table, item);

  const baseType =
    table === "ai_tools" ? "WebApplication" : "SoftwareApplication";

  return {
    "@context": "https://schema.org",
    "@type": baseType,
    name: item.name,
    description: item.description || data.intro,
    applicationCategory: data.applicationCategory,
    operatingSystem: "Web",
    url: data.pageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}