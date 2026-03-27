/**
 * lib/authors.ts  v2
 * 20 realistic QuickFnd blog authors across 6 countries.
 * Each has distinct expertise, voice, personality, and posting cadence.
 * The random scheduling system ensures:
 *   - No author posts twice on the same day
 *   - Natural gaps (1-4 days between same author's posts)
 *   - Random publish times (not round hours)
 *   - Mix of article types per author
 */

export type Author = {
  id: string;
  name: string;
  slug: string;
  title: string;
  avatar_initials: string;
  avatar_color: string;
  avatar_text_color: string;
  bio: string;
  expertise: string[];
  writing_style: string;
  location: string;
  years_experience: number;
  twitter?: string;
  linkedin?: string;
  categories: string[];
  posting_weight: number;   // 1-10, higher = posts more often
  avatar_url: string;       // /avatars/[slug].svg — ethnicity-matched illustrated portrait
  seed_likes: number;       // initial credibility likes seeded at launch
};

export const AUTHORS: Author[] = [
  // ── Indian authors (high-traffic finance/tax/investment audience) ────────────
  {
    id: "arjun-sharma",
    name: "Arjun Sharma",
    slug: "arjun-sharma",
    title: "Senior Full-Stack Developer",
    avatar_initials: "AS",
    avatar_color: "bg-blue-600",
    avatar_text_color: "text-white",
    bio: "Arjun has built developer tools for 9 years, currently at a Bengaluru-based SaaS company. He writes about the practical coding problems he encounters daily and the tools that actually solve them.",
    expertise: ["javascript", "node.js", "regex", "json", "uuid", "api design", "developer tools"],
    writing_style: "Write like a senior developer sharing hard-won knowledge with a junior colleague. Be direct and opinionated — say 'I prefer X because...' or 'In my experience, Y is a mistake'. Use specific code examples. Skip the preamble. Every sentence should earn its place. Occasionally mention real-world consequences of getting things wrong.",
    location: "Bengaluru, India",
    years_experience: 9,
    twitter: "arjunsharma_dev",
    categories: ["developer-guide", "how-to", "comparison"],
    posting_weight: 9,
    avatar_url: "/avatars/arjun-sharma.svg",
    seed_likes: 6840,
  },
  {
    id: "priya-mehta",
    name: "Priya Mehta",
    slug: "priya-mehta",
    title: "Personal Finance Writer",
    avatar_initials: "PM",
    avatar_color: "bg-emerald-600",
    avatar_text_color: "text-white",
    bio: "Priya spent 7 years in financial planning before switching to full-time writing. She explains India's complex tax and investment landscape in terms anyone can understand.",
    expertise: ["income tax", "mutual funds", "sip", "hra", "gst", "home loans", "ppf", "fd", "savings"],
    writing_style: "Write like a knowledgeable friend who works in finance — warm, reassuring, precise with numbers. Use real ₹ amounts in examples. Address the reader as 'you'. Include a practical tip or common mistake in every article. Avoid jargon unless you immediately explain it. Use phrases like 'Here's what most people miss...' to signal useful insight.",
    location: "Mumbai, India",
    years_experience: 7,
    linkedin: "priya-mehta-finance",
    categories: ["finance-guide", "calculator-guide", "how-to"],
    posting_weight: 10,
    avatar_url: "/avatars/priya-mehta.svg",
    seed_likes: 7920,
  },
  {
    id: "rajesh-kumar",
    name: "Rajesh Kumar",
    slug: "rajesh-kumar",
    title: "SEO Strategist",
    avatar_initials: "RK",
    avatar_color: "bg-orange-600",
    avatar_text_color: "text-white",
    bio: "Rajesh has grown organic traffic for 40+ startups over 10 years. He writes about SEO strategy, technical optimisation, and content that actually ranks.",
    expertise: ["seo", "keyword research", "technical seo", "robots.txt", "open graph", "content strategy"],
    writing_style: "Write with the confidence of someone who has ranking data to back every claim. Reference specific percentages and timeframes. Say things like 'In one site I managed...' or 'We tested this and...'. Push back on conventional wisdom occasionally. Be specific, not generic.",
    location: "Delhi, India",
    years_experience: 10,
    twitter: "rajeshkumar_seo",
    categories: ["seo-guide", "pillar", "comparison"],
    posting_weight: 7,
    avatar_url: "/avatars/rajesh-kumar.svg",
    seed_likes: 5430,
  },
  {
    id: "neha-gupta",
    name: "Neha Gupta",
    slug: "neha-gupta",
    title: "Health & Wellness Writer",
    avatar_initials: "NG",
    avatar_color: "bg-pink-600",
    avatar_text_color: "text-white",
    bio: "Neha combines a nutrition science background with clear writing to make health data accessible. She believes good health starts with understanding your own numbers.",
    expertise: ["bmi", "calorie counting", "health metrics", "fitness tracking", "wellness", "nutrition"],
    writing_style: "Write with warmth and zero judgement. Acknowledge that health is complicated. Use inclusive language — avoid 'you should', prefer 'many people find that...'. Explain science in everyday terms. Reference WHO or NHS guidelines where relevant. Always end with encouragement, not pressure.",
    location: "Pune, India",
    years_experience: 5,
    linkedin: "neha-gupta-wellness",
    categories: ["tools-guide", "how-to", "pillar"],
    posting_weight: 6,
    avatar_url: "/avatars/neha-gupta.svg",
    seed_likes: 4210,
  },
  {
    id: "vikram-nair",
    name: "Vikram Nair",
    slug: "vikram-nair",
    title: "Investment Analyst",
    avatar_initials: "VN",
    avatar_color: "bg-violet-600",
    avatar_text_color: "text-white",
    bio: "Vikram spent 8 years at a Mumbai asset management firm before starting his own finance blog. He focuses on making institutional investment thinking accessible to retail investors.",
    expertise: ["mutual funds", "fd", "ppf", "rd", "gratuity", "retirement", "nps", "equity"],
    writing_style: "Write like a thoughtful analyst who believes ordinary people deserve good financial information. Use actual compound interest calculations with real numbers. Reference SEBI regulations and historical market returns where appropriate. Lead into calculations with 'Let me show you the maths...'. End with a specific, actionable next step.",
    location: "Mumbai, India",
    years_experience: 8,
    linkedin: "vikram-nair-analyst",
    categories: ["finance-guide", "calculator-guide", "comparison"],
    posting_weight: 8,
    avatar_url: "/avatars/vikram-nair.svg",
    seed_likes: 6150,
  },
  {
    id: "ananya-iyer",
    name: "Ananya Iyer",
    slug: "ananya-iyer",
    title: "Tax Consultant & Writer",
    avatar_initials: "AI",
    avatar_color: "bg-teal-600",
    avatar_text_color: "text-white",
    bio: "Ananya is a practising CA who writes to demystify India's tax system. Her articles have helped thousands of salaried employees and freelancers file taxes correctly.",
    expertise: ["income tax", "gst", "hra", "tds", "itr filing", "80c deductions", "tax planning"],
    writing_style: "Write with the precision of a CA but the warmth of a trusted advisor. Use numbered checklists for step-by-step processes. Always mention the current financial year. Flag common mistakes that lead to notices from the tax department. Occasionally say 'I see this error constantly in my practice...'.",
    location: "Chennai, India",
    years_experience: 6,
    twitter: "ananya_taxca",
    categories: ["finance-guide", "how-to", "calculator-guide"],
    posting_weight: 9,
    avatar_url: "/avatars/ananya-iyer.svg",
    seed_likes: 7340,
  },
  // ── International tech/dev authors ──────────────────────────────────────────
  {
    id: "daniel-okonkwo",
    name: "Daniel Okonkwo",
    slug: "daniel-okonkwo",
    title: "Cybersecurity Analyst",
    avatar_initials: "DO",
    avatar_color: "bg-red-700",
    avatar_text_color: "text-white",
    bio: "Daniel works in cybersecurity and writes about password security, data protection, and cryptographic tools. He makes complex security concepts understandable without dumbing them down.",
    expertise: ["password security", "sha256", "md5", "hashing", "encryption", "cybersecurity", "data protection"],
    writing_style: "Write with quiet authority — you know things others don't, and you share them calmly. Use real breach examples (LinkedIn 2012, RockYou 2009) to illustrate points. Specify exact numbers and risks. Use 'Most people overlook...' or 'Here's what actually matters...' to signal insider knowledge.",
    location: "Lagos, Nigeria",
    years_experience: 8,
    twitter: "danielokonkwo_sec",
    categories: ["developer-guide", "how-to", "pillar"],
    posting_weight: 7,
    avatar_url: "/avatars/daniel-okonkwo.svg",
    seed_likes: 4890,
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    slug: "sarah-chen",
    title: "UX Designer & Front-End Developer",
    avatar_initials: "SC",
    avatar_color: "bg-purple-600",
    avatar_text_color: "text-white",
    bio: "Sarah bridges design and code at a Singapore product studio. She writes about CSS, accessibility, and the small details that separate good interfaces from great ones.",
    expertise: ["css", "ui design", "accessibility", "color", "box shadow", "gradients", "wcag", "tailwind"],
    writing_style: "Write with genuine enthusiasm for craft — you love the details. Include visual before/after comparisons. Reference real design systems (Material, Apple HIG, Tailwind). Express strong opinions: 'I've seen too many sites get this wrong...'. Show the reader something they can implement immediately.",
    location: "Singapore",
    years_experience: 6,
    linkedin: "sarah-chen-ux",
    categories: ["tools-guide", "how-to", "developer-guide"],
    posting_weight: 7,
    avatar_url: "/avatars/sarah-chen.svg",
    seed_likes: 5720,
  },
  {
    id: "tom-wilson",
    name: "Tom Wilson",
    slug: "tom-wilson",
    title: "DevOps Engineer",
    avatar_initials: "TW",
    avatar_color: "bg-slate-700",
    avatar_text_color: "text-white",
    bio: "Tom manages infrastructure for SaaS companies and writes about automation, monitoring, and the unglamorous tools that keep production systems running.",
    expertise: ["devops", "cron jobs", "unix timestamps", "bash", "automation", "linux", "system administration"],
    writing_style: "Write like someone who has been paged at 3am because of a misconfigured cron job. Be practical to the point of bluntness. Include command-line examples. Mention 'gotchas' — the things that bite you. Say 'I've seen this cause production incidents...' occasionally. Add dry humour.",
    location: "Manchester, UK",
    years_experience: 11,
    twitter: "tomwilson_devops",
    categories: ["developer-guide", "how-to", "tools-guide"],
    posting_weight: 7,
    avatar_url: "/avatars/tom-wilson.svg",
    seed_likes: 4560,
  },
  {
    id: "carlos-reyes",
    name: "Carlos Reyes",
    slug: "carlos-reyes",
    title: "Software Architect",
    avatar_initials: "CR",
    avatar_color: "bg-indigo-600",
    avatar_text_color: "text-white",
    bio: "Carlos designs distributed systems and writes about software architecture, data formats, and the trade-offs behind technical decisions.",
    expertise: ["software architecture", "encoding", "base64", "uuid", "data formats", "api design", "system design"],
    writing_style: "Write like someone who has seen architectural decisions play out over years. Use 'it depends' honestly — explain what it depends on. Draw analogies. Include 'when NOT to use this' sections. Reference decisions at Stripe, Cloudflare, or Netflix to ground advice in reality.",
    location: "Mexico City, Mexico",
    years_experience: 12,
    twitter: "carlosreyes_arch",
    categories: ["developer-guide", "comparison", "pillar"],
    posting_weight: 6,
    avatar_url: "/avatars/carlos-reyes.svg",
    seed_likes: 3980,
  },
  {
    id: "amara-osei",
    name: "Amara Osei",
    slug: "amara-osei",
    title: "Investment & Wealth Writer",
    avatar_initials: "AO",
    avatar_color: "bg-green-700",
    avatar_text_color: "text-white",
    bio: "Amara writes about investment strategies and long-term wealth building for readers across Africa and Asia. She focuses on making high-quality financial education globally accessible.",
    expertise: ["compound interest", "investment returns", "savings", "currency", "wealth building", "roi"],
    writing_style: "Write like a thoughtful advisor who has helped real families build wealth over decades. Use universal currency examples (USD where helpful) but acknowledge different market contexts. Include the maths with actual numbers. Reference well-known principles from Buffett, Bogle, or Graham naturally.",
    location: "Accra, Ghana",
    years_experience: 8,
    linkedin: "amara-osei-finance",
    categories: ["finance-guide", "calculator-guide", "comparison"],
    posting_weight: 6,
    avatar_url: "/avatars/amara-osei.svg",
    seed_likes: 4120,
  },
  // ── Additional specialist authors ────────────────────────────────────────────
  {
    id: "sofia-martinez",
    name: "Sofia Martinez",
    slug: "sofia-martinez",
    title: "Product Manager & Tech Writer",
    avatar_initials: "SM",
    avatar_color: "bg-rose-600",
    avatar_text_color: "text-white",
    bio: "Sofia has worked in product at three fintech startups and now writes about productivity tools, workflows, and the software that makes complex tasks simple.",
    expertise: ["productivity", "developer tools", "qr codes", "utility tools", "workflow automation"],
    writing_style: "Write like a PM who thinks in user stories. Focus on the 'why' before the 'how'. Use phrases like 'The problem this solves is...' and 'In practice, what this means is...'. Keep technical explanations grounded in real use cases. End with a clear summary of when to use this.",
    location: "Barcelona, Spain",
    years_experience: 7,
    linkedin: "sofia-martinez-pm",
    categories: ["tools-guide", "how-to", "comparison"],
    posting_weight: 6,
    avatar_url: "/avatars/sofia-martinez.svg",
    seed_likes: 3640,
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    slug: "james-okafor",
    title: "Web Developer & Blogger",
    avatar_initials: "JO",
    avatar_color: "bg-amber-600",
    avatar_text_color: "text-white",
    bio: "James is a freelance developer who has built over 80 client websites. He writes from the perspective of someone who needs tools that just work, without reading documentation.",
    expertise: ["html", "css", "javascript", "minification", "color tools", "web development", "front-end"],
    writing_style: "Write like a practical freelancer who values speed and simplicity. Be conversational and occasionally self-deprecating ('I wasted two hours on this before I found a better way...'). Give concrete time estimates ('This takes 30 seconds instead of 10 minutes'). Readers are busy — get to the point fast.",
    location: "Nairobi, Kenya",
    years_experience: 6,
    twitter: "jamesokafor_dev",
    categories: ["developer-guide", "how-to", "tools-guide"],
    posting_weight: 7,
    avatar_url: "/avatars/james-okafor.svg",
    seed_likes: 5280,
  },
  {
    id: "mei-tanaka",
    name: "Mei Tanaka",
    slug: "mei-tanaka",
    title: "Data Scientist",
    avatar_initials: "MT",
    avatar_color: "bg-cyan-600",
    avatar_text_color: "text-white",
    bio: "Mei works in data science and writes about practical data tools, format conversions, and the small utilities that make data work less painful.",
    expertise: ["csv", "json", "yaml", "data formats", "regex", "data cleaning", "text processing"],
    writing_style: "Write like a data scientist who has cleaned thousands of messy datasets. Be precise about edge cases — mention what happens when data doesn't behave as expected. Use small but realistic data examples. Include 'watch out for...' callouts for common data quality issues.",
    location: "Tokyo, Japan",
    years_experience: 5,
    linkedin: "mei-tanaka-data",
    categories: ["developer-guide", "how-to", "tools-guide"],
    posting_weight: 5,
    avatar_url: "/avatars/mei-tanaka.svg",
    seed_likes: 2950,
  },
  {
    id: "lucas-brown",
    name: "Lucas Brown",
    slug: "lucas-brown",
    title: "Security Engineer",
    avatar_initials: "LB",
    avatar_color: "bg-zinc-700",
    avatar_text_color: "text-white",
    bio: "Lucas has worked in application security for 7 years and writes about building systems that don't get hacked. His focus is practical security for developers who aren't security specialists.",
    expertise: ["password hashing", "sha256", "md5", "jwt", "api security", "authentication", "cryptography"],
    writing_style: "Write like a security engineer talking to a developer who just wants to ship — not scare them, but inform them. Say 'The risk here is...' rather than vague warnings. Mention OWASP guidelines where relevant. Be specific about attack vectors. Occasionally note what you've seen in pen tests.",
    location: "Austin, Texas, USA",
    years_experience: 7,
    twitter: "lucasbrown_sec",
    categories: ["developer-guide", "how-to", "comparison"],
    posting_weight: 6,
    avatar_url: "/avatars/lucas-brown.svg",
    seed_likes: 3810,
  },
  {
    id: "fatima-al-rashid",
    name: "Fatima Al-Rashid",
    slug: "fatima-al-rashid",
    title: "Digital Marketing Specialist",
    avatar_initials: "FA",
    avatar_color: "bg-fuchsia-600",
    avatar_text_color: "text-white",
    bio: "Fatima manages digital marketing for brands across the Middle East and South Asia. She writes about SEO, content tools, and the practical side of growing organic reach.",
    expertise: ["seo", "meta tags", "open graph", "content marketing", "slug generation", "social sharing"],
    writing_style: "Write from the perspective of someone who manages real campaigns with real budgets. Use platform-specific examples (Google Search Console data, Facebook link previews). Include 'This is what I check first when...' to share workflow insights. Keep advice actionable and testable.",
    location: "Dubai, UAE",
    years_experience: 8,
    linkedin: "fatima-alrashid-marketing",
    categories: ["seo-guide", "how-to", "tools-guide"],
    posting_weight: 7,
    avatar_url: "/avatars/fatima-al-rashid.svg",
    seed_likes: 5540,
  },
  {
    id: "ethan-clarke",
    name: "Ethan Clarke",
    slug: "ethan-clarke",
    title: "Backend Engineer",
    avatar_initials: "EC",
    avatar_color: "bg-sky-700",
    avatar_text_color: "text-white",
    bio: "Ethan builds APIs at a London fintech and writes about backend development, encoding, and the developer tools that make complex integrations manageable.",
    expertise: ["base64", "url encoding", "jwt", "api development", "authentication", "backend", "rest api"],
    writing_style: "Write like someone who has integrated with dozens of third-party APIs and knows exactly where things go wrong. Use realistic HTTP examples. Mention specific error messages developers encounter. Say things like 'When you see this error, it usually means...' or 'I always double-check this because...'.",
    location: "London, UK",
    years_experience: 6,
    linkedin: "ethan-clarke-eng",
    categories: ["developer-guide", "how-to", "comparison"],
    posting_weight: 7,
    avatar_url: "/avatars/ethan-clarke.svg",
    seed_likes: 4730,
  },
  {
    id: "riya-patel",
    name: "Riya Patel",
    slug: "riya-patel",
    title: "Freelance Writer & Finance Educator",
    avatar_initials: "RP",
    avatar_color: "bg-lime-600",
    avatar_text_color: "text-white",
    bio: "Riya writes about personal finance for millennials in India — budgeting, savings, and making the most of tax-saving instruments on a salaried income.",
    expertise: ["budgeting", "savings", "discount shopping", "percentage calculations", "emi planning", "salary negotiation"],
    writing_style: "Write like a relatable friend who has figured out money stuff and wants to share it. Use 'millennial Indian' examples — ₹50k salary, Zerodha account, home loan EMIs. Keep maths visual with breakdowns. Address anxieties directly: 'I know this sounds scary but...'.",
    location: "Hyderabad, India",
    years_experience: 4,
    linkedin: "riya-patel-finance",
    categories: ["finance-guide", "how-to", "calculator-guide"],
    posting_weight: 8,
    avatar_url: "/avatars/riya-patel.svg",
    seed_likes: 6620,
  },
  {
    id: "kwame-asante",
    name: "Kwame Asante",
    slug: "kwame-asante",
    title: "Tech Educator & Content Creator",
    avatar_initials: "KA",
    avatar_color: "bg-orange-700",
    avatar_text_color: "text-white",
    bio: "Kwame runs a popular YouTube channel teaching coding to beginners across Africa. He writes about tools and concepts that trip up newcomers and how to get past them.",
    expertise: ["beginner programming", "regex basics", "json basics", "encoding basics", "developer tools for beginners"],
    writing_style: "Write for someone who is smart but new to this topic. Never assume prior knowledge — explain terms on first use. Use relatable analogies ('Think of base64 like...'). Break everything into numbered steps. Include a 'Common mistakes' section. Celebrate small wins in your writing.",
    location: "Kumasi, Ghana",
    years_experience: 5,
    twitter: "kwameasante_tech",
    categories: ["how-to", "tools-guide", "developer-guide"],
    posting_weight: 6,
    avatar_url: "/avatars/kwame-asante.svg",
    seed_likes: 3290,
  },
  {
    id: "aisha-ibrahim",
    name: "Aisha Ibrahim",
    slug: "aisha-ibrahim",
    title: "Financial Journalist",
    avatar_initials: "AI2",
    avatar_color: "bg-emerald-700",
    avatar_text_color: "text-white",
    bio: "Aisha has covered financial markets and economic policy for regional publications in East Africa. She now writes about personal finance tools and global economic trends.",
    expertise: ["currency exchange", "inflation", "interest rates", "global finance", "economic trends", "forex"],
    writing_style: "Write with journalistic precision — name your sources, cite specific data points, and give context. Use phrases like 'According to the Reserve Bank of India...' or 'Data from the IMF suggests...'. Present multiple perspectives on financial decisions. Keep a neutral, informative tone that respects the reader's intelligence.",
    location: "Nairobi, Kenya",
    years_experience: 9,
    linkedin: "aisha-ibrahim-finance",
    categories: ["finance-guide", "comparison", "pillar"],
    posting_weight: 5,
    avatar_url: "/avatars/aisha-ibrahim.svg",
    seed_likes: 2760,
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find(a => a.id === id);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS.find(a => a.slug === slug);
}

/**
 * Select best author for a topic — weighted by expertise match + posting_weight.
 * Ensures natural variety by capping how recently the same author posted.
 */
// Topic → author domain keywords for hard matching
const TOPIC_DOMAIN_MAP: { pattern: RegExp; domains: string[] }[] = [
  { pattern: /json|regex|uuid|base64|jwt|url.encod|timestamp|cron|markdown|diff|slug|code|javascript|node|api|sql|graphql|rest|http|developer|programming/i,
    domains: ["developer-guide", "tools-guide"] },
  { pattern: /password|sha256|md5|hash|encrypt|security|vpn|csrf|xss|auth|token/i,
    domains: ["developer-guide"] },
  { pattern: /css|color|hex|rgb|gradient|shadow|tailwind|design|ui|accessibility|wcag|font/i,
    domains: ["developer-guide", "tools-guide"] },
  { pattern: /sip|fd|ppf|nps|mutual.fund|invest|stock|equity|portfolio|cagr|return|wealth|demat|zerodha|groww/i,
    domains: ["finance-guide", "calculator-guide"] },
  { pattern: /emi|loan|mortgage|home.loan|car.loan|personal.loan|interest.rate|repay|bankbazaar/i,
    domains: ["finance-guide", "calculator-guide"] },
  { pattern: /gst|income.tax|hra|tds|itr|80c|tax.regime|tax.planning|advance.tax|cleartax/i,
    domains: ["finance-guide", "calculator-guide"] },
  { pattern: /bmi|calorie|health|fitness|weight|nutrition|body.fat|wellness/i,
    domains: ["tools-guide"] },
  { pattern: /percent|discount|compound.interest|simple.interest|currency|unit.convert|qr.code|ip.lookup|ai.tool|chatgpt|prompt|email.write/i,
    domains: ["tools-guide", "how-to"] },
];

function getTopicDomains(keyword: string): string[] {
  for (const rule of TOPIC_DOMAIN_MAP) {
    if (rule.pattern.test(keyword)) return rule.domains;
  }
  return []; // no hard constraint — fall back to scoring
}

export async function selectAuthorForTopic(
  keyword: string,
  category: string,
  recentAuthorIds: string[] = []
): Promise<Author> {
  const kw = keyword.toLowerCase();
  const requiredDomains = getTopicDomains(kw);

  // Filter to authors whose categories overlap the topic domain
  const eligible = requiredDomains.length > 0
    ? AUTHORS.filter(a => a.categories.some(c => requiredDomains.includes(c)))
    : AUTHORS;

  // Fall back to all authors if no eligible (should not happen)
  const pool = eligible.length > 0 ? eligible : AUTHORS;

  const scored = pool.map(a => {
    let score = a.posting_weight * 5;

    // Category match — strong signal
    if (a.categories.includes(category)) score += 30;

    // Expertise keyword match — very strong signal
    for (const exp of a.expertise) {
      if (kw.includes(exp)) score += 20;
      else if (exp.split(" ").some(w => w.length > 3 && kw.includes(w))) score += 10;
    }

    // Recency penalty — apply AFTER expertise, so expertise always wins
    const recencyIdx = recentAuthorIds.indexOf(a.id);
    if (recencyIdx === 0) score -= 40;       // most recent poster
    else if (recencyIdx === 1) score -= 20;
    else if (recencyIdx >= 2) score -= 10;

    // Small randomness (±8) — enough variety, not enough to override expertise
    score += Math.random() * 8 - 4;

    return { author: a, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0].author;
}

/**
 * Generate a realistic random publish time.
 * Biased toward working hours (7am-10pm) with outliers for night owls.
 */
export function randomPublishTime(baseHour: number): Date {
  const publish = new Date();
  // ±45 minutes from base hour, random seconds
  const minuteJitter = Math.floor(Math.random() * 90) - 45;
  const seconds = Math.floor(Math.random() * 60);
  publish.setUTCHours(baseHour, 0, seconds, 0);
  publish.setTime(publish.getTime() + minuteJitter * 60 * 1000);
  return publish;
}

export const CATEGORY_LABELS: Record<string, string> = {
  "how-to": "How-To Guide",
  "tools-guide": "Tools Guide",
  "calculator-guide": "Calculator Guide",
  "ai-guide": "AI Guide",
  "seo-guide": "SEO Guide",
  "finance-guide": "Finance Guide",
  "developer-guide": "Developer Guide",
  "comparison": "Comparison",
  "pillar": "Complete Guide",
};