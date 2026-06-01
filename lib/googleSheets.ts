import { CATEGORIES, buildFlatItems } from "./data";
import type { StoreState, ItemResult } from "./store";

export interface MappingRow {
  category_name: string;
  item_level: number;
  item_code: string;
  item_name: string;
  parent_name: string | null;
  account_code: string | null;
  account_name: string | null;
  skipped: boolean | string; // GAS writes "TRUE"/"FALSE" strings
  mapped_at?: string;
}

// ── Load ──────────────────────────────────────────────────────────────────
export async function loadFromGoogleSheets(): Promise<StoreState> {
  const res = await fetch("/api/mapping");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { rows } = (await res.json()) as { rows: MappingRow[] };
  if (!rows?.length) return {};

  const state: StoreState = {};

  for (const row of rows) {
    const cat = CATEGORIES.find((c) => c.name === row.category_name);
    if (!cat) continue;

    const flatItems = buildFlatItems(cat.id);
    // prefer stable code match; fall back to name for older sheet data
    const quizItem = flatItems.find((q) => q.code === row.item_code)
      ?? flatItems.find((q) => q.name === row.item_name);
    if (!quizItem) continue;

    if (!state[cat.id]) {
      state[cat.id] = { index: 0, results: {} };
    }

    const isSkipped = row.skipped === "TRUE" || row.skipped === true;

    state[cat.id].results[quizItem.id] = {
      accountCode: isSkipped ? null : (row.account_code ?? null),
      accountName: isSkipped ? null : (row.account_name ?? null),
      skipped: isSkipped,
      ts: row.mapped_at ? new Date(row.mapped_at).getTime() : Date.now(),
    } satisfies ItemResult;
  }

  // Set index = first unanswered item in each category
  for (const catId of Object.keys(state)) {
    const flatItems = buildFlatItems(catId);
    const results = state[catId].results;
    const firstUnanswered = flatItems.findIndex((q) => !results[q.id]);
    state[catId].index = firstUnanswered >= 0 ? firstUnanswered : flatItems.length;
  }

  return state;
}

// ── Save ──────────────────────────────────────────────────────────────────
export async function exportToGoogleSheets(rows: MappingRow[]): Promise<void> {
  const payload = {
    rows: rows.map((r) => ({
      ...r,
      skipped: r.skipped === true || r.skipped === "TRUE",
      mapped_at: new Date().toISOString(),
    })),
  };

  const res = await fetch("/api/mapping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
