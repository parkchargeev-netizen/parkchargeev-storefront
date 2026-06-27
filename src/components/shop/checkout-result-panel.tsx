import { ArrowRight, CheckCircle2, Store } from "lucide-react";
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
    statusNote?: string | null;
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
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="rounded-lg border border-white/80 bg-white/88 p-5 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-8 lg:p-10">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-white">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-normal text-primary">
          Ödeme sonucu
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-on-surface sm:text-5xl">
          Sipariş durumunuz güvenli callback ile doğrulanıyor.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-on-surface-variant">
          Ödeme ekranı dönüşü tamamlandı. Kesin sonuç callback doğrulamasıyla işlendiği için
          aşağıdaki durum kartları esas alınır.
        </p>

        {initialStatus ? (
          <div className="mt-6 rounded-lg bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
            Yönlendirme durumu:{" "}
            <span className="font-bold text-on-surface">{initialStatus}</span>
          </div>
        ) : null}

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
              Merchant OID
            </p>
            <p className="mt-2 break-all text-sm font-bold text-on-surface">{merchantOid}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
              Sipariş durumu
            </p>
            <p className="mt-2 text-sm font-bold text-on-surface">
              {formatOrderStatusLabel(orderStatus?.orderStatus, "Kontrol ediliyor")}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
              Ödeme durumu
            </p>
            <p className="mt-2 text-sm font-bold text-on-surface">
              {formatPaymentStatusLabel(orderStatus?.paymentStatus)}
            </p>
          </div>
        </div>

        {isCheckingStatus ? (
          <p className="mt-5 text-sm font-bold text-primary">Durum güncelleniyor...</p>
        ) : null}
        {orderStatus?.statusNote ? (
          <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
            {orderStatus.statusNote}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/hesabim"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-white"
          >
            Hesabıma git
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/magaza"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low px-6 py-4 text-base font-bold text-on-surface"
          >
            <Store className="h-4 w-4" aria-hidden="true" />
            Mağazaya dön
          </Link>
        </div>
      </section>
    </main>
  );
}
