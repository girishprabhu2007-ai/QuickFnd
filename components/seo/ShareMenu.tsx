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

function ShareIcon({
  type,
  className = "h-4 w-4",
}: {
  type: "share" | "copy" | "x" | "facebook" | "linkedin" | "whatsapp" | "telegram";
  className?: string;
}) {
  if (type === "share") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 5v10" />
        <path d="M8 9l4-4 4 4" />
        <path d="M5 15v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
      </svg>
    );
  }

  if (type === "copy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
      </svg>
    );
  }

  if (type === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.9 2H21l-6.87 7.85L22 22h-6.17l-4.83-6.34L5.46 22H3.35l7.34-8.39L2 2h6.32l4.37 5.77L18.9 2Zm-1.08 18h1.17L7.68 3.9H6.43L17.82 20Z" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.2-1.6 1.6-1.6H17V4.1c-.3 0-1.4-.1-2.7-.1-2.6 0-4.3 1.6-4.3 4.6v2.1H7v3.2h3v8.2h3.5Z" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A2 2 0 1 0 5.3 7a2 2 0 0 0-.05-4ZM20.44 13.02c0-3.4-1.81-4.98-4.23-4.98-1.95 0-2.82 1.08-3.31 1.84V8.5H9.52c.04.92 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.27-.67.88-1.36 1.92-1.36 1.36 0 1.91 1.03 1.91 2.54V20h3.38v-6.98Z" />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.52 3.48A11.84 11.84 0 0 0 12.07 0C5.5 0 .18 5.33.18 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.86 11.86 0 0 0 5.77 1.48h.01c6.57 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.16-3.46-8.45ZM12.08 21.8h-.01a9.83 9.83 0 0 1-5-1.37l-.36-.21-3.74.98 1-3.64-.24-.37a9.82 9.82 0 0 1-1.52-5.26c0-5.42 4.41-9.83 9.84-9.83 2.63 0 5.1 1.02 6.96 2.89a9.76 9.76 0 0 1 2.88 6.96c0 5.42-4.42 9.84-9.82 9.84Zm5.39-7.36c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.29-.77.98-.95 1.18-.17.2-.35.22-.64.08-.3-.15-1.24-.45-2.36-1.42a8.76 8.76 0 0 1-1.64-2.04c-.17-.3-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.91-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.07 2.86 1.21 3.06.15.2 2.1 3.21 5.08 4.5.71.3 1.27.49 1.71.62.72.23 1.38.2 1.89.12.58-.09 1.77-.72 2.03-1.41.25-.69.25-1.27.17-1.4-.08-.12-.28-.2-.57-.35Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.93 4.37a1.5 1.5 0 0 0-1.73-.24L2.9 12.5a1.5 1.5 0 0 0 .16 2.75l4.52 1.7 1.7 4.52a1.5 1.5 0 0 0 2.75.16l8.37-17.3a1.5 1.5 0 0 0-.47-1.96ZM9.05 15.42l-.92 3.02-1.14-3.02 8.91-7.06-6.85 7.06ZM6.7 14.2l-3.03-1.13 14.7-7.12L6.7 14.2Z" />
    </svg>
  );
}

function iconButtonBase() {
  return "group inline-flex h-10 w-10 items-center justify-center rounded-full border border-q-border bg-q-card text-q-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40";
}

function brandHoverClass(brand: "default" | "x" | "facebook" | "linkedin" | "whatsapp" | "telegram" | "success") {
  const map = {
    default: "hover:border-blue-300/60 hover:bg-q-card-hover hover:text-q-text",
    success: "hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700",
    x: "hover:border-zinc-500 hover:bg-zinc-50 hover:text-black",
    facebook: "hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700",
    linkedin: "hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700",
    whatsapp: "hover:border-green-500 hover:bg-green-50 hover:text-green-700",
    telegram: "hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700",
  };

  return `${iconButtonBase()} ${map[brand]}`;
}

export default function ShareMenu({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const links = useMemo(() => buildLinks(title, url), [title, url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await copyLink();
      }
    } catch {
      // ignore cancelled shares
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={nativeShare}
        type="button"
        aria-label="Share"
        title="Share"
        className={brandHoverClass("default")}
      >
        <span className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
          <ShareIcon type="share" />
        </span>
      </button>

      <button
        onClick={copyLink}
        type="button"
        aria-label={copied ? "Copied" : "Copy link"}
        title={copied ? "Copied" : "Copy link"}
        className={copied ? brandHoverClass("success") : brandHoverClass("default")}
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          <ShareIcon type="copy" />
        </span>
      </button>

      <a
        href={links.x}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X"
        title="Share on X"
        className={brandHoverClass("x")}
      >
        <span className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
          <ShareIcon type="x" />
        </span>
      </a>

      <a
        href={links.facebook}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className={brandHoverClass("facebook")}
      >
        <span className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
          <ShareIcon type="facebook" />
        </span>
      </a>

      <a
        href={links.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className={brandHoverClass("linkedin")}
      >
        <span className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
          <ShareIcon type="linkedin" />
        </span>
      </a>

      <a
        href={links.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className={brandHoverClass("whatsapp")}
      >
        <span className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
          <ShareIcon type="whatsapp" />
        </span>
      </a>

      <a
        href={links.telegram}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Telegram"
        title="Share on Telegram"
        className={brandHoverClass("telegram")}
      >
        <span className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
          <ShareIcon type="telegram" />
        </span>
      </a>
    </div>
  );
}