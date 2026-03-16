"use client";

type Props = {
  url: string;
  title: string;
};

function ShareIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-q-border bg-q-bg transition-all duration-200 group-hover:border-blue-400/50 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/10">
      {children}
    </span>
  );
}

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

  const shareItems = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M18.244 2H21l-6.56 7.497L22.16 22h-6.046l-4.734-6.19L5.96 22H3.2l7.018-8.018L1.84 2h6.2l4.28 5.598L18.244 2Zm-1.06 18h1.676L6.93 3.896H5.132L17.184 20Z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M6.94 8.5H3.56V20h3.38V8.5Zm.23-3.56A1.96 1.96 0 0 0 5.2 3a1.96 1.96 0 0 0-1.97 1.94c0 1.07.88 1.94 1.97 1.94 1.08 0 1.97-.87 1.97-1.94ZM20.5 12.85c0-3.13-1.67-4.58-3.9-4.58-1.8 0-2.61.99-3.06 1.68V8.5h-3.38c.04.96 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.27-.68.88-1.39 1.9-1.39 1.34 0 1.88 1.05 1.88 2.58V20H20.5v-7.15Z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.05 0C5.56 0 .28 5.27.28 11.76c0 2.07.54 4.1 1.57 5.9L0 24l6.5-1.7a11.76 11.76 0 0 0 5.55 1.42h.01c6.49 0 11.77-5.28 11.77-11.77 0-3.14-1.22-6.09-3.31-8.47ZM12.06 21.7h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.86 1.01 1.03-3.76-.23-.38a9.79 9.79 0 0 1-1.5-5.23c0-5.4 4.4-9.8 9.82-9.8 2.62 0 5.08 1.02 6.93 2.88a9.75 9.75 0 0 1 2.87 6.93c0 5.41-4.4 9.81-9.8 9.81Zm5.38-7.33c-.3-.15-1.76-.87-2.04-.96-.27-.1-.47-.15-.66.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.64.07-.3-.15-1.24-.45-2.36-1.44-.88-.78-1.48-1.74-1.65-2.03-.17-.3-.02-.45.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.91-2.2-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.08-.8.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.88 1.21 3.08.15.2 2.09 3.2 5.07 4.49.71.3 1.27.48 1.7.62.72.23 1.38.2 1.9.12.58-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M9.04 15.47 8.67 20.8c.53 0 .76-.23 1.04-.5l2.5-2.39 5.18 3.79c.95.52 1.62.25 1.88-.87l3.4-15.93h.01c.31-1.45-.52-2.02-1.45-1.67L1.3 10.9c-1.4.54-1.38 1.32-.24 1.67l5.1 1.59L18 6.76c.56-.37 1.07-.16.65.21" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-q-muted">Share:</span>

      {shareItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm font-medium text-q-text transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-q-card-hover hover:text-blue-600"
        >
          <ShareIcon>{item.icon}</ShareIcon>
          <span>{item.label}</span>
        </a>
      ))}

      <button
        onClick={copyLink}
        className="group inline-flex items-center gap-2 rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm font-medium text-q-text transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-q-card-hover hover:text-blue-600"
      >
        <ShareIcon>
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z" />
          </svg>
        </ShareIcon>
        <span>Copy Link</span>
      </button>
    </div>
  );
}