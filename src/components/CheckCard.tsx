"use client";
import { CriterionItem, CheckStatus } from "@/types";

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
  item: CriterionItem;
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
      <p className="text-sm whitespace-pre-line" style={{ color: "var(--ink-soft)" }}>
        {item.comment}
      </p>
    </div>
  );
}
