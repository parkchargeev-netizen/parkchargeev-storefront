import Link from "next/link";

import type { ProductModel } from "@/lib/mock-data";
import { formatPriceTRY } from "@/lib/format";

type ProductCardProps = {
  product: ProductModel;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="mb-5 rounded-[22px] bg-linear-to-br from-surface-container to-surface-container-high p-5">
        <div className="aspect-[4/3] rounded-[18px] bg-linear-to-br from-primary/12 via-white to-secondary/10" />
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
      </div>

      <h3 className="text-2xl font-bold tracking-[-0.03em] text-on-surface">
        {product.name}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-on-surface-variant">
        {product.summary}
      </p>

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

