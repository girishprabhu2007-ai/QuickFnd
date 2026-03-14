"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { getAIToolBySlug, getRelatedAITools } from "@/lib/data/ai-tools";

export default function AIToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const tool = getAIToolBySlug(slug);
  const relatedTools = getRelatedAITools(slug);

  const [promptGoal, setPromptGoal] = useState("");
  const [promptStyle, setPromptStyle] = useState("Professional");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const [emailPurpose, setEmailPurpose] = useState("");
  const [emailTone, setEmailTone] = useState("Professional");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  const [blogTopic, setBlogTopic] = useState("");
  const [blogAudience, setBlogAudience] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState("");

  const promptTemplate = useMemo(() => {
    if (!promptGoal.trim()) return "";
    return `Act as an expert assistant. Help me with: ${promptGoal}. Use a ${promptStyle.toLowerCase()} tone. Provide a clear, detailed, and actionable response.`;
  }, [promptGoal, promptStyle]);

  const emailTemplate = useMemo(() => {
    if (!emailPurpose.trim()) return "";
    return `Subject: ${emailPurpose}

Hi ${emailRecipient || "[Recipient Name]"},

I hope you're doing well.

I'm reaching out regarding ${emailPurpose.toLowerCase()}. I wanted to connect with you in a ${emailTone.toLowerCase()} manner and share the relevant details clearly.

[Add your main message here.]

Please let me know your thoughts.

Best regards,
[Your Name]`;
  }, [emailPurpose, emailTone, emailRecipient]);

  const blogOutlineTemplate = useMemo(() => {
    if (!blogTopic.trim()) return "";
    return `Title: ${blogTopic}

1. Introduction
   - What ${blogTopic} means
   - Why it matters

2. Key Concepts
   - Main idea 1
   - Main idea 2
   - Main idea 3

3. Practical Applications
   - How ${blogAudience || "readers"} can use it
   - Common mistakes to avoid

4. Best Practices
   - Tips
   - Tools
   - Recommendations

5. Conclusion
   - Summary
   - Next steps`;
  }, [blogTopic, blogAudience]);

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-950 p-10 text-white">
        <Link
          href="/ai-tools"
          className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to AI Tools
        </Link>
        <h1 className="mb-4 text-4xl font-bold">AI Tool Not Found</h1>
        <p className="text-gray-400">
          The AI tool you are looking for does not exist.
        </p>
      </main>
    );
  }

  const renderUtility = () => {
    if (slug === "ai-prompt-generator") {
      return (
        <div className="max-w-4xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">What do you need a prompt for?</label>
            <textarea
              value={promptGoal}
              onChange={(e) => setPromptGoal(e.target.value)}
              placeholder="Example: Write a LinkedIn post about productivity tips"
              className="min-h-[120px] w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">Prompt Style</label>
            <select
              value={promptStyle}
              onChange={(e) => setPromptStyle(e.target.value)}
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            >
              <option>Professional</option>
              <option>Creative</option>
              <option>Friendly</option>
              <option>Concise</option>
            </select>
          </div>

          <button
            onClick={() => setGeneratedPrompt(promptTemplate)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
          >
            Generate Prompt
          </button>

          <div className="mt-6 rounded-xl bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Generated Prompt</p>
            <pre className="whitespace-pre-wrap text-green-400">
              {generatedPrompt || "Fill the form and click Generate Prompt"}
            </pre>
          </div>
        </div>
      );
    }

    if (slug === "ai-email-writer") {
      return (
        <div className="max-w-4xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Email Purpose</label>
            <input
              value={emailPurpose}
              onChange={(e) => setEmailPurpose(e.target.value)}
              placeholder="Example: Follow up after a meeting"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Recipient Name</label>
            <input
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              placeholder="Example: John"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">Tone</label>
            <select
              value={emailTone}
              onChange={(e) => setEmailTone(e.target.value)}
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Persuasive</option>
              <option>Formal</option>
            </select>
          </div>

          <button
            onClick={() => setGeneratedEmail(emailTemplate)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
          >
            Generate Email Draft
          </button>

          <div className="mt-6 rounded-xl bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Generated Email</p>
            <pre className="whitespace-pre-wrap text-green-400">
              {generatedEmail || "Fill the form and click Generate Email Draft"}
            </pre>
          </div>
        </div>
      );
    }

    if (slug === "ai-blog-outline-generator") {
      return (
        <div className="max-w-4xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Blog Topic</label>
            <input
              value={blogTopic}
              onChange={(e) => setBlogTopic(e.target.value)}
              placeholder="Example: How to improve remote team productivity"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">Target Audience</label>
            <input
              value={blogAudience}
              onChange={(e) => setBlogAudience(e.target.value)}
              placeholder="Example: startup founders"
              className="w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700"
            />
          </div>

          <button
            onClick={() => setGeneratedOutline(blogOutlineTemplate)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
          >
            Generate Blog Outline
          </button>

          <div className="mt-6 rounded-xl bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Generated Outline</p>
            <pre className="whitespace-pre-wrap text-green-400">
              {generatedOutline || "Fill the form and click Generate Blog Outline"}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl rounded-xl bg-gray-900 p-6">
        <p className="text-lg text-gray-300">
          This is where the full review or listing for {tool.name} will go.
        </p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <Link
        href="/ai-tools"
        className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300"
      >
        ← Back to AI Tools
      </Link>

      <h1 className="mb-4 text-4xl font-bold">{tool.name}</h1>
      <p className="mb-8 max-w-2xl text-gray-400">{tool.description}</p>

      {renderUtility()}

      {relatedTools.length > 0 && (
        <section className="mt-12 max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold">Related AI Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.slug}
                href={`/ai-tools/${relatedTool.slug}`}
                className="rounded-xl bg-gray-900 p-4 transition hover:bg-gray-800"
              >
                <h3 className="font-semibold">{relatedTool.name}</h3>
                <p className="mt-2 text-sm text-gray-400">
                  {relatedTool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}