"use client";

import { useSyncExternalStore } from "react";
import { buildFlatItems } from "./data";

const LS_KEY = "fumao_quiz_v2";

export interface ItemResult {
  accountCode: string | null;
  accountName: string | null;
  skipped: boolean;
  ts: number;
}

export interface CatState {
  index: number;
  results: Record<string, ItemResult>;
}

export type StoreState = Record<string, CatState>;

let _state: StoreState = {};
const _listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(_state));
  } catch {}
}

function emit() {
  _listeners.forEach((l) => l());
}

export const store = {
  hydrate() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        _state = JSON.parse(raw);
        emit();
      }
    } catch {}
  },

  getCat(catId: string): CatState {
    return _state[catId] || { index: 0, results: {} };
  },

  confirm(catId: string, itemId: string, code: string, name: string, nextIdx: number) {
    const cat = store.getCat(catId);
    _state = {
      ..._state,
      [catId]: {
        ...cat,
        index: nextIdx,
        results: {
          ...cat.results,
          [itemId]: { accountCode: code, accountName: name, skipped: false, ts: Date.now() },
        },
      },
    };
    persist();
    emit();
  },

  skip(catId: string, itemId: string, nextIdx: number) {
    const cat = store.getCat(catId);
    _state = {
      ..._state,
      [catId]: {
        ...cat,
        index: nextIdx,
        results: {
          ...cat.results,
          [itemId]: { accountCode: null, accountName: null, skipped: true, ts: Date.now() },
        },
      },
    };
    persist();
    emit();
  },

  setIndex(catId: string, index: number) {
    const cat = store.getCat(catId);
    _state = { ..._state, [catId]: { ...cat, index } };
    persist();
    emit();
  },

  /** Merge Sheets state into local state.
   *  - Sheets wins for items not yet in local state.
   *  - Local wins for items touched more recently (higher ts). */
  hydrateFromSheets(sheetsState: StoreState) {
    _state = sheetsState;
    persist();
    emit();
  },

  clearAll() {
    _state = {};
    persist();
    emit();
  },
};

export function useStore(): StoreState {
  return useSyncExternalStore(
    (cb) => {
      _listeners.add(cb);
      return () => _listeners.delete(cb);
    },
    () => _state,
    () => ({} as StoreState)
  );
}

export function useQuizSession(categoryId: string) {
  useStore();
  const items = buildFlatItems(categoryId);
  const cat = store.getCat(categoryId);
  const results = cat.results;
  const currentIndex = Math.min(cat.index || 0, Math.max(items.length - 1, 0));

  const answeredCount = items.filter((it) => results[it.id]).length;
  const confirmedCount = items.filter((it) => results[it.id] && !results[it.id].skipped).length;
  const skippedCount = items.filter((it) => results[it.id] && results[it.id].skipped).length;
  const isComplete = items.length > 0 && answeredCount === items.length;

  const confirm = (code: string, name: string) => {
    const item = items[currentIndex];
    if (!item) return;
    const next = Math.min(currentIndex + 1, items.length);
    store.confirm(categoryId, item.id, code, name, next);
  };

  const skip = () => {
    const item = items[currentIndex];
    if (!item) return;
    const next = Math.min(currentIndex + 1, items.length);
    store.skip(categoryId, item.id, next);
  };

  const goTo = (i: number) =>
    store.setIndex(categoryId, Math.max(0, Math.min(i, items.length - 1)));

  return {
    items,
    results,
    currentIndex,
    confirm,
    skip,
    goTo,
    isComplete,
    answeredCount,
    confirmedCount,
    skippedCount,
  };
}

export function getCatStatus(categoryId: string) {
  const items = buildFlatItems(categoryId);
  const cat = store.getCat(categoryId);
  const results = cat.results || {};
  const answered = items.filter((it) => results[it.id]).length;
  const confirmed = items.filter((it) => results[it.id] && !results[it.id].skipped).length;
  const skipped = items.filter((it) => results[it.id] && results[it.id].skipped).length;
  const total = items.length;
  let state: "todo" | "progress" | "done" = "todo";
  if (answered > 0 && answered < total) state = "progress";
  else if (total > 0 && answered === total) state = "done";
  return { total, answered, confirmed, skipped, state };
}
