import { ReactNode } from "react";

type PillTone = "done" | "progress" | "skip" | "todo" | "neutral";

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
}

const TONE_STYLES: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  done:     { bg: "var(--success-dim)", fg: "var(--success-bold)", bd: "var(--success-mid)" },
  progress: { bg: "var(--info-dim)",    fg: "var(--info-bold)",    bd: "var(--info-mid)" },
  skip:     { bg: "var(--warning-dim)", fg: "var(--warning-bold)", bd: "var(--warning-mid)" },
  todo:     { bg: "var(--bg-sunken)",   fg: "var(--fg-muted)",     bd: "var(--border-subtle)" },
  neutral:  { bg: "var(--bg-sunken)",   fg: "var(--fg-secondary)", bd: "var(--border-subtle)" },
};

export function Pill({ tone = "neutral", children }: PillProps) {
  const t = TONE_STYLES[tone];
  return (
    <span
      className="zh"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        fontFamily: "var(--font-zh)",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
