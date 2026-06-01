"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  productName: string;
  items: string[];
  imageUrl?: string;
  featureLabels?: string[];
  deviceCaption?: string;
};

export function ProductGallery({
  productName,
  items,
  imageUrl,
  featureLabels = ["IP koruma", "Type 2", "Kurulum"],
  deviceCaption = "Ölçekli cihaz temsili"
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div className="surface-card p-5">
      <div className="overflow-hidden rounded-[28px] bg-linear-to-br from-secondary-container/20 via-white to-primary/12 p-6">
        <div className="relative grid aspect-[4/3] min-h-[340px] overflow-hidden rounded-[24px] bg-slate-950 px-6 py-7 text-white md:grid-cols-[1fr_0.8fr]">
          <div className="relative z-10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
                {activeItem}
              </p>
              <p className="mt-4 max-w-md text-3xl font-bold tracking-[-0.05em]">
                {productName}
              </p>
            </div>
            <div className="grid max-w-md gap-3 sm:grid-cols-3">
              {featureLabels.map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/8 px-3 py-3"
                >
                  <p className="text-xs font-semibold text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 flex items-center justify-center md:mt-0">
            {imageUrl ? (
              <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[24px] border border-white/15 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 360px, 90vw"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="relative h-72 w-48 rounded-[34px] border border-white/20 bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[14px] border-primary bg-primary/10">
                  <span className="h-8 w-8 rounded-full bg-secondary" />
                </div>
                <div className="mt-8 space-y-3">
                  <span className="block h-3 rounded-full bg-slate-200" />
                  <span className="block h-3 w-2/3 rounded-full bg-slate-200" />
                  <span className="block h-3 w-1/2 rounded-full bg-slate-200" />
                </div>
                <div className="absolute -right-8 bottom-8 h-24 w-24 rounded-full border-[12px] border-secondary/80 border-l-transparent border-t-transparent" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
              {deviceCaption}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-900 to-transparent" />
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
