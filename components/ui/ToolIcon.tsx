type Props = {
  type?: string | null;
};

export default function ToolIcon({ type }: Props) {
  const iconClass = "h-5 w-5";

  function renderIcon() {
    const t = String(type || "").toLowerCase();

    if (t.includes("json") || t.includes("formatter")) {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path d="M8 4c-2 2-2 14 0 16M16 4c2 2 2 14 0 16" strokeWidth="2" />
        </svg>
      );
    }

    if (t.includes("password")) {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <rect x="5" y="11" width="14" height="8" rx="2" strokeWidth="2" />
          <path d="M8 11V7a4 4 0 118 0v4" strokeWidth="2" />
        </svg>
      );
    }

    if (t.includes("slug") || t.includes("text") || t.includes("word")) {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path d="M4 6h16M4 12h10M4 18h8" strokeWidth="2" />
        </svg>
      );
    }

    if (t.includes("base64") || t.includes("encode") || t.includes("decode")) {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path d="M8 5l8 7-8 7" strokeWidth="2" />
        </svg>
      );
    }

    if (t.includes("ai")) {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <circle cx="12" cy="12" r="4" strokeWidth="2" />
          <path d="M2 12h4M18 12h4M12 2v4M12 18v4" strokeWidth="2" />
        </svg>
      );
    }

    if (t.includes("calculator")) {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2" />
          <path d="M8 7h8M8 11h2M12 11h2M16 11h2M8 15h2M12 15h2M16 15h2" strokeWidth="2" />
        </svg>
      );
    }

    return (
      <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" fill="none">
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" strokeWidth="2" />
        <path d="M4 12h2M18 12h2M12 4v2M12 18v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
      {renderIcon()}
    </div>
  );
}