"use client";

import { RotateCcw, CloudOff } from "lucide-react";

export type SyncStatus = "syncing" | "synced" | "error" | null;

interface TopbarProps {
  onReset: () => void;
  syncStatus?: SyncStatus;
}

export function Topbar({ onReset, syncStatus }: TopbarProps) {
  return (
    <header className="topbar">
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-long.svg"
        alt="eagle ai"
        style={{ height: 20, width: "auto", flexShrink: 0 }}
      />

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          className="zh"
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--fg-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          工項/會計科目對照系統
        </span>
      </div>

      {/* Sync status indicator */}
      {syncStatus === "syncing" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--info-bold)",
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          />
          <span className="zh" style={{ fontSize: 13, color: "var(--fg-muted)" }}>
            同步中
          </span>
        </div>
      )}

      {syncStatus === "error" && (
        <div
          title="無法從 Google 試算表載入資料，使用本機快取"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "var(--warning-bold)",
            flexShrink: 0,
            cursor: "default",
          }}
        >
          <CloudOff size={15} />
          <span className="zh" style={{ fontSize: 13 }}>
            離線
          </span>
        </div>
      )}

      {/* Reset */}
      <button
        className="icon-btn"
        onClick={onReset}
        title="重置所有進度"
        style={{ flexShrink: 0 }}
      >
        <RotateCcw size={17} />
      </button>
    </header>
  );
}
