"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { loadFromGoogleSheets } from "@/lib/googleSheets";
import { Topbar, type SyncStatus } from "@/components/topbar";
import { CategoryPicker } from "@/components/category-picker";
import { QuizSession } from "@/components/quiz-session";
import { CategorySummary } from "@/components/category-summary";
import { OverallSummary } from "@/components/overall-summary";

type Screen = "picker" | "quiz" | "summary" | "overall";

function App() {
  const [screen, setScreen] = useState<Screen>("picker");
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");

  // Load from Sheets on mount
  useEffect(() => {
    setSyncStatus("syncing");
    loadFromGoogleSheets()
      .then((sheetsState) => {
        store.hydrateFromSheets(sheetsState);
        setSyncStatus("synced");
        // Clear "synced" badge after 2 s
        setTimeout(() => setSyncStatus(null), 2000);
      })
      .catch(() => {
        setSyncStatus("error");
      });
  }, []);

  const openQuiz = (catId: string) => {
    setActiveCatId(catId);
    setScreen("quiz");
  };

  const openSummary = (catId: string) => {
    setActiveCatId(catId);
    setScreen("summary");
  };

  const handleReset = () => {
    if (confirm("確定要重置所有進度嗎？")) {
      store.clearAll();
      setScreen("picker");
      setActiveCatId(null);
    }
  };

  return (
    <>
      <Topbar onReset={handleReset} syncStatus={syncStatus} />

      {screen === "picker" && (
        <CategoryPicker
          onOpen={openQuiz}
          onOpenOverall={() => setScreen("overall")}
        />
      )}

      {screen === "quiz" && activeCatId && (
        <QuizSession
          categoryId={activeCatId}
          onDone={() => openSummary(activeCatId)}
          onExit={() => setScreen("picker")}
        />
      )}

      {screen === "summary" && activeCatId && (
        <CategorySummary
          categoryId={activeCatId}
          onBackToPicker={() => setScreen("picker")}
          onReview={() => setScreen("quiz")}
          onReviseItem={(index) => {
            store.setIndex(activeCatId, index);
            setScreen("quiz");
          }}
          onNext={(catId) => openQuiz(catId)}
        />
      )}

      {screen === "overall" && (
        <OverallSummary
          onBack={() => setScreen("picker")}
          onOpenCat={(catId) => openQuiz(catId)}
        />
      )}
    </>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    store.hydrate(); // localStorage first (instant)
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="zh text-meta" style={{ color: "var(--fg-muted)" }}>
          載入中…
        </span>
      </div>
    );
  }

  return <App />;
}
