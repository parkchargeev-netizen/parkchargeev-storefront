"use client";

import { useEffect } from "react";

import {
  COMPARE_SELECTION_EVENT,
  readStoredCompareProductIds
} from "@/lib/compare-selection";

const markerSelector = "[data-compare-product-id]";

function syncCompareMarkers() {
  const selectedProductIds = new Set(readStoredCompareProductIds());

  document.querySelectorAll<HTMLElement>(markerSelector).forEach((marker) => {
    const productId = marker.dataset.compareProductId;
    const isSelected = Boolean(productId && selectedProductIds.has(productId));
    const label = marker.querySelector<HTMLElement>("[data-compare-label]");

    marker.hidden = !isSelected;
    if (label) {
      label.textContent = isSelected ? "Seçili" : "";
    }
  });
}

export function ProductCompareRuntime() {
  useEffect(() => {
    let animationFrameId = 0;
    const scheduleSync = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(syncCompareMarkers);
    };

    const contentRoot = document.getElementById("main-content");
    const observer = contentRoot
      ? new MutationObserver((mutations) => {
          if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
            scheduleSync();
          }
        })
      : null;

    scheduleSync();
    observer?.observe(contentRoot as Node, { childList: true, subtree: true });
    window.addEventListener("storage", scheduleSync);
    window.addEventListener("focus", scheduleSync);
    window.addEventListener("pageshow", scheduleSync);
    window.addEventListener(COMPARE_SELECTION_EVENT, scheduleSync);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      observer?.disconnect();
      window.removeEventListener("storage", scheduleSync);
      window.removeEventListener("focus", scheduleSync);
      window.removeEventListener("pageshow", scheduleSync);
      window.removeEventListener(COMPARE_SELECTION_EVENT, scheduleSync);
    };
  }, []);

  return null;
}
