import Link from "next/link";

import {
  formatOrderStatusLabel,
  formatPaymentStatusLabel
} from "@/lib/order-status-labels";

type CheckoutResultPanelProps = {
  merchantOid: string;
  initialStatus?: string;
  orderStatus?: {
    orderStatus: string;
    paymentStatus: string;
  } | null;
  isCheckingStatus: boolean;
  error?: string | null;
};

export function CheckoutResultPanel({
  merchantOid,
  initialStatus,
  orderStatus,
  isCheckingStatus,
  error
}: CheckoutResultPanelProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <section className="surface-card p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          Ödeme sonucu
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-on-surface md:text-6xl">
          Sipariş durumunuz kontrol ediliyor
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-on-surface-variant">
          PayTR yönlendirmesi tamamlandı. Kesin sonuç callback ile doğrulandığı için aşağıdaki
          durum kartları esas alınır.
        </p>

        {initialStatus ? (
          <div className="mt-6 rounded-[24px] bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
            Yönlendirme durumu:{" "}
            <span className="font-semibold text-on-surface">{initialStatus}</span>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-surface-container-low p-5">
            <p className="text-sm font-medium text-on-surface-variant">Merchant OID</p>
            <p className="mt-2 break-all text-lg font-semibold text-on-surface">
              {merchantOid}
            </p>
          </div>
          <div className="rounded-[24px] bg-surface-container-low p-5">
            <p className="text-sm font-medium text-on-surface-variant">Sipariş durumu</p>
            <p className="mt-2 text-lg font-semibold text-on-surface">
              {formatOrderStatusLabel(orderStatus?.orderStatus, "Kontrol ediliyor")}
            </p>
          </div>
          <div className="rounded-[24px] bg-surface-container-low p-5">
            <p className="text-sm font-medium text-on-surface-variant">Ödeme durumu</p>
            <p className="mt-2 text-lg font-semibold text-on-surface">
              {formatPaymentStatusLabel(orderStatus?.paymentStatus)}
            </p>
          </div>
        </div>

        {isCheckingStatus ? (
          <p className="mt-5 text-sm font-semibold text-primary">Durum güncelleniyor...</p>
        ) : null}
        {error ? <p className="mt-5 text-sm font-medium text-red-600">{error}</p> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/hesabim"
            className="rounded-2xl bg-primary px-6 py-4 text-center text-base font-semibold text-white"
          >
            Hesabıma git
          </Link>
          <Link
            href="/magaza"
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-6 py-4 text-center text-base font-semibold text-on-surface"
          >
            Mağazaya dön
          </Link>
        </div>
      </section>
    </div>
  );
}
