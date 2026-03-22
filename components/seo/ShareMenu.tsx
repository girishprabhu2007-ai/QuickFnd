"use client";

import { useMemo, useState } from "react";

type Props = {
  title: string;
  url: string;
};

function buildLinks(title: string, url: string) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return {
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-q-border bg-q-card text-q-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-sm">
      {children}
    </div>
  );
}

export default function ShareMenu({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const links = useMemo(() => buildLinks(title, url), [title, url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      await copyLink();
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Native share */}
      <button onClick={nativeShare} title="Share" type="button">
        <Icon>
          🔗
        </Icon>
      </button>

      {/* Copy */}
      <button onClick={copyLink} title="Copy link" type="button">
        <Icon>
          {copied ? "✓" : "📋"}
        </Icon>
      </button>

      {/* X */}
      <a href={links.x} target="_blank" rel="noreferrer" title="Share on X">
        <Icon>
          X
        </Icon>
      </a>

      {/* Facebook */}
      <a href={links.facebook} target="_blank" rel="noreferrer" title="Facebook">
        <Icon>
          f
        </Icon>
      </a>

      {/* LinkedIn */}
      <a href={links.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
        <Icon>
          in
        </Icon>
      </a>

      {/* WhatsApp */}
      <a href={links.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp">
        <Icon>
          🟢
        </Icon>
      </a>

      {/* Telegram */}
      <a href={links.telegram} target="_blank" rel="noreferrer" title="Telegram">
        <Icon>
          ✈️
        </Icon>
      </a>
    </div>
  );
}