import { CATEGORIES, ITEMS_BY_CAT } from "./data";
import type { StoreState, ItemResult } from "./store";

export interface MappingRow {
  category_name: string;
  item_doc_no: string;
  item_name: string;
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

    if (!state[cat.id]) {
      state[cat.id] = { index: 0, results: {} };
    }

    const isSkipped = row.skipped === "TRUE" || row.skipped === true;
    const itemId = `${cat.id}-${row.item_doc_no}`;

    state[cat.id].results[itemId] = {
      accountCode: isSkipped ? null : (row.account_code ?? null),
      accountName: isSkipped ? null : (row.account_name ?? null),
      skipped: isSkipped,
      ts: row.mapped_at ? new Date(row.mapped_at).getTime() : Date.now(),
    } satisfies ItemResult;
  }

  // Set index = first unanswered item in each category
  for (const catId of Object.keys(state)) {
    const items = ITEMS_BY_CAT[catId] ?? [];
    const results = state[catId].results;
    const firstUnanswered = items.findIndex((it) => !results[it.id]);
    state[catId].index = firstUnanswered >= 0 ? firstUnanswered : items.length;
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
