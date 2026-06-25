import { CheckCircle2, LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";

import { formatPriceTRY } from "@/lib/format";
import { serviceCoverageSummary } from "@/lib/service-coverage";

type CheckoutSummaryItem = {
  product: {
    id: string;
    name: string;
  };
  cableOption: string;
  quantity: number;
  lineTotalKurus: number;
};

type CheckoutOrderSummaryProps = {
  items: CheckoutSummaryItem[];
  subtotalKurus: number;
  taxKurus: number;
  totalKurus: number;
};

export function CheckoutOrderSummary({
  items,
  subtotalKurus,
  taxKurus,
  totalKurus
}: CheckoutOrderSummaryProps) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/88 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-primary">
            Güvenli sepet
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
            Sipariş özeti
          </h2>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
          <PackageCheck className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <article
            key={`${item.product.id}-${item.cableOption}`}
            className="grid grid-cols-[44px_1fr] gap-3 rounded-lg border border-outline-variant/28 bg-white p-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {item.quantity}x
            </div>
            <div>
              <p className="line-clamp-2 text-sm font-bold leading-5 text-on-surface">
                {item.product.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                {item.cableOption}
              </p>
              <p className="mt-2 text-sm font-bold text-primary">
                {formatPriceTRY(item.lineTotalKurus)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <dl className="mt-5 space-y-3 rounded-lg bg-surface-container-low p-4 text-sm">
        <div className="flex items-center justify-between gap-4 text-on-surface-variant">
          <dt>Ara toplam</dt>
          <dd className="font-semibold text-on-surface">{formatPriceTRY(subtotalKurus)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-on-surface-variant">
          <dt>Kargo</dt>
          <dd className="text-right font-bold text-secondary">81 il · Ücretsiz</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-on-surface-variant">
          <dt>KDV (%20)</dt>
          <dd className="font-semibold text-on-surface">{formatPriceTRY(taxKurus)}</dd>
        </div>
        <div className="border-t border-outline-variant/35 pt-3">
          <div className="flex items-end justify-between gap-4">
            <dt className="text-base font-bold text-on-surface">Ödenecek tutar</dt>
            <dd className="text-3xl font-bold tracking-normal text-primary">
              {formatPriceTRY(totalKurus)}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 grid gap-2 text-xs leading-5 text-on-surface-variant">
        <p className="inline-flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Tek sayfa güvenli ödeme altyapısı.
        </p>
        <p className="inline-flex items-start gap-2">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Kart bilgileri ParkChargeEV tarafında saklanmaz.
        </p>
        <p className="inline-flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {serviceCoverageSummary.shipping}; kurulum talebi ayrıca planlanır.
        </p>
      </div>
    </section>
  );
}
