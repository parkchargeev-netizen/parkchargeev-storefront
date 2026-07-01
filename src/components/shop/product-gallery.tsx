"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { ProductBadgePill } from "@/components/shop/product-badges";
import type { ProductMediaModel } from "@/lib/mock-data";
import type { ProductBadgePlacement, ProductDetailBadge } from "@/lib/product-detail-content";
import { shouldBypassImageOptimization } from "@/lib/product-media";

type ProductGalleryProps = {
  productName: string;
  items: string[];
  imageUrl?: string;
  mediaItems?: ProductMediaModel[];
  featureLabels?: string[];
  deviceCaption?: string;
  commerceBadges?: ProductDetailBadge[];
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
        unoptimized={shouldBypassImageOptimization(media.url)}
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
      unoptimized={shouldBypassImageOptimization(media.url)}
      priority={false}
      sizes="(min-width: 1024px) 760px, 92vw"
      className="object-contain p-2 sm:p-3"
    />
  );
}

function ProductGalleryBadgeStack({
  badges,
  className,
  placement
}: {
  badges: ProductDetailBadge[];
  className: string;
  placement: ProductBadgePlacement;
}) {
  const placementBadges = badges.filter(
    (badge) => badge.isActive !== false && badge.label && badge.position === placement
  );

  if (placementBadges.length === 0) {
    return null;
  }

  return (
    <div className={`pointer-events-none absolute z-30 flex max-w-[70%] flex-col gap-2 ${className}`}>
      {placementBadges.map((badge) => (
        <ProductBadgePill
          key={`${placement}-${badge.label}-${badge.sortOrder ?? 0}`}
          badge={badge}
          className="pointer-events-auto bg-white/94 backdrop-blur"
        />
      ))}
    </div>
  );
}

export function ProductGallery({
  productName,
  items,
  imageUrl,
  mediaItems,
  featureLabels = ["IP koruma", "Type 2", "Kurulum"],
  deviceCaption = "Ölçekli cihaz temsili",
  commerceBadges = []
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const galleryMedia = useMemo(
    () =>
      mediaItems?.length
        ? mediaItems
        : imageUrl
          ? [{
              url: imageUrl,
              altText: items[0] ?? productName,
              mediaType: "image" as const,
              isPrimary: true
            }]
          : [],
    [imageUrl, items, mediaItems, productName]
  );
  const thumbnailItems: ProductGalleryThumbnail[] = useMemo(
    () => (galleryMedia.length ? galleryMedia : items.map((item) => ({ altText: item }))),
    [galleryMedia, items]
  );
  const galleryItemCount = thumbnailItems.length;
  const activeMedia = galleryMedia[activeIndex];
  const activeItem = activeMedia?.altText ?? items[activeIndex] ?? items[0];
  const hasRealMedia = Boolean(activeMedia);
  const imageIndexes = useMemo(
    () =>
      galleryMedia
        .map((media, index) => (media.mediaType === "image" ? index : null))
        .filter((index): index is number => index !== null),
    [galleryMedia]
  );
  const selectedLightboxMedia =
    galleryMedia[selectedImageIndex]?.mediaType === "image"
      ? galleryMedia[selectedImageIndex]
      : undefined;
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const moveGallery = useCallback(
    (direction: -1 | 1) => {
      if (galleryItemCount <= 1) {
        return;
      }

      setActiveIndex((currentIndex) => (
        currentIndex + direction + galleryItemCount
      ) % galleryItemCount);
    },
    [galleryItemCount]
  );

  const openLightbox = useCallback(
    (index: number) => {
      if (galleryMedia[index]?.mediaType !== "image") {
        return;
      }

      setSelectedImageIndex(index);
      setIsLightboxOpen(true);
    },
    [galleryMedia]
  );

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const moveLightbox = useCallback(
    (direction: -1 | 1) => {
      if (imageIndexes.length <= 1) {
        return;
      }

      const currentImagePosition = imageIndexes.includes(selectedImageIndex)
        ? imageIndexes.indexOf(selectedImageIndex)
        : 0;
      const nextPosition =
        (currentImagePosition + direction + imageIndexes.length) %
        imageIndexes.length;
      const nextIndex = imageIndexes[nextPosition] ?? imageIndexes[0] ?? 0;

      setSelectedImageIndex(nextIndex);
      setActiveIndex(nextIndex);
    },
    [imageIndexes, selectedImageIndex]
  );

  const nextImage = useCallback(() => {
    moveLightbox(1);
  }, [moveLightbox]);

  const prevImage = useCallback(() => {
    moveLightbox(-1);
  }, [moveLightbox]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevImage();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, isLightboxOpen, nextImage, prevImage]);

  const lightbox =
    isMounted && isLightboxOpen && selectedLightboxMedia
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} büyütülmüş ürün görseli`}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Galeriyi kapat"
              className="absolute right-4 top-4 z-20 inline-flex h-12 min-w-12 items-center justify-center rounded-lg border border-white/20 bg-white/14 px-4 text-sm font-bold text-white shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              Kapat
            </button>

            {imageIndexes.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/14 text-3xl font-bold text-white shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:left-6 sm:h-14 sm:w-14"
                  aria-label="Önceki görsel"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/14 text-3xl font-bold text-white shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-6 sm:h-14 sm:w-14"
                  aria-label="Sonraki görsel"
                >
                  ›
                </button>
              </>
            ) : null}

            <div
              className="relative max-h-[85vh] w-[90vw] max-w-[90vw]"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <Image
                src={selectedLightboxMedia.url}
                alt={selectedLightboxMedia.altText || productName}
                width={1600}
                height={1200}
                unoptimized={shouldBypassImageOptimization(selectedLightboxMedia.url)}
                sizes="90vw"
                className="mx-auto block max-h-[85vh] max-w-[90vw] object-contain"
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="product-gallery-premium surface-card grid gap-4 p-3 sm:p-4 lg:grid-cols-[88px_minmax(0,1fr)] lg:p-5">
        <div className="product-gallery-stage-card order-first overflow-hidden rounded-lg bg-white p-3 lg:order-2 lg:p-4">
          <div
            className={`product-gallery-stage relative min-h-[360px] overflow-hidden rounded-lg md:min-h-[500px] ${
              hasRealMedia
                ? "product-gallery-stage--contain grid aspect-[4/3] place-items-center bg-white"
                : "grid aspect-[4/3] px-6 py-7 text-white md:grid-cols-[1fr_0.8fr]"
            }`}
          >
            {activeMedia ? (
              activeMedia.mediaType === "image" ? (
                <button
                  type="button"
                  onClick={() => openLightbox(activeIndex)}
                  className="absolute inset-0 block h-full w-full cursor-zoom-in rounded-lg transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={`${activeMedia.altText || productName} görselini büyüt`}
                >
                  <ProductGalleryStageMedia media={activeMedia} productName={productName} />
                </button>
              ) : (
                <ProductGalleryStageMedia media={activeMedia} productName={productName} />
              )
            ) : null}

            <ProductGalleryBadgeStack
              badges={commerceBadges}
              placement="detail_image_top_left"
              className="left-3 top-3 items-start"
            />
            <ProductGalleryBadgeStack
              badges={commerceBadges}
              placement="detail_image_top_right"
              className="right-3 top-3 items-end"
            />
            <ProductGalleryBadgeStack
              badges={commerceBadges}
              placement="detail_image_bottom_left"
              className="bottom-3 left-3 items-start"
            />
            <ProductGalleryBadgeStack
              badges={commerceBadges}
              placement="detail_image_bottom_right"
              className="bottom-3 right-3 items-end"
            />
            <ProductGalleryBadgeStack
              badges={commerceBadges}
              placement="detail_image_top_center"
              className="left-1/2 top-3 -translate-x-1/2 items-center"
            />
            <ProductGalleryBadgeStack
              badges={commerceBadges}
              placement="detail_image_bottom_center"
              className="bottom-3 left-1/2 -translate-x-1/2 items-center"
            />

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

            {galleryItemCount > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    moveGallery(-1);
                  }}
                  className="product-gallery-stage-nav product-gallery-stage-nav--prev"
                  aria-label="Önceki ürün görseli"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    moveGallery(1);
                  }}
                  className="product-gallery-stage-nav product-gallery-stage-nav--next"
                  aria-label="Sonraki ürün görseli"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="product-gallery-thumbnails order-last flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:max-h-[620px] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pr-1">
          {thumbnailItems.map((item, index) => {
            const hasImage = isProductMediaItem(item) && item.mediaType === "image";

            return (
              <button
                key={`${item.altText}-${index}`}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setActiveIndex(index);
                }}
                aria-label={`${productName} ${index + 1}. görseli seç`}
                className={`product-gallery-thumbnail group w-16 shrink-0 overflow-hidden rounded-lg p-1 transition lg:w-full ${
                  index === activeIndex
                    ? "is-active border-2 border-primary bg-white shadow-[0_16px_36px_rgba(6,51,38,0.12)]"
                    : "border border-outline-variant/30 bg-white hover:border-primary/25"
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-high">
                  {hasImage ? (
                    <Image
                      src={item.url}
                      alt={`${productName} ${item.altText}`}
                      fill
                      unoptimized={shouldBypassImageOptimization(item.url)}
                      sizes="(min-width: 1024px) 120px, 24vw"
                      className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <ProductThumbnailFallback label={item.altText} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {lightbox}
    </>
  );
}
