"use client";
import { useState } from "react";

type Props = {
  slug: string;
  name: string;
  section: "tools" | "calculators" | "ai-tools";
};

export default function EmbedCodeButton({ slug, name, section }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedUrl = `https://quickfnd.com/embed/${section}/${slug}`;
  const code = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="500"\n  frameborder="0"\n  title="${name} — QuickFnd"\n  loading="lazy"\n></iframe>`;

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-muted transition hover:border-blue-400/50 hover:text-q-text"
        title="Embed this tool on your website"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        Embed
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-q-border bg-q-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-semibold text-q-text uppercase tracking-wider">
              Embed code
            </p>
            <button onClick={() => setOpen(false)} className="text-q-muted hover:text-q-text text-lg leading-none px-1" title="Close">&times;</button>
            <button
              onClick={handleCopy}
              className="rounded-md bg-q-primary px-3 py-1 text-xs font-medium text-white hover:bg-q-primary-hover transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="rounded-lg bg-q-bg border border-q-border p-3 text-xs text-q-muted overflow-x-auto font-mono leading-5 whitespace-pre-wrap">
            {code}
          </pre>
          <p className="mt-2 text-xs text-q-muted">
            Paste this code into your website HTML. The tool will load in an iframe with a &quot;Powered by QuickFnd&quot; footer.{" "}
            <a href="/embed" className="text-blue-500 hover:underline">Learn more →</a>
          </p>
        </div>
      )}
    </>
  );
}
