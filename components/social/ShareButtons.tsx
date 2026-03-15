"use client";

type Props = {
  url: string;
  title: string;
};

export default function ShareButtons({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied.");
    } catch {
      alert("Could not copy link.");
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-q-muted">Share:</span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
      >
        X
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
      >
        LinkedIn
      </a>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
      >
        WhatsApp
      </a>

      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
      >
        Telegram
      </a>

      <button
        onClick={copyLink}
        className="rounded-lg border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
      >
        Copy Link
      </button>
    </div>
  );
}