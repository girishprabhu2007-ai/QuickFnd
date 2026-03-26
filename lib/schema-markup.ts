/**
 * lib/schema-markup.ts
 * Generates JSON-LD structured data for blog posts.
 * Injects Article, FAQPage, HowTo, and BreadcrumbList schemas.
 * These get your articles rich results (FAQ dropdowns) in Google search.
 */

import type { BlogPost } from "@/lib/blog";
import type { Author } from "@/lib/authors";

const SITE_URL = "https://quickfnd.com";
const SITE_NAME = "QuickFnd";
const LOGO_URL = "https://quickfnd.com/icon.svg";

// ─── Extract FAQs from markdown content ──────────────────────────────────────
// Finds H2/H3 questions (lines ending with ?) and the paragraph that follows

export function extractFAQsFromContent(
  content: string,
  paaQuestions: string[] = []
): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // Method 1: PAA questions with their answers from content
  for (const question of paaQuestions.slice(0, 5)) {
    // Find if this question (or close variant) appears in content
    const qWords = question.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(" ").filter(w => w.length > 3);
    const lines = content.split("\n");
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const matchCount = qWords.filter(w => line.includes(w)).length;
      if (matchCount >= Math.ceil(qWords.length * 0.6) && lines[i].startsWith("#")) {
        // Found a heading that matches — get the next 2 paragraphs as answer
        const answerLines: string[] = [];
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const l = lines[j].trim();
          if (l && !l.startsWith("#") && !l.startsWith("```")) {
            // Strip markdown
            answerLines.push(l.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/`([^`]+)`/g, "$1"));
          }
          if (answerLines.length >= 2) break;
        }
        if (answerLines.length > 0) {
          faqs.push({ question, answer: answerLines.join(" ").slice(0, 300) });
          break;
        }
      }
    }
  }

  // Method 2: H2/H3 headings that are questions
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^#{2,3}\s+(.+\?)$/);
    if (headingMatch) {
      const question = headingMatch[1].trim();
      // Get answer from following paragraphs
      const answerLines: string[] = [];
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const l = lines[j].trim();
        if (l && !l.startsWith("#") && !l.startsWith("```")) {
          answerLines.push(l.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
        }
        if (answerLines.length >= 2) break;
      }
      if (answerLines.length > 0 && !faqs.some(f => f.question === question)) {
        faqs.push({ question, answer: answerLines.join(" ").slice(0, 300) });
      }
    }
    if (faqs.length >= 6) break;
  }

  return faqs.slice(0, 6);
}

// ─── Extract HowTo steps from markdown ───────────────────────────────────────

function extractHowToSteps(content: string): { name: string; text: string }[] {
  const steps: { name: string; text: string }[] = [];
  const lines = content.split("\n");
  let inStepSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect numbered list sections
    const numberedMatch = line.match(/^(\d+)\.\s+\*\*([^*]+)\*\*(.*)$/);
    if (numberedMatch) {
      const stepName = numberedMatch[2].trim();
      const rest = numberedMatch[3].trim();
      // Get continuation lines
      const desc: string[] = rest ? [rest] : [];
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const l = lines[j].trim();
        if (l && !l.match(/^\d+\./) && !l.startsWith("#")) {
          desc.push(l.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
        } else break;
      }
      if (desc.length > 0) {
        steps.push({ name: stepName, text: desc.join(" ").slice(0, 200) });
      }
    }

    if (steps.length >= 8) break;
  }

  return steps.slice(0, 8);
}

// ─── Article schema ───────────────────────────────────────────────────────────

function buildArticleSchema(post: BlogPost, author: Author | null, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": url,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at,
    "image": `${SITE_URL}/og-default.png`,
    "author": author ? {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.title,
      "url": `${SITE_URL}/blog/authors/${author.slug}`,
    } : {
      "@type": "Organization",
      "name": SITE_NAME,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
    "keywords": [post.target_keyword || "", ...post.secondary_keywords].filter(Boolean).join(", "),
    "articleSection": post.category.replace(/-/g, " "),
    "wordCount": Math.round(post.content.split(/\s+/).length),
    "timeRequired": `PT${post.reading_time_minutes}M`,
  };
}

// ─── FAQ schema ───────────────────────────────────────────────────────────────

function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

// ─── HowTo schema ─────────────────────────────────────────────────────────────

function buildHowToSchema(
  post: BlogPost,
  steps: { name: string; text: string }[]
) {
  if (steps.length < 3) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": post.title,
    "description": post.excerpt,
    "totalTime": `PT${post.reading_time_minutes}M`,
    "step": steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.name,
      "text": step.text,
    })),
  };
}

// ─── Breadcrumb schema ────────────────────────────────────────────────────────

function buildBreadcrumbSchema(post: BlogPost, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": url },
    ],
  };
}

// ─── Main export: build all schemas for a blog post ──────────────────────────

export function buildBlogSchemas(
  post: BlogPost,
  author: Author | null,
  paaQuestions: string[] = []
): string {
  try {
    const url = `${SITE_URL}/blog/${post.slug}`;
    
    const faqs = extractFAQsFromContent(post.content, paaQuestions);
    const steps = post.category === "how-to" ? extractHowToSteps(post.content) : [];

    const schemas = [
      buildArticleSchema(post, author, url),
      buildBreadcrumbSchema(post, url),
      faqs.length > 0 ? buildFAQSchema(faqs) : null,
      steps.length >= 3 ? buildHowToSchema(post, steps) : null,
    ].filter(Boolean);

    return schemas
      .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join("\n");
  } catch {
    // Never let schema crash the page
    return "";
  }
}