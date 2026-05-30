"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { ACCOUNTS, ACCOUNT_GROUPS } from "@/lib/data";

interface AccountPickerProps {
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function AccountPicker({ value, onChange, disabled }: AccountPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = ACCOUNTS.find((a) => a.code === value);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = ACCOUNTS.filter(
    (a) =>
      !q ||
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.group.includes(q)
  );

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="zh"
        role="combobox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          minHeight: 52,
          padding: "10px 14px",
          background: "var(--bg-raised)",
          color: "var(--fg-primary)",
          border: `1px solid ${open ? "var(--eagle-primary)" : "var(--border-strong)"}`,
          boxShadow: open ? "0 0 0 3px var(--ring-focus)" : "none",
          borderRadius: 10,
          fontFamily: "var(--font-zh)",
          fontSize: 17,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          textAlign: "left",
          transition: "border-color 120ms, box-shadow 120ms",
        }}
      >
        {selected ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span className="mono-sm-bold" style={{ color: "var(--eagle-primary)", flexShrink: 0 }}>
              {selected.code}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected.name}
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--fg-muted)" }}>選擇對應會計科目…</span>
        )}
        <ChevronsUpDown size={18} color="var(--fg-muted)" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            boxShadow: "var(--shadow-overlay)",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div
            style={{
              padding: 8,
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Search size={18} color="var(--fg-muted)" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋科目代號或名稱…"
              className="zh"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "var(--font-zh)",
                fontSize: 16,
                color: "var(--fg-primary)",
              }}
            />
          </div>

          {/* Options */}
          <div style={{ maxHeight: 300, overflowY: "auto", padding: 6 }}>
            {filtered.length === 0 && (
              <div
                className="zh"
                style={{
                  padding: "18px 12px",
                  textAlign: "center",
                  color: "var(--fg-muted)",
                  fontSize: 15,
                }}
              >
                查無相符科目
              </div>
            )}
            {ACCOUNT_GROUPS.map((group) => {
              const groupItems = filtered.filter((a) => a.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} style={{ marginBottom: 4 }}>
                  <div
                    className="text-overline-xs"
                    style={{ padding: "8px 10px 4px", color: "var(--fg-muted)" }}
                  >
                    {group}類
                  </div>
                  {groupItems.map((a) => {
                    const isActive = a.code === value;
                    return (
                      <div
                        key={a.code}
                        className="ap-item"
                        onClick={() => {
                          onChange?.(a.code);
                          setOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: isActive ? "var(--primary-dim)" : "transparent",
                          transition: "background 100ms",
                        }}
                      >
                        <span
                          className="mono-sm-bold"
                          style={{ color: "var(--eagle-primary)", width: 44, flexShrink: 0 }}
                        >
                          {a.code}
                        </span>
                        <span
                          className="zh"
                          style={{ flex: 1, fontSize: 16, color: "var(--fg-primary)" }}
                        >
                          {a.name}
                        </span>
                        <span className="mono-xs" style={{ color: "var(--fg-muted)" }}>
                          {a.group}
                        </span>
                        <Check
                          size={16}
                          color="var(--success-bold)"
                          style={{ opacity: isActive ? 1 : 0, flexShrink: 0 }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
