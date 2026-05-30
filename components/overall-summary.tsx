"use client";

import { useState } from "react";
import { ArrowLeft, CloudUpload } from "lucide-react";
import { CATEGORIES, ITEMS_BY_CAT } from "@/lib/data";
import { useStore, store, getCatStatus } from "@/lib/store";
import { Pill } from "./pill";
import { ExportModal, type ExportRow } from "./export-modal";

function buildExportRows(): ExportRow[] {
  const rows: ExportRow[] = [];
  CATEGORIES.forEach((c) => {
    const items = ITEMS_BY_CAT[c.id] || [];
    const results = store.getCat(c.id).results || {};
    items.forEach((it) => {
      const r = results[it.id];
      if (!r) return;
      rows.push({
        category_name: c.name,
        item_doc_no: it.docNo,
        item_name: it.name,
        account_code: r.skipped ? null : r.accountCode,
        account_name: r.skipped ? null : r.accountName,
        skipped: r.skipped,
      });
    });
  });
  return rows;
}

interface OverallSummaryProps {
  onBack: () => void;
  onOpenCat: (catId: string) => void;
}

export function OverallSummary({ onBack, onOpenCat }: OverallSummaryProps) {
  useStore();
  const [filter, setFilter] = useState<string>("all");
  const [showExport, setShowExport] = useState(false);

  const perCat = CATEGORIES.map((c) => ({ c, s: getCatStatus(c.id) }));
  const totals = perCat.reduce(
    (a, x) => ({
      total: a.total + x.s.total,
      confirmed: a.confirmed + x.s.confirmed,
      skipped: a.skipped + x.s.skipped,
      answered: a.answered + x.s.answered,
    }),
    { total: 0, confirmed: 0, skipped: 0, answered: 0 }
  );
  const doneCats = perCat.filter((x) => x.s.state === "done").length;

  const allRows = buildExportRows();
  const rows =
    filter === "all"
      ? allRows
      : allRows.filter((r) => {
          const c = CATEGORIES.find((x) => x.id === filter);
          return c && r.category_name === c.name;
        });

  return (
    <div className="page">
      {/* Breadcrumb */}
      <button className="crumb" onClick={onBack}>
        <ArrowLeft size={16} />
        大項選擇
      </button>

      {/* Page head */}
      <div className="page-head" style={{ marginTop: 14 }}>
        <div>
          <div className="text-overline-sm" style={{ color: "var(--eagle-primary)" }}>
            總覽 · 對應表
          </div>
          <h1 className="zh text-display-lg" style={{ margin: "6px 0 4px", color: "var(--fg-primary)" }}>
            對照總覽
          </h1>
          <p className="zh text-body-sm" style={{ margin: 0, color: "var(--fg-muted)" }}>
            檢視所有大項的對照結果，確認後可匯出至 Google 試算表。
          </p>
        </div>
        <button
          className="btn-press zh"
          onClick={() => setShowExport(true)}
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
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <CloudUpload size={18} />
          匯出至 Google 試算表
        </button>
      </div>

      {/* Aggregate stats */}
      <div className="agg-row">
        <div className="agg">
          <div className="mono-md-bold" style={{ color: "var(--fg-primary)" }}>
            {doneCats}/{CATEGORIES.length}
          </div>
          <div className="zh text-meta" style={{ color: "var(--fg-muted)" }}>完成類別</div>
        </div>
        <div className="agg">
          <div className="mono-md-bold" style={{ color: "var(--fg-primary)" }}>
            {totals.answered}/{totals.total}
          </div>
          <div className="zh text-meta" style={{ color: "var(--fg-muted)" }}>已對照項目</div>
        </div>
        <div className="agg">
          <div className="mono-md-bold" style={{ color: "var(--success-bold)" }}>
            {totals.confirmed}
          </div>
          <div className="zh text-meta" style={{ color: "var(--fg-muted)" }}>已確認科目</div>
        </div>
        <div className="agg">
          <div className="mono-md-bold" style={{ color: "var(--warning-bold)" }}>
            {totals.skipped}
          </div>
          <div className="zh text-meta" style={{ color: "var(--fg-muted)" }}>略過</div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-row">
        <button
          className="fchip"
          data-active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          全部
        </button>
        {perCat.map(
          ({ c, s }) =>
            s.answered > 0 && (
              <button
                key={c.id}
                className="fchip"
                data-active={filter === c.id}
                onClick={() => setFilter(c.id)}
              >
                {c.name}
              </button>
            )
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="map-table">
          <thead>
            <tr>
              <th style={{ width: "16%" }}>大項</th>
              <th style={{ width: 56 }}>序號</th>
              <th>工程項目</th>
              <th style={{ width: 80 }}>科目代號</th>
              <th style={{ width: "22%" }}>科目名稱</th>
              <th style={{ width: 72 }}>狀態</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="zh"
                  style={{ textAlign: "center", color: "var(--fg-muted)", padding: 28 }}
                >
                  尚無對照資料，請先至大項作答。
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="zh" style={{ color: "var(--fg-secondary)" }}>
                  {r.category_name}
                </td>
                <td className="mono-xs" style={{ color: "var(--fg-muted)" }}>
                  {r.item_doc_no}
                </td>
                <td className="zh" style={{ color: "var(--fg-primary)" }}>
                  {r.item_name}
                </td>
                <td
                  className="mono-sm-bold"
                  style={{ color: r.skipped ? "var(--fg-muted)" : "var(--eagle-primary)" }}
                >
                  {r.account_code || "—"}
                </td>
                <td className="zh" style={{ color: r.skipped ? "var(--fg-muted)" : "var(--fg-primary)" }}>
                  {r.account_name || "—"}
                </td>
                <td>
                  {r.skipped ? (
                    <Pill tone="skip">略過</Pill>
                  ) : (
                    <Pill tone="done">已確認</Pill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showExport && (
        <ExportModal rows={allRows} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
