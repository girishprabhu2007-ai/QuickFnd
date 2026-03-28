"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

type AIToolConfig = {
  task?: string;
  tone?: string;
  toneOptions?: string[];
  outputType?: string;
  systemPrompt?: string;
  buttonLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  intro?: string;
};

type RunResponse = { success?: boolean; output?: string; error?: string };

/* ═══════════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — shared styling functions
   ═══════════════════════════════════════════════════════════════════════════════ */

const cls = {
  card: "rounded-[28px] border border-q-border bg-q-card p-6 shadow-sm md:p-8",
  panel: "rounded-2xl border border-q-border bg-q-bg p-5",
  input: "w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none transition placeholder:text-q-muted/60 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10",
  textarea: "w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none transition placeholder:text-q-muted/60 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 resize-none",
  label: "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-q-muted",
  sectionTitle: "text-xs font-semibold uppercase tracking-[0.16em] text-q-muted",
  outputShell: "rounded-[24px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm md:p-6",
  outputInner: "rounded-xl border border-q-border bg-q-card p-4 text-sm leading-7 text-q-text whitespace-pre-wrap",
  primaryBtn: "rounded-xl bg-q-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-q-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
  secondaryBtn: "rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50",
  copyBtn: "rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-muted transition hover:text-q-text hover:bg-q-card-hover",
  badge: (color: string) => `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`,
  accentBar: (color: string) => `h-1 w-12 rounded-full ${color}`,
};

/* ═══════════════════════════════════════════════════════════════════════════════
   TASK IDENTITY — colors, icons, structured fields per task
   ═══════════════════════════════════════════════════════════════════════════════ */

type TaskIdentity = {
  icon: string;
  accentColor: string;
  badgeColor: string;
  barColor: string;
  actionLabel: string;
  outputLabel: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type: "input" | "textarea" | "select";
    options?: string[];
    rows?: number;
    required?: boolean;
  }>;
  tips: string[];
};

function getTaskIdentity(task: string, itemName: string): TaskIdentity {
  switch (task) {
    case "email":
    case "cold-email":
      return {
        icon: "✉️",
        accentColor: "text-blue-600 dark:text-blue-400",
        badgeColor: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        barColor: "bg-blue-500",
        actionLabel: task === "cold-email" ? "Write Cold Email" : "Write Email",
        outputLabel: task === "cold-email" ? "Cold Email" : "Email Draft",
        description: task === "cold-email"
          ? "Write a short, personalised cold outreach email that gets replies."
          : "Draft a polished, send-ready email with clear intent and structure.",
        fields: [
          { key: "purpose", label: "What's this email about?", placeholder: "Follow up on pricing discussion from Tuesday's demo call", type: "textarea", rows: 2, required: true },
          { key: "recipient", label: "Who's receiving this?", placeholder: "Engineering lead at a mid-size SaaS company", type: "input" },
          { key: "tone", label: "Tone", placeholder: "", type: "select", options: ["Professional", "Friendly", "Formal", "Casual", "Urgent"] },
          { key: "cta", label: "What should they do next?", placeholder: "Schedule a 15-min call this week", type: "input" },
        ],
        tips: ["Be specific about the purpose — vague emails get vague results", "Mention the recipient's context for personalisation", "A clear call-to-action improves reply rates"],
      };

    case "outline":
      return {
        icon: "📋",
        accentColor: "text-violet-600 dark:text-violet-400",
        badgeColor: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
        barColor: "bg-violet-500",
        actionLabel: "Generate Outline",
        outputLabel: "Content Outline",
        description: "Create a structured outline for blog posts, guides, videos, or documentation.",
        fields: [
          { key: "topic", label: "Topic", placeholder: "Complete guide to API rate limiting for SaaS apps", type: "textarea", rows: 2, required: true },
          { key: "audience", label: "Target audience", placeholder: "Backend developers building production APIs", type: "input" },
          { key: "depth", label: "Depth", placeholder: "", type: "select", options: ["Quick overview", "Standard article", "Comprehensive guide", "Pillar page"] },
          { key: "notes", label: "Anything specific to include?", placeholder: "Include a section on Redis-based rate limiting", type: "textarea", rows: 2 },
        ],
        tips: ["Specific topics produce better outlines than broad ones", "Mentioning the audience shapes the depth and vocabulary", "Add notes for sections you definitely want included"],
      };

    case "prompt-generator":
      return {
        icon: "⚡",
        accentColor: "text-amber-600 dark:text-amber-400",
        badgeColor: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        barColor: "bg-amber-500",
        actionLabel: "Generate Prompt",
        outputLabel: "AI Prompt",
        description: "Turn a rough idea into a strong, structured prompt ready for any AI tool.",
        fields: [
          { key: "goal", label: "What do you want the prompt to achieve?", placeholder: "Generate a landing page hero section for a developer tools startup", type: "textarea", rows: 2, required: true },
          { key: "targetAI", label: "Target AI system", placeholder: "", type: "select", options: ["Text AI (GPT, Claude)", "Midjourney / DALL-E", "Code assistant", "Any AI"] },
          { key: "constraints", label: "Constraints or requirements", placeholder: "Output should be valid HTML with Tailwind classes", type: "textarea", rows: 2 },
        ],
        tips: ["Describe the end result, not the process", "Include output format expectations", "Add constraints to avoid generic results"],
      };

    case "summarize":
    case "summarization":
      return {
        icon: "📝",
        accentColor: "text-teal-600 dark:text-teal-400",
        badgeColor: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
        barColor: "bg-teal-500",
        actionLabel: "Summarize",
        outputLabel: "Summary",
        description: "Condense any article, document, or text into clear key points.",
        fields: [
          { key: "text", label: "Paste text to summarize", placeholder: "Paste your article, report, meeting notes, or any long text here...", type: "textarea", rows: 8, required: true },
          { key: "format", label: "Summary format", placeholder: "", type: "select", options: ["Bullet points", "Short paragraph", "Executive summary", "Key takeaways"] },
          { key: "length", label: "Length", placeholder: "", type: "select", options: ["Brief (2-3 sentences)", "Standard", "Detailed"] },
        ],
        tips: ["Longer source text produces better summaries", "Choose bullet points for scannable output", "Executive summary works best for reports"],
      };

    case "grammar-check":
      return {
        icon: "✅",
        accentColor: "text-green-600 dark:text-green-400",
        badgeColor: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
        barColor: "bg-green-500",
        actionLabel: "Check Grammar",
        outputLabel: "Corrected Text",
        description: "Fix grammar, spelling, and punctuation errors with clear explanations.",
        fields: [
          { key: "text", label: "Text to check", placeholder: "Paste your text here — emails, essays, blog posts, cover letters, anything...", type: "textarea", rows: 8, required: true },
          { key: "style", label: "Writing style", placeholder: "", type: "select", options: ["General", "Academic", "Business", "Creative", "Technical"] },
        ],
        tips: ["Paste the complete text for best results", "Technical terms won't be flagged if you select the right style", "Review each correction before accepting"],
      };

    case "paraphrase":
      return {
        icon: "🔄",
        accentColor: "text-indigo-600 dark:text-indigo-400",
        badgeColor: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
        barColor: "bg-indigo-500",
        actionLabel: "Paraphrase",
        outputLabel: "Paraphrased Text",
        description: "Rewrite text in a different way while keeping the original meaning intact.",
        fields: [
          { key: "text", label: "Original text", placeholder: "Paste the text you want rewritten in a fresh way...", type: "textarea", rows: 6, required: true },
          { key: "tone", label: "Target tone", placeholder: "", type: "select", options: ["Same tone", "More formal", "More casual", "Simpler language", "Academic"] },
        ],
        tips: ["Paste the full passage for consistent rewording", "Choosing 'Simpler language' is great for technical-to-plain conversions"],
      };

    case "rewrite":
      return {
        icon: "✏️",
        accentColor: "text-orange-600 dark:text-orange-400",
        badgeColor: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        barColor: "bg-orange-500",
        actionLabel: "Rewrite",
        outputLabel: "Rewritten Text",
        description: "Improve clarity, tone, and structure while keeping the original intent.",
        fields: [
          { key: "text", label: "Text to rewrite", placeholder: "Paste the original text here...", type: "textarea", rows: 6, required: true },
          { key: "goal", label: "What should improve?", placeholder: "", type: "select", options: ["More clarity", "More persuasive", "More concise", "More professional", "More engaging"] },
        ],
        tips: ["Be explicit about what you want improved", "Rewrite works best with 1-3 paragraphs at a time"],
      };

    case "cover-letter":
      return {
        icon: "📄",
        accentColor: "text-sky-600 dark:text-sky-400",
        badgeColor: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
        barColor: "bg-sky-500",
        actionLabel: "Write Cover Letter",
        outputLabel: "Cover Letter",
        description: "Write a tailored, professional cover letter ready to personalise and send.",
        fields: [
          { key: "jobTitle", label: "Job title you're applying for", placeholder: "Senior Product Manager", type: "input", required: true },
          { key: "company", label: "Company name", placeholder: "Stripe", type: "input" },
          { key: "requirements", label: "Key job requirements", placeholder: "5+ years PM experience, SaaS background, data-driven decision making...", type: "textarea", rows: 3, required: true },
          { key: "background", label: "Your relevant experience", placeholder: "6 years as PM at fintech startups, launched 3 products from 0 to 1, grew ARR by 4x...", type: "textarea", rows: 3, required: true },
        ],
        tips: ["Paste key requirements from the job posting", "Mention specific achievements with numbers", "Include the company name for personalisation"],
      };

    case "linkedin-bio":
      return {
        icon: "💼",
        accentColor: "text-blue-700 dark:text-blue-400",
        badgeColor: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        barColor: "bg-blue-600",
        actionLabel: "Write LinkedIn Bio",
        outputLabel: "LinkedIn About Section",
        description: "Write a professional LinkedIn About section that gets noticed.",
        fields: [
          { key: "role", label: "Current role & speciality", placeholder: "Full-stack engineer specialising in React and Node.js", type: "input", required: true },
          { key: "experience", label: "Key achievements", placeholder: "Built payment systems processing $2M/month, led team of 5 engineers, open source contributor...", type: "textarea", rows: 3, required: true },
          { key: "goals", label: "What are you looking for?", placeholder: "Open to senior engineering roles at product-led companies", type: "input" },
        ],
        tips: ["Focus on value delivered, not job titles", "Include numbers where possible", "End with a clear call-to-action"],
      };

    case "product-description":
      return {
        icon: "🛒",
        accentColor: "text-pink-600 dark:text-pink-400",
        badgeColor: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        barColor: "bg-pink-500",
        actionLabel: "Write Description",
        outputLabel: "Product Description",
        description: "Write persuasive product descriptions that turn features into benefits.",
        fields: [
          { key: "productName", label: "Product name", placeholder: "AirPods Max", type: "input", required: true },
          { key: "features", label: "Key features", placeholder: "Active noise cancellation, spatial audio, 20-hour battery, premium mesh canopy headband...", type: "textarea", rows: 3, required: true },
          { key: "customer", label: "Target customer", placeholder: "Audiophiles and remote workers who want premium sound quality", type: "input" },
          { key: "platform", label: "Where will this appear?", placeholder: "", type: "select", options: ["E-commerce listing", "App store", "Landing page", "Social media", "General"] },
        ],
        tips: ["Lead with the main benefit, not the feature", "Include sensory language for physical products", "Mention who it's for to improve relevance"],
      };

    case "tweet":
      return {
        icon: "🐦",
        accentColor: "text-sky-500 dark:text-sky-400",
        badgeColor: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
        barColor: "bg-sky-400",
        actionLabel: "Generate Tweet",
        outputLabel: "Tweet",
        description: "Generate engaging tweets or threads. Punchy, direct, designed for engagement.",
        fields: [
          { key: "idea", label: "Topic or idea", placeholder: "The biggest mistake founders make when launching their first product...", type: "textarea", rows: 3, required: true },
          { key: "format", label: "Format", placeholder: "", type: "select", options: ["Single tweet", "Thread (3-5 tweets)", "Quote tweet", "Engagement bait"] },
          { key: "voice", label: "Voice", placeholder: "", type: "select", options: ["Thought leader", "Casual / conversational", "Bold / controversial", "Educational", "Humorous"] },
        ],
        tips: ["Start with a hook that stops the scroll", "Threads should tell a story with a payoff", "Single tweets under 200 chars get more engagement"],
      };

    case "youtube-description":
      return {
        icon: "🎬",
        accentColor: "text-red-600 dark:text-red-400",
        badgeColor: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
        barColor: "bg-red-500",
        actionLabel: "Write Description",
        outputLabel: "YouTube Description",
        description: "Write SEO-optimised YouTube descriptions that rank and convert.",
        fields: [
          { key: "videoTitle", label: "Video title", placeholder: "How to Build a SaaS in 30 Days with Next.js", type: "input", required: true },
          { key: "keyPoints", label: "Key topics covered in the video", placeholder: "1. Setting up Next.js\n2. Database design\n3. Auth with Clerk\n4. Deploying to Vercel", type: "textarea", rows: 4, required: true },
          { key: "keyword", label: "Target keyword", placeholder: "build saas nextjs", type: "input" },
        ],
        tips: ["First 2 lines show in search — make them count", "Include timestamps placeholder in your notes", "Target keyword should appear naturally in the first sentence"],
      };

    case "meta-description":
      return {
        icon: "🔍",
        accentColor: "text-emerald-600 dark:text-emerald-400",
        badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
        barColor: "bg-emerald-500",
        actionLabel: "Write Meta Description",
        outputLabel: "Meta Description",
        description: "Write compelling 155-character meta descriptions that improve CTR from search.",
        fields: [
          { key: "pageTitle", label: "Page title", placeholder: "How to Validate JSON in Your Browser — QuickFnd Guide", type: "input", required: true },
          { key: "topic", label: "What the page is about", placeholder: "A step-by-step guide to formatting and validating JSON using free browser tools", type: "textarea", rows: 2, required: true },
          { key: "keyword", label: "Primary keyword", placeholder: "validate json online", type: "input" },
        ],
        tips: ["Keep results under 155 characters for Google", "Include the target keyword naturally", "Start with an action verb for higher CTR"],
      };

    case "resume-bullets":
      return {
        icon: "🎯",
        accentColor: "text-violet-600 dark:text-violet-400",
        badgeColor: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
        barColor: "bg-violet-500",
        actionLabel: "Write Bullet Points",
        outputLabel: "Resume Bullet Points",
        description: "Turn vague responsibilities into powerful resume bullets with impact and numbers.",
        fields: [
          { key: "role", label: "Job title", placeholder: "Senior Software Engineer", type: "input", required: true },
          { key: "responsibilities", label: "What did you do? (be honest, we'll make it shine)", placeholder: "Worked on the payments system, helped onboard new engineers, wrote tests, improved API response times...", type: "textarea", rows: 5, required: true },
          { key: "achievements", label: "Any measurable results?", placeholder: "Reduced API latency by 40%, mentored 3 junior devs, processed $2M/month in payments...", type: "textarea", rows: 3 },
        ],
        tips: ["Include any numbers — revenue, users, time saved, team size", "Vague inputs get vague bullets — be specific about what you actually did", "Each bullet should start with a past-tense action verb"],
      };

    case "meeting-summary":
      return {
        icon: "📅",
        accentColor: "text-cyan-600 dark:text-cyan-400",
        badgeColor: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
        barColor: "bg-cyan-500",
        actionLabel: "Summarize Meeting",
        outputLabel: "Meeting Summary",
        description: "Extract decisions, action items, and key points from raw meeting notes.",
        fields: [
          { key: "notes", label: "Meeting notes or transcript", placeholder: "Paste your raw meeting notes, voice memo transcript, or bullet points...", type: "textarea", rows: 8, required: true },
          { key: "meetingType", label: "Meeting type", placeholder: "", type: "select", options: ["Team standup", "Client call", "Strategy/planning", "1-on-1", "All-hands", "Other"] },
        ],
        tips: ["Include names if you want owners assigned to action items", "Raw transcripts work — the AI cleans them up", "More notes = better summary"],
      };

    case "content-ideas":
      return {
        icon: "💡",
        accentColor: "text-yellow-600 dark:text-yellow-500",
        badgeColor: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        barColor: "bg-yellow-500",
        actionLabel: "Generate Ideas",
        outputLabel: "Content Ideas",
        description: "Generate unique, engaging content ideas for blogs, social media, and marketing.",
        fields: [
          { key: "niche", label: "Topic or niche", placeholder: "SaaS marketing for developer tools", type: "input", required: true },
          { key: "platform", label: "Platform", placeholder: "", type: "select", options: ["Blog", "Twitter/X", "LinkedIn", "YouTube", "Newsletter", "Any"] },
          { key: "audience", label: "Target audience", placeholder: "Technical founders and indie hackers", type: "input" },
          { key: "count", label: "How many ideas?", placeholder: "", type: "select", options: ["5 ideas", "10 ideas", "15 ideas"] },
        ],
        tips: ["Narrower niches produce more specific ideas", "Mention your audience for better targeting", "Specify the platform for format-appropriate ideas"],
      };

    case "seo-optimize":
      return {
        icon: "📈",
        accentColor: "text-green-600 dark:text-green-400",
        badgeColor: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
        barColor: "bg-green-500",
        actionLabel: "Optimize Content",
        outputLabel: "SEO-Optimized Version",
        description: "Optimize your content for search engines with keyword placement and structure.",
        fields: [
          { key: "content", label: "Your content", placeholder: "Paste the article or page content you want optimized...", type: "textarea", rows: 8, required: true },
          { key: "keyword", label: "Target keyword", placeholder: "online json formatter", type: "input", required: true },
          { key: "goal", label: "What to improve?", placeholder: "", type: "select", options: ["Keyword placement", "Heading structure", "Full rewrite for SEO", "Meta + headings only"] },
        ],
        tips: ["Include the full text for best optimization", "One primary keyword per page performs best", "The AI will suggest H2/H3 structure and LSI keywords"],
      };

    default:
      return {
        icon: "✨",
        accentColor: "text-q-primary",
        badgeColor: "border-q-border bg-q-bg text-q-muted",
        barColor: "bg-q-primary",
        actionLabel: "Generate",
        outputLabel: "Result",
        description: `Use ${itemName} to generate, improve, or transform content.`,
        fields: [
          { key: "text", label: "Your input", placeholder: "Describe what you want the AI to generate, improve, or transform...", type: "textarea", rows: 6, required: true },
        ],
        tips: ["Be specific about your goal", "Add formatting requirements for structured output"],
      };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function toConfig(value: unknown): AIToolConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as AIToolConfig;
}

function inferTask(item: PublicContentItem, config: AIToolConfig): string {
  const t = normalize(config.task);
  if (t && !["", "text-generation", "text generation", "general", "default"].includes(t)) return t;
  const slug = normalize(item.slug);
  const name = normalize(item.name);
  if (slug.includes("cold-email")) return "cold-email";
  if (slug.includes("email") || name.includes("email")) return "email";
  if (slug.includes("outline") || name.includes("outline")) return "outline";
  if (slug.includes("prompt") || name.includes("prompt")) return "prompt-generator";
  if (slug.includes("summariz") || slug.includes("summary")) return "summarize";
  if (slug.includes("grammar")) return "grammar-check";
  if (slug.includes("paraphras")) return "paraphrase";
  if (slug.includes("rewrite") || name.includes("rewrite")) return "rewrite";
  if (slug.includes("cover-letter")) return "cover-letter";
  if (slug.includes("linkedin")) return "linkedin-bio";
  if (slug.includes("product-description")) return "product-description";
  if (slug.includes("tweet") || slug.includes("twitter")) return "tweet";
  if (slug.includes("youtube-description")) return "youtube-description";
  if (slug.includes("meta-description")) return "meta-description";
  if (slug.includes("resume") || slug.includes("bullet")) return "resume-bullets";
  if (slug.includes("meeting")) return "meeting-summary";
  if (slug.includes("content-idea")) return "content-ideas";
  if (slug.includes("seo-content") || slug.includes("seo-optim")) return "seo-optimize";
  return "text-generation";
}

async function copyText(value: string) {
  try { await navigator.clipboard.writeText(value); } catch { /* ignore */ }
}

function buildInputFromFields(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, " $1")}: ${v}`)
    .join("\n");
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function AIToolRenderer({ item }: { item: PublicContentItem }) {
  const config = useMemo(() => toConfig(item.engine_config), [item.engine_config]);
  const task = useMemo(() => inferTask(item, config), [item, config]);
  const identity = useMemo(() => getTaskIdentity(task, item.name), [task, item.name]);

  // Dynamic form state
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of identity.fields) {
      if (f.type === "select" && f.options?.length) init[f.key] = f.options[0];
      else init[f.key] = "";
    }
    return init;
  });

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  const updateField = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
    // Track char count for primary field
    const primaryField = identity.fields.find(f => f.required);
    if (primaryField && key === primaryField.key) setCharCount(value.length);
  };

  const canRun = identity.fields
    .filter(f => f.required)
    .every(f => (fieldValues[f.key] || "").trim().length > 0);

  const handleRun = async () => {
    if (!canRun || loading) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const input = buildInputFromFields(fieldValues);
      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          config: {
            ...config,
            task,
            tone: fieldValues.tone || config.tone || "professional",
            audience: fieldValues.audience || fieldValues.customer || "",
            length: fieldValues.length || fieldValues.format || "medium",
          },
        }),
      });

      const data: RunResponse = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setOutput(data.output || "");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const init: Record<string, string> = {};
    for (const f of identity.fields) {
      if (f.type === "select" && f.options?.length) init[f.key] = f.options[0];
      else init[f.key] = "";
    }
    setFieldValues(init);
    setOutput("");
    setError("");
    setCharCount(0);
  };

  return (
    <section className={cls.card}>
      {/* Header with accent bar and tool identity */}
      <div className="mb-6">
        <div className={cls.accentBar(identity.barColor)} />
        <div className="mt-4 flex items-start gap-3">
          <span className="text-2xl">{identity.icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-q-text md:text-2xl">{item.name}</h2>
            <p className="mt-1 text-sm text-q-muted">{identity.description}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={cls.badge(identity.badgeColor)}>AI Powered</span>
          {task !== "text-generation" && (
            <span className={cls.badge("border-q-border bg-q-bg text-q-muted")}>
              {task.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          )}
        </div>
      </div>

      {/* Main layout: inputs + output */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left: Structured input form */}
        <div className="space-y-4">
          {identity.fields.map(field => (
            <div key={field.key} className={cls.panel}>
              <label className={cls.label}>
                {field.label}
                {field.required && <span className="ml-1 text-red-400">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  value={fieldValues[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 4}
                  className={cls.textarea}
                  style={{ minHeight: `${(field.rows || 4) * 28}px` }}
                />
              ) : field.type === "select" && field.options ? (
                <div className="flex flex-wrap gap-2">
                  {field.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateField(field.key, opt)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        fieldValues[field.key] === opt
                          ? `border-transparent bg-q-primary text-white`
                          : "border-q-border bg-q-card text-q-muted hover:text-q-text hover:border-q-text/20"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={fieldValues[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={cls.input}
                />
              )}
            </div>
          ))}

          {/* Character count for primary field */}
          {charCount > 0 && (
            <div className="text-xs text-q-muted text-right">{charCount} characters</div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={handleRun} disabled={!canRun || loading} className={cls.primaryBtn}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </span>
              ) : (
                config.buttonLabel || identity.actionLabel
              )}
            </button>
            <button onClick={() => copyText(output)} disabled={!output} className={cls.secondaryBtn}>
              Copy
            </button>
            <button onClick={handleReset} className={cls.secondaryBtn}>
              Reset
            </button>
          </div>

          {/* Output section */}
          {(output || loading || error) && (
            <div className={cls.outputShell}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className={cls.sectionTitle}>{config.outputLabel || identity.outputLabel}</div>
                </div>
                <span className={cls.badge(
                  loading
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : error
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                )}>
                  {loading ? "Generating" : error ? "Error" : "Ready"}
                </span>
              </div>

              {loading ? (
                <div className={`${cls.outputInner} space-y-3`}>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-q-border/60" />
                  <div className="h-4 w-full animate-pulse rounded bg-q-border/60" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-q-border/60" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-q-border/60" />
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={cls.outputInner}>{output}</div>
                  <div className="flex items-center justify-between text-xs text-q-muted">
                    <span>{output.length} characters · ~{Math.ceil(output.split(/\s+/).length)} words</span>
                    <button onClick={() => copyText(output)} className={cls.copyBtn}>
                      Copy to clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!output && !loading && !error && (
            <div className={cls.outputShell}>
              <div className="mb-4">
                <div className={cls.sectionTitle}>{config.outputLabel || identity.outputLabel}</div>
              </div>
              <div className={`${cls.outputInner} text-q-muted/60`}>
                Fill in the fields above and click &ldquo;{config.buttonLabel || identity.actionLabel}&rdquo; to generate your result.
              </div>
            </div>
          )}
        </div>

        {/* Right: Tips sidebar */}
        <aside className="space-y-4">
          {/* Quick tips */}
          <div className={cls.panel}>
            <div className={cls.sectionTitle}>Tips for better results</div>
            <ul className="mt-3 space-y-2.5">
              {identity.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-q-muted">
                  <span className={`mt-0.5 flex-shrink-0 ${identity.accentColor}`}>→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* What this tool does */}
          <div className={cls.panel}>
            <div className={cls.sectionTitle}>What this tool does</div>
            <p className="mt-3 text-sm leading-relaxed text-q-muted">
              {item.description}
            </p>
          </div>

          {/* Powered by */}
          <div className={cls.panel}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <div className="text-sm font-medium text-q-text">Powered by AI</div>
                <div className="text-xs text-q-muted">Results are AI-generated. Always review before using.</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}