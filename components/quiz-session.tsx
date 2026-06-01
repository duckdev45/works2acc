"use client";

import {useState, useEffect} from "react";
import {
    ArrowLeft, ChevronRight, ArrowRight,
    BadgeCheck, CircleDashed, CircleCheck,
} from "lucide-react";
import {CATEGORIES, ACCOUNTS} from "@/lib/data";
import {useQuizSession} from "@/lib/store";
import {AccountPicker} from "./account-picker";
import {Pill} from "./pill";
import {ProgressBar} from "./progress-bar";

interface QuizSessionProps {
    categoryId: string;
    onDone: () => void;
    onExit: () => void;
}

export function QuizSession({categoryId, onDone, onExit}: QuizSessionProps) {
    const cat = CATEGORIES.find((c) => c.id === categoryId)!;
    const session = useQuizSession(categoryId);
    const {items, results, currentIndex} = session;
    const item = items[currentIndex];
    const [sel, setSel] = useState<string | null>(null);

    useEffect(() => {
        const r = item ? results[item.id] : null;
        setSel(r && !r.skipped ? r.accountCode : null);
    }, [currentIndex, categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

    const willComplete = (addedId: string) => {
        const answeredIds = new Set(items.filter((it) => results[it.id]).map((it) => it.id));
        answeredIds.add(addedId);
        return answeredIds.size === items.length;
    };

    const doConfirm = () => {
        if (!sel || !item) return;
        const acc = ACCOUNTS.find((a) => a.code === sel)!;
        const completes = willComplete(item.id);
        session.confirm(acc.code, acc.name);
        if (completes) onDone();
    };

    const doSkip = () => {
        if (!item) return;
        const completes = willComplete(item.id);
        session.skip();
        if (completes) onDone();
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
            if (e.key === "Enter" && !inField) {
                if (sel) { e.preventDefault(); doConfirm(); }
            } else if (e.key === "Tab" && !inField) {
                e.preventDefault();
                doSkip();
            } else if (e.key === "ArrowLeft" && !inField) {
                e.preventDefault();
                session.goTo(currentIndex - 1);
            } else if (e.key === "ArrowRight" && !inField) {
                e.preventDefault();
                session.goTo(currentIndex + 1);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sel, currentIndex, items, results]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!item) return null;

    const selAcc = ACCOUNTS.find((a) => a.code === sel);
    const existing = results[item.id];
    const isL3 = item.level === 3;

    return (
        <div className="page quiz-layout">
            <div className="quiz-main">
                {/* Breadcrumb */}
                <button className="crumb" onClick={onExit}>
                    <ArrowLeft size={16}/>
                    大項選擇
                    <ChevronRight size={14} color="var(--fg-muted)"/>
                    <span className="zh" style={{color: "var(--fg-primary)", fontWeight: 600}}>
                        {cat.name}
                    </span>
                    {isL3 && item.subcatName && (
                        <>
                            <ChevronRight size={14} color="var(--fg-muted)"/>
                            <span className="zh" style={{color: "var(--fg-secondary)"}}>
                                {item.subcatName}
                            </span>
                        </>
                    )}
                </button>

                {/* Progress */}
                <div style={{display: "flex", alignItems: "center", gap: 12, margin: "16px 0 6px"}}>
                    <ProgressBar value={(currentIndex + 1) / items.length} height={4}/>
                    <span className="mono-sm" style={{color: "var(--fg-secondary)", whiteSpace: "nowrap"}}>
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>

                {/* Question card */}
                <div className="quiz-card">
                    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 14}}>
                        <span
                            className="docno"
                            style={isL3 ? {background: "var(--info-dim)", color: "var(--info-bold)"} : undefined}
                        >
                            {currentIndex + 1}
                        </span>
                        <span className="zh text-meta" style={{color: isL3 ? "var(--info-bold)" : "var(--fg-muted)"}}>
                            {isL3
                                ? `第三層 · ${item.subcatName ?? cat.name}`
                                : `${cat.name} · 第二層子分類`}
                        </span>
                        {existing && (
                            <span style={{marginLeft: "auto"}}>
                                {existing.skipped
                                    ? <Pill tone="skip"><CircleDashed size={13}/> 已略過</Pill>
                                    : <Pill tone="done"><CircleCheck size={13}/> 已對照</Pill>}
                            </span>
                        )}
                    </div>

                    <h2 className="zh text-heading" style={{margin: "0 0 22px", color: "var(--fg-primary)"}}>
                        {item.name}
                    </h2>

                    <label
                        className="zh text-label"
                        style={{display: "block", color: "var(--fg-secondary)", marginBottom: 8}}
                    >
                        對應會計科目
                    </label>
                    <AccountPicker value={sel} onChange={setSel}/>

                    {/* Selected badge */}
                    <div style={{marginTop: 14, minHeight: 30}}>
                        {selAcc ? (
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "7px 12px",
                                    background: "var(--primary-dim)",
                                    border: "1px solid var(--primary-mid)",
                                    borderRadius: 10,
                                }}
                            >
                                <BadgeCheck size={16} color="var(--eagle-primary)"/>
                                <span className="mono-sm-bold" style={{color: "var(--eagle-primary)"}}>
                                    {selAcc.code}
                                </span>
                                <span className="zh" style={{fontSize: 15, color: "var(--fg-primary)"}}>
                                    {selAcc.name}
                                </span>
                            </div>
                        ) : (
                            <span className="zh text-meta" style={{color: "var(--fg-muted)"}}>
                                尚未選擇科目，可選擇後確認，或先略過此項。
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{display: "flex", gap: 10, marginTop: 22}}>
                        <button
                            className="btn-press zh"
                            onClick={doSkip}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                padding: "11px 20px", borderRadius: 8,
                                background: "var(--bg-raised)", color: "var(--fg-secondary)",
                                border: "1px solid var(--border-strong)",
                                fontFamily: "var(--font-zh)", fontSize: 17, fontWeight: 600,
                                cursor: "pointer", flexShrink: 0,
                            }}
                        >
                            略過
                        </button>
                        <button
                            className="btn-press zh"
                            onClick={doConfirm}
                            disabled={!sel}
                            style={{
                                flex: 1,
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                                padding: "11px 20px", borderRadius: 8,
                                background: sel ? "var(--eagle-primary)" : "var(--border-subtle)",
                                color: sel ? "var(--fg-on-primary)" : "var(--fg-muted)",
                                border: "1px solid transparent",
                                fontFamily: "var(--font-zh)", fontSize: 17, fontWeight: 700,
                                cursor: sel ? "pointer" : "not-allowed",
                                transition: "background 120ms",
                            }}
                        >
                            確認
                            <ArrowRight size={18}/>
                        </button>
                    </div>

                    <div className="kbd-hints">
                        <span><kbd>Enter</kbd> 確認</span>
                        <span><kbd>Tab</kbd> 略過</span>
                        <span><kbd>← </kbd><kbd> →</kbd> 上 / 下一項瀏覽</span>
                    </div>
                </div>
            </div>

            {/* Right rail */}
            <aside className="quiz-rail">
                <div className="zh text-label" style={{color: "var(--fg-secondary)", padding: "0 4px 10px"}}>
                    本類別項目
                </div>
                <div className="rail-list">
                    {items.map((it, i) => {
                        const r = results[it.id];
                        const active = i === currentIndex;
                        const indent = it.level === 3;
                        return (
                            <button
                                key={it.id}
                                className="rail-item"
                                data-active={active}
                                onClick={() => session.goTo(i)}
                                style={indent ? {paddingLeft: 24} : undefined}
                            >
                                <span
                                    className="mono-xs"
                                    style={{
                                        color: active
                                            ? (indent ? "var(--info-bold)" : "var(--eagle-primary)")
                                            : "var(--fg-muted)",
                                        width: 26,
                                        flexShrink: 0,
                                    }}
                                >
                                    {indent ? "·" : i + 1}
                                </span>
                                <span className="rail-name">{it.name}</span>
                                {r ? (
                                    r.skipped
                                        ? <CircleDashed size={16} color="var(--warning-bold)" style={{flexShrink: 0}}/>
                                        : <CircleCheck size={16} color="var(--success-bold)" style={{flexShrink: 0}}/>
                                ) : (
                                    <span
                                        style={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            background: "var(--border-strong)", flexShrink: 0,
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </aside>
        </div>
    );
}
