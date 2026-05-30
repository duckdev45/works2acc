interface ProgressBarProps {
  value: number; // 0..1
  height?: number;
  className?: string;
}

export function ProgressBar({ value, height = 4, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`progress-track ${className ?? ""}`}
      style={{
        height,
        background: "var(--border-subtle)",
      }}
    >
      <div
        className="progress-fill"
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "var(--eagle-primary)",
        }}
      />
    </div>
  );
}
