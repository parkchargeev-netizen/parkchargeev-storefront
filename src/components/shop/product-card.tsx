import Image from "next/image";
import Link from "next/link";

import { ProductCompareMarker } from "@/components/shop/product-compare-marker";
import type { ProductModel } from "@/lib/mock-data";
import { formatPriceTRY } from "@/lib/format";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type ProductCardProps = {
  product: ProductModel;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl ?? `/api/og/product/${product.slug}`;
  const profile = getProductStoreProfile(product);

  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="mb-5 overflow-hidden rounded-[22px] bg-surface-container">
        <Image
          src={imageUrl}
          alt={product.name}
          width={640}
          height={480}
          loading="lazy"
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
          {product.category}
        </span>
        {product.badge ? (
          <span className="rounded-full bg-secondary-container px-2 py-1 text-[11px] font-semibold text-secondary">
            {product.badge}
          </span>
        ) : null}
        <ProductCompareMarker productId={product.id} />
      </div>

      <h3 className="text-2xl font-bold tracking-[-0.03em] text-on-surface">
        {product.name}
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Güç", profile.powerTier],
          ["Uyum", profile.connectorHint],
          ["Kurulum", profile.installationMode]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-surface-container-low px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              {label}
            </p>
            <p className="mt-1 text-xs font-bold leading-5 text-on-surface">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-on-surface-variant">
        {product.summary}
      </p>

      <div className="mt-5 grid gap-2 text-xs font-semibold text-on-surface-variant">
        <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-3 py-2">
          <span>Stok</span>
          <span className={product.stockLabel === "Stokta Yok" ? "text-red-600" : "text-secondary"}>
            {product.stockLabel}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-3 py-2">
          <span>Kargo</span>
          <span className="text-secondary">Ücretsiz</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-3 py-2">
          <span>Seçim</span>
          <span className="text-primary">{profile.decisionBadge}</span>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-black tracking-[-0.04em] text-primary">
            {formatPriceTRY(product.priceKurus)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-on-surface-variant">
            {product.powerLabel}
          </p>
        </div>

        <Link
          href={`/urun/${product.slug}`}
          className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-container"
        >
          İncele
        </Link>
      </div>
    </article>
  );
}
