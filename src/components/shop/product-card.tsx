import Image from "next/image";
import Link from "next/link";

import { ProductCompareMarker } from "@/components/shop/product-compare-marker";
import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type ProductCardProps = {
  product: ProductModel;
};

export function ProductCard({ product }: ProductCardProps) {
  const profile = getProductStoreProfile(product);
  const isOutOfStock = product.stockLabel === "Stokta Yok";
  const imageUrl = getDisplayProductImageUrl(product.imageUrl);
  const compactSpecs = [
    ["Güç", profile.powerTier],
    ["Saha", profile.installationMode],
    ["Soket", profile.connectorHint]
  ] as const;

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
