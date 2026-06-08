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
    <aside className="surface-card h-fit p-8">
      <h2 className="text-4xl font-black tracking-[-0.07em] text-on-surface">
        Sipariş özeti
      </h2>
      <div className="mt-6 space-y-4 text-base">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.cableOption}`}
            className="rounded-[22px] bg-surface-container-low p-4"
          >
            <p className="font-semibold text-on-surface">{item.product.name}</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              {item.cableOption} · {item.quantity} adet
            </p>
            <p className="mt-3 font-semibold text-primary">
              {formatPriceTRY(item.lineTotalKurus)}
            </p>
          </div>
        ))}
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>Ara toplam</span>
          <span>{formatPriceTRY(subtotalKurus)}</span>
        </div>
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>Kargo tutarı</span>
          <span className="text-right text-sm font-black text-secondary">
            81 il · ₺0
          </span>
        </div>
        <p className="text-xs leading-5 text-on-surface-variant">
          {serviceCoverageSummary.shipping}; kurulum kapsamı ayrı planlanır.
        </p>
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>KDV (%20)</span>
          <span>{formatPriceTRY(taxKurus)}</span>
        </div>
      </div>
      <div className="mt-6 border-t border-outline-variant/35 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-on-surface">Ödenecek tutar</span>
          <span className="text-4xl font-black tracking-[-0.06em] text-primary">
            {formatPriceTRY(totalKurus)}
          </span>
        </div>
      </div>
    </aside>
  );
}
