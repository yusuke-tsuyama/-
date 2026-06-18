"use client";
import { CheckItem, CheckStatus } from "@/types";

const statusConfig: Record<
  CheckStatus,
  { bg: string; border: string; text: string; badge: string; badgeBg: string; icon: string }
> = {
  OK: {
    bg: "var(--ok-bg)",
    border: "var(--ok)",
    text: "var(--ok)",
    badge: "OK",
    badgeBg: "var(--ok)",
    icon: "✓",
  },
  注意: {
    bg: "var(--warn-bg)",
    border: "var(--warn)",
    text: "var(--warn)",
    badge: "注意",
    badgeBg: "var(--warn)",
    icon: "△",
  },
  要修正: {
    bg: "var(--error-bg)",
    border: "var(--error)",
    text: "var(--error)",
    badge: "要修正",
    badgeBg: "var(--error)",
    icon: "✕",
  },
};

interface Props {
  item: CheckItem;
  index: number;
}

export default function CheckCard({ item, index }: Props) {
  const cfg = statusConfig[item.status] ?? statusConfig["OK"];

  return (
    <div
      className="rounded-xl p-4 card-animate"
      style={{
        background: cfg.bg,
        borderLeft: `3px solid ${cfg.border}`,
        animationDelay: `${index * 80}ms`,
        opacity: 0,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm" style={{ color: "var(--ink)" }}>
          {item.name}
        </span>
        <span
          className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: cfg.badgeBg }}
        >
          <span>{cfg.icon}</span>
          {cfg.badge}
        </span>
      </div>

      {/* Issue */}
      <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>
        {item.issue}
      </p>

      {/* Reason */}
      {item.status !== "OK" && (
        <details className="group">
          <summary
            className="text-xs cursor-pointer select-none font-medium"
            style={{ color: cfg.text }}
          >
            理由と修正例を見る ▾
          </summary>
          <div className="mt-2 space-y-2">
            <div
              className="text-xs p-2 rounded-lg"
              style={{ background: "rgba(0,0,0,0.04)", color: "var(--ink-soft)" }}
            >
              <span className="font-semibold block mb-0.5" style={{ color: "var(--ink)" }}>
                理由
              </span>
              {item.reason}
            </div>
            {item.example && (
            <div
              className="text-xs p-2 rounded-lg"
              style={{
                background: "white",
                border: `1px solid ${cfg.border}`,
                color: "var(--ink-soft)",
              }}
            >
              <span className="font-semibold block mb-0.5" style={{ color: cfg.text }}>
                修正例
              </span>
              {item.example}
            </div>
            )}
          </div>
        </details>
      )}
      {item.status === "OK" && item.example && (
        <p className="text-xs" style={{ color: cfg.text }}>
          ▸ {item.example}
        </p>
      )}
    </div>
  );
}
