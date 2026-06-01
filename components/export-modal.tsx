"use client";

import { useEffect, useState } from "react";
import { CircleCheckBig, CloudUpload, AlertCircle, Loader, X } from "lucide-react";
import { exportToGoogleSheets } from "@/lib/googleSheets";

export interface ExportRow {
  category_name: string;
  item_level: number;
  item_code: string;
  item_name: string;
  parent_name: string | null;
  account_code: string | null;
  account_name: string | null;
  skipped: boolean;
}

interface ExportModalProps {
  rows: ExportRow[];
  onClose: () => void;
}

type Status = "idle" | "sending" | "success" | "error";

export function ExportModal({ rows, onClose }: ExportModalProps) {
  const [tab, setTab] = useState<"json" | "table">("json");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const json = JSON.stringify({ rows }, null, 2);

  // Esc to close (only when not sending)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "sending") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, status]);

  const handleSend = async () => {
    setStatus("sending");
    setErrorMsg("");
    try {
      await exportToGoogleSheets(rows);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "未知錯誤");
      setStatus("error");
    }
  };

  const canClose = status !== "sending";

  // ── Header content by status ────────────────────────────────
  const headerContent = {
    idle: {
      icon: <CloudUpload size={26} color="var(--eagle-primary)" />,
      iconBg: "var(--primary-dim)",
      title: "匯出至 Google 試算表",
      subtitle: `共 ${rows.length} 列 · 透過 Apps Script Web App 寫入`,
    },
    sending: {
      icon: <Loader size={26} color="var(--info-bold)" style={{ animation: "spin 1s linear infinite" }} />,
      iconBg: "var(--info-dim)",
      title: "傳送中…",
      subtitle: `正在寫入 ${rows.length} 列資料`,
    },
    success: {
      icon: <CircleCheckBig size={26} color="var(--eagle-primary)" />,
      iconBg: "var(--success-dim)",
      title: "已寫入 Google 試算表",
      subtitle: `共 ${rows.length} 列 · 寫入完成`,
    },
    error: {
      icon: <AlertCircle size={26} color="var(--danger-bold)" />,
      iconBg: "var(--danger-dim)",
      title: "傳送失敗",
      subtitle: errorMsg || "請稍後再試",
    },
  }[status];

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        className="scrim"
        onMouseDown={canClose ? onClose : undefined}
        style={{ cursor: canClose ? undefined : "not-allowed" }}
      >
        <div className="modal" onMouseDown={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="modal-head">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                className="modal-check"
                style={{ background: headerContent.iconBg, border: "none" }}
              >
                {headerContent.icon}
              </div>
              <div>
                <div className="zh text-title" style={{ color: "var(--fg-primary)" }}>
                  {headerContent.title}
                </div>
                <div
                  className="zh text-meta"
                  style={{ color: status === "error" ? "var(--danger-bold)" : "var(--fg-muted)" }}
                >
                  {headerContent.subtitle}
                </div>
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={onClose}
              disabled={!canClose}
              style={{ opacity: canClose ? 1 : 0.3, cursor: canClose ? "pointer" : "not-allowed" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="seg">
            <button data-active={tab === "json"} onClick={() => setTab("json")}>
              JSON Payload
            </button>
            <button data-active={tab === "table"} onClick={() => setTab("table")}>
              表格預覽
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {tab === "json" ? (
              <pre className="json-pre">{json}</pre>
            ) : (
              <div className="table-wrap" style={{ marginTop: 0 }}>
                <table className="map-table compact">
                  <thead>
                    <tr>
                      <th>category_name</th>
                      <th>level</th>
                      <th>item_code</th>
                      <th>item_name</th>
                      <th>parent_name</th>
                      <th>account_code</th>
                      <th>account_name</th>
                      <th>skipped</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td className="zh">{r.category_name}</td>
                        <td className="mono-xs" style={{ color: r.item_level === 3 ? "var(--info-bold)" : "var(--fg-muted)" }}>
                          L{r.item_level}
                        </td>
                        <td className="mono-xs" style={{ color: "var(--fg-muted)" }}>{r.item_code}</td>
                        <td className="zh">{r.item_name}</td>
                        <td className="zh" style={{ color: "var(--fg-muted)" }}>{r.parent_name || "—"}</td>
                        <td
                          className="mono-xs"
                          style={{ color: r.skipped ? "var(--fg-muted)" : "var(--eagle-primary)" }}
                        >
                          {r.account_code || "—"}
                        </td>
                        <td className="zh">{r.account_name || "—"}</td>
                        <td
                          className="mono-xs"
                          style={{ color: r.skipped ? "var(--warning-bold)" : "var(--fg-muted)" }}
                        >
                          {String(r.skipped)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-foot">
            {status === "idle" && (
              <>
                <button
                  className="btn-press zh"
                  onClick={onClose}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 8,
                    background: "var(--bg-raised)", color: "var(--fg-secondary)",
                    border: "1px solid var(--border-strong)",
                    fontFamily: "var(--font-zh)", fontSize: 16, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  className="btn-press zh"
                  onClick={handleSend}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 8,
                    background: "var(--eagle-primary)", color: "var(--fg-on-primary)",
                    border: "1px solid transparent",
                    fontFamily: "var(--font-zh)", fontSize: 16, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <CloudUpload size={18} />
                  送出
                </button>
              </>
            )}

            {status === "sending" && (
              <span className="zh text-meta" style={{ color: "var(--fg-muted)" }}>
                資料傳送中，請稍候…
              </span>
            )}

            {status === "success" && (
              <>
                <span className="zh text-meta" style={{ color: "var(--fg-muted)" }}>
                  請至 Google 試算表確認寫入結果。
                </span>
                <button
                  className="btn-press zh"
                  onClick={onClose}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 8,
                    background: "var(--eagle-primary)", color: "var(--fg-on-primary)",
                    border: "1px solid transparent",
                    fontFamily: "var(--font-zh)", fontSize: 16, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  完成
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <span className="zh text-meta" style={{ color: "var(--danger-bold)" }}>
                  {errorMsg}
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn-press zh"
                    onClick={onClose}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 8,
                      background: "var(--bg-raised)", color: "var(--fg-secondary)",
                      border: "1px solid var(--border-strong)",
                      fontFamily: "var(--font-zh)", fontSize: 16, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    取消
                  </button>
                  <button
                    className="btn-press zh"
                    onClick={handleSend}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 8,
                      background: "var(--eagle-primary)", color: "var(--fg-on-primary)",
                      border: "1px solid transparent",
                      fontFamily: "var(--font-zh)", fontSize: 16, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    重試
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
