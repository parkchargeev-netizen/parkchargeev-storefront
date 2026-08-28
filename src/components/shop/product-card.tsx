import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";

import {
  ProductBadgePill,
  ProductPlacementBadges,
  getBadgesByPlacement
} from "@/components/shop/product-badges";
import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import { getActiveProductDetailBadges } from "@/lib/product-detail-content";
import {
  getDisplayProductImageUrl,
  shouldBypassImageOptimization
} from "@/lib/product-media";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type ProductCardProps = {
  imagePriority?: boolean;
  product: ProductModel;
  layout?: "standard" | "store" | "compact";
};

const productCardLinkClassName =
  "premium-product-card-link group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary-container/55";

function ProductCardLink({
  children,
  product
}: {
  children: ReactNode;
  product: ProductModel;
}) {
  return (
    <Link
      href={`/urun/${product.slug}`}
      aria-label={`${product.name} ürün detayını aç`}
      className={productCardLinkClassName}
      data-motion="reveal"
      prefetch={false}
    >
      {children}
    </Link>
  );
}

function getSecondaryProductImageUrl(product: ProductModel, primaryImageUrl: string | null) {
  const mediaImages =
    product.media
      ?.filter((item) => item.mediaType === "image")
      .map((item) => getDisplayProductImageUrl(item.url))
      .filter((url): url is string => Boolean(url)) ?? [];

  return mediaImages.find((url) => url !== primaryImageUrl) ?? null;
}

const productCardImageSizes = {
  standard: "(max-width: 767px) 50vw, (max-width: 1279px) 30vw, 240px",
  store: "(max-width: 767px) 44vw, (max-width: 1023px) 28vw, 150px"
} as const;

const transparentImageSource =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function ProductSecondaryMedia({
  imageUrl,
  sizes,
  store
}: {
  imageUrl: string;
  sizes: string;
  store?: boolean;
}) {
  const { alt: _alt, sizes: responsiveSizes, src, srcSet, ...imageProps } = getImageProps({
    src: imageUrl,
    alt: "",
    width: store ? 360 : 420,
    height: store ? 360 : 420,
    loading: "lazy",
    sizes,
    unoptimized: shouldBypassImageOptimization(imageUrl)
  }).props;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- Next getImageProps output is attached only after fine-pointer hover. */}
      <img
        {...imageProps}
        src={transparentImageSource}
        alt=""
        aria-hidden
        fetchPriority="low"
        data-product-secondary-src={src}
        data-product-secondary-src-set={srcSet}
        data-product-secondary-sizes={responsiveSizes}
        className="product-card-media-image product-card-media-image--secondary"
      />
    </>
  );
}

function ProductCompareStatus({ productId }: { productId: string }) {
  return (
    <span
      data-compare-product-id={productId}
      hidden
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
    >
      <Check className="h-3 w-3" aria-hidden />
      <span data-compare-label />
    </span>
  );
}

function ProductMedia({
  imagePriority = false,
  imageUrl,
  product,
  secondaryImageUrl,
  store
}: {
  imagePriority?: boolean;
  imageUrl: string | null;
  product: ProductModel;
  secondaryImageUrl?: string | null;
  store?: boolean;
}) {
  const mediaClassName = `product-card-media-image transition-transform duration-300 ${
    store ? "group-hover:scale-[1.015]" : "group-hover:scale-[1.012]"
  }`;

  return (
    <span className={secondaryImageUrl ? "product-card-media-frame product-card-media-frame--has-secondary" : "product-card-media-frame"}>
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={product.name}
            width={store ? 360 : 420}
            height={store ? 360 : 420}
            loading={imagePriority ? undefined : "lazy"}
            priority={imagePriority}
            unoptimized={shouldBypassImageOptimization(imageUrl)}
            sizes={store ? productCardImageSizes.store : productCardImageSizes.standard}
            className={mediaClassName}
          />
          {secondaryImageUrl ? (
            <ProductSecondaryMedia
              imageUrl={secondaryImageUrl}
              sizes={store ? productCardImageSizes.store : productCardImageSizes.standard}
              store={store}
            />
          ) : null}
        </>
      ) : (
        <ProductDevicePreview
          productName={product.name}
          powerLabel={product.powerLabel}
          className={
            store
              ? "product-card-media-preview h-full w-full transition-transform duration-300 group-hover:scale-[1.015]"
              : "product-card-media-preview h-full w-full transition-transform duration-300 group-hover:scale-[1.012]"
          }
        />
      )}
    </span>
  );
}

function ProductFixedBadge({ badge }: { badge?: string }) {
  if (!badge) {
    return null;
  }

  return (
    <StatusBadge tone="success" className="premium-product-card__fixed-badge">
      {badge}
    </StatusBadge>
  );
}

function ProductStatusRow({
  category,
  decisionBadge,
  stockLabel
}: {
  category: string;
  decisionBadge?: string;
  stockLabel: string;
}) {
  const isOutOfStock = stockLabel === "Stokta Yok";

  return (
    <div className="premium-product-card__status-row flex flex-wrap items-center gap-2">
      <StatusBadge tone="primary">{category}</StatusBadge>
      <StatusBadge tone={isOutOfStock ? "danger" : "success"}>
        {stockLabel}
      </StatusBadge>
      {decisionBadge ? <StatusBadge>{decisionBadge}</StatusBadge> : null}
    </div>
  );
}

function ProductCardImageBadges({
  badges
}: {
  badges: ReturnType<typeof getActiveProductDetailBadges>;
}) {
  const placementClassNames = {
    card_image_bottom_left: "bottom-3 left-3 items-start",
    card_image_bottom_right: "bottom-3 right-3 items-end",
    card_image_top_left: "left-3 top-3 items-start",
    card_image_top_right: "right-3 top-3 items-end"
  } as const;

  return (
    <>
      {Object.entries(placementClassNames).map(([placement, className]) => {
        const placementBadges = getBadgesByPlacement(
          badges,
          placement as keyof typeof placementClassNames
        );

        if (placementBadges.length === 0) {
          return null;
        }

        return (
          <div
            key={placement}
            className={`pointer-events-none absolute z-20 flex max-w-[72%] flex-col gap-1.5 ${className}`}
          >
            {placementBadges.map((badge) => (
              <ProductBadgePill
                key={`${badge.position}-${badge.label}-${badge.sortOrder ?? 0}`}
                badge={badge}
                className="bg-white/94 backdrop-blur"
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function ProductSpecs({
  className,
  specs,
  valueClassName
}: {
  className: string;
  specs: ReadonlyArray<readonly [string, string]>;
  valueClassName: string;
}) {
  return (
    <div className={className}>
      {specs.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-white/72 px-2.5 py-2">
          <p className="ds-text-meta font-bold uppercase text-on-surface-variant">
            {label}
          </p>
          <p className={valueClassName} title={value}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProductInspectLabel({
  children,
  compact = false
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <span
      className={
        compact
          ? "premium-product-card__inspect inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-primary-container"
          : "premium-product-card__inspect inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors group-hover:bg-primary-container"
      }
    >
      {children}
      <ArrowUpRight
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </span>
  );
}

export function ProductCard({
  imagePriority = false,
  product,
  layout = "standard"
}: ProductCardProps) {
  const profile = getProductStoreProfile(product);
  const imageUrl = getDisplayProductImageUrl(product.imageUrl) ?? null;
  const secondaryImageUrl = getSecondaryProductImageUrl(product, imageUrl);
  const productBadges = getActiveProductDetailBadges(product);
  const compactSpecs = [
    ["Güç", product.powerLabel || profile.powerTier],
    ["Saha", profile.installationMode],
    ["Soket", profile.connectorHint]
  ] as const;

  const isCompact = layout === "compact";

  if (layout === "store") {
    const storeSpecs = [
      ["Güç", product.powerLabel || profile.powerTier],
      ["Kullanım", profile.primaryFit],
      ["Soket", profile.connectorHint]
    ] as const;

    return (
      <ProductCardLink product={product}>
        <article className="premium-product-card premium-product-card--store surface-card grid h-full gap-4 rounded-lg p-3 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 md:grid-cols-[150px_1fr]">
          <div className="premium-product-card__media relative min-h-36 overflow-hidden rounded-lg bg-surface-container">
            <ProductFixedBadge badge={product.badge} />
            <ProductMedia
              imagePriority={imagePriority}
              imageUrl={imageUrl}
              product={product}
              secondaryImageUrl={secondaryImageUrl}
              store
            />
            <ProductCardImageBadges badges={productBadges} />
            <div className="premium-product-card__compare absolute right-3 top-3 z-10">
              <ProductCompareStatus productId={product.id} />
            </div>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_190px]">
            <div className="min-w-0">
              <ProductStatusRow
                category={product.category}
                decisionBadge={profile.decisionBadge}
                stockLabel={product.stockLabel}
              />

              <ProductPlacementBadges
                badges={productBadges}
                placement="card_title_top"
                className="mt-3"
              />
              <h3 className="ds-card-title mt-3 transition-colors group-hover:text-primary">
                {product.name}
              </h3>
              <ProductPlacementBadges
                badges={productBadges}
                placement="card_title_bottom"
                className="mt-2"
              />
              <p className="ds-text-supporting mt-2 line-clamp-2 text-on-surface-variant">
                {profile.primaryFit}
              </p>

              <ProductPlacementBadges
                badges={productBadges}
                placement="card_features"
                className="mt-3"
              />
              <ProductSpecs
                className="mt-4 grid gap-2 sm:grid-cols-3"
                specs={storeSpecs}
                valueClassName="mt-1 line-clamp-2 text-xs font-bold leading-5 text-on-surface"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge tone="success">Uyum net</StatusBadge>
                <StatusBadge tone="success">Kurulum opsiyonel</StatusBadge>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-lg border border-outline-variant/35 bg-white/76 p-3">
              <div>
                <ProductPlacementBadges
                  badges={productBadges}
                  placement="card_price_top"
                  className="mb-2"
                />
                <p className="ds-text-meta font-bold uppercase text-on-surface-variant">
                  Fiyat
                </p>
                <p className="mt-1 text-xl font-bold leading-none text-primary">
                  {formatPriceTRY(product.priceKurus)}
                </p>
                <p className="ds-text-meta mt-2 font-bold uppercase text-on-surface-variant">
                  {profile.installationHint}
                </p>
                <ProductPlacementBadges
                  badges={productBadges}
                  placement="card_price_bottom"
                  className="mt-2"
                />
              </div>
              <ProductPlacementBadges
                badges={productBadges}
                placement="card_button_top"
              />
              <ProductInspectLabel>Ürünü incele</ProductInspectLabel>
            </div>
          </div>
        </article>
      </ProductCardLink>
    );
  }

  return (
    <ProductCardLink product={product}>
      <article className={`premium-product-card surface-card flex h-full flex-col rounded-lg p-3 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 ${isCompact ? "premium-product-card--compact" : ""}`}>
        <div className="premium-product-card__media relative mb-4 overflow-hidden rounded-lg bg-surface-container">
          <ProductFixedBadge badge={product.badge} />
          <ProductMedia
            imagePriority={imagePriority}
            imageUrl={imageUrl}
            product={product}
            secondaryImageUrl={secondaryImageUrl}
          />
          <ProductCardImageBadges badges={productBadges} />
          <div className="premium-product-card__compare absolute right-3 top-3 z-10">
            <ProductCompareStatus productId={product.id} />
          </div>
        </div>

        <ProductStatusRow
          category={product.category}
          stockLabel={product.stockLabel}
        />

        <ProductPlacementBadges
          badges={productBadges}
          placement="card_title_top"
          className="mt-3"
        />
        <h3 className="ds-card-title mt-3 transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <ProductPlacementBadges
          badges={productBadges}
          placement="card_title_bottom"
          className="mt-2"
        />
        <p className="ds-text-supporting mt-2 line-clamp-2 flex-1 text-on-surface-variant">
          {profile.primaryFit}
        </p>

        <ProductPlacementBadges
          badges={productBadges}
          placement="card_features"
          className="mt-3"
        />
        <ProductSpecs
          className="premium-product-card__specs mt-4 grid grid-cols-3 gap-2"
          specs={compactSpecs}
          valueClassName="mt-1 truncate text-xs font-bold leading-5 text-on-surface"
        />

        <div className="premium-product-card__price-row mt-4 flex items-end justify-between gap-3">
          <div className="premium-product-card__price">
            <ProductPlacementBadges
              badges={productBadges}
              placement="card_price_top"
              className="mb-2"
            />
            <p className="text-2xl font-bold text-primary">
              {formatPriceTRY(product.priceKurus)}
            </p>
            <p className="ds-text-meta mt-1 font-bold uppercase text-on-surface-variant">
              {product.powerLabel}
            </p>
            <ProductPlacementBadges
              badges={productBadges}
              placement="card_price_bottom"
              className="mt-2"
            />
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <ProductPlacementBadges
              badges={productBadges}
              placement="card_button_top"
              className="justify-end"
            />
            <ProductInspectLabel compact>İncele</ProductInspectLabel>
          </div>
        </div>
      </article>
    </ProductCardLink>
  );
}
