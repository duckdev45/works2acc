"use client";

import { ArrowLeft, ArrowRight, CircleCheckBig, CircleCheck, CircleDashed, CircleAlert, FilePenLine } from "lucide-react";
import { CATEGORIES, buildFlatItems } from "@/lib/data";
import { useStore, store, getCatStatus } from "@/lib/store";

interface CategorySummaryProps {
  categoryId: string;
  onBackToPicker: () => void;
  onReview: () => void;
  onReviseItem: (index: number) => void;
  onNext: (catId: string) => void;
}

export function CategorySummary({
  categoryId,
  onBackToPicker,
  onReview,
  onReviseItem,
  onNext,
}: CategorySummaryProps) {
  useStore();

  const cat = CATEGORIES.find((c) => c.id === categoryId)!;
  const items = buildFlatItems(categoryId);
  const s = getCatStatus(categoryId);
  const results = store.getCat(categoryId).results || {};
  const skippedItems = items.filter((it) => results[it.id] && results[it.id].skipped);

  const next = CATEGORIES.find(
    (c) => c.id !== categoryId && getCatStatus(c.id).state !== "done"
  );

  return (
    <div className="page narrow">
      {/* Hero */}
      <div className="summary-hero">
        <div className="summary-check">
          <CircleCheckBig size={40} color="var(--eagle-primary)" />
        </div>
        <div className="text-overline-sm" style={{ color: "var(--eagle-primary)", marginTop: 6 }}>
          類別完成
        </div>
        <h1 className="zh text-display-lg" style={{ margin: "6px 0 4px", color: "var(--fg-primary)" }}>
          {cat.name}
        </h1>
        <p className="zh text-body-sm" style={{ margin: 0, color: "var(--fg-muted)" }}>
          已完成本類別 {s.total} 個項目（第二、三層）的科目對照。
        </p>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-block" data-tone="done">
          <CircleCheck size={20} color="var(--success-bold)" />
          <div className="mono-lg-bold" style={{ color: "var(--fg-primary)" }}>{s.confirmed}</div>
          <div className="zh text-meta" style={{ color: "var(--fg-muted)" }}>已確認</div>
        </div>
        <div className="stat-block" data-tone="skip">
          <CircleDashed size={20} color="var(--warning-bold)" />
          <div className="mono-lg-bold" style={{ color: "var(--fg-primary)" }}>{s.skipped}</div>
          <div className="zh text-meta" style={{ color: "var(--fg-muted)" }}>略過</div>
        </div>
      </div>

      {/* Skipped items */}
      {skippedItems.length > 0 && (
        <div className="skip-note">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <CircleAlert size={18} color="var(--warning-bold)" />
            <span className="zh text-label" style={{ color: "var(--warning-bold)" }}>
              有 {skippedItems.length} 項略過，可在後續補填
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skippedItems.map((it) => (
              <button
                key={it.id}
                className="skip-chip"
                onClick={() => onReviseItem(items.indexOf(it))}
              >
                <span className="mono-xs" style={{ color: it.level === 3 ? "var(--info-bold)" : undefined }}>
                  L{it.level}
                </span>
                <span className="zh">
                  {it.level === 3 && it.subcatName ? `${it.subcatName} › ` : ""}
                  {it.name}
                </span>
                <FilePenLine size={13} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        <button
          className="btn-press zh"
          onClick={onBackToPicker}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: 8,
            background: "var(--eagle-primary)",
            color: "var(--fg-on-primary)",
            border: "1px solid transparent",
            fontFamily: "var(--font-zh)",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          返回大項選擇
        </button>

        <button
          className="btn-press zh"
          onClick={onReview}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: 8,
            background: "transparent",
            color: "var(--fg-secondary)",
            border: "1px solid transparent",
            fontFamily: "var(--font-zh)",
            fontSize: 17,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          重新檢視本類別
        </button>

        {next && (
          <button
            className="btn-press zh"
            onClick={() => onNext(next.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              borderRadius: 8,
              background: "var(--bg-raised)",
              color: "var(--fg-secondary)",
              border: "1px solid var(--border-strong)",
              fontFamily: "var(--font-zh)",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            下一大項：{next.name}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
