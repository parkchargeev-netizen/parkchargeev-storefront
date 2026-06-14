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

function ProductThumbnailFallback({ label }: { label: string }) {
  return (
    <div className="product-gallery-thumbnail-visual relative h-full w-full overflow-hidden bg-linear-to-br from-primary/14 via-white to-secondary/24">
      <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-secondary shadow-[0_0_14px_rgba(126,236,201,0.9)]" />
      <span className="absolute left-3 right-8 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-linear-to-r from-secondary/80 via-primary/45 to-transparent" />
      <span className="absolute bottom-6 left-1/2 h-10 w-14 -translate-x-1/2 rounded-t-[28px] bg-primary shadow-[0_14px_28px_rgba(6,51,38,0.18)]" />
      <span className="absolute right-4 top-5 flex h-14 w-10 items-center justify-center rounded-[16px] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-[5px] border-primary">
          <span className="h-2 w-2 rounded-full bg-secondary" />
        </span>
      </span>
      <span className="absolute left-3 top-4 rounded-full bg-white/86 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
        {label === "Video" ? "Play" : "EV"}
      </span>
    </div>
  );
}

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
    <div className="product-gallery-premium surface-card p-5">
      <div className="overflow-hidden rounded-[28px] bg-linear-to-br from-secondary-container/20 via-white to-primary/12 p-6">
        <div className="relative grid aspect-[4/3] min-h-[340px] overflow-hidden rounded-[24px] bg-slate-950 px-6 py-7 text-white md:grid-cols-[1fr_0.8fr]">
          <div className="relative z-10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/76">
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
                  <p className="text-xs font-semibold text-white/82">{label}</p>
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
            <div className="absolute bottom-2 right-2 rounded-2xl bg-white/[0.14] px-3 py-2 text-xs font-semibold text-white/80">
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
            className={`group overflow-hidden rounded-[20px] p-2 text-left transition ${
              index === activeIndex
                ? "border-2 border-primary bg-white shadow-[0_16px_36px_rgba(6,51,38,0.12)]"
                : "border border-outline-variant/30 bg-white hover:border-primary/25"
            }`}
          >
            <div className="relative aspect-square overflow-hidden rounded-[16px] bg-surface-container-high">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${productName} ${item}`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 120px, 24vw"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <ProductThumbnailFallback label={item} />
              )}
              <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/86 px-2 py-1 text-center text-[11px] font-black text-on-surface shadow-[0_8px_18px_rgba(15,23,42,0.12)] backdrop-blur">
                {item}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
