"use client";

import { useState } from "react";

type ProductGalleryProps = {
  productName: string;
  items: string[];
};

export function ProductGallery({ productName, items }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div className="surface-card p-5">
      <div className="overflow-hidden rounded-[28px] bg-linear-to-br from-secondary-container/20 via-white to-primary/12 p-8">
        <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-[24px] bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
            {activeItem}
          </p>
          <p className="mt-4 max-w-sm text-3xl font-bold tracking-[-0.05em]">
            {productName}
          </p>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
            Gerçek ürün görselleri bağlandığında bu alan seçilen medya tipine göre güncellenecek.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-[20px] p-3 text-left transition ${
              index === activeIndex
                ? "border-2 border-primary bg-surface-container-low"
                : "border border-outline-variant/30 bg-white hover:border-primary/25"
            }`}
          >
            <div className="flex aspect-square items-center justify-center rounded-[16px] bg-surface-container-high text-center text-xs font-semibold text-on-surface-variant">
              {item}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
