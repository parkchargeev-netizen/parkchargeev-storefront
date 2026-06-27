import { Activity, CheckCircle2 } from "lucide-react";

import {
  formatOrderStatusLabel,
  formatPaymentStatusLabel
} from "@/lib/order-status-labels";

type CheckoutStatusSummaryProps = {
  merchantOid: string | null;
  orderStatus: {
    orderStatus: string;
    paymentStatus: string;
    statusNote?: string | null;
  } | null;
  isCheckingStatus: boolean;
};

export function CheckoutStatusSummary({
  merchantOid,
  orderStatus,
  isCheckingStatus
}: CheckoutStatusSummaryProps) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/84 p-4 shadow-[0_18px_60px_rgba(6,51,38,0.08)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-primary">
            Sipariş takibi
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
            Ödeme doğrulama sonucu burada görünür.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Sayfa yönlendirmesi bilgilendiricidir; kesin ödeme sonucu güvenli callback
            doğrulamasıyla güncellenir.
          </p>
        </div>
        {isCheckingStatus ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
            <Activity className="h-4 w-4 animate-pulse" aria-hidden="true" />
            Güncelleniyor
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
            Merchant OID
          </p>
          <p className="mt-2 break-all text-sm font-bold text-on-surface">
            {merchantOid ?? "Henüz oluşturulmadı"}
          </p>
        </div>
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
            Sipariş durumu
          </p>
          <p className="mt-2 text-sm font-bold text-on-surface">
            {formatOrderStatusLabel(orderStatus?.orderStatus)}
          </p>
        </div>
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
            Ödeme durumu
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-on-surface">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            {formatPaymentStatusLabel(orderStatus?.paymentStatus)}
          </p>
        </div>
      </div>

      {orderStatus?.statusNote ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
          {orderStatus.statusNote}
        </p>
      ) : null}
    </section>
  );
}
