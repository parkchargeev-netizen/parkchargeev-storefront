import Image from "next/image";
import Link from "next/link";

import { ProductCompareMarker } from "@/components/shop/product-compare-marker";
import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type ProductCardProps = {
  product: ProductModel;
  layout?: "standard" | "store";
};

export function ProductCard({ product, layout = "standard" }: ProductCardProps) {
  const profile = getProductStoreProfile(product);
  const isOutOfStock = product.stockLabel === "Stokta Yok";
  const imageUrl = getDisplayProductImageUrl(product.imageUrl);
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
      <article className="premium-product-card premium-product-card--store surface-card group grid gap-4 p-3 transition hover:-translate-y-0.5 hover:border-primary/30 md:grid-cols-[180px_1fr]">
        <Link
          href={`/urun/${product.slug}`}
          className="premium-product-card__media relative min-h-44 overflow-hidden rounded-[20px] bg-surface-container"
        >
          <span className="premium-product-card__energy" aria-hidden />
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              width={520}
              height={420}
              loading="lazy"
              unoptimized
              sizes="(min-width: 1024px) 180px, 100vw"
              className="h-full min-h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <ProductDevicePreview
              productName={product.name}
              powerLabel={product.powerLabel}
              className="h-full min-h-44 transition duration-300 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
            {product.badge ? (
              <span className="rounded-full bg-[#7eecc9] px-3 py-1 text-xs font-black text-[#063326]">
                {product.badge}
              </span>
            ) : null}
            <ProductCompareMarker productId={product.id} />
          </div>
        </Link>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_190px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="premium-product-card__category rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase text-primary">
                {product.category}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                  isOutOfStock ? "bg-red-50 text-red-600" : "bg-[#e5fff5] text-[#063326]"
                }`}
              >
                {product.stockLabel}
              </span>
              <span className="rounded-full bg-[#063326] px-3 py-1 text-[11px] font-black text-[#7eecc9]">
                {profile.decisionBadge}
              </span>
            </div>

            <Link href={`/urun/${product.slug}`} className="mt-3 block">
              <h3 className="text-2xl font-black leading-tight text-on-surface transition group-hover:text-primary">
                {product.name}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">
              {product.summary}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {storeSpecs.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/72 px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-black leading-5 text-on-surface" title={value}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold leading-5 text-on-surface-variant">
              {serviceCoverageSummary.shipping}; kurulum ihtiyacı ürün tipine göre keşifle netleşir.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-[22px] border border-outline-variant/35 bg-white/76 p-4">
            <div>
              <p className="text-xs font-black uppercase text-on-surface-variant">Fiyat</p>
              <p className="mt-1 text-3xl font-black leading-none text-primary">
                {formatPriceTRY(product.priceKurus)}
              </p>
              <p className="mt-2 text-xs font-black uppercase text-on-surface-variant">
                {profile.installationHint}
              </p>
            </div>
            <div className="grid gap-2">
              <Link
                href={`/urun/${product.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white transition hover:bg-primary-container"
              >
                Ürünü İncele
              </Link>
              <Link
                href={`/iletisim?reason=${encodeURIComponent(`${product.name} kurulum keşfi`)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-primary/20 bg-white px-4 py-3 text-sm font-black text-primary transition hover:border-primary/45 hover:bg-[#e5fff5]"
              >
                Keşif / Uyum Sor
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="premium-product-card surface-card group flex h-full flex-col p-3 transition hover:-translate-y-0.5 hover:border-primary/30">
      <div className="premium-product-card__media relative mb-4 overflow-hidden rounded-[18px] bg-surface-container">
        <span className="premium-product-card__energy" aria-hidden />
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            width={640}
            height={480}
            loading="lazy"
            unoptimized
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <ProductDevicePreview
            productName={product.name}
            powerLabel={product.powerLabel}
            className="transition duration-300 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {product.badge ? (
            <span className="rounded-full bg-[#7eecc9] px-3 py-1 text-xs font-black text-[#063326]">
              {product.badge}
            </span>
          ) : null}
          <ProductCompareMarker productId={product.id} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="premium-product-card__category text-[11px] font-black uppercase text-secondary">
          {product.category}
        </p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${
            isOutOfStock ? "bg-red-50 text-red-600" : "bg-[#e5fff5] text-[#063326]"
          }`}
        >
          {product.stockLabel}
        </span>
      </div>

      <h3 className="mt-2 text-lg font-black leading-tight text-on-surface">{product.name}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-on-surface-variant">
        {profile.primaryFit}
      </p>

      <div className="premium-product-card__specs mt-4 grid grid-cols-3 gap-1.5">
        {compactSpecs.map(([label, value]) => (
          <div key={label} className="rounded-[14px] bg-white/72 px-2.5 py-2">
            <p className="text-[10px] font-black uppercase text-on-surface-variant">{label}</p>
            <p className="mt-1 truncate text-xs font-black leading-5 text-on-surface" title={value}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-black text-primary">{formatPriceTRY(product.priceKurus)}</p>
          <p className="mt-1 text-[11px] font-black uppercase text-on-surface-variant">
            {product.powerLabel}
          </p>
        </div>
        <span className="rounded-full bg-[#063326] px-3 py-1.5 text-[11px] font-black text-[#7eecc9]">
          {profile.decisionBadge}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/urun/${product.slug}`}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white transition hover:bg-primary-container"
        >
          Ürünü İncele
        </Link>
        <Link
          href={`/iletisim?reason=${encodeURIComponent(`${product.name} kurulum keşfi`)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-primary/20 bg-white px-4 py-3 text-sm font-black text-primary transition hover:border-primary/45 hover:bg-[#e5fff5]"
        >
          Keşif
        </Link>
      </div>
    </article>
  );
}
