import {
  formatOrderStatusLabel,
  formatPaymentStatusLabel
} from "@/lib/order-status-labels";

type CheckoutStatusSummaryProps = {
  merchantOid: string | null;
  orderStatus: {
    orderStatus: string;
    paymentStatus: string;
  } | null;
  isCheckingStatus: boolean;
};

export function CheckoutStatusSummary({
  merchantOid,
  orderStatus,
  isCheckingStatus
}: CheckoutStatusSummaryProps) {
  return (
    <div className="surface-card p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Sipariş durumu
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-on-surface-variant">
            Callback işlendikten sonra sipariş durumu burada güncellenir.
          </p>
        </div>
        {isCheckingStatus ? (
          <span className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
            Durum güncelleniyor
          </span>
        ) : null}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-surface-container-low p-5">
          <p className="text-sm font-medium text-on-surface-variant">Merchant OID</p>
          <p className="mt-2 break-all text-lg font-semibold text-on-surface">
            {merchantOid ?? "Henüz oluşturulmadı"}
          </p>
        </div>
        <div className="rounded-[24px] bg-surface-container-low p-5">
          <p className="text-sm font-medium text-on-surface-variant">Sipariş durumu</p>
          <p className="mt-2 text-lg font-semibold text-on-surface">
            {formatOrderStatusLabel(orderStatus?.orderStatus)}
          </p>
        </div>
        <div className="rounded-[24px] bg-surface-container-low p-5">
          <p className="text-sm font-medium text-on-surface-variant">Ödeme durumu</p>
          <p className="mt-2 text-lg font-semibold text-on-surface">
            {formatPaymentStatusLabel(orderStatus?.paymentStatus)}
          </p>
        </div>
      </div>
    </div>
  );
}
