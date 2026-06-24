import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProductCompareMarker } from "@/components/shop/product-compare-marker";
import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type ProductCardProps = {
  product: ProductModel;
  layout?: "standard" | "store";
};

function ProductMedia({
  imageUrl,
  product,
  store
}: {
  imageUrl: string | null;
  product: ProductModel;
  store?: boolean;
}) {
  const mediaClassName = store
    ? "h-full min-h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    : "aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]";

  return (
    <>
      <span
        className="premium-product-card__energy"
        data-motion-loop="energy"
        aria-hidden
      />
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={product.name}
          width={store ? 520 : 640}
          height={store ? 420 : 480}
          loading="lazy"
          unoptimized
          sizes={store ? "(min-width: 1024px) 180px, 100vw" : "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"}
          className={mediaClassName}
        />
      ) : (
        <ProductDevicePreview
          productName={product.name}
          powerLabel={product.powerLabel}
          className={store ? "h-full min-h-44 transition-transform duration-300 group-hover:scale-[1.03]" : "transition-transform duration-300 group-hover:scale-[1.02]"}
        />
      )}
    </>
  );
}

export function ProductCard({ product, layout = "standard" }: ProductCardProps) {
  const profile = getProductStoreProfile(product);
  const isOutOfStock = product.stockLabel === "Stokta Yok";
  const imageUrl = getDisplayProductImageUrl(product.imageUrl) ?? null;
  const productHref = `/urun/${product.slug}`;
  const compactSpecs = [
    ["Güç", profile.powerTier],
    ["Saha", profile.installationMode],
    ["Soket", profile.connectorHint]
  ] as const;

  if (layout === "store") {
    const storeSpecs = [
      ["Güç", product.powerLabel],
      ["Kullanım", profile.primaryFit],
      ["Soket", profile.connectorHint],
      ["Gönderim", "81 il"]
    ] as const;

    return (
      <Link
        href={productHref}
        aria-label={`${product.name} ürün detayını aç`}
        className="premium-product-card-link group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary-container/55"
        data-motion="reveal"
      >
        <article className="premium-product-card premium-product-card--store surface-card grid h-full gap-4 rounded-lg p-3 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 md:grid-cols-[180px_1fr]">
          {product.badge ? (
            <StatusBadge
              tone="success"
              className="premium-product-card__fixed-badge"
            >
              {product.badge}
            </StatusBadge>
          ) : null}
          <div className="premium-product-card__media relative min-h-44 overflow-hidden rounded-lg bg-surface-container">
            <ProductMedia imageUrl={imageUrl} product={product} store />
            <div className="premium-product-card__compare absolute right-3 top-3 z-10">
              <ProductCompareMarker productId={product.id} />
            </div>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_190px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="primary">{product.category}</StatusBadge>
                <StatusBadge tone={isOutOfStock ? "danger" : "success"}>
                  {product.stockLabel}
                </StatusBadge>
                <StatusBadge>{profile.decisionBadge}</StatusBadge>
              </div>

              <h3 className="ds-card-title mt-3 transition-colors group-hover:text-primary">
                {product.name}
              </h3>
              <p className="ds-text-supporting mt-2 line-clamp-2 text-on-surface-variant">
                {profile.primaryFit}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {storeSpecs.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/72 px-3 py-2">
                    <p className="ds-text-meta font-bold uppercase text-on-surface-variant">
                      {label}
                    </p>
                    <p
                      className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-on-surface"
                      title={value}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge tone="success">Uyum net</StatusBadge>
                <StatusBadge tone="success">Kurulum opsiyonel</StatusBadge>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-lg border border-outline-variant/35 bg-white/76 p-4">
              <div>
                <p className="ds-text-meta font-bold uppercase text-on-surface-variant">
                  Fiyat
                </p>
                <p className="mt-1 text-2xl font-bold leading-none text-primary">
                  {formatPriceTRY(product.priceKurus)}
                </p>
                <p className="ds-text-meta mt-2 font-bold uppercase text-on-surface-variant">
                  {profile.installationHint}
                </p>
              </div>
              <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors group-hover:bg-primary-container">
                Ürünü incele
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={productHref}
      aria-label={`${product.name} ürün detayını aç`}
      className="premium-product-card-link group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary-container/55"
      data-motion="reveal"
    >
      <article className="premium-product-card surface-card flex h-full flex-col rounded-lg p-3 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-primary/30">
        {product.badge ? (
          <StatusBadge
            tone="success"
            className="premium-product-card__fixed-badge"
          >
            {product.badge}
          </StatusBadge>
        ) : null}
        <div className="premium-product-card__media relative mb-4 overflow-hidden rounded-lg bg-surface-container">
          <ProductMedia imageUrl={imageUrl} product={product} />
          <div className="premium-product-card__compare absolute right-3 top-3 z-10">
            <ProductCompareMarker productId={product.id} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <StatusBadge tone="primary">{product.category}</StatusBadge>
          <StatusBadge tone={isOutOfStock ? "danger" : "success"}>
            {product.stockLabel}
          </StatusBadge>
        </div>

        <h3 className="ds-card-title mt-3 transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="ds-text-supporting mt-2 line-clamp-2 flex-1 text-on-surface-variant">
          {profile.primaryFit}
        </p>

        <div className="premium-product-card__specs mt-4 grid grid-cols-3 gap-2">
          {compactSpecs.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/72 px-2.5 py-2">
              <p className="ds-text-meta font-bold uppercase text-on-surface-variant">
                {label}
              </p>
              <p className="mt-1 truncate text-xs font-bold leading-5 text-on-surface" title={value}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="premium-product-card__price-row mt-4 flex items-end justify-between gap-3">
          <div className="premium-product-card__price">
            <p className="text-2xl font-bold text-primary">
              {formatPriceTRY(product.priceKurus)}
            </p>
            <p className="ds-text-meta mt-1 font-bold uppercase text-on-surface-variant">
              {product.powerLabel}
            </p>
          </div>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">
            İncele
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </article>
    </Link>
  );
}
