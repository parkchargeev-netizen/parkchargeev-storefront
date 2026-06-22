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
  } | null;
  isCheckingStatus: boolean;
};

export function CheckoutStatusSummary({
  merchantOid,
  orderStatus,
  isCheckingStatus
}: CheckoutStatusSummaryProps) {
  return (
    <section className="rounded-[30px] border border-white/80 bg-white/84 p-4 shadow-[0_18px_60px_rgba(6,51,38,0.08)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
            Sipariş takibi
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-on-surface">
            PayTR callback sonucu burada görünür.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Tarayıcı yönlendirmesi bilgilendiricidir; kesin ödeme sonucu PayTR callback
            doğrulamasıyla güncellenir.
          </p>
        </div>
        {isCheckingStatus ? (
          <span className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-black text-primary">
            <Activity className="h-4 w-4 animate-pulse" aria-hidden="true" />
            Güncelleniyor
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-[22px] bg-surface-container-low p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Merchant OID
          </p>
          <p className="mt-2 break-all text-sm font-black text-on-surface">
            {merchantOid ?? "Henüz oluşturulmadı"}
          </p>
        </div>
        <div className="rounded-[22px] bg-surface-container-low p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Sipariş durumu
          </p>
          <p className="mt-2 text-sm font-black text-on-surface">
            {formatOrderStatusLabel(orderStatus?.orderStatus)}
          </p>
        </div>
        <div className="rounded-[22px] bg-surface-container-low p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Ödeme durumu
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-black text-on-surface">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            {formatPaymentStatusLabel(orderStatus?.paymentStatus)}
          </p>
        </div>
      </div>
    </section>
  );
}
