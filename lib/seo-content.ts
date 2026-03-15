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

export type SEOSectionData = {
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

function getCategoryTitle(table: PublicTable) {
  if (table === "tools") return "Tools";
  if (table === "calculators") return "Calculators";
  return "AI Tools";
}

function getApplicationCategory(table: PublicTable) {
  if (table === "tools") return "UtilitiesApplication";
  if (table === "calculators") return "FinanceApplication";
  return "BusinessApplication";
}

function buildIntro(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return `${item.name} is a browser-based QuickFnd tool designed to help you complete a focused task quickly with less manual work. It runs directly in the browser and is easy to reuse across desktop and mobile devices.`;
  }

  if (table === "calculators") {
    return `${item.name} is a QuickFnd calculator built for fast input, instant results, and easier online decision-making. It helps reduce manual calculation effort and gives users a cleaner way to estimate common values.`;
  }

  return `${item.name} is an AI-focused QuickFnd page built to help users discover or use a specific AI workflow. Depending on the page, it may include an interactive interface, structured supporting content, and links to related AI tools.`;
}

function buildBenefits(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return [
      `Use ${item.name.toLowerCase()} directly in your browser without installing extra software.`,
      `Complete repeat tasks faster with a focused and lightweight interface.`,
      `Access a dedicated public page that is easy to bookmark and revisit.`,
      `Discover related QuickFnd tools for adjacent tasks and workflows.`,
    ];
  }

  if (table === "calculators") {
    return [
      `Calculate results quickly with fewer manual steps.`,
      `Reduce common arithmetic mistakes compared with hand calculation.`,
      `Use a clean interface that works well on desktop and mobile.`,
      `Continue into related QuickFnd calculators for broader comparison.`,
    ];
  }

  return [
    `Explore ${item.name.toLowerCase()} from a dedicated AI tool page.`,
    `Use or evaluate the workflow in a cleaner and more structured environment.`,
    `Discover related AI tools without jumping across multiple directories.`,
    `Benefit from supporting content, internal links, and clearer navigation.`,
  ];
}

function buildSteps(table: PublicTable, item: PublicContentItem) {
  if (table === "tools") {
    return [
      `Open the ${item.name} interface on this page.`,
      `Paste, type, or upload the content needed for the tool.`,
      `Adjust any available settings if the tool supports configuration.`,
      `Review the result and copy, download, or reuse it immediately.`,
    ];
  }

  if (table === "calculators") {
    return [
      `Open the ${item.name} calculator on this page.`,
      `Enter the required values into the input fields.`,
      `Review units, assumptions, or percentages before calculating.`,
      `Check the result and compare it with related calculators if helpful.`,
    ];
  }

  return [
    `Open the ${item.name} page and review the available interface or tool details.`,
    `Enter your request if the page includes an interactive AI engine.`,
    `Review the output and refine your input if you want better results.`,
    `Explore related AI tools on QuickFnd to continue the workflow.`,
  ];
}

function buildUseCases(table: PublicTable) {
  if (table === "tools") {
    return [
      `Quick browser-based tasks without installing extra software`,
      `Developer, marketer, student, and creator utility workflows`,
      `Formatting, transforming, generating, or validating common inputs`,
      `Saving time on small but frequent digital operations`,
    ];
  }

  if (table === "calculators") {
    return [
      `Fast estimation before making a decision`,
      `Comparing scenarios with slightly different values`,
      `Checking finance, planning, or everyday calculation inputs`,
      `Using a mobile-friendly calculator during daily workflows`,
    ];
  }

  return [
    `Exploring practical AI workflows from a dedicated page`,
    `Generating drafts, prompts, outlines, or structured starting points`,
    `Comparing related AI tools inside one platform`,
    `Finding the next useful AI workflow through internal discovery`,
  ];
}

function buildFAQs(table: PublicTable, item: PublicContentItem): FAQItem[] {
  const itemName = item.name;

  if (table === "tools") {
    return [
      {
        question: `What is ${itemName}?`,
        answer: `${itemName} is a browser-based QuickFnd tool that helps users complete a specific task online without needing extra installed software.`,
      },
      {
        question: `How do I use ${itemName}?`,
        answer: `Open the tool, enter the required input, adjust any available settings, and use the generated or transformed result directly on the page.`,
      },
      {
        question: `Is ${itemName} free to use?`,
        answer: `${itemName} is available as a public QuickFnd page for quick browser-based use.`,
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
        answer: `${itemName} is useful for fast online calculations and estimates, but important financial, legal, medical, or professional decisions should still be verified independently.`,
      },
      {
        question: `How do I use ${itemName}?`,
        answer: `Enter the required values, review the units or assumptions, and calculate the result instantly on the page.`,
      },
      {
        question: `Can I compare related calculations on QuickFnd?`,
        answer: `Yes. QuickFnd includes related calculators so you can continue comparing scenarios and results.`,
      },
    ];
  }

  return [
    {
      question: `What is ${itemName}?`,
      answer: `${itemName} is an AI-focused page on QuickFnd that helps users discover or use a specific AI workflow from a dedicated public page.`,
    },
    {
      question: `How do I use ${itemName}?`,
      answer: `Open the page, enter your request if the interface is interactive, review the response, and refine the input if needed.`,
    },
    {
      question: `Who is ${itemName} useful for?`,
      answer: `${itemName} can be useful for creators, marketers, founders, operators, students, and anyone exploring practical AI workflows.`,
    },
    {
      question: `Does QuickFnd include related AI tools?`,
      answer: `Yes. QuickFnd organizes related AI pages so users can continue exploring adjacent AI use cases and workflows.`,
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
      { name: item.name, url: pageUrl },
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