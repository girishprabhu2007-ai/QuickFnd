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

export default function ShareMenu({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const links = useMemo(() => buildLinks(title, url), [title, url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
      } else {
        await copyLink();
      }
    } catch {
      // ignore cancelled shares
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-4">
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-sm font-semibold text-q-text">Share this page</div>
          <p className="mt-1 text-sm text-q-muted">
            Copy the link or share it on your preferred platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={nativeShare}
            className="rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-q-primary-hover"
            type="button"
          >
            Share
          </button>

          <button
            onClick={copyLink}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
            type="button"
          >
            {copied ? "Copied" : "Copy link"}
          </button>

          <a
            href={links.x}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
          >
            X
          </a>

          <a
            href={links.facebook}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
          >
            Facebook
          </a>

          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
          >
            LinkedIn
          </a>

          <a
            href={links.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
          >
            WhatsApp
          </a>

          <a
            href={links.telegram}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}