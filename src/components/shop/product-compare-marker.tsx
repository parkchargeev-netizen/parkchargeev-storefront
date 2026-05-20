"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import {
  COMPARE_SELECTION_EVENT,
  readStoredCompareProductIds
} from "@/lib/compare-selection";

type ProductCompareMarkerProps = {
  productId: string;
};

export function ProductCompareMarker({ productId }: ProductCompareMarkerProps) {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    function syncSelection() {
      setIsSelected(readStoredCompareProductIds().includes(productId));
    }

    syncSelection();
    window.addEventListener("storage", syncSelection);
    window.addEventListener(COMPARE_SELECTION_EVENT, syncSelection);

    return () => {
      window.removeEventListener("storage", syncSelection);
      window.removeEventListener(COMPARE_SELECTION_EVENT, syncSelection);
    };
  }, [productId]);

  if (!isSelected) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
      <Check className="h-3 w-3" />
      Seçili
    </span>
  );
}
