"use client";

import { Check } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  COMPARE_SELECTION_EVENT,
  readStoredCompareProductIds
} from "@/lib/compare-selection";

type ProductCompareMarkerProps = {
  productId: string;
};

const emptySelection: string[] = [];
const compareSelectionListeners = new Set<() => void>();
let compareSelectionSnapshot = emptySelection;
let compareSelectionStoreReady = false;

function notifyCompareSelectionListeners() {
  compareSelectionListeners.forEach((listener) => {
    listener();
  });
}

function syncCompareSelectionSnapshot() {
  compareSelectionSnapshot = readStoredCompareProductIds();
  notifyCompareSelectionListeners();
}

function ensureCompareSelectionStore() {
  if (typeof window === "undefined" || compareSelectionStoreReady) {
    return;
  }

  compareSelectionStoreReady = true;
  compareSelectionSnapshot = readStoredCompareProductIds();
  window.addEventListener("storage", syncCompareSelectionSnapshot);
  window.addEventListener("focus", syncCompareSelectionSnapshot);
  window.addEventListener("pageshow", syncCompareSelectionSnapshot);
  window.addEventListener(COMPARE_SELECTION_EVENT, syncCompareSelectionSnapshot);
}

function subscribeCompareSelection(listener: () => void) {
  compareSelectionListeners.add(listener);
  ensureCompareSelectionStore();

  return () => {
    compareSelectionListeners.delete(listener);
  };
}

function getCompareSelectionSnapshot() {
  return compareSelectionSnapshot;
}

function getServerCompareSelectionSnapshot() {
  return emptySelection;
}

export function ProductCompareMarker({ productId }: ProductCompareMarkerProps) {
  const selectedProductIds = useSyncExternalStore(
    subscribeCompareSelection,
    getCompareSelectionSnapshot,
    getServerCompareSelectionSnapshot
  );
  const isSelected = selectedProductIds.includes(productId);

  if (!isSelected) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
      <Check className="h-3 w-3" />
      Seçili
    </span>
  );
}
