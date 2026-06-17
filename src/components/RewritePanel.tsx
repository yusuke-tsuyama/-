"use client";
import { useState } from "react";

interface Props {
  rewrites: {
    simple: string;
    web: string;
    business: string;
  };
}

const tabs = [
  { key: "simple" as const, label: "読みやすい版", icon: "📖" },
  { key: "web" as const, label: "Web記事向け", icon: "💻" },
  { key: "business" as const, label: "ビジネス文書", icon: "📋" },
];

export default function RewritePanel({ rewrites }: Props) {
  const [active, setActive] = useState<"simple" | "web" | "business">("simple");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rewrites[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "white" }}
    >
      {/* Tabs */}
      <div
        className="flex"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--paper)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              borderBottom: active === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              color: active === tab.key ? "var(--accent)" : "var(--ink-muted)",
              background: "transparent",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="px-4 py-3 text-xs font-medium transition-all"
          style={{ color: copied ? "var(--ok)" : "var(--ink-muted)" }}
        >
          {copied ? "✓ コピー済み" : "コピー"}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <p
          className="text-sm leading-loose whitespace-pre-wrap"
          style={{ color: "var(--ink-soft)" }}
        >
          {rewrites[active]}
        </p>
      </div>
    </div>
  );
}
