"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ProductMediaModel } from "@/lib/mock-data";

type ProductGalleryProps = {
  productName: string;
  items: string[];
  imageUrl?: string;
  mediaItems?: ProductMediaModel[];
  featureLabels?: string[];
  deviceCaption?: string;
};

type ProductGalleryThumbnail = ProductMediaModel | { altText: string };

function isProductMediaItem(item: ProductGalleryThumbnail): item is ProductMediaModel {
  return "url" in item && typeof item.url === "string";
}

function getEmbeddableVideoUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const id = parsedUrl.pathname.replace("/", "");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const id = parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (parsedUrl.hostname.includes("vimeo.com")) {
      const id = parsedUrl.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function ProductThumbnailFallback({ label }: { label: string }) {
  return (
    <div className="product-gallery-thumbnail-visual relative h-full w-full overflow-hidden bg-linear-to-br from-primary/14 via-white to-secondary/24">
      <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-secondary shadow-[0_0_14px_rgba(126,236,201,0.9)]" />
      <span className="absolute left-3 right-8 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-linear-to-r from-secondary/80 via-primary/45 to-transparent" />
      <span className="absolute bottom-6 left-1/2 h-10 w-14 -translate-x-1/2 rounded-t-[28px] bg-primary shadow-[0_14px_28px_rgba(6,51,38,0.18)]" />
      <span className="absolute right-4 top-5 flex h-14 w-10 items-center justify-center rounded-lg bg-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-[5px] border-primary">
          <span className="h-2 w-2 rounded-full bg-secondary" />
        </span>
      </span>
      <span className="absolute left-3 top-4 rounded-full bg-white/86 px-2 py-1 text-xs font-bold uppercase tracking-normal text-primary">
        {label === "Video" ? "Play" : "EV"}
      </span>
    </div>
  );
}

function ProductGalleryMedia({
  media,
  productName
}: {
  media?: ProductMediaModel;
  productName: string;
}) {
  if (!media) {
    return (
      <div className="relative h-72 w-48 rounded-lg border border-white/20 bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
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
    );
  }

  if (media.mediaType === "video") {
    const embeddedUrl = getEmbeddableVideoUrl(media.url);

    return (
      <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg border border-white/15 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        {embeddedUrl ? (
          <iframe
            src={embeddedUrl}
            title={media.altText || productName}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={media.url}
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg border border-white/15 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <Image
        src={media.url}
        alt={media.altText || productName}
        fill
        unoptimized
        sizes="(min-width: 1024px) 360px, 90vw"
        className="h-full w-full object-contain p-4"
      />
    </div>
  );
}

function ProductGalleryStageMedia({
  media,
  productName
}: {
  media: ProductMediaModel;
  productName: string;
}) {
  if (media.mediaType === "video") {
    const embeddedUrl = getEmbeddableVideoUrl(media.url);

    if (embeddedUrl) {
      return (
        <iframe
          src={embeddedUrl}
          title={media.altText || productName}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    return (
      <video
        src={media.url}
        className="absolute inset-0 h-full w-full object-contain bg-black"
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <Image
      src={media.url}
      alt={media.altText || productName}
      fill
      unoptimized
      priority={false}
      sizes="(min-width: 1024px) 760px, 92vw"
      className="object-contain p-4"
    />
  );
}

export function ProductGallery({
  productName,
  items,
  imageUrl,
  mediaItems,
  featureLabels = ["IP koruma", "Type 2", "Kurulum"],
  deviceCaption = "Ölçekli cihaz temsili"
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryMedia =
    mediaItems?.length
      ? mediaItems
      : imageUrl
        ? items.map((item, index) => ({
            url: imageUrl,
            altText: item,
            mediaType: "image" as const,
            isPrimary: index === 0
          }))
        : [];
  const thumbnailItems: ProductGalleryThumbnail[] = galleryMedia.length
    ? galleryMedia
    : items.map((item) => ({ altText: item }));
  const activeMedia = galleryMedia[activeIndex];
  const activeItem = activeMedia?.altText ?? items[activeIndex] ?? items[0];
  const hasRealMedia = Boolean(activeMedia);
  const lightboxMedia =
    lightboxIndex !== null && galleryMedia[lightboxIndex]?.mediaType === "image"
      ? galleryMedia[lightboxIndex]
      : undefined;
  const imageIndexes = galleryMedia
    .map((media, index) => (media.mediaType === "image" ? index : null))
    .filter((index): index is number => index !== null);

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex]);

  function moveLightbox(direction: -1 | 1) {
    if (lightboxIndex === null || imageIndexes.length <= 1) {
      return;
    }

    const currentImagePosition = imageIndexes.indexOf(lightboxIndex);
    const nextPosition =
      (currentImagePosition + direction + imageIndexes.length) % imageIndexes.length;
    setLightboxIndex(imageIndexes[nextPosition]);
  }

  return (
    <div className="product-gallery-premium surface-card p-5">
      <div className="overflow-hidden rounded-lg bg-linear-to-br from-secondary-container/20 via-white to-primary/12 p-6">
        <div
          className={`relative min-h-[340px] overflow-hidden rounded-lg ${
            hasRealMedia
              ? "product-gallery-stage--contain grid aspect-[4/3] place-items-center bg-white"
              : "grid aspect-[4/3] px-6 py-7 text-white md:grid-cols-[1fr_0.8fr]"
          }`}
        >
          {activeMedia ? (
            activeMedia.mediaType === "image" ? (
              <button
                type="button"
                onClick={() => setLightboxIndex(activeIndex)}
                className="absolute inset-0 block h-full w-full cursor-zoom-in rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={`${activeMedia.altText || productName} görselini büyüt`}
              >
                <ProductGalleryStageMedia media={activeMedia} productName={productName} />
              </button>
            ) : (
              <ProductGalleryStageMedia media={activeMedia} productName={productName} />
            )
          ) : null}

          {activeMedia ? null : (
            <div className="relative z-10 flex min-h-[286px] flex-1 flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-white/76">
                  {activeItem}
                </p>
                <p className="mt-4 max-w-md text-3xl font-bold tracking-normal">
                  {productName}
                </p>
              </div>
              <div className="grid max-w-md gap-3 sm:grid-cols-3">
                {featureLabels.map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/10 bg-white/8 px-3 py-3"
                  >
                    <p className="text-xs font-semibold text-white/82">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMedia ? null : (
            <div className="relative z-10 mt-8 flex items-center justify-center md:mt-0">
              <ProductGalleryMedia media={activeMedia} productName={productName} />
            </div>
          )}

          {activeMedia ? null : (
            <div className="absolute bottom-6 right-6 z-20 rounded-lg bg-slate-950/45 px-3 py-2 text-xs font-semibold text-white/84 backdrop-blur">
              {deviceCaption}
            </div>
          )}

          {activeMedia ? null : (
            <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-900 to-transparent" />
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {thumbnailItems.map((item, index) => {
          const hasImage = isProductMediaItem(item) && item.mediaType === "image";

          return (
            <button
              key={`${item.altText}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group overflow-hidden rounded-lg p-2 text-left transition ${
                index === activeIndex
                  ? "border-2 border-primary bg-white shadow-[0_16px_36px_rgba(6,51,38,0.12)]"
                  : "border border-outline-variant/30 bg-white hover:border-primary/25"
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-high">
                {hasImage ? (
                  <Image
                    src={item.url}
                    alt={`${productName} ${item.altText}`}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 120px, 24vw"
                    className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <ProductThumbnailFallback label={item.altText} />
                )}
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/86 px-2 py-1 text-center text-xs font-bold text-on-surface shadow-[0_8px_18px_rgba(15,23,42,0.12)] backdrop-blur">
                  {item.altText}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {lightboxMedia ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} büyütülmüş ürün görseli`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/86 p-4 backdrop-blur-md"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Kapat
          </button>

          {imageIndexes.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  moveLightbox(-1);
                }}
                className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-lg border border-white/20 bg-white/10 px-4 py-4 text-2xl font-bold text-white backdrop-blur transition hover:bg-white/20 sm:block"
                aria-label="Önceki görsel"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  moveLightbox(1);
                }}
                className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-lg border border-white/20 bg-white/10 px-4 py-4 text-2xl font-bold text-white backdrop-blur transition hover:bg-white/20 sm:block"
                aria-label="Sonraki görsel"
              >
                ›
              </button>
            </>
          ) : null}

          <div
            className="relative h-[84vh] w-[min(94vw,1180px)] overflow-hidden rounded-lg border border-white/15 bg-white shadow-[0_36px_120px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightboxMedia.url}
              alt={lightboxMedia.altText || productName}
              fill
              unoptimized
              sizes="94vw"
              className="object-contain p-4"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
