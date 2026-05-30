"use client";

import {
  Construction, Layers, Building2, PaintRoller, DoorOpen,
  ArrowUpDown, Droplets, Wrench, Package, Boxes, Trees, Zap,
  Check, CircleCheckBig, CircleDashed, LoaderCircle, Table,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, Category } from "@/lib/data";
import { useStore, getCatStatus } from "@/lib/store";
import { Pill } from "./pill";
import { ProgressBar } from "./progress-bar";

const ICON_MAP: Record<string, LucideIcon> = {
  Construction, Layers, Building2, PaintRoller, DoorOpen,
  ArrowUpDown, Droplets, Wrench, Package, Boxes, Trees, Zap,
};

function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Package;
}

type CatStatus = ReturnType<typeof getCatStatus>;

function statusMeta(s: CatStatus) {
  if (s.state === "done")     return { tone: "done"     as const, label: "已完成",                     Icon: CircleCheckBig };
  if (s.state === "progress") return { tone: "progress" as const, label: `進行中 ${s.answered}/${s.total}`, Icon: LoaderCircle  };
  return                               { tone: "todo"     as const, label: "未開始",                     Icon: CircleDashed  };
}

interface CategoryPickerProps {
  onOpen: (catId: string) => void;
  onOpenOverall: () => void;
}

export function CategoryPicker({ onOpen, onOpenOverall }: CategoryPickerProps) {
  useStore();

  const statuses = CATEGORIES.map((c) => ({ c, s: getCatStatus(c.id) }));
  const doneCount    = statuses.filter((x) => x.s.state === "done").length;
  const totalItems   = statuses.reduce((a, x) => a + x.s.total, 0);
  const answeredItems = statuses.reduce((a, x) => a + x.s.answered, 0);
  const allDone = doneCount === CATEGORIES.length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="text-overline-sm" style={{ color: "var(--eagle-primary)" }}>
            STEP 1 · 選擇類別
          </div>
          <h1 className="zh text-display-lg" style={{ margin: "6px 0 4px", color: "var(--fg-primary)" }}>
            品管大項
          </h1>
          <p className="zh text-body-sm" style={{ margin: 0, color: "var(--fg-muted)" }}>
            選擇要對照的工程類別，逐項將第二層工程項目對應到會計科目。
          </p>
        </div>
      </div>

      {/* Overall progress card */}
      <div className="overall-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div className="zh text-label" style={{ color: "var(--fg-secondary)", marginBottom: 6 }}>
              整體完成度
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span className="mono-lg-bold" style={{ color: "var(--fg-primary)" }}>{doneCount}</span>
              <span className="mono-sm" style={{ color: "var(--fg-muted)" }}>/ {CATEGORIES.length} 類別完成</span>
              <span className="zh text-meta" style={{ color: "var(--fg-muted)", marginLeft: 4 }}>
                · 項目 {answeredItems}/{totalItems}
              </span>
            </div>
          </div>
          <button
            className="btn-press zh"
            onClick={onOpenOverall}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              background: allDone ? "var(--eagle-primary)" : "var(--bg-raised)",
              color: allDone ? "var(--fg-on-primary)" : "var(--fg-secondary)",
              border: `1px solid ${allDone ? "transparent" : "var(--border-strong)"}`,
              fontFamily: "var(--font-zh)",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 120ms ease, background 120ms ease",
            }}
          >
            <Table size={18} />
            總覽與匯出
          </button>
        </div>
        <ProgressBar
          value={CATEGORIES.length ? doneCount / CATEGORIES.length : 0}
          height={6}
          className="mt-3"
        />
      </div>

      {/* Category grid */}
      <div className="cat-grid">
        {statuses.map(({ c, s }) => {
          const m = statusMeta(s);
          const CatIcon = getCategoryIcon(c.icon);
          return (
            <button
              key={c.id}
              className="cat-card"
              onClick={() => onOpen(c.id)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div className="cat-icon" data-state={s.state}>
                  <CatIcon size={22} />
                </div>
                <Pill tone={m.tone}>
                  {s.state === "done" && <Check size={13} />}
                  {m.label}
                </Pill>
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="mono-xs" style={{ color: "var(--fg-muted)", marginBottom: 3 }}>
                  {c.code}
                </div>
                <div className="zh text-title" style={{ color: "var(--fg-primary)" }}>
                  {c.name}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="zh text-meta" style={{ color: "var(--fg-muted)", whiteSpace: "nowrap" }}>
                  第二層共 {s.total} 項
                </span>
                {s.skipped > 0 && (
                  <span className="zh text-meta" style={{ color: "var(--warning-bold)" }}>
                    略過 {s.skipped}
                  </span>
                )}
              </div>

              {s.state === "progress" && (
                <ProgressBar value={s.answered / s.total} height={4} className="mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
