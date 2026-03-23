import type { PublicContentItem, PublicTable } from "@/lib/content-pages";
import { getCategoryLabel, getCategoryPath } from "@/lib/content-pages";
import { getSiteUrl } from "@/lib/site-url";

type BreadcrumbItem = { name: string; url: string };
type FAQItem = { question: string; answer: string };

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

type UniqueContent = {
  intro: string;
  benefits: string[];
  steps: string[];
  useCases: string[];
  faqs: FAQItem[];
};

// Unique content for top tools — overrides generic fallback
// Each entry has genuinely different, useful content per tool
const UNIQUE_CONTENT: Record<string, UniqueContent> = {
  "password-generator": {
    intro: "Password Generator creates strong, random passwords instantly in your browser. Control length, uppercase, numbers, and symbols — all without sending any data to a server. Your generated passwords stay completely private.",
    benefits: [
      "Generate cryptographically random passwords with one click — no account or signup needed.",
      "Customize length from 8 to 64 characters and toggle uppercase, numbers, and symbols independently.",
      "All generation happens client-side in your browser — passwords never leave your device.",
      "Copy to clipboard instantly and use across any site, app, or password manager.",
    ],
    steps: [
      "Set your desired password length using the slider (8–64 characters).",
      "Toggle character sets: uppercase, lowercase, numbers, and symbols.",
      "Click Generate Password to create a new random password instantly.",
      "Click Copy to copy it to your clipboard and paste wherever needed.",
    ],
    useCases: [
      "Creating new accounts that require strong unique passwords",
      "Replacing weak or reused passwords across your accounts",
      "Generating API keys, tokens, or secret strings for development",
      "Setting up secure passwords for shared team accounts or services",
    ],
    faqs: [
      { question: "Is this password generator truly random?", answer: "Yes. QuickFnd uses the Web Crypto API (crypto.getRandomValues) available in all modern browsers — cryptographically secure randomness far stronger than Math.random()." },
      { question: "Are my passwords stored anywhere?", answer: "No. Everything runs entirely in your browser. No password is ever sent to any server, logged, or stored. Once you close the tab, it is gone." },
      { question: "What makes a password strong?", answer: "A strong password is at least 16 characters, uses a mix of uppercase, lowercase, numbers, and symbols, and is never reused across sites. This generator follows all those rules." },
      { question: "Should I use a password manager?", answer: "Yes. Generate a strong password here, then save it in a password manager like Bitwarden or 1Password. Never try to memorize complex random passwords." },
    ],
  },
  "json-formatter": {
    intro: "JSON Formatter instantly prettifies, validates, and minifies JSON data in your browser. Paste raw or compressed JSON, click Format, and get clean readable output with proper indentation — no setup required.",
    benefits: [
      "Validate JSON syntax and catch errors like missing commas or unclosed brackets instantly.",
      "Format compressed single-line JSON into readable multi-line output with 2-space indentation.",
      "Minify formatted JSON back to compact form for production use or API requests.",
      "Works entirely in the browser — paste sensitive API responses without sending them externally.",
    ],
    steps: [
      "Paste your raw, minified, or malformed JSON into the input field.",
      "Click Format to prettify it with proper indentation and line breaks.",
      "If there is a syntax error, the tool highlights where the issue is.",
      "Click Copy Output to copy the formatted JSON to your clipboard.",
    ],
    useCases: [
      "Debugging API responses from REST APIs or webhooks",
      "Reading compressed JSON from browser network tabs or curl output",
      "Validating JSON before sending it as a request body",
      "Minifying JSON config files for production deployments",
    ],
    faqs: [
      { question: "What JSON standards does this support?", answer: "QuickFnd's JSON Formatter supports standard JSON (RFC 8259). It does not support JSON5 or JSONC. All keys must be double-quoted strings and trailing commas are not allowed." },
      { question: "Is there a file size limit?", answer: "No server-side limit. Very large JSON files may be slower depending on your device, but most API responses and config files work instantly." },
      { question: "Why is my JSON showing as invalid?", answer: "Common causes: trailing commas, single-quoted strings, unquoted keys, or NaN/Infinity values. The formatter indicates which line caused the error." },
      { question: "Can I format JSON with comments?", answer: "Standard JSON does not allow comments. Strip comments first — the formatter will show a syntax error if it encounters // or /* */ style comments." },
    ],
  },
  "word-counter": {
    intro: "Word Counter gives instant, accurate counts of words, characters, sentences, and paragraphs as you type. It also estimates reading time — useful for blog posts, essays, tweets, and content with length requirements.",
    benefits: [
      "Real-time word and character counts as you type — no button to click.",
      "See sentence and paragraph counts alongside reading time estimates.",
      "Check content against platform limits: Twitter (280 chars), meta descriptions (155 chars).",
      "Works offline — all counting happens in your browser with no server calls.",
    ],
    steps: [
      "Paste or type your text into the input area.",
      "Word count, character count, sentences, and paragraphs update instantly.",
      "Check the reading time estimate (based on 200 words per minute).",
      "Copy or clear the text using the action buttons when done.",
    ],
    useCases: [
      "Checking blog post or article length before publishing",
      "Ensuring your cover letter or essay hits the required word count",
      "Staying within Twitter, Instagram caption, or meta description limits",
      "Tracking reading time for content marketing and newsletter planning",
    ],
    faqs: [
      { question: "How is reading time calculated?", answer: "Reading time is estimated at 200 words per minute, which is the average adult silent reading speed. Technical content may take longer; simple text may be faster." },
      { question: "Does it count the same way as Microsoft Word?", answer: "Very closely. Like Word, this counter treats hyphenated words as one word and numbers as words. Minor differences may occur with special characters or URLs." },
      { question: "Does it work with non-English text?", answer: "Yes for any Latin-script language. For languages without spaces like Chinese or Japanese, character count is more meaningful than word count." },
      { question: "Is there an input size limit?", answer: "No hard limit — it runs entirely in your browser. Very long documents may be slightly slower to process but will still work." },
    ],
  },
  "uuid-generator": {
    intro: "UUID Generator creates universally unique identifiers (UUIDs/GUIDs) instantly in your browser. Generate one or multiple v4 UUIDs — the standard for random, collision-resistant identifiers used in databases, APIs, and distributed systems.",
    benefits: [
      "Generate RFC 4122-compliant v4 UUIDs — statistically guaranteed to be unique.",
      "Copy individual UUIDs or generate batches for bulk database seeding.",
      "All generation is client-side using the browser crypto API — no server round-trip.",
      "Standard hyphenated format, no-hyphens, or uppercase options available.",
    ],
    steps: [
      "Click Generate UUID to create a new random UUID v4 instantly.",
      "Click Copy to copy it to your clipboard.",
      "Use the Bulk option to generate multiple UUIDs at once for batch operations.",
      "Toggle format options if you need uppercase or non-hyphenated output.",
    ],
    useCases: [
      "Generating primary keys for database records in PostgreSQL, MySQL, or MongoDB",
      "Creating unique session tokens or API keys for web applications",
      "Seeding test databases with unique identifiers for development",
      "Generating correlation IDs for distributed system tracing and logging",
    ],
    faqs: [
      { question: "What is the difference between UUID v4 and other versions?", answer: "UUID v4 is randomly generated using cryptographic randomness with no structure or meaning. v1 includes a timestamp and MAC address. v5 is name-based. For most use cases, v4 is the right choice." },
      { question: "Can two generated UUIDs ever be the same?", answer: "In theory yes, but the probability is roughly 1 in 5.3 undecillion — effectively impossible in practice. UUIDs are considered collision-proof for all real-world applications." },
      { question: "Is UUID the same as GUID?", answer: "Yes. GUID (Globally Unique Identifier) is Microsoft's term for the same concept — same format, same 128-bit size, same collision resistance." },
      { question: "Are these safe to use as database primary keys?", answer: "Yes, UUID v4 is widely used as a primary key. Be aware that random UUIDs can cause index fragmentation in some databases. PostgreSQL handles this well; MySQL-heavy workloads may prefer time-ordered UUIDs." },
    ],
  },
  "base64-encoder": {
    intro: "Base64 Encoder converts plain text into Base64-encoded strings instantly in your browser. Base64 encoding is used in data URLs, email attachments, JWTs, and APIs that need to safely transmit binary data as text.",
    benefits: [
      "Encode any text string to Base64 instantly — no server needed.",
      "Supports URL-safe Base64 encoding (replaces + with - and / with _).",
      "Decode Base64 strings back to plain text in the same tool.",
      "Useful for understanding JWT tokens, data URIs, and API payloads.",
    ],
    steps: [
      "Type or paste the text you want to encode into the input field.",
      "Click Encode to convert it to Base64 format immediately.",
      "Copy the Base64 output using the Copy button.",
      "Switch to Decode mode to reverse a Base64 string back to plain text.",
    ],
    useCases: [
      "Encoding credentials for HTTP Basic Authentication headers",
      "Creating data: URLs for embedding images directly in HTML or CSS",
      "Decoding the payload section of a JWT token to inspect its claims",
      "Encoding binary data for safe transmission in JSON or XML API bodies",
    ],
    faqs: [
      { question: "Why is Base64 output longer than the input?", answer: "Base64 encodes every 3 bytes of data into 4 ASCII characters, increasing size by approximately 33%. This is the tradeoff for making binary data safe to transmit as text." },
      { question: "What is URL-safe Base64?", answer: "Standard Base64 uses + and / which have special meanings in URLs. URL-safe Base64 replaces + with - and / with _ so encoded strings work safely in URLs without percent-encoding." },
      { question: "Is Base64 the same as encryption?", answer: "No. Base64 is encoding, not encryption. Anyone can instantly decode a Base64 string. Never use it to hide sensitive data — use actual encryption for security." },
      { question: "What is a JWT and how does Base64 relate?", answer: "A JSON Web Token (JWT) has three Base64url-encoded parts: header, payload, and signature. Pasting a JWT into the decoder reveals the payload claims without needing a secret key." },
    ],
  },
  "text-case-converter": {
    intro: "Text Case Converter transforms text between uppercase, lowercase, title case, sentence case, and slug format instantly. Paste any text and convert it to the style you need for headlines, code, URLs, or documents.",
    benefits: [
      "Convert between 6 case styles in one click: UPPER, lower, Title, Sentence, slug-case, camelCase.",
      "Process any amount of text instantly — blog post, code snippet, or heading.",
      "Slug format removes special characters and spaces for SEO-friendly URL generation.",
      "No login, no upload — everything happens in your browser.",
    ],
    steps: [
      "Paste or type your text into the input field.",
      "Click the case style button you want: Uppercase, Lowercase, Title Case, Sentence, Slug, or camelCase.",
      "The converted text appears instantly in the output area.",
      "Click Copy to copy the result to your clipboard.",
    ],
    useCases: [
      "Converting article titles to proper title case for blog posts and headlines",
      "Generating URL slugs from page titles for SEO-friendly links",
      "Fixing ALL CAPS text pasted from PDFs or email chains",
      "Converting variable names between camelCase and snake_case in code",
    ],
    faqs: [
      { question: "What is title case vs sentence case?", answer: "Title Case capitalises the first letter of every major word (used in article titles and headings). Sentence case only capitalises the first word of each sentence (used in most body text)." },
      { question: "How does slug case work?", answer: "Slug case converts text to lowercase, replaces spaces with hyphens, and removes special characters. 'Hello World!' becomes 'hello-world'. Used in URLs, filenames, and CSS class names." },
      { question: "Should I use hyphens or underscores in slugs?", answer: "Hyphens are strongly preferred for SEO. Google treats hyphens as word separators but underscores as word joiners. 'json-formatter' ranks for both words separately; 'json_formatter' may not." },
      { question: "Does it handle accented characters?", answer: "For case conversions yes — accented characters are preserved in appropriate case. In slug mode, accented characters are transliterated to ASCII equivalents (é becomes e, ñ becomes n)." },
    ],
  },
  "bmi-calculator": {
    intro: "BMI Calculator computes your Body Mass Index from height and weight using the standard WHO formula. Enter your measurements in metric or imperial units and instantly see your BMI value and standard classification range.",
    benefits: [
      "Get your BMI instantly in both metric (kg/m²) and imperial (lbs/inches) units.",
      "See your result classification: Underweight, Normal weight, Overweight, or Obese.",
      "Clear range chart shows exactly where your result falls relative to WHO thresholds.",
      "No account needed — calculate privately in your browser.",
    ],
    steps: [
      "Select your unit system: Metric (kg and cm) or Imperial (lbs and inches).",
      "Enter your height and weight in the input fields.",
      "Click Calculate to see your BMI value and category instantly.",
      "Review the range chart to understand where your result sits.",
    ],
    useCases: [
      "Getting a quick health screening number before a doctor's appointment",
      "Tracking BMI changes over time as part of a fitness or weight management plan",
      "Understanding BMI categories for health insurance or medical forms",
      "Calculating BMI for family members using metric or imperial units",
    ],
    faqs: [
      { question: "What is a healthy BMI range?", answer: "According to the WHO, a BMI of 18.5–24.9 is normal weight. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above is obese. These thresholds may vary slightly by ethnicity and age." },
      { question: "Is BMI accurate for athletes?", answer: "No. BMI does not distinguish fat mass from muscle mass. Athletes often have high BMIs despite low body fat. BMI is a population screening tool, not a precise individual health measure." },
      { question: "What is the BMI formula?", answer: "BMI = weight(kg) / height(m)². In imperial: BMI = (weight in lbs × 703) / height in inches². Both give identical results when units are correctly converted." },
      { question: "Does BMI apply to children?", answer: "Child BMI is interpreted differently — compared against age and sex-specific growth charts rather than fixed thresholds. This calculator is designed for adults 18 and older." },
    ],
  },
  "emi-calculator": {
    intro: "EMI Calculator computes your Equated Monthly Instalment for any loan instantly. Enter principal, annual interest rate, and tenure to get your exact monthly payment, total interest payable, and full repayment cost.",
    benefits: [
      "Calculate exact EMI using the standard reducing balance formula used by banks and NBFCs.",
      "See total interest payable and total loan cost, not just the monthly amount.",
      "Compare EMIs across different tenures to find the repayment plan that fits your budget.",
      "Works for home loans, car loans, personal loans, education loans, and more.",
    ],
    steps: [
      "Enter the loan principal amount (the amount you want to borrow).",
      "Enter the annual interest rate offered by your bank or lender.",
      "Enter the loan tenure in months or years.",
      "Click Calculate to see your monthly EMI, total interest, and total repayment amount.",
    ],
    useCases: [
      "Comparing loan offers from different banks before applying",
      "Planning your monthly budget around a new home loan or car loan EMI",
      "Understanding how much total interest you will pay over the loan tenure",
      "Deciding between shorter tenure (higher EMI, less interest) vs longer tenure",
    ],
    faqs: [
      { question: "What is the EMI formula?", answer: "EMI = [P × R × (1+R)^N] / [(1+R)^N – 1], where P is principal, R is monthly interest rate (annual ÷ 12 ÷ 100), and N is number of instalments. This is the standard reducing balance formula." },
      { question: "Does this include processing fees?", answer: "No — this calculator computes pure EMI based on principal, rate, and tenure. Banks may charge processing fees, GST, insurance, or prepayment charges separately." },
      { question: "What happens if I make prepayments?", answer: "Prepayments reduce the outstanding principal, reducing either your EMI or remaining tenure depending on bank policy. This calculator shows standard EMI without prepayments." },
      { question: "What is reducing balance vs flat rate interest?", answer: "Reducing balance charges interest only on outstanding principal each month. Flat rate charges interest on the original principal throughout. The effective rate on a flat rate loan is roughly double the stated rate." },
    ],
  },
  "age-calculator": {
    intro: "Age Calculator computes your exact age in years, months, and days from your date of birth to today or any target date. Useful for forms, eligibility checks, anniversaries, and precise age verification.",
    benefits: [
      "Get exact age in years, months, and days — not just years.",
      "Calculate age as of any date — useful for eligibility checks at a specific point in time.",
      "See the next birthday countdown in days.",
      "Works for any date from 1900 to the present.",
    ],
    steps: [
      "Enter your date of birth using the date picker.",
      "Optionally set a 'calculate as of' date for age at a specific point in time.",
      "Click Calculate to see your exact age breakdown.",
      "See the number of days until your next birthday.",
    ],
    useCases: [
      "Filling government forms that require exact age in years, months, and days",
      "Checking age eligibility for jobs, schemes, or exam registrations",
      "Calculating exact age of a child for medical or school enrollment",
      "Finding how many days until someone's next birthday",
    ],
    faqs: [
      { question: "How does the calculator handle leap years?", answer: "Leap years are accounted for correctly. February 29 birthdays are handled by treating March 1 as the birthday in non-leap years, the most common convention." },
      { question: "Can I calculate age as of a past or future date?", answer: "Yes. Set the 'As of date' field to any past or future date and the calculator computes age at that point in time." },
      { question: "Why might my age show differently on different calculators?", answer: "Differences arise from how calculators handle the current day (inclusive or exclusive), timezone differences, and leap year logic. QuickFnd uses day-inclusive calculation based on your local date." },
      { question: "Is this the same method as official calculations?", answer: "It matches the most common method used in India, the UK, and most of Asia. The US typically uses just years and months. Always verify with the specific organisation if exact compliance matters." },
    ],
  },
  "loan-calculator": {
    intro: "Loan Calculator estimates your monthly repayment, total interest, and full repayment cost for any type of loan. Based on the standard amortisation formula, it helps you compare loan options and plan repayments before committing.",
    benefits: [
      "See monthly payment, total interest, and total repayment in one calculation.",
      "Understand how interest rate changes affect your monthly payment.",
      "Compare short vs long tenures — lower EMI but higher total interest over time.",
      "Works for personal, home, vehicle, and business loans.",
    ],
    steps: [
      "Enter your loan amount (principal).",
      "Enter the annual interest rate from your lender.",
      "Enter the repayment period in months or years.",
      "Click Calculate to see the monthly payment and full cost breakdown.",
    ],
    useCases: [
      "Evaluating whether you can afford a new home loan based on your monthly income",
      "Comparing two loan offers with different rates and tenures",
      "Estimating how much you will overpay in interest on a long-term loan",
      "Planning business cash flow around a new equipment or working capital loan",
    ],
    faqs: [
      { question: "What is the difference between a loan calculator and an EMI calculator?", answer: "They compute the same thing using the same formula. EMI calculator is the term used in India and South Asia; loan calculator is more common in Western markets. Both calculate monthly instalments on an amortising loan." },
      { question: "What is an amortisation schedule?", answer: "An amortisation schedule shows each monthly payment split between principal and interest. Early payments are mostly interest; later payments are mostly principal. The total payment stays the same throughout." },
      { question: "What is a good loan-to-income ratio?", answer: "A common guideline is that total monthly loan payments should not exceed 40% of gross monthly income. Most banks prefer home loan EMIs under 30–35% of monthly income." },
      { question: "Can I use this for fixed and variable rate loans?", answer: "This calculator works for fixed-rate loans where the interest rate stays constant. Variable-rate loans change over time so the formula only applies to the current fixed period." },
    ],
  },
  "percentage-calculator": {
    intro: "Percentage Calculator handles three common calculations: finding what percentage one number is of another, calculating a percentage of a number, and finding percentage change between two values — all in one tool.",
    benefits: [
      "Solve all three types of percentage problems without switching tools.",
      "Find percentage increase or decrease between any two numbers instantly.",
      "Calculate discounts, tax amounts, tips, and markups in seconds.",
      "Formula display shows exactly how each result was calculated.",
    ],
    steps: [
      "Select the calculation type: Percentage of, What percent is X of Y, or Percentage change.",
      "Enter the numbers in the input fields.",
      "Click Calculate to get the result with the formula shown.",
      "Try different numbers to compare scenarios side by side.",
    ],
    useCases: [
      "Calculating a 20% discount on a product price while shopping",
      "Working out the percentage increase in your salary or investment returns",
      "Finding what percentage of your budget has been spent",
      "Computing GST, VAT, or tip amounts on bills and invoices",
    ],
    faqs: [
      { question: "How do I calculate percentage increase?", answer: "Percentage increase = ((New Value - Old Value) / Old Value) × 100. If something went from 100 to 120, the increase is ((120-100)/100) × 100 = 20%. Use Percentage Change mode in the calculator." },
      { question: "How do I find what percentage X is of Y?", answer: "Divide X by Y and multiply by 100. 25 is what percentage of 80? (25/80) × 100 = 31.25%. Select 'What percent is X of Y' mode." },
      { question: "How do I calculate a discount?", answer: "If an item costs 500 with a 15% discount: 15% of 500 = 75 discount. Final price = 500 - 75 = 425. Use 'Percentage of a number' mode and subtract the result." },
      { question: "What is the difference between percentage and percentage points?", answer: "If interest rates go from 5% to 6%, that is a 1 percentage point increase but a 20% relative increase. This distinction matters significantly in financial calculations and statistics." },
    ],
  },
  "gst-calculator": {
    intro: "GST Calculator adds or removes Goods and Services Tax from any amount instantly. Select the GST rate (5%, 12%, 18%, or 28%), choose to add or extract GST, and get the complete breakdown of base amount, GST component, and total.",
    benefits: [
      "Add GST to a base price or extract GST from an inclusive amount — both directions.",
      "Supports all Indian GST slabs: 0%, 5%, 12%, 18%, and 28%.",
      "Shows full breakdown: base amount, GST amount, and final total.",
      "Useful for freelancers raising invoices and businesses verifying vendor bills.",
    ],
    steps: [
      "Enter the amount you want to calculate GST on.",
      "Select the applicable GST rate for your goods or service.",
      "Choose Add GST (to get total from base) or Remove GST (to extract base from total).",
      "See the base amount, GST component, and final total instantly.",
    ],
    useCases: [
      "Raising GST invoices as a freelancer or small business",
      "Checking how much GST is included in a vendor invoice",
      "Estimating the final price of a purchase including 18% GST",
      "Reconciling GST amounts for accounting and tax filing",
    ],
    faqs: [
      { question: "What are the current GST slabs in India?", answer: "India's GST has five main slabs: 0% (essential items), 5% (household necessities), 12% (processed foods), 18% (most services including IT and telecom), and 28% (luxury goods, cars, tobacco)." },
      { question: "How do I extract GST from a GST-inclusive price?", answer: "If the total is 118 with 18% GST: Base = 118 / 1.18 = 100. GST = 118 - 100 = 18. The calculator handles this automatically in Remove GST mode." },
      { question: "What is CGST and SGST?", answer: "In intra-state transactions, GST splits equally between CGST and SGST. For 18% GST, each is 9%. For inter-state transactions it becomes IGST at the full rate. This calculator shows total GST; your invoice software handles the split." },
      { question: "Who needs to register for GST?", answer: "Businesses and freelancers with annual turnover above 20 lakh rupees (10 lakh in some states) must register for GST. Below this threshold, GST registration is optional." },
    ],
  },
  "slug-generator": {
    intro: "Slug Generator converts any text into a clean, URL-friendly slug instantly. Type a page title or product name and get a lowercase hyphenated slug ready to use in your CMS, URL structure, or database.",
    benefits: [
      "Convert page titles to SEO-friendly slugs in one click.",
      "Removes special characters, accents, and spaces — outputs only URL-safe characters.",
      "Handles edge cases: multiple spaces, leading/trailing whitespace, consecutive hyphens.",
      "Copy the slug directly and paste into WordPress, Webflow, Shopify, or any CMS.",
    ],
    steps: [
      "Type or paste your page title or text into the input field.",
      "The slug is generated instantly as you type.",
      "Click Copy to copy the slug to your clipboard.",
      "Paste it directly into your CMS URL field or database.",
    ],
    useCases: [
      "Creating SEO-friendly URL slugs for blog posts and landing pages",
      "Generating consistent slugs for product IDs in e-commerce platforms",
      "Converting category and tag names to URL-safe identifiers",
      "Creating filename-safe strings from user-provided titles in web apps",
    ],
    faqs: [
      { question: "What characters does a URL slug allow?", answer: "A standard slug uses only lowercase letters (a-z), numbers (0-9), and hyphens (-). No spaces, underscores, special characters, or uppercase. This format is universally compatible with all web servers and CMS platforms." },
      { question: "Should I use hyphens or underscores?", answer: "Hyphens are strongly preferred for SEO. Google treats hyphens as word separators so 'json-formatter' ranks for both 'json' and 'formatter' separately." },
      { question: "How are accented characters handled?", answer: "Accented characters (é, ñ, ü) are transliterated to ASCII equivalents (e, n, u) before slugification. This ensures compatibility across all systems without percent-encoding." },
      { question: "Should slugs be short or descriptive?", answer: "Aim for 3–5 words capturing the core topic. Short enough to share easily, descriptive enough to contain the primary keyword. Avoid including dates unless the content is explicitly time-sensitive." },
    ],
  },
  "ai-email-writer": {
    intro: "AI Email Writer generates complete, ready-to-send email drafts based on your purpose, recipient, and tone. Powered by AI, it handles professional emails, follow-ups, apologies, and sales pitches — giving you a strong starting draft in seconds.",
    benefits: [
      "Generate a full email draft from just a few inputs — subject, recipient, purpose, and tone.",
      "Choose from Professional, Friendly, Persuasive, Formal, or Casual tone.",
      "Edit the output directly before copying — the AI draft is a starting point, not a final product.",
      "Saves significant time on repetitive emails like follow-ups, introductions, and status updates.",
    ],
    steps: [
      "Enter the email subject and the recipient's role or name.",
      "Describe the purpose: what do you want to achieve with this email?",
      "Select the tone (Professional, Friendly, Persuasive, etc.).",
      "Click Generate Email and review, edit, then copy the output.",
    ],
    useCases: [
      "Writing professional follow-up emails after meetings or interviews",
      "Drafting sales outreach or partnership proposal emails",
      "Creating apology or service recovery emails for customer issues",
      "Generating routine project status updates and team communications",
    ],
    faqs: [
      { question: "How good is the AI-generated email quality?", answer: "The AI produces solid first drafts covering structure, tone, and key points. Always review and personalise — add specific names, dates, and context before sending. Treat it as a smart starting point." },
      { question: "Does it support other languages?", answer: "Optimised for English. You can try other languages by specifying them in the extra instructions field, but quality may vary. Specify the language clearly for best results." },
      { question: "Is my email content private?", answer: "Your inputs are sent to the AI model to generate the draft. Do not include confidential personal information, passwords, financial data, or sensitive business information in prompts." },
      { question: "Can I adjust the length?", answer: "Yes. Use the Length selector to choose Short (3–4 sentences), Medium (2–3 paragraphs), Long, or Detailed. You can also specify length in the Extra instructions field." },
    ],
  },
  "ai-prompt-generator": {
    intro: "AI Prompt Generator creates better, more effective prompts for ChatGPT, Claude, Midjourney, and other AI tools. Describe your goal and get a well-structured prompt with clear instructions, context, and format — ready to paste.",
    benefits: [
      "Turn vague ideas into specific, effective AI prompts with clear structure.",
      "Prompts include role-setting, context, constraints, and output format instructions.",
      "Works for text AI (ChatGPT, Claude), image AI (Midjourney), and code AI (Copilot).",
      "Learn prompt engineering patterns by studying the generated structure.",
    ],
    steps: [
      "Describe your goal — what do you want the AI to do or produce?",
      "Select the target AI model or type.",
      "Choose the desired output format: paragraph, list, table, code, etc.",
      "Click Generate Prompt, review it, then paste into your AI tool.",
    ],
    useCases: [
      "Creating detailed prompts for writing blog posts or marketing copy with ChatGPT",
      "Generating image prompts for Midjourney with proper style and composition details",
      "Building system prompts for custom AI assistants and chatbots",
      "Learning prompt engineering by analysing well-structured example prompts",
    ],
    faqs: [
      { question: "What makes a good AI prompt?", answer: "A good prompt has four elements: a clear role ('Act as an expert marketer'), specific context, explicit instructions (what to do), and output format (how you want the result structured). Vague prompts produce vague results." },
      { question: "Will these prompts work with any AI model?", answer: "Yes, but results vary by model. GPT-4, Claude, and Gemini all respond well to structured prompts. Image models like Midjourney use different styles — the generator adapts output based on the model type selected." },
      { question: "Why do AI outputs often miss the point?", answer: "Most poor AI outputs come from under-specified prompts. More context and constraints consistently produce better output. This tool helps by prompting you to think through role, context, format, and constraints." },
      { question: "What is prompt engineering?", answer: "Prompt engineering is the practice of designing inputs to AI models to get consistently high-quality outputs. It includes techniques like few-shot examples, chain-of-thought reasoning, role assignment, and output format specification." },
    ],
  },
};

// ─── Generic fallbacks ────────────────────────────────────────────────────────

function buildGenericIntro(table: PublicTable, item: PublicContentItem): string {
  const desc = item.description ? item.description.replace(/\.$/, "") : item.name;
  if (table === "tools") return `${item.name} is a free browser-based tool on QuickFnd. ${desc}. No installation or account required — runs entirely in your browser on desktop and mobile.`;
  if (table === "calculators") return `${item.name} is a free online calculator on QuickFnd. ${desc}. Get instant results in your browser without any signup or download.`;
  return `${item.name} is a free AI-powered tool on QuickFnd. ${desc}. Access it from any browser and explore related AI utilities for connected workflows.`;
}

function buildGenericBenefits(table: PublicTable, item: PublicContentItem): string[] {
  const n = item.name;
  if (table === "tools") return [
    `Use ${n} instantly in your browser — no download or account required.`,
    `Get results in seconds with a focused interface built for speed and efficiency.`,
    `Works across desktop, tablet, and mobile browsers without any app install.`,
    `Bookmark this page for quick repeat access whenever you need ${n}.`,
  ];
  if (table === "calculators") return [
    `Calculate results instantly without manual arithmetic or spreadsheet formulas.`,
    `Reduce errors compared to hand calculation with validated inputs and formulas.`,
    `Responsive design works on desktop and mobile — calculate anywhere, any time.`,
    `No account needed — your inputs stay in your browser, not on any server.`,
  ];
  return [
    `Access ${n} free from any modern browser — no signup required.`,
    `Get AI-generated output in seconds with structured, easy-to-use inputs.`,
    `Review and edit the output before using it in your work or communication.`,
    `Discover related AI tools on QuickFnd for connected content workflows.`,
  ];
}

function buildGenericSteps(table: PublicTable, item: PublicContentItem): string[] {
  const n = item.name;
  if (table === "tools") return [
    `Open ${n} on this page and locate the input area.`,
    `Paste or type the content you want to process.`,
    `Adjust any available settings or options provided by the tool.`,
    `Copy or download the result and use it in your workflow.`,
  ];
  if (table === "calculators") return [
    `Enter the required values in the calculator input fields.`,
    `Review the units and ensure your inputs are in the correct format.`,
    `Click Calculate to get your result instantly.`,
    `Compare the result with related calculators for broader context.`,
  ];
  return [
    `Fill in the required fields describing your goal or request.`,
    `Select tone, format, or style options if available.`,
    `Click Generate and review the AI-generated output.`,
    `Edit the result as needed and copy it for use in your work.`,
  ];
}

function buildGenericUseCases(table: PublicTable): string[] {
  if (table === "tools") return [
    "Browser-based tasks that would otherwise require software downloads",
    "Developer, writer, and marketer productivity workflows",
    "Processing or validating text, data, or file content online",
    "Repetitive tasks that benefit from a dedicated, focused tool",
  ];
  if (table === "calculators") return [
    "Fast estimations before making financial or personal decisions",
    "Checking calculations for accuracy before submitting forms",
    "Comparing different scenarios by adjusting input values",
    "Getting a quick number for planning, budgeting, or reporting",
  ];
  return [
    "Generating first drafts for writing, emails, or content tasks",
    "Exploring AI-powered workflows without a paid subscription",
    "Getting structured AI output for professional or personal use",
    "Saving time on repetitive content creation tasks",
  ];
}

function buildGenericFAQs(table: PublicTable, item: PublicContentItem): FAQItem[] {
  const n = item.name;
  const desc = item.description || `${n} helps you complete a specific task quickly.`;
  if (table === "tools") return [
    { question: `What does ${n} do?`, answer: `${n} is a free browser-based tool on QuickFnd. ${desc}` },
    { question: `Is ${n} free to use?`, answer: `Yes. ${n} is completely free — no account, subscription, or download required. It runs entirely in your browser.` },
    { question: `Does ${n} work on mobile?`, answer: `Yes. QuickFnd tools work on all modern browsers including Chrome, Safari, Firefox, and Edge on both desktop and mobile.` },
    { question: `Is my data safe when using ${n}?`, answer: `${n} runs client-side in your browser. Input data is processed locally and not sent to external servers unless the tool explicitly requires an AI or API call.` },
  ];
  if (table === "calculators") return [
    { question: `What does ${n} calculate?`, answer: desc },
    { question: `How accurate is ${n}?`, answer: `${n} uses standard mathematical formulas and provides accurate results. For professional, legal, or financial decisions, always verify with a qualified expert.` },
    { question: `Is ${n} free?`, answer: `Yes — completely free, no account required. All calculations happen in your browser.` },
    { question: `Can I use ${n} on my phone?`, answer: `Yes. The calculator works on all modern mobile browsers with a responsive interface for smaller screens.` },
  ];
  return [
    { question: `What is ${n}?`, answer: `${n} is an AI-powered tool on QuickFnd. ${desc}` },
    { question: `How does ${n} work?`, answer: `Provide context through the input fields — goal, tone, format — and the AI generates relevant output based on your specifications. Review and edit before use.` },
    { question: `Is ${n} free?`, answer: `Yes. ${n} is free to use on QuickFnd with no account required.` },
    { question: `How good is the AI output quality?`, answer: `Clear, detailed inputs consistently produce better results. Treat AI output as a strong starting draft that you review and personalise before use.` },
  ];
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildSEOSectionData(table: PublicTable, item: PublicContentItem): SEOSectionData {
  const siteUrl = getSiteUrl();
  const categoryLabel = getCategoryLabel(table);
  const categoryPath = getCategoryPath(table);
  const categoryTitle = table === "tools" ? "Tools" : table === "calculators" ? "Calculators" : "AI Tools";
  const applicationCategory = table === "tools" ? "UtilitiesApplication" : table === "calculators" ? "FinanceApplication" : "BusinessApplication";
  const pageUrl = table === "tools" ? `${siteUrl}/tools/${item.slug}` : table === "calculators" ? `${siteUrl}/calculators/${item.slug}` : `${siteUrl}/ai-tools/${item.slug}`;
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", url: siteUrl },
    { name: categoryTitle, url: `${siteUrl}${categoryPath}` },
    { name: item.name, url: pageUrl },
  ];

  const unique = UNIQUE_CONTENT[item.slug] ?? null;

  return {
    categoryLabel, categoryPath, categoryTitle, pageUrl, breadcrumbs, applicationCategory,
    intro: unique?.intro ?? buildGenericIntro(table, item),
    benefits: unique?.benefits ?? buildGenericBenefits(table, item),
    steps: unique?.steps ?? buildGenericSteps(table, item),
    useCases: unique?.useCases ?? buildGenericUseCases(table),
    faqs: unique?.faqs ?? buildGenericFAQs(table, item),
  };
}

// ─── Schema builders ──────────────────────────────────────────────────────────

export function buildBreadcrumbSchema(table: PublicTable, item: PublicContentItem) {
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
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function buildSoftwareSchema(table: PublicTable, item: PublicContentItem) {
  const data = buildSEOSectionData(table, item);
  const siteUrl = getSiteUrl();
  const baseType = table === "ai_tools" ? "WebApplication" : "SoftwareApplication";
  return {
    "@context": "https://schema.org",
    "@type": baseType,
    name: item.name,
    description: item.description || data.intro,
    applicationCategory: data.applicationCategory,
    operatingSystem: "Web, Browser",
    browserRequirements: "Requires JavaScript",
    url: data.pageUrl,
    image: `${siteUrl}/api/og?title=${encodeURIComponent(item.name)}`,
    provider: { "@type": "Organization", name: "QuickFnd", url: siteUrl },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    featureList: data.benefits.slice(0, 3).join(", "),
    keywords: [item.name, `free online ${data.categoryLabel.toLowerCase()}`, "QuickFnd"].join(", "),
  };
}